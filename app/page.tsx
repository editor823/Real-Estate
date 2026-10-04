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
import { ChevronLeft, ChevronRight, Loader2, Shield } from "lucide-react";
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
    <main className="relative w-full flex-1 min-h-0 overflow-hidden flex bg-slate-950">
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
          "absolute top-4 sm:top-6 z-[650] py-2 px-2.5 rounded-r-2xl bg-slate-900/95 backdrop-blur-md border-r border-y border-slate-800 shadow-2xl text-slate-300 hover:text-blue-400 transition-all cursor-pointer flex items-center gap-1.5",
          isSidebarOpen ? "hidden sm:flex left-[430px]" : "left-0"
        )}
        title={isSidebarOpen ? "좌측 패널 접기" : "좌측 패널 펼치기"}
        aria-label={isSidebarOpen ? "좌측 패널 접기" : "좌측 패널 펼치기"}
      >
        {isSidebarOpen ? (
          <ChevronLeft className="w-4 h-4" />
        ) : (
          <>
            <ChevronRight className="w-4 h-4 text-blue-400" />
            <span className="text-xs font-bold text-white pr-0.5">목록 & 필터</span>
          </>
        )}
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

        {/* 선택된 구역이 있을 때 표시되는 퀵 상세 정보 카드 (모바일 바텀시트 & 데스크톱 플로팅) */}
        {selectedDistrict && (
          <aside className="absolute inset-x-3 bottom-16 sm:bottom-auto sm:top-16 sm:left-6 z-[500] sm:w-[390px] max-w-full max-h-[70vh] sm:max-h-[calc(100vh-5.5rem)] rounded-3xl bg-slate-900/95 backdrop-blur-xl border border-slate-800 shadow-2xl overflow-hidden flex flex-col animate-in fade-in slide-in-from-bottom-4 sm:slide-in-from-top-4 duration-200">
            <DistrictCard />
          </aside>
        )}


        {/* 지도 우측 하단 미니 개인정보처리방침 링크 (데스크톱 패널 닫힘 시 노출) */}
        <button
          onClick={() => setIsPrivacyModalOpen(true)}
          className="hidden sm:flex items-center gap-1 absolute bottom-2 right-14 z-[400] text-[10px] text-slate-400 hover:text-white bg-slate-900/90 hover:bg-slate-800 backdrop-blur-md px-2 py-0.5 rounded-md border border-slate-800 transition-colors cursor-pointer shadow-md"
        >
          <Shield className="w-2.5 h-2.5 text-blue-400" />
          <span>개인정보처리방침</span>
        </button>
      </section>

      {/* 4. 모바일 화면 하단 플로팅 전환 바 (모바일 UX 최적화) */}
      <div className="sm:hidden absolute bottom-5 left-1/2 -translate-x-1/2 z-[550]">
        <button
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-slate-900/95 backdrop-blur-md text-white text-xs font-bold shadow-2xl border border-slate-700/80 hover:bg-slate-800 transition-all active:scale-95 cursor-pointer"
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
