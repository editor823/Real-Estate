"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { ContributionCalculator } from "./ContributionCalculator";
import { TaxCalculator } from "./TaxCalculator";
import { LoanDsrCalculator } from "./LoanDsrCalculator";
import { Coins, Receipt, Landmark, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

export type CalculatorTab = "contribution" | "tax" | "loan";

export function CalculatorHub() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [activeTab, setActiveTab] = useState<CalculatorTab>("contribution");

  // URL 파라미터 동기화 (?type=contribution | tax | loan)
  useEffect(() => {
    const typeParam = searchParams.get("type");
    if (typeParam === "tax" || typeParam === "loan" || typeParam === "contribution") {
      setActiveTab(typeParam);
    }
  }, [searchParams]);

  const handleTabChange = (tab: CalculatorTab) => {
    setActiveTab(tab);
    router.replace(`/calculators?type=${tab}`, { scroll: false });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 space-y-6">
      {/* 3대 핵심 탭 셀렉터 */}
      <div className="bg-white p-2 rounded-3xl border border-gray-200 shadow-xs">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          {/* 탭 1: 재개발·재건축 분담금 & 비례율 */}
          <button
            type="button"
            onClick={() => handleTabChange("contribution")}
            className={cn(
              "flex items-center justify-center gap-2.5 py-3.5 px-4 rounded-2xl transition-all cursor-pointer text-sm font-extrabold",
              activeTab === "contribution"
                ? "bg-blue-600 text-white shadow-md shadow-blue-600/30 font-black scale-[1.01]"
                : "bg-gray-50 hover:bg-gray-100 text-gray-700"
            )}
          >
            <Coins className="w-5 h-5 shrink-0" />
            <div className="text-left">
              <div>재개발·재건축 분담금</div>
              <div className="text-[11px] opacity-80 font-medium">비례율 및 공사비 시뮬레이션</div>
            </div>
          </button>

          {/* 탭 2: 취득세 & 양도소득세 */}
          <button
            type="button"
            onClick={() => handleTabChange("tax")}
            className={cn(
              "flex items-center justify-center gap-2.5 py-3.5 px-4 rounded-2xl transition-all cursor-pointer text-sm font-extrabold",
              activeTab === "tax"
                ? "bg-blue-600 text-white shadow-md shadow-blue-600/30 font-black scale-[1.01]"
                : "bg-gray-50 hover:bg-gray-100 text-gray-700"
            )}
          >
            <Receipt className="w-5 h-5 shrink-0" />
            <div className="text-left">
              <div>취득세 &amp; 양도소득세</div>
              <div className="text-[11px] opacity-80 font-medium">생애최초 감면 &amp; 1세대 1주택 비과세</div>
            </div>
          </button>

          {/* 탭 3: 대출 한도 (DSR / LTV) */}
          <button
            type="button"
            onClick={() => handleTabChange("loan")}
            className={cn(
              "flex items-center justify-center gap-2.5 py-3.5 px-4 rounded-2xl transition-all cursor-pointer text-sm font-extrabold",
              activeTab === "loan"
                ? "bg-blue-600 text-white shadow-md shadow-blue-600/30 font-black scale-[1.01]"
                : "bg-gray-50 hover:bg-gray-100 text-gray-700"
            )}
          >
            <Landmark className="w-5 h-5 shrink-0" />
            <div className="text-left">
              <div>DSR &amp; LTV 대출 한도</div>
              <div className="text-[11px] opacity-80 font-medium">스트레스 DSR 2단계 &amp; 월 상환액</div>
            </div>
          </button>
        </div>
      </div>

      {/* 탭별 계산기 컨텐츠 영역 */}
      <div>
        {activeTab === "contribution" && <ContributionCalculator />}
        {activeTab === "tax" && <TaxCalculator />}
        {activeTab === "loan" && <LoanDsrCalculator />}
      </div>
    </div>
  );
}
