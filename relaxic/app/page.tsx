const PALETTE = [
  { n: "01", name: "Уголь",       hex: "#141110", ratio: "16,70:1" },
  { n: "02", name: "Холст",       hex: "#F6F1E8", ratio: "16,70:1" },
  { n: "03", name: "Сурик",       hex: "#E8482B", ratio: "4,83:1" },
  { n: "04", name: "Ультрамарин", hex: "#2B4BE8", ratio: "5,70:1" },
  { n: "05", name: "Бирюза",      hex: "#1FB8A0", ratio: "7,54:1" },
  { n: "06", name: "Охра",        hex: "#E9B949", ratio: "10,29:1" },
  { n: "07", name: "Туман",       hex: "#9A9088", ratio: "6,01:1" },
];

export default function Home() {
  return (
    <main className="mx-auto max-w-[1280px] px-4 py-16 sm:px-6 sm:py-24">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-fog">
        Скелет проекта · шаг 1
      </p>

      <h1 className="display mt-4 text-[clamp(2.5rem,7vw,4.5rem)] leading-[0.98] font-extrabold">
        RELAXIC <span className="text-surik">✕</span>
      </h1>

      <p className="mt-5 max-w-[62ch] text-lg leading-relaxed text-fog">
        Стек установлен, токены бренд-бука подключены, шрифты Unbounded и Onest
        отдаются с кириллицей. Сайт собирается на шаге 2 — после картинок и апрува.
      </p>

      <a
        href="#"
        className="mt-8 inline-flex h-12 items-center rounded-lg bg-surik px-6 font-semibold text-ink transition-transform duration-150 hover:-translate-y-0.5"
      >
        Так выглядит primary-кнопка
      </a>

      <h2 className="display mt-20 text-2xl font-semibold">Палитра как набор красок</h2>
      <p className="mt-2 text-sm text-fog">
        У каждого цвета есть номер. Контраст посчитан, не взят на глаз.
      </p>

      <ul className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-7">
        {PALETTE.map((c) => (
          <li key={c.n} className="rounded-2xl border border-ink-3 bg-ink-2 p-3">
            <div
              className="h-16 w-full rounded-lg border border-ink-3"
              style={{ background: c.hex }}
            />
            <p className="mt-3 text-xs font-semibold text-fog">№{c.n}</p>
            <p className="text-sm font-medium">{c.name}</p>
            <p className="tnum mt-1 text-xs text-fog">{c.ratio}</p>
          </li>
        ))}
      </ul>
    </main>
  );
}
