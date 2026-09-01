#!/bin/bash
# 3. Показать устройство телеграма.command
#
# ТОЛЬКО ЧТЕНИЕ. Ничего не меняет и не записывает на сервер.
#
# Второй заход: смотрим штатный механизм подключения аккаунтов
# (enroll_telegram_user.py, TelegramUserConnector) и текущее состояние —
# что уже подключено, а что нет.
#
# Часть сведений лежит в /etc/prodai-control и /var/lib/prodai-control,
# они закрыты от обычного пользователя, поэтому потребуется sudo.
# Сервер может спросить ваш пароль — это нормально.
#
# Значения секретов НЕ читаются. Из секретных файлов берутся только имена
# полей, чтобы понять их устройство. Всё похожее на секрет глушится
# ещё на сервере, до отправки.

set -u

REMOTE="prodai-vps"
STAMP="$(date +%Y%m%d-%H%M%S)"
OUT="$HOME/Desktop/prodai-телеграм-состояние-$STAMP.txt"

echo "=========================================================="
echo " Состояние телеграм-подключений prodai"
echo "=========================================================="
echo
echo "Скрипт только читает. Значения секретов не извлекаются."
echo "Сервер может запросить пароль sudo — так и должно быть."
echo

if ! ssh -o BatchMode=yes -o ConnectTimeout=20 "$REMOTE" 'echo OK' >/dev/null 2>&1; then
  echo "Нет связи с сервером $REMOTE."
  ssh -o BatchMode=yes -o ConnectTimeout=20 "$REMOTE" 'echo OK' 2>&1 | sed 's/^/  /'
  read -n 1 -s -r -p "Нажмите любую клавишу"; echo; exit 1
fi

REMOTE_SCRIPT=$(cat <<'EOS'
set -u
P=/home/oleg/prodai
C=$P/automation/prodai-control
VPY=/opt/prodai-control/venv/bin/python
APP=/opt/prodai-control/app

mask() {
  sed -E \
    -e 's#[0-9]{6,12}:[A-Za-z0-9_-]{30,}#<ТОКЕН-СКРЫТ>#g' \
    -e 's#[0-9a-fA-F]{32,}#<HEX-СКРЫТ>#g' \
    -e 's#(TOKEN|SECRET|PASSWORD|PASSWD|API_KEY|APIKEY|API_HASH|PASS)([A-Za-z0-9_]*)([[:space:]]*[:=][[:space:]]*)[^[:space:]]{6,}#\1\2\3<СКРЫТО>#gI' \
    -e 's#"(session|session_string|string_session|auth_key|dc_id_auth)"([[:space:]]*:[[:space:]]*)"[^"]{16,}"#"\1"\2"<СКРЫТО>"#gI'
}

show() {
  f="$1"; n="${2:-250}"
  echo ""
  echo "=================================================================="
  echo "ФАЙЛ: $f"
  echo "=================================================================="
  if [ ! -f "$f" ]; then echo "  (нет такого файла)"; return 0; fi
  t=$(wc -l < "$f" 2>/dev/null || echo 0)
  echo "  строк всего: $t"
  echo "------------------------------------------------------------------"
  head -n "$n" "$f" | mask
  if [ "$t" -gt "$n" ]; then echo "..."; echo "[показаны первые $n строк из $t]"; fi
}

echo "=================================================================="
echo "A. ЧТО УЖЕ ПОДКЛЮЧЕНО (главное)"
echo "=================================================================="
echo ""
echo "--- секретные файлы аккаунтов (значения НЕ читаются) ---"
for f in /var/lib/prodai-control/telegram-user-secret.json \
         /var/lib/prodai-control/telegram-owner-secret.json; do
  if [ -f "$f" ]; then
    echo "  ЕСТЬ: $f"
    echo "        размер $(stat -c '%s байт, права %a, %U:%G' "$f")"
    echo "        поля внутри:"
    "$VPY" -c "
import json,sys
d=json.load(open('$f'))
for k in sorted(d) if isinstance(d,dict) else []:
    v=d[k]
    kind=type(v).__name__
    filled='заполнено' if v not in (None,'',[],{}) else 'ПУСТО'
    print('          %-24s %-6s %s' % (k, kind, filled))
" 2>/dev/null || echo "          (не удалось разобрать)"
  else
    echo "  НЕТ:  $f  — аккаунт не подключён"
  fi
done

echo ""
echo "--- конфиг control-plane (только имена и признак заполненности) ---"
CFG=/etc/prodai-control/config.json
if [ -f "$CFG" ]; then
  echo "  $CFG  (права $(stat -c '%a %U:%G' "$CFG"))"
  "$VPY" -c "
import json
d=json.load(open('$CFG'))
for k in sorted(d):
    v=d[k]
    if isinstance(v,int): print('    %-24s = %s' % (k,v))
    else: print('    %-24s %s' % (k, 'задан' if v else 'ПУСТО'))
" 2>/dev/null || echo "    (не удалось разобрать)"
else
  echo "  $CFG — НЕТ. Control-plane ещё не проходил enrollment."
fi

echo ""
echo "--- машинный токен Bitwarden ---"
T=/etc/prodai-control/bws-access-token
if [ -f "$T" ]; then
  echo "  ЕСТЬ: $T (права $(stat -c '%a %U:%G' "$T"), $(stat -c %s "$T") байт) — содержимое не читаю"
else
  echo "  НЕТ:  $T"
fi
echo ""
echo "--- bws (Bitwarden Secrets Manager) ---"
if [ -x /usr/local/bin/bws ]; then echo "  $(/usr/local/bin/bws --version 2>&1 | head -1)"; else echo "  /usr/local/bin/bws не установлен"; fi

echo ""
echo "--- venv, в котором реально работает сервис ---"
if [ -x "$VPY" ]; then
  echo "  $($VPY -V 2>&1)"
  for m in telethon requests; do
    "$VPY" -c "import $m;print('  $m: ' + getattr($m,'__version__','есть'))" 2>/dev/null || echo "  $m: НЕТ"
  done
else
  echo "  venv не найден: $VPY"
fi

echo ""
echo "--- состояние сервисов ---"
for u in prodai-control prodai-agent-runner; do
  echo "  $u: $(systemctl is-active $u.service 2>&1) / $(systemctl is-enabled $u.service 2>&1)"
done
echo ""
echo "--- последние записи журнала prodai-control ---"
journalctl -u prodai-control.service -n 30 --no-pager 2>&1 | mask | sed 's/^/  /'

echo ""
echo "=================================================================="
echo "B. ШТАТНЫЙ МЕХАНИЗМ ПОДКЛЮЧЕНИЯ АККАУНТА"
echo "=================================================================="

show "$C/prodai_control/enroll_telegram_user.py" 300

echo ""
echo "--- подсказка по запуску (--help) ---"
if [ -x "$VPY" ]; then
  PYTHONPATH=$APP "$VPY" -m prodai_control.enroll_telegram_user --help 2>&1 | mask | sed 's/^/  /'
fi

echo ""
echo "=================================================================="
echo "C. КАК УСТРОЕН КОННЕКТОР"
echo "=================================================================="
if [ -f "$C/prodai_control/connectors.py" ]; then
  echo "  всего строк в connectors.py: $(wc -l < "$C/prodai_control/connectors.py")"
  echo "  --- классы и функции ---"
  grep -nE '^(class |def |    def )' "$C/prodai_control/connectors.py" | head -60 | sed 's/^/    /'
  echo ""
  echo "  --- TelegramUserConnector целиком ---"
  awk '/class TelegramUserConnector/,/^class [A-Za-z_]+[^U]/' "$C/prodai_control/connectors.py" \
    | head -180 | mask | sed 's/^/    /'
fi
echo ""
echo "  --- read_secret_file из social.py ---"
if [ -f "$C/prodai_control/social.py" ]; then
  awk '/def read_secret_file/,/^def |^class /' "$C/prodai_control/social.py" | head -40 | mask | sed 's/^/    /'
fi

echo ""
echo "=================================================================="
echo "D. РЕЖИМЫ УСТАНОВЩИКА (хвост install-prodai-control.sh)"
echo "=================================================================="
if [ -f "$C/install-prodai-control.sh" ]; then
  sed -n '120,168p' "$C/install-prodai-control.sh" | mask | sed 's/^/  /'
fi

echo ""
echo "=================================================================="
echo "E. ЧЕМ ЗАБИРАЮТСЯ СЕКРЕТЫ ИЗ BITWARDEN"
echo "=================================================================="
show "$P/ops/import-from-bitwarden.sh" 80
echo ""
echo "--- какие ключи секретов упоминаются в проекте ---"
grep -rhoE 'PRODAI_[A-Z0-9_]+' "$P" --include=*.py --include=*.sh --include=*.md --include=*.json 2>/dev/null \
  | sort | uniq -c | sort -rn | head -25 | sed 's/^/  /'

echo ""
echo "=================================================================="
echo "КОНЕЦ. Значения секретов не извлекались."
echo "=================================================================="
EOS
)

echo "Передаю сборщик на сервер..."
printf '%s' "$REMOTE_SCRIPT" | ssh "$REMOTE" 'umask 077; cat > "$HOME/.prodai-probe.sh"' || {
  echo "Не удалось передать скрипт."; read -n 1 -s -r -p "Нажмите любую клавишу"; exit 1; }

echo "Собираю (сервер может спросить пароль sudo)..."
echo
ssh -t "$REMOTE" 'sudo bash "$HOME/.prodai-probe.sh"; rm -f "$HOME/.prodai-probe.sh"' 2>&1 \
  | tr -d '\r' > "$OUT"

echo
if [ -s "$OUT" ]; then
  echo "Готово."
  echo "  Файл:   $OUT"
  echo "  Размер: $(wc -l < "$OUT") строк"
  echo
  echo "Проверка на утечку секретов:"
  BAD=0
  grep -qE '[0-9]{6,12}:[A-Za-z0-9_-]{30,}' "$OUT" && { echo "  ВНИМАНИЕ: похоже на токен бота"; BAD=1; }
  grep -qiE '"(session|auth_key|api_hash)"[[:space:]]*:[[:space:]]*"[^"]{16,}"' "$OUT" && { echo "  ВНИМАНИЕ: похоже на сессию"; BAD=1; }
  [ "$BAD" = "0" ] && echo "  чисто"
  echo
  echo "Пришлите этот файл в чат."
  open -R "$OUT" 2>/dev/null
else
  echo "Файл пустой — сбор не удался."
fi
echo
read -n 1 -s -r -p "Нажмите любую клавишу, чтобы закрыть окно"
echo
