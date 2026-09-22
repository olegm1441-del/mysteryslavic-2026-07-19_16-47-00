# Relaxic — запуск на Railway

Инструкция для нового проекта. Дальше сайт разворачивается без ваших действий.

---

## Что нажать в Railway

### 1. Создать проект
[railway.com](https://railway.com) → **New Project** → **Deploy from GitHub repo** →
выбрать репозиторий `relaxic`.

Если репозитория нет в списке — **Configure GitHub App** и дать доступ.

### 2. Добавить базу
В проекте: **+ New** → **Database** → **Add PostgreSQL**.

Railway сам создаст переменную `DATABASE_URL` и прокинет её в сервис.
Вручную её прописывать не нужно.

### 3. Переменные окружения
Сервис сайта → вкладка **Variables** → **Raw Editor** → вставить:

```
DATABASE_URL=${{Postgres.DATABASE_URL}}
TELEGRAM_BOT_TOKEN=сюда_токен_от_BotFather
TELEGRAM_CHAT_ID=сюда_id_чата
NEXT_PUBLIC_SITE_URL=https://relaxic.up.railway.app
ADMIN_TOKEN=любая_длинная_случайная_строка
```

`${{Postgres.DATABASE_URL}}` писать **ровно так** — Railway сам подставит значение.
Если сервис Postgres назван не `Postgres`, поменяйте имя внутри скобок.

### 4. Включить домен
Сервис сайта → **Settings** → **Networking** → **Generate Domain**.
Появится адрес вида `relaxic.up.railway.app`.

**Скопируйте его обратно в `NEXT_PUBLIC_SITE_URL`** — от него зависят
канонические ссылки, OG-картинки и `sitemap.xml`.

### 5. Всё
Railway пересоберёт проект сам. Миграции базы и наполнение демо-данными
выполняются автоматически на этапе pre-deploy — отдельно ничего запускать не нужно.

---

## Свой домен

**Settings → Networking → Custom Domain** → ввести `relaxic.ru`.
Railway покажет CNAME — добавить его у регистратора домена.
Сертификат выпустится сам за 5–30 минут. Затем обновить `NEXT_PUBLIC_SITE_URL`.

---

## Что уже настроено в репозитории

Со стороны проекта ничего донастраивать не нужно:

| Файл | Что делает |
|---|---|
| `railway.toml` | Сборка, команда запуска, `healthcheckPath`, pre-deploy с миграциями |
| `package.json` | Скрипты `build` и `start`, понятные Railpack |
| `prisma/schema.prisma` | Схема базы |
| `prisma/seed.ts` | Демо-товары, вселенные, статьи |
| `.env.example` | Список переменных |

```toml
# railway.toml
[build]
  builder = "NIXPACKS"
  buildCommand = "npm ci && npx prisma generate && npm run build"

[deploy]
  preDeployCommand = "npx prisma migrate deploy && npm run db:seed"
  startCommand = "npm run start"
  healthcheckPath = "/api/health"
  healthcheckTimeout = 120
  restartPolicyType = "ON_FAILURE"
```

---

## Как получить данные для Telegram

1. В Telegram открыть [@BotFather](https://t.me/BotFather) → `/newbot` → задать имя.
   BotFather выдаст токен вида `1234567890:AAF...` → это `TELEGRAM_BOT_TOKEN`.
2. Добавить бота в рабочий чат и **дать права администратора**.
3. Написать в чат любое сообщение.
4. Открыть в браузере:
   `https://api.telegram.org/bot<ВАШ_ТОКЕН>/getUpdates`
5. Найти `"chat":{"id":-1001234567890` → это `TELEGRAM_CHAT_ID`.
   **У групп id отрицательный, минус обязателен.**

Если `getUpdates` возвращает пустой список — бот не видит сообщений.
В @BotFather: `/setprivacy` → выбрать бота → **Disable**.

---

## Если что-то не поднялось

| Симптом | Причина | Что сделать |
|---|---|---|
| Build failed на `prisma generate` | Нет `DATABASE_URL` | Проверить, что переменная задана через `${{Postgres.DATABASE_URL}}` |
| Сайт открывается, товаров нет | Сид не отработал | Сервис → **Deployments** → лог pre-deploy |
| Заказы не приходят в Telegram | Токен или chat_id | Проверить `getUpdates`; у групп id с минусом; бот админ в чате |
| 502 после деплоя | Приложение слушает не тот порт | Проект слушает `process.env.PORT`, менять не нужно |
| Картинки не грузятся | Нет файлов в `public/img` | Догенерировать по `04-IMAGE-PROMPTS.md` |

Логи: сервис → **Deployments** → последний деплой → **View Logs**.

---

## Стоимость

Hobby-план Railway — $5/мес, в них входит потребление ресурсов.
Next.js + Postgres при небольшом трафике укладываются в эту сумму.

---

## Про хранение персональных данных

Railway размещает серверы вне России. 152-ФЗ требует, чтобы база с персональными
данными граждан РФ физически находилась в РФ. Для пилота это обычно не трогают,
для реальных продаж — трогают.

Переезд делается заменой одной переменной `DATABASE_URL` на строку подключения
российского провайдера (Яндекс Облако, Selectel, Timeweb). Код не меняется.
Подробнее — вопрос 8 в `00-QUESTIONS.md`.
