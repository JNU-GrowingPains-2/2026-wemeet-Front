// 개인정보 처리방침에 들어가는 운영 정보. 정식 운영 전에 실제 값으로 채운다.
export const PRIVACY_POLICY = {
  serviceName: "하루동화",
  operator: "[운영 주체 이름]",
  officerName: "[개인정보 보호책임자 이름]",
  contactEmail: "[문의 이메일]",
  effectiveDate: "[시행일]",
} as const;

// 동화 생성을 위해 개인정보가 국외로 이전되는 곳. 생성기 구성이 바뀌면 함께 고친다.
export const OVERSEAS_TRANSFERS = [
  {
    company: "OpenAI, L.L.C.",
    country: "미국",
    contact: "privacy@openai.com",
    purpose: "동화 글과 삽화 생성",
    items: "아이 이름, 주인공 성별 캐릭터, 나이, 아이 소개, 부모님이 쓴 메시지와 교훈 태그, 고른 기간의 기록 글·날씨·기분",
  },
  {
    company: "Anthropic, PBC",
    country: "미국",
    contact: "privacy@anthropic.com",
    purpose: "동화 글 생성 (해당 서비스를 쓰는 경우)",
    items: "아이 이름, 주인공 성별, 나이, 아이 소개, 부모님이 쓴 메시지와 교훈 태그, 고른 기간의 기록 글·날씨·기분",
  },
] as const;
