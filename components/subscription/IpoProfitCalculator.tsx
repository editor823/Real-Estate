"use client";

import React, { useState, useMemo, useEffect } from 'react';
import {
  Calculator,
  Coins,
  TrendingUp,
  Percent,
  Clock,
  AlertCircle,
  CheckCircle2,
  Sparkles,
  ArrowRight,
} from 'lucide-react';
import { IpoItem } from './mockData';

export interface IpoProfitCalculatorProps {
  initialIpo?: IpoItem | null;
}

export const IpoProfitCalculator: React.FC<IpoProfitCalculatorProps> = ({ initialIpo }) => {
  // 1. 필수 입력 상태: 증거금(원), 예상 비례 경쟁률(:1), 확정 공모가(원), 상장일 예상 상승률(%)
  const [depositAmount, setDepositAmount] = useState<number>(100_000_000); // 기본 1억 원
  const [competitionRate, setCompetitionRate] = useState<number>(1200);    // 기본 1,200 : 1
  const [offeringPrice, setOfferingPrice] = useState<number>(38_000);      // 기본 38,000원
  const [expectedReturnRate, setExpectedReturnRate] = useState<number>(80); // 기본 +80% 상승

  // 2. 기회비용(마이너스 통장 / 파킹통장 이자) 정밀 설정 상태
  const [fundingType, setFundingType] = useState<'MINUS_LOAN' | 'PARKING_ACCOUNT'>('MINUS_LOAN');
  const [annualInterestRate, setAnnualInterestRate] = useState<number>(5.2); // 연 5.2%
  const [refundDays, setRefundDays] = useState<number>(2);                   // 기본 2일 (주말 포함 시 4일)
  const [subscriptionFee, setSubscriptionFee] = useState<number>(2000);      // 증권사 청약 수수료 2,000원

  // 공모주 캘린더에서 특정 종목 선택 시 자동 동기화
  useEffect(() => {
    if (initialIpo) {
      setOfferingPrice(initialIpo.offeringPrice);
      setRefundDays(initialIpo.refundDays);
      const parsedComp = parseFloat(initialIpo.institutionalCompetitionRate.replace(/,/g, ''));
      if (!Number.isNaN(parsedComp) && parsedComp > 0) {
        setCompetitionRate(Math.round(parsedComp * 1.2));
      }
    }
  }, [initialIpo]);

  const handleFundingTypeChange = (type: 'MINUS_LOAN' | 'PARKING_ACCOUNT') => {
    setFundingType(type);
    setAnnualInterestRate(type === 'MINUS_LOAN' ? 5.2 : 3.2);
  };

  // 계산 로직 (증거금률 50% 기준)
  const calcResult = useMemo(() => {
    const safeOfferingPrice = Math.max(100, offeringPrice);
    const safeCompetition = Math.max(1, competitionRate);
    const safeDeposit = Math.max(0, depositAmount);

    // 비례 1주 배정에 필요한 증거금 = (공모가 * 비례경쟁률) * 증거금률(50%)
    const depositPerShare = (safeOfferingPrice * safeCompetition) * 0.5;

    // 정배정 주식 수 및 5사6입 반올림 반영 주식 수
    const exactShares = depositPerShare > 0 ? safeDeposit / depositPerShare : 0;
    const allocatedSharesFloor = Math.floor(exactShares);
    const allocatedSharesRound = Math.round(exactShares); // 5사6입 기대 주수

    // 기본 보수적 계산은 정배정(Floor) 기준, 단 0주일 때 5사6입 가능 여부 별도 안내
    const effectiveShares = allocatedSharesFloor;

    const totalAllottedCost = effectiveShares * safeOfferingPrice;
    const expectedSellPricePerShare = Math.round(
      safeOfferingPrice * (1 + expectedReturnRate / 100)
    );
    const grossProfit = effectiveShares * (expectedSellPricePerShare - safeOfferingPrice);

    // 기회비용(이자) = 투입 증거금 * (연이자율 / 100) * (환불일수 / 365)
    const interestCost = Math.round(
      safeDeposit * (annualInterestRate / 100) * (refundDays / 365)
    );
    const totalExpense = interestCost + subscriptionFee;

    // 최종 순이익
    const netProfit = grossProfit - totalExpense;
    const roiPercent = safeDeposit > 0 ? (netProfit / safeDeposit) * 100 : 0;

    // 손익분기(BEP) 최소 상승률 계산
    const bepReturnRate =
      totalAllottedCost > 0 ? (totalExpense / totalAllottedCost) * 100 : 0;

    // 5사6입(0.6주) 기준 1주 추가 배정 최적 증거금 가이드
    const optimal56DepositForNextShare = Math.ceil(
      (allocatedSharesFloor + 0.55) * depositPerShare
    );

    return {
      depositPerShare: Math.round(depositPerShare),
      exactShares,
      allocatedSharesFloor,
      allocatedSharesRound,
      effectiveShares,
      totalAllottedCost,
      expectedSellPricePerShare,
      grossProfit,
      interestCost,
      totalExpense,
      netProfit,
      roiPercent,
      bepReturnRate,
      optimal56DepositForNextShare,
    };
  }, [
    depositAmount,
    competitionRate,
    offeringPrice,
    expectedReturnRate,
    annualInterestRate,
    refundDays,
    subscriptionFee,
  ]);

  // 상승률 시나리오별 순이익 비교 테이블 데이터
  const scenarioRows = useMemo(() => {
    const rates = [-10, 30, 60, 100, 200, 300];
    return rates.map((rate) => {
      const sellPrice = Math.round(offeringPrice * (1 + rate / 100));
      const gross = calcResult.effectiveShares * (sellPrice - offeringPrice);
      const net = gross - calcResult.totalExpense;
      return {
        rate,
        sellPrice,
        gross,
        net,
      };
    });
  }, [offeringPrice, calcResult.effectiveShares, calcResult.totalExpense]);

  return (
    <div className="space-y-6">
      {/* 상단 배너 */}
      <div className="bg-gradient-to-r from-emerald-950 via-slate-900 to-teal-950 rounded-2xl p-6 text-white shadow-lg">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-200 text-xs font-semibold mb-2">
              <Sparkles className="w-3.5 h-3.5" />
              마이너스 통장 · 파킹통장 기회비용(이자) 완벽 반영
            </div>
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight">
              공모주 비례배정 실익(순이익) 계산기
            </h2>
            <p className="text-slate-300 text-sm mt-1">
              청약 증거금과 예상 경쟁률, 상장일 예상 상승률을 입력하여 이자 차감 후 실질 순이익과 손익분기점을 계산하세요.
            </p>
          </div>
          {initialIpo && (
            <div className="bg-white/10 border border-white/15 rounded-xl px-4 py-2.5 text-xs">
              <span className="text-emerald-300 font-bold block">연동된 공모주 종목</span>
              <span className="text-white font-bold text-sm">{initialIpo.companyName}</span>
              <span className="text-slate-300 ml-2">
                (공모가 {initialIpo.offeringPriceDisplay} · 환불 {initialIpo.refundDays}일)
              </span>
            </div>
          )}
        </div>
      </div>

      {/* 메인 그리드: 좌측 입력 폼 / 우측 순이익 분석 리포트 */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* 좌측 입력 영역 (7컬럼) */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-5">
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
            <Calculator className="w-5 h-5 text-emerald-600" />
            청약 조건 및 자금 조달 비용 입력
          </h3>

          {/* 1. 투입 청약 증거금 */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <Coins className="w-4 h-4 text-emerald-600" />
                투입 청약 증거금 (원, 증거금률 50% 기준)
              </label>
              <span className="text-xs font-bold text-emerald-700">
                {(depositAmount / 10000).toLocaleString()}만 원 ({(depositAmount / 100000000).toFixed(2)}억 원)
              </span>
            </div>
            <input
              type="number"
              step={1000000}
              min={0}
              value={depositAmount}
              onChange={(e) => setDepositAmount(Math.max(0, Number(e.target.value)))}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
            />
            <div className="flex flex-wrap gap-1.5">
              {[30_000_000, 50_000_000, 100_000_000, 200_000_000, 500_000_000].map((amt) => (
                <button
                  key={amt}
                  type="button"
                  onClick={() => setDepositAmount(amt)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold border transition-colors ${
                    depositAmount === amt
                      ? 'bg-emerald-600 text-white border-emerald-600'
                      : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {amt >= 100_000_000 ? `${amt / 100_000_000}억 원` : `${amt / 10_000}만 원`}
                </button>
              ))}
            </div>
          </div>

          {/* 2. 확정 공모가 & 예상 비례 경쟁률 */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 block">
                확정 공모가 (원)
              </label>
              <input
                type="number"
                step={500}
                min={100}
                value={offeringPrice}
                onChange={(e) => setOfferingPrice(Math.max(100, Number(e.target.value)))}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
              />
              <p className="text-[11px] text-slate-500">
                1주당 청약증거금(50%): {(offeringPrice * 0.5).toLocaleString()}원
              </p>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 block">
                예상 비례 경쟁률 ( : 1 )
              </label>
              <input
                type="number"
                step={50}
                min={1}
                value={competitionRate}
                onChange={(e) => setCompetitionRate(Math.max(1, Number(e.target.value)))}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
              />
              <p className="text-[11px] text-slate-500">
                1주 배정 기준 증거금: 약 {(calcResult.depositPerShare / 10000).toFixed(0).toLocaleString()}만 원
              </p>
            </div>
          </div>

          {/* 3. 상장일 예상 상승률(%) */}
          <div className="space-y-2 pt-1">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <TrendingUp className="w-4 h-4 text-emerald-600" />
                상장일 공모가 대비 예상 상승률 (%)
              </label>
              <span className="text-sm font-extrabold text-emerald-700">
                {expectedReturnRate >= 0 ? `+${expectedReturnRate}%` : `${expectedReturnRate}%`} (예상 매도가:{' '}
                {calcResult.expectedSellPricePerShare.toLocaleString()}원)
              </span>
            </div>
            <input
              type="range"
              min={-40}
              max={300}
              step={5}
              value={expectedReturnRate}
              onChange={(e) => setExpectedReturnRate(Number(e.target.value))}
              className="w-full accent-emerald-600 cursor-pointer"
            />
            <div className="flex flex-wrap gap-1.5">
              {[
                { label: '-20% (하락)', val: -20 },
                { label: '+30% (보수적)', val: 30 },
                { label: '+60%', val: 60 },
                { label: '+100% (따블)', val: 100 },
                { label: '+200%', val: 200 },
                { label: '+300% (따따블)', val: 300 },
              ].map((preset) => (
                <button
                  key={preset.val}
                  type="button"
                  onClick={() => setExpectedReturnRate(preset.val)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold border transition-colors ${
                    expectedReturnRate === preset.val
                      ? 'bg-slate-900 text-white border-slate-900'
                      : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </div>

          {/* 4. 기회비용(마이너스 통장 / 파킹통장 이자 및 환불 기간) */}
          <div className="pt-4 border-t border-slate-100 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <Percent className="w-4 h-4 text-emerald-600" />
                자금 조달 유형 (기회비용 산정 기준)
              </span>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => handleFundingTypeChange('MINUS_LOAN')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all ${
                    fundingType === 'MINUS_LOAN'
                      ? 'bg-emerald-600 text-white border-emerald-600'
                      : 'bg-slate-50 text-slate-600 border-slate-200'
                  }`}
                >
                  마이너스 통장 대출 (권장 5.2%)
                </button>
                <button
                  type="button"
                  onClick={() => handleFundingTypeChange('PARKING_ACCOUNT')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all ${
                    fundingType === 'PARKING_ACCOUNT'
                      ? 'bg-emerald-600 text-white border-emerald-600'
                      : 'bg-slate-50 text-slate-600 border-slate-200'
                  }`}
                >
                  파킹통장 자기자본 (권장 3.2%)
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="text-xs font-semibold text-slate-600 block mb-1">
                  연 이자율 (%)
                </label>
                <input
                  type="number"
                  step={0.1}
                  min={0}
                  max={20}
                  value={annualInterestRate}
                  onChange={(e) => setAnnualInterestRate(Math.max(0, Number(e.target.value)))}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-sm font-bold text-slate-800"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-600 flex items-center gap-1 mb-1">
                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                  환불 소요 일수 (일)
                </label>
                <select
                  value={refundDays}
                  onChange={(e) => setRefundDays(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-sm font-bold text-slate-800"
                >
                  <option value={1}>1일 (익일 환불 특례)</option>
                  <option value={2}>2일 (평일 일반 청약)</option>
                  <option value={3}>3일 (공휴일 1일 포함)</option>
                  <option value={4}>4일 (목·금 청약 → 주말 경유)</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-600 block mb-1">
                  청약 수수료 (원)
                </label>
                <select
                  value={subscriptionFee}
                  onChange={(e) => setSubscriptionFee(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-sm font-bold text-slate-800"
                >
                  <option value={2000}>2,000원 (일반 온라인)</option>
                  <option value={0}>0원 (우대등급 면제)</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* 우측: 최종 순이익 및 배정 분석 카드 (5컬럼) */}
        <div className="lg:col-span-5 space-y-5">
          <div className="bg-white rounded-2xl border-2 border-emerald-600 p-6 shadow-md space-y-5">
            <div className="border-b border-slate-100 pb-4">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-600">
                기회비용(이자·수수료) 차감 후 최종 순이익
              </span>
              <div className="flex items-baseline gap-2 mt-1">
                <span
                  className={`text-3xl sm:text-4xl font-extrabold ${
                    calcResult.netProfit >= 0 ? 'text-emerald-700' : 'text-rose-600'
                  }`}
                >
                  {calcResult.netProfit >= 0 ? '+' : ''}
                  {calcResult.netProfit.toLocaleString()}원
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                투입 증거금 대비 순수익률(ROI):{' '}
                <strong className="text-slate-800">{calcResult.roiPercent.toFixed(3)}%</strong> ·
                손익분기(BEP) 최소 상승률:{' '}
                <strong className="text-indigo-700">+{calcResult.bepReturnRate.toFixed(1)}%</strong>
              </p>
            </div>

            {/* 배정 주식 수 및 세부 내역 */}
            <div className="space-y-2.5 text-xs sm:text-sm">
              <div className="flex justify-between items-center py-2 px-3 rounded-xl bg-emerald-50/70 border border-emerald-100">
                <span className="font-semibold text-slate-700">예상 비례 배정 주식 수</span>
                <div className="text-right">
                  <span className="font-extrabold text-emerald-800 text-base">
                    {calcResult.effectiveShares.toLocaleString()}주
                  </span>
                  <span className="text-xs text-slate-500 block">
                    (정확치 {calcResult.exactShares.toFixed(2)}주 / 5사6입 시 {calcResult.allocatedSharesRound}주)
                  </span>
                </div>
              </div>

              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-500">배정 주식 총 매입금액</span>
                <span className="font-semibold text-slate-800">
                  {calcResult.totalAllottedCost.toLocaleString()}원
                </span>
              </div>

              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-500">상장일 세전 매매차익</span>
                <span className="font-bold text-blue-700">
                  +{calcResult.grossProfit.toLocaleString()}원
                </span>
              </div>

              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-500">
                  차감: {fundingType === 'MINUS_LOAN' ? '마이너스 통장 이자' : '파킹통장 기회비용'} ({refundDays}일)
                </span>
                <span className="font-bold text-rose-600">
                  -{calcResult.interestCost.toLocaleString()}원
                </span>
              </div>

              <div className="flex justify-between py-1.5">
                <span className="text-slate-500">차감: 증권사 청약 수수료</span>
                <span className="font-semibold text-rose-600">
                  -{subscriptionFee.toLocaleString()}원
                </span>
              </div>
            </div>

            {/* 5사6입 증거금 효율화 코칭 박스 */}
            <div className="p-4 rounded-xl bg-slate-900 text-white space-y-1.5 text-xs">
              <div className="font-bold text-emerald-300 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                5사6입(반올림) 증거금 최적화 팁
              </div>
              <p className="text-slate-300 leading-relaxed">
                현재 조건에서 비례 <strong>1주 정배정 기준 증거금은 약 {calcResult.depositPerShare.toLocaleString()}원</strong>입니다.
                5사6입이 적용되는 증권사라면{' '}
                <strong className="text-amber-300">
                  약 {calcResult.optimal56DepositForNextShare.toLocaleString()}원
                </strong>
                만 투입해도 반올림으로 <strong>{calcResult.allocatedSharesFloor + 1}주</strong> 배정을 기대할 수 있어 이자 비용을 절감할 수 있습니다.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 상장일 상승률 시나리오별 순이익 비교 테이블 */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-emerald-600" />
            <h3 className="text-base font-bold text-slate-900">
              상장일 상승률 시나리오별 순이익 시뮬레이션 (배정 {calcResult.effectiveShares}주 · 이자비용{' '}
              {calcResult.totalExpense.toLocaleString()}원 기준)
            </h3>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs sm:text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
                <th className="py-2.5 px-4">상장일 상승률 시나리오</th>
                <th className="py-2.5 px-4 text-right">예상 매도가 (1주)</th>
                <th className="py-2.5 px-4 text-right">세전 매매차익</th>
                <th className="py-2.5 px-4 text-right">이자 + 수수료</th>
                <th className="py-2.5 px-4 text-right">최종 순이익 (Net)</th>
                <th className="py-2.5 px-4 text-center">판정</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {scenarioRows.map((row) => (
                <tr key={row.rate} className="hover:bg-slate-50">
                  <td className="py-3 px-4 font-bold text-slate-900 flex items-center gap-1.5">
                    <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                    {row.rate > 0 ? `+${row.rate}% 상승` : `${row.rate}% 하락`}
                    {row.rate === 100 && (
                      <span className="px-1.5 py-0.5 rounded bg-blue-50 text-blue-700 text-[10px]">
                        따블
                      </span>
                    )}
                    {row.rate === 300 && (
                      <span className="px-1.5 py-0.5 rounded bg-rose-50 text-rose-700 text-[10px]">
                        따따블
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-4 text-right font-medium text-slate-700">
                    {row.sellPrice.toLocaleString()}원
                  </td>
                  <td className="py-3 px-4 text-right font-semibold text-slate-800">
                    {row.gross >= 0 ? `+${row.gross.toLocaleString()}` : row.gross.toLocaleString()}원
                  </td>
                  <td className="py-3 px-4 text-right text-rose-600">
                    -{calcResult.totalExpense.toLocaleString()}원
                  </td>
                  <td
                    className={`py-3 px-4 text-right font-extrabold ${
                      row.net >= 0 ? 'text-emerald-700' : 'text-rose-600'
                    }`}
                  >
                    {row.net >= 0 ? `+${row.net.toLocaleString()}` : row.net.toLocaleString()}원
                  </td>
                  <td className="py-3 px-4 text-center">
                    {row.net > 0 ? (
                      <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold">
                        실익 구간
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 text-xs font-bold">
                        이자 손실
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default IpoProfitCalculator;
