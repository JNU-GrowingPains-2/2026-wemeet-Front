# 교훈 카드 그림

동화 만들기 3단계의 "마음 카드"에 쓰는 그림 12장이다. 대표 캐릭터인 두 아이(서아, 도윤)가 카드마다 그 마음을 보여 주는 장면을 한다.

- `gen.py`: gpt-image-2 로 그린다. `ref_girl.png`, `ref_boy.png`(`src/assets/characters` 의 전신 그림을 PNG 로 바꾼 것)를 참조로 같은 아이를 그리고, 카드마다 나오는 아이와 바탕 빛깔, 장면만 바꾼다(1024px, medium).
- `raw/`: 그린 원본.
- `shrink.py`: 원본을 360px webp 로 줄여 `public/lesson-cards/` 에 넣는다.

파일 이름은 `src/constants/storybook.ts` 의 `LESSON_CARDS` 에 있는 `slug` 와 같다. 한 장만 다시 그리려면 `gen.py <slug>` 로 실행한다.
