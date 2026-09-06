const pptxgen = require('pptxgenjs');
const path = require('path');

const A = path.join(__dirname, 'assets');
const OUT = path.join(__dirname, 'Продай_за_меня_ОФИСЫ_клиентская.pptx');

// ---------- design tokens ----------
const W = 13.333, H = 7.5, M = 0.85, CW = W - 2 * M;
const INK='0C1D28', INK2='13252F', INK3='1A2F3B', CREAM='F7F1E7', GOLD='C89B45',
      GOLDL='D9BC7A', GOLDD='6E5426', MUTED='9CAAB1', MUTEDL='6F6A62', LINEL='DCD3C4',
      WHITE='FFFFFF';
const FF = 'Inter';

const pres = new pptxgen();
pres.defineLayout({ name: 'W16', width: W, height: H });
pres.layout = 'W16';
pres.author = 'Продай за меня';
pres.title  = 'Продай за меня — Офисы. Клиентская презентация';

// ---------- helpers (every call builds a fresh options object) ----------
const T = (s, text, o) => s.addText(text, Object.assign({ isTextBox: true, margin: 0, fontFace: FF, valign: 'top' }, o));
const R = (s, o) => s.addShape(pres.ShapeType.rect, Object.assign({}, o));
const RR = (s, o) => s.addShape(pres.ShapeType.roundRect, Object.assign({ rectRadius: 0.08 }, o));
const OV = (s, o) => s.addShape(pres.ShapeType.ellipse, Object.assign({}, o));
const IMG = (s, o) => s.addImage(Object.assign({}, o));
const ic = n => path.join(A, `ic-${n}.png`);

const navy  = () => { const s = pres.addSlide(); s.background = { path: path.join(A, 'tex-navy.jpg') };  return s; };
const cream = () => { const s = pres.addSlide(); s.background = { path: path.join(A, 'tex-cream.jpg') }; return s; };
// scrims are baked into these files, so no overlay rectangle is needed
const photo = f => { const s = pres.addSlide(); s.background = { path: path.join(A, f) }; return s; };

// eyebrow — small letterspaced gold caption
const eyebrow = (s, text, x, y, color = GOLD) =>
  T(s, text, { x, y, w: CW, h: 0.24, fontSize: 10.5, bold: true, color, charSpacing: 2.4 });

// discreet marker showing where a generated image goes
const slot = (s, code, x, y, w, h, note) => {
  RR(s, { x, y, w, h, fill: { color: INK2 }, line: { color: GOLDD, width: 1, dashType: 'dash' }, rectRadius: 0.06 });
  T(s, code, { x, y: y + h / 2 - 0.42, w, h: 0.34, align: 'center', valign: 'ctr', fontSize: 15, bold: true, color: GOLD, charSpacing: 3 });
  T(s, note, { x: x + 0.3, y: y + h / 2, w: w - 0.6, h: 0.5, align: 'center', valign: 'top', fontSize: 11, color: MUTED });
};
const chip = (s, code) => {
  RR(s, { x: W - 1.62, y: H - 0.62, w: 0.77, h: 0.3, fill: { color: INK2 }, line: { color: GOLDD, width: 0.75 }, rectRadius: 0.05 });
  T(s, code, { x: W - 1.62, y: H - 0.62, w: 0.77, h: 0.3, align: 'center', valign: 'ctr', fontSize: 10, bold: true, color: GOLD, charSpacing: 1.5 });
};

// ============================================================ 01 · COVER
{
  const s = photo('ph-P1-cover.jpg');
  IMG(s, { path: path.join(A, 'logo.png'), x: M, y: 0.55, w: 0.55, h: 0.55 });
  T(s, 'ПРОДАЙ ЗА МЕНЯ · КАЗАНЬ', { x: M + 0.75, y: 0.72, w: 5, h: 0.24, fontSize: 11, bold: true, color: CREAM, charSpacing: 2.6 });

  T(s, 'ОСВОБОДИМ\nОФИС\nПОД КЛЮЧ', {
    x: M, y: 1.72, w: 8.6, h: 2.85, fontSize: 50, bold: true, color: CREAM,
    lineSpacing: 54, charSpacing: -0.5 });

  R(s, { x: M, y: 4.95, w: 1.5, h: 0.035, fill: { color: GOLD } });
  T(s, 'ДЕНЬГИ ЗА ИМУЩЕСТВО', { x: M, y: 5.28, w: 9, h: 0.6, fontSize: 27, bold: true, color: GOLDL, charSpacing: 0.6 });
  T(s, 'ОДИН ПОДРЯДЧИК ВМЕСТО ДЕСЯТИ', { x: M, y: 6.12, w: 9, h: 0.36, fontSize: 15, color: MUTED, charSpacing: 2.2 });
}

// ============================================================ 02 · ПРОБЛЕМА
{
  const s = photo('ph-P2-problem.jpg');
  eyebrow(s, 'ОФИСНЫЙ ВЫЕЗД', M, 0.6);

  T(s, 'ЧТО ИЗ ОФИСА\nНЕ ПОЕДЕТ С ВАМИ?', {
    x: M, y: 1.12, w: 10.6, h: 2.1, fontSize: 44, bold: true, color: CREAM, lineSpacing: 48 });
  R(s, { x: M, y: 3.5, w: 1.4, h: 0.035, fill: { color: GOLD } });
  T(s, 'Что забираете — вы уже решили.\nОстальное осталось вашей задачей.', {
    x: M, y: 3.84, w: 6.4, h: 1.0, fontSize: 17, color: CREAM, lineSpacing: 26 });

  const trig = [
    ['ПЕРЕЕЗД', 'часть не влезет\nв новый офис'],
    ['СОКРАЩЕНИЕ', 'из 70 мест\nнужны 35'],
    ['ЗАКРЫТИЕ', 'нового помещения\nнет вообще'],
    ['ОБНОВЛЕНИЕ', 'старая мебель и ИТ\nвысвобождаются'],
  ];
  const cw = CW / 4;
  trig.forEach(([t, c], i) => {
    const x = M + i * cw;
    if (i > 0) R(s, { x: x - 0.16, y: 5.72, w: 0.01, h: 1.0, fill: { color: GOLDD } });
    T(s, t, { x, y: 5.7, w: cw - 0.35, h: 0.32, fontSize: 15, bold: true, color: GOLDL, charSpacing: 1.4 });
    T(s, c, { x, y: 6.12, w: cw - 0.35, h: 0.66, fontSize: 12.5, color: MUTED, lineSpacing: 17 });
  });
}

// ============================================================ 03 · ХВОСТ
{
  const s = photo('ph-P3-tail.jpg');
  eyebrow(s, 'ГЛАВНАЯ ПРОБЛЕМА ОФИСНОГО ВЫЕЗДА', M, 0.68, GOLDD);

  T(s, 'ПОСЛЕДНИЙ ШКАФ\nБЛОКИРУЕТ АКТ\nТАК ЖЕ, КАК ВЕСЬ ОФИС', {
    x: M, y: 1.16, w: 5.9, h: 2.4, fontSize: 32, bold: true, color: INK, lineSpacing: 40 });

  T(s, 'Ноутбуки и серверы уедут. Останется хвост:', {
    x: M, y: 3.42, w: 5.9, h: 0.34, fontSize: 15.5, color: MUTEDL });

  T(s, '12 столов · 17 кресел · 3 шкафа · 2 тумбы\nМФУ · микроволновка · стойка ресепшен\nковролин · доска · кабели · коробки', {
    x: M, y: 3.92, w: 5.7, h: 1.4, fontSize: 15, bold: true, color: INK, lineSpacing: 28 });

  R(s, { x: M, y: 5.66, w: 5.7, h: 0.012, fill: { color: LINEL } });
  T(s, 'По отдельности — терпимо.\nВместе — десятки решений и сорванный срок.', {
    x: M, y: 5.9, w: 5.9, h: 0.72, fontSize: 14, color: MUTEDL, lineSpacing: 20 });

}

// ============================================================ 04 · ТРИ ПУТИ
{
  const s = navy();
  R(s, { x: 0, y: 0, w: W, h: H, fill: { color: INK, transparency: 15 } });
  T(s, 'ТРИ ПУТИ', { x: M, y: 0.62, w: 6, h: 0.7, fontSize: 38, bold: true, color: CREAM });
  T(s, 'После решения «что забираем» вариантов ровно три', {
    x: M, y: 1.34, w: 8, h: 0.34, fontSize: 15, color: MUTED });

  const colW = (CW - 2 * 0.5) / 3, pitch = colW + 0.5;
  const cols = [
    ['ill-vyvezti.png', 'ВЫВЕЗТИ ВСЁ',     'Заплатить за вывоз\nи не вернуть ничего', false],
    ['ill-sami.png',    'ПРОДАВАТЬ САМИМ', 'Опись, фото, объявления, звонки,\nпоказы — и хвост к дедлайну', false],
    ['ill-nam.png',     'ОТДАТЬ НАМ',      'Помещение пустое к дате\nи деньги за всё ликвидное', true],
  ];
  cols.forEach(([img, title, cap, hi], i) => {
    const x = M + i * pitch;
    if (hi) RR(s, { x: x - 0.13, y: 1.86, w: colW + 0.26, h: 4.12, fill: { color: INK3, transparency: 30 }, line: { color: GOLD, width: 1.25 }, rectRadius: 0.06 });
    IMG(s, { path: path.join(A, img), x: x + (colW - 2.5) / 2, y: 2.02, w: 2.5, h: 2.5 });
    T(s, title, { x, y: 4.72, w: colW, h: 0.36, align: 'center', fontSize: 17, bold: true, color: hi ? GOLDL : CREAM, charSpacing: 0.8 });
    T(s, cap, { x, y: 5.22, w: colW, h: 0.8, align: 'center', fontSize: 13, color: MUTED, lineSpacing: 18 });
  });

  RR(s, { x: M, y: 6.55, w: CW, h: 0.6, fill: { color: INK3 }, line: { color: GOLDD, width: 1 }, rectRadius: 0.05 });
  T(s, 'ПОСЧИТАЕМ ЭТИ ТРИ ПУТИ ДЛЯ ВАШЕГО ОФИСА — В ДЕНЬГАХ И В ЧАСАХ ВАШИХ СОТРУДНИКОВ', {
    x: M, y: 6.72, w: CW, h: 0.28, align: 'center', fontSize: 12.5, bold: true, color: GOLDL, charSpacing: 1.2 });
}

// ============================================================ 05 · КАК ЭТО РАБОТАЕТ
{
  const s = cream();
  eyebrow(s, 'ПРОЦЕСС', M, 0.62, GOLDD);
  T(s, 'КАК ЭТО РАБОТАЕТ', { x: M, y: 1.02, w: 8, h: 0.7, fontSize: 38, bold: true, color: INK });

  const steps = [
    ['video',     '01', 'ВИДЕО\nИ ДАТА',        'видео офиса на 3–5 минут\nи дата освобождения'],
    ['clipboard', '02', 'ОПИСЬ\nИ МАРШРУТ',     'по каждой позиции:\nпродать, вывезти\nили утилизировать'],
    ['users',     '03', 'ТЕНДЕР\nПОКУПАТЕЛЕЙ',  'ИТ, мебель и техника —\nотдельно, по профильным\nпокупателям'],
    ['truck',     '04', 'ВЫВОЗ\nК ДАТЕ',        'демонтаж, пропуска,\nгрузовой лифт, машины'],
    ['filetext',  '05', 'ОТЧЁТ\nИ ДОКУМЕНТЫ',   'кому продано, за сколько,\nчто утилизировано'],
  ];
  const cw = (CW - 4 * 0.22) / 5, pitch = cw + 0.22, cy = 2.46, d = 0.92;

  R(s, { x: M + cw / 2, y: cy + d / 2, w: CW - cw, h: 0.012, fill: { color: LINEL } });

  steps.forEach(([icon, num, title, cap], i) => {
    const x = M + i * pitch, cx = x + cw / 2 - d / 2;
    OV(s, { x: cx, y: cy, w: d, h: d, fill: { color: CREAM }, line: { color: GOLD, width: 1.4 } });
    IMG(s, { path: ic(icon), x: cx + 0.245, y: cy + 0.245, w: 0.43, h: 0.43 });
    T(s, num, { x, y: cy + d + 0.26, w: cw, h: 0.24, align: 'center', fontSize: 12, bold: true, color: GOLD, charSpacing: 1.6 });
    T(s, title, { x, y: cy + d + 0.62, w: cw, h: 0.66, align: 'center', fontSize: 13.5, bold: true, color: INK, lineSpacing: 19 });
    T(s, cap, { x, y: cy + d + 1.42, w: cw, h: 0.86, align: 'center', fontSize: 11.5, color: MUTEDL, lineSpacing: 16.5 });
  });

  RR(s, { x: M, y: 6.34, w: CW, h: 0.78, fill: { color: INK }, rectRadius: 0.06 });
  T(s, 'ВАШЕ УЧАСТИЕ — ДО 90 МИНУТ ЗА ВЕСЬ ПРОЕКТ', {
    x: M, y: 6.34, w: CW, h: 0.78, align: 'center', valign: 'ctr', fontSize: 17, bold: true, color: CREAM, charSpacing: 1.6 });
}

// ============================================================ 06 · ДВА ФОРМАТА
{
  const s = navy();
  R(s, { x: 0, y: 0, w: W, h: H, fill: { color: INK, transparency: 12 } });
  eyebrow(s, 'ТАРИФЫ', M, 0.6);
  T(s, 'ДВА ФОРМАТА', { x: M, y: 0.98, w: 8, h: 0.7, fontSize: 38, bold: true, color: CREAM });
  T(s, 'Выбираете по одному признаку: есть ли жёсткая дата освобождения', {
    x: M, y: 1.7, w: 9, h: 0.34, fontSize: 14.5, color: MUTED });

  const cardW = (CW - 0.33) / 2, cy = 2.24, ch = 4.05;
  const cards = [
    ['ФОРМАТ A', 'ПРОДАЖА ИЗ ОФИСА', '10 000 ₽ + 25%', 'shoppingbag', false,
      ['Имущество остаётся у вас до продажи', 'Оценка, лоты, объявления, покупатели, выдача', 'Подходит, когда срок не горит']],
    ['ФОРМАТ B · РЕКОМЕНДУЕМ', 'ОСВОБОЖДЕНИЕ ПОД КЛЮЧ', '25 000 ₽ + 35%', 'key', true,
      ['Помещение свободно к согласованной дате', 'Демонтаж, вывоз, хранение и реализация', 'Продаём дальше без вашего участия']],
  ];
  cards.forEach(([eb, title, price, icon, hi, bullets], i) => {
    const x = M + i * (cardW + 0.33);
    RR(s, { x, y: cy, w: cardW, h: ch, fill: { color: INK3, transparency: hi ? 15 : 45 },
            line: { color: hi ? GOLD : GOLDD, width: hi ? 1.5 : 1 }, rectRadius: 0.05 });
    IMG(s, { path: ic(icon), x: x + 0.45, y: cy + 0.42, w: 0.44, h: 0.44 });
    T(s, eb, { x: x + 1.05, y: cy + 0.52, w: cardW - 1.5, h: 0.26, fontSize: 10.5, bold: true, color: hi ? GOLD : MUTED, charSpacing: 2 });
    T(s, title, { x: x + 0.45, y: cy + 1.06, w: cardW - 0.9, h: 0.72, fontSize: 21, bold: true, color: CREAM, lineSpacing: 26 });
    T(s, price, { x: x + 0.45, y: cy + 1.88, w: cardW - 0.9, h: 0.55, fontSize: 30, bold: true, color: hi ? GOLDL : CREAM });
    T(s, 'от суммы продаж', { x: x + 0.45, y: cy + 2.42, w: cardW - 0.9, h: 0.26, fontSize: 12, color: MUTED });
    R(s, { x: x + 0.45, y: cy + 2.86, w: cardW - 0.9, h: 0.012, fill: { color: GOLDD } });
    bullets.forEach((b, j) => {
      OV(s, { x: x + 0.47, y: cy + 3.13 + j * 0.33, w: 0.07, h: 0.07, fill: { color: GOLD } });
      T(s, b, { x: x + 0.72, y: cy + 3.05 + j * 0.33, w: cardW - 1.2, h: 0.28, fontSize: 12.5, color: CREAM });
    });
  });

  T(s, 'ДЕНЬГИ ЗА ИМУЩЕСТВО ПРИХОДЯТ НАПРЯМУЮ ВАШЕЙ КОМПАНИИ', {
    x: M, y: 6.66, w: CW, h: 0.32, align: 'center', fontSize: 13.5, bold: true, color: GOLDL, charSpacing: 1.6 });
}

// ============================================================ 07 · ТРИ ПУТИ В ДЕНЬГАХ
{
  const s = cream();
  eyebrow(s, 'ПРИМЕР · ОФИС 300 м², 25 РАБОЧИХ МЕСТ, ОСВОБОДИТЬ ЗА 5 ДНЕЙ', M, 0.58, GOLDD);
  T(s, 'ТЕ ЖЕ ТРИ ПУТИ — В ДЕНЬГАХ И ЧАСАХ', {
    x: M, y: 0.92, w: 11.4, h: 0.72, fontSize: 36, bold: true, color: INK });

  RR(s, { x: M, y: 1.8, w: 7.3, h: 0.58, fill: { color: WHITE }, line: { color: LINEL, width: 1 }, rectRadius: 0.05 });
  T(s, 'ЛИКВИДНОЕ ИМУЩЕСТВО ПО ОЦЕНКЕ', {
    x: M + 0.34, y: 1.8, w: 4.5, h: 0.58, valign: 'ctr', fontSize: 11, bold: true, color: MUTEDL, charSpacing: 1.2 });
  T(s, '420 000 ₽', { x: M + 4.9, y: 1.8, w: 2.1, h: 0.58, valign: 'ctr', align: 'right', fontSize: 19, bold: true, color: INK });

  const cw = (CW - 2 * 0.3) / 3, pitch = cw + 0.3, cy = 2.62, ch = 3.5;
  const cards = [
    ['A', 'ВЫВЕЗТИ ВСЁ',    '− 28 000 ₽',  MUTEDL, '~ 1 день',    'Демонтаж, машины\nи утилизация — за ваш счёт.\nЛиквидное уезжает в мусор.', false],
    ['B', 'ПРОДАТЬ САМИМ',  '+ 73 000 ₽',  INK,    '~ 30 часов',  'ИТ — одним лотом за полцены.\nМебель и кухня — на вывоз\nза 22 000 ₽.', false],
    ['C', 'ОТДАТЬ НАМ',     '+ 248 000 ₽', GOLDL,  'до 90 минут', 'Продано 420 000 ₽\nминус наша услуга 172 000 ₽\n(25 000 ₽ + 35%).', true],
  ];
  cards.forEach(([letter, title, money, moneyColor, time, note, hi], i) => {
    const x = M + i * pitch;
    RR(s, { x, y: cy, w: cw, h: ch, fill: { color: hi ? INK : WHITE }, line: { color: hi ? INK : LINEL, width: 1 }, rectRadius: 0.05 });
    T(s, letter, { x: x + 0.42, y: cy + 0.34, w: 0.4, h: 0.26, fontSize: 11, bold: true, color: hi ? GOLD : GOLDD, charSpacing: 1.4 });
    T(s, title, { x: x + 0.86, y: cy + 0.34, w: cw - 1.28, h: 0.26, fontSize: 11, bold: true, color: hi ? GOLD : GOLDD, charSpacing: 1.4 });
    T(s, money, { x: x + 0.42, y: cy + 0.82, w: cw - 0.84, h: 0.62, fontSize: 31, bold: true, color: moneyColor });
    R(s, { x: x + 0.42, y: cy + 1.66, w: cw - 0.84, h: 0.012, fill: { color: hi ? GOLDD : LINEL } });
    T(s, 'ВАШЕ ВРЕМЯ', { x: x + 0.42, y: cy + 1.88, w: cw - 0.84, h: 0.24, fontSize: 10, bold: true, color: hi ? MUTED : MUTEDL, charSpacing: 1.6 });
    T(s, time, { x: x + 0.42, y: cy + 2.18, w: cw - 0.84, h: 0.34, fontSize: 17, bold: true, color: hi ? CREAM : INK });
    T(s, note, { x: x + 0.42, y: cy + 2.6, w: cw - 0.84, h: 0.78, fontSize: 11, color: hi ? MUTED : MUTEDL, lineSpacing: 15.5 });
  });

  T(s, 'Пример по референсному объекту. Цены на б/у имущество и объём работ считаем по вашему видео.', {
    x: M, y: 6.42, w: CW, h: 0.3, fontSize: 12, italic: true, color: MUTEDL });
}

// ============================================================ 08 · ИТ ОТДЕЛЬНО
{
  const s = navy();
  R(s, { x: 0, y: 0, w: W, h: H, fill: { color: INK, transparency: 12 } });
  eyebrow(s, 'ИТ И ДАННЫЕ', M, 0.6);
  T(s, 'ТЕХНИКУ НЕ ОТДАЁМ\nОДНИМ ЛОТОМ С МЕБЕЛЬЮ', {
    x: M, y: 0.98, w: 10.5, h: 1.6, fontSize: 36, bold: true, color: CREAM, lineSpacing: 42 });

  const cw = (CW - 2 * 0.22) / 3, pitch = cw + 0.22, cy = 2.92, ch = 2.9;
  const cards = [
    ['server', 'ОТДЕЛЬНАЯ ОЦЕНКА', 'Минимум 2–3 котировки на ИТ.\nApple — вне общего офисного лота.'],
    ['shield', 'ДАННЫЕ',           'Учётные записи отвязываются,\nнакопители стираются или изымаются\nдо передачи техники.'],
    ['hash',   'УЧЁТ',             'Серийные номера фиксируются\nдо вывоза и попадают в отчёт.'],
  ];
  cards.forEach(([icon, title, cap], i) => {
    const x = M + i * pitch;
    RR(s, { x, y: cy, w: cw, h: ch, fill: { color: INK3, transparency: 35 }, line: { color: GOLDD, width: 1 }, rectRadius: 0.05 });
    IMG(s, { path: ic(icon), x: x + 0.42, y: cy + 0.42, w: 0.48, h: 0.48 });
    T(s, title, { x: x + 0.42, y: cy + 1.14, w: cw - 0.84, h: 0.32, fontSize: 16, bold: true, color: GOLDL, charSpacing: 1 });
    T(s, cap, { x: x + 0.42, y: cy + 1.62, w: cw - 0.84, h: 1.0, fontSize: 12.5, color: CREAM, lineSpacing: 18 });
  });

  T(s, 'Что можно отчуждать — вы подтверждаете письменно. До этого техника не публикуется.', {
    x: M, y: 6.34, w: CW, h: 0.32, fontSize: 13.5, color: MUTED });
}

// ============================================================ 09 · РЕЕСТР
{
  const s = cream();
  eyebrow(s, 'ПРОЗРАЧНОСТЬ', M, 0.72, GOLDD);
  T(s, 'КАЖДАЯ ПОЗИЦИЯ\nЗАФИКСИРОВАНА', {
    x: M, y: 1.14, w: 5.7, h: 1.6, fontSize: 36, bold: true, color: INK, lineSpacing: 42 });
  T(s, 'Состояние, стартовая и минимальная цена\nфиксируются до старта продаж.\nВы видите статус каждой позиции.', {
    x: M, y: 3.06, w: 5.5, h: 1.2, fontSize: 15.5, color: MUTEDL, lineSpacing: 24 });

  RR(s, { x: M, y: 5.06, w: 5.7, h: 1.24, fill: { color: INK }, rectRadius: 0.06 });
  IMG(s, { path: ic('checkcircle'), x: M + 0.38, y: 5.5, w: 0.4, h: 0.4 });
  T(s, 'НИЖЕ МИНИМАЛЬНОЙ ЦЕНЫ —\nТОЛЬКО С ВАШЕГО СОГЛАСИЯ', {
    x: M + 0.98, y: 5.4, w: 4.5, h: 0.62, fontSize: 14, bold: true, color: CREAM, lineSpacing: 19 });

  // card
  const cx = 7.1, cwd = 5.38;
  RR(s, { x: cx, y: 0.85, w: cwd, h: 5.8, fill: { color: WHITE }, line: { color: LINEL, width: 1 }, rectRadius: 0.05 });
  T(s, 'КАРТОЧКА ПОЗИЦИИ', { x: cx + 0.42, y: 1.2, w: 3, h: 0.26, fontSize: 10.5, bold: true, color: GOLDD, charSpacing: 1.6 });
  RR(s, { x: cx + cwd - 1.32, y: 1.15, w: 0.9, h: 0.3, fill: { color: 'EFE7DA' }, rectRadius: 0.05 });
  T(s, 'ПРИМЕР', { x: cx + cwd - 1.32, y: 1.21, w: 0.9, h: 0.22, align: 'center', fontSize: 9.5, bold: true, color: MUTEDL, charSpacing: 1 });

  IMG(s, { path: path.join(A, 'ph-P8-chair.jpg'), x: cx + 0.42, y: 1.66, w: cwd - 0.84, h: 1.72 });
  RR(s, { x: cx + 0.42, y: 1.66, w: cwd - 0.84, h: 1.72, fill: { color: WHITE, transparency: 100 }, line: { color: LINEL, width: 1 }, rectRadius: 0.04 });

  T(s, 'Кресло эргономичное, сетка · 17 шт', {
    x: cx + 0.42, y: 3.54, w: cwd - 0.84, h: 0.36, fontSize: 16, bold: true, color: INK });

  const rows = [['Зона', 'Open space · Z02'], ['Состояние', 'Хорошее'], ['Стартовая цена', '6 500 ₽ / шт'], ['Минимальная цена', '4 000 ₽ / шт']];
  rows.forEach(([k, v], i) => {
    const y = 4.06 + i * 0.44;
    T(s, k, { x: cx + 0.42, y, w: 2.2, h: 0.28, fontSize: 12.5, color: MUTEDL });
    T(s, v, { x: cx + 2.62, y, w: cwd - 3.04, h: 0.28, align: 'right', fontSize: 12.5, bold: true, color: INK });
    R(s, { x: cx + 0.42, y: y + 0.33, w: cwd - 0.84, h: 0.01, fill: { color: 'EFE7DA' } });
  });

  RR(s, { x: cx + 0.42, y: 5.96, w: 1.66, h: 0.36, fill: { color: INK }, rectRadius: 0.05 });
  T(s, 'В ПРОДАЖЕ', { x: cx + 0.42, y: 6.03, w: 1.66, h: 0.24, align: 'center', fontSize: 10.5, bold: true, color: GOLDL, charSpacing: 1.2 });
}

// ============================================================ 10 · ДЕДЛАЙН
{
  const s = navy();
  R(s, { x: 0, y: 0, w: W, h: H, fill: { color: INK, transparency: 12 } });
  eyebrow(s, 'ПОСЛЕ ВЫВОЗА', M, 0.62);
  T(s, 'ПОМЕЩЕНИЕ\nБОЛЬШЕ\nНЕ ЗАВИСИТ\nОТ ПРОДАЖ', {
    x: M, y: 1.16, w: 5.3, h: 3.5, fontSize: 34, bold: true, color: CREAM, lineSpacing: 44 });
  T(s, 'Дата освобождения не зависит\nот того, успел ли продаться\nпоследний стол.', {
    x: M, y: 5.24, w: 5.0, h: 1.0, fontSize: 14, color: MUTED, lineSpacing: 21 });

  const rx = 6.6, rw = W - M - rx;
  const rows = [
    ['truck',       'ВЫВОЗИМ', 'согласованное имущество уезжает к вашей дате'],
    ['tag',         'ПРОДАЁМ', 'дальше работаем с покупателями без вашего участия'],
    ['checkcircle', 'ОСТАТОК', 'финальный маршрут согласован заранее: передача, вторсырьё или утилизация'],
  ];
  rows.forEach(([icon, title, cap], i) => {
    const y = 1.42 + i * 1.78;
    RR(s, { x: rx, y, w: rw, h: 1.5, fill: { color: INK3, transparency: 35 }, line: { color: GOLDD, width: 1 }, rectRadius: 0.05 });
    IMG(s, { path: ic(icon), x: rx + 0.42, y: y + 0.5, w: 0.5, h: 0.5 });
    T(s, title, { x: rx + 1.2, y: y + 0.34, w: rw - 1.65, h: 0.3, fontSize: 16, bold: true, color: GOLDL, charSpacing: 1.4 });
    T(s, cap, { x: rx + 1.2, y: y + 0.72, w: rw - 1.65, h: 0.62, fontSize: 12.5, color: CREAM, lineSpacing: 18 });
  });
}

// ============================================================ 11 · БЦ И ДОКУМЕНТЫ
{
  const s = cream();
  eyebrow(s, 'КОРПОРАТИВНЫЙ КОНТУР', M, 0.62, GOLDD);
  T(s, 'ВЫЕЗД И ДОКУМЕНТЫ БЕЗ СЮРПРИЗОВ', {
    x: M, y: 1.0, w: 11.3, h: 0.72, fontSize: 36, bold: true, color: INK });

  const cwd = (CW - 0.33) / 2, cy = 2.06, ch = 3.86;
  const cols = [
    ['briefcase', 'ВЫЕЗД ПО ПРАВИЛАМ БЦ', ['согласование дня и времени вывоза', 'пропуска и материальные пропуска', 'грузовой лифт и маршрут движения', 'защита лифтов, стен и пола', 'уборка помещения после вывоза']],
    ['folder',    'ДОКУМЕНТЫ ДЛЯ БУХГАЛТЕРИИ', ['реестр имущества с маршрутом каждой позиции', 'кому и за сколько продано', 'акты на вывоз и утилизацию', 'итоговый отчёт по проекту']],
  ];
  cols.forEach(([icon, title, items], i) => {
    const x = M + i * (cwd + 0.33);
    RR(s, { x, y: cy, w: cwd, h: ch, fill: { color: WHITE }, line: { color: LINEL, width: 1 }, rectRadius: 0.05 });
    IMG(s, { path: ic(icon + '-ink'), x: x + 0.45, y: cy + 0.42, w: 0.44, h: 0.44 });
    T(s, title, { x: x + 1.08, y: cy + 0.5, w: cwd - 1.5, h: 0.34, fontSize: 15.5, bold: true, color: INK, charSpacing: 0.8 });
    R(s, { x: x + 0.45, y: cy + 1.16, w: cwd - 0.9, h: 0.012, fill: { color: LINEL } });
    items.forEach((it, j) => {
      const y = cy + 1.42 + j * 0.48;
      OV(s, { x: x + 0.47, y: y + 0.11, w: 0.08, h: 0.08, fill: { color: GOLD } });
      T(s, it, { x: x + 0.76, y, w: cwd - 1.24, h: 0.32, fontSize: 13, color: INK });
    });
  });

  RR(s, { x: M, y: 6.2, w: CW, h: 0.72, fill: { color: INK }, rectRadius: 0.06 });
  T(s, 'СОБСТВЕННИК ИМУЩЕСТВА — ВАША КОМПАНИЯ. МЫ ПОЛУЧАЕМ ОПЛАТУ ЗА УСЛУГУ.', {
    x: M, y: 6.42, w: CW, h: 0.3, align: 'center', fontSize: 14, bold: true, color: CREAM, charSpacing: 1.4 });
}

// ============================================================ 12 · СТАРТ В 2 ШАГА
{
  const s = navy();
  R(s, { x: 0, y: 0, w: W, h: H, fill: { color: INK, transparency: 12 } });
  eyebrow(s, 'НАЧАЛО', M, 0.66);
  T(s, 'СТАРТ В 2 ШАГА', { x: M, y: 1.04, w: 8, h: 0.76, fontSize: 40, bold: true, color: CREAM });

  const steps = [
    ['01', 'ПРИШЛИТЕ', '3–5 минут видео офиса\nи дату освобождения'],
    ['02', 'ПОЛУЧИТЕ', 'маршрут имущества\nи предварительный расчёт'],
  ];
  steps.forEach(([n, t, c], i) => {
    const y = 2.62 + i * 1.98;
    OV(s, { x: M, y, w: 0.76, h: 0.76, fill: { color: INK3 }, line: { color: GOLD, width: 1.4 } });
    T(s, n, { x: M, y: y + 0.2, w: 0.76, h: 0.36, align: 'center', fontSize: 16, bold: true, color: GOLDL });
    T(s, t, { x: M + 1.12, y: y + 0.02, w: 5.4, h: 0.4, fontSize: 21, bold: true, color: CREAM, charSpacing: 1.2 });
    T(s, c, { x: M + 1.12, y: y + 0.52, w: 5.6, h: 0.66, fontSize: 15, color: MUTED, lineSpacing: 21 });
  });

  RR(s, { x: 8.07, y: 2.56, w: 4.41, h: 3.28, fill: { color: INK3, transparency: 20 }, line: { color: GOLD, width: 1.5 }, rectRadius: 0.06 });
  IMG(s, { path: ic('play'), x: 8.07 + (4.41 - 0.68) / 2, y: 3.06, w: 0.68, h: 0.68 });
  T(s, 'БЕСПЛАТНАЯ\nПРЕДВАРИТЕЛЬНАЯ\nОЦЕНКА ПО ВИДЕО', {
    x: 8.37, y: 4.14, w: 3.81, h: 1.3, align: 'center', fontSize: 19, bold: true, color: CREAM, lineSpacing: 26 });

  T(s, 'Отдельная большая инвентаризация до первичной оценки не нужна.', {
    x: M, y: 6.62, w: CW, h: 0.3, fontSize: 13, color: MUTED });
}

// ============================================================ 13 · FAQ
{
  const s = cream();
  eyebrow(s, 'ЧТО ОБЫЧНО СПРАШИВАЮТ', M, 0.56, GOLDD);
  T(s, 'ЧАСТЫЕ ВОПРОСЫ', { x: M, y: 0.92, w: 8, h: 0.7, fontSize: 36, bold: true, color: INK });

  const qs = [
    ['01', 'Кому идут деньги за имущество?', 'Напрямую вашей компании. Мы получаем оплату за услугу.'],
    ['02', 'Что с непроданным?', 'Финальный маршрут согласуем заранее: передача, вторсырьё или утилизация.'],
    ['03', 'А данные на технике?', 'Учётки отвязываем, накопители стираем или изымаем до передачи.'],
    ['04', 'Можно задать минимальные цены?', 'Да. Фиксируем до старта продаж, ниже — только с вашего согласия.'],
    ['05', 'Работаете с юрлицами?', 'Договор, счёт, безналичный расчёт и закрывающие документы.'],
    ['06', 'Имущество на балансе или в лизинге?', 'Сначала разложим, чем компания вправе распоряжаться, и только потом публикуем.'],
  ];
  const colW = (CW - 0.65) / 2;
  qs.forEach(([n, q, a], i) => {
    const x = M + (i % 2) * (colW + 0.65);
    const y = 1.94 + Math.floor(i / 2) * 1.72;
    T(s, n, { x, y, w: 0.5, h: 0.28, fontSize: 12, bold: true, color: GOLD, charSpacing: 1.4 });
    T(s, q, { x: x + 0.58, y: y - 0.04, w: colW - 0.58, h: 0.66, fontSize: 15.5, bold: true, color: INK, lineSpacing: 21 });
    T(s, a, { x: x + 0.58, y: y + 0.68, w: colW - 0.58, h: 0.66, fontSize: 13, color: MUTEDL, lineSpacing: 18 });
    R(s, { x, y: y + 1.44, w: colW, h: 0.012, fill: { color: LINEL } });
  });
}

// ============================================================ 14 · CTA
{
  const s = photo('ph-P7-cta.jpg');
  IMG(s, { path: path.join(A, 'logo.png'), x: M, y: 0.5, w: 0.5, h: 0.5 });
  T(s, 'ПРОДАЙ ЗА МЕНЯ', { x: M + 0.7, y: 0.52, w: 5, h: 0.24, fontSize: 11.5, bold: true, color: CREAM, charSpacing: 2.4 });
  T(s, 'Освобождение офиса под ключ · Казань', { x: M + 0.7, y: 0.78, w: 5, h: 0.22, fontSize: 10.5, color: MUTED });

  T(s, 'ПРИШЛИТЕ\nВИДЕО ОФИСА', {
    x: M, y: 1.72, w: 6.2, h: 1.7, fontSize: 44, bold: true, color: CREAM, lineSpacing: 50 });
  R(s, { x: M, y: 3.66, w: 1.5, h: 0.035, fill: { color: GOLD } });
  T(s, 'БЕСПЛАТНО ОЦЕНИМ,\nЧТО МОЖНО ВЕРНУТЬ ДЕНЬГАМИ', {
    x: M, y: 3.98, w: 6.0, h: 0.9, fontSize: 19, bold: true, color: GOLDL, lineSpacing: 27 });

  IMG(s, { path: ic('phone'), x: M, y: 5.44, w: 0.34, h: 0.34 });
  T(s, '+7 965 595-99-97', { x: M + 0.58, y: 5.42, w: 4.4, h: 0.38, fontSize: 19, bold: true, color: CREAM });
  IMG(s, { path: ic('mail'), x: M, y: 6.16, w: 0.34, h: 0.34 });
  T(s, 'ODRybakov@mail.ru', { x: M + 0.58, y: 6.15, w: 4.4, h: 0.38, fontSize: 17, color: CREAM });

  const cardW = 2.32, gap = 0.42, x0 = 7.26 + ((W - M - 7.26) - (2 * cardW + gap)) / 2, cardY = 2.72, qs = 1.72;
  [['TELEGRAM', 'qr-telegram.png', 'send'], ['WHATSAPP', 'qr-whatsapp.png', 'messagecircle']].forEach(([lab, qr, icon], i) => {
    const x = x0 + i * (cardW + gap);
    RR(s, { x, y: cardY, w: cardW, h: 3.02, fill: { color: INK }, line: { color: GOLDD, width: 1 }, rectRadius: 0.06 });
    IMG(s, { path: ic(icon), x: x + cardW / 2 - 0.19, y: cardY + 0.26, w: 0.38, h: 0.38 });
    IMG(s, { path: path.join(A, qr), x: x + (cardW - qs) / 2, y: cardY + 0.78, w: qs, h: qs });
    T(s, lab, { x, y: cardY + 2.62, w: cardW, h: 0.28, align: 'center', fontSize: 12.5, bold: true, color: GOLDL, charSpacing: 2 });
  });
  RR(s, { x: x0, y: 5.98, w: 2 * cardW + gap, h: 0.46, fill: { color: INK, transparency: 12 }, rectRadius: 0.06 });
  T(s, 'Наведите камеру — напишите нам в мессенджер', {
    x: x0, y: 5.98, w: 2 * cardW + gap, h: 0.46, align: 'center', valign: 'ctr', fontSize: 12.5, color: CREAM });
}

pres.writeFile({ fileName: OUT }).then(() => console.log('WROTE', OUT));
