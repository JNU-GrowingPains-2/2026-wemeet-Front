import { Check } from "lucide-react";

export interface ConsentState {
  collect: boolean;
  overseas: boolean;
}

const ITEMS: { key: keyof ConsentState; title: string; detail: string; anchor: string }[] = [
  {
    key: "collect",
    title: "개인정보 수집·이용 동의",
    detail:
      "이메일과 아이 정보, 기록을 서비스 제공을 위해 탈퇴할 때까지 보관해요. 만 14세 미만인 아이의 정보는 법정대리인으로서 동의해요.",
    anchor: "collect",
  },
  {
    key: "overseas",
    title: "개인정보 국외 이전 동의 (AI 동화 생성)",
    detail:
      "동화는 AI로 만들어요. 동화를 만들 때 아이 이름, 아이 소개, 고른 기간의 기록 글이 미국의 AI 서비스(OpenAI 등)로 전송돼요. 아이 얼굴 사진은 캐릭터를 만들 때 직접 고른 경우에만 따로 동의를 받고 보내요.",
    anchor: "overseas",
  },
];

function Box({ checked }: { checked: boolean }) {
  return (
    <span
      aria-hidden
      className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-md border-2 ${
        checked ? "border-brown bg-brown text-white" : "border-hairline bg-white"
      }`}
    >
      {checked && <Check size={15} />}
    </span>
  );
}

export default function SignupConsents({
  value,
  onChange,
  error,
}: {
  value: ConsentState;
  onChange: (value: ConsentState) => void;
  error?: string;
}) {
  const all = value.collect && value.overseas;

  return (
    <div className="rounded-xl bg-canvas p-4 ring-1 ring-hairline/70">
      <label className="flex cursor-pointer items-start gap-3 has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-ocean">
        <input
          type="checkbox"
          className="sr-only"
          checked={all}
          onChange={(e) => onChange({ collect: e.target.checked, overseas: e.target.checked })}
        />
        <Box checked={all} />
        <span className="text-[15px] font-bold text-brown">모두 동의해요</span>
      </label>
      <ul className="mt-3 space-y-3 border-t border-hairline/70 pt-3">
        {ITEMS.map((item) => (
          <li key={item.key}>
            <label className="flex cursor-pointer items-start gap-3 has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-ocean">
              <input
                type="checkbox"
                className="sr-only"
                checked={value[item.key]}
                onChange={(e) => onChange({ ...value, [item.key]: e.target.checked })}
              />
              <Box checked={value[item.key]} />
              <span className="text-sm font-semibold text-brown">
                <span className="text-error">[필수]</span> {item.title}
              </span>
            </label>
            <p className="mt-1 pl-9 text-xs leading-relaxed text-brown/55">
              {item.detail}{" "}
              <a
                href={`/privacy#${item.anchor}`}
                target="_blank"
                rel="noreferrer"
                className="font-semibold text-ocean-deep underline underline-offset-2"
              >
                자세히 보기
              </a>
            </p>
          </li>
        ))}
      </ul>
      {error && <p className="mt-3 pl-9 text-xs text-error">{error}</p>}
    </div>
  );
}
