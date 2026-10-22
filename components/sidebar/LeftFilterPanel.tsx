"use client";

import { useMemo, useState, useEffect } from "react";
import { useFilterStore, SortOption, InvestmentPersona } from "@/lib/store/useFilterStore";
import { useMapStore } from "@/lib/store/useMapStore";
import { useCompareStore } from "@/lib/store/useCompareStore";
import { DistrictFeature } from "@/lib/types/district";
import { BIZ_TYPES } from "@/lib/constants/stages";
import { StageBadge } from "@/components/ui/StageBadge";
import { TimelineFeed } from "./TimelineFeed";
import { DistrictCard } from "./DistrictCard";
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
  ChevronLeft,
  Star,
  Zap,
  Building2,
  Calculator,
  FileText,
  Shield,
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

  const { selectedUid, setSelectedUid, selectedDistrict, setSelectedDistrict, setFlyToTarget } = useMapStore();
  const { addToCompare, isInCompare, compareList, setIsModalOpen } = useCompareStore();

  // 1. 검색창 디바운스 최적화: 타이핑할 때 렉 없이 부드럽게 반응하도록 처리
  const [localSearch, setLocalSearch] = useState(searchQuery);

  useEffect(() => {
    setLocalSearch(searchQuery);
  }, [searchQuery]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchQuery(localSearch);
    }, 200);
    return () => clearTimeout(timer);
  }, [localSearch, setSearchQuery]);

  // 2. 대량 카드 렌더링 렉 방지: 한 번에 30개씩 가볍게 렌더링
  const [visibleCount, setVisibleCount] = useState(30);

  // 모바일 화면에서는 상세 필터를 기본 접어 구역 카드가 바로 보이도록 하고, 데스크톱에서는 펼침
  const [isDetailedFilterOpen, setIsDetailedFilterOpen] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined" && window.innerWidth >= 768) {
      setIsDetailedFilterOpen(true);
    }
  }, []);

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

      // (3) 사업 유형 필터 (신속통합기획/모아타운/재개발/재건축 키워드 및 플래그 연동)
      if (bizType !== "ALL") {
        if (bizType === "SINTHONG") {
          const isSt =
            props.isShinTong === true ||
            props.is_shintong === true ||
            props.biz_type === "SINTHONG" ||
            props.biz_type_label === "신속통합기획" ||
            props.businessType === "신속통합기획" ||
            /신속통합|신통|기획/.test(props.name || "") ||
            /신속통합|신통|기획/.test(props.raw_name || "") ||
            /신속통합|신통|기획/.test(props.remark || "") ||
            (props.tags && props.tags.some((t: string) => /신속통합|신통|기획/.test(t)));
          if (!isSt) return false;
        } else if (bizType === "MOA") {
          const isM =
            props.isMoa === true ||
            props.is_moa === true ||
            props.biz_type === "MOA" ||
            props.biz_type_label === "모아타운" ||
            props.businessType === "모아타운" ||
            /모아|소규모|모아타운/.test(props.name || "") ||
            /모아|소규모|모아타운/.test(props.raw_name || "") ||
            /모아|소규모|모아타운/.test(props.remark || "") ||
            (props.tags && props.tags.some((t: string) => /모아|소규모/.test(t)));
          if (!isM) return false;
        } else if (bizType === "REDEVELOPMENT") {
          const isRdev =
            props.biz_type === "REDEVELOPMENT" ||
            props.biz_type_label?.includes("재개발") ||
            props.raw_biz_type?.includes("재개발");
          if (!isRdev) return false;
        } else if (bizType === "RECONSTRUCTION") {
          const isRcon =
            props.biz_type === "RECONSTRUCTION" ||
            props.biz_type_label?.includes("재건축") ||
            props.raw_biz_type?.includes("재건축");
          if (!isRcon) return false;
        }
      }

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

  // 필터나 검색어가 바뀔 때 보이는 개수를 처음 30개로 깔끔하게 초기화
  useEffect(() => {
    setVisibleCount(30);
  }, [searchQuery, selectedGu, bizType, minHouseholds, isConsentFilterActive, transferableOnly, publicAdjacentOnly, sortBy, investmentPersona]);

  // 사업 유형별 개수 집계
  const bizCounts = useMemo(() => {
    let sinthong = 0;
    let moa = 0;
    let rdev = 0;
    let rcon = 0;
    features.forEach((f) => {
      const p = f.properties;
      const isSt =
        p.isShinTong === true ||
        p.is_shintong === true ||
        p.biz_type === "SINTHONG" ||
        p.businessType === "신속통합기획" ||
        /신속통합|신통|기획/.test(p.name || "") ||
        /신속통합|신통|기획/.test(p.remark || "");
      const isM =
        p.isMoa === true ||
        p.is_moa === true ||
        p.biz_type === "MOA" ||
        p.businessType === "모아타운" ||
        /모아|소규모|모아타운/.test(p.name || "") ||
        /모아|소규모|모아타운/.test(p.remark || "");

      if (isSt) sinthong++;
      if (isM) moa++;
      if (p.biz_type === "REDEVELOPMENT" || p.biz_type_label?.includes("재개발") || p.raw_biz_type?.includes("재개발")) rdev++;
      if (p.biz_type === "RECONSTRUCTION" || p.biz_type_label?.includes("재건축") || p.raw_biz_type?.includes("재건축")) rcon++;
    });
    return {
      ALL: features.length,
      SINTHONG: sinthong,
      MOA: moa,
      REDEVELOPMENT: rdev,
      RECONSTRUCTION: rcon,
    };
  }, [features]);

  return (
    <aside className="relative z-20 h-full flex shrink-0 text-gray-900 select-none">
      {/* 1. 네이버 스타일 맨 좌측 세로 레일 메뉴 (LNB) - 데스크톱 상시 고정 */}
      <nav
        className="hidden sm:flex w-[72px] h-full bg-white border-r border-gray-200 flex-col items-center justify-between py-3 px-1 shrink-0 z-30 shadow-2xs"
        aria-label="네이버 스타일 메인 내비게이션"
      >
        {/* 상단 메인 메뉴 그룹 */}
        <div className="flex flex-col items-center gap-1.5 w-full">
          {/* (1) 홈 (지도) */}
          <button
            type="button"
            onClick={() => {
              if (!isOpen) onToggle();
              setActiveTab("list");
              setSelectedDistrict(null);
              setSelectedUid(null);
            }}
            className={cn(
              "w-[60px] py-2.5 rounded-2xl flex flex-col items-center justify-center gap-1 transition-all cursor-pointer group",
              activeTab === "list" && !selectedDistrict && isOpen
                ? "bg-[#03C75A] text-white font-black shadow-md shadow-[#03C75A]/25"
                : "text-gray-600 hover:text-gray-900 hover:bg-gray-100 font-bold"
            )}
            title="정비사업 지도 홈"
          >
            <Home className="w-5 h-5 group-hover:scale-110 transition-transform" />
            <span className="text-[11px] font-bold tracking-tight">홈</span>
          </button>

          {/* (2) 관심·비교 (비교함) */}
          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className="w-[60px] py-2.5 rounded-2xl flex flex-col items-center justify-center gap-1 text-gray-600 hover:text-gray-900 hover:bg-gray-100 font-bold transition-all cursor-pointer relative group"
            title="관심 구역 비교함 열기"
          >
            <Star className="w-5 h-5 text-amber-500 group-hover:scale-110 transition-transform fill-amber-400/20" />
            <span className="text-[11px] font-bold tracking-tight">관심·비교</span>
            {compareList.length > 0 && (
              <span className="absolute top-1.5 right-2 px-1.5 py-0.2 rounded-full text-[10px] font-black bg-blue-600 text-white shadow-2xs">
                {compareList.length}
              </span>
            )}
          </button>

          {/* (3) 분양·청약 라운지 */}
          <Link
            href="/subscription"
            className="w-[60px] py-2.5 rounded-2xl flex flex-col items-center justify-center gap-1 text-gray-600 hover:text-blue-600 hover:bg-gray-100 font-bold transition-all cursor-pointer relative group"
            title="아파트 분양 캘린더 & 청약 라운지"
          >
            <Building2 className="w-5 h-5 text-blue-600 group-hover:scale-110 transition-transform" />
            <span className="text-[11px] font-bold tracking-tight">분양·청약</span>
            <span className="absolute top-1.5 right-2.5 w-1.5 h-1.5 rounded-full bg-blue-600 animate-pulse" />
          </Link>

          {/* (4) 구역별 분석 리포트 */}
          <Link
            href="/districts/"
            className="w-[60px] py-2.5 rounded-2xl flex flex-col items-center justify-center gap-1 text-gray-600 hover:text-emerald-700 hover:bg-gray-100 font-bold transition-all cursor-pointer group"
            title="구역별 심층 분석 리포트 전체 색인"
          >
            <FileText className="w-5 h-5 text-emerald-600 group-hover:scale-110 transition-transform" />
            <span className="text-[11px] font-bold tracking-tight">구역리포트</span>
          </Link>

          {/* (5) 부동산 계산기 */}
          <Link
            href="/calculators"
            className="w-[60px] py-2.5 rounded-2xl flex flex-col items-center justify-center gap-1 text-gray-600 hover:text-amber-700 hover:bg-gray-100 font-bold transition-all cursor-pointer relative group"
            title="분담금·취득세/양도세·DSR 대출 계산기"
          >
            <Calculator className="w-5 h-5 text-amber-600 group-hover:scale-110 transition-transform" />
            <span className="text-[11px] font-bold tracking-tight">계산기</span>
            <span className="absolute top-1.5 right-1 px-1 py-0.2 rounded text-[9px] font-black bg-amber-100 text-amber-800">HOT</span>
          </Link>

          {/* (6) 실시간 고시 피드 */}
          <button
            type="button"
            onClick={() => {
              if (!isOpen) onToggle();
              setActiveTab("timeline");
              setSelectedDistrict(null);
            }}
            className={cn(
              "w-[60px] py-2.5 rounded-2xl flex flex-col items-center justify-center gap-1 transition-all cursor-pointer group relative",
              activeTab === "timeline" && isOpen
                ? "bg-indigo-600 text-white font-black shadow-md shadow-indigo-600/25"
                : "text-gray-600 hover:text-indigo-600 hover:bg-gray-100 font-bold"
            )}
            title="실시간 인허가 고시 타임라인 피드"
          >
            <Zap className={cn("w-5 h-5 group-hover:scale-110 transition-transform", activeTab === "timeline" && isOpen ? "text-white" : "text-indigo-600")} />
            <span className="text-[11px] font-bold tracking-tight">고시피드</span>
          </button>
        </div>

        {/* 하단 약관 & 정보 링크 */}
        <div className="flex flex-col items-center gap-2 w-full pt-3 border-t border-gray-100">
          <button
            type="button"
            onClick={onOpenPrivacy}
            className="text-[10px] text-gray-500 hover:text-gray-900 font-semibold p-1 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
            title="개인정보처리방침"
          >
            개인정보
          </button>
          <Link
            href="/terms"
            className="text-[10px] text-gray-500 hover:text-gray-900 font-semibold p-1 hover:bg-gray-100 rounded-lg transition-colors"
            title="이용약관"
          >
            이용약관
          </Link>
        </div>
      </nav>

      {/* 2. 우측 컨텐츠 패널 (기존 필터/목록/구역상세) */}
      <div
        className={cn(
          "relative h-full bg-white border-r border-gray-200 shadow-xl flex flex-col transition-all duration-300 ease-in-out shrink-0 overflow-hidden",
          isOpen ? "w-full sm:w-[430px] max-w-[100vw] sm:max-w-[430px]" : "w-0 border-r-0"
        )}
      >
      {/* A. 구역이 선택되었을 때: 네이버 부동산 스타일 단일 패널 전환 (DistrictCard 렌더링) */}
      {selectedDistrict ? (
        <div className="flex-1 flex flex-col min-h-0 bg-white">
          {/* 상단 뒤로가기 내비게이션 바 */}
          <div className="flex items-center justify-between p-3.5 border-b border-gray-200 bg-gray-50/90 backdrop-blur-sm shrink-0">
            <button
              type="button"
              onClick={() => {
                setSelectedDistrict(null);
                setSelectedUid(null);
              }}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white border border-gray-300 text-sm font-extrabold text-gray-800 hover:text-blue-600 hover:border-blue-400 transition-all shadow-2xs cursor-pointer group"
            >
              <ChevronLeft className="w-4 h-4 text-blue-600 group-hover:-translate-x-0.5 transition-transform" />
              <span>← 전체 구역 목록으로</span>
            </button>
            <button
              onClick={onToggle}
              className="p-2 rounded-xl text-gray-500 hover:text-gray-800 hover:bg-gray-200 sm:hidden cursor-pointer"
              title="패널 닫기"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* 구역 상세 정보 카드 렌더링 (단일 패널 내부 스크롤) */}
          <div className="flex-1 overflow-y-auto bg-white">
            <DistrictCard />
          </div>
        </div>
      ) : (
        <>
          {/* B. 일반 목록 상태: 탭 전환 버튼 및 필터 목록 */}
          <div className="flex items-center border-b border-gray-200 bg-gray-50 p-2.5 gap-2 shrink-0">
            <button
              onClick={() => setActiveTab("list")}
              className={cn(
                "flex-1 flex items-center justify-center gap-2 py-2.5 text-sm rounded-xl transition-all cursor-pointer font-bold",
                activeTab === "list"
                  ? "bg-white text-blue-600 shadow-xs border border-gray-200 font-extrabold"
                  : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
              )}
            >
              <Building className="w-4 h-4 text-blue-600" />
              <span>구역 필터 ({filteredAndSortedFeatures.length})</span>
            </button>
            <button
              onClick={() => setActiveTab("timeline")}
              className={cn(
                "flex-1 flex items-center justify-center gap-2 py-2.5 text-sm rounded-xl transition-all cursor-pointer font-bold",
                activeTab === "timeline"
                  ? "bg-white text-blue-600 shadow-xs border border-gray-200 font-extrabold"
                  : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
              )}
            >
              <History className="w-4 h-4 text-indigo-600" />
              <span>실시간 고시 타임라인</span>
            </button>
            {/* 모바일 패널 닫기 버튼 */}
            <button
              onClick={onToggle}
              className="p-2 rounded-xl text-gray-500 hover:text-gray-800 hover:bg-gray-100 transition-colors sm:hidden cursor-pointer shrink-0"
              title="패널 닫기"
              aria-label="패널 닫기"
            >
              <X className="w-5 h-5" />
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
              {/* 필터 & 정렬 컨트롤 영역 (상단 슬림 고정: 검색창 & 자치구 & 정렬 & 필터토글) */}
              <div className="p-3 sm:p-4 border-b border-gray-200 space-y-2.5 bg-white shrink-0">
                {/* (1) 검색창 & 자치구 드롭다운 */}
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      value={localSearch}
                      onChange={(e) => setLocalSearch(e.target.value)}
                      placeholder="구역명/지번 검색 (예: 한남3, 사직)"
                      className="w-full pl-10 pr-3.5 py-2 text-sm bg-gray-50 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:bg-white transition-all text-gray-900 placeholder:text-gray-400 font-medium"
                    />
                  </div>

                  {/* 자치구 25개 선택 */}
                  <select
                    value={selectedGu}
                    onChange={(e) => setSelectedGu(e.target.value)}
                    className="text-xs sm:text-sm font-bold px-2.5 sm:px-3 py-2 bg-gray-50 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800 cursor-pointer max-w-[130px]"
                  >
                    <option value="ALL">전체 지역 ({guList.length})</option>
                    {guList.map((gu) => (
                      <option key={gu} value={gu}>
                        {gu}
                      </option>
                    ))}
                  </select>
                </div>

                {/* (2) 목록 정렬 옵션 & 상세 필터 접기/열기 버튼 */}
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5 text-xs font-extrabold text-gray-600">
                    <ArrowUpDown className="w-3.5 h-3.5 text-blue-600" />
                    <span>정렬:</span>
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value as SortOption)}
                      className="text-xs sm:text-sm font-extrabold px-2 py-1 bg-gray-50 hover:bg-gray-100 border border-gray-300 rounded-lg text-gray-800 cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                    >
                      <option value="LATEST">📅 최신 고시순</option>
                      <option value="HOUSEHOLDS">🏢 세대수 큰 순</option>
                      <option value="PROGRESS">⚡ 진척도 빠른 순</option>
                    </select>
                  </div>

                  {/* 상세 필터 접기/열기 토글 버튼 */}
                  <button
                    type="button"
                    onClick={() => setIsDetailedFilterOpen(!isDetailedFilterOpen)}
                    className="flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-bold border border-gray-200 bg-gray-50 hover:bg-gray-100 text-gray-700 transition-colors cursor-pointer"
                  >
                    <Filter className="w-3 h-3 text-blue-600" />
                    <span>{isDetailedFilterOpen ? "필터 접기 ▲" : "필터 펼치기 ▼"}</span>
                  </button>
                </div>
              </div>

              {/* 3. 일체형 통합 스크롤 영역 (상세 필터 + 배너 + 구역 카드가 모바일에서도 시원하게 아래로 스크롤됨!) */}
              <div
                className="flex-1 overflow-y-auto p-3 sm:p-3.5 space-y-3 pb-16"
                onScroll={(e) => {
                  const target = e.currentTarget;
                  if (target.scrollHeight - target.scrollTop <= target.clientHeight + 250) {
                    if (visibleCount < filteredAndSortedFeatures.length) {
                      setVisibleCount((prev) => Math.min(prev + 30, filteredAndSortedFeatures.length));
                    }
                  }
                }}
              >
                {/* (A) 상세 필터 영역 (펼쳐졌을 때 스크롤 컨테이너 상단에 매끄럽게 렌더링) */}
                {isDetailedFilterOpen && (
                  <div className="p-3.5 rounded-2xl bg-gray-50/80 border border-gray-200 space-y-3 shrink-0">
                    {/* (3) 투자 성향별 퀵 필터 칩 */}
                    <div className="space-y-1.5">
                      <span className="text-xs font-extrabold text-gray-600 block">투자 성향별 퀵 필터</span>
                      <div className="grid grid-cols-2 gap-2">
                        {/* 칩 1: 초기 소액/후보지 */}
                        <button
                          type="button"
                          onClick={() =>
                            setInvestmentPersona(investmentPersona === "EARLY_SEED" ? "ALL" : "EARLY_SEED")
                          }
                          className={cn(
                            "flex items-center justify-center gap-1.5 py-1.5 sm:py-2 px-2.5 rounded-xl text-xs sm:text-sm font-extrabold border transition-all cursor-pointer shadow-2xs",
                            investmentPersona === "EARLY_SEED"
                              ? "bg-emerald-600 text-white border-emerald-600 shadow-sm"
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
                            "flex items-center justify-center gap-1.5 py-1.5 sm:py-2 px-2.5 rounded-xl text-xs sm:text-sm font-extrabold border transition-all cursor-pointer shadow-2xs",
                            investmentPersona === "IMMINENT_SAFE"
                              ? "bg-indigo-600 text-white border-indigo-600 shadow-sm"
                              : "bg-indigo-50 hover:bg-indigo-100 text-indigo-800 border-indigo-200"
                          )}
                        >
                          <Trophy className="w-3.5 h-3.5 text-indigo-600" />
                          <span>🏆 입주 임박/안전</span>
                        </button>
                      </div>
                    </div>

                    {/* (4) 사업 유형 필터 탭 */}
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-xs font-extrabold text-gray-600">사업 유형</span>
                        {(bizType !== "ALL" ||
                          selectedGu !== "ALL" ||
                          investmentPersona !== "ALL" ||
                          isConsentFilterActive ||
                          transferableOnly ||
                          publicAdjacentOnly ||
                          minHouseholds > 0) && (
                          <button
                            onClick={resetFilters}
                            className="flex items-center gap-1 text-xs text-blue-600 font-bold hover:underline cursor-pointer"
                          >
                            <RotateCcw className="w-3.5 h-3.5" />
                            <span>초기화</span>
                          </button>
                        )}
                      </div>
                      <div className="grid grid-cols-3 gap-1.5">
                        {BIZ_TYPES.map((type) => {
                          const count = bizCounts[type.value as keyof typeof bizCounts] ?? 0;
                          return (
                            <button
                              key={type.value}
                              type="button"
                              onClick={() => setBizType(type.value)}
                              className={cn(
                                "py-1.5 px-1.5 rounded-xl text-xs font-bold text-center border transition-all cursor-pointer flex items-center justify-center gap-1",
                                bizType === type.value
                                  ? "bg-blue-600 border-blue-600 text-white shadow-xs font-extrabold"
                                  : "bg-white hover:bg-gray-100 border-gray-200 text-gray-700"
                              )}
                              title={`${type.label}: ${count}개 구역`}
                            >
                              <span className="truncate">{type.label}</span>
                              <span
                                className={cn(
                                  "text-[10px] px-1 py-0.2 rounded-full font-black shrink-0",
                                  bizType === type.value ? "bg-white/30 text-white" : "bg-gray-200 text-gray-700"
                                )}
                              >
                                {count}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* (5) 추가 조건 토글 버튼 */}
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      <button
                        type="button"
                        onClick={() => setMinHouseholds(minHouseholds === 1000 ? 0 : 1000)}
                        className={cn(
                          "flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer shadow-2xs",
                          minHouseholds === 1000
                            ? "bg-indigo-600 border-indigo-600 text-white font-extrabold shadow-xs"
                            : "bg-white hover:bg-gray-100 border-gray-300 text-gray-700"
                        )}
                      >
                        <Home className="w-3.5 h-3.5 text-indigo-500" />
                        1,000세대↑
                      </button>

                      <button
                        type="button"
                        onClick={() => setIsConsentFilterActive(!isConsentFilterActive)}
                        className={cn(
                          "flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer shadow-2xs",
                          isConsentFilterActive
                            ? "bg-blue-600 border-blue-600 text-white font-extrabold shadow-xs"
                            : "bg-white hover:bg-gray-100 border-gray-300 text-gray-700"
                        )}
                      >
                        <CheckCircle2 className="w-3.5 h-3.5 text-blue-500" />
                        동의율 ≥ 70%
                      </button>

                      <button
                        type="button"
                        onClick={() => setTransferableOnly(!transferableOnly)}
                        className={cn(
                          "flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer shadow-2xs",
                          transferableOnly
                            ? "bg-emerald-600 border-emerald-600 text-white font-extrabold shadow-xs"
                            : "bg-white hover:bg-gray-100 border-gray-300 text-gray-700"
                        )}
                      >
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                        지위양도 가능
                      </button>
                    </div>
                  </div>
                )}

                {/* (B) 퀵 링크 배너 2종 (분양 캘린더 & 부동산 계산기) */}
                <div className="space-y-2 shrink-0">
                  {/* 1. 분양 캘린더 & 가점 배너 */}
                  <Link
                    href="/subscription"
                    className="p-3 rounded-2xl bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 hover:border-blue-400 flex items-center justify-between transition-all shadow-2xs group"
                    title="수도권 아파트 분양 일정 및 청약 가점 계산기로 이동"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center text-sm shadow-xs group-hover:scale-105 transition-transform shrink-0">
                        🏢
                      </div>
                      <div className="min-w-0">
                        <div className="font-extrabold text-slate-900 group-hover:text-blue-600 flex items-center gap-1.5 text-xs sm:text-sm">
                          <span className="truncate">이달의 분양 캘린더 &amp; 가점 계산</span>
                          <span className="text-[10px] px-1.5 py-0.2 bg-blue-600 text-white rounded-full font-black shrink-0">청약</span>
                        </div>
                        <div className="text-[11px] text-slate-500 font-medium truncate">84점 만점 당첨 진단 · 수도권 분양 일정</div>
                      </div>
                    </div>
                    <span className="text-blue-600 font-black text-sm group-hover:translate-x-1 transition-transform pl-1 shrink-0">→</span>
                  </Link>

                  {/* 2. 신규: 부동산 계산기 허브 배너 */}
                  <Link
                    href="/calculators"
                    className="p-3 rounded-2xl bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 hover:border-amber-400 flex items-center justify-between transition-all shadow-2xs group"
                    title="재개발 분담금, 취득세·양도세, DSR 대출한도 계산기"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-8 h-8 rounded-xl bg-amber-600 text-white flex items-center justify-center text-sm shadow-xs group-hover:scale-105 transition-transform shrink-0">
                        🧮
                      </div>
                      <div className="min-w-0">
                        <div className="font-extrabold text-slate-900 group-hover:text-amber-700 flex items-center gap-1.5 text-xs sm:text-sm">
                          <span className="truncate">부동산 계산기 (분담금·세금·대출)</span>
                          <span className="text-[10px] px-1.5 py-0.2 bg-amber-600 text-white rounded-full font-black shrink-0">HOT</span>
                        </div>
                        <div className="text-[11px] text-slate-500 font-medium truncate">재개발 분담금 · 취득세/양도세 · 스트레스 DSR</div>
                      </div>
                    </div>
                    <span className="text-amber-600 font-black text-sm group-hover:translate-x-1 transition-transform pl-1 shrink-0">→</span>
                  </Link>
                </div>

                {/* (C) 구역 목록 카운트 바 */}
                <div className="flex items-center justify-between px-1 pt-1 text-xs font-bold text-gray-500">
                  <span>추천 정비구역 목록 ({filteredAndSortedFeatures.length}개)</span>
                  <span className="text-[11px] text-gray-400">터치 시 지도가 해당 구역으로 이동합니다</span>
                </div>
                {filteredAndSortedFeatures.length === 0 ? (
                  <div className="py-12 text-center text-gray-400">
                    <Filter className="w-10 h-10 mx-auto mb-2 opacity-40 text-gray-400" />
                    <p className="text-base font-bold text-gray-700">조건에 맞는 구역이 없습니다.</p>
                    <p className="text-sm text-gray-500 mt-1">필터 조건을 완화해 보세요.</p>
                    <button
                      onClick={resetFilters}
                      className="mt-3 px-4 py-2 rounded-xl bg-gray-100 text-gray-700 text-sm font-bold hover:bg-gray-200 transition-colors cursor-pointer"
                    >
                      필터 초기화
                    </button>
                  </div>
                ) : (
                  <>
                    {filteredAndSortedFeatures.slice(0, visibleCount).map((f) => {
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
                            "p-4 rounded-2xl border transition-all cursor-pointer group shadow-2xs",
                            isSelected
                              ? "bg-blue-50/70 border-blue-600 shadow-md ring-2 ring-blue-500"
                              : "bg-white hover:bg-slate-50 border-gray-200 hover:border-blue-400 hover:shadow-sm"
                          )}
                        >
                          {/* 상단 뱃지 라인 */}
                          <div className="flex items-center justify-between gap-2 mb-2 flex-wrap">
                            <div className="flex items-center gap-1.5">
                              <span className="text-xs sm:text-sm font-bold px-2.5 py-0.5 rounded-lg bg-blue-50 text-blue-700 border border-blue-200">
                                {props.gu}
                              </span>
                              <span className="text-xs sm:text-sm font-semibold px-2.5 py-0.5 rounded-lg bg-gray-100 text-gray-700 border border-gray-200">
                                {props.biz_type_label}
                              </span>
                            </div>
                            <StageBadge stageCode={props.stage_code} className="text-xs sm:text-sm font-bold px-2.5 py-0.5" />
                          </div>

                          {/* 구역명: 네이버 부동산 스타일 굵고 큼직한 타이포그래피 (18px font-black) */}
                          <h3 className="text-lg sm:text-[19px] font-black text-slate-900 group-hover:text-blue-600 transition-colors leading-snug tracking-tight">
                            {props.name}
                          </h3>

                          {/* 위치 & 날짜 정보 (13px 선명한 회색) */}
                          <div className="flex items-center gap-2 text-xs sm:text-sm text-slate-500 mt-2 font-medium">
                            <MapPin className="w-4 h-4 text-slate-400 shrink-0" />
                            <span className="truncate">{props.address_jibun || props.legal_dong}</span>
                            <span className="text-slate-300">•</span>
                            <span className="shrink-0">{props.approval_date || "고시 진행중"}</span>
                          </div>

                          {/* 하단 세대수 및 리포트/비교 버튼 */}
                          <div className="flex items-center justify-between gap-2 mt-3 pt-3 border-t border-gray-100">
                            {/* 공급/계획 세대수: 네이버 스타일 강조 */}
                            <div className="flex items-baseline gap-1.5">
                              <Home className="w-4 h-4 text-blue-600 shrink-0 self-center" />
                              <span className="text-xs sm:text-sm text-slate-500 font-bold">계획 세대수:</span>
                              <strong className="text-base sm:text-lg font-black text-blue-600">
                                {totalH > 0 ? `${totalH.toLocaleString()}세대` : "미정"}
                              </strong>
                            </div>

                            <div className="flex items-center gap-2 shrink-0">
                              <Link
                                href={`/districts/${props.master_uid}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                onClick={(e) => e.stopPropagation()}
                                className="px-3 py-1.5 rounded-xl text-xs sm:text-sm font-bold border border-blue-200 bg-blue-50 hover:bg-blue-100 text-blue-700 transition-all flex items-center gap-1 cursor-pointer shadow-2xs"
                                title="정밀 분석 리포트 새 창으로 열기"
                              >
                                <span>리포트</span>
                                <ExternalLink className="w-3.5 h-3.5" />
                              </Link>

                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  addToCompare(props);
                                }}
                                className={cn(
                                  "px-3 py-1.5 rounded-xl text-xs sm:text-sm font-bold border transition-all cursor-pointer flex items-center gap-1 shrink-0",
                                  inCompare
                                    ? "bg-blue-600 text-white border-blue-600 shadow-xs"
                                    : "bg-gray-100 hover:bg-gray-200 text-gray-700 border-gray-200"
                                )}
                              >
                                <ArrowLeftRight className="w-3.5 h-3.5" />
                                <span>{inCompare ? "담김 ✓" : "+ 비교"}</span>
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}

                    {/* 남은 구역이 있을 때 더보기 버튼 */}
                    {visibleCount < filteredAndSortedFeatures.length && (
                      <button
                        type="button"
                        onClick={() =>
                          setVisibleCount((prev) => Math.min(prev + 30, filteredAndSortedFeatures.length))
                        }
                        className="w-full py-3 px-4 rounded-xl border border-blue-200 bg-blue-50/80 hover:bg-blue-100 text-blue-700 text-sm font-bold transition-all flex items-center justify-center gap-2 cursor-pointer shadow-2xs active:scale-[0.99]"
                      >
                        <span>더보기 (+30개)</span>
                        <span className="text-xs text-blue-500 font-medium">
                          ({visibleCount} / {filteredAndSortedFeatures.length}개 표시 중)
                        </span>
                      </button>
                    )}
                  </>
                )}
              </div>
            </div>
          )}
        </>
      )}

      {/* 4. 하단 서비스 푸터 & 개인정보처리방침 안내 링크 (애드센스 필수) */}
      <div className="p-3 px-4 border-t border-gray-200 bg-gray-50 text-xs text-gray-500 flex items-center justify-between shrink-0">
        <span>© 2026 서울시 정비사업</span>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onOpenPrivacy}
            className="text-gray-500 hover:text-blue-600 underline font-semibold cursor-pointer"
          >
            개인정보처리방침
          </button>
          <span>•</span>
          <Link href="/terms" className="text-gray-500 hover:text-blue-600 underline font-semibold">
            이용약관
          </Link>
        </div>
      </div>
    </div>
  </aside>
  );
}
