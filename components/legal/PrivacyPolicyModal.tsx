"use client";

import { X, Shield, ExternalLink, Lock } from "lucide-react";
import Link from "next/link";

interface PrivacyPolicyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function PrivacyPolicyModal({ isOpen, onClose }: PrivacyPolicyModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-2xl max-h-[85vh] bg-white rounded-3xl shadow-2xl border border-gray-200 overflow-hidden flex flex-col animate-in zoom-in-95 duration-200 text-gray-900"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 모달 헤더 */}
        <div className="p-5 border-b border-gray-200 flex items-center justify-between bg-gray-50 text-gray-900">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-md shadow-blue-500/30">
              <Shield className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-gray-900">개인정보처리방침 (Privacy Policy)</h2>
              <p className="text-[11px] text-gray-500">구글 애드센스(Google AdSense) 및 개인정보 보호 규정 준수</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors cursor-pointer"
            aria-label="닫기"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 모달 본문 (스크롤 영역) */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5 text-xs text-gray-700 leading-relaxed bg-white">
          <div className="p-3.5 rounded-2xl bg-blue-50 border border-blue-200 text-blue-900 font-medium">
            본 서비스(서울시 정비사업 & 신통·모아 통합 모니터링 플랫폼)는 이용자의 개인정보를 중요시하며, 「개인정보 보호법」 및 구글 애드센스(Google AdSense) 정책을 준수합니다.
          </div>

          {/* 1. 구글 애드센스 및 제3자 광고 쿠키 정책 (핵심 필수 조항) */}
          <section className="space-y-2">
            <h3 className="text-sm font-bold text-gray-900 flex items-center gap-1.5">
              <Lock className="w-4 h-4 text-blue-600" />
              1. 구글 애드센스(Google AdSense) 및 쿠키(Cookie) 정책
            </h3>
            <p className="text-gray-700">
              본 웹사이트는 웹사이트 운영 및 유지를 위해 제3자 광고 공급업체인 <strong>구글(Google Inc.)</strong>의 애드센스 광고를 게재할 수 있습니다.
            </p>
            <ul className="list-disc pl-5 space-y-1 text-gray-600">
              <li>
                구글을 포함한 제3자 공급업체는 <strong>쿠키(Cookie)</strong>를 사용하여 이용자의 이전 방문 기록(본 웹사이트 또는 다른 웹사이트 방문 내역)을 바탕으로 맞춤형 광고를 게재합니다.
              </li>
              <li>
                구글의 광고 쿠키 사용을 통해 구글과 파트너사는 인터넷상의 방문 기록을 기반으로 이용자에게 적절한 광고를 제공할 수 있습니다.
              </li>
              <li>
                <strong>맞춤 광고 수신 거부(옵트아웃)</strong>: 이용자는 언제든지{" "}
                <a
                  href="https://adssettings.google.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 font-bold underline inline-flex items-center gap-0.5"
                >
                  Google 광고 설정 <ExternalLink className="w-3 h-3" />
                </a>
                을 방문하여 개인 맞춤형 광고 게재를 비활성화하거나 거부할 수 있습니다. (또는{" "}
                <a
                  href="https://www.aboutads.info"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 font-bold underline"
                >
                  www.aboutads.info
                </a>{" "}
                를 통해 제3자 공급업체의 쿠키 사용을 차단할 수 있습니다.)
              </li>
            </ul>
          </section>

          {/* 2. 자동 수집되는 정보 항목 */}
          <section className="space-y-2">
            <h3 className="text-sm font-bold text-gray-900">2. 수집하는 로그 정보 항목 및 목적</h3>
            <p className="text-gray-700">
              본 플랫폼은 회원가입이나 민감한 개인 식별 정보를 요구하지 않습니다. 다만 서비스 품질 향상 및 보안 모니터링을 위해 다음 정보가 인터넷 이용 과정에서 자동으로 생성되어 수집될 수 있습니다:
            </p>
            <ul className="list-disc pl-5 space-y-1 text-gray-600">
              <li>접속 IP 주소, 브라우저 종류 및 OS 정보, 서비스 방문 일시, 불량 이용 기록</li>
              <li>수집 목적: 부정 이용 방지, 웹사이트 성능 및 트래픽 통계 분석</li>
            </ul>
          </section>

          {/* 3. 데이터 출처 및 법적 고지 (면책 사항) */}
          <section className="space-y-2">
            <h3 className="text-sm font-bold text-gray-900">3. 정비사업 데이터 출처 및 면책 고지</h3>
            <p className="text-gray-700">
              본 플랫폼에서 제공하는 서울시 496개 정비구역 정보는 <strong>서울시 정비사업 정보몽땅(cleanup.seoul.go.kr)</strong> 및 <strong>서울 열린데이터광장</strong>의 공개 데이터를 가공하여 제공됩니다.
            </p>
            <p className="text-gray-500">
              제공되는 모든 통계, 단계, 타임라인 및 입주권 진단 내용은 대중의 이해를 돕기 위한 <strong>참고용 자료</strong>이며, 법률적 효력을 갖지 않습니다. 실제 부동산 매매 및 권리 관계 확정 전 반드시 관할 구청 및 조합의 정식 공고문을 확인하시기 바랍니다.
            </p>
          </section>

          {/* 4. 문의처 */}
          <section className="space-y-2 pt-2 border-t border-gray-200">
            <h3 className="text-sm font-bold text-gray-900">4. 개인정보 보호 담당자 및 문의</h3>
            <p className="text-gray-600">
              서비스 이용 관련 제안 또는 개인정보 처리에 관한 문의 사항은 아래로 연락해 주시기 바랍니다:
            </p>
            <p className="font-semibold text-gray-800">
              📧 이메일: <span className="text-blue-600 font-mono">editer0823@naver.com</span>
            </p>
          </section>
        </div>

        {/* 모달 하단 푸터 */}
        <div className="p-4 border-t border-gray-200 bg-gray-50 flex items-center justify-between">
          <Link
            href="/privacy"
            onClick={onClose}
            className="text-xs font-semibold text-blue-600 hover:underline flex items-center gap-1"
          >
            <span>전체 페이지로 보기 (/privacy)</span>
            <ExternalLink className="w-3 h-3" />
          </Link>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-colors cursor-pointer"
          >
            확인 및 닫기
          </button>
        </div>
      </div>
    </div>

  );
}
