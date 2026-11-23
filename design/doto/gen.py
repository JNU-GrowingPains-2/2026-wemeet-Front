"""도토 그림 그리기. 그림체 참조용 삽화를 이 폴더에 style_ref.png 로 두고 실행한다.
사용법: gen.py base | gen.py pose <이름> [<이름>...]"""
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


# OPENAI_API_KEY 환경 변수를 쓴다.
client = openai.OpenAI()

CHARACTER = (
    "A baby squirrel character named Doto, the gentle reading guide of a children's picture-book service. "
    "Small round body, big soft head, warm chestnut-brown fur, cream-colored belly, cheeks and inner ears, "
    "a big fluffy curled tail, tiny rounded ears, small dark kind eyes with a soft highlight, a tiny pink-brown nose, "
    "faint rosy cheeks. Doto wears a scarf made from a bookmark ribbon: a flat muted-terracotta-red satin ribbon wrapped once "
    "around the neck, one long end hanging down the front and ending in a swallow-tail (V-notched) bookmark cut, "
    "with one small golden-yellow embroidered five-point star on the hanging end."
)
STYLE = (
    "Style: a hand-painted traditional children's picture-book illustration, the same style as the reference picture: "
    "soft watercolor and gouache with fine colored-pencil texture on paper, gentle warm natural light, muted earthy palette, "
    "delicate fur strokes, soft thin brown outlines, tender and high-quality like a published picture book. "
    "NOT a cartoon sticker, NOT vector, NOT 3D, NOT glossy, NOT anime, no thick black outlines."
)
LAYOUT = (
    "Layout: one single character, full body from ear tips to feet and whole tail visible, centered, with generous empty margin "
    "on every side, nothing cropped. Background: perfectly plain flat pure white (#FFFFFF) everywhere, no ground, no cast shadow, "
    "no floor line, no props, no text, no border, no vignette, no paper texture in the background."
)

POSES = {
    "idle": "standing upright calmly, facing the viewer in a slight three-quarter view, small paws held together in front of the belly, a gentle closed-mouth smile.",
    "hello": "greeting: one small paw raised high and waving hello, head tilted slightly, a bright open happy smile, looking at the viewer.",
    "talk": "talking: mouth gently open mid-sentence, one paw raised a little with the palm open as if explaining something kindly, looking at the viewer.",
    "curious": "curious and wondering: head tilted clearly to one side, one paw touching the chin, eyes looking up, a small 'hmm' mouth.",
    "happy": "delighted: both small paws raised up in joy, eyes closed into happy curved arcs, a big open smile, a tiny hop with feet just off the ground.",
    "point": "pointing: body turned slightly to the viewer's left, one arm stretched out straight pointing to the viewer's left side, looking in the same direction with an encouraging smile.",
    "listen": "listening carefully: leaning forward a little, one paw cupped behind one ear, eyes wide and attentive, a soft small smile, waiting for an answer.",
    "wave_bye": "saying goodbye warmly: both paws hugging a small closed storybook against the chest, eyes gently closed with a content smile.",
}


def log(name, quality, result, secs):
    u = result.usage
    rec = {
        "name": name,
        "quality": quality,
        "secs": round(secs, 1),
        "input_tokens": getattr(u, "input_tokens", 0),
        "output_tokens": getattr(u, "output_tokens", 0),
        "details": getattr(u, "input_tokens_details", None) and u.input_tokens_details.model_dump(),
    }
    with USAGE.open("a") as f:
        f.write(json.dumps(rec, ensure_ascii=False) + "\n")
    print(rec, flush=True)


def base(tag="base"):
    t = time.time()
    with (HERE / "style_ref.png").open("rb") as ref:
        r = client.images.edit(
            model="gpt-image-2",
            image=[ref],
            prompt=(
                "Use the reference picture ONLY for its painting style (medium, texture, palette, light). "
                "Do not copy its people or scene.\n\n"
                f"Draw: {CHARACTER}\nPose: {POSES['idle']}\n\n{STYLE}\n\n{LAYOUT}"
            ),
            size="1024x1024",
            quality="high",
            output_format="png",
        )
    (RAW / f"{tag}.png").write_bytes(base64.b64decode(r.data[0].b64_json))
    log(tag, "high", r, time.time() - t)


def pose(name, quality="medium"):
    t = time.time()
    with (RAW / "base.png").open("rb") as ref:
        r = client.images.edit(
            model="gpt-image-2",
            image=[ref],
            prompt=(
                "Draw EXACTLY the same character as in the reference picture: same baby squirrel, same proportions, same fur colors, "
                "same face, same bookmark-ribbon scarf with the small golden star, same painting style and brush texture. "
                "Only the pose and expression change.\n\n"
                f"Character notes: {CHARACTER}\nNew pose: {POSES[name]}\n\n{STYLE}\n\n{LAYOUT}"
            ),
            size="1024x1024",
            quality=quality,
            output_format="png",
        )
    (RAW / f"{name}.png").write_bytes(base64.b64decode(r.data[0].b64_json))
    log(name, quality, r, time.time() - t)


if __name__ == "__main__":
    if sys.argv[1] == "base":
        base(*(sys.argv[2:3]))
    else:
        names = sys.argv[2:]
        with ThreadPoolExecutor(4) as ex:
            list(ex.map(pose, names))
