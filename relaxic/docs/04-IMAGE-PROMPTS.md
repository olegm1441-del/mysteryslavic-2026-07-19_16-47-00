# Relaxic — промты для генерации всех изображений

Всё, что нужно сгенерировать для сайта. Складывать в `public/img/<раздел>/<имя>`.

---

## Как пользоваться

1. Промты даны **на английском** — DALL·E и Midjourney на нём заметно точнее,
   особенно в описании света и материала. Русский дублируется только там, где важен сюжет.
2. **На всех изображениях не должно быть текста.** Нейросети пишут кириллицу с ошибками.
   Весь текст кладётся вёрсткой поверх.
3. После генерации: сжать в **AVIF + WebP** (`squoosh.app` или `sharp`), под каждый размер.
   Исходники хранить отдельно, в репозиторий не класть.
4. Имена файлов — латиницей, строчными, через дефис, ровно как указано.

### Общий стилевой хвост
Добавлять в конец каждого промта, где не сказано иначе:

```
warm cinematic lighting, soft natural shadows, shallow depth of field,
muted warm color grading, dark warm charcoal background (#141110),
photorealistic, no text, no watermark, no logo, no people looking at camera
```

### Негативный промт
```
text, letters, watermark, logo, oversaturated, HDR, plastic skin, stock photo smile,
cluttered background, harsh flash, cyan-orange teal grading, distorted hands, extra fingers
```

---

## 1. Главная

### 1.1. Hero — главный кадр
`public/img/hero/hero-main.jpg`
**16:9 — 2400×1350** (десктоп) · **4:5 — 1200×1500** (мобильный, отдельная генерация)

```
Overhead view of a dark wooden table at night, lit by a single warm desk lamp
from the left. On the table: a half-finished diamond mosaic canvas showing a
cinematic fantasy scene, a tray of tiny round resin gems catching the light,
a pen-shaped applicator, a cup of tea steaming. Two hands in frame, mid-work,
placing a gem. Deep warm shadows, the canvas is the brightest object in the frame.
Vertical space on the left third kept dark and empty for a headline.
warm cinematic lighting, soft natural shadows, shallow depth of field,
photorealistic, no text, no watermark
```

> Левая треть остаётся тёмной и пустой — туда ляжет заголовок. Если генерация
> заполнит её деталями, текст будет нечитаем.

### 1.2. Фактура-паттерн для фонов
`public/img/texture/canvas-grain.png` · **бесшовная 1024×1024, PNG**

```
Seamless tileable texture of raw artist linen canvas, extreme close-up,
warm cream color, subtle woven threads, very low contrast, flat even lighting,
no shadows, no objects. Tileable pattern.
```
Накладывается с `opacity: .04` поверх тёмного фона — даёт «холщовую» шероховатость.

---

## 2. Обложки техник — 3 штуки
`public/img/technique/<slug>.jpg` · **3:2 — 1600×1067**

### 2.1. `paint-by-numbers.jpg`
```
Close-up of a paint-by-numbers canvas half completed: left side shows thin printed
outlines with tiny numbers, right side is filled with rich acrylic color.
A fine brush rests on the canvas, small pots of numbered acrylic paint beside it.
Warm lamp light from the upper left, dark charcoal wooden table.
photorealistic, macro detail on the brush bristles, no readable text
```

### 2.2. `diamond-mosaic.jpg`
```
Extreme macro of a diamond painting in progress: hundreds of tiny faceted round
resin drills placed in a precise grid, each catching warm light, sparkling.
Half the canvas still shows the adhesive grid with symbols. A wax-tipped
applicator pen and a small grooved tray of gems in soft focus.
Dark warm background, jewel-like sparkle, photorealistic macro
```

### 2.3. `cross-stitch.jpg`
```
Macro of cross-stitch embroidery in progress on beige aida cloth, neat X-shaped
stitches in deep colors forming part of an image, a threaded needle mid-stitch,
skeins of embroidery floss arranged by color beside a wooden hoop.
Warm side lighting, visible fabric weave, photorealistic
```

---

## 3. Обложки вселенных — 8 штук
`public/img/universe/<slug>.jpg` · **3:2 — 1600×1067**

> Намеренно **без конкретных франшиз** — это авторские стилизации, а не копии.
> См. вопрос 2 в `00-QUESTIONS.md`: если команда решит идти с прямыми брендами,
> промты переписываются, но композиция остаётся.

| Файл | Вселенная | Промт |
|---|---|---|
| `magic-school.jpg` | Магическая школа | `A gothic castle great hall at night, floating candles, long wooden tables, tall arched stained-glass windows, warm amber glow, mist, painterly illustration style, rich deep shadows, cinematic` |
| `anime.jpg` | Аниме | `Anime-style illustration: a lone figure with flowing hair standing on a rooftop at dusk, neon city lights below, dramatic wind, vivid magenta and teal sky, cel-shaded, high contrast, poster composition` |
| `cyberpunk.jpg` | Киберпанк | `Rain-soaked neon alley at night, holographic signs in an invented script, reflections in puddles, a silhouetted figure in a long coat, magenta and cyan light, cinematic sci-fi, volumetric fog` |
| `dark-fantasy.jpg` | Тёмное фэнтези | `A lone armored rider on a black horse crossing a frozen wasteland, heavy grey sky, ravens, distant ruined fortress, desaturated palette with one warm accent, epic painterly` |
| `retro-games.jpg` | Ретро-игры | `Nostalgic 90s arcade scene: a CRT screen glowing in a dark room, pixel-art landscape on screen, worn game cartridges stacked beside it, dust in the light beam, warm nostalgic grading` |
| `space.jpg` | Космос | `A vast nebula in deep space, purple and gold gas clouds, a small silhouetted spacecraft for scale, distant stars, awe-inspiring, hyper-detailed astrophotography style` |
| `cartoons.jpg` | Мультфильмы | `Bright cheerful illustrated scene: a cozy village of rounded houses on a green hill under a huge friendly sun, hot air balloon, saturated primary colors, children's book illustration style, soft outlines` |
| `cult-cinema.jpg` | Культовое кино | `Dramatic noir scene: a figure in a long coat under a streetlight in heavy rain, deep black shadows, single hard key light, high contrast monochrome with one red accent, 35mm film grain` |

---

## 4. Карточки товаров — мокапы
`public/img/product/<slug>-<n>.jpg` · **4:5 — 1200×1500**

Для демо-каталога нужно **минимум 12 товаров по 3 ракурса = 36 изображений**.

**Ракурс 1 — товар (обязательный):**
```
A finished [TECHNIQUE] artwork of [SUBJECT], mounted on a light wooden stretcher frame,
standing upright against a soft cream background (#F6F1E8), lit evenly with soft
diffused light, slight natural shadow at the base, straight-on product shot,
canvas texture visible, photorealistic, no text
```

**Ракурс 2 — макро фактуры:**
```
Extreme macro close-up of the surface of a [TECHNIQUE] artwork, showing the
individual [drills / brush strokes / stitches] in sharp detail, dramatic raking
side light revealing texture and depth, shallow depth of field, dark background
```

**Ракурс 3 — в интерьере:**
```
The finished artwork hanging in a warm minimalist living room, above a low sofa,
evening light from a floor lamp, neutral walls, a plant and books nearby,
lifestyle interior photography, the artwork is the focal point, photorealistic
```

Подставить `[TECHNIQUE]` = `paint-by-numbers canvas` / `diamond mosaic` / `cross-stitch embroidery`,
`[SUBJECT]` — сюжет товара.

**12 стартовых сюжетов:**

| slug | Сюжет для `[SUBJECT]` | Техника |
|---|---|---|
| `great-hall` | a candlelit gothic castle great hall | diamond mosaic |
| `snow-rider` | a lone armored rider in a snowstorm | paint-by-numbers |
| `neon-alley` | a neon-lit rainy cyberpunk alley | diamond mosaic |
| `anime-rooftop` | an anime girl on a rooftop at sunset | paint-by-numbers |
| `owl-mini` | a small cute owl on a branch | paint-by-numbers |
| `nebula` | a purple and gold space nebula | diamond mosaic |
| `arcade-night` | a glowing retro arcade machine in a dark room | paint-by-numbers |
| `noir-street` | a noir figure under a streetlight in rain | cross-stitch |
| `dragon-peak` | a dragon circling a mountain peak at dawn | diamond mosaic |
| `cozy-village` | a colorful cartoon village on a hill | paint-by-numbers |
| `samurai-rain` | a samurai standing in the rain, cherry blossoms | diamond mosaic |
| `spider-city` | a masked hero swinging between skyscrapers | paint-by-numbers |

---

## 5. «Что в коробке» — 3 раскладки
`public/img/box/<technique>-contents.jpg` · **4:3 — 1600×1200**

```
Flat lay, top-down view on a warm cream surface, neatly arranged with generous
spacing between items: [CONTENTS]. Soft even studio lighting, gentle shadows,
organized grid composition, product photography, no text, no labels
```

| Файл | `[CONTENTS]` |
|---|---|
| `paint-by-numbers-contents.jpg` | `a rolled printed canvas, a set of numbered acrylic paint pots in a tray, three brushes of different sizes, a printed reference sheet, a pair of hanging hooks` |
| `diamond-mosaic-contents.jpg` | `a rolled adhesive canvas with printed grid, dozens of small labeled bags of colored resin gems, a grooved plastic tray, a wax-tip applicator pen, a small block of wax, tweezers` |
| `cross-stitch-contents.jpg` | `a piece of beige aida cloth, twenty skeins of embroidery floss arranged by color, two needles, a wooden embroidery hoop, a printed chart` |

---

## 6. Процесс и атмосфера — 6 штук
`public/img/mood/<name>.jpg` · **3:2 — 1600×1067**

| Файл | Промт |
|---|---|
| `evening-hands.jpg` | `Close-up of adult hands working on a diamond mosaic at a table at night, single warm lamp, a mug of tea, phone face-down and ignored, calm focused mood, dark warm tones` |
| `mother-child.jpg` | `A mother and her young son at a kitchen table, both leaning over a bright paint-by-numbers canvas, warm afternoon light through a window, genuine absorbed concentration, seen from the side, not looking at camera` |
| `student-desk.jpg` | `A young woman at a cluttered student desk in a small room at night, string lights on the wall, working on a colorful anime paint-by-numbers canvas, laptop closed beside her, cozy warm mood` |
| `man-evening.jpg` | `A man in his late thirties in an armchair by a floor lamp, a large detailed diamond mosaic on a lap board, relaxed shoulders, evening, dark room, warm pool of light, side view` |
| `workshop.jpg` | `A small craft workshop: rolls of canvas, trays of pigment, a printer, shelves of sorted supplies, warm industrial lighting, sense of careful handmade production` |
| `finished-wall.jpg` | `A gallery wall in a warm modern apartment with four framed finished artworks of different sizes, evening lamp light, a sofa below, lifestyle interior` |

---

## 7. Галерея работ (UGC-стиль) — 10 штук
`public/img/gallery/work-01.jpg` … `work-10.jpg` · **квадрат 1:1 — 1200×1200**

> Намеренно **менее вылизанные**, чем каталожные. Идеальные студийные кадры
> в галерее клиентских работ выглядят фальшиво и убивают доверие.

```
Amateur-style smartphone photo taken by a hobbyist at home: a finished
[SUBJECT] [TECHNIQUE] held up or propped against a wall in a real lived-in room,
natural indoor daylight from a window, slightly imperfect framing, visible
everyday background — a bookshelf, a radiator, a plant. Authentic, warm, unpolished.
Not a studio shot.
```
Варьировать `[SUBJECT]` по 12 сюжетам из раздела 4, менять комнаты и время суток.

---

## 8. Обложки рубрик журнала — 6 штук
`public/img/journal/<category>.jpg` · **16:9 — 1600×900**

| Файл | Рубрика | Промт |
|---|---|---|
| `universe-guide.jpg` | Гид по вселенным | `An open illustrated atlas on a dark table, pages showing fantastical maps and character sketches, magnifying glass, warm lamp light, painterly` |
| `workshop.jpg` | Мастерская | `Overhead flat lay of craft tools in use: brushes, tweezers, a half-sorted tray of gems, a torn sheet of instructions, working mess, warm light` |
| `stories.jpg` | Истории | `Two mugs of tea on a windowsill beside a finished artwork leaning against the glass, rain outside, soft grey daylight, quiet reflective mood` |
| `gift-guide.jpg` | Подарочные гиды | `A wrapped gift box in warm kraft paper with a dark ribbon, beside it a rolled canvas, pine branches, soft festive but restrained styling, warm light` |
| `relax.jpg` | Релакс и польза | `Abstract calm composition: a single hand placing a tiny gem, extreme shallow focus, everything else soft bokeh in warm amber tones, meditative` |
| `backstage.jpg` | Закулисье | `A designer's screen showing an image being converted into a numbered color map, beside it a printed proof and color swatches, workshop lighting` |

---

## 9. Подарки — 3 штуки
`public/img/gifts/<name>.jpg` · **3:2 — 1600×1067**

| Файл | Промт |
|---|---|
| `gift-packaging.jpg` | `An elegant dark kraft gift box, open, revealing a rolled canvas and supplies nested in cream tissue paper, a thin cotton ribbon, styled on a warm wooden surface, premium unboxing feel` |
| `certificate.jpg` | `A minimal matte card in deep charcoal with a subtle embossed cross-stitch X mark, held between two fingers against a soft cream background, shallow depth of field, no readable text` |
| `gifts-hero.jpg` | `Three wrapped gift boxes of different sizes in warm neutral paper, arranged on a dark surface with soft evening light, a few pine needles, restrained and elegant, not garish` |

---

## 10. Служебные

| Файл | Размер | Промт |
|---|---|---|
| `public/img/system/404.jpg` | 1:1 · 1000×1000 | `A blank unfinished paint-by-numbers canvas with only faint outlines and numbers, no color applied at all, propped on a small easel in an empty warm room, melancholy but charming, minimal` |
| `public/img/system/empty-cart.jpg` | 1:1 · 1000×1000 | `An empty artist's tray and a clean brush lying on a cream surface, soft shadow, minimal still life, plenty of negative space` |
| `public/img/system/about-team.jpg` | 3:2 · 1600×1067 | `A small creative team's shared worktable seen from above, five different workspaces with sketches, swatches, a laptop, coffee cups, sense of collaboration, no faces` |
| `public/og/og-default.jpg` | 1.91:1 · 1200×630 | `Dark warm charcoal background with a finished diamond mosaic artwork positioned in the right third, dramatic side lighting, large empty dark area on the left for a logo, cinematic` |
| `public/og/og-product.jpg` | 1.91:1 · 1200×630 | `Same composition, but with a paint-by-numbers canvas half-completed, warm lamp glow` |

**Фавиконки** генерировать не нейросетью, а из логотипа: знак ✕ цветом `#E8482B`
на фоне `#141110`. Нужны `favicon.ico` (32), `icon-192.png`, `icon-512.png`,
`apple-touch-icon.png` (180).

---

## 11. Итог

| Раздел | Файлов |
|---|---|
| Главная | 3 |
| Техники | 3 |
| Вселенные | 8 |
| Товары (12 × 3) | 36 |
| Что в коробке | 3 |
| Атмосфера | 6 |
| Галерея | 10 |
| Журнал | 6 |
| Подарки | 3 |
| Служебные | 5 |
| **Всего** | **83** |

### Минимум, чтобы запустить сайт
Если генерировать всё сразу некогда — вот 20 файлов, которых хватит для полноценного показа,
остальное подставится заглушками:

`hero-main.jpg` · 3 техники · 8 вселенных · 6 товаров (только ракурс 1) · `og-default.jpg` · `canvas-grain.png`

### Порядок работы
1. Сгенерировать → сложить по папкам с точными именами из этого файла
2. Прогнать через сжатие в AVIF и WebP
3. Прислать мне — я подставлю их в вёрстку на шаге 2

Если какого-то файла не будет, сайт не сломается: на его месте появится
аккуратная заглушка в фирменных цветах.
