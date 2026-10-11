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
import Link from "next/link";
import { ChevronLeft, ChevronRight, Loader2, Shield } from "lucide-react";
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
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
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

  // 모바일 화면 초기 진입 시 지도가 먼저 보이도록 처리
  useEffect(() => {
    if (typeof window !== "undefined" && window.innerWidth < 768) {
      setIsSidebarOpen(false);
    }
  }, []);

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

  return (
    <main className="relative w-full h-[calc(100vh-56px)] flex overflow-hidden bg-slate-50">
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
      </header>

      {/* 1. 좌측 필터 & 구역 목록 & 실시간 타임라인 패널 */}
      <LeftFilterPanel
        features={features}
        isOpen={isSidebarOpen}
        onToggle={() => setIsSidebarOpen(!isSidebarOpen)}
        onOpenPrivacy={() => setIsPrivacyModalOpen(true)}
      />

      {/* 2. 패널 접기/펼치기 토글 버튼 (데스크톱 및 모바일 접힘 시) */}
      <button
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        className={cn(
          "absolute top-4 sm:top-6 z-[650] py-2 px-2.5 rounded-r-2xl bg-white/95 backdrop-blur-md border-r border-y border-gray-200 shadow-md text-gray-600 hover:text-blue-600 transition-all cursor-pointer flex items-center gap-1.5",
          isSidebarOpen ? "hidden sm:flex left-[420px]" : "left-0"
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

      {/* 3. 우측 인터랙티브 지도 영역 */}
      <section className="relative flex-1 h-full w-full overflow-hidden" aria-label="서울시 정비사업 공간 지도">
        {isLoading ? (
          <div className="w-full h-full flex flex-col items-center justify-center bg-slate-50 text-gray-500 gap-3">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            <span className="text-xs font-semibold">서울시 정비구역 공간 데이터를 불러오는 중...</span>
          </div>
        ) : (
          <InteractiveLeafletMap features={filteredFeatures} />
        )}

        {/* 선택된 구역이 있을 때 표시되는 퀵 상세 정보 카드 (모바일 바텀시트 & 데스크톱 플로팅) */}
        {selectedDistrict && (
          <aside className="absolute inset-x-3 bottom-16 sm:bottom-auto sm:top-16 sm:left-6 z-[500] sm:w-[390px] max-w-full max-h-[70vh] sm:max-h-[calc(100vh-5.5rem)] rounded-3xl bg-white/95 backdrop-blur-xl border border-gray-200 shadow-2xl overflow-hidden flex flex-col animate-in fade-in slide-in-from-bottom-4 sm:slide-in-from-top-4 duration-200">
            <DistrictCard />
          </aside>
        )}

        {/* 지도 우측 하단 미니 개인정보처리방침 링크 (데스크톱 패널 닫힘 시 노출) */}
        <button
          onClick={() => setIsPrivacyModalOpen(true)}
          className="hidden sm:flex items-center gap-1 absolute bottom-2 right-14 z-[400] text-[10px] text-gray-500 hover:text-gray-900 bg-white/90 hover:bg-gray-100 backdrop-blur-md px-2 py-0.5 rounded-md border border-gray-200 transition-colors cursor-pointer shadow-xs"
        >
          <Shield className="w-2.5 h-2.5 text-blue-600" />
          <span>개인정보처리방침</span>
        </button>
      </section>

      {/* 4. 모바일 화면 하단 플로팅 전환 바 (모바일 UX 최적화) */}
      <div className="sm:hidden absolute bottom-5 left-1/2 -translate-x-1/2 z-[550]">
        <button
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-white/95 backdrop-blur-md text-gray-900 text-xs font-bold shadow-xl border border-gray-200 hover:bg-gray-50 transition-all active:scale-95 cursor-pointer"
        >
          {isSidebarOpen ? "🗺️ 지도로 보기" : "📋 구역 목록 / 고시 피드"}
        </button>
      </div>

      {/* 5. 구역 비교 하단 플로팅 바 & 비교 모달 */}
      <CompareFloatingBar />
      <CompareModal />

      {/* 6. 구글 애드센스 필수 개인정보처리방침 안내 모달 */}
      <PrivacyPolicyModal
        isOpen={isPrivacyModalOpen}
        onClose={() => setIsPrivacyModalOpen(false)}
      />
    </main>
  );
}
