# 길잡이 도토 그림

동화 읽기 화면에 나오는 아기 다람쥐 "도토"의 원본 그림과 만드는 방법이다.

- `raw/`: gpt-image-2 로 그린 원본(1024px, 흰 배경). `base.png` 가 기준 그림이고 나머지는 이 그림을 참조로 자세만 바꿨다.
- `gen.py`: 그리기. 기준 그림은 high, 자세는 medium 품질이다. 그림체 참조로 `src/assets/story/courage-girl-2.webp` 를 PNG 로 바꿔 `style_ref.png` 로 썼다.
- `cutout.py`: 흰 배경을 가장자리부터 채워 오려 내고, 발 높이를 맞춘 뒤 240px webp 로 줄여 `public/doto/` 에 넣는다.

```bash
python design/doto/cutout.py design/doto/raw /tmp/doto-cutout public/doto
```

gpt-image-2 는 투명 배경을 지원하지 않아 흰 배경으로 그린 뒤 오려 낸다. 화면에서 쓰는 이름은 `idle`(base), `hello`, `talk`, `curious`, `happy`, `point`, `listen`, `bye`(wave_bye) 이다.
