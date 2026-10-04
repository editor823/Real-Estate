import { Metadata } from "next";
import Link from "next/link";
import { Shield, ArrowLeft, Lock, ExternalLink, Cookie, Info, Mail } from "lucide-react";

export const metadata: Metadata = {
  title: "개인정보처리방침 | 서울시 정비사업 모니터링",
  description:
    "서울시 정비사업 & 신통·모아 통합 모니터링 플랫폼의 개인정보처리방침 및 구글 애드센스(Google AdSense) 쿠키 정책 안내",
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-[#F5F2EB] text-[#2B261F] selection:bg-blue-600 selection:text-white">
      {/* 1. 상단 네비게이션 바 */}
      <header className="sticky top-0 z-50 bg-[#FFFFFF]/95 backdrop-blur-md border-b border-[#E6E0D2] px-4 sm:px-8 py-3.5 flex items-center justify-between shadow-2xs">
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#F7F5EE] hover:bg-[#EFECE4] border border-[#E6E0D2] text-xs font-bold text-[#2B261F] transition-all shadow-2xs active:scale-95 cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4 text-blue-600" />
            <span>← 메인 지도로 돌아가기</span>
          </Link>
          <span className="text-[#827A6D] opacity-40 hidden sm:inline">|</span>
          <Link
            href="/districts/"
            className="text-xs text-[#827A6D] hover:text-blue-600 font-medium hidden sm:inline"
          >
            구역별 분석 리포트
          </Link>
        </div>
        <span className="text-xs font-bold text-blue-600">서울시 정비사업 모니터링</span>
      </header>

      {/* 2. 본문 */}
      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-10 space-y-7">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-blue-600 flex items-center justify-center text-white shadow-md shadow-blue-600/20">
            <Shield className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#2B261F] tracking-tight">
              개인정보처리방침
            </h1>
            <p className="text-xs text-[#827A6D] mt-1">시행일자: 2026년 10월 4일 (최신 개정)</p>
          </div>
        </div>

        <div className="p-4 sm:p-5 rounded-2xl bg-[#EBF7EE] border border-[#C7E8CE] text-xs text-[#1B5E20] leading-relaxed">
          본 플랫폼(서울시 정비사업 & 신통·모아 통합 모니터링)은 정보주체의 개인정보와 권익을 보호하고, 「개인정보 보호법」 및 <strong>구글 애드센스(Google AdSense) 프로그램 정책</strong>을 엄격히 준수합니다. 본 방침은 웹사이트 이용 시 적용되는 개인정보 처리 및 쿠키 정책을 안내합니다.
        </div>

        {/* 1. 구글 애드센스 및 광고 쿠키 정책 */}
        <section className="p-6 sm:p-8 rounded-3xl bg-[#FFFFFF] border border-[#E6E0D2] shadow-sm space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-[#EFECE4]">
            <Cookie className="w-5 h-5 text-amber-600" />
            <h2 className="text-base sm:text-lg font-bold text-[#2B261F]">
              1. 구글 애드센스(Google AdSense) 및 광고 쿠키(Cookie) 정책
            </h2>
          </div>
          <div className="text-xs text-[#4A4439] space-y-3 leading-relaxed">
            <p>
              본 웹사이트는 플랫폼 유지·운영 및 서비스 향상을 위해 제3자 광고 사업자인 <strong>Google Inc.(구글)</strong>의 맞춤형 디스플레이 광고(Google AdSense)를 게재합니다.
            </p>
            <ul className="list-disc pl-5 space-y-2 text-[#4A4439]">
              <li>
                구글을 포함한 제3자 광고 공급업체는 <strong>쿠키(Cookie)</strong> 및 웹 비콘(Web Beacon)을 사용하여 이용자가 본 사이트 또는 다른 웹사이트를 과거에 방문한 기록을 바탕으로 광고를 게재합니다.
              </li>
              <li>
                구글의 광고 쿠키(DART 쿠키 등) 사용을 통해 이용자가 본 웹사이트 및 인터넷상의 타 사이트를 방문한 정보를 수집하여 이용자 맞춤형 광고를 제공할 수 있습니다.
              </li>
              <li>
                <strong>맞춤형 광고 게재 선택 해제 (Opt-Out 안내)</strong>: 이용자는 언제든지 맞춤형 광고 쿠키의 사용을 거부할 수 있습니다:
                <div className="mt-2 pl-2 space-y-1">
                  <div>
                    👉{" "}
                    <a
                      href="https://adssettings.google.com"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 font-bold underline inline-flex items-center gap-0.5"
                    >
                      Google 광고 설정 페이지 (Google Ad Settings) <ExternalLink className="w-3 h-3" />
                    </a>
                    에서 개인 맞춤 광고를 비활성화할 수 있습니다.
                  </div>
                  <div>
                    👉 제3자 광고 사업자의 광고 쿠키 사용 해제는{" "}
                    <a
                      href="https://www.aboutads.info"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 font-bold underline inline-flex items-center gap-0.5"
                    >
                      www.aboutads.info <ExternalLink className="w-3 h-3" />
                    </a>
                    를 방문하여 일괄 설정하실 수 있습니다.
                  </div>
                </div>
              </li>
            </ul>
          </div>
        </section>

        {/* 2. 개인정보 수집 항목 및 방법 */}
        <section className="p-6 sm:p-8 rounded-3xl bg-[#FFFFFF] border border-[#E6E0D2] shadow-sm space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-[#EFECE4]">
            <Lock className="w-5 h-5 text-blue-600" />
            <h2 className="text-base sm:text-lg font-bold text-[#2B261F]">
              2. 개인정보 수집 항목 및 방법
            </h2>
          </div>
          <div className="text-xs text-[#4A4439] space-y-3 leading-relaxed">
            <p>
              본 플랫폼은 회원가입이나 로그인을 요구하지 않으며, 주민등록번호, 계좌번호, 실명, 휴대폰번호 등 이용자를 식별할 수 있는 <strong>어떠한 민감 개인정보도 직접 수집·저장하지 않습니다.</strong>
            </p>
            <p className="text-[#827A6D]">
              다만 웹사이트의 비정상적 트래픽 방어, 서버 성능 유지, 방문 통계 분석을 목적으로 이용자의 접속 IP 주소, 브라우저 종류, 운영체제(OS), 방문 일시, 리퍼러(방문 경로) 등의 기술적 네트워크 로그 정보가 웹서버에 일시적으로 자동 기록될 수 있습니다.
            </p>
          </div>
        </section>

        {/* 3. 쿠키의 설치·운영 및 거부 */}
        <section className="p-6 sm:p-8 rounded-3xl bg-[#FFFFFF] border border-[#E6E0D2] shadow-sm space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-[#EFECE4]">
            <Info className="w-5 h-5 text-indigo-600" />
            <h2 className="text-base sm:text-lg font-bold text-[#2B261F]">
              3. 브라우저 쿠키(Cookie) 설정 및 거부 방법
            </h2>
          </div>
          <div className="text-xs text-[#4A4439] space-y-2 leading-relaxed">
            <p>
              이용자는 웹 브라우저 설정을 통해 모든 쿠키를 허용하거나, 쿠키가 저장될 때마다 확인을 거치거나, 모든 쿠키의 저장을 거부할 수 있습니다:
            </p>
            <ul className="list-disc pl-5 space-y-1 text-[#827A6D]">
              <li><strong>Chrome</strong>: 설정 &gt; 개인정보 보호 및 보안 &gt; 인터넷 사용 기록 삭제 또는 서드 파티 쿠키 차단</li>
              <li><strong>Safari</strong>: 환경설정 &gt; 크로스 사이트 추적 방지 및 모든 쿠키 차단</li>
              <li><strong>Edge</strong>: 설정 &gt; 쿠키 및 사이트 권한 &gt; 쿠키 및 사이트 데이터 관리 및 삭제</li>
            </ul>
            <p className="text-[11px] text-[#827A6D] pt-1">
              * 쿠키 저장을 거부하더라도 사이트의 기본 지도 및 구역 분석 리포트 열람에는 영향이 없습니다.
            </p>
          </div>
        </section>

        {/* 4. 개인정보 보호책임자 및 문의처 */}
        <section className="p-6 sm:p-8 rounded-3xl bg-[#FFFFFF] border border-[#E6E0D2] shadow-sm space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-[#EFECE4]">
            <Mail className="w-5 h-5 text-emerald-600" />
            <h2 className="text-base sm:text-lg font-bold text-[#2B261F]">
              4. 개인정보 보호 담당자 및 문의처
            </h2>
          </div>
          <div className="text-xs text-[#4A4439] space-y-2 leading-relaxed">
            <p>
              개인정보 보호와 관련된 문의사항, 구글 애드센스 광고 정책 관련 문의, 권리 침해 신고는 아래 연락처로 접수해 주시면 신속하고 성실하게 조치하겠습니다.
            </p>
            <div className="p-4 rounded-2xl bg-[#FDFBF7] border border-[#E6E0D2] space-y-1 mt-2">
              <p><strong>서비스명</strong>: 서울시 정비사업 &amp; 신통·모아 통합 모니터링</p>
              <p><strong>개인정보 보호 책임자</strong>: 서비스 관리팀</p>
              <p>
                <strong>문의 이메일</strong>:{" "}
                <a href="mailto:editor823@gmail.com" className="text-blue-600 font-mono font-bold underline">
                  editor823@gmail.com
                </a>
              </p>
            </div>
          </div>
        </section>
      </main>

      {/* 3. 푸터 */}
      <footer className="mt-16 border-t border-[#E6E0D2] py-8 px-4 text-center text-xs text-[#827A6D] space-y-2 bg-[#F5F2EB]">
        <p>서울시 정비사업 &amp; 신통·모아 통합 모니터링 플랫폼 | 데이터 출처: 서울시 정비사업 정보몽땅 및 서울 열린데이터광장</p>
        <p className="flex items-center justify-center gap-3 text-[#827A6D]">
          <span>© 2026 Seoul Redevelopment Monitoring.</span>
          <span>•</span>
          <Link href="/privacy/" className="hover:text-blue-600 underline font-medium">개인정보처리방침</Link>
          <span>•</span>
          <Link href="/terms/" className="hover:text-blue-600 underline font-medium">이용약관 및 면책조항</Link>
        </p>
      </footer>
    </div>
  );
}
