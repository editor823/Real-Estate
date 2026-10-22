"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { LeftFilterPanel } from "@/components/sidebar/LeftFilterPanel";
import { DistrictFeature, DistrictFeatureCollection } from "@/lib/types/district";
import { DISTRICTS_GEOJSON } from "@/lib/constants/districtsData";
import { useFilterStore } from "@/lib/store/useFilterStore";
import { useMapStore } from "@/lib/store/useMapStore";
import { DistrictCard } from "@/components/sidebar/DistrictCard";
import { CompareFloatingBar } from "@/components/compare/CompareFloatingBar";
import { CompareModal } from "@/components/compare/CompareModal";
import { PrivacyPolicyModal } from "@/components/legal/PrivacyPolicyModal";
import { HomeLandingSection } from "@/components/home/HomeLandingSection";
import { GlobalFooter } from "@/components/navigation/GlobalFooter";
import Link from "next/link";
import { ChevronLeft, ChevronRight, Loader2, Shield, Info } from "lucide-react";
import { cn } from "@/lib/utils";

const SEOUL_25_GUS = [
  "강남구", "강동구", "강북구", "강서구", "관악구", "광진구", "구로구", "금천구",
  "노원구", "도봉구", "동대문구", "동작구", "마포구", "서대문구", "서초구", "성동구",
  "성북구", "송파구", "양천구", "영등포구", "용산구", "은평구", "종로구", "중구", "중랑구"
];

// Leaflet 지도는 브라우저 전용 라이브러리이므로 SSR(서버 렌더링)을 비활성화합니다.
const InteractiveLeafletMap = dynamic(
  () => import("@/components/map/InteractiveLeafletMap"),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-full flex flex-col items-center justify-center bg-slate-900 text-slate-400 gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
        <span className="text-xs font-semibold">정비사업 구역 공간 GeoJSON을 불러오는 중입니다...</span>
      </div>
    ),
  }
);

export default function MainPage() {
  // 모바일에서는 지도가 처음부터 100% 꽉 차도록 기본 false로 시작, 데스크톱에서만 펼침
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isPrivacyModalOpen, setIsPrivacyModalOpen] = useState(false);
  // 정적 모듈에서 496개 전체 구역 데이터를 즉시 로드 (로딩 지연 0초 및 네트워크 의존성 제거)
  const [features, setFeatures] = useState<DistrictFeature[]>(DISTRICTS_GEOJSON.features || []);
  const [isLoading, setIsLoading] = useState(false);

  const {
    searchQuery,
    selectedGu,
    bizType,
    minHouseholds,
    isConsentFilterActive,
    transferableOnly,
    publicAdjacentOnly,
  } = useFilterStore();
  const {
    selectedDistrict,
    setSelectedUid,
    setSelectedDistrict,
    setFlyToTarget,
  } = useMapStore();

  // 최신 정적 GeoJSON 파일이 있을 경우 비동기 보정 동기화 (기존 데이터보다 적은 옛날 캐시 데이터로 축소되는 것 원천 방지)
  useEffect(() => {
    async function loadDistricts() {
      try {
        const response = await fetch("/data/districts.geojson");
        if (response.ok) {
          const data: DistrictFeatureCollection = await response.json();
          if (data.features && data.features.length >= DISTRICTS_GEOJSON.features.length) {
            setFeatures(data.features);
          }
        }
      } catch {
        // 이미 DISTRICTS_GEOJSON으로 초기화되어 있으므로 오류 무시
      }
    }
    loadDistricts();
  }, []);

  // 2. 검색 및 필터 조건에 맞춘 GeoJSON Feature 필터링
  const filteredFeatures = features.filter((f) => {
    const props = f.properties;
    if (searchQuery.trim() !== "") {
      const q = searchQuery.toLowerCase();
      const matchName = props.name.toLowerCase().includes(q);
      const matchDong = props.legal_dong.toLowerCase().includes(q);
      const matchJibun = (props.address_jibun || "").toLowerCase().includes(q);
      if (!matchName && !matchDong && !matchJibun) return false;
    }
    if (selectedGu !== "ALL" && props.gu !== selectedGu) return false;
    if (bizType !== "ALL" && props.biz_type !== bizType) return false;
    if (minHouseholds > 0 && (!props.total_households || props.total_households < minHouseholds)) {
      return false;
    }
    if (isConsentFilterActive && (!props.consent_rate || props.consent_rate < 70)) return false;
    if (transferableOnly && !props.is_transferable) return false;
    if (publicAdjacentOnly && !props.is_adjacent_public) return false;
    return true;
  });

  // 데스크톱(768px 이상)에서는 사이드바 기본 열림 처리
  useEffect(() => {
    if (typeof window !== "undefined" && window.innerWidth >= 768) {
      setIsSidebarOpen(true);
    }
  }, []);

  // 사이드바 개폐 애니메이션 완료(300ms) 시 지도 크기 동기화 트리거
  useEffect(() => {
    const timer = setTimeout(() => {
      if (typeof window !== "undefined") {
        window.dispatchEvent(new Event("resize"));
      }
    }, 320);
    return () => clearTimeout(timer);
  }, [isSidebarOpen]);

  // URL 쿼리 파라미터(?id=구역ID 또는 ?tab=timeline 등) 접근 시 자동 처리
  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      if (params.get("tab") === "timeline") {
        setIsSidebarOpen(true);
      }
      const targetId = params.get("id") || params.get("district") || params.get("uid");
      if (targetId) {
        const found = features.find(
          (f) => f.properties.master_uid === targetId || f.id === targetId
        );
        if (found) {
          setSelectedUid(found.properties.master_uid);
          setSelectedDistrict(found.properties);
          if (found.properties.centroid) {
            setFlyToTarget([found.properties.centroid[1], found.properties.centroid[0]]);
          }
        }
      }
    }
  }, [features, setSelectedUid, setSelectedDistrict, setFlyToTarget]);

  // 지도에서 마커나 폴리곤을 클릭하여 구역이 선택되면 사이드바를 자동으로 열어 단일 패널로 매끄럽게 상세 정보 표시
  useEffect(() => {
    if (selectedDistrict) {
      setIsSidebarOpen(true);
    }
  }, [selectedDistrict]);

  return (
    <div className="w-full min-h-screen bg-slate-50 flex flex-col">
      {/* 0. 접근성 및 검색엔진(SEO) 크롤러를 위한 시맨틱 구조와 25개 자치구 내부링크 네트워크 */}
      <header className="sr-only">
        <h1>서울시 정비사업 &amp; 신속통합기획·모아타운 모니터링 지도</h1>
        <p>
          서울시 25개 자치구 내 496개 법정 정비구역(재개발·재건축)과 신통기획·모아타운 후보지의 
          인허가 단계 변화, 권리산정기준일, 조합원 지위양도 승계 안전성 및 세대수 데이터를 실시간 통합 제공합니다.
        </p>
        <nav aria-label="서울시 25개 자치구 정비사업 현황 리포트 바로가기">
          <h2>서울시 25개 자치구별 정비사업 리포트</h2>
          <ul>
            {SEOUL_25_GUS.map((gu) => (
              <li key={gu}>
                <Link href={`/districts/gu/${encodeURIComponent(gu)}/`}>
                  {gu} 재개발·신통기획·모아타운 구역 현황 리포트
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <nav aria-label="구역별 분석 리포트 색인">
          <Link href="/districts/">
            서울시 496개 정비사업 구역별 정밀 분석 리포트 전체 색인
          </Link>
        </nav>
        <nav aria-label="수도권 아파트 분양 & 청약 라운지">
          <Link href="/subscription">
            수도권 아파트 분양 &amp; 청약 라운지 (신축 분양 캘린더, 장기전세 미리내집, 84점 만점 가점 진단기)
          </Link>
        </nav>
      </header>

      {/* 1. 상단 웰컴 가이드 배너: 첫 방문자에게 사이트 정체성과 가이드를 알리는 슬림 바 */}
      <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 text-white px-3 sm:px-6 py-2 flex items-center justify-between gap-3 text-xs border-b border-slate-800 shrink-0 select-none shadow-xs">
        <div className="flex items-center gap-2 overflow-hidden text-ellipsis whitespace-nowrap">
          <span className="px-1.5 py-0.5 rounded bg-blue-600 text-white text-[10px] font-bold">안내</span>
          <span className="font-semibold text-slate-200 text-[11px] sm:text-xs truncate">
            서울·경기 {features.length}개 재개발·재건축 실시간 인허가 공간 지도 &amp; 분석 플랫폼
          </span>
        </div>
        <button
          type="button"
          onClick={() => {
            const landingElem = document.getElementById("home-landing-guide");
            landingElem?.scrollIntoView({ behavior: "smooth" });
          }}
          className="shrink-0 text-[11px] sm:text-xs font-bold text-blue-300 hover:text-white flex items-center gap-1 underline decoration-blue-400 cursor-pointer transition-colors"
        >
          <span>서비스 소개 &amp; 가이드 보기 ↓</span>
        </button>
      </div>

      {/* 2. 메인 지도 작업 영역 (기존 인터랙티브 지도 유지) */}
      <main className="relative w-full h-[calc(100vh-92px)] min-h-[580px] flex overflow-hidden bg-slate-50 shrink-0">
        {/* 좌측 필터 & 구역 목록 & 실시간 타임라인 패널 */}
        <LeftFilterPanel
          features={features}
          isOpen={isSidebarOpen}
          onToggle={() => setIsSidebarOpen(!isSidebarOpen)}
          onOpenPrivacy={() => setIsPrivacyModalOpen(true)}
        />

        {/* 패널 접기/펼치기 토글 버튼 (데스크톱 및 모바일 접힘 시) */}
        <button
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className={cn(
            "absolute top-4 sm:top-6 z-[650] py-2 px-2.5 rounded-r-2xl bg-white/95 backdrop-blur-md border-r border-y border-gray-200 shadow-md text-gray-600 hover:text-blue-600 transition-all cursor-pointer flex items-center gap-1.5",
            isSidebarOpen ? "hidden sm:flex left-[502px]" : "left-0 sm:left-[72px]"
          )}
          title={isSidebarOpen ? "좌측 패널 접기" : "좌측 패널 펼치기"}
          aria-label={isSidebarOpen ? "좌측 패널 접기" : "좌측 패널 펼치기"}
        >
          {isSidebarOpen ? (
            <ChevronLeft className="w-4 h-4" />
          ) : (
            <>
              <ChevronRight className="w-4 h-4 text-blue-600" />
              <span className="text-xs font-bold text-gray-800 pr-0.5">목록 & 필터</span>
            </>
          )}
        </button>

        {/* 우측 인터랙티브 지도 영역 */}
        <section className="relative flex-1 h-full w-full overflow-hidden" aria-label="서울시 정비사업 공간 지도">
          {isLoading ? (
            <div className="w-full h-full flex flex-col items-center justify-center bg-slate-50 text-gray-500 gap-3">
              <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
              <span className="text-xs font-semibold">서울시 정비구역 공간 데이터를 불러오는 중...</span>
            </div>
          ) : (
            <InteractiveLeafletMap features={filteredFeatures} />
          )}

          {/* 데스크톱: 지도 하단 서비스 소개 가이드 스크롤 퀵버튼 */}
          <button
            type="button"
            onClick={() => {
              const landingElem = document.getElementById("home-landing-guide");
              landingElem?.scrollIntoView({ behavior: "smooth" });
            }}
            className="hidden sm:flex items-center gap-1.5 absolute bottom-4 right-14 z-[450] bg-white/95 backdrop-blur-md border border-slate-200/90 shadow-md rounded-2xl px-3 py-2 text-slate-800 text-xs font-bold hover:bg-slate-50 hover:text-blue-600 transition-all cursor-pointer"
          >
            <span>📖 서비스 소개 및 가이드 보기 ↓</span>
          </button>
        </section>

        {/* 모바일 화면 하단 플로팅 전환 바 (모바일 UX 최적화) */}
        <div className="sm:hidden absolute bottom-5 left-1/2 -translate-x-1/2 z-[550] flex items-center gap-2">
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-white/95 backdrop-blur-md text-gray-900 text-xs font-bold shadow-xl border border-gray-200 hover:bg-gray-50 transition-all active:scale-95 cursor-pointer"
          >
            {isSidebarOpen ? "🗺️ 지도로 보기" : "📋 구역 목록 / 고시 피드"}
          </button>
          <button
            onClick={() => {
              const landingElem = document.getElementById("home-landing-guide");
              landingElem?.scrollIntoView({ behavior: "smooth" });
            }}
            className="flex items-center gap-1 px-3.5 py-2.5 rounded-full bg-slate-900 text-white text-xs font-bold shadow-xl hover:bg-slate-800 transition-all active:scale-95 cursor-pointer"
          >
            <span>소개 ↓</span>
          </button>
        </div>

        {/* 구역 비교 하단 플로팅 바 & 비교 모달 */}
        <CompareFloatingBar />
        <CompareModal />

        {/* 구글 애드센스 필수 개인정보처리방침 안내 모달 */}
        <PrivacyPolicyModal
          isOpen={isPrivacyModalOpen}
          onClose={() => setIsPrivacyModalOpen(false)}
        />
      </main>

      {/* 3. 하단 풍부한 서비스 소개 및 구글 애드센스 승인용 랜딩 섹션 */}
      <div id="home-landing-guide">
        <HomeLandingSection
          totalDistrictCount={features.length}
          onScrollToTopMap={() => {
            window.scrollTo({ top: 0, behavior: "smooth" });
          }}
        />
      </div>

      {/* 4. 글로벌 푸터 */}
      <GlobalFooter />
    </div>
  );
}
