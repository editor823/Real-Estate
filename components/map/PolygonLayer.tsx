"use client";

import { STAGES } from "@/lib/constants/stages";
import { useMapStore } from "@/lib/store/useMapStore";

interface DistrictItem {
  master_uid: string;
  name: string;
  biz_type: string;
  biz_type_label?: string;
  stage_code: string;
  coordinates: { x: number; y: number };
}

interface PolygonLayerProps {
  districts: DistrictItem[];
  onSelect: (district: DistrictItem) => void;
}

export function PolygonLayer({ districts, onSelect }: PolygonLayerProps) {
  const { selectedUid } = useMapStore();

  return (
    <div className="absolute inset-0 pointer-events-none">
      {districts.map((d) => {
        const stage = STAGES[d.stage_code] || { hex: "#3B82F6", name: "진행 중" };
        const isSelected = selectedUid === d.master_uid;

        return (
          <div
            key={d.master_uid}
            style={{ left: `${d.coordinates.x}%`, top: `${d.coordinates.y}%` }}
            className="absolute -translate-x-1/2 -translate-y-1/2 pointer-events-auto"
          >
            {/* 가상 구역 다각형 (Polygon Shape) 인터랙션 */}
            <button
              onClick={() => onSelect(d)}
              className="group relative flex flex-col items-center cursor-pointer transition-transform hover:scale-105"
            >
              {/* 폴리곤 형상 시각화 */}
              <div
                style={{
                  backgroundColor: `${stage.hex}33`,
                  borderColor: stage.hex,
                }}
                className={`w-28 h-20 rounded-2xl border-2 shadow-lg backdrop-blur-xs flex items-center justify-center p-2 text-center transition-all ${
                  isSelected ? "ring-4 ring-white ring-offset-2 scale-110" : ""
                }`}
              >
                <span className="text-[11px] font-bold text-white leading-tight drop-shadow-md">
                  {d.name}
                </span>
              </div>

              {/* 핀 라벨 */}
              <div
                style={{ backgroundColor: stage.hex }}
                className="mt-1 px-2 py-0.5 rounded-full text-[10px] font-semibold text-white shadow-md shadow-black/20"
              >
                {stage.name}
              </div>
            </button>
          </div>
        );
      })}
    </div>
  );
}
