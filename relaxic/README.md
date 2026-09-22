# Relaxic ✕

Интернет-магазин наборов для творчества по вселенным кино, сериалов и игр:
картины по номерам, алмазные мозаики, вышивка крестиком.

> **Статус: шаг 1 завершён.** Документация, бренд-бук и скелет проекта готовы.
> Сам сайт собирается на шаге 2 — после апрува и получения картинок.

---

## Запуск одной командой

```bash
npm run pzm
```

Ставит зависимости, поднимает базу (если задан `DATABASE_URL`) и запускает
сервер на `http://localhost:3000`. **Без базы тоже работает** — на демо-данных.

---

## Документация

| Файл | Что внутри |
|---|---|
| [`docs/00-QUESTIONS.md`](docs/00-QUESTIONS.md) | 10 вопросов команде и рабочие допущения по каждому |
| [`docs/01-BRIEF.md`](docs/01-BRIEF.md) | Аудитория, боли, JTBD, пути клиента, контент-маркетинг |
| [`docs/02-TZ.md`](docs/02-TZ.md) | Техническое задание: стек, страницы, корзина, Telegram, cookie, данные |
| [`docs/03-BRANDBOOK.md`](docs/03-BRANDBOOK.md) | Логотип, палитра с номерами, типографика, сетка, движение |
| [`docs/04-IMAGE-PROMPTS.md`](docs/04-IMAGE-PROMPTS.md) | 83 промта для генерации всех изображений |
| [`docs/05-BENCHMARKS.md`](docs/05-BENCHMARKS.md) | Разбор конкурентов и обоснование каждого решения |
| [`docs/06-SITEMAP.md`](docs/06-SITEMAP.md) | 49 страниц, матрица перелинковки, приоритеты sitemap |
| [`docs/07-RAILWAY.md`](docs/07-RAILWAY.md) | Что нажать в Railway |

**Майнд-карта структуры:** [`docs/assets/sitemap-mindmap.png`](docs/assets/sitemap-mindmap.png)

---

## Стек

Next.js 16 · React 19 · TypeScript · Tailwind CSS 4 · Prisma 7 + PostgreSQL ·
Zustand · Zod 4 · motion · Lenis · Embla · Lucide

Шрифты: **Unbounded** (заголовки) и **Onest** (текст) — оба с полной кириллицей.

---

## Переменные окружения

```bash
cp .env.example .env
```

| Переменная | Обязательна | Зачем |
|---|---|---|
| `DATABASE_URL` | нет* | Postgres. Railway подставляет сам |
| `TELEGRAM_BOT_TOKEN` | для заказов | Уведомления о заказах |
| `TELEGRAM_CHAT_ID` | для заказов | Чат, куда падают заказы |
| `NEXT_PUBLIC_SITE_URL` | для прода | Канонические URL, OG, sitemap |
| `NEXT_PUBLIC_YANDEX_METRIKA_ID` | нет | Грузится только после согласия на аналитику |
| `ADMIN_TOKEN` | для `/admin` | Доступ в админку |

\* без неё сайт работает на демо-данных.

Как получить данные для Telegram — в [`docs/07-RAILWAY.md`](docs/07-RAILWAY.md).

---

## Команды

| Команда | Что делает |
|---|---|
| `npm run pzm` | Поднять всё одной командой |
| `npm run dev` | Dev-сервер |
| `npm run build` | Продакшн-сборка |
| `npm run typecheck` | Проверка типов |
| `npm run db:push` | Применить схему к базе |
| `npm run db:seed` | Наполнить демо-данными |
| `npm run db:studio` | Визуальный редактор базы |

---

## Деплой

Railway: [`docs/07-RAILWAY.md`](docs/07-RAILWAY.md). Коротко —
New Project → Deploy from GitHub → добавить Postgres → вписать переменные →
Generate Domain.
