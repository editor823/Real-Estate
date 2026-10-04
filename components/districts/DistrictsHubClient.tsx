"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { DISTRICTS_GEOJSON } from "@/lib/constants/districtsData";
import { StageBadge } from "@/components/ui/StageBadge";
import { AdSenseBanner } from "@/components/ads/AdSenseBanner";
import {
  Search,
  Building2,
  MapPin,
  Users,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Map,
  Filter,
  Sparkles,
  Calendar,
  X,
  FileText,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";

const SEOUL_GUS = [
  "전체",
  "강남구",
  "강동구",
  "강북구",
  "강서구",
  "관악구",
  "광진구",
  "구로구",
  "금천구",
  "노원구",
  "도봉구",
  "동대문구",
  "동작구",
  "마포구",
  "서대문구",
  "서초구",
  "성동구",
  "성북구",
  "송파구",
  "양천구",
  "영등포구",
  "용산구",
  "은평구",
  "종로구",
  "중구",
  "중랑구",
];

const BIZ_TABS = [
  { id: "ALL", label: "전체 구역" },
  { id: "SINTHONG", label: "신통기획" },
  { id: "MOA", label: "모아타운" },
  { id: "REDEVELOPMENT", label: "재개발" },
  { id: "RECONSTRUCTION", label: "재건축" },
];

const ITEMS_PER_PAGE = 24;

export function DistrictsHubClient() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedGu, setSelectedGu] = useState("전체");
  const [selectedBizType, setSelectedBizType] = useState("ALL");
  const [sortBy, setSortBy] = useState<"LATEST" | "HOUSEHOLDS" | "PROGRESS">("LATEST");
  const [currentPage, setCurrentPage] = useState(1);

  const allFeatures = DISTRICTS_GEOJSON.features || [];

  // 각 사업 유형별 통계 카운트 (신통/모아 플래그 및 키워드 연동)
  const stats = useMemo(() => {
    let sinthong = 0;
    let moa = 0;
    let rdev = 0;
    let rcon = 0;

    allFeatures.forEach((f) => {
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

    return { total: allFeatures.length, sinthong, moa, rdev, rcon };
  }, [allFeatures]);

  // 필터링 및 정렬
  const filteredDistricts = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();

    const filtered = allFeatures.filter((f) => {
      const props = f.properties;

      // 1. 검색어 필터 (구역명, 자치구, 법정동, 지번, 도로명)
      if (q) {
        const matchName = (props.name || "").toLowerCase().includes(q);
        const matchGu = (props.gu || "").toLowerCase().includes(q);
        const matchDong = (props.legal_dong || "").toLowerCase().includes(q);
        const matchJibun = (props.address_jibun || "").toLowerCase().includes(q);
        const matchDoro = (props.address_doro || "").toLowerCase().includes(q);
        if (!matchName && !matchGu && !matchDong && !matchJibun && !matchDoro) {
          return false;
        }
      }

      // 2. 자치구 필터
      if (selectedGu !== "전체" && props.gu !== selectedGu) {
        return false;
      }

      // 3. 사업 유형 필터 (신속통합기획 / 모아타운 조건 완벽 매칭)
      if (selectedBizType !== "ALL") {
        if (selectedBizType === "SINTHONG") {
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
        } else if (selectedBizType === "MOA") {
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
        } else if (selectedBizType === "REDEVELOPMENT") {
          const isRdev =
            props.biz_type === "REDEVELOPMENT" ||
            props.biz_type_label?.includes("재개발") ||
            props.raw_biz_type?.includes("재개발");
          if (!isRdev) return false;
        } else if (selectedBizType === "RECONSTRUCTION") {
          const isRcon =
            props.biz_type === "RECONSTRUCTION" ||
            props.biz_type_label?.includes("재건축") ||
            props.raw_biz_type?.includes("재건축");
          if (!isRcon) return false;
        }
      }

      return true;
    });

    // 정렬
    return filtered.sort((a, b) => {
      const pa = a.properties;
      const pb = b.properties;

      if (sortBy === "HOUSEHOLDS") {
        return (pb.total_households || 0) - (pa.total_households || 0);
      }
      if (sortBy === "PROGRESS") {
        return pb.stage_seq - pa.stage_seq;
      }
      // 최신 고시순
      const da = pa.approval_date ? new Date(pa.approval_date).getTime() : 0;
      const db = pb.approval_date ? new Date(pb.approval_date).getTime() : 0;
      return db - da;
    });
  }, [allFeatures, searchQuery, selectedGu, selectedBizType, sortBy]);

  // 페이지네이션 슬라이스
  const totalPages = Math.ceil(filteredDistricts.length / ITEMS_PER_PAGE) || 1;
  const paginatedDistricts = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredDistricts.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredDistricts, currentPage]);

  const handleGuChange = (gu: string) => {
    setSelectedGu(gu);
    setCurrentPage(1);
  };

  const handleBizTypeChange = (type: string) => {
    setSelectedBizType(type);
    setCurrentPage(1);
  };

  const handleSearchChange = (val: string) => {
    setSearchQuery(val);
    setCurrentPage(1);
  };

  const handleReset = () => {
    setSearchQuery("");
    setSelectedGu("전체");
    setSelectedBizType("ALL");
    setSortBy("LATEST");
    setCurrentPage(1);
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* 1. 히어로 인덱스 타이틀 섹션 */}
      <section className="relative p-6 sm:p-10 rounded-3xl bg-white border border-[#e7e3da] shadow-sm overflow-hidden">
        <div className="relative z-10 space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#eeeae2] border border-[#e0dad0] text-stone-700 text-xs font-bold">
            <Sparkles className="w-3.5 h-3.5 text-blue-600" />
            <span>서울시 25개 자치구 정비사업 인덱스</span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-extrabold text-stone-900 tracking-tight leading-tight">
            📑 서울시 정비사업 구역별 정밀 분석 리포트
          </h1>

          <p className="text-sm sm:text-base text-stone-700 max-w-3xl leading-relaxed">
            서울시 내 추진 중인 <strong>496개 정비구역</strong>의 현재 사업 단계, 권리산정기준일, 
            조합원 지위양도/현금청산 안전성 진단, 계획 세대수 및 예상 타임라인 해설 리포트를 한곳에서 검색하고 열람하세요.
          </p>

          {/* 사업 유형별 요약 카운터 */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5 pt-4">
            <div className="p-3.5 rounded-2xl bg-[#faf8f5] border border-[#e7e3da]">
              <span className="text-[11px] text-stone-500 font-medium block">총 정비구역</span>
              <span className="text-xl font-black text-stone-900">{stats.total}개소</span>
            </div>
            <div className="p-3.5 rounded-2xl bg-[#faf8f5] border border-[#e7e3da]">
              <span className="text-[11px] text-blue-700 font-medium block">신속통합기획</span>
              <span className="text-xl font-black text-blue-700">{stats.sinthong}개소</span>
            </div>
            <div className="p-3.5 rounded-2xl bg-[#faf8f5] border border-[#e7e3da]">
              <span className="text-[11px] text-amber-700 font-medium block">모아타운</span>
              <span className="text-xl font-black text-amber-700">{stats.moa}개소</span>
            </div>
            <div className="p-3.5 rounded-2xl bg-[#faf8f5] border border-[#e7e3da]">
              <span className="text-[11px] text-indigo-700 font-medium block">재개발</span>
              <span className="text-xl font-black text-indigo-700">{stats.rdev}개소</span>
            </div>
            <div className="p-3.5 rounded-2xl bg-[#faf8f5] border border-[#e7e3da]">
              <span className="text-[11px] text-emerald-700 font-medium block">재건축</span>
              <span className="text-xl font-black text-emerald-700">{stats.rcon}개소</span>
            </div>
          </div>
        </div>
      </section>

      {/* 2. 상단 광고 배너 슬롯 */}
      <section aria-label="스폰서 광고">
        <AdSenseBanner format="horizontal" slotId="districts-hub-top" />
      </section>

      {/* 3. 검색 및 필터 컨트롤 바 */}
      <section className="p-5 sm:p-6 rounded-3xl bg-white border border-[#e7e3da] shadow-sm space-y-5">
        {/* 상단: 검색창 & 정렬 */}
        <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
              placeholder="구역명, 자치구, 법정동, 지번으로 검색 (예: 한남, 성수, 상계, 신림)"
              className="w-full pl-10 pr-9 py-2.5 rounded-2xl bg-[#faf8f5] border border-[#e7e3da] text-stone-900 placeholder-stone-400 text-sm focus:outline-hidden focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:bg-white transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => handleSearchChange("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-700 cursor-pointer"
                title="검색어 지우기"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <span className="text-xs text-stone-500">정렬:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="py-2.5 px-3 rounded-xl bg-[#faf8f5] border border-[#e7e3da] text-xs font-semibold text-stone-800 focus:outline-hidden focus:border-blue-500 cursor-pointer"
            >
              <option value="LATEST">최신 고시순</option>
              <option value="HOUSEHOLDS">계획 세대수 많은 순</option>
              <option value="PROGRESS">추진 속도 빠른 순</option>
            </select>
          </div>
        </div>

        {/* 사업 유형 탭 */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 border-b border-[#e7e3da] scrollbar-none">
          {BIZ_TABS.map((tab) => {
            const count =
              tab.id === "ALL"
                ? stats.total
                : tab.id === "SINTHONG"
                ? stats.sinthong
                : tab.id === "MOA"
                ? stats.moa
                : tab.id === "REDEVELOPMENT"
                ? stats.rdev
                : stats.rcon;

            const isActive = selectedBizType === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => handleBizTypeChange(tab.id)}
                className={cn(
                  "flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer",
                  isActive
                    ? "bg-blue-600 text-white shadow-xs"
                    : "bg-[#eeeae2] text-stone-700 hover:bg-[#e4dfd5] border border-[#e0dad0]"
                )}
              >
                <span>{tab.label}</span>
                <span
                  className={cn(
                    "text-[10px] px-1.5 py-0.2 rounded-full",
                    isActive ? "bg-white/25 text-white" : "bg-white text-stone-600"
                  )}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* 25개 자치구 카테고리 칩 필터 */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs text-stone-500">
            <span className="font-semibold flex items-center gap-1">
              <Filter className="w-3.5 h-3.5 text-blue-600" />
              자치구 선택 (25개 구):
            </span>
            {(selectedGu !== "전체" || selectedBizType !== "ALL" || searchQuery) && (
              <button
                onClick={handleReset}
                className="text-blue-600 hover:underline cursor-pointer text-xs font-semibold"
              >
                필터 초기화
              </button>
            )}
          </div>
          <div className="flex flex-wrap gap-1.5">
            {SEOUL_GUS.map((gu) => {
              const isSelected = selectedGu === gu;
              return (
                <button
                  key={gu}
                  onClick={() => handleGuChange(gu)}
                  className={cn(
                    "px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer",
                    isSelected
                      ? "bg-blue-600 text-white font-bold shadow-xs"
                      : "bg-[#eeeae2] text-stone-700 hover:bg-[#e4dfd5] border border-[#e0dad0]"
                  )}
                >
                  {gu}
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* 4. 검색 결과 안내 헤더 */}
      <div className="flex flex-wrap items-center justify-between gap-2 px-1">
        <div className="flex items-center gap-2">
          <span className="text-sm font-bold text-stone-700">
            검색 결과 <span className="text-blue-600 font-extrabold">{filteredDistricts.length}</span>개 구역
            {selectedGu !== "전체" && <span className="text-stone-500 text-xs ml-1">({selectedGu})</span>}
          </span>
          {selectedGu !== "전체" && (
            <Link
              href={`/districts/gu/${selectedGu}/`}
              className="text-xs text-blue-600 hover:underline font-bold flex items-center gap-0.5 cursor-pointer"
            >
              <span>📑 {selectedGu} 종합 리포트 →</span>
            </Link>
          )}
        </div>
        <span className="text-xs text-stone-500 font-medium">
          페이지 {currentPage} / {totalPages}
        </span>
      </div>

      {/* 5. 구역 리스트 카드 그리드 */}
      {paginatedDistricts.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {paginatedDistricts.map((feature) => {
            const p = feature.properties;
            const targetUrl = `/districts/${p.master_uid}/`;

            return (
              <div
                key={p.master_uid}
                className="group p-5 rounded-2xl bg-white border border-[#e7e3da] hover:border-blue-500/60 transition-all hover:shadow-md flex flex-col justify-between"
              >
                <div>
                  {/* 상단 뱃지 라인 */}
                  <div className="flex items-center justify-between gap-1 mb-2.5">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200">
                        {p.gu}
                      </span>
                      <span className="text-[11px] font-medium px-2 py-0.5 rounded bg-[#eeeae2] text-stone-700 border border-[#e0dad0]">
                        {p.biz_type_label || p.biz_type}
                      </span>
                    </div>
                    <StageBadge stageCode={p.stage_code} className="text-[11px] py-0.5 px-2" />
                  </div>

                  {/* 구역명 & 주소 */}
                  <h2 className="text-base font-extrabold text-stone-900 group-hover:text-blue-600 transition-colors line-clamp-1">
                    {p.name}
                  </h2>
                  <div className="flex items-center gap-1 text-xs text-stone-500 mt-1 mb-3">
                    <MapPin className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                    <span className="truncate">{p.legal_dong} {p.address_jibun}</span>
                  </div>

                  {/* 주요 지표 표기 */}
                  <div className="grid grid-cols-3 gap-1.5 p-2.5 rounded-xl bg-[#faf8f5] border border-[#e7e3da] text-center mb-4">
                    <div>
                      <span className="text-[10px] text-stone-500 block">계획 세대수</span>
                      <span className="text-xs font-bold text-stone-900">
                        {p.total_households ? `${p.total_households.toLocaleString()}세대` : "미정"}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-stone-500 block">지위양도</span>
                      <span
                        className={cn(
                          "text-xs font-bold flex items-center justify-center gap-0.5",
                          p.is_transferable ? "text-emerald-700 font-extrabold" : "text-amber-700 font-extrabold"
                        )}
                      >
                        {p.is_transferable ? "승계가능" : "양도제한"}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-stone-500 block">최근 고시</span>
                      <span className="text-xs font-bold text-stone-700 truncate">
                        {p.approval_date ? p.approval_date.slice(0, 10) : "-"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* 하단 액션 버튼 */}
                <div className="flex items-center gap-2 pt-2 border-t border-[#e7e3da]">
                  <Link
                    href={targetUrl}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-xs transition-all cursor-pointer"
                  >
                    <FileText className="w-3.5 h-3.5" />
                    <span>상세 리포트 보기</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                  </Link>
                  <Link
                    href={`/?id=${p.master_uid}`}
                    className="py-2 px-3 rounded-xl bg-[#eeeae2] hover:bg-[#e4dfd5] text-stone-700 hover:text-stone-900 font-semibold text-xs border border-[#e0dad0] transition-all cursor-pointer flex items-center gap-1"
                    title="지도에서 구역 위치 확인"
                  >
                    <Map className="w-3.5 h-3.5 text-blue-600" />
                    <span>지도</span>
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="p-16 rounded-3xl bg-white border border-[#e7e3da] text-center space-y-3 shadow-xs">
          <Building2 className="w-10 h-10 text-stone-400 mx-auto" />
          <h3 className="text-base font-bold text-stone-900">일치하는 정비구역을 찾을 수 없습니다.</h3>
          <p className="text-xs text-stone-500 max-w-sm mx-auto">
            검색어 오타가 없는지 확인하거나 자치구 및 사업유형 필터를 '전체'로 변경해 보세요.
          </p>
          <button
            onClick={handleReset}
            className="mt-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-all cursor-pointer"
          >
            필터 초기화
          </button>
        </div>
      )}

      {/* 6. 페이지네이션 컨트롤 */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-1.5 pt-4 pb-8">
          <button
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="p-2 rounded-xl bg-white border border-[#e7e3da] text-stone-600 hover:text-stone-900 hover:bg-[#eeeae2] disabled:opacity-40 disabled:pointer-events-none cursor-pointer shadow-2xs"
            aria-label="이전 페이지"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          {Array.from({ length: totalPages }, (_, i) => i + 1)
            .filter((p) => p === 1 || p === totalPages || Math.abs(p - currentPage) <= 2)
            .map((page, idx, arr) => {
              const prev = arr[idx - 1];
              const isEllipsis = prev && page - prev > 1;

              return (
                <div key={page} className="flex items-center">
                  {isEllipsis && <span className="px-2 text-xs text-stone-400">...</span>}
                  <button
                    onClick={() => setCurrentPage(page)}
                    className={cn(
                      "w-8 h-8 rounded-xl text-xs font-bold transition-all cursor-pointer",
                      currentPage === page
                        ? "bg-blue-600 text-white shadow-xs"
                        : "bg-white border border-[#e7e3da] text-stone-700 hover:bg-[#eeeae2]"
                    )}
                  >
                    {page}
                  </button>
                </div>
              );
            })}

          <button
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="p-2 rounded-xl bg-white border border-[#e7e3da] text-stone-600 hover:text-stone-900 hover:bg-[#eeeae2] disabled:opacity-40 disabled:pointer-events-none cursor-pointer shadow-2xs"
            aria-label="다음 페이지"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}
