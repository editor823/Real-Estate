"use client";

import { useMemo, useState, useEffect } from "react";
import { useFilterStore, SortOption, InvestmentPersona } from "@/lib/store/useFilterStore";
import { useMapStore } from "@/lib/store/useMapStore";
import { useCompareStore } from "@/lib/store/useCompareStore";
import { DistrictFeature } from "@/lib/types/district";
import { BIZ_TYPES } from "@/lib/constants/stages";
import { StageBadge } from "@/components/ui/StageBadge";
import { TimelineFeed } from "./TimelineFeed";
import {
  Search,
  Filter,
  CheckCircle2,
  ShieldCheck,
  RotateCcw,
  Building,
  History,
  MapPin,
  Home,
  ArrowLeftRight,
  ArrowUpDown,
  Sprout,
  Trophy,
  X,
  ExternalLink,
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface LeftFilterPanelProps {
  features: DistrictFeature[];
  isOpen: boolean;
  onToggle: () => void;
  onOpenPrivacy?: () => void;
}

export function LeftFilterPanel({
  features,
  isOpen,
  onToggle,
  onOpenPrivacy,
}: LeftFilterPanelProps) {
  const [activeTab, setActiveTab] = useState<"list" | "timeline">("list");

  // URL ?tab=timeline 쿼리 감지
  useEffect(() => {
    if (typeof window !== "undefined") {
      const checkTab = () => {
        const params = new URLSearchParams(window.location.search);
        if (params.get("tab") === "timeline") {
          setActiveTab("timeline");
        } else if (params.get("tab") === "list") {
          setActiveTab("list");
        }
      };
      checkTab();
      window.addEventListener("popstate", checkTab);
      return () => window.removeEventListener("popstate", checkTab);
    }
  }, []);

  const {
    searchQuery,
    selectedGu,
    bizType,
    isConsentFilterActive,
    transferableOnly,
    publicAdjacentOnly,
    minHouseholds,
    sortBy,
    investmentPersona,
    setSearchQuery,
    setSelectedGu,
    setBizType,
    setIsConsentFilterActive,
    setTransferableOnly,
    setPublicAdjacentOnly,
    setMinHouseholds,
    setSortBy,
    setInvestmentPersona,
    resetFilters,
  } = useFilterStore();

  const { selectedUid, setSelectedUid, setSelectedDistrict, setFlyToTarget } = useMapStore();
  const { addToCompare, isInCompare } = useCompareStore();

  // 자치구 고유 목록 추출
  const guList = useMemo(() => {
    const set = new Set<string>();
    features.forEach((f) => {
      if (f.properties.gu) set.add(f.properties.gu);
    });
    return Array.from(set).sort((a, b) => a.localeCompare(b, "ko"));
  }, [features]);

  // 필터링 및 정렬 적용 로직
  const filteredAndSortedFeatures = useMemo(() => {
    // 1. 필터링 단계
    const filtered = features.filter((f) => {
      const props = f.properties;

      // (1) 검색어 필터 (구역명, 법정동, 지번)
      if (searchQuery.trim() !== "") {
        const q = searchQuery.toLowerCase();
        const matchName = props.name.toLowerCase().includes(q);
        const matchDong = props.legal_dong.toLowerCase().includes(q);
        const matchJibun = (props.address_jibun || "").toLowerCase().includes(q);
        if (!matchName && !matchDong && !matchJibun) return false;
      }

      // (2) 자치구 필터
      if (selectedGu !== "ALL" && props.gu !== selectedGu) return false;

      // (3) 사업 유형 필터
      if (bizType !== "ALL" && props.biz_type !== bizType) return false;

      // (4) 투자 성향별 퀵 필터 칩
      if (investmentPersona === "EARLY_SEED" && props.stage_seq > 3) {
        // 초기 소액/후보지: 후보지(1), 구역지정(2), 추진위(3)만
        return false;
      }
      if (investmentPersona === "IMMINENT_SAFE" && props.stage_seq < 6) {
        // 입주 임박/안전 구역: 관리처분(6), 착공(7), 준공(8)만
        return false;
      }

      // (5) 1,000세대 이상 대단지 필터
      if (minHouseholds > 0 && (!props.total_households || props.total_households < minHouseholds)) {
        return false;
      }

      // (6) 동의율 70% 이상 필터
      if (isConsentFilterActive && (!props.consent_rate || props.consent_rate < 70)) return false;

      // (7) 지위양도 가능 필터
      if (transferableOnly && !props.is_transferable) return false;

      // (8) 공공호재 인접 필터
      if (publicAdjacentOnly && !props.is_adjacent_public) return false;

      return true;
    });

    // 2. 정렬 단계
    return filtered.sort((a, b) => {
      const propsA = a.properties;
      const propsB = b.properties;

      if (sortBy === "HOUSEHOLDS") {
        // 계획 세대수 큰 순 (내림차순)
        return (propsB.total_households || 0) - (propsA.total_households || 0);
      } else if (sortBy === "PROGRESS") {
        // 사업 진척도 빠른 순 (내림차순: 착공 > 관리처분 > 사업시행 ...)
        return propsB.stage_seq - propsA.stage_seq;
      } else {
        // 최신 고시순 (기본값)
        const dateA = propsA.approval_date ? new Date(propsA.approval_date).getTime() : 0;
        const dateB = propsB.approval_date ? new Date(propsB.approval_date).getTime() : 0;
        return dateB - dateA;
      }
    });
  }, [
    features,
    searchQuery,
    selectedGu,
    bizType,
    minHouseholds,
    isConsentFilterActive,
    transferableOnly,
    publicAdjacentOnly,
    sortBy,
    investmentPersona,
  ]);

  return (
    <aside
      className={cn(
        "relative z-[600] h-full bg-white border-r border-gray-200 shadow-xl flex flex-col transition-all duration-300 ease-in-out shrink-0 text-gray-900",
        isOpen ? "w-full sm:w-[430px] max-w-[100vw] sm:max-w-[430px]" : "w-0 overflow-hidden border-r-0"
      )}
    >
      {/* 1. 탭 전환 버튼 (사이드바 최상단 바로 노출) */}
      <div className="flex items-center border-b border-gray-200 bg-gray-50 p-2 gap-1.5 shrink-0">
        <button
          onClick={() => setActiveTab("list")}
          className={cn(
            "flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-semibold rounded-xl transition-all cursor-pointer",
            activeTab === "list"
              ? "bg-white text-blue-600 shadow-xs border border-gray-200 font-bold"
              : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
          )}
        >
          <Building className="w-3.5 h-3.5" />
          <span>구역 필터 ({filteredAndSortedFeatures.length})</span>
        </button>
        <button
          onClick={() => setActiveTab("timeline")}
          className={cn(
            "flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-semibold rounded-xl transition-all cursor-pointer",
            activeTab === "timeline"
              ? "bg-white text-blue-600 shadow-xs border border-gray-200 font-bold"
              : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
          )}
        >
          <History className="w-3.5 h-3.5" />
          <span>실시간 고시 타임라인</span>
        </button>
        {/* 모바일 패널 닫기 버튼 */}
        <button
          onClick={onToggle}
          className="p-2 rounded-xl text-gray-500 hover:text-gray-800 hover:bg-gray-100 transition-colors sm:hidden cursor-pointer shrink-0"
          title="패널 닫기"
          aria-label="패널 닫기"
        >
          <X className="w-4 h-4" />
        </button>
      </div>


      {/* 3. 탭 내용 영역 */}
      {activeTab === "timeline" ? (
        <div className="flex-1 overflow-y-auto bg-white">
          {/* 전체 구역 데이터를 전달하여 고시일자 최신순 정렬 피드 렌더링 */}
          <TimelineFeed features={features} onSelectMobile={onToggle} />
        </div>
      ) : (
        <div className="flex-1 flex flex-col min-h-0 bg-white">
          {/* 필터 & 정렬 컨트롤 영역 */}
          <div className="p-3.5 border-b border-gray-200 space-y-2.5 bg-white">
            {/* (1) 검색창 & 자치구 드롭다운 */}
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="구역명/지번 검색 (예: 한남3, 사직)"
                  className="w-full pl-9 pr-3 py-1.5 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 focus:bg-white transition-all text-gray-900 placeholder:text-gray-400"
                />
              </div>

              {/* 자치구 25개 선택 */}
              <select
                value={selectedGu}
                onChange={(e) => setSelectedGu(e.target.value)}
                className="text-xs font-semibold px-2 py-1.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-blue-500 text-gray-800 cursor-pointer max-w-[105px]"
              >
                <option value="ALL">전체 자치구</option>
                {guList.map((gu) => (
                  <option key={gu} value={gu}>
                    {gu}
                  </option>
                ))}
              </select>
            </div>

            {/* (2) 목록 정렬 옵션 드롭다운 */}
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-1.5 text-[11px] font-bold text-gray-500">
                <ArrowUpDown className="w-3.5 h-3.5 text-blue-600" />
                <span>목록 정렬</span>
              </div>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortOption)}
                className="text-xs font-bold px-2.5 py-1 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-lg text-gray-800 cursor-pointer focus:outline-none focus:ring-1 focus:ring-blue-500 transition-colors"
              >
                <option value="LATEST">📅 최신 고시순</option>
                <option value="HOUSEHOLDS">🏢 계획 세대수 큰 순</option>
                <option value="PROGRESS">⚡ 사업 진척도 빠른 순</option>
              </select>
            </div>

            {/* (3) 투자 성향별 퀵 필터 칩 */}
            <div className="space-y-1">
              <span className="text-[11px] font-bold text-gray-500 block">투자 성향별 퀵 필터</span>
              <div className="grid grid-cols-2 gap-1.5">
                {/* 칩 1: 초기 소액/후보지 */}
                <button
                  type="button"
                  onClick={() =>
                    setInvestmentPersona(investmentPersona === "EARLY_SEED" ? "ALL" : "EARLY_SEED")
                  }
                  className={cn(
                    "flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-xl text-xs font-bold border transition-all cursor-pointer",
                    investmentPersona === "EARLY_SEED"
                      ? "bg-emerald-600 text-white border-emerald-600 shadow-xs"
                      : "bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border-emerald-200"
                  )}
                >
                  <Sprout className="w-3.5 h-3.5 text-emerald-600" />
                  <span>🌱 초기 소액/후보지</span>
                </button>

                {/* 칩 2: 입주 임박/안전 구역 */}
                <button
                  type="button"
                  onClick={() =>
                    setInvestmentPersona(investmentPersona === "IMMINENT_SAFE" ? "ALL" : "IMMINENT_SAFE")
                  }
                  className={cn(
                    "flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-xl text-xs font-bold border transition-all cursor-pointer",
                    investmentPersona === "IMMINENT_SAFE"
                      ? "bg-indigo-600 text-white border-indigo-600 shadow-xs"
                      : "bg-indigo-50 hover:bg-indigo-100 text-indigo-800 border-indigo-200"
                  )}
                >
                  <Trophy className="w-3.5 h-3.5 text-indigo-600" />
                  <span>🏆 입주 임박/안전 구역</span>
                </button>
              </div>
            </div>

            {/* (4) 사업 유형 필터 탭 */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-[11px] font-bold text-gray-500">사업 유형</span>
                {(bizType !== "ALL" ||
                  selectedGu !== "ALL" ||
                  investmentPersona !== "ALL" ||
                  isConsentFilterActive ||
                  transferableOnly ||
                  publicAdjacentOnly ||
                  minHouseholds > 0) && (
                  <button
                    onClick={resetFilters}
                    className="flex items-center gap-1 text-[10px] text-blue-600 hover:underline cursor-pointer"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>초기화</span>
                  </button>
                )}
              </div>
              <div className="grid grid-cols-3 gap-1.5">
                {BIZ_TYPES.map((type) => (
                  <button
                    key={type.value}
                    type="button"
                    onClick={() => setBizType(type.value)}
                    className={cn(
                      "py-1 px-1.5 rounded-lg text-xs font-medium text-center border transition-all cursor-pointer truncate",
                      bizType === type.value
                        ? "bg-blue-600 border-blue-600 text-white shadow-xs font-semibold"
                        : "bg-gray-50 hover:bg-gray-100 border-gray-200 text-gray-700"
                    )}
                  >
                    {type.label}
                  </button>
                ))}
              </div>
            </div>

            {/* (5) 추가 조건 토글 버튼 */}
            <div className="flex flex-wrap gap-1.5 pt-0.5">
              <button
                type="button"
                onClick={() => setMinHouseholds(minHouseholds === 1000 ? 0 : 1000)}
                className={cn(
                  "flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-medium border transition-all cursor-pointer",
                  minHouseholds === 1000
                    ? "bg-indigo-600 border-indigo-600 text-white font-semibold shadow-xs"
                    : "bg-gray-50 hover:bg-gray-100 border-gray-200 text-gray-700"
                )}
              >
                <Home className="w-3 h-3 text-indigo-500" />
                1,000세대↑ 대단지
              </button>

              <button
                type="button"
                onClick={() => setIsConsentFilterActive(!isConsentFilterActive)}
                className={cn(
                  "flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-medium border transition-all cursor-pointer",
                  isConsentFilterActive
                    ? "bg-blue-600 border-blue-600 text-white font-semibold shadow-xs"
                    : "bg-gray-50 hover:bg-gray-100 border-gray-200 text-gray-700"
                )}
              >
                <CheckCircle2 className="w-3 h-3 text-blue-500" />
                동의율 ≥ 70%
              </button>

              <button
                type="button"
                onClick={() => setTransferableOnly(!transferableOnly)}
                className={cn(
                  "flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-medium border transition-all cursor-pointer",
                  transferableOnly
                    ? "bg-emerald-600 border-emerald-600 text-white font-semibold shadow-xs"
                    : "bg-gray-50 hover:bg-gray-100 border-gray-200 text-gray-700"
                )}
              >
                <ShieldCheck className="w-3 h-3 text-emerald-500" />
                지위양도 가능
              </button>
            </div>
          </div>

          {/* (6) 필터링 및 정렬된 구역 리스트 (스크롤) */}
          <div className="flex-1 overflow-y-auto p-3 space-y-2">
            {filteredAndSortedFeatures.length === 0 ? (
              <div className="py-12 text-center text-gray-400">
                <Filter className="w-8 h-8 mx-auto mb-2 opacity-40 text-gray-400" />
                <p className="text-xs font-semibold text-gray-700">조건에 맞는 구역이 없습니다.</p>
                <p className="text-[11px] text-gray-500 mt-1">필터 조건을 완화해 보세요.</p>
                <button
                  onClick={resetFilters}
                  className="mt-3 px-3 py-1.5 rounded-lg bg-gray-100 text-gray-700 text-xs font-semibold hover:bg-gray-200 transition-colors cursor-pointer"
                >
                  필터 초기화
                </button>
              </div>
            ) : (
              filteredAndSortedFeatures.map((f) => {
                const props = f.properties;
                const isSelected = selectedUid === props.master_uid;
                const inCompare = isInCompare(props.master_uid);
                const totalH = props.total_households || 0;

                return (
                  <div
                    key={props.master_uid}
                    onClick={() => {
                      setSelectedUid(props.master_uid);
                      setSelectedDistrict(props);
                      if (props.centroid) {
                        setFlyToTarget([props.centroid[1], props.centroid[0]]);
                      }
                      if (typeof window !== "undefined" && window.innerWidth < 768) {
                        onToggle();
                      }
                    }}
                    className={cn(
                      "p-3 rounded-xl border transition-all cursor-pointer group pt-3",
                      isSelected
                        ? "bg-blue-50 border-blue-500 shadow-sm"
                        : "bg-white hover:bg-slate-50 border-gray-200 hover:border-blue-300 shadow-2xs"
                    )}
                  >
                    <div className="flex items-center justify-between gap-1.5 mb-1.5 flex-wrap">
                      <div className="flex items-center gap-1">
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200">
                          {props.gu}
                        </span>
                        <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-gray-100 text-gray-700 border border-gray-200">
                          {props.biz_type_label}
                        </span>
                      </div>
                      <StageBadge stageCode={props.stage_code} />
                    </div>

                    <h3 className="text-xs font-bold text-gray-900 group-hover:text-blue-600 transition-colors leading-snug">
                      {props.name}
                    </h3>

                    <div className="flex items-center gap-1 text-[11px] text-gray-500 mt-1">
                      <MapPin className="w-3 h-3 text-gray-400 shrink-0" />
                      <span className="truncate">{props.address_jibun || props.legal_dong}</span>
                      <span className="text-gray-300">•</span>
                      <span>{props.approval_date}</span>
                    </div>

                    {/* 세대수 및 비교담기 버튼 영역 */}
                    <div className="flex items-center justify-between gap-2 mt-2 pt-2 border-t border-gray-100 text-[11px]">
                      <div className="flex items-center gap-1 text-gray-700">
                        <Home className="w-3 h-3 text-indigo-500" />
                        <span className="text-gray-400">공급:</span>
                        <strong className="text-gray-800 font-bold">
                          {totalH > 0 ? `${totalH.toLocaleString()}세대` : "계획중"}
                        </strong>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        <Link
                          href={`/districts/${props.master_uid}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="px-2 py-0.5 rounded-lg text-[10px] font-bold border border-blue-200 bg-blue-50 hover:bg-blue-100 text-blue-700 transition-all flex items-center gap-0.5 cursor-pointer shadow-2xs"
                          title="정밀 분석 리포트 새 창으로 열기"
                        >
                          <span>리포트</span>
                          <ExternalLink className="w-2.5 h-2.5" />
                        </Link>

                        {/* [+ 비교담기] 버튼 */}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            addToCompare(props);
                          }}
                          className={cn(
                            "px-2 py-0.5 rounded-lg text-[10px] font-bold border transition-all cursor-pointer flex items-center gap-1 shrink-0",
                            inCompare
                              ? "bg-blue-600 text-white border-blue-600 shadow-xs"
                              : "bg-gray-100 hover:bg-gray-200 text-gray-700 border-gray-200"
                          )}
                        >
                          <ArrowLeftRight className="w-2.5 h-2.5" />
                          <span>{inCompare ? "담김 ✓" : "+ 비교"}</span>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* 4. 하단 서비스 푸터 & 개인정보처리방침 안내 링크 (애드센스 필수) */}
      <div className="p-2.5 px-3.5 border-t border-gray-200 bg-gray-50 text-[11px] text-gray-500 flex items-center justify-between shrink-0">
        <span>© 2026 서울시 정비사업</span>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onOpenPrivacy}
            className="text-gray-500 hover:text-blue-600 underline font-semibold cursor-pointer"
          >
            개인정보처리방침
          </button>
          <Link href="/privacy" className="text-gray-400 hover:text-blue-600" title="전체 페이지 보기">
            <ExternalLink className="w-3 h-3" />
          </Link>
        </div>
      </div>
    </aside>

  );
}
