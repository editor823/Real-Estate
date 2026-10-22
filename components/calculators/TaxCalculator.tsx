"use client";

import { useState, useMemo } from "react";
import {
  Receipt,
  FileCheck,
  Building,
  HelpCircle,
  ShieldCheck,
  CheckCircle2,
  Percent,
  Sparkles,
  Info,
} from "lucide-react";
import { cn } from "@/lib/utils";

export function TaxCalculator() {
  // 모드: [ACQUISITION: 취득세] | [TRANSFER: 양도소득세]
  const [taxMode, setTaxMode] = useState<"ACQUISITION" | "TRANSFER">("ACQUISITION");

  // ==================== [A] 취득세 상태 ====================
  const [buyPrice, setBuyPrice] = useState<number>(80000); // 8억원
  const [houseCount, setHouseCount] = useState<number>(1); // 1주택, 2주택, 3주택, 4주택 이상
  const [isRegulatedArea, setIsRegulatedArea] = useState<boolean>(false); // 조정대상지역(강남3구/용산)
  const [isLargeArea, setIsLargeArea] = useState<boolean>(false); // 85㎡ 초과 여부
  const [isFirstHomeBuyer, setIsFirstHomeBuyer] = useState<boolean>(false); // 생애최초 주택구입 감면

  // ==================== [B] 양도소득세 상태 ====================
  const [sellPrice, setSellPrice] = useState<number>(140000); // 양도가 14억원
  const [purchasePrice, setPurchasePrice] = useState<number>(90000); // 취득가 9억원
  const [expenses, setExpenses] = useState<number>(3000); // 필요경비 3,000만원
  const [holdingYears, setHoldingYears] = useState<number>(5); // 보유 기간(년)
  const [residingYears, setResidingYears] = useState<number>(3); // 거주 기간(년)
  const [isSingleHome, setIsSingleHome] = useState<boolean>(true); // 1세대 1주택 여부

  // 금액 포맷터
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

  // ==================== [A] 취득세 계산 로직 ====================
  const acquisitionTaxResult = useMemo(() => {
    // 1. 기본 취득세율 산출 (%)
    let baseRate = 1.0;

    if (houseCount === 1) {
      // 1주택 (무주택자 취득)
      if (buyPrice <= 60000) {
        baseRate = 1.0;
      } else if (buyPrice <= 90000) {
        // 6억 초과 ~ 9억 이하 비례 공식: (취득가액(억원) × 2/3 - 3)%
        const priceInEok = buyPrice / 10000;
        baseRate = Math.round(((priceInEok * (2 / 3) - 3)) * 100) / 100;
      } else {
        baseRate = 3.0;
      }
    } else if (houseCount === 2) {
      // 2주택 취득
      if (isRegulatedArea) {
        baseRate = 8.0; // 조정대상지역 중과 8%
      } else {
        // 비조정지역 일반세율
        if (buyPrice <= 60000) baseRate = 1.0;
        else if (buyPrice <= 90000) {
          const priceInEok = buyPrice / 10000;
          baseRate = Math.round(((priceInEok * (2 / 3) - 3)) * 100) / 100;
        } else baseRate = 3.0;
      }
    } else if (houseCount === 3) {
      baseRate = isRegulatedArea ? 12.0 : 8.0;
    } else {
      // 4주택 이상
      baseRate = 12.0;
    }

    // 2. 본세 계산 (만원 단위)
    let baseTax = Math.round(buyPrice * (baseRate / 100));

    // 3. 지방교육세 계산
    let eduTaxRate = baseRate * 0.1;
    if (baseRate >= 8) eduTaxRate = 0.4;
    let eduTax = Math.round(buyPrice * (eduTaxRate / 100));

    // 4. 농어촌특별세 (85㎡ 초과 시 0.2%, 중과 시 0.6%~1.0%)
    let ruralTaxRate = 0;
    if (isLargeArea) {
      ruralTaxRate = baseRate >= 8 ? 0.6 : 0.2;
    }
    let ruralTax = Math.round(buyPrice * (ruralTaxRate / 100));

    // 5. 생애최초 주택구입 감면 (취득가 12억 이하 시 최대 200만원 감면)
    let discountAmount = 0;
    if (isFirstHomeBuyer && houseCount === 1 && buyPrice <= 120000) {
      discountAmount = Math.min(baseTax, 200);
      baseTax -= discountAmount;
    }

    const totalTax = baseTax + eduTax + ruralTax;
    const effectiveRate = Math.round((totalTax / buyPrice) * 1000) / 10;

    return {
      baseRate,
      baseTax,
      eduTax,
      ruralTax,
      discountAmount,
      totalTax,
      effectiveRate,
    };
  }, [buyPrice, houseCount, isRegulatedArea, isLargeArea, isFirstHomeBuyer]);

  // ==================== [B] 양도소득세 계산 로직 ====================
  const transferTaxResult = useMemo(() => {
    // 1. 총 양도차익
    const totalGain = Math.max(0, sellPrice - purchasePrice - expenses);

    if (totalGain <= 0) {
      return {
        totalGain: 0,
        taxableGain: 0,
        deductionRate: 0,
        specialDeduction: 0,
        taxBase: 0,
        taxRate: 0,
        calculatedTax: 0,
        localTax: 0,
        totalTax: 0,
        isExempt: true,
      };
    }

    // 2. 1세대 1주택 비과세 (12억 초과분 과세)
    let taxableGain = totalGain;
    let isExempt = false;

    if (isSingleHome && holdingYears >= 2) {
      if (sellPrice <= 120000) {
        // 12억 이하는 전액 비과세!
        return {
          totalGain,
          taxableGain: 0,
          deductionRate: 0,
          specialDeduction: 0,
          taxBase: 0,
          taxRate: 0,
          calculatedTax: 0,
          localTax: 0,
          totalTax: 0,
          isExempt: true,
        };
      } else {
        // 12억 초과분만 안분 과세: 양도차익 × (양도가액 - 12억) / 양도가액
        taxableGain = Math.round(totalGain * ((sellPrice - 120000) / sellPrice));
      }
    }

    // 3. 장기보유특별공제율 산출
    let deductionRate = 0;
    if (isSingleHome && holdingYears >= 3) {
      // 1세대 1주택 장특공: 보유(연 4%, max 40%) + 거주(연 4%, max 40%) = 최대 80%
      const holdRate = Math.min(40, holdingYears * 4);
      const resideRate = Math.min(40, residingYears * 4);
      deductionRate = holdRate + resideRate;
    } else if (holdingYears >= 3) {
      // 일반 장특공: 보유기간별 연 2% (3년 6% ~ 15년 이상 30%)
      deductionRate = Math.min(30, holdingYears * 2);
    }

    const specialDeduction = Math.round(taxableGain * (deductionRate / 100));
    // 양도소득금액
    const incomeAmount = taxableGain - specialDeduction;
    // 과세표준 (기본공제 연 250만원)
    const taxBase = Math.max(0, incomeAmount - 250);

    // 4. 누진세율표 적용 (2026년 기준)
    let taxRate = 6;
    let progressiveDeduction = 0;

    if (taxBase <= 1400) {
      taxRate = 6;
      progressiveDeduction = 0;
    } else if (taxBase <= 5000) {
      taxRate = 15;
      progressiveDeduction = 126;
    } else if (taxBase <= 8800) {
      taxRate = 24;
      progressiveDeduction = 576;
    } else if (taxBase <= 15000) {
      taxRate = 35;
      progressiveDeduction = 1544;
    } else if (taxBase <= 30000) {
      taxRate = 38;
      progressiveDeduction = 1994;
    } else if (taxBase <= 50000) {
      taxRate = 40;
      progressiveDeduction = 2594;
    } else if (taxBase <= 100000) {
      taxRate = 42;
      progressiveDeduction = 3594;
    } else {
      taxRate = 45;
      progressiveDeduction = 6594;
    }

    const calculatedTax = Math.max(0, Math.round(taxBase * (taxRate / 100) - progressiveDeduction));
    const localTax = Math.round(calculatedTax * 0.1);
    const totalTax = calculatedTax + localTax;

    return {
      totalGain,
      taxableGain,
      deductionRate,
      specialDeduction,
      taxBase,
      taxRate,
      calculatedTax,
      localTax,
      totalTax,
      isExempt,
    };
  }, [sellPrice, purchasePrice, expenses, holdingYears, residingYears, isSingleHome]);

  return (
    <div className="space-y-6">
      {/* 계산기 모드 전환 탭 */}
      <div className="flex items-center p-1.5 rounded-2xl bg-gray-100 border border-gray-200">
        <button
          type="button"
          onClick={() => setTaxMode("ACQUISITION")}
          className={cn(
            "flex-1 py-3 px-4 rounded-xl text-sm font-extrabold transition-all cursor-pointer flex items-center justify-center gap-2",
            taxMode === "ACQUISITION"
              ? "bg-white text-blue-600 shadow-sm"
              : "text-gray-600 hover:text-gray-900"
          )}
        >
          <Receipt className="w-4 h-4 text-blue-600" />
          <span>부동산 취득세 시뮬레이터</span>
        </button>
        <button
          type="button"
          onClick={() => setTaxMode("TRANSFER")}
          className={cn(
            "flex-1 py-3 px-4 rounded-xl text-sm font-extrabold transition-all cursor-pointer flex items-center justify-center gap-2",
            taxMode === "TRANSFER"
              ? "bg-white text-blue-600 shadow-sm"
              : "text-gray-600 hover:text-gray-900"
          )}
        >
          <FileCheck className="w-4 h-4 text-indigo-600" />
          <span>양도소득세 (1세대 1주택 비과세)</span>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* 1. 취득세 시뮬레이터 폼 & 결과 */}
      {/* ========================================================================= */}
      {taxMode === "ACQUISITION" ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* 입력창 (7 cols) */}
          <div className="lg:col-span-7 space-y-5">
            {/* 매매 취득가액 */}
            <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-sm font-extrabold text-gray-900">
                  1. 주택 매매 취득가액 (분양가 또는 실거래가)
                </label>
                <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-lg border border-blue-200">
                  {formatMoney(buyPrice)}
                </span>
              </div>
              <div className="relative">
                <input
                  type="number"
                  value={buyPrice}
                  onChange={(e) => setBuyPrice(Math.max(0, Number(e.target.value)))}
                  className="w-full text-base sm:text-lg font-black px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50 focus:bg-white"
                  placeholder="예: 80000 (8억원)"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-bold text-gray-500">
                  만원
                </span>
              </div>
              <div className="flex flex-wrap gap-1.5 pt-1">
                {[50000, 70000, 90000, 120000, 150000].map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => setBuyPrice(preset)}
                    className={cn(
                      "px-2.5 py-1 text-xs font-bold rounded-lg border transition-all cursor-pointer",
                      buyPrice === preset
                        ? "bg-blue-600 text-white border-blue-600 shadow-xs"
                        : "bg-gray-100 hover:bg-gray-200 text-gray-700 border-gray-200"
                    )}
                  >
                    {formatMoney(preset)}
                  </button>
                ))}
              </div>
            </div>

            {/* 보유 주택수 선택 */}
            <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs space-y-3">
              <label className="text-sm font-extrabold text-gray-900 block">
                2. 취득 후 총 보유 주택 수
              </label>
              <div className="grid grid-cols-4 gap-2">
                {[
                  { count: 1, label: "1주택 (무주택)" },
                  { count: 2, label: "2주택 (1가구 2주택)" },
                  { count: 3, label: "3주택" },
                  { count: 4, label: "4주택 이상" },
                ].map((item) => (
                  <button
                    key={item.count}
                    type="button"
                    onClick={() => setHouseCount(item.count)}
                    className={cn(
                      "py-2.5 px-2 rounded-xl border text-center transition-all cursor-pointer text-xs font-bold",
                      houseCount === item.count
                        ? "bg-blue-600 text-white border-blue-600 shadow-xs font-extrabold"
                        : "bg-gray-50 hover:bg-gray-100 border-gray-200 text-gray-700"
                    )}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            {/* 세부 옵션: 조정지역, 전용면적, 생애최초 */}
            <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs space-y-3">
              <label className="text-sm font-extrabold text-gray-900 block">
                3. 감면 및 규제지역 옵션
              </label>

              <div className="space-y-2">
                <label className="flex items-center justify-between p-3 rounded-xl border border-gray-200 hover:bg-gray-50 cursor-pointer">
                  <div>
                    <span className="text-xs sm:text-sm font-bold text-gray-800">조정대상지역 주택 취득</span>
                    <p className="text-[11px] text-gray-500">강남구, 서초구, 송파구, 용산구 해당</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={isRegulatedArea}
                    onChange={(e) => setIsRegulatedArea(e.target.checked)}
                    className="w-5 h-5 accent-blue-600 rounded cursor-pointer"
                  />
                </label>

                <label className="flex items-center justify-between p-3 rounded-xl border border-gray-200 hover:bg-gray-50 cursor-pointer">
                  <div>
                    <span className="text-xs sm:text-sm font-bold text-gray-800">국민주택규모 초과 (85㎡ 초과)</span>
                    <p className="text-[11px] text-gray-500">대형 평형인 경우 농어촌특별세가 가산됩니다</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={isLargeArea}
                    onChange={(e) => setIsLargeArea(e.target.checked)}
                    className="w-5 h-5 accent-blue-600 rounded cursor-pointer"
                  />
                </label>

                <label className="flex items-center justify-between p-3 rounded-xl border border-gray-200 hover:bg-gray-50 cursor-pointer">
                  <div>
                    <span className="text-xs sm:text-sm font-bold text-emerald-800">🌱 생애최초 주택구입 감면 적용</span>
                    <p className="text-[11px] text-gray-500">12억 이하 1주택 취득 시 취득세 최대 200만원 면제</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={isFirstHomeBuyer}
                    onChange={(e) => setIsFirstHomeBuyer(e.target.checked)}
                    className="w-5 h-5 accent-emerald-600 rounded cursor-pointer"
                  />
                </label>
              </div>
            </div>
          </div>

          {/* 산출 결과 영수증 (5 cols) */}
          <div className="lg:col-span-5 space-y-4">
            <div className="bg-white p-6 rounded-3xl border-2 border-blue-600 shadow-xl space-y-5">
              <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                <span className="text-xs font-black text-blue-600 tracking-wider">
                  TAX ESTIMATION RECEIPT
                </span>
                <span className="text-xs font-bold text-gray-500">
                  유효세율: <strong className="text-blue-600 font-black">{acquisitionTaxResult.effectiveRate}%</strong>
                </span>
              </div>

              {/* 총 납부세액 하이라이트 */}
              <div className="p-5 rounded-2xl bg-blue-50/70 border border-blue-200 text-center space-y-1">
                <span className="text-xs font-extrabold text-blue-700">총 예상 납부 세액</span>
                <div className="text-3xl sm:text-4xl font-black text-blue-900 tracking-tight">
                  {formatMoney(acquisitionTaxResult.totalTax)}
                </div>
                {acquisitionTaxResult.discountAmount > 0 && (
                  <span className="inline-block px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-bold">
                    생애최초 200만원 감면 반영됨
                  </span>
                )}
              </div>

              {/* 세목별 상세 명세표 */}
              <div className="space-y-2.5 text-xs">
                <div className="flex justify-between py-1.5 border-b border-gray-100">
                  <span className="text-gray-500 font-medium">취득세 본세 ({acquisitionTaxResult.baseRate}%)</span>
                  <strong className="text-gray-900 font-bold">{formatMoney(acquisitionTaxResult.baseTax)}</strong>
                </div>
                <div className="flex justify-between py-1.5 border-b border-gray-100">
                  <span className="text-gray-500 font-medium">지방교육세</span>
                  <strong className="text-gray-900 font-bold">{formatMoney(acquisitionTaxResult.eduTax)}</strong>
                </div>
                <div className="flex justify-between py-1.5 border-b border-gray-100">
                  <span className="text-gray-500 font-medium">농어촌특별세</span>
                  <strong className="text-gray-900 font-bold">
                    {acquisitionTaxResult.ruralTax > 0 ? formatMoney(acquisitionTaxResult.ruralTax) : "비과세 (0원)"}
                  </strong>
                </div>
                {acquisitionTaxResult.discountAmount > 0 && (
                  <div className="flex justify-between py-1.5 text-emerald-700 font-bold border-b border-gray-100">
                    <span>생애최초 감면액</span>
                    <span>-{formatMoney(acquisitionTaxResult.discountAmount)}</span>
                  </div>
                )}
              </div>

              <div className="p-3 bg-gray-50 rounded-xl text-[11px] text-gray-500 space-y-1">
                <p>• 잔금 납부일 또는 등기접수일 중 빠른 날로부터 60일 이내에 관할 구청에 신고·납부해야 합니다.</p>
                <p>• 생애최초 감면 시 3개월 이내 전입 및 3년 실거주 요건을 충족해야 추징되지 않습니다.</p>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* ========================================================================= */
        /* 2. 양도소득세 시뮬레이터 폼 & 결과 */
        /* ========================================================================= */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-7 space-y-5">
            {/* 매도가 & 매수가 */}
            <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs space-y-3">
              <label className="text-sm font-extrabold text-gray-900 block">
                1. 양도(매도) 금액 및 취득(매수) 금액
              </label>

              <div className="space-y-3">
                <div>
                  <span className="text-xs text-gray-500 font-medium block mb-1">양도가액 (실제 매도가격)</span>
                  <div className="relative">
                    <input
                      type="number"
                      value={sellPrice}
                      onChange={(e) => setSellPrice(Math.max(0, Number(e.target.value)))}
                      className="w-full text-base font-black px-4 py-2.5 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-gray-500">
                      만원 ({formatMoney(sellPrice)})
                    </span>
                  </div>
                </div>

                <div>
                  <span className="text-xs text-gray-500 font-medium block mb-1">취득가액 (과거 매수가격)</span>
                  <div className="relative">
                    <input
                      type="number"
                      value={purchasePrice}
                      onChange={(e) => setPurchasePrice(Math.max(0, Number(e.target.value)))}
                      className="w-full text-base font-black px-4 py-2.5 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-gray-500">
                      만원 ({formatMoney(purchasePrice)})
                    </span>
                  </div>
                </div>

                <div>
                  <span className="text-xs text-gray-500 font-medium block mb-1">필요경비 (중개수수료, 샤시/발코니 확장비 등)</span>
                  <div className="relative">
                    <input
                      type="number"
                      value={expenses}
                      onChange={(e) => setExpenses(Math.max(0, Number(e.target.value)))}
                      className="w-full text-base font-black px-4 py-2.5 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-gray-500">
                      만원 ({formatMoney(expenses)})
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* 보유기간 및 주택구분 */}
            <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs space-y-3">
              <label className="text-sm font-extrabold text-gray-900 block">
                2. 주택 구분 및 보유·거주 기간
              </label>

              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setIsSingleHome(true)}
                  className={cn(
                    "py-2.5 px-3 rounded-xl border text-center transition-all cursor-pointer text-xs font-bold",
                    isSingleHome
                      ? "bg-indigo-600 text-white border-indigo-600 shadow-xs font-extrabold"
                      : "bg-gray-50 hover:bg-gray-100 border-gray-200 text-gray-700"
                  )}
                >
                  1세대 1주택 (12억 비과세)
                </button>
                <button
                  type="button"
                  onClick={() => setIsSingleHome(false)}
                  className={cn(
                    "py-2.5 px-3 rounded-xl border text-center transition-all cursor-pointer text-xs font-bold",
                    !isSingleHome
                      ? "bg-indigo-600 text-white border-indigo-600 shadow-xs font-extrabold"
                      : "bg-gray-50 hover:bg-gray-100 border-gray-200 text-gray-700"
                  )}
                >
                  다주택자 일반 과세
                </button>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-1">
                <div>
                  <span className="text-xs text-gray-500 font-bold block mb-1">보유 기간</span>
                  <select
                    value={holdingYears}
                    onChange={(e) => setHoldingYears(Number(e.target.value))}
                    className="w-full p-2.5 rounded-xl border border-gray-300 text-xs font-bold bg-gray-50"
                  >
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 15].map((yr) => (
                      <option key={yr} value={yr}>
                        {yr}년 이상
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <span className="text-xs text-gray-500 font-bold block mb-1">실제 거주 기간</span>
                  <select
                    value={residingYears}
                    onChange={(e) => setResidingYears(Number(e.target.value))}
                    className="w-full p-2.5 rounded-xl border border-gray-300 text-xs font-bold bg-gray-50"
                  >
                    {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((yr) => (
                      <option key={yr} value={yr}>
                        {yr === 0 ? "거주 안함 (0년)" : `${yr}년 이상 거주`}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* 우측 양도세 결과 카드 (5 cols) */}
          <div className="lg:col-span-5 space-y-4">
            <div className="bg-white p-6 rounded-3xl border-2 border-indigo-600 shadow-xl space-y-5">
              <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                <span className="text-xs font-black text-indigo-600 tracking-wider">
                  CAPITAL GAINS TAX
                </span>
                <span className="text-xs font-bold text-gray-500">
                  적용세율: <strong className="text-indigo-600 font-black">{transferTaxResult.taxRate}%</strong>
                </span>
              </div>

              {/* 총 납부세액 */}
              <div className={cn(
                "p-5 rounded-2xl border text-center space-y-1",
                transferTaxResult.isExempt
                  ? "bg-emerald-50 border-emerald-300 text-emerald-900"
                  : "bg-indigo-50/70 border-indigo-200 text-indigo-950"
              )}>
                <span className="text-xs font-extrabold text-indigo-700">
                  {transferTaxResult.isExempt ? "비과세 대상 (납부세액 없음)" : "총 예상 납부 세액 (지방소득세 포함)"}
                </span>
                <div className="text-3xl sm:text-4xl font-black tracking-tight">
                  {transferTaxResult.isExempt ? "0원" : formatMoney(transferTaxResult.totalTax)}
                </div>
                {transferTaxResult.isExempt && (
                  <p className="text-xs font-semibold text-emerald-700 mt-1">
                    1세대 1주택 2년 보유 &amp; 12억원 이하 매도로 전액 비과세됩니다.
                  </p>
                )}
              </div>

              {/* 세부 계산 내역 */}
              <div className="space-y-2 text-xs">
                <div className="flex justify-between py-1 border-b border-gray-100">
                  <span className="text-gray-500">총 양도차익</span>
                  <strong className="text-gray-900">{formatMoney(transferTaxResult.totalGain)}</strong>
                </div>
                <div className="flex justify-between py-1 border-b border-gray-100">
                  <span className="text-gray-500">과세 대상 양도차익 (12억 초과분)</span>
                  <strong className="text-gray-900">{formatMoney(transferTaxResult.taxableGain)}</strong>
                </div>
                <div className="flex justify-between py-1 border-b border-gray-100">
                  <span className="text-gray-500">장기보유특별공제 ({transferTaxResult.deductionRate}%)</span>
                  <strong className="text-emerald-600">-{formatMoney(transferTaxResult.specialDeduction)}</strong>
                </div>
                <div className="flex justify-between py-1 border-b border-gray-100">
                  <span className="text-gray-500">과세표준 (기본공제 250만 차감)</span>
                  <strong className="text-gray-900">{formatMoney(transferTaxResult.taxBase)}</strong>
                </div>
                <div className="flex justify-between py-1 border-b border-gray-100">
                  <span className="text-gray-500">산출세액 (국세)</span>
                  <strong className="text-gray-900">{formatMoney(transferTaxResult.calculatedTax)}</strong>
                </div>
                <div className="flex justify-between py-1 border-b border-gray-100">
                  <span className="text-gray-500">지방소득세 (10%)</span>
                  <strong className="text-gray-900">{formatMoney(transferTaxResult.localTax)}</strong>
                </div>
              </div>

              <div className="p-3 bg-gray-50 rounded-xl text-[11px] text-gray-500 space-y-1">
                <p>• 양도일이 속한 달의 말일부터 2개월 이내에 주소지 관할 세무서에 예정신고 및 납부해야 합니다.</p>
                <p>• 실제 세액은 공동명의 여부, 상속·증여 취득 시기 등에 따라 달라질 수 있으므로 세무 전문가 확인을 권장합니다.</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
