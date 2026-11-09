import { useEffect, type ReactNode } from "react";
import { useLocation } from "react-router-dom";
import Brand from "../components/layout/Brand";
import { OVERSEAS_TRANSFERS, PRIVACY_POLICY } from "../constants/privacy";

function Section({ id, title, children }: { id: string; title: string; children: ReactNode }) {
  return (
    <section id={id} className="scroll-mt-6 border-t border-hairline pt-6">
      <h2 className="text-lg font-bold text-brown">{title}</h2>
      <div className="mt-3 space-y-3 text-[15px] leading-relaxed text-brown/75">{children}</div>
    </section>
  );
}

const cell = "border border-hairline px-3 py-2 align-top";

export default function PrivacyPage() {
  const p = PRIVACY_POLICY;
  const { hash } = useLocation();

  // 가입 화면의 "자세히 보기"(#collect, #overseas)로 들어오면 해당 항목으로 이동한다.
  useEffect(() => {
    if (hash) document.getElementById(hash.slice(1))?.scrollIntoView();
  }, [hash]);
  return (
    <div className="mx-auto max-w-3xl px-4 py-6 sm:px-6 sm:py-10">
      <Brand to="/intro" />
      <h1 className="mt-8 font-display text-[28px] leading-snug text-brown">개인정보 처리방침</h1>
      <p className="mt-2 text-sm text-brown/55">
        {p.operator}(이하 “운영자”)은 {p.serviceName} 서비스를 제공하면서 이용자의 개인정보를 아래와 같이 처리합니다.
      </p>

      <div className="mt-8 space-y-8">
        <Section id="collect" title="1. 수집하는 개인정보와 이용 목적">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-sm">
              <thead className="bg-sand-light text-left text-brown">
                <tr>
                  <th className={cell}>구분</th>
                  <th className={cell}>항목</th>
                  <th className={cell}>목적</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className={cell}>계정 (필수)</td>
                  <td className={cell}>이메일, 비밀번호(암호화해 저장), 동의 일시</td>
                  <td className={cell}>회원 식별, 로그인, 문의 응대</td>
                </tr>
                <tr>
                  <td className={cell}>아이 정보 (필수)</td>
                  <td className={cell}>이름, 동화 속 주인공 모습(여자아이·남자아이)</td>
                  <td className={cell}>동화 주인공 설정</td>
                </tr>
                <tr>
                  <td className={cell}>아이 정보 (선택)</td>
                  <td className={cell}>생일, 성격, 좋아하는 것, 함께 사는 가족, 낮에 지내는 곳, 요즘 겪고 있는 일</td>
                  <td className={cell}>아이에게 맞는 동화 생성</td>
                </tr>
                <tr>
                  <td className={cell}>얼굴 사진 (선택)</td>
                  <td className={cell}>얼굴 사진 캐릭터를 만들 때 보호자가 고른 아이 얼굴 사진, 이용 동의 일시</td>
                  <td className={cell}>아이 얼굴을 닮은 주인공 캐릭터 생성. 캐릭터를 그린 직후 사진은 지움</td>
                </tr>
                <tr>
                  <td className={cell}>주인공 캐릭터</td>
                  <td className={cell}>생김새나 얼굴 사진으로 그린 캐릭터 그림</td>
                  <td className={cell}>동화 삽화의 주인공으로 사용</td>
                </tr>
                <tr>
                  <td className={cell}>기록</td>
                  <td className={cell}>기록 글, 날씨, 기분, 사진, 꾸미기 정보</td>
                  <td className={cell}>성장 기록 보관과 보기, 동화 재료</td>
                </tr>
                <tr>
                  <td className={cell}>동화</td>
                  <td className={cell}>부모님이 쓴 메시지, 교훈 태그, 기간, 만들어진 동화</td>
                  <td className={cell}>동화 생성과 보관</td>
                </tr>
                <tr>
                  <td className={cell}>자동 수집</td>
                  <td className={cell}>접속 IP, 접속 일시, 오류 기록</td>
                  <td className={cell}>보안, 장애 대응</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p>기록에 올린 사진은 기록을 보여 주는 데에만 쓰고 AI 서비스로 보내지 않습니다. 얼굴 사진은 보호자가 얼굴 사진 캐릭터를 만들기로 직접 고르고 따로 동의한 경우에만 받으며, 캐릭터를 그린 직후 지웁니다.</p>
        </Section>

        <Section id="child" title="2. 만 14세 미만 아동의 개인정보">
          <p>
            아이의 정보는 법정대리인인 부모님 등 보호자가 직접 입력합니다. 가입할 때 보호자는 아이의 법정대리인으로서 아이
            개인정보의 수집·이용과 국외 이전에 동의합니다.
          </p>
        </Section>

        <Section id="retention" title="3. 보유 기간과 파기">
          <p>
            개인정보는 회원 탈퇴 또는 삭제 요청 시까지 보관하고, 요청을 받으면 지체 없이 파기합니다. 지운 기록과 동화의
            사진·삽화 파일은 삭제 즉시 저장소에서도 지웁니다. 법령에 따라 보관해야 하는 정보는 그 기간 동안만 따로 보관합니다.
          </p>
          <p>탈퇴와 전체 삭제는 아래 문의처로 요청해 주세요.</p>
        </Section>

        <Section id="overseas" title="4. 개인정보의 국외 이전 (AI 동화 생성)">
          <p>
            동화는 AI로 만듭니다. 이용자가 동화 만들기를 요청하면, 아래 정보가 해당 AI 서비스로 네트워크를 통해 전송되어 동화
            글과 삽화를 만드는 데 쓰입니다. 동화 만들기를 요청할 때마다 전송되며, 요청하지 않으면 전송되지 않습니다.
          </p>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-sm">
              <thead className="bg-sand-light text-left text-brown">
                <tr>
                  <th className={cell}>받는 곳 (국가, 연락처)</th>
                  <th className={cell}>이전 항목</th>
                  <th className={cell}>목적</th>
                </tr>
              </thead>
              <tbody>
                {OVERSEAS_TRANSFERS.map((t) => (
                  <tr key={t.company}>
                    <td className={cell}>
                      {t.company}
                      <br />({t.country}, {t.contact})
                    </td>
                    <td className={cell}>{t.items}</td>
                    <td className={cell}>{t.purpose}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p>
            받는 곳의 보유 기간은 각 회사의 API 데이터 정책을 따릅니다. 운영자는 요청할 때 결과를 보관하지 않도록 설정할 수 있는
            경우 그렇게 설정합니다. 국외 이전을 원하지 않으면 동화 만들기 기능을 이용하지 않거나 탈퇴할 수 있습니다. 이 경우
            동화는 만들 수 없습니다.
          </p>
        </Section>

        <Section id="processors" title="5. 처리 위탁">
          <p>서비스 운영을 위해 아래 업무를 맡깁니다. 확정되면 업체와 지역을 이 표에 적습니다.</p>
          <ul className="list-disc space-y-1 pl-5">
            <li>서버와 데이터베이스 운영: [서버 업체와 지역]</li>
            <li>사진·삽화 파일 저장: [파일 저장소 업체와 지역]</li>
            <li>웹 화면 제공: [웹 호스팅 업체]</li>
          </ul>
        </Section>

        <Section id="rights" title="6. 이용자의 권리">
          <p>
            이용자와 법정대리인은 언제든 개인정보의 열람, 정정, 삭제, 처리 정지를 요청할 수 있고 동의를 철회할 수 있습니다. 아이
            정보와 기록은 앱의 설정과 기록 화면에서 직접 고치거나 지울 수 있고, 그 밖의 요청은 문의처로 보내 주세요.
          </p>
        </Section>

        <Section id="security" title="7. 안전성 확보 조치">
          <ul className="list-disc space-y-1 pl-5">
            <li>비밀번호는 복원할 수 없는 방식으로 암호화해 저장합니다.</li>
            <li>기록과 사진은 로그인한 본인 계정에서만 볼 수 있고, 사진은 일정 시간만 열리는 주소로만 보여 줍니다.</li>
            <li>서비스와 주고받는 정보는 암호화된 연결(HTTPS)로 전송합니다.</li>
            <li>개인정보에 접근할 수 있는 사람을 최소한으로 제한합니다.</li>
          </ul>
        </Section>

        <Section id="contact" title="8. 개인정보 보호책임자와 문의처">
          <p>
            개인정보 보호책임자: {p.officerName}
            <br />
            문의: {p.contactEmail}
          </p>
          <p>
            개인정보 침해에 대한 상담은 개인정보침해신고센터(국번 없이 118), 개인정보분쟁조정위원회(1833-6972)에도 할 수
            있습니다.
          </p>
        </Section>

        <Section id="changes" title="9. 처리방침의 변경">
          <p>이 처리방침은 {p.effectiveDate}부터 적용됩니다. 내용이 바뀌면 시행 7일 전부터 서비스 안에서 알립니다.</p>
        </Section>
      </div>
    </div>
  );
}
