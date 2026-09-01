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
# Связь рвалась ровно в те минуты, когда скрипт ждал ввода: пока человек ищет
# api_hash, по каналу не идёт ни байта, и он отваливается. Клиент теперь сам
# шлёт признак жизни каждые 20 секунд и терпит до двух минут молчания.
SSHOPTS="-o ServerAliveInterval=20 -o ServerAliveCountMax=6 -o TCPKeepAlive=yes"
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

# Удалённая программа может оставить терминал в странном состоянии: включённым
# режимом мыши (тогда листание пропадает, а на экран сыплется M64;20;12),
# выключенным эхом, режимом вставки. Гасим это принудительно.
restore_terminal() {
  printf '\033[?1000l\033[?1002l\033[?1003l\033[?1006l\033[?1015l\033[?2004l' 2>/dev/null
  stty sane 2>/dev/null
  return 0
}

# Сервер печатает api_hash открытым текстом — так устроен его скрипт, — а
# script(1) пишет сеанс целиком. Значит, протокол может содержать секрет, и
# обещать обратное нельзя: вычищаем его перед тем, как называть безопасным.
scrub_log() {
  [ -n "$LOGFILE" ] || return 0
  [ -f "$LOGFILE" ] || return 0
  tmp="$LOGFILE.tmp.$$"
  if LC_ALL=C sed -E \
       -e 's/[0-9a-fA-F]{32,}/<СКРЫТО>/g' \
       -e 's/[0-9]{6,12}:[A-Za-z0-9_-]{30,}/<СКРЫТО>/g' \
       "$LOGFILE" > "$tmp" 2>/dev/null; then
    mv "$tmp" "$LOGFILE"
  fi
  rm -f "$tmp" 2>/dev/null
  return 0
}

pause_exit() {
  restore_terminal
  scrub_log
  say ""
  if [ -n "$LOGFILE" ]; then
    say "Протокол: $LOGFILE"
    say "api_hash в нём заглушён — прислать в чат можно."
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
    script -q -a "$LOGFILE" ssh $SSHOPTS -t "$REMOTE" "$1"
  else
    ssh $SSHOPTS -t "$REMOTE" "$1"
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
if ! ssh $SSHOPTS -o BatchMode=yes -o ConnectTimeout=20 "$REMOTE" 'echo OK' >/dev/null 2>&1; then
  say "  связи нет."
  say ""
  say "  Подробности:"
  ssh $SSHOPTS -o BatchMode=yes -o ConnectTimeout=20 "$REMOTE" 'echo OK' 2>&1 | sed 's/^/    /' | tee -a "$LOGFILE" 2>/dev/null
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

STATE="$(ssh $SSHOPTS -t "$REMOTE" 'sudo bash -c '"'"'
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
  restore_terminal
  say ""
  say "Проверьте телефон: пришли ли сообщения в «Избранное»"
  say "у @proday_za_menya и у @aelart."
  say ""
  say "Как читать результат:"
  say "  «ок» у обеих строк           — связь жива, делать ничего не нужно;"
  say "  «Please enter your phone»    — сессия мертва: Telegram не принял"
  say "                                 сохранённый вход, и Telethon полез"
  say "                                 спрашивать номер заново;"
  say "  «EOFError»                   — следствие предыдущего: клавиатуры"
  say "                                 у проверки нет, отвечать некому."
  say ""
  say "В двух последних случаях аккаунт нужно переподключить — пункт 4."
}

enroll_one() {
  net="$1"; human="$2"
  hr
  say "Подключение: $human"
  hr
  say ""
  say "СНАЧАЛА ПРИГОТОВЬТЕ ВСЁ, не запуская вход:"
  say ""
  say "  1. Откройте https://my.telegram.org и войдите номером ИМЕННО"
  say "     этого аккаунта. Раздел API development tools — там api_hash."
  say "     Скопируйте его в буфер обмена прямо сейчас."
  say "  2. Возьмите в руки телефон с Telegram — туда придёт код."
  say ""
  say "ГДЕ ИСКАТЬ КОД. Telegram шлёт его В САМО ПРИЛОЖЕНИЕ — на то"
  say "устройство, где вы в этот аккаунт ещё не вышли. Если активных"
  say "сеансов не осталось нигде, код придёт SMS-кой. Проверяйте оба"
  say "места: и чат Telegram, и сообщения телефона."
  say ""
  say "ЕСЛИ КОД НЕ ПРИХОДИТ. После нескольких попыток подряд Telegram"
  say "перестаёт слать коды на время — это его защита, не поломка."
  say "Тогда единственное средство — подождать: от нескольких минут"
  say "до нескольких часов, и не дёргать вход всё это время."
  say ""
  say "Почему это важно. В прошлый раз связь рвалась именно тогда, когда"
  say "скрипт ждал, пока вы ищете значение: молчащий канал отваливается."
  say "Теперь программа сама поддерживает связь, но чем меньше пауза,"
  say "тем надёжнее."
  say ""
  say "ДВА ПРАВИЛА ВВОДА, из-за них прошлый раз и сорвался:"
  say ""
  say "  - НЕ нажимайте Enter «просто так», чтобы проверить отклик."
  say "    Пустой ответ на api_hash обрывает вход с сообщением"
  say "    «Пустое значение», и вставленное следом уходит мимо."
  say "  - Вставили значение — Enter ОДИН раз. Больше ничего не нажимайте."
  say ""
  say "И имейте в виду: api_hash сервер печатает на экран открытым"
  say "текстом, так устроен его скрипт. Не снимайте экран и не"
  say "пересылайте кадр. В протоколе на Рабочем столе я его заглушу."
  say ""
  hr
  say ""
  say "Вопросы пойдут ПО-АНГЛИЙСКИ. Вот что отвечать на каждый —"
  say "сверяйтесь с этим списком, отвечайте по порядку."
  say ""
  say "  [sudo] password for oleg:"
  say "     Пароль от сервера. На экране не появится ничего — так и надо."
  say ""
  say "  api_hash ...:"
  say "     Строка с https://my.telegram.org, раздел API development tools."
  say "     Это то же самое значение, что и раньше: на my.telegram.org оно"
  say "     не меняется. Просто скопируйте его оттуда снова."
  say "     api_id система подставит сама, его не спросят."
  say ""
  say "  Please enter your phone (or bot token):"
  say "     Номер ЭТОГО аккаунта, с кодом страны: +7 и десять цифр."
  say "     Про bot token не думайте — никаких токенов сюда не нужно."
  say ""
  say "  Please enter the code you received:"
  say "     Код, который придёт в само приложение Telegram."
  say ""
  say "  Please enter your password:"
  say "     Появится, только если у аккаунта включена двухфакторная защита."
  say "     Это пароль от неё, не от почты и не от сервера."
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
  # Вход выполняется через файл на сервере, а не длинной командой: так проще
  # и надёжнее с кавычками, чем длинная команда через несколько уровней
  # кавычек ssh.
  ENROLL_BODY="set -u
sudo env PYTHONPATH=$APP $VPY -u -m prodai_control.enroll_telegram_user --network $net
rc=\$?
echo
echo '--------------------------------------------------'
echo \"Подключение завершено, код возврата \$rc\"
echo 'Нажмите Enter, чтобы вернуться.'
read _
"
  if ! printf '%s' "$ENROLL_BODY" | ssh $SSHOPTS "$REMOTE" 'umask 077; cat > "$HOME/.prodai-enroll.sh"'; then
    say "  не удалось передать скрипт на сервер. Ничего не изменено."
    return 1
  fi

  # tmux здесь был ошибкой: вложенный в script и ssh -t, он ломал отрисовку
  # и оставлял локальный терминал в режиме отслеживания мыши — листание
  # переставало работать, а на экран сыпались коды вида M64;20;12.
  # Обрывы держим keepalive'ами, этого достаточно.
  remote_tty "bash \$HOME/.prodai-enroll.sh"
  restore_terminal
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
