"use client";

import { useMemo } from "react";
import { STAGES } from "@/lib/constants/stages";
import { Clock, Zap, CheckCircle2, ChevronRight, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface ProjectedTimelineWidgetProps {
  stageCode: string;
  stageSeq: number;
  bizType: string;
  approvalDate?: string;
}

// 표준 정비사업 핵심 마일스톤 단계 정의
const MILESTONES = [
  { code: "DESIGNATED", seq: 2, label: "구역지정", avgYears: 1.5 },
  { code: "UNION_AUTH", seq: 4, label: "조합설립", avgYears: 2.0 },
  { code: "BIZ_PLAN", seq: 5, label: "사업시행", avgYears: 2.5 },
  { code: "MGMT_DISP", seq: 6, label: "관리처분", avgYears: 2.0 },
  { code: "CONSTRUCTION", seq: 7, label: "착공/이주", avgYears: 1.5 },
  { code: "COMPLETED", seq: 8, label: "준공/입주", avgYears: 3.0 },
];

export function ProjectedTimelineWidget({
  stageCode,
  stageSeq,
  bizType,
  approvalDate,
}: ProjectedTimelineWidgetProps) {
  const isSinthong = bizType === "SINTHONG";
  const currentYear = 2026;

  // 남은 예상 소요 기간 계산
  const { remainingYears, projectedCompletionYear, progressPercent } = useMemo(() => {
    let remaining = 0;

    MILESTONES.forEach((m) => {
      if (m.seq > stageSeq) {
        // 신속통합기획은 정비구역 지정 및 건축/교통 통합심의로 단계별 약 20~30% 단축
        const stageDuration = isSinthong ? m.avgYears * 0.75 : m.avgYears;
        remaining += stageDuration;
      }
    });

    // 최소 0.5년 보정
    const roundedRemaining = Math.max(0.5, +remaining.toFixed(1));
    const completionYear = Math.round(currentYear + roundedRemaining);
    const progress = Math.min(100, Math.max(15, Math.round((stageSeq / 8) * 100)));

    return {
      remainingYears: roundedRemaining,
      projectedCompletionYear: completionYear,
      progressPercent: progress,
    };
  }, [stageSeq, isSinthong]);

  return (
    <div className="p-4 rounded-2xl bg-gradient-to-br from-slate-900 via-slate-850 to-slate-900 text-white border border-slate-750 shadow-xl space-y-3.5">
      {/* 1. 상단 타이틀 & 속도계 요약 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-blue-500/20 text-blue-400 border border-blue-500/30">
            <Clock className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-slate-100 flex items-center gap-1.5">
              <span>예상 타임라인 & 속도계</span>
              {isSinthong && (
                <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40 flex items-center gap-0.5">
                  <Zap className="w-2.5 h-2.5" />
                  신통 패스트트랙
                </span>
              )}
            </h3>
            <p className="text-[10px] text-slate-400">서울시 정비사업 평균 통계 기준 분석</p>
          </div>
        </div>

        {/* 입주 목표 연도 하이라이트 */}
        <div className="text-right">
          <span className="text-[10px] text-slate-400 block">목표 입주</span>
          <span className="text-sm font-extrabold text-blue-400 tracking-tight">
            {stageSeq >= 8 ? "입주 완료" : `${projectedCompletionYear}년`}
          </span>
        </div>
      </div>

      {/* 2. 진행률 게이지 바 (Progress Bar) */}
      <div className="space-y-1">
        <div className="flex justify-between text-[11px] font-medium text-slate-300">
          <span>사업 진척도</span>
          <span className="font-bold text-blue-400">{progressPercent}% 진행</span>
        </div>
        <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden p-0.5 border border-slate-700/60">
          <div
            className="h-full rounded-full bg-gradient-to-r from-blue-500 to-indigo-400 transition-all duration-700 shadow-sm shadow-blue-500/50"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* 3. 단계별 타임라인 스텝 인디케이터 */}
      <div className="grid grid-cols-6 gap-1 pt-1 text-center">
        {MILESTONES.map((m) => {
          const isPassed = stageSeq > m.seq;
          const isCurrent = stageSeq === m.seq;
          const isUpcoming = stageSeq < m.seq;

          return (
            <div key={m.code} className="flex flex-col items-center">
              <div
                className={cn(
                  "w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold border transition-all mb-1",
                  isPassed && "bg-blue-600 border-blue-500 text-white",
                  isCurrent &&
                    "bg-amber-500 border-white text-white ring-2 ring-amber-400/50 scale-110 animate-pulse",
                  isUpcoming && "bg-slate-800/80 border-slate-700 text-slate-500"
                )}
              >
                {isPassed ? <CheckCircle2 className="w-3.5 h-3.5" /> : m.seq}
              </div>
              <span
                className={cn(
                  "text-[9px] font-medium truncate w-full",
                  isCurrent ? "text-amber-300 font-bold" : isPassed ? "text-slate-200" : "text-slate-500"
                )}
              >
                {m.label}
              </span>
            </div>
          );
        })}
      </div>

      {/* 4. 예상 잔여 기간 브리핑 안내 */}
      <div className="p-2.5 rounded-xl bg-slate-800/60 border border-slate-700/60 flex items-center justify-between text-[11px] text-slate-300">
        <div className="flex items-center gap-1.5">
          <AlertCircle className="w-3.5 h-3.5 text-blue-400 shrink-0" />
          <span>
            {stageSeq >= 8 ? (
              "사업이 완료되어 신축 아파트에 입주했습니다."
            ) : (
              <>
                준공까지 예상 잔여 기간은 약{" "}
                <strong className="text-white font-bold">{remainingYears}년</strong> 입니다.
              </>
            )}
          </span>
        </div>
        {isSinthong && stageSeq < 8 && (
          <span className="text-[10px] text-amber-300/90 font-medium shrink-0">
            약 2.5년 단축효과
          </span>
        )}
      </div>
    </div>
  );
}
