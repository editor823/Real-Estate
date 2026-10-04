"use client";

import { useFilterStore } from "@/lib/store/useFilterStore";
import { BIZ_TYPES } from "@/lib/constants/stages";
import { Search, RotateCcw, CheckCircle2, ShieldCheck, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

export function FloatingFilterBar() {
  const {
    searchQuery,
    bizType,
    isConsentFilterActive,
    transferableOnly,
    publicAdjacentOnly,
    setSearchQuery,
    setBizType,
    setIsConsentFilterActive,
    setTransferableOnly,
    setPublicAdjacentOnly,
    resetFilters,
  } = useFilterStore();

  return (
    <header className="absolute top-4 left-4 right-4 z-20 flex flex-wrap items-center gap-2.5 p-3 rounded-2xl bg-white/90 backdrop-blur-md border border-slate-200/80 shadow-lg shadow-slate-900/5 transition-all">
      {/* 1. 구역 검색 입력창 */}
      <div className="relative flex-1 min-w-[200px] max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input
          id="district-search-input"
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="구역명, 자치구 또는 법정동 검색..."
          className="w-full pl-9 pr-3 py-1.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all placeholder:text-slate-400"
        />
      </div>

      {/* 2. 사업 유형 선택 드롭다운 */}
      <div className="relative">
        <select
          id="biz-type-select"
          value={bizType}
          onChange={(e) => setBizType(e.target.value)}
          className="text-xs font-medium px-3 py-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-colors cursor-pointer text-slate-700"
        >
          {BIZ_TYPES.map((type) => (
            <option key={type.value} value={type.value}>
              {type.label}
            </option>
          ))}
        </select>
      </div>

      {/* 3. 동의율 70% 이상 필터 토글 */}
      <button
        id="consent-filter-btn"
        type="button"
        onClick={() => setIsConsentFilterActive(!isConsentFilterActive)}
        className={cn(
          "inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold border transition-all cursor-pointer",
          isConsentFilterActive
            ? "bg-blue-50 border-blue-300 text-blue-700 shadow-xs"
            : "bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-600"
        )}
      >
        <CheckCircle2 className={cn("w-3.5 h-3.5", isConsentFilterActive ? "text-blue-600" : "text-slate-400")} />
        동의율 ≥ 70%
      </button>

      {/* 4. 지위양도 가능 구역 필터 */}
      <button
        id="transferable-filter-btn"
        type="button"
        onClick={() => setTransferableOnly(!transferableOnly)}
        className={cn(
          "inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold border transition-all cursor-pointer",
          transferableOnly
            ? "bg-emerald-50 border-emerald-300 text-emerald-700 shadow-xs"
            : "bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-600"
        )}
      >
        <ShieldCheck className={cn("w-3.5 h-3.5", transferableOnly ? "text-emerald-600" : "text-slate-400")} />
        지위양도 가능
      </button>

      {/* 5. 공공개발 연계 호재 필터 */}
      <button
        id="public-adjacent-filter-btn"
        type="button"
        onClick={() => setPublicAdjacentOnly(!publicAdjacentOnly)}
        className={cn(
          "inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold border transition-all cursor-pointer",
          publicAdjacentOnly
            ? "bg-purple-50 border-purple-300 text-purple-700 shadow-xs"
            : "bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-600"
        )}
      >
        <Sparkles className={cn("w-3.5 h-3.5", publicAdjacentOnly ? "text-purple-600" : "text-slate-400")} />
        공공호재 인접
      </button>

      {/* 6. 필터 초기화 버튼 */}
      <button
        id="reset-filters-btn"
        type="button"
        onClick={resetFilters}
        title="필터 초기화"
        className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
      >
        <RotateCcw className="w-4 h-4" />
      </button>
    </header>
  );
}
