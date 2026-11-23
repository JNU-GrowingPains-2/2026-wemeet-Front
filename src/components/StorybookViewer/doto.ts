// 길잡이 도토의 자세와 말풍선 한 줄의 모양

export const DOTO_POSES = ["idle", "hello", "talk", "curious", "happy", "point", "listen", "bye"] as const;
export type DotoPose = (typeof DOTO_POSES)[number];

export const dotoImage = (pose: DotoPose) => `/doto/${pose}.webp`;

export interface DotoLine {
  id: string;
  // doto: 도토가 건네는 말, child: 아이의 대답(반대쪽), parent: 부모에게 주는 한마디
  from: "doto" | "child" | "parent";
  text: string;
  // 말풍선 위에 붙는 작은 이름표
  label?: string;
  // 질문 갈래 표시
  kind?: string | null;
  // 말풍선 안에 붙는 작은 단추(부모 한마디 펼치기 등)
  action?: { label: string; pressed: boolean; onClick: () => void };
  // 나중에 붙일 도토 목소리 파일 주소. 지금은 서버가 주지 않아 늘 비어 있다.
  audioUrl?: string | null;
}
