"""흰 배경으로 그린 도토 그림을 가장자리부터 채워 오려 내고, 화면용 크기로 줄인다.
사용법: cutout.py <원본 폴더> <오려 낸 원본 폴더> <화면용 폴더>"""
import sys
from collections import deque
from pathlib import Path

from PIL import Image, ImageFilter

TOLERANCE = 22
OUT_SIZE = 240
NAMES = ["base", "hello", "talk", "curious", "happy", "point", "listen", "wave_bye"]
PUBLIC_NAME = {"base": "idle", "wave_bye": "bye"}


def cut(path: Path) -> Image.Image:
    im = Image.open(path).convert("RGB")
    w, h = im.size
    px = im.load()
    bg = px[0, 0]
    seen = bytearray(w * h)
    queue = deque()
    for x in range(w):
        queue.append((x, 0)); queue.append((x, h - 1))
    for y in range(h):
        queue.append((0, y)); queue.append((w - 1, y))
    while queue:
        x, y = queue.popleft()
        if x < 0 or y < 0 or x >= w or y >= h or seen[y * w + x]:
            continue
        r, g, b = px[x, y]
        if max(abs(r - bg[0]), abs(g - bg[1]), abs(b - bg[2])) > TOLERANCE:
            continue
        seen[y * w + x] = 1
        queue.extend(((x + 1, y), (x - 1, y), (x, y + 1), (x, y - 1)))
    mask = Image.frombytes("L", (w, h), bytes(255 if not s else 0 for s in seen))
    # 흰 테두리가 어두운 바탕에서 비치지 않게 2px 안쪽으로 깎은 뒤 부드럽게 한다.
    mask = mask.filter(ImageFilter.MinFilter(5)).filter(ImageFilter.GaussianBlur(1))
    out = im.convert("RGBA")
    out.putalpha(mask)
    return out


def main(raw: Path, cut_dir: Path, public: Path):
    cut_dir.mkdir(parents=True, exist_ok=True)
    public.mkdir(parents=True, exist_ok=True)
    images = {n: cut(raw / f"{n}.png") for n in NAMES}
    boxes = {n: im.getchannel("A").point(lambda a: 255 if a > 40 else 0).getbbox() for n, im in images.items()}
    # 발바닥 높이를 맞춰 자세를 바꿔도 몸이 튀지 않게 한다.
    floor = max(b[3] for b in boxes.values())
    shifted = {}
    for n, im in images.items():
        canvas = Image.new("RGBA", (im.width, im.height + 200), (0, 0, 0, 0))
        canvas.paste(im, (0, floor - boxes[n][3]))
        shifted[n] = canvas
    union = None
    for n, im in shifted.items():
        b = im.getchannel("A").point(lambda a: 255 if a > 40 else 0).getbbox()
        union = b if union is None else (min(union[0], b[0]), min(union[1], b[1]), max(union[2], b[2]), max(union[3], b[3]))
    pad = 12
    left, top, right, bottom = union[0] - pad, union[1] - pad, union[2] + pad, union[3] + pad
    side = max(right - left, bottom - top)
    cx = (left + right) // 2
    box = (cx - side // 2, bottom - side, cx - side // 2 + side, bottom)
    for n, im in shifted.items():
        square = im.crop(box)
        square.save(cut_dir / f"{PUBLIC_NAME.get(n, n)}.webp", lossless=True)
        small = square.resize((OUT_SIZE, OUT_SIZE), Image.LANCZOS)
        small.save(public / f"{PUBLIC_NAME.get(n, n)}.webp", quality=92, method=6)
    print("box", box, "side", side)


if __name__ == "__main__":
    main(Path(sys.argv[1]), Path(sys.argv[2]), Path(sys.argv[3]))
