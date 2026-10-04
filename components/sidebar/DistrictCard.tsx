"use client";

import { useMapStore } from "@/lib/store/useMapStore";
import { useCompareStore } from "@/lib/store/useCompareStore";
import { StageBadge } from "@/components/ui/StageBadge";
import { ProjectedTimelineWidget } from "./ProjectedTimelineWidget";
import { SafetyDiagnosisWidget } from "./SafetyDiagnosisWidget";
import { AdSenseBanner } from "@/components/ads/AdSenseBanner";
import Link from "next/link";
import {
  X,
  Building2,
  MapPin,
  Users,
  Sparkles,
  ExternalLink,
  Home,
  Coins,
  TrendingUp,
} from "lucide-react";
import { cn } from "@/lib/utils";

export function DistrictCard() {
  const { selectedDistrict, setSelectedUid, setSelectedDistrict } = useMapStore();
  const { addToCompare, isInCompare } = useCompareStore();

  if (!selectedDistrict) {
    return (
      <div className="p-6 text-center text-slate-400">
        <Building2 className="w-10 h-10 mx-auto mb-3 opacity-30 text-slate-400" />
        <p className="text-sm font-medium">지도에서 구역을 클릭하면</p>
        <p className="text-xs text-slate-500 mt-1">
          예상 타임라인, 사업성 지수 및 입주권 안전 진단 상세 정보를 확인할 수 있습니다.
        </p>
      </div>
    );
  }

  const handleClose = () => {
    setSelectedUid(null);
    setSelectedDistrict(null);
  };

  const inCompare = isInCompare(selectedDistrict.master_uid);
  const totalHouseholds = selectedDistrict.total_households || 0;
  const saleHouseholds = selectedDistrict.sale_households || 0;
  const rentHouseholds = selectedDistrict.rent_households || 0;
  const existingHouseholds = selectedDistrict.existing_households || 0;

  // 사업성 분석 지수 (일반분양 비율) 계산
  const getProfitabilityAnalysis = () => {
    if (totalHouseholds <= 0) {
      return {
        ratio: 0,
        badgeLabel: "산정 예정",
        badgeClass: "bg-slate-800 text-slate-300 border-slate-700",
        barClass: "bg-slate-600",
        description: "정비계획 수립 및 세대수 확정 후 사업성 산정이 진행됩니다.",
      };
    }

    let generalRatio = 0;
    if (existingHouseholds > 0) {
      const diff = Math.max(0, totalHouseholds - existingHouseholds);
      generalRatio = Math.round((diff / totalHouseholds) * 100);
    } else if (saleHouseholds > 0) {
      // 기존 멸실량이 0으로 등록된 경우 분양 물량 중 일반분양 추정치 적용 (약 25%)
      generalRatio = 28;
    } else {
      generalRatio = 20;
    }

    if (generalRatio >= 30) {
      return {
        ratio: generalRatio,
        badgeLabel: "🟢 사업성 우수 (분담금 부담 낮음)",
        badgeClass: "bg-emerald-950/60 text-emerald-300 border-emerald-800/80",
        barClass: "bg-emerald-500",
        description:
          "조합원 대비 일반분양 비중이 30% 이상으로 높아, 공사비 인상기에도 비례율이 방어되고 추가분담금 위험이 낮습니다.",
      };
    } else if (generalRatio >= 10) {
      return {
        ratio: generalRatio,
        badgeLabel: "🟡 사업성 보통 (적정 수준)",
        badgeClass: "bg-amber-950/60 text-amber-300 border-amber-800/80",
        barClass: "bg-amber-500",
        description:
          "일반분양 수입이 적정 수준이며, 시공사 도급 공사비 및 일반분양가 책정 결과에 따라 분담금이 결정됩니다.",
      };
    } else {
      return {
        ratio: generalRatio,
        badgeLabel: "🔴 사업성 주의 (분담금 확인 필요)",
        badgeClass: "bg-rose-950/60 text-rose-300 border-rose-800/80",
        barClass: "bg-rose-500",
        description:
          "일반분양 물량이 거의 없는 1:1 재건축 형태로, 조합원이 공사비 대부분을 분담해야 하므로 추정 분담금 사전 확인이 필수입니다.",
      };
    }
  };

  const profitability = getProfitabilityAnalysis();

  return (
    <article className="p-4 sm:p-5 space-y-4 max-h-[85vh] overflow-y-auto text-slate-100 bg-slate-900">
      {/* 1. 카드 헤더 */}
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-1.5 mb-1.5 flex-wrap">
            <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-blue-500/20 text-blue-300 border border-blue-400/30">
              {selectedDistrict.gu || "서울시"}
            </span>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 border border-slate-700">
              {selectedDistrict.biz_type_label || selectedDistrict.biz_type}
            </span>
            <StageBadge stageCode={selectedDistrict.stage_code} />
          </div>
          <h2 className="text-base font-bold text-white tracking-tight leading-snug">
            {selectedDistrict.name}
          </h2>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <button
            type="button"
            onClick={() => addToCompare(selectedDistrict)}
            className={cn(
              "px-2.5 py-1 rounded-xl text-xs font-bold border transition-all cursor-pointer flex items-center gap-1",
              inCompare
                ? "bg-blue-600 text-white border-blue-500 shadow-sm"
                : "bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700"
            )}
          >
            <span>{inCompare ? "비교함 담김 ✓" : "+ 비교담기"}</span>
          </button>

          <button
            onClick={handleClose}
            className="p-1 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
            aria-label="상세 패널 닫기"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* [강조] 구역 정밀 분석 리포트 전문 보기 상단 버튼 */}
      <Link
        href={`/districts/${selectedDistrict.master_uid}`}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center justify-center gap-2 w-full py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-md shadow-blue-500/25 transition-all hover:scale-[1.01] active:scale-[0.99] cursor-pointer"
      >
        <span>📘 구역 정밀 분석 리포트 전문 보기</span>
        <ExternalLink className="w-3.5 h-3.5" />
      </Link>

      {/* 2. 주소 및 고시 정보 */}
      <div className="space-y-1 text-xs text-slate-400 bg-slate-950/80 p-2.5 rounded-xl border border-slate-800">
        <div className="flex items-center gap-1.5">
          <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          <span className="truncate">
            {selectedDistrict.address_jibun
              ? `${selectedDistrict.gu || ""} ${selectedDistrict.address_jibun}`
              : selectedDistrict.legal_dong || "서울특별시"}
          </span>
        </div>
        {selectedDistrict.address_doro && (
          <div className="text-[11px] text-slate-400 pl-5 truncate">
            도로명: {selectedDistrict.address_doro}
          </div>
        )}
      </div>

      {/* 3. 예상 타임라인 & 속도계 위젯 */}
      <ProjectedTimelineWidget
        stageCode={selectedDistrict.stage_code}
        stageSeq={selectedDistrict.stage_seq}
        bizType={selectedDistrict.biz_type}
        approvalDate={selectedDistrict.approval_date}
      />

      {/* 4. [신규 기능 2] 사업성 분석 지수 (일반분양 비율) */}
      <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs font-bold text-amber-400">
            <Coins className="w-4 h-4 text-amber-400" />
            <span>사업성 분석 지수 (일반분양 비율)</span>
          </div>
        </div>

        {/* 사업성 등급 뱃지 */}
        <div className="flex items-center justify-between">
          <span
            className={cn(
              "text-[11px] font-extrabold px-2.5 py-1 rounded-xl border shadow-2xs",
              profitability.badgeClass
            )}
          >
            {profitability.badgeLabel}
          </span>
          <span className="text-xs font-black text-amber-300">{profitability.ratio}%</span>
        </div>

        {/* 일반분양 비율 게이지 바 */}
        <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
          <div
            className={cn("h-full rounded-full transition-all duration-500", profitability.barClass)}
            style={{ width: `${Math.min(100, Math.max(5, profitability.ratio))}%` }}
          />
        </div>

        <p className="text-[11px] text-slate-300 leading-relaxed bg-slate-900/90 p-2.5 rounded-xl border border-slate-800 shadow-2xs">
          {profitability.description}
        </p>
      </div>

      {/* 5. 건립 세대수 공급량 섹션 */}
      <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-200">
            <Home className="w-3.5 h-3.5 text-blue-400" />
            <span>건립 예정 세대수</span>
          </div>
          <span className="text-xs font-bold text-blue-400">
            총 {totalHouseholds > 0 ? totalHouseholds.toLocaleString() : "계획중"} 세대
          </span>
        </div>

        {totalHouseholds > 0 ? (
          <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-800 text-center">
            <div className="bg-slate-900 p-2 rounded-xl border border-slate-800 shadow-2xs">
              <span className="text-[10px] text-slate-400 block">분양</span>
              <strong className="text-xs text-slate-200 font-bold">
                {saleHouseholds.toLocaleString()}
              </strong>
            </div>
            <div className="bg-slate-900 p-2 rounded-xl border border-slate-800 shadow-2xs">
              <span className="text-[10px] text-slate-400 block">임대</span>
              <strong className="text-xs text-blue-400 font-bold">
                {rentHouseholds.toLocaleString()}
              </strong>
            </div>
            <div className="bg-slate-900 p-2 rounded-xl border border-slate-800 shadow-2xs">
              <span className="text-[10px] text-slate-400 block">기존가구</span>
              <strong className="text-xs text-slate-400 font-medium">
                {existingHouseholds > 0 ? existingHouseholds.toLocaleString() : "-"}
              </strong>
            </div>
          </div>
        ) : (
          <p className="text-[11px] text-slate-500 text-center py-1">
            정비계획 수립 후 세대수 산정 예정
          </p>
        )}
      </div>


      {/* 6. 입주권 안전 진단 카드 위젯 */}
      <SafetyDiagnosisWidget
        bizType={selectedDistrict.biz_type}
        stageSeq={selectedDistrict.stage_seq}
        stageCode={selectedDistrict.stage_code}
        isTransferable={selectedDistrict.is_transferable}
        transferExemption={selectedDistrict.transfer_exemption}
        approvalDate={selectedDistrict.approval_date}
      />

      {/* 6-B. 구글 애드센스 300x250 반응형 슬롯 */}
      <AdSenseBanner slotId="district-card-slot" />

      {/* 7. 주민 동의율 및 호재 연계 */}
      <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-xs text-slate-400">
          <Users className="w-3.5 h-3.5 text-blue-400" />
          <span>주민 동의율</span>
        </div>
        <div className="text-right">
          <span className="text-sm font-bold text-slate-200">
            {selectedDistrict.consent_rate ? `${selectedDistrict.consent_rate}%` : "집계 중"}
          </span>
          <span className="text-[10px] text-slate-500 ml-1.5">
            {selectedDistrict.consent_rate && selectedDistrict.consent_rate >= 70
              ? "(완화 기준 충족)"
              : "(추진 중)"}
          </span>
        </div>
      </div>

      {selectedDistrict.is_adjacent_public && (
        <div className="flex items-start gap-2 p-3 rounded-xl bg-purple-950/40 border border-purple-900/60 text-xs text-purple-300">
          <Sparkles className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
          <div>
            <div className="font-semibold text-[11px] text-purple-200">대단지 공공기여 및 호재 연계</div>
            <p className="text-purple-300/80 mt-0.5 text-[10px]">
              {selectedDistrict.adjacent_public_note || "주변 인프라 확충 및 수변/역세권 활성화 연계 구역입니다."}
            </p>
          </div>
        </div>
      )}

      {/* 8. 정비사업 정보몽땅 원문 링크 및 구역 전용 정적 페이지 이동 */}
      <div className="pt-1 pb-1 space-y-2">
        <Link
          href={`/districts/${selectedDistrict.master_uid}`}
          className="flex items-center justify-center gap-1.5 w-full py-2.5 text-xs font-bold text-blue-300 bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500/40 rounded-xl transition-all cursor-pointer shadow-xs"
        >
          <span>📄 상세 분석 리포트 읽기</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </Link>

        <a
          href={`https://cleanup.seoul.go.kr`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-1.5 w-full py-2 text-xs font-semibold text-slate-300 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl transition-colors cursor-pointer"
        >
          <span>서울시 정비사업 정보몽땅 원문 확인</span>
          <ExternalLink className="w-3 h-3 text-slate-400" />
        </a>
      </div>
    </article>
  );
}
