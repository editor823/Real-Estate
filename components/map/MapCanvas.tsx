"use client";

import { useEffect, useRef, useState } from "react";
import { useMapStore } from "@/lib/store/useMapStore";
import { useFilterStore } from "@/lib/store/useFilterStore";
import { ClusterLayer } from "./ClusterLayer";
import { PolygonLayer } from "./PolygonLayer";
import { MapPin, Layers, ZoomIn, ZoomOut, AlertCircle } from "lucide-react";

export function MapCanvas() {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const { center, zoom, setCenter, setZoom, setSelectedDistrict, setSelectedUid } = useMapStore();
  const { bizType, isConsentFilterActive, transferableOnly } = useFilterStore();
  const [hasMapboxToken, setHasMapboxToken] = useState(false);

  useEffect(() => {
    const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
    if (token && token.trim() !== "") {
      setHasMapboxToken(true);
    }
  }, []);

  // 데모용 샘플 구역 목록 (토큰 미설정 시에도 인터랙션 가능하도록 제공)
  const sampleDistricts = [
    {
      master_uid: "SEOUL_RDEV_11215_01",
      name: "자양4동 신속통합기획 1구역",
      biz_type: "SINTHONG",
      biz_type_label: "신속통합기획",
      stage_code: "UNION_AUTH",
      legal_dong: "광진구 자양동",
      approval_date: "2026-03-28",
      consent_rate: 74.2,
      is_transferable: true,
      transfer_exemption: "3년 지연 예외 허용",
      is_adjacent_public: true,
      coordinates: { x: 62, y: 55 },
    },
    {
      master_uid: "SEOUL_RDEV_11350_02",
      name: "상계5동 모아타운 관리지역",
      biz_type: "MOA",
      biz_type_label: "모아타운",
      stage_code: "DESIGNATED",
      legal_dong: "노원구 상계동",
      approval_date: "2026-03-24",
      consent_rate: 68.5,
      is_transferable: false,
      transfer_exemption: null,
      is_adjacent_public: false,
      coordinates: { x: 75, y: 22 },
    },
    {
      master_uid: "SEOUL_RDEV_11170_03",
      name: "한남3재정비촉진구역 재개발",
      biz_type: "REDEVELOPMENT",
      biz_type_label: "재개발",
      stage_code: "CONSTRUCTION",
      legal_dong: "용산구 한남동",
      approval_date: "2026-03-15",
      consent_rate: 89.0,
      is_transferable: false,
      transfer_exemption: null,
      is_adjacent_public: false,
      coordinates: { x: 50, y: 58 },
    },
    {
      master_uid: "SEOUL_RDEV_11680_04",
      name: "압구정3구역 신속통합기획 재건축",
      biz_type: "SINTHONG",
      biz_type_label: "신속통합기획",
      stage_code: "BIZ_PLAN",
      legal_dong: "강남구 압구정동",
      approval_date: "2026-02-10",
      consent_rate: 82.4,
      is_transferable: false,
      transfer_exemption: null,
      is_adjacent_public: true,
      coordinates: { x: 58, y: 64 },
    },
  ];

  // 필터링 적용
  const filteredDistricts = sampleDistricts.filter((item) => {
    if (bizType !== "ALL" && item.biz_type !== bizType) return false;
    if (isConsentFilterActive && (!item.consent_rate || item.consent_rate < 70)) return false;
    if (transferableOnly && !item.is_transferable) return false;
    return true;
  });

  return (
    <div className="relative w-full h-full min-h-[600px] bg-slate-900 overflow-hidden select-none">
      {/* 1. 지도 캔버스 배경 그리드 및 서울 지형 데모 레이아웃 */}
      <div
        ref={mapContainerRef}
        id="map-canvas-container"
        className="w-full h-full relative flex items-center justify-center"
      >
        {/* 세련된 다크 테마 공간 그리드 패턴 */}
        <div className="absolute inset-0 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:24px_24px] opacity-40" />

        {/* 한강 물줄기 SVG 일러스트레이션 (서울 중심 랜드마크) */}
        <svg
          className="absolute inset-0 w-full h-full opacity-20 pointer-events-none"
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
        >
          <path
            d="M 0,65 Q 25,60 45,64 T 70,55 T 100,52"
            fill="none"
            stroke="#38bdf8"
            strokeWidth="3.5"
            strokeDasharray="4 2"
          />
        </svg>

        {/* 폴리곤 및 클러스터 마커 시뮬레이션 */}
        {zoom >= 12 ? (
          <PolygonLayer
            districts={filteredDistricts}
            onSelect={(district) => {
              setSelectedUid(district.master_uid);
              setSelectedDistrict(district);
            }}
          />
        ) : (
          <ClusterLayer
            count={filteredDistricts.length}
            onZoomIn={() => setZoom(13)}
          />
        )}

        {/* Mapbox Token 알림 배너 (토큰 등록 전 안내) */}
        {!hasMapboxToken && (
          <aside className="absolute bottom-5 left-5 z-10 flex items-center gap-2.5 px-4 py-2.5 rounded-xl bg-slate-800/90 backdrop-blur-md border border-slate-700/80 text-slate-300 text-xs shadow-xl">
            <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
            <span>
              환경변수 <code>NEXT_PUBLIC_MAPBOX_TOKEN</code>이 등록되면 고해상도 위성/벡터 지도로 전환됩니다.
            </span>
          </aside>
        )}
      </div>

      {/* 2. 지도 컨트롤 (줌인/줌아웃 및 레이어 토글) */}
      <div className="absolute bottom-6 right-6 z-10 flex flex-col gap-2">
        <div className="flex flex-col rounded-xl bg-white/90 backdrop-blur-md border border-slate-200/80 shadow-md overflow-hidden">
          <button
            onClick={() => setZoom(Math.min(zoom + 1, 18))}
            className="p-2 text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
            aria-label="지도 확대"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          <div className="h-px bg-slate-200" />
          <button
            onClick={() => setZoom(Math.max(zoom - 1, 8))}
            className="p-2 text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
            aria-label="지도 축소"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
        </div>

        <button
          onClick={() => {
            setCenter([126.978, 37.5665]);
            setZoom(12);
          }}
          className="p-2 rounded-xl bg-white/90 backdrop-blur-md border border-slate-200/80 shadow-md text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
          title="서울시 중심 재정렬"
          aria-label="서울시 중심 재정렬"
        >
          <MapPin className="w-4 h-4 text-blue-600" />
        </button>
      </div>
    </div>
  );
}
