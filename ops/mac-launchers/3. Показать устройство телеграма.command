#!/bin/bash
# 3. Показать устройство телеграма.command
#
# ТОЛЬКО ЧТЕНИЕ. Ничего не меняет, ничего не записывает на сервер.
#
# Собирает в один файл на Рабочем столе всё, что нужно, чтобы понять,
# как система prodai ждёт подключения телеграм-аккаунтов: systemd-юниты,
# код prodai-control, спеку, имена переменных окружения.
#
# Всё, что похоже на секрет, заменяется на <СКРЫТО> ещё НА СЕРВЕРЕ —
# то есть значения не покидают сервер вовсе. Итоговый файл безопасно
# пересылать в чат.

set -u

REMOTE="prodai-vps"
STAMP="$(date +%Y%m%d-%H%M%S)"
OUT="$HOME/Desktop/prodai-телеграм-устройство-$STAMP.txt"

echo "=========================================================="
echo " Сбор сведений о телеграм-подсистеме prodai"
echo "=========================================================="
echo
echo "Скрипт только читает. Ничего не меняет и не записывает."
echo

if ! ssh -o BatchMode=yes -o ConnectTimeout=20 "$REMOTE" 'echo OK' >/dev/null 2>&1; then
  echo "Нет связи с сервером $REMOTE."
  echo "Подробности:"
  ssh -o BatchMode=yes -o ConnectTimeout=20 "$REMOTE" 'echo OK' 2>&1 | sed 's/^/  /'
  echo
  read -n 1 -s -r -p "Нажмите любую клавишу"; echo; exit 1
fi

echo "Связь есть. Собираю (займёт несколько секунд)..."
echo

ssh "$REMOTE" 'bash -s' > "$OUT" 2>&1 <<'REMOTE_EOF'
set -u
P=/home/oleg/prodai
C=$P/automation/prodai-control

# Глушим всё, что похоже на секрет, прямо здесь, на сервере.
mask() {
  sed -E \
    -e 's#[0-9]{6,12}:[A-Za-z0-9_-]{30,}#<ТОКЕН-СКРЫТ>#g' \
    -e 's#[0-9a-fA-F]{32,}#<HEX-СКРЫТ>#g' \
    -e 's#(TOKEN|SECRET|PASSWORD|PASSWD|API_KEY|APIKEY|API_HASH|PASS)([A-Za-z0-9_]*)([[:space:]]*[:=][[:space:]]*)[^[:space:]]{6,}#\1\2\3<СКРЫТО>#gI'
}

show() {
  f="$1"; n="${2:-200}"
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
echo "0. ОБЩЕЕ"
echo "=================================================================="
echo "  дата:    $(date '+%d.%m.%Y %H:%M:%S')"
echo "  hostname: $(hostname)"
echo "  система:  $(. /etc/os-release 2>/dev/null && echo "$PRETTY_NAME")"

echo ""
echo "=================================================================="
echo "1. SYSTEMD-ЮНИТЫ (здесь видно, откуда сервисы берут переменные)"
echo "=================================================================="
for u in prodai-control prodai-agent-runner; do
  echo ""
  echo "--- $u.service ---"
  systemctl cat "$u.service" 2>&1 | mask | head -60
  echo "--- состояние ---"
  systemctl is-active "$u.service" 2>&1 | sed 's/^/  активен: /'
  systemctl show "$u.service" -p EnvironmentFiles -p WorkingDirectory -p User 2>/dev/null | sed 's/^/  /'
done

echo ""
echo "=================================================================="
echo "2. ФАЙЛЫ ОКРУЖЕНИЯ (только ИМЕНА переменных, значений здесь нет)"
echo "=================================================================="
for f in $(find "$P" /etc -maxdepth 4 \( -name '.env*' -o -name '*.env' -o -name 'prodai*' \) -type f 2>/dev/null | grep -vE '\.(py|sh|md|json|html)$' | head -20); do
  echo ""
  echo "--- $f  (права $(stat -c '%a %U:%G' "$f" 2>/dev/null)) ---"
  grep -oE '^[[:space:]]*[A-Za-z_][A-Za-z0-9_]*[[:space:]]*=' "$f" 2>/dev/null \
    | tr -d ' =' | sed 's/^/    /' | head -40
done

echo ""
echo "=================================================================="
echo "3. КАТАЛОГ prodai-control"
echo "=================================================================="
find "$C" -maxdepth 3 -type f 2>/dev/null | head -60 | sed 's/^/  /'

show "$C/prodai_control/enroll.py" 300
show "$C/prodai_control/service.py" 250
show "$C/install-prodai-control.sh" 120

echo ""
echo "=================================================================="
echo "4. КОНФИГИ prodai-control"
echo "=================================================================="
for f in $(find "$C" -maxdepth 3 \( -name '*.toml' -o -name '*.yaml' -o -name '*.yml' -o -name '*.ini' -o -name '*.cfg' -o -name 'config*.json' \) -type f 2>/dev/null | head -8); do
  show "$f" 80
done

show "$P/ops/canary_telegram.py" 120
show "$P/ops/canary-telegram.sh" 80
show "$P/ops/import-detached.sh" 150
show "$P/automation/prodai-control/docs/superpowers/specs/2026-08-22-prodai-telegram-control-design.md" 200

echo ""
echo "=================================================================="
echo "5. КАКИЕ ПЕРЕМЕННЫЕ ОКРУЖЕНИЯ ЖДЁТ КОД"
echo "=================================================================="
echo "--- все имена TELEGRAM_* / TG_* в коде ---"
grep -rhoE '\b(TELEGRAM|TG)_[A-Z0-9_]+' "$P" \
  --include=*.py --include=*.sh --include=*.service --include=*.toml \
  --include=*.yaml --include=*.yml --include=*.json --include=*.md \
  2>/dev/null | sort | uniq -c | sort -rn | head -40 | sed 's/^/  /'
echo ""
echo "--- обращения к окружению в коде prodai-control ---"
grep -rhoE '(os\.environ\.get|os\.environ\[|os\.getenv)[^)]{0,60}' "$C" 2>/dev/null \
  | sort -u | head -40 | sed 's/^/  /'
echo ""
echo "--- что вообще упоминает telethon / bot api ---"
grep -rlE 'telethon|api\.telegram\.org|TelegramClient|Bot\(' "$P" \
  --include=*.py --include=*.sh --include=*.txt --include=*.toml 2>/dev/null | head -20 | sed 's/^/  /'

echo ""
echo "=================================================================="
echo "6. PYTHON-ОКРУЖЕНИЕ"
echo "=================================================================="
echo "  python3: $(python3 -V 2>&1)"
for m in telethon pyrogram aiogram telebot requests httpx; do
  python3 -c "import $m,sys;print('  $m: ' + getattr($m,'__version__','есть'))" 2>/dev/null || echo "  $m: нет"
done
echo ""
echo "  --- виртуальные окружения в проекте ---"
find "$P" -maxdepth 4 -name 'pyvenv.cfg' 2>/dev/null | sed 's#/pyvenv.cfg##' | head -10 | sed 's/^/    /'
echo ""
echo "  --- зависимости, объявленные проектом ---"
for f in $(find "$P" -maxdepth 3 \( -name 'requirements*.txt' -o -name 'pyproject.toml' \) 2>/dev/null | head -5); do
  echo "    --- $f ---"
  grep -iE 'telethon|pyrogram|aiogram|telebot|telegram' "$f" 2>/dev/null | sed 's/^/      /' || echo "      (телеграм-зависимостей не объявлено)"
done

echo ""
echo "=================================================================="
echo "КОНЕЦ. Секретов в этом файле нет — они заменены на <СКРЫТО>."
echo "=================================================================="
REMOTE_EOF

RC=$?
echo
if [ -s "$OUT" ]; then
  echo "Готово."
  echo
  echo "  Файл:   $OUT"
  echo "  Размер: $(wc -l < "$OUT") строк"
  echo
  echo "Проверка на утечку секретов:"
  if grep -qE '[0-9]{6,12}:[A-Za-z0-9_-]{30,}' "$OUT"; then
    echo "  ВНИМАНИЕ: что-то похожее на токен всё же попало в файл."
    echo "  Не пересылайте его, скажите мне — поправлю фильтр."
  else
    echo "  чисто, токенов не найдено"
  fi
  echo
  echo "Пришлите этот файл в чат."
  open -R "$OUT" 2>/dev/null
else
  echo "Файл пустой — что-то пошло не так (код $RC)."
fi

echo
read -n 1 -s -r -p "Нажмите любую клавишу, чтобы закрыть окно"
echo
