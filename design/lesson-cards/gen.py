"""교훈 카드 그림 그리기. 대표 캐릭터 두 아이(ref_girl.png, ref_boy.png)를 참조로 카드마다 한 장면을 그린다.
사용법: gen.py [<파일 이름>...]   (이름을 주지 않으면 12장 모두)
그린 뒤 shrink.py 로 화면용 크기로 줄인다. OPENAI_API_KEY 환경 변수를 쓴다."""
import base64
import json
import sys
import time
from concurrent.futures import ThreadPoolExecutor
from pathlib import Path

import openai

HERE = Path(__file__).parent
RAW = HERE / "raw"
RAW.mkdir(exist_ok=True)
USAGE = HERE / "usage.jsonl"
REF_GIRL = HERE / "ref_girl.png"
REF_BOY = HERE / "ref_boy.png"

client = openai.OpenAI()

WHO = {
    "girl": "Only the girl from the first reference picture appears.",
    "boy": "Only the boy from the second reference picture appears.",
    "both": "Both children appear together: the girl from the first reference picture and the boy from the second.",
}
CHARACTERS = (
    "The two reference pictures show the service's two main child characters, about five years old. "
    "Girl (first picture): black bob hair with bangs and a small yellow hair clip, mustard-yellow knit cardigan over a white-collared "
    "navy corduroy dress, white socks, red shoes. Boy (second picture): short tousled black hair, navy-and-white striped long-sleeve "
    "shirt, olive-green corduroy overalls with rolled cuffs, white sneakers. Draw them EXACTLY as in the references: same faces, "
    "same hair, same clothes, same proportions, same rosy cheeks."
)
STYLE = (
    "Style: exactly the same hand-painted children's picture-book style as the reference pictures: soft watercolor with fine "
    "colored-pencil texture on paper, gentle warm light, muted soft palette, thin soft brown outlines, cute, tender and cozy. "
    "NOT a cartoon sticker, NOT vector, NOT 3D, NOT glossy, NOT anime."
)
LAYOUT = (
    "Layout: a square picture for a small children's picture card. One simple, instantly readable little scene, the children shown "
    "full body, large and centered, filling most of the picture, nothing important near the edges. The whole picture is filled edge to "
    "edge with a soft, even pastel watercolor wash in {color}, slightly lighter in the middle, with only a few tiny simple props on "
    "the ground. No text, no letters, no numbers, no border, no frame, no speech bubbles."
)

# 파일 이름: (나오는 아이, 바탕 빛깔, 장면)
CARDS = {
    "sharing": ("both", "warm apricot cream", "The girl happily holds out half of a cookie with both hands to the boy, who reaches for it with a delighted smile."),
    "courage": ("boy", "soft peach pink", "The boy takes one careful step onto a small log bridge over a tiny stream, arms out for balance, a little nervous but with a brave determined smile."),
    "honesty": ("girl", "pale butter yellow", "The girl stands beside a small tipped-over flowerpot with spilled soil, one hand raised to own up, with a shy, honest, slightly sorry face."),
    "kindness": ("boy", "soft rose pink", "In gentle rain, the boy crouches and holds a small yellow umbrella over a tiny kitten, looking at it kindly while his own shoulder gets a little wet."),
    "grit": ("girl", "fresh light green", "The girl concentrates hard, tongue slightly out, carefully placing one more wooden block on a wobbly tall tower of blocks; two blocks have fallen on the ground."),
    "thanks": ("boy", "light lilac", "The boy offers a small bunch of wildflowers with both hands toward the viewer, eyes closed in a warm grateful smile."),
    "sorry": ("both", "pale sky blue", "The boy bows his head a little and shyly holds out one hand to the girl, who is starting to smile and reaches back; making up after a small quarrel."),
    "waiting": ("girl", "soft lavender", "The girl sits on the ground with her chin resting in both hands, patiently watching a tiny green sprout in a small clay pot; a little watering can beside it."),
    "myself": ("boy", "pale mint", "The boy sits on the ground and proudly pulls on a yellow rain boot all by himself; the other boot waits beside him."),
    "curiosity": ("girl", "soft periwinkle blue", "The girl crouches with wide sparkling eyes, looking through a small magnifying glass at a ladybug on a leaf."),
    "friendship": ("both", "warm light orange", "The girl and the boy walk side by side holding hands, both smiling at each other."),
    "being-me": ("girl", "soft golden cream", "The girl stands tall and content, arms open wide, wearing a paper crown she made herself, a big proud smile."),
}


def draw(name, quality="medium"):
    who, color, scene = CARDS[name]
    t = time.time()
    with REF_GIRL.open("rb") as girl, REF_BOY.open("rb") as boy:
        r = client.images.edit(
            model="gpt-image-2",
            image=[girl, boy],
            prompt=f"{CHARACTERS}\n\n{WHO[who]}\nScene: {scene}\n\n{STYLE}\n\n{LAYOUT.format(color=color)}",
            size="1024x1024",
            quality=quality,
            output_format="png",
        )
    (RAW / f"{name}.png").write_bytes(base64.b64decode(r.data[0].b64_json))
    u = r.usage
    rec = {"name": name, "quality": quality, "secs": round(time.time() - t, 1),
           "input_tokens": getattr(u, "input_tokens", 0), "output_tokens": getattr(u, "output_tokens", 0)}
    with USAGE.open("a") as f:
        f.write(json.dumps(rec, ensure_ascii=False) + "\n")
    print(rec, flush=True)


if __name__ == "__main__":
    names = sys.argv[1:] or list(CARDS)
    with ThreadPoolExecutor(4) as ex:
        list(ex.map(draw, names))
