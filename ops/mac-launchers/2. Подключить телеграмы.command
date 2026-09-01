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
# Номера вшиты, чтобы не набирать их каждый раз.
phone_for() {
  case "$1" in
    telegram_user)  printf '%s' "+79178968483" ;;
    telegram_owner) printf '%s' "+79655959997" ;;
  esac
}

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

# Чистка и приведение терминала в порядок должны случиться при ЛЮБОМ выходе,
# включая Ctrl+C посреди входа: иначе прерванный запуск оставляет api_hash
# в протоколе, а терминал — в чужом режиме.
trap 'restore_terminal; scrub_log' EXIT INT TERM

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

# Драйвер входа. Работает поверх штатного модуля: api_id берёт из политики,
# запись делает их же store_secret. Своё здесь только три вещи — номер
# подставляется, api_hash читается СКРЫТО (штатный скрипт печатает его
# открытым текстом), и показывается тип доставки кода, которого штатный
# скрипт не показывает вовсе.
ENROLL_PY=$(cat <<'ENROLL_PY_EOF'
import sys, getpass, time, asyncio, subprocess, tempfile, shutil
sys.path.insert(0, "/opt/prodai-control/app")

from prodai_control import enroll_telegram_user as E
from telethon.sessions import StringSession
from telethon.sync import TelegramClient
from telethon import errors


def render_qr(url):
    # Рисует QR прямо в терминале. Если библиотеки нет, ставит её во временную
    # папку: рабочее окружение сервиса при этом не меняется.
    try:
        import qrcode
    except ImportError:
        folder = tempfile.mkdtemp(prefix="qrlib-")
        print("  ставлю библиотеку для рисования QR во временную папку...")
        result = subprocess.run(
            [sys.executable, "-m", "pip", "install", "--quiet",
             "--disable-pip-version-check", "--target", folder, "qrcode"],
            capture_output=True, text=True, timeout=240)
        if result.returncode != 0:
            print()
            print("!" * 62)
            print("QR НАРИСОВАТЬ НЕЧЕМ: библиотека не установилась.")
            print((result.stderr or "")[-300:])
            print()
            print("Запасной путь: откройте ССЫЛКУ НИЖЕ НА ТЕЛЕФОНЕ, где стоит")
            print("Telegram. Он сам предложит подтвердить вход.")
            print("Ссылку можно отправить себе в «Избранное» и нажать там.")
            print()
            print("  " + url)
            print("!" * 62)
            return
        sys.path.insert(0, folder)
        import qrcode
    code = qrcode.QRCode(border=1)
    code.add_data(url)
    code.make(fit=True)
    need = code.modules_count + 2
    have = shutil.get_terminal_size((80, 24)).columns
    if have < need:
        print()
        print("!" * 62)
        print("ОКНО ТЕРМИНАЛА УЗКОЕ: есть %d знаков, коду нужно %d." % (have, need))
        print("Код ниже разъедется и не отсканируется.")
        print("Разверните окно на весь экран или уменьшите шрифт: Cmd и минус,")
        print("затем запустите пункт заново.")
        print("!" * 62)
        print()
    code.print_ascii(invert=True)


def login_qr(client, spec):
    print("=" * 62)
    print("ВХОД ПО QR-КОДУ. Ни SMS, ни кодов не потребуется.")
    print("=" * 62)
    print()
    print("На телефоне откройте Telegram ТЕМ аккаунтом, который подключаете:")
    print("  " + spec["label"])
    print()
    print("  Настройки  ->  Устройства  ->  Подключить устройство")
    print()
    print("и наведите камеру на код ниже.")
    print()
    print("Не влезает в окно - разверните Терминал на весь экран")
    print("или уменьшите шрифт: Cmd и минус.")
    try:
        qr = client.qr_login()
    except errors.ApiIdInvalidError:
        raise SystemExit(
            "ОТКАЗ: api_id и api_hash не подходят друг к другу.\n"
            "\n"
            "У КАЖДОГО аккаунта на my.telegram.org свой собственный api_hash.\n"
            "Хеш от другого аккаунта не подойдёт, даже если он верный сам по себе.\n"
            "\n"
            "Войдите на my.telegram.org номером ИМЕННО этого аккаунта,\n"
            "раздел API development tools, и возьмите api_hash оттуда.")
    except errors.FloodWaitError as exc:
        raise SystemExit("ОТКАЗ: Telegram просит подождать %d секунд (%d минут)."
                         % (exc.seconds, exc.seconds // 60))
    except Exception as exc:
        raise SystemExit("Вход по QR начать не удалось: %s: %s"
                         % (type(exc).__name__, exc))
    deadline = time.time() + 300
    while True:
        print()
        render_qr(qr.url)
        print()
        print("  Жду сканирования. Код сам обновится через 25 секунд, так надо.")
        try:
            qr.wait(25)
            return True
        except asyncio.TimeoutError:
            if time.time() > deadline:
                print()
                print("Пять минут прошло, вход не подтверждён. Запустите пункт заново.")
                return False
            try:
                qr.recreate()
            except Exception as exc:
                raise SystemExit("Не удалось обновить QR: %s: %s"
                                 % (type(exc).__name__, exc))


def login_code(client, phone):
    try:
        sent = client.send_code_request(phone)
    except errors.ApiIdInvalidError:
        raise SystemExit("ОТКАЗ: api_id и api_hash не подходят друг к другу.\n"
                         "Возьмите api_hash на my.telegram.org, войдя номером " + phone)
    except errors.PhoneNumberInvalidError:
        raise SystemExit("ОТКАЗ: Telegram не принял номер " + phone)
    except errors.FloodWaitError as exc:
        raise SystemExit("ОТКАЗ: Telegram просит подождать %d секунд (%d минут)."
                         % (exc.seconds, exc.seconds // 60))
    except errors.SendCodeUnavailableError:
        raise SystemExit(
            "ОТКАЗ: для этого номера Telegram уже израсходовал все способы\n"
            "доставки кода. Снимается только временем: часы, иногда сутки.\n"
            "Обойти нельзя. Входите по QR-коду, он кодов не требует.")

    kind = type(sent.type).__name__
    nxt = getattr(sent, "next_type", None)
    nxt = type(nxt).__name__ if nxt else "другой попытки не предусмотрено"
    print("-" * 62)
    print("ЧТО ОТВЕТИЛ TELEGRAM О ДОСТАВКЕ КОДА")
    print("  тип: " + kind)
    print()
    if "App" in kind:
        print("  Код ушёл В ПРИЛОЖЕНИЕ Telegram. SMS не будет.")
        print("  Служебный чат «Telegram», синяя галочка, отправитель 777000.")
        print("  Смотреть в аккаунте " + phone + ", а не в соседнем.")
    elif "Sms" in kind:
        print("  Код отправлен SMS-кой на " + phone)
    elif "Call" in kind or "Missed" in kind:
        print("  Код придёт звонком на " + phone)
    print()
    print("  Следующей попыткой было бы: " + nxt)
    print("-" * 62)
    print()

    code = input("Код (пустой Enter - повторная отправка): ").strip()
    if not code:
        from telethon.tl.functions.auth import ResendCodeRequest
        print()
        print("Прошу Telegram отправить ещё раз, другим способом...")
        try:
            again = client(ResendCodeRequest(phone, sent.phone_code_hash))
            print("Отправлено, тип: " + type(again.type).__name__)
        except errors.SendCodeUnavailableError:
            raise SystemExit(
                "Telegram отказал: все способы доставки для этого номера уже\n"
                "израсходованы. Только ждать, либо входить по QR-коду.")
        except errors.FloodWaitError as exc:
            raise SystemExit("Telegram просит подождать %d секунд." % exc.seconds)
        code = input("Код: ").strip()
        if not code:
            raise SystemExit("Код не введён. Ничего не изменено.")

    try:
        client.sign_in(phone=phone, code=code)
    except errors.PhoneCodeInvalidError:
        raise SystemExit("Код неверный. Ничего не изменено.")
    except errors.PhoneCodeExpiredError:
        raise SystemExit("Код просрочен. Запустите пункт заново.")
    return True


def main():
    network, phone, method = sys.argv[1], sys.argv[2], sys.argv[3]
    spec = E.NETWORKS[network]
    print("=" * 62)
    print("Подключение: " + spec["label"])
    print("Номер:       " + phone)
    print("=" * 62)
    print()

    api_id_raw = E.api_id_from_policy(network=network) or input("api_id: ").strip()
    if not api_id_raw.isdigit():
        raise SystemExit("api_id должен быть числом. Ничего не изменено.")
    print("api_id:      " + api_id_raw)
    print()
    print("Вставьте api_hash с my.telegram.org и нажмите Enter ОДИН раз.")
    print("Ввод скрыт: на экране НИЧЕГО не появится, это нормально.")
    api_hash = getpass.getpass("api_hash: ").strip()
    if not api_hash:
        raise SystemExit("api_hash пустой. Ничего не изменено.")
    print("принято, знаков: %d" % len(api_hash))
    print()

    client = TelegramClient(StringSession(), int(api_id_raw), api_hash)
    client.connect()
    session = None
    try:
        try:
            done = login_qr(client, spec) if method == "qr" else login_code(client, phone)
        except errors.SessionPasswordNeededError:
            print()
            print("У аккаунта включена двухфакторная защита.")
            client.sign_in(password=getpass.getpass("Пароль от неё (ввод скрыт): "))
            done = True
        if not done:
            return 1
        me = client.get_me()
        who = getattr(me, "username", None) or str(getattr(me, "id", ""))
        print()
        print("ВХОД ВЫПОЛНЕН: @" + who)
        if who and who.lower() not in spec["label"].lower():
            print("ВНИМАНИЕ: ожидался " + spec["label"] + ", проверьте, тот ли аккаунт.")
        session = client.session.save()
    finally:
        client.disconnect()

    if session:
        E.store_secret({"api_id": api_id_raw, "api_hash": api_hash, "session": session}, network)
        print("Сохранено штатным путём: " + str(E.secret_path(network)))
        print("Строка сессии на экран не выводится намеренно.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
ENROLL_PY_EOF
)

enroll_one() {
  net="$1"; human="$2"
  PHONE="$(phone_for "$net")"
  hr
  say "Подключение: $human"
  say "Номер: $PHONE  (подставлю сам, вводить не нужно)"
  hr
  say ""
  say "Как входить?"
  say ""
  say "  1) ПО QR-КОДУ — рекомендую"
  say "     Ни SMS, ни кодов. На экране появится квадратный код,"
  say "     наводите на него камеру телефона — ровно так подключают"
  say "     Telegram Desktop. Лимитов Telegram на этот способ нет."
  say ""
  say "  2) По коду из Telegram"
  say "     Тот путь, что не срабатывал. Telegram уже израсходовал все"
  say "     способы доставки кода на этот номер и, скорее всего, откажет."
  say ""
  read -r -p "Введите 1 или 2 (просто Enter — QR): " HOW
  case "$HOW" in
    2) METHOD="code"; say "  выбран вход по коду" ;;
    *) METHOD="qr";   say "  выбран вход по QR-коду" ;;
  esac
  say ""

  say "ЧТО ПРИГОТОВИТЬ, не начиная:"
  say ""
  say "  api_hash — на https://my.telegram.org, войдя номером $PHONE,"
  say "  раздел API development tools. Скопируйте в буфер обмена."
  say ""
  if [ "$METHOD" = "qr" ]; then
    say "  Телефон с Telegram, открытый аккаунтом $human."
    say "  Путь в приложении:"
    say "    Настройки  ->  Устройства  ->  Подключить устройство"
  else
    say "  Телефон: код придёт в служебный чат «Telegram», номер 777000."
  fi
  say ""
  say "ПОРЯДОК ВОПРОСОВ. Первые два одинаковы для обоих способов:"
  say ""
  say "  [sudo] password for oleg:    пароль от сервера, на экране пусто"
  say "  api_hash:                    вставьте и Enter ОДИН раз, ввод скрыт"
  if [ "$METHOD" = "qr" ]; then
    say "  дальше появится QR-код:      наводите камеру, вводить нечего"
  else
    say "  Please enter the code...:    код из Telegram"
  fi
  say "  Please enter your password:  только при двухфакторной защите"
  say ""
  say "Не нажимайте Enter «на пробу»: пустой ответ на api_hash прерывает вход."
  say ""
  say "ВАЖНО: входите именно аккаунтом $human, иначе привяжется не тот."
  say ""
  if ! ask_yes "Начинаем?"; then
    say "Пропущено."
    return 1
  fi
  say ""

  # Вход ведёт свой драйвер поверх штатного модуля: api_id берётся из политики,
  # запись делает их же store_secret. Своё здесь — подстановка номера, скрытый
  # ввод api_hash, показ способа доставки кода и вход по QR.
  if ! printf '%s' "$ENROLL_PY" | ssh $SSHOPTS "$REMOTE" 'umask 077; cat > "$HOME/.prodai-enroll.py"'; then
    say "  не удалось передать скрипт на сервер. Ничего не изменено."
    return 1
  fi

  remote_tty "sudo env PYTHONPATH=$APP $VPY -u \$HOME/.prodai-enroll.py $net $PHONE $METHOD"
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
