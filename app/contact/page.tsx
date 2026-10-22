import { Metadata } from "next";
import Link from "next/link";
import { Mail, ArrowLeft, MessageSquare, AlertCircle, Clock, ShieldCheck, CheckCircle2 } from "lucide-react";
import { GlobalFooter } from "@/components/navigation/GlobalFooter";

export const metadata: Metadata = {
  title: "문의하기 & 데이터 오류 제보 창구 | 서울 경기 부동산 정비사업 모니터링",
  description:
    "서울·경기 1,029개 정비사업 구역 정보 오류 제보, 인허가 고시 업데이트 요청, 광고 및 비즈니스 제휴 문의를 남기실 수 있는 공식 소통 창구입니다.",
  alternates: {
    canonical: "https://seoul-redevelopment.pages.dev/contact/",
  },
};

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-slate-50 text-gray-900 flex flex-col font-sans">
      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-10 flex-1 space-y-10">
        {/* 상단 헤더 */}
        <div className="border-b border-gray-200 pb-8 space-y-3">
          <div className="flex items-center gap-2">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-white hover:bg-gray-100 border border-gray-200 text-xs font-bold text-gray-700 transition-all shadow-2xs active:scale-95"
            >
              <ArrowLeft className="w-3.5 h-3.5 text-blue-600" />
              <span>지도로 돌아가기</span>
            </Link>
            <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200">
              Contact & Support
            </span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-extrabold text-gray-900 tracking-tight">
            문의하기 & 데이터 제보
          </h1>
          <p className="text-gray-600 text-sm sm:text-base leading-relaxed">
            서울·경기 정비사업 모니터링 플랫폼은 이용자분들의 참여로 더욱 정확해집니다.
            구역 정보 오류 수정 요청, 새로운 고시 제보, 서비스 개선 의견을 편하게 남겨주세요.
          </p>
        </div>

        {/* 1. 빠른 소통 채널 카드 3개 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-sm space-y-2">
            <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-lg">
              ✉️
            </div>
            <h3 className="font-bold text-gray-900 text-sm">공식 관리자 이메일</h3>
            <p className="text-xs text-gray-500 leading-relaxed">
              가장 빠르고 정확한 회신을 받으실 수 있는 대표 공식 이메일입니다.
            </p>
            <a
              href="mailto:tkdgus8231@gmail.com"
              className="text-xs sm:text-sm font-extrabold text-blue-600 hover:underline block pt-2 break-all"
            >
              tkdgus8231@gmail.com
            </a>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-sm space-y-2">
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold text-lg">
              ⏱️
            </div>
            <h3 className="font-bold text-gray-900 text-sm">처리 및 회신 기준</h3>
            <p className="text-xs text-gray-500 leading-relaxed">
              접수된 모든 데이터 검증 및 문의는 <strong>영업일 기준 24~48시간 이내</strong>에 면밀히 검토 후 처리됩니다.
            </p>
            <span className="text-[11px] font-bold text-emerald-600 block pt-2">
              ✓ 신속 검토 및 DB 반영
            </span>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-sm space-y-2">
            <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold text-lg">
              🛡️
            </div>
            <h3 className="font-bold text-gray-900 text-sm">개인정보 보호 준수</h3>
            <p className="text-xs text-gray-500 leading-relaxed">
              문의 접수 시 수집된 이메일과 정보는 상담 처리 목적으로만 사용되며, 즉시 안전하게 파기됩니다.
            </p>
            <Link
              href="/privacy"
              className="text-[11px] font-bold text-amber-700 hover:underline block pt-2"
            >
              개인정보처리방침 확인 →
            </Link>
          </div>
        </div>

        {/* 2. 주요 문의 유형 가이드 */}
        <section className="bg-white p-6 sm:p-8 rounded-3xl border border-gray-200 shadow-sm space-y-4">
          <h2 className="text-base sm:text-lg font-bold text-gray-900 flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-blue-600" />
            <span>이런 내용들을 제보해 주세요</span>
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs sm:text-sm text-gray-600">
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
              <strong className="text-gray-900 block font-semibold">1. 인허가 고시 변경 누락 제보</strong>
              <p className="text-gray-500 text-xs">최근 고시된 조합설립인가, 사업시행인가, 관리처분인가 등 지자체 고시문 링크 첨부 시 즉시 반영</p>
            </div>
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
              <strong className="text-gray-900 block font-semibold">2. 구역 경계 및 공간 좌표 오기입 수정</strong>
              <p className="text-gray-500 text-xs">구역 폴리곤 모양이나 법정동 지번이 잘못 표기된 경우 정정 요청</p>
            </div>
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
              <strong className="text-gray-900 block font-semibold">3. 입주권 전매제한 및 권리산정일 문의</strong>
              <p className="text-gray-500 text-xs">특정 구역의 조합원 지위양도 승계 여부 판정 로직에 대한 사실 확인 및 추가 의견</p>
            </div>
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
              <strong className="text-gray-900 block font-semibold">4. 기능 제안 및 비즈니스 제휴</strong>
              <p className="text-gray-500 text-xs">신규 편의기능(계산기, 알림 등) 건의 및 부동산 데이터 협업 제휴 문의</p>
            </div>
          </div>

          <div className="pt-4 border-t border-gray-100 text-center">
            <a
              href="mailto:tkdgus8231@gmail.com?subject=[서울경기정비사업] 문의 및 데이터 제보"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs sm:text-sm shadow-md shadow-blue-500/20 transition-all active:scale-95"
            >
              <Mail className="w-4 h-4" />
              <span>관리자에게 이메일 바로 보내기 (tkdgus8231@gmail.com)</span>
            </a>
          </div>
        </section>
      </main>

      <GlobalFooter />
    </div>
  );
}
