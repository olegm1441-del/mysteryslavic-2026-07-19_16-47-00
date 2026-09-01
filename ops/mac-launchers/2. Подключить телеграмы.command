#!/bin/bash
# 2. Подключить телеграмы.command
#
# Работает штатными средствами самой системы prodai:
#   ops/canary-telegram.sh                     — живая проверка аккаунтов
#   prodai_control.enroll_telegram_user        — подключение аккаунта
#   ops/import-detached.sh                     — импорт секретов (прежний файл №2)
#
# Ничего своего в обход системы не пишет.
#
# Аккаунты, которые знает система:
#   telegram_user   рабочий  @proday_za_menya
#   telegram_owner  личный   @aelart
#
# Подключение аккаунта требует живого терминала: Telegram спросит код,
# а при двухфакторной защите ещё и пароль. Поэтому идём через ssh -t.
# Код и пароль никуда не сохраняются — Telethon меняет их на строку сессии,
# и в файл ложится только она.

set -u

REMOTE="prodai-vps"
PROJECT="/home/oleg/prodai"
APP="/opt/prodai-control/app"
VPY="/opt/prodai-control/venv/bin/python"
STAMP="$(date +%Y%m%d-%H%M%S)"
LOGFILE="$HOME/Desktop/telegram-$STAMP.txt"

cd "$(dirname "$0")" 2>/dev/null || true
: > "$LOGFILE" 2>/dev/null || LOGFILE=""

say() {
  printf '%s\n' "$*"
  if [ -n "$LOGFILE" ]; then printf '%s\n' "$*" >> "$LOGFILE" 2>/dev/null; fi
  return 0
}
hr() { say "----------------------------------------------------------"; }

pause_exit() {
  say ""
  if [ -n "$LOGFILE" ]; then
    say "Протокол: $LOGFILE"
    say "Секретов в нём нет — можно прислать в чат."
  fi
  say ""
  read -n 1 -s -r -p "Нажмите любую клавишу, чтобы закрыть окно"
  echo
  exit "${1:-0}"
}

ask_yes() {
  local a
  read -r -p "$1 [y/N] " a
  case "$a" in y|Y|yes|Yes|YES|д|Д|да|Да|ДА) return 0 ;; *) return 1 ;; esac
}

# Запуск на сервере с живым терминалом (нужен для sudo и для ввода кода).
#
# Конвейер здесь недопустим. «ssh -t ... | tee» буферизует вывод, потому что
# на том конце труба, а не терминал: запрос кода Telegram завис бы в буфере,
# и на экране висела бы пустота, пока Telethon ждёт ввода.
# BSD-шный script запускает команду в настоящем псевдотерминале и при этом
# пишет копию в файл — так и интерактивность цела, и протокол ведётся.
remote_tty() {
  # Синтаксис «script [файл] команда...» — из BSD, он верен для macOS.
  # На иных системах script разбирает аргументы иначе, поэтому там идём
  # напрямую: протокол этой части потеряем, но интерактивность сохраним.
  if [ -n "$LOGFILE" ] && [ "$(uname -s)" = "Darwin" ] && command -v script >/dev/null 2>&1; then
    script -q -a "$LOGFILE" ssh -t "$REMOTE" "$1"
  else
    ssh -t "$REMOTE" "$1"
  fi
}

hr
say " Телеграмы системы prodai"
say " $(date '+%d.%m.%Y %H:%M:%S')"
hr
say ""

if ! command -v ssh >/dev/null 2>&1; then
  say "Не найдена команда ssh."; pause_exit 1
fi

say "Шаг 1. Проверяю связь с сервером"
if ! ssh -o BatchMode=yes -o ConnectTimeout=20 "$REMOTE" 'echo OK' >/dev/null 2>&1; then
  say "  связи нет."
  say ""
  say "  Подробности:"
  ssh -o BatchMode=yes -o ConnectTimeout=20 "$REMOTE" 'echo OK' 2>&1 | sed 's/^/    /' | tee -a "$LOGFILE" 2>/dev/null
  say ""
  say "  Если ключ не принят — запустите файл «1. ... SSH.command»."
  pause_exit 1
fi
say "  связь есть"
say ""

# ------------------------------------------------------- текущее состояние

say "Шаг 2. Что подключено сейчас"
say "  (сервер спросит пароль sudo — состояние лежит в закрытом каталоге)"
say ""

STATE="$(ssh -t "$REMOTE" 'sudo bash -c '"'"'
for pair in "telegram-user-secret.json|рабочий  @proday_za_menya" "telegram-owner-secret.json|личный   @aelart"; do
  f="/var/lib/prodai-control/${pair%%|*}"
  label="${pair##*|}"
  if [ -f "$f" ]; then
    echo "  ПОДКЛЮЧЁН  $label   подключён $(stat -c %y "$f" | cut -c1-16)"
  else
    echo "  нет        $label   секрет отсутствует"
  fi
done
if [ -f /etc/prodai-control/config.json ]; then
  echo "  управляющий бот: настроен"
else
  echo "  управляющий бот: НЕ настроен"
fi
echo "  сервис prodai-control: $(systemctl is-active prodai-control.service)"
'"'"'' 2>&1 | tr -d '\r' | grep -vE '^\[sudo|^Connection to')"

say "$STATE"
say ""

BOTH_PRESENT=0
[ "$(printf '%s' "$STATE" | grep -c 'ПОДКЛЮЧЁН')" = "2" ] && BOTH_PRESENT=1

if [ "$BOTH_PRESENT" = "1" ]; then
  say "  Оба аккаунта уже подключены. Файлы секретов на месте."
  say "  Это НЕ значит, что связь жива: строка сессии умирает, если"
  say "  завершить сеанс в Telegram (Настройки → Устройства)."
  say "  Пункт 1 ниже проверяет связь по-настоящему."
fi
say ""

hr
say "Шаг 3. Что делаем?"
hr
say ""
say "  1) ПРОВЕРИТЬ связь обоих аккаунтов        <- начните с этого"
say "     Шлёт тестовое сообщение в «Избранное» каждого аккаунта"
say "     и между аккаунтами. Посторонним ничего не уходит."
say ""
say "  2) Переподключить рабочий  @proday_za_menya"
say "  3) Переподключить личный   @aelart"
say "  4) Переподключить оба"
say "     Понадобится api_hash с my.telegram.org, затем код из Telegram."
say ""
say "  5) Импорт секретов из Bitwarden + все проверки"
say "     (это делал прежний файл «2. Обновить токены после смены»)"
say ""
say "  6) Ничего не делать"
say ""
read -r -p "Введите цифру [1-6]: " MODE
say "  выбрано: $MODE"
say ""

# --------------------------------------------------------------- действия

canary() {
  hr
  say "Живая проверка аккаунтов"
  hr
  say ""
  say "Сейчас в оба ваших телеграма придут тестовые сообщения."
  say "Если они пришли — цепочка работает целиком."
  say ""
  remote_tty "sudo bash $PROJECT/ops/canary-telegram.sh"
  say ""
  say "Проверьте телефон: пришли ли сообщения в «Избранное»"
  say "у @proday_za_menya и у @aelart."
  say ""
  say "Если написано «не отправлено» или «ПРОВАЛ» — сессия мертва,"
  say "аккаунт нужно переподключить (пункты 2-4 этого файла)."
}

enroll_one() {
  net="$1"; human="$2"
  hr
  say "Подключение: $human"
  hr
  say ""
  say "Порядок будет такой:"
  say "  1. сервер спросит пароль sudo;"
  say "  2. скрипт попросит api_hash — возьмите на my.telegram.org,"
  say "     раздел API development tools (api_id подставится сам);"
  say "  3. попросит номер телефона — вводите СВОЙ номер этого аккаунта"
  say "     с кодом страны, например +7 и десять цифр;"
  say "  4. Telegram пришлёт код в приложение — введите его;"
  say "  5. если стоит двухфакторная защита — попросит пароль от неё."
  say ""
  say "Код и пароль нигде не сохраняются. В файл ложится только"
  say "строка сессии, и на экран она не выводится."
  say ""
  say "ВАЖНО: входите именно аккаунтом $human, иначе привяжется не тот."
  say ""
  if ! ask_yes "Начинаем?"; then
    say "Пропущено."
    return 1
  fi
  say ""
  remote_tty "sudo env PYTHONPATH=$APP $VPY -u -m prodai_control.enroll_telegram_user --network $net"
  say ""
}

case "$MODE" in
  1)
    canary
    ;;
  2)
    enroll_one telegram_user "рабочий @proday_za_menya"
    ;;
  3)
    enroll_one telegram_owner "личный @aelart"
    ;;
  4)
    enroll_one telegram_user  "рабочий @proday_za_menya"
    say ""
    say "Теперь второй аккаунт."
    say ""
    enroll_one telegram_owner "личный @aelart"
    ;;
  5)
    hr
    say "Импорт секретов из Bitwarden и проверки"
    hr
    say ""
    say "Значения в Bitwarden меняете вы, имена записей не трогаете."
    say "Скрипт на сервере сам обновит код, заберёт секреты,"
    say "прогонит живые проверки и включит сети в политике."
    say ""
    if ! ask_yes "Продолжаем?"; then say "Отменено."; pause_exit 0; fi
    say ""
    remote_tty "sudo bash $PROJECT/ops/import-detached.sh"
    ;;
  6)
    say "Ничего не делаю."
    pause_exit 0
    ;;
  *)
    say "Не понял выбор «$MODE». Ничего не делаю."
    pause_exit 1
    ;;
esac

# ------------------------------------------------- проверка после действия

if [ "$MODE" = "2" ] || [ "$MODE" = "3" ] || [ "$MODE" = "4" ]; then
  say ""
  hr
  say "Проверка результата"
  hr
  say ""
  if ask_yes "Проверить связь сейчас (придут тестовые сообщения)?"; then
    say ""
    canary
  else
    say "Пропущено. Проверить можно позже — пункт 1 этого файла."
  fi
fi

say ""
hr
say "Готово."
hr
pause_exit 0
