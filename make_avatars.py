"""生成斗牛游戏默认头像 PNG (200x200)"""
from PIL import Image, ImageDraw, ImageFont
import os

OUT_DIR = r"C:\Users\孙晨冉\OneDrive\Desktop\斗牛项目\douniu\miniprogram\assets\avatars"
os.makedirs(OUT_DIR, exist_ok=True)

SIZE = 200


def make_gradient_circle(path, color1, color2, text, text_color=(255, 255, 255, 255)):
    """渐变圆形 + 中心文字头像"""
    img = Image.new("RGBA", (SIZE, SIZE), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)

    # 简单线性渐变近似: 画两段颜色叠加
    for y in range(SIZE):
        ratio = y / SIZE
        r = int(color1[0] * (1 - ratio) + color2[0] * ratio)
        g = int(color1[1] * (1 - ratio) + color2[1] * ratio)
        b = int(color1[2] * (1 - ratio) + color2[2] * ratio)
        draw.line([(0, y), (SIZE, y)], fill=(r, g, b, 255))

    # 圆形 mask
    mask = Image.new("L", (SIZE, SIZE), 0)
    mdraw = ImageDraw.Draw(mask)
    mdraw.ellipse((0, 0, SIZE, SIZE), fill=255)
    circle = Image.new("RGBA", (SIZE, SIZE), (0, 0, 0, 0))
    circle.paste(img, (0, 0), mask)

    # 加文字
    final = Image.new("RGBA", (SIZE, SIZE), (0, 0, 0, 0))
    final.paste(circle, (0, 0), circle)
    d2 = ImageDraw.Draw(final)

    # 字体（系统）
    try:
        font = ImageFont.truetype("C:/Windows/Fonts/msyhbd.ttc", 96)
    except Exception:
        try:
            font = ImageFont.truetype("C:/Windows/Fonts/msyh.ttc", 96)
        except Exception:
            font = ImageFont.load_default()

    # 居中
    bbox = d2.textbbox((0, 0), text, font=font)
    tw, th = bbox[2] - bbox[0], bbox[3] - bbox[1]
    x = (SIZE - tw) // 2 - bbox[0]
    y = (SIZE - th) // 2 - bbox[1] - 4
    d2.text((x, y), text, font=font, fill=text_color)

    final.save(path, "PNG", optimize=True)
    print(f"saved {path}")


# 默认头像（紫色 "牛"）
make_gradient_circle(
    os.path.join(OUT_DIR, "default.png"),
    (102, 126, 234), (118, 75, 162), "牛"
)
# 庄家头像（红橙 "庄"）
make_gradient_circle(
    os.path.join(OUT_DIR, "banker.png"),
    (255, 107, 107), (238, 90, 111), "庄"
)
# 闲家头像（蓝青 "闲"）
make_gradient_circle(
    os.path.join(OUT_DIR, "player.png"),
    (79, 172, 254), (0, 242, 254), "闲"
)
# 机器人头像（青蓝 "机"）
make_gradient_circle(
    os.path.join(OUT_DIR, "bot.png"),
    (54, 209, 220), (91, 134, 229), "机"
)

print("done")
