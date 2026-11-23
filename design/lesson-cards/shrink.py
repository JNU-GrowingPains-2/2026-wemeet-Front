"""교훈 카드 원본(raw/*.png, 1024px)을 화면용 360px webp 로 줄여 public/lesson-cards 에 넣는다.
사용법: shrink.py"""
from pathlib import Path

from PIL import Image

HERE = Path(__file__).parent
OUT = HERE.parent.parent / "public" / "lesson-cards"
OUT.mkdir(parents=True, exist_ok=True)
for path in sorted((HERE / "raw").glob("*.png")):
    image = Image.open(path).convert("RGB").resize((360, 360), Image.LANCZOS)
    image.save(OUT / f"{path.stem}.webp", quality=86, method=6)
    print(path.stem, (OUT / f"{path.stem}.webp").stat().st_size)
