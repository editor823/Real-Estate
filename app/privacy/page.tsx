import { Metadata } from "next";
import Link from "next/link";
import { Shield, ArrowLeft, Lock, ExternalLink } from "lucide-react";

export const metadata: Metadata = {
  title: "개인정보처리방침 | 서울시 정비사업 모니터링",
  description:
    "서울시 정비사업 & 신통·모아 통합 모니터링 플랫폼의 개인정보처리방침 및 구글 애드센스 쿠키 정책 안내",
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      {/* 헤더 */}
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-slate-950/80 border-b border-slate-800 px-4 sm:px-8 py-4 flex items-center justify-between">
        <Link
          href="/"
          className="flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>메인 지도로 돌아가기</span>
        </Link>
        <span className="text-xs font-bold text-blue-400">서울시 정비사업 플랫폼</span>
      </header>

      {/* 본문 */}
      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-12 space-y-8">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-blue-600 flex items-center justify-center text-white">
            <Shield className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold text-white">개인정보처리방침</h1>
            <p className="text-xs text-slate-400 mt-0.5">최종 개정일: 2026년 10월 4일</p>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-blue-950/40 border border-blue-900/60 text-xs text-blue-200 leading-relaxed">
          본 플랫폼(서울시 재개발·신통기획 모니터링)은 정보주체의 자유와 권리 보호를 위해 「개인정보 보호법」 및 구글 애드센스(Google AdSense) 프로그램 정책을 준수하고 있습니다.
        </div>

        <section className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-3">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <Lock className="w-4 h-4 text-blue-400" />
            1. 구글 애드센스(Google AdSense) 및 광고 쿠키(Cookie) 정책
          </h2>
          <div className="text-xs text-slate-300 space-y-2 leading-relaxed">
            <p>
              본 웹사이트는 운영 및 서비스 개선을 위해 제3자 광고 사업자인 <strong>구글(Google Inc.)</strong>의 애드센스 광고를 게재할 수 있습니다.
            </p>
            <ul className="list-disc pl-5 space-y-1.5 text-slate-400">
              <li>
                구글을 포함한 제3자 공급업체는 <strong>쿠키(Cookie)</strong>를 사용하여 이용자가 본 웹사이트 또는 다른 웹사이트를 과거에 방문한 기록을 바탕으로 광고를 게재합니다.
              </li>
              <li>
                구글은 광고 쿠키를 사용하여 본 사이트 및 인터넷의 다른 사이트 방문을 토대로 이용자에게 적절한 맞춤형 광고를 제공합니다.
              </li>
              <li>
                <strong>맞춤 광고 거부 방법(Opt-Out)</strong>: 이용자는{" "}
                <a
                  href="https://adssettings.google.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-400 font-bold underline inline-flex items-center gap-0.5"
                >
                  Google 광고 설정 <ExternalLink className="w-3 h-3" />
                </a>
                을 방문하여 맞춤형 광고 게재에 사용되는 쿠키를 비활성화할 수 있으며,{" "}
                <a
                  href="https://www.aboutads.info"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-400 font-bold underline"
                >
                  www.aboutads.info
                </a>
                를 통해 제3자 광고 업체의 쿠키 사용을 선택 해제할 수 있습니다.
              </li>
            </ul>
          </div>
        </section>

        <section className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-3">
          <h2 className="text-base font-bold text-white">2. 자동 수집되는 인터넷 로그 정보</h2>
          <div className="text-xs text-slate-300 space-y-2 leading-relaxed">
            <p>
              본 플랫폼은 별도의 회원가입 없이 전체 데이터를 자유롭게 열람하실 수 있으며, 주민등록번호, 연락처 등의 민감 정보를 직접 수집하지 않습니다.
            </p>
            <p className="text-slate-400">
              다만, 서버 안정성 유지와 트래픽 분석을 위해 접속 IP 주소, 브라우저 종류, 방문 일시 등의 기술적 접속 로그가 자동으로 기록될 수 있습니다.
            </p>
          </div>
        </section>

        <section className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-3">
          <h2 className="text-base font-bold text-white">3. 데이터 출처 및 법적 책임의 한계</h2>
          <div className="text-xs text-slate-300 space-y-2 leading-relaxed">
            <p>
              본 사이트에 수록된 서울시 496개 정비구역 공간 경계 및 인허가 추진단계는 서울시 <strong>정비사업 정보몽땅(cleanup.seoul.go.kr)</strong>과 <strong>서울 열린데이터광장</strong>의 공공 데이터를 기반으로 시각화한 것입니다.
            </p>
            <p className="text-slate-400">
              본 사이트에서 제공하는 데이터와 입주권 안전 진단 결과는 투자 참고용 보조 지표이며, 법적 효력을 갖는 확정 문서가 아닙니다. 매매 계약 시에는 반드시 관할 자치구청 정비사업과 및 조합의 공식 고시 문서를 대조·확인하시기 바랍니다.
            </p>
          </div>
        </section>

        <section className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-3">
          <h2 className="text-base font-bold text-white">4. 개인정보 보호 담당자 및 문의</h2>
          <div className="text-xs text-slate-300 space-y-1">
            <p>개인정보 처리 및 서비스 문의 사항은 아래 이메일로 접수해 주시면 성실히 답변드리겠습니다.</p>
            <p className="font-semibold text-white pt-2">
              📧 담당자 이메일: <span className="text-blue-400 font-mono">editer0823@naver.com</span>
            </p>
          </div>
        </section>
      </main>

      {/* 푸터 */}
      <footer className="mt-16 border-t border-slate-800/80 py-8 px-4 text-center text-xs text-slate-500">
        <p>© 2026 Seoul Redevelopment Monitoring. All rights reserved.</p>
      </footer>
    </div>
  );
}
