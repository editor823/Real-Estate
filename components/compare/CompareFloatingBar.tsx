"use client";

import { useCompareStore } from "@/lib/store/useCompareStore";
import { ArrowLeftRight, X, Trash2, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

export function CompareFloatingBar() {
  const { compareList, removeFromCompare, clearCompare, setIsModalOpen } = useCompareStore();

  if (compareList.length === 0) return null;

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[800] flex items-center gap-3 px-4 py-3 rounded-2xl bg-slate-900/95 backdrop-blur-xl border border-slate-700/80 shadow-2xl text-white animate-in slide-in-from-bottom-5 duration-300">
      {/* 1. 아이콘 & 라벨 */}
      <div className="flex items-center gap-2 pr-2 border-r border-slate-700/80">
        <div className="w-8 h-8 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-md shadow-blue-500/40">
          <ArrowLeftRight className="w-4 h-4" />
        </div>
        <div>
          <span className="text-xs font-bold text-slate-100 flex items-center gap-1">
            <span>구역 비교함</span>
            <span className="px-1.5 py-0.2 rounded-full bg-blue-500/20 text-blue-300 text-[10px] font-extrabold border border-blue-400/30">
              {compareList.length}/3
            </span>
          </span>
          <p className="text-[10px] text-slate-400">최대 3개 나란히 비교</p>
        </div>
      </div>

      {/* 2. 담긴 구역 칩 목록 */}
      <div className="flex items-center gap-2 overflow-x-auto max-w-md py-0.5">
        {compareList.map((district) => (
          <div
            key={district.master_uid}
            className="flex items-center gap-1.5 pl-2.5 pr-1.5 py-1 rounded-xl bg-slate-800 border border-slate-700 text-xs font-semibold text-slate-200 shrink-0 shadow-2xs"
          >
            <span className="truncate max-w-[120px]">{district.name}</span>
            <button
              onClick={() => removeFromCompare(district.master_uid)}
              className="p-0.5 text-slate-400 hover:text-rose-400 rounded-lg transition-colors cursor-pointer"
              title="비교함에서 제거"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
      </div>

      {/* 3. 비교하기 버튼 & 전체 비우기 */}
      <div className="flex items-center gap-2 pl-2 border-l border-slate-700/80">
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-md shadow-blue-500/30 transition-all cursor-pointer hover:scale-105 active:scale-95"
        >
          <span>비교하기 ({compareList.length})</span>
        </button>

        <button
          onClick={clearCompare}
          className="p-2 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
          title="비교함 비우기"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
