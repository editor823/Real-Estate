"use client";

import { useState } from "react";
import { ShieldCheck, ShieldAlert, AlertTriangle, CheckSquare, Square, Info } from "lucide-react";
import { cn } from "@/lib/utils";

interface SafetyDiagnosisWidgetProps {
  bizType: string;
  stageSeq: number;
  stageCode: string;
  isTransferable: boolean;
  transferExemption?: string | null;
  approvalDate?: string;
}

export function SafetyDiagnosisWidget({
  bizType,
  stageSeq,
  stageCode,
  isTransferable,
  transferExemption,
  approvalDate,
}: SafetyDiagnosisWidgetProps) {
  // 3대 입주권 안전 자가진단 체크리스트 상태
  const [checkedItems, setCheckedItems] = useState<{ [key: string]: boolean }>({
    baseDate: true,    // 1. 준공일이 권리산정기준일 이전인지
    singleUnit: true,  // 2. 단독 입주권(면적/가구) 요건 충족
    ownerStatus: false, // 3. 매도인의 10년 보유/5년 거주 요건
  });

  const toggleCheck = (key: string) => {
    setCheckedItems((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const checkedCount = Object.values(checkedItems).filter(Boolean).length;

  // 지위양도 법적 안전성 단계별 판정
  const getTransferStatus = () => {
    const isReconstruction = bizType === "RECONSTRUCTION";

    // 재건축은 조합설립(seq 4) 이후 금지, 재개발은 관리처분(seq 6) 이후 금지
    const thresholdSeq = isReconstruction ? 4 : 6;

    if (stageSeq < thresholdSeq) {
      return {
        level: "SAFE",
        label: "전매 안전 (지위양도 가능)",
        badgeClass: "bg-emerald-50 text-emerald-700 border-emerald-200",
        description: `${isReconstruction ? "조합설립인가" : "관리처분계획인가"} 이전 단계로 자유로운 조합원 입주권 승계가 가능합니다.`,
      };
    } else if (isTransferable || transferExemption) {
      return {
        level: "WARNING",
        label: "조건부 전매 허용 (예외 조항)",
        badgeClass: "bg-amber-50 text-amber-700 border-amber-200",
        description:
          transferExemption ||
          "사업 3년 지연 또는 1세대 1주택(10년 보유·5년 거주) 요건 충족 시 예외 승계 가능.",
      };
    } else {
      return {
        level: "DANGER",
        label: "전매 원칙 금지 (현금청산 위험)",
        badgeClass: "bg-rose-50 text-rose-700 border-rose-200",
        description:
          "투기과열지구 규제 단계로 일반 매수 시 입주권이 박탈되고 현금청산될 수 있습니다.",
      };
    }
  };

  const transferStatus = getTransferStatus();

  return (
    <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 shadow-sm space-y-3.5 text-slate-100">
      {/* 1. 상단 타이틀 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <ShieldAlert className="w-4 h-4 text-emerald-400" />
          <h3 className="text-xs font-bold text-white">입주권 안전 진단 카드</h3>
        </div>
        <span className="text-[10px] text-slate-400">도시정비법 규제 기준</span>
      </div>

      {/* 2. 지위양도(전매) 법적 규제 판정 배너 */}
      <div
        className={cn(
          "p-3 rounded-xl border text-xs space-y-1.5 transition-all",
          transferStatus.level === "SAFE" && "bg-emerald-950/50 border-emerald-800/80 text-emerald-300",
          transferStatus.level === "WARNING" && "bg-amber-950/50 border-amber-800/80 text-amber-300",
          transferStatus.level === "DANGER" && "bg-rose-950/50 border-rose-800/80 text-rose-300"
        )}
      >
        <div className="flex items-center justify-between">
          <span className="font-extrabold text-[12px] flex items-center gap-1">
            {transferStatus.level === "SAFE" && <ShieldCheck className="w-4 h-4 text-emerald-400" />}
            {transferStatus.level === "WARNING" && <AlertTriangle className="w-4 h-4 text-amber-400" />}
            {transferStatus.level === "DANGER" && <ShieldAlert className="w-4 h-4 text-rose-400" />}
            {transferStatus.label}
          </span>
          <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-900/90 font-bold border border-slate-700/60 shadow-2xs">
            {bizType === "RECONSTRUCTION" ? "재건축 기준" : "재개발 기준"}
          </span>
        </div>
        <p className="text-[11px] leading-relaxed opacity-90">{transferStatus.description}</p>
      </div>

      {/* 3. 권리산정기준일 기반 현금청산 3대 자가진단 체크리스트 */}
      <div className="space-y-2 pt-1">
        <div className="flex items-center justify-between text-[11px] font-bold text-slate-300">
          <span>현금청산(지분쪼개기) 자가 진단</span>
          <span
            className={cn(
              "px-2 py-0.5 rounded-full text-[10px] font-extrabold",
              checkedCount === 3
                ? "bg-emerald-950 text-emerald-300 border border-emerald-800"
                : checkedCount === 2
                ? "bg-amber-950 text-amber-300 border border-amber-800"
                : "bg-rose-950 text-rose-300 border border-rose-800"
            )}
          >
            {checkedCount === 3
              ? "🟢 100% 안전 매물"
              : checkedCount === 2
              ? "🟡 조건부 확인 필요"
              : "🔴 청산 위험 경고"}
          </span>
        </div>

        {/* 인터랙티브 체크 버튼 목록 */}
        <div className="space-y-1.5">
          {/* 체크 1: 권리산정기준일 */}
          <button
            type="button"
            onClick={() => toggleCheck("baseDate")}
            className="w-full flex items-start gap-2 p-2 rounded-xl text-left hover:bg-slate-900 border border-slate-800 transition-colors cursor-pointer bg-slate-900/60"
          >
            {checkedItems.baseDate ? (
              <CheckSquare className="w-4 h-4 text-emerald-400 mt-0.5 shrink-0" />
            ) : (
              <Square className="w-4 h-4 text-slate-500 mt-0.5 shrink-0" />
            )}
            <div>
              <p className="text-[11px] font-semibold text-slate-200">
                1. 신축 빌라 준공일이 권리산정기준일 이전인가요?
              </p>
              <p className="text-[10px] text-slate-400 mt-0.5">
                기준일 이후 신축 다세대는 입주권이 안 나오고 현금청산됩니다.
              </p>
            </div>
          </button>

          {/* 체크 2: 단독 입주권 요건 */}
          <button
            type="button"
            onClick={() => toggleCheck("singleUnit")}
            className="w-full flex items-start gap-2 p-2 rounded-xl text-left hover:bg-slate-900 border border-slate-800 transition-colors cursor-pointer bg-slate-900/60"
          >
            {checkedItems.singleUnit ? (
              <CheckSquare className="w-4 h-4 text-emerald-400 mt-0.5 shrink-0" />
            ) : (
              <Square className="w-4 h-4 text-slate-500 mt-0.5 shrink-0" />
            )}
            <div>
              <p className="text-[11px] font-semibold text-slate-200">
                2. 토지 면적(90㎡ 이상) 또는 단독 입주권 요건 충족
              </p>
              <p className="text-[10px] text-slate-400 mt-0.5">
                과소필지나 도로 지분 매입 시 단독 분양권이 안 나올 수 있습니다.
              </p>
            </div>
          </button>

          {/* 체크 3: 매도인 1주택 자격 */}
          <button
            type="button"
            onClick={() => toggleCheck("ownerStatus")}
            className="w-full flex items-start gap-2 p-2 rounded-xl text-left hover:bg-slate-900 border border-slate-800 transition-colors cursor-pointer bg-slate-900/60"
          >
            {checkedItems.ownerStatus ? (
              <CheckSquare className="w-4 h-4 text-emerald-400 mt-0.5 shrink-0" />
            ) : (
              <Square className="w-4 h-4 text-slate-500 mt-0.5 shrink-0" />
            )}
            <div>
              <p className="text-[11px] font-semibold text-slate-200">
                3. 매도인이 1세대 1주택(10년 보유·5년 거주) 요건 충족
              </p>
              <p className="text-[10px] text-slate-400 mt-0.5">
                조합설립 이후 재건축 구역은 매도인 자격 승계 여부가 핵심입니다.
              </p>
            </div>
          </button>
        </div>
      </div>
    </div>

  );
}
