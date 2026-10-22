"use client";

import { useState, useMemo } from "react";
import {
  Coins,
  Building2,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  HelpCircle,
  ArrowRight,
  Calculator,
  RefreshCw,
  Scale,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";

export function ContributionCalculator() {
  // 1. 입력 상태
  // 종전자산 감정평가액 (단위: 만원)
  const [appraisalPrice, setAppraisalPrice] = useState<number>(50000); // 기본 5억원
  // 비례율 (단위: %)
  const [proportionalRate, setProportionalRate] = useState<number>(103.5); // 기본 103.5%
  // 조합원 분양가 (단위: 만원)
  const [unionSalePrice, setUnionSalePrice] = useState<number>(85000); // 기본 8.5억원 (34평형 기준)
  // 평당 공사비 인상 시뮬레이션용 (단위: 만원/3.3㎡)
  const [constructionCostPerPyeong, setConstructionCostPerPyeong] = useState<number>(850); // 기본 850만원

  // 프리셋 평형 선택 (59㎡, 84㎡, 114㎡)
  const [selectedPyeong, setSelectedPyeong] = useState<string>("84");

  // 평형 프리셋 변경 핸들러
  const handlePyeongSelect = (pyeong: string, defaultPrice: number) => {
    setSelectedPyeong(pyeong);
    setUnionSalePrice(defaultPrice);
  };

  // 2. 계산 공식
  // 권리가액 = 종전자산 평가액 × 비례율
  const rightsPrice = useMemo(() => {
    return Math.round((appraisalPrice * (proportionalRate / 100)));
  }, [appraisalPrice, proportionalRate]);

  // 예상 추가분담금 = 조합원분양가 - 권리가액 (양수면 추가분담금, 음수면 환급금)
  const contribution = useMemo(() => {
    return unionSalePrice - rightsPrice;
  }, [unionSalePrice, rightsPrice]);

  // 공사비 변동에 따른 비례율 민감도 시뮬레이션
  // 기준 공사비(800만원) 대비 100만원 상승 시 일반적인 서울 재개발 구역에서 비례율 약 4~6% 하락 효과 반영
  const simulatedProportionalRate = useMemo(() => {
    const costDiff = (constructionCostPerPyeong - 800) / 100;
    const adjustedRate = Math.max(50, Math.min(150, proportionalRate - costDiff * 4.5));
    return Math.round(adjustedRate * 10) / 10;
  }, [constructionCostPerPyeong, proportionalRate]);

  const simulatedRightsPrice = useMemo(() => {
    return Math.round(appraisalPrice * (simulatedProportionalRate / 100));
  }, [appraisalPrice, simulatedProportionalRate]);

  const simulatedContribution = useMemo(() => {
    return unionSalePrice - simulatedRightsPrice;
  }, [unionSalePrice, simulatedRightsPrice]);

  // 분담금 납부 일정 추정 (계약금 10%, 중도금 60%, 잔금 30%)
  const paymentSchedule = useMemo(() => {
    if (contribution <= 0) return null;
    return {
      contract: Math.round(contribution * 0.1),
      midterm: Math.round(contribution * 0.6),
      final: Math.round(contribution * 0.3),
    };
  }, [contribution]);

  // 만원 단위를 억/만원 포맷으로 변환하는 도우미 함수
  const formatMoney = (val: number) => {
    const isNegative = val < 0;
    const absVal = Math.abs(val);
    const eok = Math.floor(absVal / 10000);
    const man = absVal % 10000;

    let res = "";
    if (eok > 0) res += `${eok}억 `;
    if (man > 0 || eok === 0) res += `${man.toLocaleString()}만원`;
    return (isNegative ? "-" : "") + res.trim();
  };

  return (
    <div className="space-y-6">
      {/* 안내 헤더 */}
      <div className="bg-gradient-to-r from-blue-900 to-indigo-900 text-white p-5 sm:p-6 rounded-3xl shadow-lg relative overflow-hidden">
        <div className="relative z-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 text-blue-200 text-xs font-bold mb-3 backdrop-blur-xs">
            <Coins className="w-3.5 h-3.5" />
            <span>재개발·재건축 핵심 공식 완벽 적용</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black tracking-tight">
            조합원 예상 분담금 &amp; 비례율 계산기
          </h2>
          <p className="text-sm text-blue-100 mt-1 max-w-2xl font-medium">
            내 소유 부동산의 감정평가액과 사업장의 비례율을 입력하면, 입주 시 실제로 내야 할 추가분담금(또는 돌려받을 환급금)을 1초 만에 계산해 드립니다.
          </p>
        </div>
        <div className="absolute -right-8 -bottom-10 opacity-10 pointer-events-none text-9xl">
          🏢
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* 좌측 입력 폼 (7 cols) */}
        <div className="lg:col-span-7 space-y-5">
          {/* 1. 종전자산 평가액 */}
          <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-sm font-extrabold text-gray-900 flex items-center gap-2">
                <Building2 className="w-4 h-4 text-blue-600" />
                <span>1. 내 부동산 감정평가액 (종전자산평가액)</span>
              </label>
              <span className="text-xs text-blue-600 font-bold bg-blue-50 px-2 py-0.5 rounded-lg border border-blue-200">
                {formatMoney(appraisalPrice)}
              </span>
            </div>
            <div className="relative">
              <input
                type="number"
                value={appraisalPrice}
                onChange={(e) => setAppraisalPrice(Math.max(0, Number(e.target.value)))}
                className="w-full text-base sm:text-lg font-black px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50 focus:bg-white"
                placeholder="예: 50000 (5억원)"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-bold text-gray-500">
                만원
              </span>
            </div>
            {/* 원클릭 프리셋 버튼 */}
            <div className="flex flex-wrap gap-1.5 pt-1">
              {[20000, 35000, 50000, 70000, 100000].map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => setAppraisalPrice(preset)}
                  className={cn(
                    "px-2.5 py-1 text-xs font-bold rounded-lg border transition-all cursor-pointer",
                    appraisalPrice === preset
                      ? "bg-blue-600 text-white border-blue-600 shadow-xs"
                      : "bg-gray-100 hover:bg-gray-200 text-gray-700 border-gray-200"
                  )}
                >
                  {formatMoney(preset)}
                </button>
              ))}
            </div>
          </div>

          {/* 2. 사업 비례율 */}
          <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-sm font-extrabold text-gray-900 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-indigo-600" />
                <span>2. 사업장 예상 비례율 (%)</span>
              </label>
              <span className={cn(
                "text-xs font-black px-2.5 py-1 rounded-lg border",
                proportionalRate >= 100
                  ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                  : "bg-amber-50 text-amber-700 border-amber-200"
              )}>
                {proportionalRate}% {proportionalRate >= 100 ? "(사업성 양호)" : "(사업성 주의)"}
              </span>
            </div>

            <div className="flex items-center gap-3">
              <input
                type="range"
                min="70"
                max="130"
                step="0.5"
                value={proportionalRate}
                onChange={(e) => setProportionalRate(Number(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
              />
              <div className="relative shrink-0 w-28">
                <input
                  type="number"
                  step="0.1"
                  value={proportionalRate}
                  onChange={(e) => setProportionalRate(Number(e.target.value))}
                  className="w-full text-sm font-black px-3 py-2 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-center"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-gray-500">
                  %
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs text-gray-500 font-medium">
              <span>70% (공사비 인상 악재)</span>
              <span>100% (손익 분기)</span>
              <span>130% (일반분양 대박)</span>
            </div>
          </div>

          {/* 3. 희망 조합원 분양가 & 평형 선택 */}
          <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-sm font-extrabold text-gray-900 flex items-center gap-2">
                <Scale className="w-4 h-4 text-emerald-600" />
                <span>3. 분양 신청할 희망 평형 및 조합원 분양가</span>
              </label>
              <span className="text-xs text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded-lg border border-emerald-200">
                {formatMoney(unionSalePrice)}
              </span>
            </div>

            {/* 평형 프리셋 탭 */}
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: "59", label: "25평형 (59㎡)", price: 65000, desc: "예: 6.5억" },
                { id: "84", label: "34평형 (84㎡)", price: 85000, desc: "예: 8.5억" },
                { id: "114", label: "45평형 (114㎡)", price: 120000, desc: "예: 12.0억" },
              ].map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handlePyeongSelect(item.id, item.price)}
                  className={cn(
                    "p-3 rounded-xl border text-center transition-all cursor-pointer",
                    selectedPyeong === item.id
                      ? "bg-blue-50 border-blue-600 text-blue-900 shadow-xs font-black ring-1 ring-blue-500"
                      : "bg-gray-50 hover:bg-gray-100 border-gray-200 text-gray-700 font-bold"
                  )}
                >
                  <div className="text-xs sm:text-sm">{item.label}</div>
                  <div className="text-[11px] text-gray-500 mt-0.5 font-medium">{item.desc}</div>
                </button>
              ))}
            </div>

            <div className="relative pt-1">
              <input
                type="number"
                value={unionSalePrice}
                onChange={(e) => {
                  setSelectedPyeong("custom");
                  setUnionSalePrice(Math.max(0, Number(e.target.value)));
                }}
                className="w-full text-base sm:text-lg font-black px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50 focus:bg-white"
                placeholder="조합원 분양가 직접 입력"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-bold text-gray-500">
                만원
              </span>
            </div>
          </div>
        </div>

        {/* 우측 산출 결과 카드 (5 cols) */}
        <div className="lg:col-span-5 space-y-5">
          {/* 메인 결과 진단창 */}
          <div className="bg-white p-6 rounded-3xl border-2 border-blue-600 shadow-xl space-y-5">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <span className="text-xs font-extrabold text-blue-600 tracking-wider uppercase">
                CALCULATION RESULT
              </span>
              <span className="inline-flex items-center gap-1 text-xs font-bold text-gray-500">
                <Calculator className="w-3.5 h-3.5 text-blue-600" />
                실시간 산출
              </span>
            </div>

            {/* 권리가액 산출 결과 */}
            <div className="p-4 rounded-2xl bg-gray-50 border border-gray-200 space-y-1.5">
              <div className="flex items-center justify-between text-xs text-gray-500 font-bold">
                <span>내 인정 권리가액 (평가액 × 비례율)</span>
                <span className="text-gray-700">{formatMoney(appraisalPrice)} × {proportionalRate}%</span>
              </div>
              <div className="text-xl sm:text-2xl font-black text-gray-900">
                {formatMoney(rightsPrice)}
              </div>
            </div>

            {/* 최종 분담금 / 환급금 판정 */}
            <div className={cn(
              "p-5 rounded-2xl border text-center space-y-2",
              contribution > 0
                ? "bg-rose-50/70 border-rose-300 text-rose-950"
                : contribution < 0
                ? "bg-emerald-50/70 border-emerald-300 text-emerald-950"
                : "bg-gray-50 border-gray-300 text-gray-900"
            )}>
              <span className={cn(
                "inline-block px-3 py-1 rounded-full text-xs font-extrabold mb-1",
                contribution > 0 ? "bg-rose-600 text-white" : "bg-emerald-600 text-white"
              )}>
                {contribution > 0 ? "추가 납부 필요 (분담금)" : contribution < 0 ? "돌려받는 돈 (환급금)" : "분담금 없음 (0원)"}
              </span>

              <div className="text-3xl sm:text-4xl font-black tracking-tight">
                {contribution > 0 ? `+${formatMoney(contribution)}` : contribution < 0 ? formatMoney(contribution) : "0원"}
              </div>

              <p className="text-xs leading-relaxed font-semibold opacity-85">
                {contribution > 0
                  ? `조합원 분양가(${formatMoney(unionSalePrice)})에서 권리가액(${formatMoney(rightsPrice)})을 차감한 금액을 입주 시까지 나누어 납부해야 합니다.`
                  : contribution < 0
                  ? `내 권리가액(${formatMoney(rightsPrice)})이 분양가보다 높아 차액 ${formatMoney(Math.abs(contribution))}을 조합으로부터 정산 환급받습니다.`
                  : "권리가액과 희망 분양가가 정확히 일치하여 추가 납부나 환급이 발생하지 않습니다."}
              </p>
            </div>

            {/* 분담금 분할 납부 시뮬레이션 */}
            {paymentSchedule && (
              <div className="space-y-2 pt-2 border-t border-gray-100">
                <span className="text-xs font-extrabold text-gray-700 block">
                  💳 분담금 통상 납부 스케줄 (가이드)
                </span>
                <div className="grid grid-cols-3 gap-2 text-center text-xs">
                  <div className="p-2.5 rounded-xl bg-gray-50 border border-gray-200">
                    <span className="text-gray-500 block text-[11px]">계약금 (10%)</span>
                    <strong className="text-gray-900 font-extrabold">{formatMoney(paymentSchedule.contract)}</strong>
                  </div>
                  <div className="p-2.5 rounded-xl bg-gray-50 border border-gray-200">
                    <span className="text-gray-500 block text-[11px]">중도금 (60%)</span>
                    <strong className="text-blue-600 font-extrabold">{formatMoney(paymentSchedule.midterm)}</strong>
                  </div>
                  <div className="p-2.5 rounded-xl bg-gray-50 border border-gray-200">
                    <span className="text-gray-500 block text-[11px]">입주잔금 (30%)</span>
                    <strong className="text-gray-900 font-extrabold">{formatMoney(paymentSchedule.final)}</strong>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* 공사비 인상 시뮬레이터 미니 위젯 */}
          <div className="bg-gradient-to-br from-amber-50 to-orange-50 p-5 rounded-3xl border border-amber-200 space-y-3">
            <div className="flex items-center gap-2 text-amber-900 font-extrabold text-sm">
              <AlertTriangle className="w-4 h-4 text-amber-600" />
              <span>최근 공사비 급등 민감도 시뮬레이터</span>
            </div>
            <p className="text-xs text-amber-800 leading-relaxed font-medium">
              시공사 도급 공사비가 인상되면 비례율이 하락하여 조합원 분담금이 크게 늘어납니다. 평당 공사비 변동에 따른 충격을 미리 점검하세요.
            </p>

            <div className="space-y-1.5 pt-1">
              <div className="flex justify-between text-xs font-bold text-amber-950">
                <span>3.3㎡당 평당 공사비</span>
                <span className="text-amber-800 font-black">{constructionCostPerPyeong}만원</span>
              </div>
              <input
                type="range"
                min="650"
                max="1200"
                step="25"
                value={constructionCostPerPyeong}
                onChange={(e) => setConstructionCostPerPyeong(Number(e.target.value))}
                className="w-full h-2 bg-amber-200 rounded-lg appearance-none cursor-pointer accent-amber-600"
              />
            </div>

            <div className="p-3 bg-white/80 rounded-xl border border-amber-200 text-xs space-y-1">
              <div className="flex justify-between">
                <span className="text-gray-600">예상 조정 비례율:</span>
                <strong className={cn("font-extrabold", simulatedProportionalRate < 100 ? "text-rose-600" : "text-emerald-600")}>
                  {simulatedProportionalRate}%
                </strong>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">공사비 반영 예상 분담금:</span>
                <strong className="text-gray-900 font-extrabold">
                  {simulatedContribution > 0 ? `+${formatMoney(simulatedContribution)}` : formatMoney(simulatedContribution)}
                </strong>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
