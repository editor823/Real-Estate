"use client";

import React, { useState, useMemo } from 'react';
import {
  Award,
  Users,
  Home,
  CreditCard,
  CheckCircle2,
  AlertCircle,
  MapPin,
  RotateCcw,
  Sparkles,
} from 'lucide-react';
import { SCORE_TIER_GUIDES } from './mockData';

interface ScoreOption {
  label: string;
  description: string;
  points: number;
}

/**
 * 1. 무주택 기간 (최대 32점) - 주택공급에 관한 규칙 공식 산정표
 */
const HOMELESS_PERIOD_OPTIONS: ScoreOption[] = [
  { label: '유주택자 또는 만 30세 미만 미혼 무주택자', description: '0점 처리', points: 0 },
  { label: '1년 미만', description: '만 30세 이상 또는 혼인신고일 기준', points: 2 },
  { label: '1년 이상 ~ 2년 미만', description: '무주택 1년차', points: 4 },
  { label: '2년 이상 ~ 3년 미만', description: '무주택 2년차', points: 6 },
  { label: '3년 이상 ~ 4년 미만', description: '무주택 3년차', points: 8 },
  { label: '4년 이상 ~ 5년 미만', description: '무주택 4년차', points: 10 },
  { label: '5년 이상 ~ 6년 미만', description: '무주택 5년차', points: 12 },
  { label: '6년 이상 ~ 7년 미만', description: '무주택 6년차', points: 14 },
  { label: '7년 이상 ~ 8년 미만', description: '무주택 7년차', points: 16 },
  { label: '8년 이상 ~ 9년 미만', description: '무주택 8년차', points: 18 },
  { label: '9년 이상 ~ 10년 미만', description: '무주택 9년차', points: 20 },
  { label: '10년 이상 ~ 11년 미만', description: '무주택 10년차', points: 22 },
  { label: '11년 이상 ~ 12년 미만', description: '무주택 11년차', points: 24 },
  { label: '12년 이상 ~ 13년 미만', description: '무주택 12년차', points: 26 },
  { label: '13년 이상 ~ 14년 미만', description: '무주택 13년차', points: 28 },
  { label: '14년 이상 ~ 15년 미만', description: '무주택 14년차', points: 30 },
  { label: '15년 이상 (만점)', description: '무주택 기간 최고점', points: 32 },
];

/**
 * 2. 부양가족 수 (최대 35점) - 본인 제외, 배우자·직계존비속 기준
 */
const DEPENDENTS_OPTIONS: ScoreOption[] = [
  { label: '0명 (본인 단독세대)', description: '본인 외 부양가족 없음', points: 5 },
  { label: '1명 (예: 배우자 또는 자녀 1명)', description: '2인 가구 기준', points: 10 },
  { label: '2명 (예: 배우자 + 자녀 1명)', description: '3인 가구 기준', points: 15 },
  { label: '3명 (예: 배우자 + 자녀 2명)', description: '4인 가구 기준', points: 20 },
  { label: '4명 (예: 배우자 + 자녀 3명 또는 부모 합가)', description: '5인 가구 기준', points: 25 },
  { label: '5명 (예: 배우자 + 자녀 2명 + 양가 부모 등)', description: '6인 가구 기준', points: 30 },
  { label: '6명 이상 (만점)', description: '부양가족 최고점', points: 35 },
];

/**
 * 3. 청약통장 가입기간 (최대 17점) - 미성년 가입 인정분 최대 5년 포함
 */
const BANKBOOK_PERIOD_OPTIONS: ScoreOption[] = [
  { label: '6개월 미만', description: '기본 1점', points: 1 },
  { label: '6개월 이상 ~ 1년 미만', description: '1순위 최소 요건 충족 가능', points: 2 },
  { label: '1년 이상 ~ 2년 미만', description: '가입 1년차', points: 3 },
  { label: '2년 이상 ~ 3년 미만', description: '투기과열지구 1순위 요건 충족', points: 4 },
  { label: '3년 이상 ~ 4년 미만', description: '가입 3년차', points: 5 },
  { label: '4년 이상 ~ 5년 미만', description: '가입 4년차', points: 6 },
  { label: '5년 이상 ~ 6년 미만', description: '가입 5년차', points: 7 },
  { label: '6년 이상 ~ 7년 미만', description: '가입 6년차', points: 8 },
  { label: '7년 이상 ~ 8년 미만', description: '가입 7년차', points: 9 },
  { label: '8년 이상 ~ 9년 미만', description: '가입 8년차', points: 10 },
  { label: '9년 이상 ~ 10년 미만', description: '가입 9년차', points: 11 },
  { label: '10년 이상 ~ 11년 미만', description: '가입 10년차', points: 12 },
  { label: '11년 이상 ~ 12년 미만', description: '가입 11년차', points: 13 },
  { label: '12년 이상 ~ 13년 미만', description: '가입 12년차', points: 14 },
  { label: '13년 이상 ~ 14년 미만', description: '가입 13년차', points: 15 },
  { label: '14년 이상 ~ 15년 미만', description: '가입 14년차', points: 16 },
  { label: '15년 이상 (만점)', description: '통장 가입기간 최고점', points: 17 },
];

export const ScoreCalculator: React.FC = () => {
  const [homelessScore, setHomelessScore] = useState<number>(22);
  const [dependentsScore, setDependentsScore] = useState<number>(20);
  const [bankbookScore, setBankbookScore] = useState<number>(14);

  const totalScore = homelessScore + dependentsScore + bankbookScore;

  const matchedTier = useMemo(() => {
    return (
      SCORE_TIER_GUIDES.find(
        (tier) => totalScore >= tier.minScore && totalScore <= tier.maxScore
      ) || SCORE_TIER_GUIDES[SCORE_TIER_GUIDES.length - 1]
    );
  }, [totalScore]);

  const applyPreset = (homeless: number, dependents: number, bankbook: number) => {
    setHomelessScore(homeless);
    setDependentsScore(dependents);
    setBankbookScore(bankbook);
  };

  return (
    <div className="space-y-8">
      {/* 1. 상단 타이틀 배너 (글자 크기 및 여백 시원하게 확대) */}
      <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
          <div className="space-y-2">
            <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-blue-500/25 border border-blue-400/40 text-blue-200 text-xs sm:text-sm font-bold">
              <Sparkles className="w-4 h-4 text-amber-300" />
              주택공급에 관한 규칙 공식 84점 만점 기준표
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight leading-tight">
              아파트 청약 가점 계산기 & 서울 정비사업 당첨권 진단
            </h2>
            <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
              무주택 기간(32점), 부양가족 수(35점), 청약통장 가입기간(17점)을 선택하면 실시간으로 내 점수와 최적 당첨 구역을 분석합니다.
            </p>
          </div>

          {/* 원클릭 가구별 프리셋 버튼 (글씨 크기 및 패딩 확대) */}
          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <button
              type="button"
              onClick={() => applyPreset(10, 10, 10)}
              className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-xs sm:text-sm font-bold text-slate-200 border border-white/20 transition-all cursor-pointer shadow-sm"
            >
              신혼 2인가구 (30점)
            </button>
            <button
              type="button"
              onClick={() => applyPreset(26, 15, 15)}
              className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-xs sm:text-sm font-bold text-slate-200 border border-white/20 transition-all cursor-pointer shadow-sm"
            >
              3인가구 중상위 (56점)
            </button>
            <button
              type="button"
              onClick={() => applyPreset(32, 20, 17)}
              className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-xs sm:text-sm font-extrabold text-white border border-blue-400 shadow-md transition-all cursor-pointer"
            >
              4인가구 만점 (69점)
            </button>
          </div>
        </div>
      </div>

      {/* 2. 메인 계산기 그리드: 좌측 입력 폼 / 우측 실시간 결과 */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8">
        {/* 좌측 입력 패널 (7컬럼) */}
        <div className="lg:col-span-7 space-y-6">
          {/* 1. 무주택 기간 */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-7 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                  <Home className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-extrabold text-slate-900">1. 무주택 기간</h3>
                  <p className="text-xs sm:text-sm text-slate-500">만 30세 되는 날(30세 전 혼인 시 혼인신고일)부터 산정</p>
                </div>
              </div>
              <span className="px-3.5 py-1.5 rounded-full bg-blue-600 text-white text-xs sm:text-sm font-black shadow-xs">
                {homelessScore}점 / 32점
              </span>
            </div>

            <select
              value={homelessScore}
              onChange={(e) => setHomelessScore(Number(e.target.value))}
              className="w-full px-4 py-3.5 rounded-2xl border border-slate-300 bg-slate-50 text-sm sm:text-base font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white transition-all cursor-pointer"
            >
              {HOMELESS_PERIOD_OPTIONS.map((opt) => (
                <option key={opt.points} value={opt.points}>
                  {opt.label} — {opt.points}점 ({opt.description})
                </option>
              ))}
            </select>

            <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
              <div
                className="bg-blue-600 h-full transition-all duration-300"
                style={{ width: `${(homelessScore / 32) * 100}%` }}
              />
            </div>
          </div>

          {/* 2. 부양가족 수 */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-7 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                  <Users className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-extrabold text-slate-900">2. 부양가족 수 (본인 제외)</h3>
                  <p className="text-xs sm:text-sm text-slate-500">동일 등본상 무주택 배우자, 미혼 자녀, 3년 이상 등재 부모</p>
                </div>
              </div>
              <span className="px-3.5 py-1.5 rounded-full bg-emerald-600 text-white text-xs sm:text-sm font-black shadow-xs">
                {dependentsScore}점 / 35점
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {DEPENDENTS_OPTIONS.map((opt) => {
                const active = dependentsScore === opt.points;
                return (
                  <button
                    key={opt.points}
                    type="button"
                    onClick={() => setDependentsScore(opt.points)}
                    className={`p-3.5 sm:p-4 rounded-2xl border text-left transition-all cursor-pointer ${
                      active
                        ? 'border-emerald-600 bg-emerald-50/80 ring-2 ring-emerald-600 shadow-xs'
                        : 'border-slate-200 hover:bg-slate-50 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs sm:text-sm font-extrabold text-slate-900">{opt.label}</span>
                      <span
                        className={`text-xs sm:text-sm font-black ${
                          active ? 'text-emerald-700' : 'text-slate-500'
                        }`}
                      >
                        {opt.points}점
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-1 font-medium">{opt.description}</p>
                  </button>
                );
              })}
            </div>

            <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
              <div
                className="bg-emerald-600 h-full transition-all duration-300"
                style={{ width: `${(dependentsScore / 35) * 100}%` }}
              />
            </div>
          </div>

          {/* 3. 청약통장 가입기간 */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-7 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                  <CreditCard className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-extrabold text-slate-900">3. 청약통장 가입기간</h3>
                  <p className="text-xs sm:text-sm text-slate-500">입주자모집공고일 기준 (미성년자 가입기간은 최대 5년 인정)</p>
                </div>
              </div>
              <span className="px-3.5 py-1.5 rounded-full bg-indigo-600 text-white text-xs sm:text-sm font-black shadow-xs">
                {bankbookScore}점 / 17점
              </span>
            </div>

            <select
              value={bankbookScore}
              onChange={(e) => setBankbookScore(Number(e.target.value))}
              className="w-full px-4 py-3.5 rounded-2xl border border-slate-300 bg-slate-50 text-sm sm:text-base font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:bg-white transition-all cursor-pointer"
            >
              {BANKBOOK_PERIOD_OPTIONS.map((opt) => (
                <option key={opt.points} value={opt.points}>
                  {opt.label} — {opt.points}점 ({opt.description})
                </option>
              ))}
            </select>

            <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
              <div
                className="bg-indigo-600 h-full transition-all duration-300"
                style={{ width: `${(bankbookScore / 17) * 100}%` }}
              />
            </div>
          </div>
        </div>

        {/* 우측 실시간 결과 진단 카드 (5컬럼) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white rounded-3xl border-2 border-blue-600 p-6 sm:p-7 shadow-xl space-y-5 sticky top-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <span className="text-xs sm:text-sm font-extrabold uppercase tracking-wider text-blue-600">
                  실시간 청약 가점 산출 결과
                </span>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className="text-5xl font-black text-slate-900 tracking-tight">{totalScore}</span>
                  <span className="text-lg font-bold text-slate-400">/ 84점 만점</span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => applyPreset(22, 20, 14)}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-xs sm:text-sm font-bold text-slate-700 transition-colors cursor-pointer shadow-2xs"
              >
                <RotateCcw className="w-4 h-4 text-slate-500" />
                초기화
              </button>
            </div>

            {/* 항목별 득점 요약 바 (글자 크기 확대) */}
            <div className="grid grid-cols-3 gap-2 text-center bg-slate-50 p-4 rounded-2xl border border-slate-200">
              <div>
                <p className="text-xs sm:text-sm text-slate-500 font-bold">무주택 기간</p>
                <p className="text-base sm:text-lg font-black text-blue-700 mt-1">{homelessScore} / 32</p>
              </div>
              <div className="border-x border-slate-200">
                <p className="text-xs sm:text-sm text-slate-500 font-bold">부양가족 수</p>
                <p className="text-base sm:text-lg font-black text-emerald-700 mt-1">{dependentsScore} / 35</p>
              </div>
              <div>
                <p className="text-xs sm:text-sm text-slate-500 font-bold">통장 기간</p>
                <p className="text-base sm:text-lg font-black text-indigo-700 mt-1">{bankbookScore} / 17</p>
              </div>
            </div>

            {/* 서울 주요 구역 안정권/도전권 진단 피드백 (시원한 폰트) */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs sm:text-sm font-extrabold text-slate-600">서울·수도권 당첨권 판정</span>
                <span
                  className={`px-3.5 py-1.5 rounded-full text-xs sm:text-sm font-black border shadow-xs ${matchedTier.badgeColor}`}
                >
                  {matchedTier.tierLabel}
                </span>
              </div>

              <div className="p-5 rounded-2xl bg-slate-900 text-white space-y-3 shadow-lg">
                <p className="text-base sm:text-lg font-extrabold text-amber-300 flex items-center gap-2">
                  <Award className="w-5 h-5 shrink-0 text-amber-300" />
                  {matchedTier.headline}
                </p>
                <p className="text-sm leading-relaxed text-slate-200 font-medium">
                  {matchedTier.detailedAdvice}
                </p>
                <div className="pt-3 border-t border-white/15 flex items-start gap-2 text-xs sm:text-sm text-emerald-300">
                  <MapPin className="w-4 h-4 shrink-0 mt-0.5 text-emerald-400" />
                  <span className="leading-snug">
                    <strong className="text-white">타겟 추천 권역:</strong> {matchedTier.targetZones}
                  </span>
                </div>
              </div>

              <div className="space-y-2.5 pt-1">
                <h4 className="text-xs sm:text-sm font-extrabold text-slate-900 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-blue-600" />
                  맞춤형 청약 실행 전략
                </h4>
                <ul className="space-y-2 text-xs sm:text-sm text-slate-700">
                  {matchedTier.recommendedStrategy.map((strat, idx) => (
                    <li
                      key={idx}
                      className="flex items-start gap-2.5 bg-slate-50 p-3 rounded-xl border border-slate-200 font-medium leading-relaxed"
                    >
                      <span className="font-extrabold text-blue-600 shrink-0 mt-0.5">{idx + 1}.</span>
                      <span>{strat}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 3. 하단 권역별 당첨 커트라인 기준표 (글자 크기 및 여백 확대) */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-4">
        <div className="flex items-center gap-2.5 border-b border-slate-200 pb-4">
          <AlertCircle className="w-6 h-6 text-blue-600 shrink-0" />
          <h3 className="text-lg sm:text-xl font-extrabold text-slate-900">
            서울 주요 정비사업 권역별 당첨 커트라인 기준표 &amp; 부적격 방지 수칙
          </h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm sm:text-base">
            <thead>
              <tr className="bg-slate-100 border-b border-slate-200 text-slate-800 font-extrabold">
                <th className="py-3.5 px-4">권역 구분</th>
                <th className="py-3.5 px-4">대표 정비구역 / 단지</th>
                <th className="py-3.5 px-4 text-center">전용 59㎡ 안정권</th>
                <th className="py-3.5 px-4 text-center">전용 84㎡ 안정권</th>
                <th className="py-3.5 px-4">핵심 특징</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 text-slate-800 font-medium">
              <tr className="hover:bg-slate-50/80 transition-colors">
                <td className="py-3.5 px-4 font-extrabold text-slate-900">강남3구 · 용산 (분상제)</td>
                <td className="py-3.5 px-4">반포·방배·잠실·압구정·한남</td>
                <td className="py-3.5 px-4 text-center font-black text-blue-700">69점+</td>
                <td className="py-3.5 px-4 text-center font-black text-rose-600">72 ~ 74점+</td>
                <td className="py-3.5 px-4 text-xs sm:text-sm text-slate-600">4인 가구 만점(69점) 이상 통장 집중</td>
              </tr>
              <tr className="hover:bg-slate-50/80 transition-colors">
                <td className="py-3.5 px-4 font-extrabold text-slate-900">마용성 · 강동 · 동작</td>
                <td className="py-3.5 px-4">아현·성수·둔촌·흑석·노량진</td>
                <td className="py-3.5 px-4 text-center font-black text-blue-700">62점+</td>
                <td className="py-3.5 px-4 text-center font-black text-blue-700">65 ~ 68점+</td>
                <td className="py-3.5 px-4 text-xs sm:text-sm text-slate-600">비규제 추첨제 60% 병행으로 당첨 기회 확대</td>
              </tr>
              <tr className="hover:bg-slate-50/80 transition-colors">
                <td className="py-3.5 px-4 font-extrabold text-slate-900">서울 동북 · 서남 · 서북권</td>
                <td className="py-3.5 px-4">이문·휘경·신길·북아현·대조</td>
                <td className="py-3.5 px-4 text-center font-black text-emerald-700">54점+</td>
                <td className="py-3.5 px-4 text-center font-black text-emerald-700">58 ~ 62점+</td>
                <td className="py-3.5 px-4 text-xs sm:text-sm text-slate-600">대단지 일반분양 물량 풍부, 실수요 진입 유리</td>
              </tr>
              <tr className="hover:bg-slate-50/80 transition-colors">
                <td className="py-3.5 px-4 font-extrabold text-slate-900">경기 핵심 정비사업</td>
                <td className="py-3.5 px-4">성남 산성·수진, 광명 뉴타운, 과천</td>
                <td className="py-3.5 px-4 text-center font-black text-emerald-700">50점+</td>
                <td className="py-3.5 px-4 text-center font-black text-emerald-700">55 ~ 64점+</td>
                <td className="py-3.5 px-4 text-xs sm:text-sm text-slate-600">당해지역 우선공급 및 수도권 기타지역 배정 체크</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ScoreCalculator;
