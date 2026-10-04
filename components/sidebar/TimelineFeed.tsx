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
    <div className="p-3.5 space-y-3">
      {/* 1. 피드 헤더 */}
      <div className="flex items-center justify-between text-xs font-semibold text-slate-600 px-1 pb-1 border-b border-slate-100">
        <span className="flex items-center gap-1.5 font-bold text-slate-800">
          <Bell className="w-3.5 h-3.5 text-blue-600" />
          서울시 실시간 고시·공고 피드
        </span>
        <span className="text-[10px] text-blue-600 font-bold bg-blue-50 px-2 py-0.5 rounded-full border border-blue-100">
          최신순 정렬 ({sortedDistricts.length}건)
        </span>
      </div>

      {/* 2. 최신 고시 타임라인 피드 리스트 */}
      <div className="space-y-2.5">
        {sortedDistricts.length === 0 ? (
          <div className="p-8 text-center text-slate-400 text-xs">
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
                  "p-3 rounded-2xl border transition-all cursor-pointer group relative overflow-hidden",
                  isSelected
                    ? "bg-blue-50/90 border-blue-400 shadow-md ring-1 ring-blue-400/40"
                    : "bg-white hover:bg-slate-50 border-slate-200/80 hover:border-slate-300 shadow-2xs"
                )}
              >
                {/* 상단: 자치구 뱃지 + 고시일자 */}
                <div className="flex items-center justify-between gap-2 mb-1.5">
                  <div className="flex items-center gap-1">
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-100">
                      {props.gu}
                    </span>
                    <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-slate-100 text-slate-600">
                      {props.biz_type_label}
                    </span>
                  </div>

                  <span className="flex items-center gap-1 text-[11px] font-medium text-slate-400">
                    <Calendar className="w-3 h-3 text-slate-400" />
                    {props.approval_date}
                  </span>
                </div>

                {/* 구역명 & 인허가 상태 */}
                <div className="flex items-start justify-between gap-2">
                  <h4 className="text-xs font-bold text-slate-900 group-hover:text-blue-600 transition-colors leading-snug">
                    {props.name}
                  </h4>
                  <StageBadge stageCode={props.stage_code} className="shrink-0" />
                </div>

                {/* 지번 주소 및 건립 규모 */}
                <div className="flex items-center justify-between text-[11px] text-slate-500 mt-2 pt-2 border-t border-slate-100">
                  <span className="flex items-center gap-1 truncate max-w-[180px]">
                    <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                    <span className="truncate">{props.address_jibun || props.legal_dong}</span>
                  </span>

                  <span className="flex items-center gap-1 font-semibold text-slate-700 shrink-0">
                    <Home className="w-3 h-3 text-indigo-500" />
                    <span>{totalH > 0 ? `${totalH.toLocaleString()}세대` : "계획중"}</span>
                  </span>
                </div>

                {/* 클릭 시 지도 이동 안내 화살표 */}
                <div className="flex items-center justify-between text-[10px] text-blue-600 font-semibold mt-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                  <span>지도에서 구역 위치 보기</span>
                  <ChevronRight className="w-3.5 h-3.5 translate-x-0 group-hover:translate-x-0.5 transition-transform" />
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
