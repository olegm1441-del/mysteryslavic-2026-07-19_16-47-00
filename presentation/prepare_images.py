#!/usr/bin/env python3
"""
Готовит исходники из images/source/ к вставке в презентацию.

Фото:   кроп под пропорции панели слайда (где это важно), даунскейл, JPEG.
Иконки: обрезка прозрачных полей, даунскейл, PNG с альфа-каналом.

Зачем кроп здесь, а не в build_deck.js: pptxgenjs умеет только центральный
кроп (sizing: cover). Для титульного кадра центр — не то: шкаф и инженер
стоят справа, центральный кроп их срежет. Такие кадры режем заранее.

Запуск:  python3 prepare_images.py
"""
import os
from PIL import Image

HERE = os.path.dirname(os.path.abspath(__file__))
SRC = os.path.join(HERE, "images", "source")
DST = os.path.join(HERE, "images")
ICON_SRC = os.path.join(SRC, "icons")
ICON_DST = os.path.join(DST, "icons")

MAX_SIDE = 1600          # потолок по длинной стороне для фото
JPEG_QUALITY = 88

# исходник -> (итоговое имя, пропорции панели w/h или None, якорь кропа)
# Пропорции должны совпадать с панелями в build_deck.js. Если там меняется
# геометрия слайда — поправить и здесь (иначе кадр просто доедет центральным
# кропом при вставке, что для большинства слайдов нормально).
PHOTOS = {
    # слайд 1: панель 6.28 x 7.5 дюйма -> 0.837. Якорь right: шкаф + инженер.
    "IMAGE_01_title_16x9.png":      ("01-title.jpg",      6.28 / 7.5,  "right"),
    # слайд 3: панель 3.313 x 2.68 -> 1.236, исходник 4:3 — кроп минимальный.
    "IMAGE_02_components_4x3.png":  ("02-components.jpg", 3.313 / 2.68, "center"),
    # остальные пять кадров (03-07) кладутся сюда же, когда будут готовы
    "IMAGE_03_fieldwork_16x9.png":  ("03-fieldwork.jpg",  None, "center"),
    "IMAGE_04_lifecycle_16x9.png":  ("04-lifecycle.jpg",  None, "center"),
    "IMAGE_05_dashboard_16x9.png":  ("05-dashboard.jpg",  None, "center"),
    "IMAGE_06_spare_repair_4x3.png":("06-spare-repair.jpg", None, "center"),
    "IMAGE_07_line_wide_16x9.png":  ("07-line-wide.jpg",  None, "center"),
}

ICONS = {
    "01_PLC_controller.png":          "plc.png",
    "02_HMI_touch_panel.png":         "hmi.png",
    "03_variable_frequency_drive.png":"vfd.png",
    "04_servo_drive.png":             "servo.png",
    "05_remote_IO.png":               "io.png",
    "06_industrial_PC.png":           "ipc.png",
    "07_spare_part_shelf.png":        "spare.png",
    "08_migration_replacement.png":   "migration.png",
}


def crop_to_aspect(img, target, anchor):
    """Обрезает до нужных пропорций, сохраняя максимум площади."""
    w, h = img.size
    cur = w / h
    if abs(cur - target) < 1e-4:
        return img
    if cur > target:                      # исходник шире — режем по ширине
        new_w = int(round(h * target))
        if anchor == "right":
            x0 = w - new_w
        elif anchor == "left":
            x0 = 0
        else:
            x0 = (w - new_w) // 2
        return img.crop((x0, 0, x0 + new_w, h))
    new_h = int(round(w / target))        # исходник выше — режем по высоте
    if anchor == "top":
        y0 = 0
    elif anchor == "bottom":
        y0 = h - new_h
    else:
        y0 = (h - new_h) // 2
    return img.crop((0, y0, w, y0 + new_h))


def downscale(img, max_side):
    w, h = img.size
    if max(w, h) <= max_side:
        return img
    k = max_side / max(w, h)
    return img.resize((max(1, int(w * k)), max(1, int(h * k))), Image.LANCZOS)


def main():
    os.makedirs(ICON_DST, exist_ok=True)
    done, skipped = [], []

    for src_name, (out_name, aspect, anchor) in PHOTOS.items():
        src = os.path.join(SRC, src_name)
        if not os.path.exists(src):
            skipped.append(src_name)
            continue
        img = Image.open(src).convert("RGB")
        before = img.size
        if aspect:
            img = crop_to_aspect(img, aspect, anchor)
        img = downscale(img, MAX_SIDE)
        out = os.path.join(DST, out_name)
        img.save(out, "JPEG", quality=JPEG_QUALITY, optimize=True, progressive=True)
        done.append("%-22s %sx%s -> %sx%s  %4d КБ" % (
            out_name, before[0], before[1], img.size[0], img.size[1],
            os.path.getsize(out) // 1024))

    for src_name, out_name in ICONS.items():
        src = os.path.join(ICON_SRC, src_name)
        if not os.path.exists(src):
            skipped.append(src_name)
            continue
        img = Image.open(src).convert("RGBA")
        bbox = img.split()[3].getbbox()        # обрезаем прозрачные поля
        if bbox:
            img = img.crop(bbox)
        side = max(img.size)                   # добиваем до квадрата с полем 6%
        pad = int(side * 0.06)
        canvas = Image.new("RGBA", (side + 2 * pad, side + 2 * pad), (0, 0, 0, 0))
        canvas.paste(img, ((canvas.width - img.width) // 2,
                           (canvas.height - img.height) // 2), img)
        canvas = downscale(canvas, 512)
        out = os.path.join(ICON_DST, out_name)
        canvas.save(out, "PNG", optimize=True)
        done.append("icons/%-16s -> %sx%s  %4d КБ" % (
            out_name, canvas.size[0], canvas.size[1], os.path.getsize(out) // 1024))

    print("Подготовлено:")
    for line in done:
        print("  " + line)
    if skipped:
        print("\nНет исходника (ожидается):")
        for s in sorted(skipped):
            print("  " + s)


if __name__ == "__main__":
    main()
