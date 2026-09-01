#!/bin/bash
# 2. Подключить телеграмы.command
#
# Заменяет прежний файл «2. Обновить токены после смены.command».
# Прежняя функция никуда не делась — она стала пунктом 3 в меню.
#
# Что делает файл:
#   1) проверяет связь с сервером prodai-vps и осматривает проект (только чтение);
#   2) принимает токены телеграм-ботов, проверяет каждый живьём через API Telegram;
#   3) кладёт проверенные значения на сервер с резервной копией и правами 600;
#   4) отправляет тестовое сообщение, чтобы связь была доказана, а не обещана.
#
# Токены вводятся скрытым вводом. Они не печатаются на экран, не пишутся
# в лог и не передаются аргументами команд — только через стандартный ввод.
#
# ВАЖНО, если Mac был заражён: любой токен, который лежал на этом Mac во время
# работы стилера, считайте скомпрометированным. Сначала отзовите его у @BotFather
# (/revoke), получите новый — и только новый вводите здесь.

set -u

REMOTE="prodai-vps"
PROJECT="/home/oleg/prodai"
DEFAULT_TARGET="$PROJECT/.env.telegram"
STAMP="$(date +%Y%m%d-%H%M%S)"
LOGFILE="$HOME/Desktop/telegram-подключение-$STAMP.txt"

cd "$(dirname "$0")" 2>/dev/null || true

# ---------------------------------------------------------------- вывод и лог

say() {
  printf '%s\n' "$*"
  if [ -n "$LOGFILE" ]; then printf '%s\n' "$*" >> "$LOGFILE" 2>/dev/null; fi
  return 0
}

hr() { say "----------------------------------------------------------"; }

pause_exit() {
  say ""
  say "Полный протокол сохранён: $LOGFILE"
  say "Токенов в нём нет — файл можно спокойно прислать в чат."
  say ""
  read -n 1 -s -r -p "Нажмите любую клавишу, чтобы закрыть окно"
  echo
  exit "${1:-0}"
}

ask_yes() {
  local a
  read -r -p "$1 [y/N] " a
  case "$a" in
    y|Y|yes|Yes|YES|д|Д|да|Да|ДА) return 0 ;;
    *) return 1 ;;
  esac
}

# ------------------------------------------------------------ разбор ответов

# Достаёт первое строковое значение ключа из плоского JSON.
json_str() {
  printf '%s' "$1" | grep -o "\"$2\":\"[^\"]*\"" | head -1 | sed 's/^[^:]*:"//; s/"$//'
}

# Достаёт первое числовое значение ключа (умеет отрицательные id чатов).
json_num() {
  printf '%s' "$1" | grep -o "\"$2\":-\{0,1\}[0-9][0-9]*" | head -1 | sed 's/^[^:]*://'
}

json_ok() { printf '%s' "$1" | grep -q '"ok":true'; }

# Вызов Telegram API. Токен уходит в curl через конфиг на стандартном вводе,
# поэтому он не виден в списке процессов (в отличие от токена в аргументах).
tg_call() {
  local token="$1" method="$2"
  shift 2
  curl -sS -m 25 -K - "$@" <<CFG
url = "https://api.telegram.org/bot${token}/${method}"
CFG
}

# ------------------------------------------------------------------ проверки

valid_token()  { printf '%s' "$1" | grep -qE '^[0-9]{5,}:[A-Za-z0-9_-]{30,}$'; }
valid_chat()   { printf '%s' "$1" | grep -qE '^(-?[0-9]{1,20}|@[A-Za-z0-9_]{4,32})$'; }
valid_apiid()  { printf '%s' "$1" | grep -qE '^[0-9]{4,12}$'; }
valid_hash()   { printf '%s' "$1" | grep -qE '^[0-9a-fA-F]{32}$'; }
valid_phone()  { printf '%s' "$1" | grep -qE '^\+?[0-9]{7,15}$'; }
valid_path()   { printf '%s' "$1" | grep -qE '^/[A-Za-z0-9._/-]{3,120}$'; }

# ================================================================== заставка

: > "$LOGFILE" 2>/dev/null || LOGFILE=""

hr
say " Подключение телеграмов к системе prodai"
say " $(date '+%d.%m.%Y %H:%M:%S')"
hr
say ""

for bin in ssh curl; do
  if ! command -v "$bin" >/dev/null 2>&1; then
    say "Не найдена команда $bin. Без неё скрипт работать не может."
    pause_exit 1
  fi
done

# ============================================================== шаг 1: связь

say "Шаг 1. Проверяю связь с сервером ($REMOTE)"

if ! ssh -o BatchMode=yes -o ConnectTimeout=20 "$REMOTE" 'echo OK' >/dev/null 2>&1; then
  say "  связи нет."
  say ""
  say "  Вход по ключу не сработал. Вероятные причины:"
  say "    - ключ не добавлен в связку: ssh-add --apple-use-keychain ~/.ssh/prodai_vps"
  say "    - в ~/.ssh/config нет хоста prodai-vps"
  say "    - ключ на сервере не установлен — тогда запустите файл «1. ... SSH.command»"
  say ""
  say "  Подробности от ssh:"
  ssh -o BatchMode=yes -o ConnectTimeout=20 "$REMOTE" 'echo OK' 2>&1 | sed 's/^/    /' | tee -a "$LOGFILE" 2>/dev/null
  pause_exit 1
fi
say "  связь есть"
say ""

# ========================================================== шаг 2: осмотр

say "Шаг 2. Осматриваю проект на сервере (только чтение, ничего не меняю)"
say ""

PROBE="$(ssh "$REMOTE" 'bash -s' <<'REMOTE_PROBE'
set -u
P=/home/oleg/prodai
echo "  сервер:        $(hostname)"
echo "  пользователь:  $(whoami)"
if [ ! -d "$P" ]; then
  echo "  проект:        НЕ НАЙДЕН ($P)"
  exit 0
fi
echo "  проект:        есть ($P)"
echo "  владелец:      $(stat -c '%U:%G права %a' "$P" 2>/dev/null)"
if [ -w "$P" ]; then echo "  запись:        доступна без sudo"; else echo "  запись:        нужен sudo"; fi
echo ""
echo "  --- каталог ops ---"
if [ -d "$P/ops" ]; then ls -1 "$P/ops" 2>/dev/null | head -25 | sed 's/^/    /'
else echo "    каталога ops нет"; fi
echo ""
echo "  --- env-файлы ---"
find "$P" -maxdepth 2 \( -name '.env*' -o -name '*.env' \) 2>/dev/null | head -15 | sed 's/^/    /'
find "$P" -maxdepth 2 \( -name '.env*' -o -name '*.env' \) 2>/dev/null | grep -q . || echo "    не найдены"
echo ""
echo "  --- где уже упоминается telegram ---"
grep -ril telegram "$P" \
  --exclude-dir=.git --exclude-dir=node_modules \
  --exclude-dir=venv --exclude-dir=.venv --exclude-dir=__pycache__ \
  2>/dev/null | head -15 | sed 's/^/    /'
grep -ril telegram "$P" \
  --exclude-dir=.git --exclude-dir=node_modules \
  --exclude-dir=venv --exclude-dir=.venv --exclude-dir=__pycache__ \
  2>/dev/null | grep -q . || echo "    нигде — система про Telegram пока не знает"
echo ""
echo "  --- имена секретов в import-detached.sh ---"
if [ -f "$P/ops/import-detached.sh" ]; then
  grep -oE '[a-z0-9_]*(api_key|token|secret|_key)[a-z0-9_]*' "$P/ops/import-detached.sh" \
    | sort -u | head -25 | sed 's/^/    /'
else
  echo "    import-detached.sh не найден (именно его дёргал старый файл №2)"
fi
echo ""
echo "  --- окружение ---"
if command -v python3 >/dev/null 2>&1; then echo "    python3:   $(python3 -V 2>&1)"; else echo "    python3:   нет"; fi
python3 -c 'import telethon; print("    telethon:  " + telethon.__version__)' 2>/dev/null || echo "    telethon:  нет"
if command -v bw >/dev/null 2>&1; then echo "    bw:        есть"; else echo "    bw:        нет (Bitwarden CLI)"; fi
systemctl list-units --type=service --no-legend 2>/dev/null \
  | grep -iE 'prodai|telegram|bot' | awk '{print "    сервис:    " $1}' | head -10
REMOTE_PROBE
)"

say "$PROBE"
say ""

if printf '%s' "$PROBE" | grep -q "проект:        НЕ НАЙДЕН"; then
  say "Каталога $PROJECT на сервере нет. Дальше идти некуда —"
  say "проверьте, тот ли это сервер, и пришлите протокол в чат."
  pause_exit 1
fi

WRITE_NEEDS_SUDO=0
printf '%s' "$PROBE" | grep -q "запись:        нужен sudo" && WRITE_NEEDS_SUDO=1

hr
say ""

# ================================================================ шаг 3: меню

say "Шаг 3. Что делаем?"
say ""
say "  1) Подключить телеграм-ботов          — токен от @BotFather, канал или чат"
say "  2) Подключить личные аккаунты Telegram — api_id / api_hash с my.telegram.org"
say "  3) Обновить токены Brevo и VK         — то, что делал старый файл №2"
say "  4) Ничего не менять, хватит осмотра выше"
say ""
read -r -p "Введите цифру [1-4]: " MODE
say "  выбрано: $MODE"
say ""

case "$MODE" in
  1) ;;
  2) ;;
  3)
    hr
    say "Обновление токенов Brevo и VK"
    hr
    say ""
    say "Имена записей в Bitwarden остаются прежними:"
    say "  brevo_api_key         ключ Brevo"
    say "  vk_api_key_community  токен сообщества VK"
    say ""
    say "Значения меняете вы, имена не трогаете."
    say ""
    if ! ask_yes "Значения в Bitwarden уже обновлены?"; then
      say "Отменено."
      pause_exit 0
    fi
    say ""
    ssh -t "$REMOTE" "sudo bash $PROJECT/ops/import-detached.sh" 2>&1 | tee -a "$LOGFILE" 2>/dev/null
    say ""
    say "Готово. Пришлите протокол в чат."
    pause_exit 0
    ;;
  4)
    say "Ничего не меняю. Осмотр выше — это всё, что требовалось."
    pause_exit 0
    ;;
  *)
    say "Не понял выбор «$MODE». Ничего не делаю."
    pause_exit 1
    ;;
esac

# =========================================================== сбор значений

ENV_BODY="# Телеграм-доступы для prodai
# Создано $(date '+%d.%m.%Y %H:%M:%S') файлом «2. Подключить телеграмы.command».
# Права 600. Не коммитить, не пересылать.
"
COUNT=0

if [ "$MODE" = "1" ]; then

  hr
  say "Подключение телеграм-ботов"
  hr
  say ""
  say "Для каждого бота понадобится:"
  say "  - токен от @BotFather (вида 123456789:AA...);"
  say "  - канал или чат, куда бот будет писать."
  say ""
  say "Бот должен быть добавлен в канал администратором,"
  say "иначе Telegram не даст ему отправить сообщение."
  say ""

  while true; do
    TOKEN=""
    read -r -s -p "Токен бота (ввод скрыт, Enter — закончить): " TOKEN
    echo
    [ -z "$TOKEN" ] && break

    if ! valid_token "$TOKEN"; then
      say "  это не похоже на токен бота. Ожидается вид 123456789:AA... Попробуйте ещё раз."
      say ""
      continue
    fi

    say "  проверяю токен через api.telegram.org ..."
    RESP="$(tg_call "$TOKEN" getMe 2>&1)"

    if ! json_ok "$RESP"; then
      DESC="$(json_str "$RESP" description)"
      say "  токен не принят Telegram. Ответ: ${DESC:-нет ответа или нет сети}"
      say "  Проверьте, что токен свежий и не отозван в @BotFather."
      say ""
      continue
    fi

    BOT_USER="$(json_str "$RESP" username)"
    BOT_NAME="$(json_str "$RESP" first_name)"
    say "  токен рабочий: @${BOT_USER} (${BOT_NAME})"

    # ---- куда писать
    CHAT=""
    if ask_yes "  Показать чаты, где бота уже видели?"; then
      UPD="$(tg_call "$TOKEN" getUpdates --data-urlencode "limit=50" 2>&1)"
      FOUND="$(printf '%s' "$UPD" \
        | grep -o '"chat":{[^}]*}' \
        | sed 's/.*"id":\(-\{0,1\}[0-9]*\).*"type":"\([a-z]*\)".*/  id \1  (\2)/' \
        | sort -u | head -15)"
      if [ -n "$FOUND" ]; then
        say "  найдено:"
        say "$FOUND"
      else
        say "  ничего не найдено. Это нормально: getUpdates видит только свежие"
        say "  сообщения. Напишите боту что-нибудь или отправьте пост в канал —"
        say "  либо просто введите адрес вручную ниже."
      fi
    fi

    while true; do
      read -r -p "  Куда писать (@имя_канала или числовой id): " CHAT
      if valid_chat "$CHAT"; then break; fi
      say "  ожидается @имя_канала или число вроде -1001234567890."
    done

    say "  отправляю тестовое сообщение ..."
    SEND="$(tg_call "$TOKEN" sendMessage \
      --data-urlencode "chat_id=${CHAT}" \
      --data-urlencode "text=Проверка связи из prodai. Подключение настроено ${STAMP}." 2>&1)"

    if json_ok "$SEND"; then
      say "  сообщение доставлено — связь подтверждена."
    else
      DESC="$(json_str "$SEND" description)"
      say "  Telegram отказал: ${DESC:-нет ответа}"
      say ""
      say "  Частые причины: бот не админ канала; неверный id;"
      say "  для канала нужен id вида -100..., а не имя."
      if ! ask_yes "  Всё равно сохранить эту пару?"; then
        say "  пропускаю этого бота."
        say ""
        continue
      fi
    fi

    COUNT=$((COUNT + 1))
    if [ "$COUNT" = "1" ]; then
      ENV_BODY="${ENV_BODY}
# бот 1: @${BOT_USER}
TELEGRAM_BOT_TOKEN=${TOKEN}
TELEGRAM_CHAT_ID=${CHAT}
"
    else
      ENV_BODY="${ENV_BODY}
# бот ${COUNT}: @${BOT_USER}
TELEGRAM_BOT_${COUNT}_TOKEN=${TOKEN}
TELEGRAM_CHAT_${COUNT}_ID=${CHAT}
"
    fi
    say "  бот @${BOT_USER} записан как номер ${COUNT}."
    say ""
    TOKEN=""
  done

else

  hr
  say "Подключение личных аккаунтов Telegram"
  hr
  say ""
  say "Это вход в ваш личный Telegram, а не бот. Понадобится:"
  say "  - api_id и api_hash с https://my.telegram.org  (Apps);"
  say "  - номер телефона аккаунта;"
  say "  - код подтверждения из Telegram при входе."
  say ""
  say "Пара api_id/api_hash одна на все ваши аккаунты — она привязана"
  say "к учётной записи my.telegram.org, а не к номеру."
  say ""
  if printf '%s' "$PROBE" | grep -q "telethon:  нет"; then
    say "  ПРЕДУПРЕЖДЕНИЕ, прочтите до ввода данных."
    say "  На сервере нет библиотеки telethon — значит, войти в аккаунт"
    say "  прямо сейчас не получится. Реквизиты сохранятся, но вход"
    say "  придётся делать отдельным шагом, после установки:"
    say ""
    say "      ssh $REMOTE"
    say "      python3 -m pip install --user telethon"
    say ""
    if ! ask_yes "  Всё равно продолжить и сохранить реквизиты?"; then
      say "  Отменено. Сервер не тронут."
      pause_exit 0
    fi
    say ""
  fi

  API_ID=""
  while true; do
    say "  api_id — это число, которое my.telegram.org показал в разделе App configuration."
    read -r -p "  api_id: " API_ID
    if valid_apiid "$API_ID"; then break; fi
    say "  Не подошло: ожидается только число, 4-12 цифр."
  done
  say "  принято"
  say ""

  API_HASH=""
  while true; do
    say "  api_hash — строка рядом с api_id на той же странице, ровно 32 знака."
    say "  Ввод скрыт: на экране ничего не появится, это нормально. Вставьте и нажмите Enter."
    read -r -s -p "  api_hash: " API_HASH
    echo
    if valid_hash "$API_HASH"; then break; fi
    say "  Не подошло: ожидается ровно 32 знака из цифр и букв a-f."
  done
  say "  принято"

  ENV_BODY="${ENV_BODY}
TELEGRAM_API_ID=${API_ID}
TELEGRAM_API_HASH=${API_HASH}
"

  say ""
  say "Теперь номера ваших аккаунтов — по одному."
  say "Ниже X означает цифру: это образец формата, а не готовый номер."
  say "Вводите свой настоящий номер, с кодом страны и без пробелов."
  say ""
  PHONES=""
  while true; do
    PHONE=""
    N=$((COUNT + 1))
    say "  --- аккаунт ${N} ---"
    if [ "$COUNT" = "0" ]; then
      say "  Формат: +7XXXXXXXXXX   (например, начинается на +7 и всего 11 цифр)"
      read -r -p "  Номер аккаунта ${N}: " PHONE
    else
      say "  Введено аккаунтов: ${COUNT}. Если больше не нужно — просто нажмите Enter."
      read -r -p "  Номер аккаунта ${N} (или Enter, чтобы закончить): " PHONE
    fi
    [ -z "$PHONE" ] && break
    if ! valid_phone "$PHONE"; then
      say "  Не подошло: нужен номер с кодом страны, только цифры, без пробелов и скобок."
      say "  Длина от 7 до 15 цифр, плюс в начале допустим."
      continue
    fi
    COUNT=$((COUNT + 1))
    if [ "$COUNT" = "1" ]; then
      ENV_BODY="${ENV_BODY}TELEGRAM_PHONE=${PHONE}
"
    else
      ENV_BODY="${ENV_BODY}TELEGRAM_PHONE_${COUNT}=${PHONE}
"
    fi
    PHONES="${PHONES}${PHONE} "
    say "  аккаунт ${COUNT}: ${PHONE}"
  done
fi

say ""
if [ "$COUNT" = "0" ]; then
  say "Ничего не введено — записывать нечего. Выхожу, сервер не тронут."
  pause_exit 0
fi

# ============================================================ запись на сервер

hr
say "Шаг 4. Записываю на сервер"
hr
say ""

TARGET="$DEFAULT_TARGET"
say "Файл по умолчанию: $TARGET"
if ask_yes "Записать в другое место?"; then
  while true; do
    read -r -p "Полный путь на сервере: " TARGET
    if valid_path "$TARGET"; then break; fi
    say "  нужен абсолютный путь без пробелов и кавычек."
  done
fi
say "  цель: $TARGET"
say ""

printf '%s' "$ENV_BODY" | ssh "$REMOTE" 'umask 077; cat > "$HOME/.tg-import.tmp"' || {
  say "Не удалось передать файл на сервер. Ничего не изменено."
  pause_exit 1
}

MOVER="set -u
SRC=\"\$HOME/.tg-import.tmp\"
DST='$TARGET'
STAMP=$STAMP
D=\$(dirname \"\$DST\")
SUDO=\"\"
if [ ! -w \"\$D\" ]; then SUDO=\"sudo\"; fi
if [ -e \"\$DST\" ] && [ ! -w \"\$DST\" ]; then SUDO=\"sudo\"; fi
if [ -e \"\$DST\" ]; then
  \$SUDO cp -a \"\$DST\" \"\$DST.bak-\$STAMP\" && echo \"  прежний файл сохранён: \$DST.bak-\$STAMP\"
fi
OWN=\$(stat -c '%U:%G' \"\$D\" 2>/dev/null || echo root:root)
\$SUDO install -m 600 -o \"\${OWN%%:*}\" -g \"\${OWN##*:}\" \"\$SRC\" \"\$DST\" \\
  && echo \"  записано: \$(ls -l \"\$DST\" | awk '{print \$1, \$3\":\"\$4, \$NF}')\" \\
  || echo \"  ЗАПИСЬ НЕ УДАЛАСЬ\"
echo \"  переменные в файле:\"
\$SUDO grep -oE '^[A-Z_0-9]+=' \"\$DST\" 2>/dev/null | sed 's/=\$//; s/^/    /'
"

printf '%s' "$MOVER" | ssh "$REMOTE" 'umask 077; cat > "$HOME/.tg-move.sh"'

if [ "$WRITE_NEEDS_SUDO" = "1" ]; then
  say "  для записи потребуется пароль sudo на сервере:"
  ssh -t "$REMOTE" 'bash "$HOME/.tg-move.sh"; rm -f "$HOME/.tg-move.sh" "$HOME/.tg-import.tmp"' 2>&1 | tee -a "$LOGFILE" 2>/dev/null
else
  ssh "$REMOTE" 'bash "$HOME/.tg-move.sh"; rm -f "$HOME/.tg-move.sh" "$HOME/.tg-import.tmp"' 2>&1 | tee -a "$LOGFILE" 2>/dev/null
fi
say ""

# ================================================ вход в личные аккаунты

if [ "$MODE" = "2" ]; then
  hr
  say "Шаг 5. Вход в аккаунты"
  hr
  say ""
  if printf '%s' "$PROBE" | grep -q "telethon:  нет"; then
    say "На сервере нет библиотеки telethon — войти в аккаунт нечем."
    say "Реквизиты сохранены, вход можно сделать позже. Установка:"
    say ""
    say "  ssh $REMOTE"
    say "  python3 -m pip install --user telethon"
    say ""
    say "После установки запустите этот файл снова и выберите пункт 2."
  else
    say "Сейчас Telegram пришлёт код в приложение. Введите его в этом окне."
    say "Файлы сессий лягут в $PROJECT/ops/telegram-sessions/ с правами 600."
    say ""
    if ask_yes "Войти в аккаунты сейчас?"; then
      LOGIN_PY='import os, re, sys
from telethon.sync import TelegramClient

env = {}
path = os.environ["TG_ENV"]
for line in open(path):
    line = line.strip()
    if line and not line.startswith("#") and "=" in line:
        k, v = line.split("=", 1)
        env[k.strip()] = v.strip()

api_id = int(env["TELEGRAM_API_ID"])
api_hash = env["TELEGRAM_API_HASH"]
phones = [v for k, v in sorted(env.items()) if re.match(r"^TELEGRAM_PHONE(_\d+)?$", k)]

d = os.path.join(os.path.dirname(path), "ops", "telegram-sessions")
os.makedirs(d, mode=0o700, exist_ok=True)

for phone in phones:
    name = os.path.join(d, phone.replace("+", ""))
    print("")
    print("--- " + phone + " ---")
    try:
        with TelegramClient(name, api_id, api_hash) as client:
            client.start(phone=phone)
            me = client.get_me()
            print("  вход выполнен: " + (me.username or me.first_name or phone))
        os.chmod(name + ".session", 0o600)
    except Exception as exc:
        print("  не удалось: " + str(exc))
'
      printf '%s' "$LOGIN_PY" | ssh "$REMOTE" 'umask 077; cat > "$HOME/.tg-login.py"'
      ssh -t "$REMOTE" "TG_ENV='$TARGET' python3 \"\$HOME/.tg-login.py\"; rm -f \"\$HOME/.tg-login.py\"" 2>&1 | tee -a "$LOGFILE" 2>/dev/null
    else
      say "Пропущено. Реквизиты сохранены, вход можно сделать позже."
    fi
  fi
  say ""
fi

# ============================================================== завершение

hr
say "Шаг 6. Что дальше"
hr
say ""
say "На сервере лежит файл $TARGET с правами 600."
say ""
say "Чтобы система его увидела, переменные нужно подать приложению."
if printf '%s' "$PROBE" | grep -q "нигде — система про Telegram пока не знает"; then
  say "Судя по осмотру, кода про Telegram в проекте пока нет — значит,"
  say "файл сейчас просто лежит и ждёт. Пришлите протокол в чат,"
  say "и я подскажу, куда именно его подключить в вашем коде."
else
  say "Упоминания Telegram в проекте есть (список в шаге 2) — сверьтесь,"
  say "какие имена переменных ожидает код, и при расхождении скажите мне."
fi
say ""
say "Для единообразия с Brevo и VK те же значения стоит положить"
say "в Bitwarden под именами:"
if [ "$MODE" = "1" ]; then
  say "  telegram_bot_token     токен первого бота"
  say "  telegram_chat_id       канал или чат первого бота"
  if [ "$COUNT" -gt 1 ]; then
    i=2
    while [ "$i" -le "$COUNT" ]; do
      say "  telegram_bot_${i}_token   токен бота ${i}"
      say "  telegram_chat_${i}_id     канал или чат бота ${i}"
      i=$((i + 1))
    done
  fi
else
  say "  telegram_api_id        api_id с my.telegram.org"
  say "  telegram_api_hash      api_hash с my.telegram.org"
  say "  telegram_phone         номер первого аккаунта"
fi
say ""

if ask_yes "Запустить import-detached.sh на сервере сейчас?"; then
  say ""
  ssh -t "$REMOTE" "sudo bash $PROJECT/ops/import-detached.sh" 2>&1 | tee -a "$LOGFILE" 2>/dev/null
fi

say ""
hr
say "Готово. Подключено: $COUNT"
hr
pause_exit 0
