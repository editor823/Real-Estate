"use client";

import { useState, useMemo } from "react";
import {
  Landmark,
  ShieldAlert,
  Calendar,
  CheckCircle2,
  DollarSign,
  ChevronDown,
  Layers,
  Sparkles,
  PieChart,
} from "lucide-react";
import { cn } from "@/lib/utils";

export function LoanDsrCalculator() {
  // 1. 입력 상태
  // 주택 시세 (담보평가액, 단위: 만원)
  const [houseValue, setHouseValue] = useState<number>(100000); // 10억원
  // 연소득 (단위: 만원)
  const [annualIncome, setAnnualIncome] = useState<number>(8000); // 연봉 8,000만원
  // 기존 대출 연간 원리금 상환액 (단위: 만원)
  const [existingDebtPayment, setExistingDebtPayment] = useState<number>(0);
  // 대출 금리 (연 %)
  const [interestRate, setInterestRate] = useState<number>(4.1);
  // 대출 기간 (년)
  const [loanYears, setLoanYears] = useState<number>(30); // 30년
  // 상환 방식: 원리금균등(EQUAL_PAYMENT), 원금균등(EQUAL_PRINCIPAL), 만기일시(BULLET)
  const [repayType, setRepayType] = useState<"EQUAL_PAYMENT" | "EQUAL_PRINCIPAL" | "BULLET">("EQUAL_PAYMENT");
  // LTV 유형: 생애최초(80%), 무주택(70%), 1주택(60%), 규제지역(50%)
  const [ltvType, setLtvType] = useState<"FIRST_HOME" | "NO_HOME" | "ONE_HOME" | "REGULATED">("NO_HOME");
  // 스트레스 DSR 적용 단계: 2단계 수도권(+1.2%), 2단계 비수도권(+0.75%), 미적용(+0.0%)
  const [stressDsrRate, setStressDsrRate] = useState<number>(1.2);

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

  // 2. LTV 기준 대출 가능 한도
  const ltvRatio = useMemo(() => {
    switch (ltvType) {
      case "FIRST_HOME": return 80;
      case "NO_HOME": return 70;
      case "ONE_HOME": return 60;
      case "REGULATED": return 50;
      default: return 70;
    }
  }, [ltvType]);

  const ltvMaxLoan = useMemo(() => {
    let raw = Math.round(houseValue * (ltvRatio / 100));
    if (ltvType === "FIRST_HOME") {
      // 생애최초 대출한도 최대 6억원 캡
      raw = Math.min(raw, 60000);
    }
    return raw;
  }, [houseValue, ltvRatio, ltvType]);

  // 3. DSR (40%) 기준 대출 가능 한도
  const dsrMaxLoan = useMemo(() => {
    const maxAnnualDsrPayment = annualIncome * 0.4;
    const availableAnnualPayment = Math.max(0, maxAnnualDsrPayment - existingDebtPayment);

    // 심사용 가산 금리 (스트레스 DSR)
    const testRate = (interestRate + stressDsrRate) / 100 / 12;
    const totalMonths = loanYears * 12;

    if (testRate <= 0) return 0;

    // 원리금균등 상환 역산 공식: Principal = Payment * [(1+r)^n - 1] / [r * (1+r)^n]
    const monthlyAvailable = availableAnnualPayment / 12;
    const numerator = Math.pow(1 + testRate, totalMonths) - 1;
    const denominator = testRate * Math.pow(1 + testRate, totalMonths);
    const maxLoan = Math.round(monthlyAvailable * (numerator / denominator));

    return Math.max(0, maxLoan);
  }, [annualIncome, existingDebtPayment, interestRate, stressDsrRate, loanYears]);

  // 4. 최종 승인 가능 대출 한도 (LTV와 DSR 중 작은 금액)
  const finalLoanLimit = useMemo(() => {
    return Math.min(ltvMaxLoan, dsrMaxLoan);
  }, [ltvMaxLoan, dsrMaxLoan]);

  // 제한 주도 요소 판정
  const bottleneck = useMemo(() => {
    if (ltvMaxLoan < dsrMaxLoan) return "LTV (주택 담보가치 제한)";
    if (dsrMaxLoan < ltvMaxLoan) return "DSR (연소득 및 스트레스 DSR 규제 제한)";
    return "동일 수준";
  }, [ltvMaxLoan, dsrMaxLoan]);

  // 5. 월 상환액 및 이자 계산 (실제 대출 실행 금리 기준)
  const repaymentSchedule = useMemo(() => {
    const loanAmount = finalLoanLimit;
    const monthlyRate = interestRate / 100 / 12;
    const totalMonths = loanYears * 12;

    if (loanAmount <= 0) {
      return {
        firstMonthPayment: 0,
        monthlyPrincipal: 0,
        monthlyInterest: 0,
        totalInterest: 0,
        totalPayment: 0,
        dsrActualRate: 0,
      };
    }

    let firstMonthPayment = 0;
    let monthlyPrincipal = 0;
    let monthlyInterest = 0;
    let totalInterest = 0;

    if (repayType === "EQUAL_PAYMENT") {
      // 원리금균등상환
      const payment =
        (loanAmount * (monthlyRate * Math.pow(1 + monthlyRate, totalMonths))) /
        (Math.pow(1 + monthlyRate, totalMonths) - 1);
      firstMonthPayment = Math.round(payment);
      monthlyInterest = Math.round(loanAmount * monthlyRate);
      monthlyPrincipal = firstMonthPayment - monthlyInterest;
      totalInterest = Math.round(payment * totalMonths - loanAmount);
    } else if (repayType === "EQUAL_PRINCIPAL") {
      // 원금균등상환
      monthlyPrincipal = Math.round(loanAmount / totalMonths);
      monthlyInterest = Math.round(loanAmount * monthlyRate);
      firstMonthPayment = monthlyPrincipal + monthlyInterest;
      // 등차수열 총 이자 합계
      totalInterest = Math.round(loanAmount * monthlyRate * ((totalMonths + 1) / 2));
    } else {
      // 만기일시상환
      monthlyInterest = Math.round(loanAmount * monthlyRate);
      firstMonthPayment = monthlyInterest;
      monthlyPrincipal = 0;
      totalInterest = Math.round(monthlyInterest * totalMonths);
    }

    const annualActualPayment = firstMonthPayment * 12 + existingDebtPayment;
    const dsrActualRate = annualIncome > 0 ? Math.round((annualActualPayment / annualIncome) * 1000) / 10 : 0;

    return {
      firstMonthPayment,
      monthlyPrincipal,
      monthlyInterest,
      totalInterest,
      totalPayment: loanAmount + totalInterest,
      dsrActualRate,
    };
  }, [finalLoanLimit, interestRate, loanYears, repayType, existingDebtPayment, annualIncome]);

  return (
    <div className="space-y-6">
      {/* 안내 배너 */}
      <div className="bg-gradient-to-r from-slate-900 to-blue-950 text-white p-5 sm:p-6 rounded-3xl shadow-lg relative overflow-hidden">
        <div className="relative z-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 text-xs font-bold mb-3 border border-blue-400/30">
            <Landmark className="w-3.5 h-3.5" />
            <span>2026 스트레스 DSR 2단계 규제 공식 완벽 반영</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black tracking-tight">
            대출 한도(DSR / LTV) &amp; 월 상환액 계산기
          </h2>
          <p className="text-sm text-slate-300 mt-1 max-w-2xl font-medium">
            주택 가격과 연소득을 입력하면, 은행 창구에 가기 전 내가 최대로 빌릴 수 있는 주택담보대출 한도와 매달 나가는 원리금을 정확하게 시뮬레이션해 드립니다.
          </p>
        </div>
        <div className="absolute -right-8 -bottom-10 opacity-10 pointer-events-none text-9xl">
          🏦
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* 입력창 (7 cols) */}
        <div className="lg:col-span-7 space-y-5">
          {/* 1. 주택 시세 & 연소득 */}
          <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs space-y-4">
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs sm:text-sm font-extrabold text-gray-900">
                  1. 담보 주택 시세 (KB부동산 시세 또는 매매가)
                </label>
                <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-lg border border-blue-200">
                  {formatMoney(houseValue)}
                </span>
              </div>
              <div className="relative">
                <input
                  type="number"
                  value={houseValue}
                  onChange={(e) => setHouseValue(Math.max(0, Number(e.target.value)))}
                  className="w-full text-base font-black px-4 py-2.5 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-gray-500">
                  만원
                </span>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs sm:text-sm font-extrabold text-gray-900">
                  2. 연간 부부합산 소득 (세전)
                </label>
                <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-lg border border-indigo-200">
                  {formatMoney(annualIncome)}
                </span>
              </div>
              <div className="relative">
                <input
                  type="number"
                  value={annualIncome}
                  onChange={(e) => setAnnualIncome(Math.max(0, Number(e.target.value)))}
                  className="w-full text-base font-black px-4 py-2.5 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-gray-500">
                  만원
                </span>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs sm:text-sm font-extrabold text-gray-900">
                  3. 기존 대출 연간 원리금 상환액 (신용대출, 마이너스통장 등)
                </label>
                <span className="text-xs font-bold text-gray-500">
                  {existingDebtPayment > 0 ? formatMoney(existingDebtPayment) : "없음 (0원)"}
                </span>
              </div>
              <div className="relative">
                <input
                  type="number"
                  value={existingDebtPayment}
                  onChange={(e) => setExistingDebtPayment(Math.max(0, Number(e.target.value)))}
                  className="w-full text-base font-black px-4 py-2.5 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500"
                  placeholder="기존 대출이 없으면 0"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-gray-500">
                  만원 / 년
                </span>
              </div>
            </div>
          </div>

          {/* 2. 대출 조건 설정: LTV 조건, 기간, 금리, 스트레스 DSR */}
          <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs space-y-4">
            <div>
              <label className="text-xs sm:text-sm font-extrabold text-gray-900 block mb-2">
                4. 주택 보유 현황 및 LTV 규제
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {[
                  { id: "FIRST_HOME", label: "생애최초", ltv: "80%", cap: "최대 6억" },
                  { id: "NO_HOME", label: "무주택자", ltv: "70%", cap: "일반지역" },
                  { id: "ONE_HOME", label: "1주택자", ltv: "60%", cap: "처분조건" },
                  { id: "REGULATED", label: "투기과열지구", ltv: "50%", cap: "강남3/용산" },
                ].map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setLtvType(item.id as typeof ltvType)}
                    className={cn(
                      "p-2.5 rounded-xl border text-center transition-all cursor-pointer",
                      ltvType === item.id
                        ? "bg-blue-600 text-white border-blue-600 shadow-xs font-black"
                        : "bg-gray-50 hover:bg-gray-100 border-gray-200 text-gray-700 font-bold"
                    )}
                  >
                    <div className="text-xs">{item.label}</div>
                    <div className="text-[11px] opacity-80">{item.ltv} ({item.cap})</div>
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <span className="text-xs font-bold text-gray-700 block mb-1">대출 금리 (연 %)</span>
                <div className="relative">
                  <input
                    type="number"
                    step="0.05"
                    value={interestRate}
                    onChange={(e) => setInterestRate(Math.max(0.1, Number(e.target.value)))}
                    className="w-full text-sm font-black px-3 py-2 rounded-xl border border-gray-300"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-gray-500">%</span>
                </div>
              </div>

              <div>
                <span className="text-xs font-bold text-gray-700 block mb-1">대출 만기</span>
                <select
                  value={loanYears}
                  onChange={(e) => setLoanYears(Number(e.target.value))}
                  className="w-full text-xs font-bold p-2.5 rounded-xl border border-gray-300 bg-gray-50"
                >
                  <option value={20}>20년 만기</option>
                  <option value={30}>30년 만기 (가장 대중적)</option>
                  <option value={40}>40년 만기 (청년·신혼)</option>
                  <option value={50}>50년 만기</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <span className="text-xs font-bold text-gray-700 block mb-1">상환 방식</span>
                <select
                  value={repayType}
                  onChange={(e) => setRepayType(e.target.value as typeof repayType)}
                  className="w-full text-xs font-bold p-2.5 rounded-xl border border-gray-300 bg-gray-50"
                >
                  <option value="EQUAL_PAYMENT">원리금균등 (매달 동일 납부)</option>
                  <option value="EQUAL_PRINCIPAL">원금균등 (점점 줄어듦)</option>
                  <option value="BULLET">만기일시상환 (이자만 납부)</option>
                </select>
              </div>

              <div>
                <span className="text-xs font-bold text-gray-700 block mb-1">스트레스 DSR 규제 단계</span>
                <select
                  value={stressDsrRate}
                  onChange={(e) => setStressDsrRate(Number(e.target.value))}
                  className="w-full text-xs font-bold p-2.5 rounded-xl border border-gray-300 bg-gray-50"
                >
                  <option value={1.2}>2단계 수도권 (+1.2%)</option>
                  <option value={0.75}>2단계 비수도권 (+0.75%)</option>
                  <option value={0.0}>미적용 (0%)</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* 결과 카드 (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white p-6 rounded-3xl border-2 border-blue-600 shadow-xl space-y-5">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <span className="text-xs font-black text-blue-600 tracking-wider">
                LOAN LIMIT &amp; REPAYMENT
              </span>
              <span className="text-[11px] font-bold text-gray-500">
                실제 적용 DSR: <strong className="text-blue-600 font-black">{repaymentSchedule.dsrActualRate}%</strong> (한도 40%)
              </span>
            </div>

            {/* 최종 대출 가능 한도 */}
            <div className="p-5 rounded-2xl bg-blue-50/70 border border-blue-200 text-center space-y-1">
              <span className="text-xs font-extrabold text-blue-700">최대 대출 가능 한도</span>
              <div className="text-3xl sm:text-4xl font-black text-blue-900 tracking-tight">
                {formatMoney(finalLoanLimit)}
              </div>
              <p className="text-[11px] text-gray-500 pt-1 font-medium">
                결정 사유: <strong className="text-gray-800">{bottleneck}</strong>
              </p>
            </div>

            {/* LTV vs DSR 비교 막대 */}
            <div className="space-y-2 p-3 bg-gray-50 rounded-2xl border border-gray-200 text-xs">
              <div className="flex justify-between font-bold">
                <span className="text-gray-600">LTV ({ltvRatio}%) 기준 한도</span>
                <strong className="text-gray-900">{formatMoney(ltvMaxLoan)}</strong>
              </div>
              <div className="flex justify-between font-bold">
                <span className="text-gray-600">DSR (40%) 기준 한도</span>
                <strong className="text-gray-900">{formatMoney(dsrMaxLoan)}</strong>
              </div>
            </div>

            {/* 월 상환액 명세 */}
            <div className="space-y-2.5 text-xs pt-1">
              <div className="flex justify-between py-2 border-b border-gray-100 items-baseline">
                <span className="text-sm font-bold text-gray-700">첫 달 예상 월 상환액</span>
                <strong className="text-lg font-black text-blue-600">
                  {formatMoney(repaymentSchedule.firstMonthPayment)}
                </strong>
              </div>

              <div className="flex justify-between py-1 border-b border-gray-100">
                <span className="text-gray-500">└ 월 원금 상환액</span>
                <span className="text-gray-800 font-bold">{formatMoney(repaymentSchedule.monthlyPrincipal)}</span>
              </div>

              <div className="flex justify-between py-1 border-b border-gray-100">
                <span className="text-gray-500">└ 월 이자 납부액 (연 {interestRate}%)</span>
                <span className="text-gray-800 font-bold">{formatMoney(repaymentSchedule.monthlyInterest)}</span>
              </div>

              <div className="flex justify-between py-1 border-b border-gray-100">
                <span className="text-gray-500">{loanYears}년 총 납부 이자 합계</span>
                <strong className="text-rose-600 font-bold">+{formatMoney(repaymentSchedule.totalInterest)}</strong>
              </div>
            </div>

            <div className="p-3 bg-gray-50 rounded-xl text-[11px] text-gray-500 space-y-1">
              <p>• 스트레스 DSR 제도로 인해 대출 심사 시 실제 금리보다 높은 가산금리가 적용되어 대출 한도가 축소 산출됩니다.</p>
              <p>• 은행별 가산금리 및 우대금리(급여이체, 청약통장 등)에 따라 실제 수치는 차이가 있을 수 있습니다.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
