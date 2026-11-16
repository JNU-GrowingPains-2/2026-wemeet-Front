export const LESSON_TAGS = ["나눔", "용기", "정직", "배려", "끈기"] as const;

// 고민 주제. 서버의 app/ai/prompts.py THEME_CARDS 와 같은 이름이다.
export const THEME_TAGS = [
  { tag: "새 동생", hint: "샘나고 궁금한 마음" },
  { tag: "기관 적응", hint: "헤어질 때의 아쉬움" },
  { tag: "배변 연습", hint: "실수해도 괜찮아" },
  { tag: "병원 가기", hint: "무서운 마음 다독이기" },
  { tag: "이사", hint: "정든 곳과 인사하기" },
  { tag: "잠자리", hint: "포근하게 잠들기" },
] as const;

export const STORY_MODES = [
  { mode: null, label: "알아서", hint: "기록에 맞춰 골라요" },
  { mode: "daily", label: "있었던 그대로", hint: "기록 속 하루를 따라가요" },
  { mode: "fantasy", label: "상상 한 스푼", hint: "인형이 말을 걸기도 해요" },
] as const;

export const EXTRA_DETAILS_MAX = 300;

// 읽어 주기 목소리. 서버의 app/ai/narration.py VOICES 와 같은 id 다.
export const VOICES = [
  { id: "warm_female", label: "다정한 엄마 목소리" },
  { id: "calm_female", label: "차분한 엄마 목소리" },
  { id: "warm_male", label: "다정한 아빠 목소리" },
  { id: "calm_male", label: "낮고 차분한 아빠 목소리" },
] as const;

// 읽으며 묻는 질문의 갈래별 색
export const QUESTION_KIND_STYLE: Record<string, string> = {
  가리키기: "bg-sand-light text-sand-ink",
  기분: "bg-error-light text-brown",
  예측: "bg-ocean-light text-ocean-deep",
  상상: "bg-forest-light text-forest",
  떠올리기: "bg-paper text-brown/70",
  "내 이야기": "bg-brown text-white",
};

export const PARENT_MESSAGE_MIN = 10;
export const PARENT_MESSAGE_MAX = 300;

export const STORY_PERIOD_DEFAULT_DAYS = 7;
export const STORY_PERIOD_MAX_DAYS = 31;
export const STORY_PERIOD_PRESETS = [3, 7, 14] as const;

export const PARENT_MESSAGE_EXAMPLES = [
  "친구에게 먼저 사과하는 용기를 알려주고 싶어요",
  "작은 것도 나누면 더 즐겁다는 걸 느꼈으면 해요",
  "실수해도 괜찮다고, 다시 해보면 된다고 말해주고 싶어요",
  "솔직하게 말하는 게 멋진 일이라는 걸 알려주고 싶어요",
];
