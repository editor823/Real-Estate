"use client";

import { useState } from "react";
import { useMapStore } from "@/lib/store/useMapStore";
import { useCompareStore } from "@/lib/store/useCompareStore";
import { StageBadge } from "@/components/ui/StageBadge";
import { ProjectedTimelineWidget } from "./ProjectedTimelineWidget";
import { SafetyDiagnosisWidget } from "./SafetyDiagnosisWidget";
import { AdSenseBanner } from "@/components/ads/AdSenseBanner";
import { PriceTrendChart } from "@/components/district/PriceTrendChart";
import { DistrictCommunityFeed } from "@/components/district/DistrictCommunityFeed";
import { getNearestStation, getNearbySchools } from "@/lib/constants/schoolsAndStations";
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
  MessageSquare,
  Train,
  GraduationCap,
  Scale,
} from "lucide-react";
import { cn } from "@/lib/utils";

export function DistrictCard() {
  const { selectedDistrict, setSelectedUid, setSelectedDistrict } = useMapStore();
  const { addToCompare, isInCompare } = useCompareStore();

  // 상단 서브 탭: 핵심 분석 vs 현장 이야기(네이버 이야기 탭)
  const [activeTab, setActiveTab] = useState<"ANALYZE" | "COMMUNITY">("ANALYZE");
  // 면적 단위 토글: 평 vs ㎡ (네이버 부동산 단위 변환기)
  const [unitMode, setUnitMode] = useState<"PYEONG" | "M2">("PYEONG");

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
    <article className="p-4 sm:p-5 space-y-4 text-gray-900 bg-white">
      {/* 1. 카드 헤더: 네이버 스타일 시원한 타이포그래피 */}
      <div className="flex items-start justify-between gap-3 pb-3 border-b border-gray-100">
        <div className="min-w-0">
          <div className="flex items-center gap-1.5 mb-2 flex-wrap">
            <span className="text-xs sm:text-sm font-bold px-2.5 py-1 rounded-lg bg-blue-50 text-blue-700 border border-blue-200">
              {selectedDistrict.gu || "서울시"}
            </span>
            <span className="text-xs sm:text-sm font-semibold px-2.5 py-1 rounded-lg bg-gray-100 text-gray-700 border border-gray-200">
              {selectedDistrict.biz_type_label || selectedDistrict.biz_type}
            </span>
            <StageBadge stageCode={selectedDistrict.stage_code} className="text-xs sm:text-sm font-bold px-2.5 py-1" />
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-gray-900 tracking-tight leading-snug">
            {selectedDistrict.name}
          </h2>
        </div>

        <div className="flex items-center gap-1.5 shrink-0 pt-1">
          <button
            type="button"
            onClick={() => addToCompare(selectedDistrict)}
            className={cn(
              "px-3 py-2 rounded-xl text-xs sm:text-sm font-bold border transition-all cursor-pointer flex items-center gap-1.5 shadow-2xs",
              inCompare
                ? "bg-blue-600 text-white border-blue-600 shadow-xs"
                : "bg-gray-100 hover:bg-gray-200 text-gray-700 border-gray-200"
            )}
          >
            <span>{inCompare ? "비교함 ✓" : "+ 비교"}</span>
          </button>
        </div>
      </div>

      {/* [강조] 구역 정밀 분석 리포트 전문 보기 상단 버튼 */}
      <Link
        href={`/districts/${selectedDistrict.master_uid}`}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center justify-center gap-2 w-full py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-sm font-extrabold shadow-md shadow-blue-500/25 transition-all hover:scale-[1.01] active:scale-[0.99] cursor-pointer"
      >
        <span>📘 구역 정밀 분석 리포트 전문 보기</span>
        <ExternalLink className="w-4 h-4" />
      </Link>

      {/* 1-B. [네이버 부동산 킬러 기능 4] 상단 서브 탭: [📊 핵심 분석 | 💬 현장 이야기] */}
      <div className="flex items-center p-1 rounded-xl bg-gray-100 border border-gray-200">
        <button
          type="button"
          onClick={() => setActiveTab("ANALYZE")}
          className={cn(
            "flex-1 py-2 px-3 rounded-lg text-xs sm:text-sm font-bold transition-all cursor-pointer flex items-center justify-center gap-2",
            activeTab === "ANALYZE"
              ? "bg-white text-blue-600 shadow-2xs font-extrabold"
              : "text-gray-600 hover:text-gray-900"
          )}
        >
          <Building2 className="w-4 h-4" />
          <span>핵심 종합 분석</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("COMMUNITY")}
          className={cn(
            "flex-1 py-2 px-3 rounded-lg text-xs sm:text-sm font-bold transition-all cursor-pointer flex items-center justify-center gap-2",
            activeTab === "COMMUNITY"
              ? "bg-white text-blue-600 shadow-2xs font-extrabold"
              : "text-gray-600 hover:text-gray-900"
          )}
        >
          <MessageSquare className="w-4 h-4 text-blue-500" />
          <span>현장 이야기 (소통)</span>
        </button>
      </div>

      {activeTab === "COMMUNITY" ? (
        /* 현장 이야기 탭 활성화 시 */
        <DistrictCommunityFeed
          districtUid={selectedDistrict.master_uid}
          districtName={selectedDistrict.name}
        />
      ) : (
        /* 핵심 종합 분석 탭 활성화 시 */
        <>
          {/* 2. 주소 및 [기능 5 & 기능 2] 초역세권 & 학군 접근성 배너 */}
          <div className="space-y-2 text-sm text-gray-700 bg-gray-50 p-3.5 rounded-2xl border border-gray-200">
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-gray-500 shrink-0" />
              <span className="font-semibold truncate">
                {selectedDistrict.address_jibun
                  ? `${selectedDistrict.gu || ""} ${selectedDistrict.address_jibun}`
                  : selectedDistrict.legal_dong || "서울특별시"}
              </span>
            </div>
            {selectedDistrict.address_doro && (
              <div className="text-xs text-gray-500 pl-6 truncate font-medium">
                도로명: {selectedDistrict.address_doro}
              </div>
            )}

            {/* 지하철역 & 학교 도보 접근성 뱃지 */}
            {selectedDistrict.centroid && (() => {
              const [lng, lat] = selectedDistrict.centroid;
              const stationInfo = getNearestStation(lat, lng);
              const schools = getNearbySchools(lat, lng, 600);
              return (
                <div className="flex items-center gap-2 pt-2 border-t border-gray-200 flex-wrap text-xs">
                  {/* 역세권 정보 */}
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-indigo-50 border border-indigo-200 text-indigo-700 font-bold">
                    <Train className="w-3.5 h-3.5 text-indigo-600" />
                    <span>{stationInfo.station.name} 도보 {stationInfo.walkMinutes}분</span>
                    {stationInfo.isSuperClose && (
                      <span className="px-1.5 py-0.2 rounded bg-indigo-600 text-white text-[10px] font-black">초역세권</span>
                    )}
                  </span>

                  {/* 학군 정보 */}
                  {schools.length > 0 && (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-700 font-bold">
                      <GraduationCap className="w-3.5 h-3.5 text-emerald-600" />
                      <span>{schools[0].school.name} 도보 {schools[0].walkMinutes}분</span>
                      <span className="px-1.5 py-0.2 rounded bg-emerald-600 text-white text-[10px] font-black">초품아</span>
                    </span>
                  )}
                </div>
              );
            })()}
          </div>

          {/* 3. 예상 타임라인 & 속도계 위젯 */}
          <ProjectedTimelineWidget
            stageCode={selectedDistrict.stage_code}
            stageSeq={selectedDistrict.stage_seq}
            bizType={selectedDistrict.biz_type}
            approvalDate={selectedDistrict.approval_date}
          />

          {/* 4. [네이버 부동산 킬러 기능 1] 평형별 주변 시세 추이 & 예상 프리미엄 그래프 */}
          <PriceTrendChart
            districtName={selectedDistrict.name}
            guName={selectedDistrict.gu}
            totalHouseholds={totalHouseholds}
          />

          {/* 5. 사업성 분석 지수 (일반분양 비율) */}
          <div className="p-4 rounded-2xl bg-gray-50 border border-gray-200 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm font-extrabold text-amber-700">
                <Coins className="w-4 h-4 text-amber-600" />
                <span>사업성 분석 지수 (일반분양 비율)</span>
              </div>
            </div>

            {/* 사업성 등급 뱃지 & 수치 */}
            <div className="flex items-center justify-between">
              <span
                className={cn(
                  "text-xs sm:text-sm font-black px-3 py-1.5 rounded-xl border shadow-2xs",
                  profitability.badgeClass
                )}
              >
                {profitability.badgeLabel}
              </span>
              <span className="text-base sm:text-lg font-black text-amber-600">{profitability.ratio}%</span>
            </div>

            {/* 일반분양 비율 게이지 바 */}
            <div className="w-full h-2.5 rounded-full bg-gray-200 overflow-hidden">
              <div
                className={cn("h-full rounded-full transition-all duration-500", profitability.barClass)}
                style={{ width: `${Math.min(100, Math.max(5, profitability.ratio))}%` }}
              />
            </div>

            <p className="text-xs sm:text-sm text-gray-700 leading-relaxed bg-white p-3 rounded-xl border border-gray-200 shadow-2xs font-medium">
              {profitability.description}
            </p>

            {/* 분담금 계산기 퀵 링크 */}
            <Link
              href="/calculators?type=contribution"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between w-full p-2.5 px-3.5 rounded-xl bg-amber-50 hover:bg-amber-100 border border-amber-200 text-xs sm:text-sm font-extrabold text-amber-900 transition-all cursor-pointer group shadow-2xs"
            >
              <div className="flex items-center gap-2">
                <Coins className="w-4 h-4 text-amber-600" />
                <span>💰 이 구역 예상 분담금 &amp; 비례율 계산해보기</span>
              </div>
              <span className="text-amber-700 font-black group-hover:translate-x-1 transition-transform">→</span>
            </Link>
          </div>

          {/* 6. [네이버 부동산 킬러 기능 3] 건립 세대수 공급량 섹션 + ㎡ ⇄ 평 단위 변환기 */}
          <div className="p-4 rounded-2xl bg-gray-50 border border-gray-200 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm font-extrabold text-gray-900">
                <Home className="w-4 h-4 text-blue-600" />
                <span>건립 예정 세대수 &amp; 평형 구성</span>
              </div>

              {/* [㎡ | 평] 원클릭 단위 변환 토글 */}
              <div className="flex items-center p-0.5 rounded-lg bg-gray-200 text-xs font-bold">
                <button
                  type="button"
                  onClick={() => setUnitMode("PYEONG")}
                  className={cn(
                    "px-2 py-1 rounded transition-all cursor-pointer",
                    unitMode === "PYEONG" ? "bg-white text-blue-600 shadow-2xs font-black" : "text-gray-600"
                  )}
                >
                  평(坪)
                </button>
                <button
                  type="button"
                  onClick={() => setUnitMode("M2")}
                  className={cn(
                    "px-2 py-1 rounded transition-all cursor-pointer",
                    unitMode === "M2" ? "bg-white text-blue-600 shadow-2xs font-black" : "text-gray-600"
                  )}
                >
                  ㎡
                </button>
              </div>
            </div>

            {totalHouseholds > 0 ? (
              <>
                <div className="grid grid-cols-3 gap-2.5 pt-1 border-t border-gray-200 text-center">
                  <div className="bg-white p-2.5 rounded-xl border border-gray-200 shadow-2xs">
                    <span className="text-xs text-gray-500 block font-semibold mb-0.5">분양</span>
                    <strong className="text-sm sm:text-base text-gray-900 font-black">
                      {saleHouseholds.toLocaleString()}
                    </strong>
                  </div>
                  <div className="bg-white p-2.5 rounded-xl border border-gray-200 shadow-2xs">
                    <span className="text-xs text-gray-500 block font-semibold mb-0.5">임대</span>
                    <strong className="text-sm sm:text-base text-blue-600 font-black">
                      {rentHouseholds.toLocaleString()}
                    </strong>
                  </div>
                  <div className="bg-white p-2.5 rounded-xl border border-gray-200 shadow-2xs">
                    <span className="text-xs text-gray-500 block font-semibold mb-0.5">기존가구</span>
                    <strong className="text-sm sm:text-base text-gray-600 font-bold">
                      {existingHouseholds > 0 ? existingHouseholds.toLocaleString() : "-"}
                    </strong>
                  </div>
                </div>

                {/* 평형별(소형/국평/대형) 예상 배분 비율 가이드 바 */}
                <div className="p-3 rounded-xl bg-white border border-gray-200 space-y-2">
                  <div className="flex items-center justify-between text-xs sm:text-sm font-bold text-gray-800">
                    <span>
                      {unitMode === "PYEONG" ? "25평(소형) 40%" : "59㎡ 이하 40%"}
                    </span>
                    <span className="text-blue-600 font-black">
                      {unitMode === "PYEONG" ? "34평(국평) 48%" : "84㎡ 기준 48%"}
                    </span>
                    <span className="text-indigo-600 font-black">
                      {unitMode === "PYEONG" ? "45평(대형) 12%" : "85㎡ 초과 12%"}
                    </span>
                  </div>
                  <div className="w-full h-2.5 rounded-full bg-gray-100 overflow-hidden flex">
                    <div className="h-full bg-emerald-400" style={{ width: "40%" }} title="소형 40%" />
                    <div className="h-full bg-blue-500" style={{ width: "48%" }} title="국평 48%" />
                    <div className="h-full bg-indigo-600" style={{ width: "12%" }} title="대형 12%" />
                  </div>
                </div>
              </>
            ) : (
              <p className="text-xs text-gray-500 text-center py-2 font-medium">
                정비계획 수립 후 세대수 산정 예정
              </p>
            )}
          </div>
        </>
      )}


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
      <div className="p-3 rounded-xl bg-gray-50 border border-gray-200 flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-xs text-gray-600">
          <Users className="w-3.5 h-3.5 text-blue-600" />
          <span>주민 동의율</span>
        </div>
        <div className="text-right">
          <span className="text-sm font-bold text-gray-900">
            {selectedDistrict.consent_rate ? `${selectedDistrict.consent_rate}%` : "집계 중"}
          </span>
          <span className="text-[10px] text-gray-500 ml-1.5">
            {selectedDistrict.consent_rate && selectedDistrict.consent_rate >= 70
              ? "(완화 기준 충족)"
              : "(추진 중)"}
          </span>
        </div>
      </div>

      {selectedDistrict.is_adjacent_public && (
        <div className="flex items-start gap-2 p-3 rounded-xl bg-purple-50 border border-purple-200 text-xs text-purple-900">
          <Sparkles className="w-4 h-4 text-purple-600 shrink-0 mt-0.5" />
          <div>
            <div className="font-semibold text-[11px] text-purple-900">대단지 공공기여 및 호재 연계</div>
            <p className="text-purple-700 mt-0.5 text-[10px]">
              {selectedDistrict.adjacent_public_note || "주변 인프라 확충 및 수변/역세권 활성화 연계 구역입니다."}
            </p>
          </div>
        </div>
      )}

      {/* 8. 정비사업 정보몽땅 원문 링크 및 구역 전용 정적 페이지 이동 */}
      <div className="pt-1 pb-1 space-y-2">
        <Link
          href={`/districts/${selectedDistrict.master_uid}`}
          className="flex items-center justify-center gap-1.5 w-full py-2.5 text-xs font-bold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-xl transition-all cursor-pointer shadow-xs"
        >
          <span>📄 상세 분석 리포트 읽기</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </Link>

        <a
          href={`https://cleanup.seoul.go.kr`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-1.5 w-full py-2 text-xs font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 border border-gray-200 rounded-xl transition-colors cursor-pointer"
        >
          <span>서울시 정비사업 정보몽땅 원문 확인</span>
          <ExternalLink className="w-3 h-3 text-gray-500" />
        </a>
      </div>
    </article>
  );
}
