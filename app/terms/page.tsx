import { Metadata } from "next";
import Link from "next/link";
import { Scale, ArrowLeft, AlertCircle, FileCheck, ShieldAlert, Building2, HelpCircle } from "lucide-react";

export const metadata: Metadata = {
  title: "서비스 이용약관 및 데이터 면책조항 | 서울시 정비사업 모니터링",
  description:
    "서울시 정비사업 & 신통·모아 통합 모니터링 플랫폼의 서비스 이용약관, 공공데이터 출처 및 투자 책임 한계(면책조항) 안내",
};

export default function TermsPage() {
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
          <div className="w-12 h-12 rounded-2xl bg-indigo-600 flex items-center justify-center text-white shadow-md shadow-indigo-600/20">
            <Scale className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#2B261F] tracking-tight">
              이용약관 및 데이터 면책조항
            </h1>
            <p className="text-xs text-[#827A6D] mt-1">시행일자: 2026년 10월 4일 (최신 고시 기준)</p>
          </div>
        </div>

        {/* 중요 면책 강조 안내 박스 */}
        <div className="p-4 sm:p-5 rounded-2xl bg-[#FDF3E7] border border-[#F5D5B8] text-xs text-[#8D3B00] leading-relaxed space-y-1.5">
          <div className="flex items-center gap-2 font-bold text-sm">
            <AlertCircle className="w-4 h-4 shrink-0 text-[#8D3B00]" />
            <span>정비사업 데이터 이용 시 주의사항 (필독)</span>
          </div>
          <p>
            본 플랫폼이 제공하는 서울시 496개 정비구역 공간 정보, 인허가 추진단계, 권리산정일, 세대수 및 입주권 승계 안전성 자가진단 리포트는 <strong>시민의 알 권리 증진과 정책 모니터링을 위한 단순 참고용 공공데이터 시각화 서비스</strong>입니다. 본 플랫폼의 정보는 법적 효력을 갖는 행정처분 문서가 아니며, 투자 판단이나 부동산 매매 계약 체결의 근거로 사용될 수 없습니다.
          </p>
        </div>

        {/* 제1조 (목적) */}
        <section className="p-6 sm:p-8 rounded-3xl bg-[#FFFFFF] border border-[#E6E0D2] shadow-sm space-y-3">
          <div className="flex items-center gap-2 pb-3 border-b border-[#EFECE4]">
            <FileCheck className="w-5 h-5 text-blue-600" />
            <h2 className="text-base sm:text-lg font-bold text-[#2B261F]">
              제1조 (목적)
            </h2>
          </div>
          <div className="text-xs text-[#4A4439] space-y-2 leading-relaxed">
            <p>
              본 약관은 "서울시 정비사업 &amp; 신통·모아 통합 모니터링 플랫폼"(이하 "서비스")이 제공하는 서울시 관내 재개발, 재건축, 신속통합기획, 모아타운 등 도시정비사업 공간정보 및 분석 리포트의 이용 조건과 권리·의무, 책임 한계 및 법적 면책에 관한 제반 사항을 규정함을 목적으로 합니다.
            </p>
          </div>
        </section>

        {/* 제2조 (공공데이터 출처 및 수집 범위) */}
        <section className="p-6 sm:p-8 rounded-3xl bg-[#FFFFFF] border border-[#E6E0D2] shadow-sm space-y-3">
          <div className="flex items-center gap-2 pb-3 border-b border-[#EFECE4]">
            <Building2 className="w-5 h-5 text-emerald-600" />
            <h2 className="text-base sm:text-lg font-bold text-[#2B261F]">
              제2조 (공공데이터 출처 및 수집)
            </h2>
          </div>
          <div className="text-xs text-[#4A4439] space-y-2 leading-relaxed">
            <p>
              본 서비스는 공공기관이 공개하는 합법적인 오픈데이터를 정제하여 제공합니다:
            </p>
            <ul className="list-disc pl-5 space-y-1 text-[#4A4439]">
              <li><strong>서울시 정비사업 정보몽땅</strong>(cleanup.seoul.go.kr): 정비사업 구역별 추진위원회·조합설립·사업시행인가·관리처분인가 등 추진 단계 및 총회 공시 정보</li>
              <li><strong>서울 열린데이터광장</strong>(data.seoul.go.kr): 서울시 25개 자치구 정비구역 공간 경계(GIS GeoJSON) 및 기본 개요</li>
              <li><strong>서울특별시 도시계획포털</strong>: 신속통합기획 및 모아타운 후보지 선정·권리산정기준일 고시 자료</li>
            </ul>
          </div>
        </section>

        {/* 제3조 (정비사업 데이터 법적 면책 조항 - 핵심) */}
        <section className="p-6 sm:p-8 rounded-3xl bg-[#FFFFFF] border border-[#E6E0D2] shadow-sm space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-[#EFECE4]">
            <ShieldAlert className="w-5 h-5 text-rose-600" />
            <h2 className="text-base sm:text-lg font-bold text-[#2B261F]">
              제3조 (정비사업 데이터 법적 면책 및 한계 - Disclaimers)
            </h2>
          </div>
          <div className="text-xs text-[#4A4439] space-y-3 leading-relaxed">
            <p>
              이용자는 본 서비스를 이용함에 있어 다음 각 호의 법적 면책 사항을 충분히 인지하고 동의한 것으로 간주합니다:
            </p>
            <ol className="list-decimal pl-5 space-y-2.5">
              <li>
                <strong>데이터 정확성 및 시의성의 한계</strong>: 본 서비스의 데이터는 서울시 및 각 자치구청의 공공 고시 자료 갱신 시점에 따라 실제 현장 추진 상황과 일시적인 시차가 발생할 수 있습니다. 운영자는 데이터의 최신성, 완전성, 무결성을 보증하지 않습니다.
              </li>
              <li>
                <strong>입주권 승계 안전성 자가진단 한계</strong>: 본 서비스가 제공하는 「도시 및 주거환경정비법」 제39조 기준 조합원 지위양도 가능 여부 및 권리산정일 자가진단 결과는 표준 법령에 따른 보조적 해석일 뿐이며, 개별 물건의 원조합원 보유·거주 기간, 상속 여부, 지분쪼개기 건축허가일 등에 따라 입주권 자격이 상이할 수 있습니다.
              </li>
              <li>
                <strong>계약 전 관할 관청 직접 대조 의무</strong>: 이용자는 부동산 매매, 분양권 전매, 권리 승계 등 일체의 법률·재산상 행위를 진행하기 전, 반드시 <strong>해당 자치구청 정비사업과 및 관할 조합</strong>을 통해 공식 인허가 대장과 조합원 지위 승계 자격을 직접 확인하여야 합니다.
              </li>
              <li>
                <strong>투자 손실에 대한 면책</strong>: 본 서비스의 운영자는 이용자가 본 사이트에 수록된 정보에 의존하여 행한 모든 투자 판단, 자금 집행, 계약 체결 등으로 인해 발생한 어떠한 직·간접적 재산상 손실이나 법적 분쟁에 대해서도 일체의 법적 책임을 지지 않습니다.
              </li>
            </ol>
          </div>
        </section>

        {/* 제4조 (저작권 및 서비스 이용 제한) */}
        <section className="p-6 sm:p-8 rounded-3xl bg-[#FFFFFF] border border-[#E6E0D2] shadow-sm space-y-3">
          <div className="flex items-center gap-2 pb-3 border-b border-[#EFECE4]">
            <Scale className="w-5 h-5 text-blue-600" />
            <h2 className="text-base sm:text-lg font-bold text-[#2B261F]">
              제4조 (지적재산권 및 서비스 이용 제한)
            </h2>
          </div>
          <div className="text-xs text-[#4A4439] space-y-2 leading-relaxed">
            <p>
              1. 본 서비스가 독자적으로 작성한 리포트 해설, 알고리즘, 디자인 UI, 사이트 구성 요소의 저작권은 서비스 운영자에게 귀속됩니다.
            </p>
            <p>
              2. 공공누리(KOGL) 라이선스가 적용된 원본 공공데이터는 관련 라이선스 규정을 따릅니다.
            </p>
            <p>
              3. 이용자는 운영자의 사전 승인 없이 본 서비스의 데이터를 크롤링, 상업적 무단 재배포, 역공학 등을 통해 복제·판매할 수 없습니다.
            </p>
          </div>
        </section>

        {/* 제5조 (문의처) */}
        <section className="p-6 sm:p-8 rounded-3xl bg-[#FFFFFF] border border-[#E6E0D2] shadow-sm space-y-3">
          <div className="flex items-center gap-2 pb-3 border-b border-[#EFECE4]">
            <HelpCircle className="w-5 h-5 text-indigo-600" />
            <h2 className="text-base sm:text-lg font-bold text-[#2B261F]">
              제5조 (문의 및 피드백)
            </h2>
          </div>
          <div className="text-xs text-[#4A4439] space-y-2 leading-relaxed">
            <p>
              서비스 이용약관, 데이터 정정 요청, 서비스 개선 제안은 아래 공식 이메일로 접수해 주시기 바랍니다:
            </p>
            <p className="font-semibold text-[#2B261F]">
              📧 공식 문의처: <a href="mailto:editor823@gmail.com" className="text-blue-600 underline font-mono">editor823@gmail.com</a>
            </p>
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
