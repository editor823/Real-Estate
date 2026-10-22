"use client";

import { useMemo } from "react";
import { DistrictFeature, DistrictProperties } from "@/lib/types/district";
import { StageBadge } from "@/components/ui/StageBadge";
import { useMapStore } from "@/lib/store/useMapStore";
import { Bell, Calendar, Home, MapPin, ChevronRight, FileText } from "lucide-react";
import { cn } from "@/lib/utils";

interface TimelineFeedProps {
  features: DistrictFeature[];
  onSelectMobile?: () => void;
}

export function TimelineFeed({ features, onSelectMobile }: TimelineFeedProps) {
  const { selectedUid, setSelectedUid, setSelectedDistrict, setFlyToTarget } = useMapStore();

  // 최신 고시일자 기준 내림차순 정렬 (최신순)
  const sortedDistricts = useMemo(() => {
    return [...features]
      .filter((f) => f.properties.approval_date)
      .sort((a, b) => {
        const dateA = new Date(a.properties.approval_date).getTime();
        const dateB = new Date(b.properties.approval_date).getTime();
        return dateB - dateA;
      })
      .slice(0, 60); // 상위 60개 최신 고시 피드
  }, [features]);

  const handleSelectEvent = (props: DistrictProperties) => {
    setSelectedUid(props.master_uid);
    setSelectedDistrict(props);
    if (props.centroid) {
      // Leaflet 좌표 순서: [lat(위도), lng(경도)]
      setFlyToTarget([props.centroid[1], props.centroid[0]]);
    }
    if (typeof window !== "undefined" && window.innerWidth < 768 && onSelectMobile) {
      onSelectMobile();
    }
  };

  return (
    <div className="p-3.5 space-y-3 bg-white text-gray-900">
      {/* 1. 피드 헤더 */}
      <div className="flex items-center justify-between text-sm font-bold text-gray-700 px-1 pb-2 border-b border-gray-200">
        <span className="flex items-center gap-2 font-black text-gray-900">
          <Bell className="w-4 h-4 text-blue-600" />
          서울시 실시간 고시·공고 피드
        </span>
        <span className="text-xs text-blue-700 font-extrabold bg-blue-50 px-2.5 py-1 rounded-full border border-blue-200">
          최신순 정렬 ({sortedDistricts.length}건)
        </span>
      </div>

      {/* 2. 최신 고시 타임라인 피드 리스트 */}
      <div className="space-y-3">
        {sortedDistricts.length === 0 ? (
          <div className="p-8 text-center text-gray-400 text-sm">
            고시·공고 이력 데이터를 불러오는 중입니다...
          </div>
        ) : (
          sortedDistricts.map((f, idx) => {
            const props = f.properties;
            const isSelected = selectedUid === props.master_uid;
            const totalH = props.total_households || 0;

            return (
              <div
                key={props.master_uid}
                onClick={() => handleSelectEvent(props)}
                className={cn(
                  "p-4 rounded-2xl border transition-all cursor-pointer group relative overflow-hidden",
                  isSelected
                    ? "bg-blue-50/80 border-blue-600 shadow-md ring-2 ring-blue-500"
                    : "bg-white hover:bg-slate-50 border-gray-200 hover:border-blue-400 shadow-2xs hover:shadow-sm"
                )}
              >
                {/* 상단: 자치구 뱃지 + 고시일자 */}
                <div className="flex items-center justify-between gap-2 mb-2 flex-wrap">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs sm:text-sm font-bold px-2 py-0.5 rounded-lg bg-blue-50 text-blue-700 border border-blue-200">
                      {props.gu}
                    </span>
                    <span className="text-xs sm:text-sm font-semibold px-2 py-0.5 rounded-lg bg-gray-100 text-gray-700 border border-gray-200">
                      {props.biz_type_label}
                    </span>
                  </div>

                  <span className="flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-gray-500">
                    <Calendar className="w-3.5 h-3.5 text-gray-400" />
                    {props.approval_date}
                  </span>
                </div>

                {/* 구역명 & 인허가 상태 */}
                <div className="flex items-start justify-between gap-2">
                  <h4 className="text-base sm:text-lg font-black text-gray-900 group-hover:text-blue-600 transition-colors leading-snug">
                    {props.name}
                  </h4>
                  <StageBadge stageCode={props.stage_code} className="shrink-0 text-xs sm:text-sm font-bold" />
                </div>

                {/* 지번 주소 및 건립 규모 */}
                <div className="flex items-center justify-between text-xs sm:text-sm text-gray-600 mt-2.5 pt-2.5 border-t border-gray-100">
                  <span className="flex items-center gap-1.5 truncate max-w-[200px]">
                    <MapPin className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                    <span className="truncate">{props.address_jibun || props.legal_dong}</span>
                  </span>

                  <span className="flex items-center gap-1.5 font-bold text-gray-800 shrink-0">
                    <Home className="w-3.5 h-3.5 text-blue-600" />
                    <strong className="text-blue-600 font-black">{totalH > 0 ? `${totalH.toLocaleString()}세대` : "계획중"}</strong>
                  </span>
                </div>

                {/* 클릭 시 지도 이동 안내 화살표 */}
                <div className="flex items-center justify-between text-xs text-blue-600 font-bold mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <span>지도에서 구역 위치 보기</span>
                  <ChevronRight className="w-4 h-4 translate-x-0 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>

  );
}
