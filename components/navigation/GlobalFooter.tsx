import Link from "next/link";
import { Shield, Mail, FileText, Info, Building2, ExternalLink } from "lucide-react";

export function GlobalFooter() {
  return (
    <footer className="w-full border-t border-gray-200 bg-white text-gray-600 text-xs py-8 px-4 sm:px-8 mt-auto shrink-0 select-none">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-start justify-between gap-6">
        {/* 서비스 정보 & 소개 */}
        <div className="space-y-2 max-w-md">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-blue-600 text-white flex items-center justify-center font-black text-[11px]">
              서경
            </div>
            <span className="font-extrabold text-sm text-gray-900 tracking-tight">
              서울 경기 부동산 정비사업 모니터링
            </span>
          </div>
          <p className="text-gray-500 text-[11px] leading-relaxed">
            서울시 25개 자치구 및 경기도 31개 시·군 내 1,029개 법정 정비구역(재개발·재건축·신속통합기획·모아타운)의
            인허가 단계, 권리산정기준일, 조합원 지위양도 승계 안전성 및 세대수 공간 데이터를 투명하게 통합 제공합니다.
          </p>
          <p className="text-gray-400 text-[10px]">
            데이터 출처: 서울시 정비사업 정보몽땅, 서울시 클린업시스템, 경기부동산포털, 국토교통부 공공데이터포털
          </p>
        </div>

        {/* 법적 고지 & 필수 정책 링크 (애드센스 필수 승인 규정 준수) */}
        <div className="flex flex-col sm:flex-row gap-6 sm:gap-12">
          <div className="space-y-2">
            <span className="text-[11px] font-bold text-gray-900 uppercase tracking-wider block">
              서비스 안내 & 지원
            </span>
            <ul className="space-y-1.5 text-[11px]">
              <li>
                <Link
                  href="/"
                  className="hover:text-blue-600 transition-colors flex items-center gap-1 font-medium"
                >
                  <Building2 className="w-3 h-3 text-blue-500" />
                  <span>수도권 정비사업 공간 지도</span>
                </Link>
              </li>
              <li>
                <Link
                  href="/districts/"
                  className="hover:text-blue-600 transition-colors flex items-center gap-1 font-medium"
                >
                  <FileText className="w-3 h-3 text-emerald-500" />
                  <span>1,029개 구역별 분석 리포트</span>
                </Link>
              </li>
              <li>
                <Link
                  href="/subscription"
                  className="hover:text-blue-600 transition-colors flex items-center gap-1 font-medium"
                >
                  <Building2 className="w-3 h-3 text-violet-500" />
                  <span>수도권 아파트 분양 &amp; 청약 라운지</span>
                </Link>
              </li>
              <li>
                <Link
                  href="/calculators"
                  className="hover:text-blue-600 transition-colors flex items-center gap-1 font-medium"
                >
                  <Info className="w-3 h-3 text-amber-500" />
                  <span>부동산 금융·세무 계산기 3종</span>
                </Link>
              </li>
              <li>
                <Link
                  href="/about"
                  className="hover:text-blue-600 transition-colors flex items-center gap-1 font-medium"
                >
                  <Info className="w-3 h-3 text-blue-500" />
                  <span>서비스 소개 &amp; 편집 원칙</span>
                </Link>
              </li>
              <li>
                <Link
                  href="/contact"
                  className="hover:text-blue-600 transition-colors flex items-center gap-1 font-medium"
                >
                  <Mail className="w-3 h-3 text-emerald-500" />
                  <span>문의하기 &amp; 데이터 제보</span>
                </Link>
              </li>
            </ul>
          </div>

          <div className="space-y-2">
            <span className="text-[11px] font-bold text-gray-900 uppercase tracking-wider block">
              법적 정책 & 규정 준수
            </span>
            <ul className="space-y-1.5 text-[11px]">
              <li>
                <Link
                  href="/privacy"
                  className="hover:text-blue-600 transition-colors flex items-center gap-1 font-semibold text-gray-800"
                >
                  <Shield className="w-3 h-3 text-blue-600" />
                  <span>개인정보처리방침 (AdSense 준수)</span>
                </Link>
              </li>
              <li>
                <Link
                  href="/terms"
                  className="hover:text-blue-600 transition-colors flex items-center gap-1"
                >
                  <FileText className="w-3 h-3 text-gray-400" />
                  <span>이용약관 & 면책조항</span>
                </Link>
              </li>
              <li>
                <a
                  href="https://policies.google.com/technologies/ads"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-blue-600 transition-colors flex items-center gap-1 text-[10px] text-gray-400"
                >
                  <span>Google 광고 정책</span>
                  <ExternalLink className="w-2.5 h-2.5" />
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto pt-6 mt-6 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-gray-400 text-[11px]">
        <span>© 2026 서울 경기 부동산 정비사업 모니터링 플랫폼. All rights reserved.</span>
        <span>운영자 문의: tkdgus8231@gmail.com</span>
      </div>
    </footer>
  );
}
