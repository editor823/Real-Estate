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
import { ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

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
  const { selectedDistrict } = useMapStore();

  // 최신 정적 GeoJSON 파일이 있을 경우 비동기 보정 동기화
  useEffect(() => {
    async function loadDistricts() {
      try {
        const response = await fetch("/data/districts.json");
        if (response.ok) {
          const data: DistrictFeatureCollection = await response.json();
          if (data.features && data.features.length > 0) {
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

  return (
    <main className="relative w-full h-screen overflow-hidden flex bg-slate-950">
      {/* 1. 좌측 필터 & 구역 목록 & 실시간 타임라인 패널 */}
      <LeftFilterPanel
        features={features}
        isOpen={isSidebarOpen}
        onToggle={() => setIsSidebarOpen(!isSidebarOpen)}
      />

      {/* 2. 패널 접기/펼치기 토글 버튼 */}
      <button
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        className={cn(
          "absolute top-6 z-[650] p-2 rounded-r-xl bg-white/95 backdrop-blur-md border-r border-y border-slate-200/90 shadow-lg text-slate-600 hover:text-blue-600 transition-all cursor-pointer",
          isSidebarOpen ? "left-[430px]" : "left-0"
        )}
        title={isSidebarOpen ? "좌측 패널 접기" : "좌측 패널 펼치기"}
        aria-label={isSidebarOpen ? "좌측 패널 접기" : "좌측 패널 펼치기"}
      >
        {isSidebarOpen ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
      </button>

      {/* 3. 우측 인터랙티브 지도 영역 */}
      <section className="relative flex-1 h-full w-full overflow-hidden">
        {isLoading ? (
          <div className="w-full h-full flex flex-col items-center justify-center bg-slate-900 text-slate-400 gap-3">
            <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
            <span className="text-xs font-semibold">서울시 정비구역 공간 데이터를 불러오는 중...</span>
          </div>
        ) : (
          <InteractiveLeafletMap features={filteredFeatures} />
        )}

        {/* 선택된 구역이 있을 때 우측 상단에 표시되는 퀵 상세 정보 카드 */}
        {selectedDistrict && (
          <aside className="absolute top-16 left-6 z-[500] w-[390px] max-w-[calc(100vw-3rem)] max-h-[calc(100vh-5.5rem)] rounded-3xl bg-white/95 backdrop-blur-xl border border-slate-200/90 shadow-2xl overflow-hidden flex flex-col animate-in fade-in slide-in-from-top-4 duration-200">
            <DistrictCard />
          </aside>
        )}
      </section>

      {/* 4. 구역 비교 하단 플로팅 바 & 비교 모달 */}
      <CompareFloatingBar />
      <CompareModal />
    </main>
  );
}
