/**
 * Карта риска промышленной автоматики одной линии — бесплатный пилот для «Акульчев»
 *
 * Шрифты: Montserrat (заголовки) / Calibri (основной текст) / Arial (таблицы, числа, подписи)
 *
 * Изображения подставляются из ./images по именам из IMG_MAP.
 * Если файла нет — на слайде рисуется размеченный плейсхолдер с описанием кадра.
 * Чтобы вставить готовые картинки: положить файлы в ./images и перезапустить скрипт.
 */
const pptxgen = require("pptxgenjs");
const fs = require("fs");
const path = require("path");
const { applyTheme } = require(process.env.PPTX_SKILL + "/scripts/apply_theme.js");

const IMG_DIR = path.join(__dirname, "images");
const OUT = path.join(__dirname, "out", "Akulchev_karta_riska_avtomatiki_pilot.pptx");

/* ------------------------------------------------------------------ тема */
const THEME = {
  name: "Akulchev Automation Risk",
  headFontFace: "Montserrat",
  bodyFontFace: "Calibri",
  colors: {
    dk1: "1B2430", // графитовый текст / тёмный фон
    lt1: "FFFFFF", // белый фон
    dk2: "55657A", // приглушённый текст
    lt2: "F1F4F7", // светлая панель
    accent1: "B4530E", // медный акцент (на светлом)
    accent2: "E08B3C", // светлый медный (на тёмном)
    accent3: "2E7D52", // низкий риск
    accent4: "C98A00", // средний риск
    accent5: "B3362A", // высокий риск
    accent6: "1F6F8B", // стальной, вторичные данные
    hlink: "1F6F8B",
    folHlink: "8A99A8",
  },
};
// hex-константы для опций, не принимающих scheme-цвета, и для текста на тёмном фоне
const HEX = {
  graphite: "1B2430", white: "FFFFFF", muted: "55657A", panel: "F1F4F7",
  copper: "B4530E", copperLt: "E08B3C", green: "2E7D52", amber: "C98A00",
  red: "B3362A", steel: "1F6F8B", onDarkDim: "A8B6C4", hair: "DCE3EA",
};
const FONT = { head: "Montserrat", body: "Calibri", data: "Arial" };

/* ---------------------------------------------------------------- геометрия */
const SW = 13.333, SH = 7.5, M = 0.55;
const CW = SW - 2 * M;           // 12.233 — рабочая ширина
const BODY_TOP = 1.46;           // верх контентной области
const FOOT_Y = 6.98;

const pres = new pptxgen();
pres.layout = "LAYOUT_WIDE";
pres.author = "Пилотный аудит жизненного цикла промышленной автоматики";
pres.title = "Карта риска промышленной автоматики одной линии";
pres.subject = "Бесплатный пилот для «Акульчев»";
pres.theme = { headFontFace: THEME.headFontFace, bodyFontFace: THEME.bodyFontFace };
const C = pres.SchemeColor;

/* ------------------------------------------------------------------ layouts */
const FOOTER = "Карта риска промышленной автоматики · бесплатный пилот для «Акульчев»";

pres.defineSlideMaster({
  title: "TITLE_DARK",
  background: { color: C.text1 },
  objects: [],
});

pres.defineSlideMaster({
  title: "CONTENT",
  background: { color: C.background1 },
  objects: [
    { placeholder: { options: {
        name: "title", type: "title", x: M, y: 0.40, w: CW, h: 0.80,
        fontFace: FONT.head, fontSize: 30, bold: true, color: C.text1,
        align: "left", valign: "middle", margin: 0,
      }, text: "" } },
    { text: { text: FOOTER, options: {
        x: M, y: FOOT_Y, w: 10.6, h: 0.30, fontFace: FONT.data, fontSize: 9,
        color: C.text2, align: "left", valign: "middle", margin: 0, isTextBox: true,
      } } },
  ],
  slideNumber: { x: SW - M - 0.6, y: FOOT_Y, w: 0.6, h: 0.30, fontFace: FONT.data,
                 fontSize: 9, color: C.text2, align: "right" },
});

pres.defineSlideMaster({
  title: "DATA",
  background: { color: C.background1 },
  objects: [
    { placeholder: { options: {
        name: "title", type: "title", x: M, y: 0.34, w: CW, h: 0.62,
        fontFace: FONT.head, fontSize: 30, bold: true, color: C.text1,
        align: "left", valign: "middle", margin: 0,
      }, text: "" } },
    { text: { text: FOOTER, options: {
        x: M, y: FOOT_Y, w: 10.6, h: 0.30, fontFace: FONT.data, fontSize: 9,
        color: C.text2, align: "left", valign: "middle", margin: 0, isTextBox: true,
      } } },
  ],
  slideNumber: { x: SW - M - 0.6, y: FOOT_Y, w: 0.6, h: 0.30, fontFace: FONT.data,
                 fontSize: 9, color: C.text2, align: "right" },
});

pres.defineSlideMaster({
  title: "CONTENT_DARK",
  background: { color: C.text1 },
  objects: [
    { placeholder: { options: {
        name: "title", type: "title", x: M, y: 0.40, w: CW, h: 0.80,
        fontFace: FONT.head, fontSize: 30, bold: true, color: C.background1,
        align: "left", valign: "middle", margin: 0,
      }, text: "" } },
    { text: { text: FOOTER, options: {
        x: M, y: FOOT_Y, w: 10.6, h: 0.30, fontFace: FONT.data, fontSize: 9,
        color: HEX.onDarkDim, align: "left", valign: "middle", margin: 0, isTextBox: true,
      } } },
  ],
  slideNumber: { x: SW - M - 0.6, y: FOOT_Y, w: 0.6, h: 0.30, fontFace: FONT.data,
                 fontSize: 9, color: HEX.onDarkDim, align: "right" },
});

/* ------------------------------------------------------- изображения/заглушки */
// слайд -> { базовое имя файла, описание кадра для плейсхолдера }
// Расширение не фиксируем: подходит и .jpg, и .png (см. resolveImage).
const IMG_MAP = {
  s1: { base: "01-title",       note: "IMAGE 01 · 16:9\nЦех, открытый шкаф автоматики,\nинженер сбоку. Свободное поле слева." },
  s2: { base: "07-line-wide",   note: "IMAGE 07 · 16:9\nШирокий вид действующей\nкондитерской линии." },
  s3: { base: "02-components",  note: "IMAGE 02 · 4:3\nКомпоненты автоматики\nна инженерном столе." },
  s4: { base: "03-fieldwork",   note: "IMAGE 03 · 16:9\nСбор данных на линии:\nфото шильдика, осмотр шкафа." },
  s5: { base: "04-lifecycle",   note: "IMAGE 04 · 16:9\nРяд модулей от нового\nк старому поколению." },
  s7: { base: "05-dashboard",   note: "IMAGE 05 · 16:9\nИнженер у монитора\nс картой риска." },
  s9: { base: "06-spare-repair",note: "IMAGE 06 · 4:3\nЗапас / ремонтный стенд /\nновый модуль замены." },
};

const EXTS = [".jpg", ".jpeg", ".png"];
function resolveImage(base) {
  for (const ext of EXTS) {
    const p = path.join(IMG_DIR, base + ext);
    if (fs.existsSync(p)) return p;
  }
  return null;
}

function placeImage(slide, key, x, y, w, h, onDark) {
  const spec = IMG_MAP[key];
  const file = resolveImage(spec.base);
  if (file) {
    slide.addImage({ path: file, x, y, w, h, sizing: { type: "cover", w, h },
                     objectName: "photo-" + key });
    return;
  }
  slide.addShape(pres.ShapeType.roundRect, {
    x, y, w, h, rectRadius: 0.06,
    fill: { color: onDark ? "263241" : C.background2 },
    line: { color: onDark ? "3C4A5C" : HEX.hair, width: 1, dashType: "dash" },
    objectName: "img-placeholder-" + key,
  });
  slide.addText(spec.note, {
    x: x + 0.18, y, w: w - 0.36, h, isTextBox: true, margin: 0,
    fontFace: FONT.data, fontSize: 10, color: onDark ? HEX.onDarkDim : C.text2,
    align: "center", valign: "middle", lineSpacingMultiple: 1.25,
  });
}

/* ------------------------------------------------------------- хелперы верстки */
// Нумерованный/буквенный маркер в залитом круге — единый мотив презентации
function badge(slide, label, x, y, d, fill, textColor, size) {
  slide.addShape(pres.ShapeType.ellipse, { x, y, w: d, h: d, fill: { color: fill },
    line: { color: fill, width: 0 }, objectName: "badge-" + label });
  slide.addText(label, { x, y, w: d, h: d, isTextBox: true, margin: 0,
    fontFace: FONT.head, fontSize: size || 13, bold: true, color: textColor || HEX.white,
    align: "center", valign: "middle" });
}

// Маркер компонента на слайде 3: готовая иконка, иначе буквенный кружок
function compMark(slide, label, iconFile, x, y, d) {
  const p = path.join(IMG_DIR, "icons", iconFile);
  if (fs.existsSync(p)) {
    slide.addImage({ path: p, x, y, w: d, h: d, objectName: "icon-" + label });
  } else {
    badge(slide, label, x, y, d, HEX.steel, HEX.white, label.length > 3 ? 7.5 : 9.5);
  }
}

function card(slide, x, y, w, h, onDark) {
  slide.addShape(pres.ShapeType.roundRect, {
    x, y, w, h, rectRadius: 0.05,
    fill: { color: onDark ? "263241" : C.background2 },
    line: { color: onDark ? "33414F" : HEX.hair, width: 0.75 },
    objectName: "card",
  });
}

function eyebrow(slide, text, x, y, w, color) {
  slide.addText(text, { x, y, w, h: 0.26, isTextBox: true, margin: 0,
    fontFace: FONT.data, fontSize: 10, bold: true, charSpacing: 1.6,
    color: color || C.accent1, align: "left", valign: "middle" });
}

function sourceLine(slide, text) {
  slide.addText(text, { x: M, y: 6.66, w: CW, h: 0.28, isTextBox: true, margin: 0,
    fontFace: FONT.data, fontSize: 8.5, color: C.text2, italic: true,
    align: "left", valign: "middle" });
}

/* ===================================================================== */
/* СЛАЙД 1 — титул                                                       */
/* ===================================================================== */
pres.addSection({ title: "Контекст" });
{
  const s = pres.addSlide({ masterName: "TITLE_DARK", sectionTitle: "Контекст" });
  placeImage(s, "s1", 7.05, 0, 6.28, SH, true);
  // подложка под текст, чтобы титул читался поверх любого кадра
  s.addShape(pres.ShapeType.rect, { x: 0, y: 0, w: 7.05, h: SH,
    fill: { color: C.text1 }, line: { width: 0 }, objectName: "title-scrim" });

  eyebrow(s, "ПИЛОТНЫЙ АУДИТ · ПРОМЫШЛЕННАЯ АВТОМАТИКА", M, 0.84, 6.4, HEX.copperLt);
  s.addText("Карта риска\nпромышленной\nавтоматики\nодной линии", {
    x: M, y: 1.30, w: 6.4, h: 2.26, isTextBox: true, margin: 0,
    fontFace: FONT.head, fontSize: 34, bold: true, color: C.background1,
    align: "left", valign: "top", lineSpacingMultiple: 1.10,
  });
  s.addText("Бесплатный пилот для «Акульчев»", {
    x: M, y: 3.90, w: 6.4, h: 0.46, isTextBox: true, margin: 0,
    fontFace: FONT.head, fontSize: 20, bold: true, color: HEX.copperLt,
    align: "left", valign: "middle",
  });
  s.addShape(pres.ShapeType.roundRect, { x: M, y: 4.64, w: 6.4, h: 1.04, rectRadius: 0.05,
    fill: { color: "263241" }, line: { color: "33414F", width: 0.75 }, objectName: "chain" });
  s.addText(
    "Жизненный цикл компонентов  →  риск дефицита  →  резерв  →\nремонт / замена  →  план миграции",
    { x: M + 0.24, y: 4.64, w: 5.92, h: 1.04, isTextBox: true, margin: 0,
      fontFace: FONT.data, fontSize: 11.5, color: HEX.panel,
      align: "left", valign: "middle", lineSpacingMultiple: 1.35 });
  s.addText("Аудит жизненного цикла и риска устаревания ПЛК, HMI, приводов и модулей ввода-вывода", {
    x: M, y: 5.96, w: 6.4, h: 0.5, isTextBox: true, margin: 0,
    fontFace: FONT.body, fontSize: 12, color: HEX.onDarkDim, align: "left", valign: "middle",
  });
  s.addNotes(
    "Цель встречи — согласовать одну критичную линию и дату выезда.\n" +
    "Пилот бесплатный, без подключения к производственной сети и без изменения программ.\n" +
    "Результат — карта риска устаревания автоматики выбранной линии."
  );
}

/* ===================================================================== */
/* СЛАЙД 2 — почему тема актуальна                                       */
/* ===================================================================== */
{
  const s = pres.addSlide({ masterName: "CONTENT", sectionTitle: "Контекст" });
  s.addText("Почему тема актуальна для производства «Акульчев»", { placeholder: "title" });

  const LW = 7.52;                    // левая колонка
  placeImage(s, "s2", M + LW + 0.30, BODY_TOP, CW - LW - 0.30, 4.46);

  // цитата руководства — ключевой подтверждённый факт
  s.addShape(pres.ShapeType.roundRect, { x: M, y: BODY_TOP, w: LW, h: 1.18, rectRadius: 0.05,
    fill: { color: C.text1 }, line: { width: 0 }, objectName: "quote-card" });
  s.addText([
    { text: "«Наше производство высокоавтоматизированное, уровень\nавтоматизации составляет 50%, а в планах — дойти до 80%»",
      options: { fontFace: FONT.head, fontSize: 13.5, bold: true, color: C.background1, breakLine: true } },
    { text: "Сергей Акульчев, интервью «Бизнес Online»",
      options: { fontFace: FONT.data, fontSize: 9.5, color: HEX.copperLt } },
  ], { x: M + 0.26, y: BODY_TOP, w: LW - 0.52, h: 1.18, isTextBox: true, margin: 0,
       align: "left", valign: "middle", lineSpacingMultiple: 1.25 });

  const FACTS = [
    ["1", "Программную поддержку западных вендоров прекратили",
      "«Западные компании перестали обслуживать программное обеспечение, и это проблема» — сказано именно в связи с высокой автоматизацией производства."],
    ["2", "Парк автоматики — импортный и разных поколений",
      "Оборудование закупалось в Австрии, Германии, Швейцарии, Италии, Нидерландах и Франции. Часть пополнения парка — бывшее в эксплуатации оборудование."],
    ["3", "Запчасти идут дольше, стоят дороже и труднее находятся",
      "Прежние поставщики перестали выходить на связь; запас запчастей оценивался примерно в полгода; логистика подорожала примерно в 1,5 раза."],
  ];
  let fy = BODY_TOP + 1.34;
  FACTS.forEach(([n, head, body]) => {
    const h = 0.96;
    card(s, M, fy, LW, h);
    badge(s, n, M + 0.22, fy + 0.20, 0.34, HEX.copper, HEX.white, 12);
    s.addText(head, { x: M + 0.68, y: fy + 0.11, w: LW - 0.92, h: 0.30, isTextBox: true, margin: 0,
      fontFace: FONT.head, fontSize: 12, bold: true, color: C.text1, align: "left", valign: "middle" });
    s.addText(body, { x: M + 0.68, y: fy + 0.38, w: LW - 0.92, h: 0.50, isTextBox: true, margin: 0,
      fontFace: FONT.body, fontSize: 10.5, color: C.text2, align: "left", valign: "top",
      lineSpacingMultiple: 1.12 });
    fy += h + 0.12;
  });

  s.addShape(pres.ShapeType.roundRect, { x: M, y: 6.04, w: CW, h: 0.52, rectRadius: 0.05,
    fill: { color: C.background2 }, line: { color: HEX.hair, width: 0.75 }, objectName: "concl" });
  s.addText("Риск устаревания автоматики для такого парка — не прогноз, а следствие уже описанной ситуации. Открытый вопрос один: где именно этот риск сконцентрирован.", {
    x: M + 0.26, y: 6.04, w: CW - 0.52, h: 0.52, isTextBox: true, margin: 0,
    fontFace: FONT.body, fontSize: 11, bold: true, color: C.text1, align: "left", valign: "middle" });

  sourceLine(s, "Источники: «Бизнес Online» — business-gazeta.ru/article/619038, business-gazeta.ru/article/544823 · hh.ru/employer/22212 · retail.ru. Полный список — в приложении.");
  s.addNotes(
    "Все четыре факта — из публичных источников, ссылки внизу слайда и в приложении.\n" +
    "Конкретный установленный парк (модели ПЛК, HMI, приводов) компании не приписывается: публичных данных по нему нет, это и есть предмет инвентаризации."
  );
}

/* ===================================================================== */
/* СЛАЙД 3 — что именно проверяется                                      */
/* ===================================================================== */
pres.addSection({ title: "Что и как проверяем" });
{
  const s = pres.addSlide({ masterName: "CONTENT", sectionTitle: "Что и как проверяем" });
  s.addText("Что именно проверяется", { placeholder: "title" });

  const COMPS = [
    ["ПЛК", "Программируемый контроллер", "выполняет логику участка", "plc.png"],
    ["HMI", "Панель оператора", "режимы, ошибки, рецептуры", "hmi.png"],
    ["VFD", "Частотный преобразователь", "скорость конвейеров и насосов", "vfd.png"],
    ["SERVO", "Сервопривод и серводрайв", "точная подача, резка, упаковка", "servo.png"],
    ["I/O", "Модули ввода-вывода", "сигналы датчиков и команды", "io.png"],
    ["IPC", "Промышленный ПК", "визуализация, архивы, рецептуры", "ipc.png"],
  ];
  const gx = M, gy = BODY_TOP, cw = 2.78, ch = 1.26, gap = 0.16;
  COMPS.forEach((c, i) => {
    const col = i % 3, row = Math.floor(i / 3);
    const x = gx + col * (cw + gap), y = gy + row * (ch + gap);
    card(s, x, y, cw, ch);
    compMark(s, c[0], c[3], x + 0.16, y + 0.16, 0.50);
    s.addText(c[1], { x: x + 0.76, y: y + 0.19, w: cw - 0.94, h: 0.44, isTextBox: true, margin: 0,
      fontFace: FONT.head, fontSize: 10.5, bold: true, color: C.text1, align: "left", valign: "middle",
      lineSpacingMultiple: 1.05 });
    s.addText(c[2], { x: x + 0.18, y: y + 0.70, w: cw - 0.36, h: 0.36, isTextBox: true, margin: 0,
      fontFace: FONT.body, fontSize: 10, color: C.text2, align: "left", valign: "top",
      lineSpacingMultiple: 1.1 });
  });

  const rx = gx + 3 * (cw + gap) + 0.10;
  const rw = M + CW - rx;
  const gridBottom = gy + 2 * ch + gap;
  placeImage(s, "s3", rx, gy, rw, gridBottom - gy);

  card(s, M, gridBottom + 0.16, CW, 0.66);
  s.addText([
    { text: "Первый этап — не стендовая диагностика.  ", options: { bold: true, color: C.text1 } },
    { text: "Остаточный физический ресурс платы не измеряется: если компонент требует этого, он выделяется в отдельный маршрут через сервисного партнёра. При необходимости в список добавляются блоки питания, коммуникационные модули и сетевое оборудование АСУ ТП.",
      options: { color: C.text2 } },
  ], { x: M + 0.26, y: gridBottom + 0.16, w: CW - 0.52, h: 0.66, isTextBox: true, margin: 0,
       fontFace: FONT.body, fontSize: 10.5, align: "left", valign: "middle", lineSpacingMultiple: 1.12 });

  s.addShape(pres.ShapeType.roundRect, { x: M, y: 5.06, w: CW, h: 1.50, rectRadius: 0.06,
    fill: { color: C.text1 }, line: { width: 0 }, objectName: "audit-question" });
  s.addText([
    { text: "ВОПРОС АУДИТА", options: { fontFace: FONT.data, fontSize: 10, bold: true,
      charSpacing: 1.6, color: HEX.copperLt, breakLine: true } },
    { text: "Если этот компонент понадобится завтра — есть ли понятный\nи безопасный путь восстановления работы линии?",
      options: { fontFace: FONT.head, fontSize: 18, bold: true, color: C.background1 } },
  ], { x: M + 0.40, y: 5.06, w: CW - 0.80, h: 1.50, isTextBox: true, margin: 0,
       align: "left", valign: "middle", lineSpacingMultiple: 1.2 });

  s.addNotes(
    "Шесть классов компонентов — предмет аудита. Список расширяется по месту.\n" +
    "Важно проговорить: это аудит жизненного цикла и доступности, а не электротехническая диагностика. " +
    "Мы не обещаем измерить остаточный ресурс электроники без стенда."
  );
}

/* ===================================================================== */
/* СЛАЙД 4 — как проходит пилот                                          */
/* ===================================================================== */
{
  const s = pres.addSlide({ masterName: "CONTENT", sectionTitle: "Что и как проверяем" });
  s.addText("Как проходит пилот", { placeholder: "title" });

  const STEPS = [
    ["1", "Выбор линии", "совместно выбираем одну критичную линию или участок"],
    ["2", "Выезд и инвентаризация", "10–20 компонентов: фото шильдиков, маркировка, доступная документация"],
    ["3", "Проверка жизненного цикла", "выпускается ли, стадия, даты прекращения продаж и поддержки, преемник"],
    ["4", "Проверка реальной доступности", "поставка в РФ и её срок, число каналов, ремонт, обмен, восстановленные решения"],
    ["5", "Оценка критичности", "вместе с инженером предприятия: останов, обходной режим, резервирование, backup"],
    ["6", "Риск-скоринг и карта риска", "приоритизация позиций по модели 0–100"],
    ["7", "Рекомендации", "план действий на 3 / 12 / 24 месяца"],
  ];
  const LW = 7.72;
  let y = BODY_TOP;
  STEPS.forEach(([n, head, body]) => {
    const h = 0.62;
    badge(s, n, M, y + 0.12, 0.37, HEX.copper, HEX.white, 12);
    s.addText(head, { x: M + 0.52, y: y + 0.02, w: LW - 0.52, h: 0.30, isTextBox: true, margin: 0,
      fontFace: FONT.head, fontSize: 11.5, bold: true, color: C.text1, align: "left", valign: "middle" });
    s.addText(body, { x: M + 0.52, y: y + 0.32, w: LW - 0.52, h: 0.26, isTextBox: true, margin: 0,
      fontFace: FONT.body, fontSize: 10, color: C.text2, align: "left", valign: "middle" });
    y += h;
  });
  const stepsBottom = y - 0.04;

  placeImage(s, "s4", M + LW + 0.28, BODY_TOP, CW - LW - 0.28, 2.62);
  card(s, M + LW + 0.28, BODY_TOP + 2.78, CW - LW - 0.28, stepsBottom - BODY_TOP - 2.78);
  s.addText([
    { text: "Срок\n", options: { fontFace: FONT.data, fontSize: 9.5, bold: true, charSpacing: 1.4, color: C.accent1 } },
    { text: "2–3 часа", options: { fontFace: FONT.head, fontSize: 20, bold: true, color: C.text1 } },
    { text: "  на площадке\n", options: { fontFace: FONT.body, fontSize: 11, color: C.text2 } },
    { text: "до 5 рабочих дней", options: { fontFace: FONT.head, fontSize: 14, bold: true, color: C.text1 } },
    { text: " на анализ", options: { fontFace: FONT.body, fontSize: 11, color: C.text2 } },
  ], { x: M + LW + 0.50, y: BODY_TOP + 2.78, w: CW - LW - 0.72, h: stepsBottom - BODY_TOP - 2.78,
       isTextBox: true, margin: 0, align: "left", valign: "middle", lineSpacingMultiple: 1.3 });

  s.addShape(pres.ShapeType.roundRect, { x: M, y: 5.94, w: CW, h: 0.74, rectRadius: 0.05,
    fill: { color: "F3EAE1" }, line: { color: "E2CDB9", width: 0.75 }, objectName: "safety" });
  s.addText([
    { text: "Производство не затрагивается.  ", options: { bold: true, color: HEX.copper } },
    { text: "Подключение к производственной сети, изменение программы ПЛК, правка настроек и остановка оборудования не требуются. Сбор данных — визуальный: шильдики, маркировка, доступная документация и интервью с инженером.",
      options: { color: C.text1 } },
  ], { x: M + 0.30, y: 5.94, w: CW - 0.60, h: 0.74, isTextBox: true, margin: 0,
       fontFace: FONT.body, fontSize: 10.5, align: "left", valign: "middle", lineSpacingMultiple: 1.12 });

  s.addNotes(
    "Семь шагов. Первый и пятый — совместные с инженером предприятия, остальные делаем сами.\n" +
    "Ключевое возражение, которое снимает нижняя плашка: пилот не требует доступа в сеть АСУ ТП и не останавливает линию."
  );
}

/* ===================================================================== */
/* СЛАЙД 5 — метод оценки                                                */
/* ===================================================================== */
{
  const s = pres.addSlide({ masterName: "CONTENT", sectionTitle: "Что и как проверяем" });
  s.addText("Метод оценки", { placeholder: "title" });

  const LW = 7.30;
  eyebrow(s, "ВЕСА ФАКТОРОВ РИСК-СКОРИНГА, %", M, BODY_TOP, LW);
  // порядок обратный: в горизонтальной гистограмме первая категория рисуется внизу
  s.addChart(pres.ChartType.bar, [{
    name: "Вес фактора",
    labels: ["Сложность замены, наличие backup", "Резерв и ремонтопригодность",
             "Доступность и срок поставки", "Стадия жизненного цикла / EOL",
             "Последствия отказа для линии"],
    values: [15, 15, 20, 20, 30],
  }], {
    x: M - 0.06, y: BODY_TOP + 0.30, w: LW + 0.06, h: 2.60,
    barDir: "bar", barGapWidthPct: 42,
    chartColors: [HEX.copper],
    showLegend: false, showTitle: false,
    showValue: true, dataLabelPosition: "outEnd",
    dataLabelFormatCode: '0"%"',
    dataLabelFontFace: FONT.data, dataLabelFontSize: 11, dataLabelColor: HEX.graphite,
    catAxisLabelFontFace: FONT.data, catAxisLabelFontSize: 10.5, catAxisLabelColor: HEX.graphite,
    valAxisHidden: true, valAxisMinVal: 0, valAxisMaxVal: 34,
    valGridLine: { style: "none" },
    catGridLine: { style: "none" },
    valAxisLineShow: false, catAxisLineShow: false,
    objectName: "risk-weights",
  });

  const RX = M + LW + 0.32, RW = CW - LW - 0.32;
  placeImage(s, "s5", RX, BODY_TOP, RW, 1.54);

  eyebrow(s, "КАТЕГОРИИ РИСКА", RX, BODY_TOP + 1.68, RW);
  const CATS = [["0–34", "низкий", HEX.green], ["35–64", "средний", HEX.amber], ["65–100", "высокий", HEX.red]];
  let cy = BODY_TOP + 1.96;
  CATS.forEach(([range, label, col]) => {
    s.addShape(pres.ShapeType.roundRect, { x: RX, y: cy, w: RW, h: 0.38, rectRadius: 0.04,
      fill: { color: col }, line: { width: 0 }, objectName: "cat-" + label });
    s.addText([
      { text: range, options: { fontFace: FONT.data, fontSize: 11, bold: true } },
      { text: "   " + label + " риск", options: { fontFace: FONT.body, fontSize: 11 } },
    ], { x: RX + 0.20, y: cy, w: RW - 0.40, h: 0.38, isTextBox: true, margin: 0,
         color: HEX.white, align: "left", valign: "middle" });
    cy += 0.44;
  });

  eyebrow(s, "ПРИОРИТЕТ ИСТОЧНИКОВ ДАННЫХ", M, 4.94, CW);
  const SRC = [
    ["1", "Официальная документация производителя"],
    ["2", "Официальные каталоги и lifecycle-страницы"],
    ["3", "Авторизованные и крупные каналы поставки"],
    ["4", "Независимые поставщики — только как доп. проверка рынка"],
  ];
  const sw = (CW - 3 * 0.16) / 4;
  SRC.forEach(([n, t], i) => {
    const x = M + i * (sw + 0.16);
    card(s, x, 5.22, sw, 0.84);
    badge(s, n, x + 0.18, 5.37, 0.30, HEX.steel, HEX.white, 11);
    s.addText(t, { x: x + 0.56, y: 5.22, w: sw - 0.74, h: 0.84, isTextBox: true, margin: 0,
      fontFace: FONT.body, fontSize: 9.5, color: C.text1, align: "left", valign: "middle",
      lineSpacingMultiple: 1.1 });
  });

  s.addText([
    { text: "Модель 0–100 — рабочая и адаптируется под предприятие. ", options: { bold: true, color: C.text1 } },
    { text: "Итоговый балл приоритизирует внимание, а не прогнозирует вероятность отказа. По значимой позиции используем минимум 2–3 независимых сигнала о доступности: единичное предложение одного продавца за рыночную доступность не выдаём.",
      options: { color: C.text2 } },
  ], { x: M, y: 6.22, w: CW, h: 0.60, isTextBox: true, margin: 0,
       fontFace: FONT.body, fontSize: 10, align: "left", valign: "middle", lineSpacingMultiple: 1.12 });

  s.addNotes(
    "Веса и границы категорий — предмет настройки под предприятие, это рабочая модель.\n" +
    "Про источники: приоритет официальной документации производителя, независимые поставщики — только проверка рынка.\n" +
    "Сознательно не делаем псевдоточность: балл приоритизирует, а не предсказывает."
  );
}

/* ===================================================================== */
/* СЛАЙД 6 — как выглядит результат (главный слайд)                      */
/* ===================================================================== */
pres.addSection({ title: "Результат" });
{
  const s = pres.addSlide({ masterName: "DATA", sectionTitle: "Результат" });
  s.addText("Как выглядит результат", { placeholder: "title" });
  s.addText("Фрагмент рабочей таблицы реестра, отсортированный по риск-баллу. Условный пример формата.", {
    x: M, y: 0.98, w: CW, h: 0.28, isTextBox: true, margin: 0,
    fontFace: FONT.body, fontSize: 11.5, color: C.text2, align: "left", valign: "middle" });

  const HEADS = ["Позиция", "Роль на линии", "Lifecycle", "Резерв", "Срок\nпоставки",
                 "Замена / ремонт", "Риск", "Рекомендуемое действие"];
  const COLW = [1.12, 2.08, 1.62, 0.72, 0.92, 1.72, 0.70, 3.35];
  const ROWS = [
    ["PLC-01",   "управление участком",   "снят с производства", "0", "90+ дней",  "миграция",        82, "подготовить резерв + проект перехода"],
    ["SERVO-04", "подача и резка",        "снят с производства", "0", "60–90 дней","ремонт + обмен",  68, "найти обменный фонд, заложить ЗИП"],
    ["HMI-02",   "операторская панель",   "устаревает",          "1", "45 дней",   "преемник есть",   51, "backup + наблюдение"],
    ["I/O-05",   "модуль ввода-вывода",   "активен",             "2", "21 день",   "преемник есть",   29, "оставить как есть"],
    ["VFD-03",   "привод конвейера",      "активен",             "0", "14 дней",   "ремонт доступен", 24, "оставить как есть"],
  ];
  const riskColor = (v) => (v >= 65 ? HEX.red : v >= 35 ? HEX.amber : HEX.green);

  const tbl = [HEADS.map((h) => ({
    text: h,
    options: { fill: { color: HEX.graphite }, color: HEX.white, bold: true,
               fontFace: FONT.data, fontSize: 9.5, align: "left", valign: "middle" },
  }))];
  ROWS.forEach((r, ri) => {
    const bg = ri % 2 ? HEX.panel : "FFFFFF";
    tbl.push(r.map((cell, ci) => {
      const base = { fill: { color: bg }, fontFace: FONT.data, fontSize: 10,
                     color: HEX.graphite, align: "left", valign: "middle" };
      if (ci === 0) return { text: String(cell), options: { ...base, bold: true } };
      if (ci === 6) return { text: String(cell), options: { ...base, fill: { color: riskColor(cell) },
                              color: HEX.white, bold: true, fontSize: 11.5, align: "center" } };
      if (ci === 3) return { text: String(cell), options: { ...base, align: "center" } };
      return { text: String(cell), options: base };
    }));
  });

  s.addTable(tbl, {
    x: M, y: 1.38, w: CW, colW: COLW,
    rowH: [0.42, 0.40, 0.40, 0.40, 0.40, 0.40],
    border: { type: "solid", color: HEX.hair, pt: 0.75 },
    margin: [0.05, 0.08, 0.05, 0.08],
    objectName: "registry-example",
  });

  /* мини-heatmap */
  const HM_X = M, HM_Y = 4.26, LBL_W = 1.12, CELL_W = 0.86, CELL_H = 0.30, CELL_G = 0.055;
  eyebrow(s, "МИНИ-HEATMAP: ВКЛАД ФАКТОРОВ", HM_X, HM_Y - 0.32, 5.6);
  const FACT_COLS = ["Отказ", "EOL", "Поставка", "Резерв", "Миграция"];
  FACT_COLS.forEach((f, i) => {
    s.addText(f, { x: HM_X + LBL_W + i * (CELL_W + CELL_G), y: HM_Y, w: CELL_W, h: 0.26,
      isTextBox: true, margin: 0, fontFace: FONT.data, fontSize: 8.5, color: C.text2,
      align: "center", valign: "middle" });
  });
  const HEAT = [
    ["PLC-01",   ["r", "r", "r", "r", "a"]],
    ["SERVO-04", ["r", "r", "a", "r", "a"]],
    ["HMI-02",   ["a", "a", "a", "g", "g"]],
    ["I/O-05",   ["a", "g", "g", "g", "g"]],
    ["VFD-03",   ["g", "g", "g", "a", "g"]],
  ];
  const HC = { g: HEX.green, a: HEX.amber, r: HEX.red };
  HEAT.forEach(([id, cells], ri) => {
    const y = HM_Y + 0.30 + ri * (CELL_H + CELL_G);
    s.addText(id, { x: HM_X, y, w: LBL_W - 0.08, h: CELL_H, isTextBox: true, margin: 0,
      fontFace: FONT.data, fontSize: 9, bold: true, color: HEX.graphite,
      align: "left", valign: "middle" });
    cells.forEach((c, ci) => {
      s.addShape(pres.ShapeType.rect, {
        x: HM_X + LBL_W + ci * (CELL_W + CELL_G), y, w: CELL_W, h: CELL_H,
        fill: { color: HC[c] }, line: { color: HEX.white, width: 1 },
        objectName: "heat-" + id + "-" + ci,
      });
    });
  });

  /* легенда и трактовка */
  const RX = M + LBL_W + 5 * (CELL_W + CELL_G) + 0.46;
  const RW = M + CW - RX;
  card(s, RX, HM_Y - 0.06, RW, 2.08);
  s.addText("Как читать карту", { x: RX + 0.24, y: HM_Y + 0.06, w: RW - 0.48, h: 0.28,
    isTextBox: true, margin: 0, fontFace: FONT.head, fontSize: 12, bold: true,
    color: C.text1, align: "left", valign: "middle" });
  const LEG = [["высокий риск — действовать сейчас", HEX.red],
               ["средний риск — планировать", HEX.amber],
               ["низкий риск — эксплуатировать как есть", HEX.green]];
  LEG.forEach(([t, col], i) => {
    const y = HM_Y + 0.42 + i * 0.32;
    s.addShape(pres.ShapeType.rect, { x: RX + 0.24, y: y + 0.055, w: 0.20, h: 0.20,
      fill: { color: col }, line: { width: 0 }, objectName: "legend-" + i });
    s.addText(t, { x: RX + 0.54, y, w: RW - 0.78, h: 0.30, isTextBox: true, margin: 0,
      fontFace: FONT.body, fontSize: 10.5, color: C.text1, align: "left", valign: "middle" });
  });
  s.addText("Балл и цвет говорят, с какой позиции начинать, а не предсказывают отказ. Строка становится задачей: держать запас, сделать backup, искать заранее, ремонтировать или готовить миграцию.", {
    x: RX + 0.24, y: HM_Y + 1.40, w: RW - 0.48, h: 0.58, isTextBox: true, margin: 0,
    fontFace: FONT.body, fontSize: 9.5, color: C.text2, align: "left", valign: "top",
    lineSpacingMultiple: 1.12 });

  s.addText("Условный пример. Обозначения обезличены. Фактические выводы формируются только после инвентаризации и проверки источников.", {
    x: M, y: 6.46, w: CW, h: 0.30, isTextBox: true, margin: 0,
    fontFace: FONT.data, fontSize: 9.5, bold: true, color: C.accent1,
    align: "left", valign: "middle" });

  s.addNotes(
    "Это главный слайд: так выглядит рабочий результат.\n" +
    "Обозначения PLC-01 … VFD-03 обезличены, данные условные — установленный парк «Акульчев» мы не знаем и не придумываем.\n" +
    "Полная таблица реестра содержит 19 полей, включая ревизию, backup, дату последней закупки и горизонт действия."
  );
}

/* ===================================================================== */
/* СЛАЙД 7 — что предприятие получает                                    */
/* ===================================================================== */
{
  const s = pres.addSlide({ masterName: "CONTENT", sectionTitle: "Результат" });
  s.addText("Что предприятие получает после пилота", { placeholder: "title" });

  const LW = 7.62;
  const DEL = [
    ["1", "Реестр компонентов линии", "10–20 позиций, 19 полей: производитель, модель, ревизия, статус жизненного цикла, EOL, критичность, резерв, backup, срок поставки, ремонт, преемник, сложность миграции, риск-балл, действие и его горизонт."],
    ["2", "Карта риска", "Что эксплуатировать без специальных действий, что держать в аварийном запасе, что искать заранее, где сделать backup, где проработать замену и где целесообразен проект миграции."],
    ["3", "План действий", "TOP-5 рискованных позиций, позиции для аварийного резерва, позиции без backup, кандидаты на миграцию и рекомендуемый порядок на 3 / 12 / 24 месяца."],
    ["4", "Перечень недостающих данных", "Чего не хватает для безопасной эксплуатации и миграции: версий прошивок, ревизий, backup программ и параметров, истории закупок и фактических сроков поставки."],
  ];
  const cw = (LW - 0.18) / 2, ch = 2.08;
  DEL.forEach(([n, head, body], i) => {
    const col = i % 2, row = Math.floor(i / 2);
    const x = M + col * (cw + 0.18), y = BODY_TOP + row * (ch + 0.18);
    card(s, x, y, cw, ch);
    badge(s, n, x + 0.24, y + 0.22, 0.36, HEX.copper, HEX.white, 12);
    s.addText(head, { x: x + 0.70, y: y + 0.20, w: cw - 0.94, h: 0.44, isTextBox: true, margin: 0,
      fontFace: FONT.head, fontSize: 12.5, bold: true, color: C.text1, align: "left", valign: "middle",
      lineSpacingMultiple: 1.05 });
    s.addText(body, { x: x + 0.24, y: y + 0.74, w: cw - 0.48, h: ch - 0.94, isTextBox: true, margin: 0,
      fontFace: FONT.body, fontSize: 10.5, color: C.text2, align: "left", valign: "top",
      lineSpacingMultiple: 1.18 });
  });

  const RX = M + LW + 0.30, RW = CW - LW - 0.30;
  placeImage(s, "s7", RX, BODY_TOP, RW, 2.54);
  card(s, RX, BODY_TOP + 2.70, RW, 1.64);
  s.addText([
    { text: "Если дадите данные закупок\n", options: { fontFace: FONT.head, fontSize: 11.5, bold: true, color: C.text1 } },
    { text: "в реестр попадут фактические сроки поставки и история доступности позиций — это самый сильный аргумент при расчёте аварийного запаса.",
      options: { fontFace: FONT.body, fontSize: 10.5, color: C.text2 } },
  ], { x: RX + 0.22, y: BODY_TOP + 2.70, w: RW - 0.44, h: 1.64, isTextBox: true, margin: 0,
       align: "left", valign: "middle", lineSpacingMultiple: 1.2 });

  s.addShape(pres.ShapeType.roundRect, { x: M, y: 5.94, w: CW, h: 0.64, rectRadius: 0.05,
    fill: { color: C.background2 }, line: { color: HEX.hair, width: 0.75 }, objectName: "after" });
  s.addText("Результат — рабочий инструмент службы АСУ ТП и КИПиА: не текстовый отчёт, а таблица, по которой можно планировать закупку, резерв и модернизацию.", {
    x: M + 0.28, y: 5.94, w: CW - 0.56, h: 0.64, isTextBox: true, margin: 0,
    fontFace: FONT.body, fontSize: 11.5, bold: true, color: C.text1, align: "left", valign: "middle" });

  s.addNotes(
    "Четыре осязаемых результата. Четвёртый — честный: аудит показывает и то, каких данных у предприятия нет.\n" +
    "Данные закупок не обязательны для пилота, но заметно усиливают расчёт резерва."
  );
}

/* ===================================================================== */
/* СЛАЙД 8 — пилот и CTA                                                 */
/* ===================================================================== */
pres.addSection({ title: "Пилот и условия" });
{
  const s = pres.addSlide({ masterName: "CONTENT_DARK", sectionTitle: "Пилот и условия" });
  s.addText("Пилот", { placeholder: "title" });

  const TILES = [["0 ₽", "стоимость пилота"], ["2–3 часа", "на площадке, ориентир"],
                 ["до 5", "рабочих дней на анализ"]];
  const tw = (CW - 2 * 0.22) / 3;
  TILES.forEach(([big, sub], i) => {
    const x = M + i * (tw + 0.22);
    s.addShape(pres.ShapeType.roundRect, { x, y: BODY_TOP, w: tw, h: 1.44, rectRadius: 0.06,
      fill: { color: i === 0 ? HEX.copper : "263241" },
      line: { color: i === 0 ? HEX.copper : "33414F", width: 0.75 }, objectName: "tile-" + i });
    s.addText(big, { x: x + 0.26, y: BODY_TOP + 0.16, w: tw - 0.52, h: 0.74, isTextBox: true,
      margin: 0, fontFace: FONT.head, fontSize: 34, bold: true, color: HEX.white,
      align: "left", valign: "middle" });
    s.addText(sub, { x: x + 0.26, y: BODY_TOP + 0.90, w: tw - 0.52, h: 0.38, isTextBox: true,
      margin: 0, fontFace: FONT.body, fontSize: 11.5,
      color: i === 0 ? "F6E3D2" : HEX.onDarkDim, align: "left", valign: "middle" });
  });

  const colW = (CW - 0.30) / 2;
  const LISTS = [
    ["ОБЪЁМ ПИЛОТА", [
      "одна линия или участок",
      "10–20 компонентов автоматики",
      "выезд на площадку и инвентаризация",
      "проверка жизненного цикла и доступности",
      "карта риска и рекомендации",
    ]],
    ["ЧТО НУЖНО ОТ ПРЕДПРИЯТИЯ", [
      "сопровождающий инженер АСУ ТП или КИПиА",
      "доступ к маркировке и шильдикам компонентов",
      "доступная эксплуатационная документация",
      "история закупок — при наличии и желании",
      "выбранная линия и согласованная дата",
    ]],
  ];
  LISTS.forEach(([head, items], i) => {
    const x = M + i * (colW + 0.30);
    const y = BODY_TOP + 1.70;
    eyebrow(s, head, x, y, colW, HEX.copperLt);
    s.addText(items.map((t, k) => ({
      text: t, options: { bullet: { code: "2022", indent: 14 }, breakLine: k < items.length - 1 },
    })), { x: x + 0.04, y: y + 0.34, w: colW - 0.08, h: 1.86, isTextBox: true, margin: 0,
           fontFace: FONT.body, fontSize: 12.5, color: HEX.panel,
           align: "left", valign: "top", paraSpaceAfter: 7 });
  });

  s.addShape(pres.ShapeType.roundRect, { x: M, y: 5.64, w: CW, h: 1.02, rectRadius: 0.06,
    fill: { color: HEX.copper }, line: { width: 0 }, objectName: "cta" });
  s.addText("Выбрать одну критичную линию и согласовать дату выезда", {
    x: M + 0.40, y: 5.64, w: CW - 0.80, h: 1.02, isTextBox: true, margin: 0,
    fontFace: FONT.head, fontSize: 22, bold: true, color: HEX.white,
    align: "left", valign: "middle" });

  s.addNotes(
    "Единственное действие, которое нужно от клиента на этой встрече: выбрать линию и дату.\n" +
    "Пилот бесплатный и ограничен по объёму — это не бессрочное обязательство ни для нас, ни для предприятия."
  );
}

/* ===================================================================== */
/* СЛАЙД 9 — что дальше                                                  */
/* ===================================================================== */
{
  const s = pres.addSlide({ masterName: "CONTENT", sectionTitle: "Пилот и условия" });
  s.addText("Что дальше, если результат полезен", { placeholder: "title" });

  const LW = 7.74;
  const TIERS = [
    ["A", "Одна линия", "100–150 тыс. ₽",
      "Расширенная инвентаризация, полный реестр, карта риска, план резервов и миграции."],
    ["B", "Участок или несколько линий", "200–300 тыс. ₽",
      "Несколько линий, объединённый реестр, приоритизация по участку, рекомендации по резерву и миграциям."],
    ["C", "Площадка", "400–500 тыс. ₽",
      "Расширенный парк автоматики, приоритетный реестр, дорожная карта и правила регулярного обновления."],
  ];
  let y = BODY_TOP;
  TIERS.forEach(([letter, name, price, body]) => {
    const h = 1.34;
    card(s, M, y, LW, h);
    badge(s, letter, M + 0.26, y + 0.24, 0.46, HEX.steel, HEX.white, 15);
    s.addText(name, { x: M + 0.86, y: y + 0.18, w: LW - 3.20, h: 0.34, isTextBox: true, margin: 0,
      fontFace: FONT.head, fontSize: 13, bold: true, color: C.text1, align: "left", valign: "middle" });
    s.addText(price, { x: LW + M - 2.32, y: y + 0.16, w: 2.06, h: 0.38, isTextBox: true, margin: 0,
      fontFace: FONT.head, fontSize: 16, bold: true, color: C.accent1, align: "right", valign: "middle" });
    s.addText(body, { x: M + 0.86, y: y + 0.58, w: LW - 1.12, h: 0.62, isTextBox: true, margin: 0,
      fontFace: FONT.body, fontSize: 10.5, color: C.text2, align: "left", valign: "top",
      lineSpacingMultiple: 1.15 });
    y += h + 0.14;
  });

  const RX = M + LW + 0.30, RW = CW - LW - 0.30;
  placeImage(s, "s9", RX, BODY_TOP, RW, 2.52);

  s.addShape(pres.ShapeType.roundRect, { x: RX, y: BODY_TOP + 2.68, w: RW, h: 1.62, rectRadius: 0.06,
    fill: { color: C.text1 }, line: { width: 0 }, objectName: "sequence" });
  s.addText([
    { text: "ПОРЯДОК\n", options: { fontFace: FONT.data, fontSize: 9.5, bold: true,
      charSpacing: 1.5, color: HEX.copperLt } },
    { text: "Бесплатный пилот\n", options: { fontFace: FONT.head, fontSize: 13, bold: true, color: HEX.white } },
    { text: "↓\n", options: { fontFace: FONT.data, fontSize: 12, color: HEX.onDarkDim } },
    { text: "Решение предприятия\n", options: { fontFace: FONT.head, fontSize: 13, bold: true, color: HEX.white } },
    { text: "↓\n", options: { fontFace: FONT.data, fontSize: 12, color: HEX.onDarkDim } },
    { text: "Платный этап и его объём", options: { fontFace: FONT.head, fontSize: 13, bold: true, color: HEX.white } },
  ], { x: RX + 0.24, y: BODY_TOP + 2.68, w: RW - 0.48, h: 1.62, isTextBox: true, margin: 0,
       align: "left", valign: "middle", lineSpacingMultiple: 1.04 });

  s.addText([
    { text: "Ориентир, а не оферта.  ", options: { bold: true, color: C.accent1 } },
    { text: "Точная стоимость зависит от количества компонентов, числа линий, доступности исходных данных и требуемой глубины анализа. Объём платного этапа определяется после пилота — по его фактическим результатам.",
      options: { color: C.text2 } },
  ], { x: M, y: 5.94, w: CW, h: 0.66, isTextBox: true, margin: 0,
       fontFace: FONT.body, fontSize: 10.5, align: "left", valign: "middle", lineSpacingMultiple: 1.12 });

  s.addNotes(
    "Три варианта — ориентир по порядку величины, чтобы предприятие понимало масштаб, а не оферта.\n" +
    "Главное сообщение: платный этап появляется только после пилота и только если его результат оказался полезным."
  );
}

/* ===================================================================== */
/* СЛАЙД 10 — приложение: источники                                      */
/* ===================================================================== */
pres.addSection({ title: "Приложение" });
{
  const s = pres.addSlide({ masterName: "DATA", sectionTitle: "Приложение" });
  s.addText("Приложение: источники", { placeholder: "title" });
  s.addText("Внешние факты, использованные в презентации. Ссылки приведены для проверки.", {
    x: M, y: 0.98, w: CW, h: 0.28, isTextBox: true, margin: 0,
    fontFace: FONT.body, fontSize: 11.5, color: C.text2, align: "left", valign: "middle" });

  const colW = (CW - 0.34) / 2;
  const GROUPS = [
    ["ФАКТЫ О «АКУЛЬЧЕВ»", [
      ["Интервью С. Акульчева, «Бизнес Online»", "business-gazeta.ru/article/619038", "уровень автоматизации 50% и план 80%; прекращение поддержки ПО западными компаниями; закупки оборудования в Германии, Швейцарии, Австрии, Италии; рост сроков и цен на запчасти"],
      ["Обзор пищепрома РТ под санкциями, «Бизнес Online»", "business-gazeta.ru/article/544823", "импортное оборудование: Австрия, Нидерланды, Франция, Италия, Германия; запас запчастей около полугода; логистика дороже примерно в 1,5 раза"],
      ["Профиль работодателя и вакансии техблока, hh.ru", "hh.ru/employer/22212 · hh.ru/vacancy/135152103", "две производственные площадки, более 800 сотрудников; наладка и ремонт оборудования, поиск причин раннего износа, профилактика поломок"],
      ["Восстановление производства после пожара, retail.ru", "retail.ru (пресс-релиз ТД «Акульчев»)", "79 млн ₽ на восстановление; закупка нового оборудования и автоматизация"],
      ["Покупка фабрики «Колос», «Бизнес Online» / «Коммерсантъ»", "business-gazeta.ru/article/690353 · kommersant.ru/doc/8293536", "95% ПТК «Колос» с ноября 2025 года; планы модернизации производства"],
    ]],
    ["МЕТОДИКА И РЫНОК", [
      ["ГОСТ Р 70383-2022", "elec.ru/library/gosts_e08/gost-r-70383-2022/", "реактивное, проактивное и стратегическое управление устареванием для промышленных предприятий"],
      ["ГОСТ Р 70370-2022", "protect.gost.ru", "требования к обмену данными об изменениях номенклатуры и прекращении производства"],
      ["Б1 — рынок промышленной автоматизации", "vedomosti.ru/technology/articles/2025/03/26/1100515", "83 млрд ₽ в 2024 году, прогноз 207 млрд ₽ к 2030 году"],
      ["Рынок АСУ ТП РФ", "vedomosti.ru/business/articles/2025/02/12/1091601", "124,1 млрд ₽ в 2024 году против 82,9 млрд ₽ в 2023-м"],
      ["Бенчмарки подхода: Radwell, Rockwell, EU Automation, ABB, Schneider Electric", "radwell.com/ALA · rockwellautomation.com · euautomation.com", "аудит установленной базы, риск устаревания, оптимизация ЗИП, lifecycle-статусы и миграционные программы"],
    ]],
  ];
  GROUPS.forEach(([head, items], gi) => {
    const x = M + gi * (colW + 0.34);
    eyebrow(s, head, x, 1.40, colW);
    let iy = 1.74;
    items.forEach(([t, url, what]) => {
      const h = 0.90;
      s.addText(t, { x, y: iy, w: colW, h: 0.26, isTextBox: true, margin: 0,
        fontFace: FONT.head, fontSize: 10, bold: true, color: C.text1, align: "left", valign: "middle" });
      s.addText(url, { x, y: iy + 0.24, w: colW, h: 0.22, isTextBox: true, margin: 0,
        fontFace: FONT.data, fontSize: 8.5, color: C.accent6, align: "left", valign: "middle" });
      s.addText(what, { x, y: iy + 0.45, w: colW, h: 0.42, isTextBox: true, margin: 0,
        fontFace: FONT.body, fontSize: 9, color: C.text2, align: "left", valign: "top",
        lineSpacingMultiple: 1.08 });
      iy += h;
    });
  });

  s.addShape(pres.ShapeType.roundRect, { x: M, y: 6.28, w: CW, h: 0.56, rectRadius: 0.05,
    fill: { color: C.background2 }, line: { color: HEX.hair, width: 0.75 }, objectName: "disclaimer" });
  s.addText([
    { text: "Границы достоверности.  ", options: { bold: true, color: C.accent1 } },
    { text: "Выше — публичные факты о предприятии и нормативно-рыночный контекст. Конкретный установленный парк автоматики «Акульчев» публично не подтверждён и в презентации не предполагается: он и является предметом инвентаризации.",
      options: { color: C.text1 } },
  ], { x: M + 0.26, y: 6.28, w: CW - 0.52, h: 0.56, isTextBox: true, margin: 0,
       fontFace: FONT.body, fontSize: 10, align: "left", valign: "middle" });

  s.addNotes(
    "Слайд-приложение. Нужен, чтобы инженер мог проверить каждый внешний факт.\n" +
    "Нижняя плашка отделяет подтверждённые факты от предлагаемой методики."
  );
}

/* --------------------------------------------------------------- сборка */
(async () => {
  await pres.writeFile({ fileName: OUT });
  await applyTheme(OUT, THEME);
  const missing = Object.values(IMG_MAP).filter((v) => !resolveImage(v.base));
  const total = Object.keys(IMG_MAP).length;
  console.log("Собрано: " + OUT);
  console.log("Фото подставлено: " + (total - missing.length) + " из " + total);
  if (missing.length) console.log("Ожидаются кадры: " + missing.map((m) => m.base).join(", "));
  const icons = ["plc", "hmi", "vfd", "servo", "io", "ipc"]
    .filter((i) => fs.existsSync(path.join(IMG_DIR, "icons", i + ".png")));
  console.log("Иконок компонентов подставлено: " + icons.length + " из 6");
})();
