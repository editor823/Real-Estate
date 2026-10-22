"use client";

import React, { useState } from 'react';
import {
  Building2,
  Award,
  Layers,
} from 'lucide-react';
import { SubscriptionCalendar } from './SubscriptionCalendar';
import { ScoreCalculator } from './ScoreCalculator';

export type FeatureTabId =
  | 'SUBSCRIPTION_CALENDAR'
  | 'SCORE_CALCULATOR';

export interface FeatureHubProps {
  defaultTab?: FeatureTabId;
  className?: string;
}

interface TabConfig {
  id: FeatureTabId;
  label: string;
  shortDesc: string;
  icon: React.ComponentType<{ className?: string }>;
}

const FEATURE_TABS: TabConfig[] = [
  {
    id: 'SUBSCRIPTION_CALENDAR',
    label: '수도권 아파트 청약 캘린더',
    shortDesc: '서울·경기 분양 및 장기전세 일정',
    icon: Building2,
  },
  {
    id: 'SCORE_CALCULATOR',
    label: '청약 가점 계산기',
    shortDesc: '84점 만점 서울 당첨권 정밀 진단',
    icon: Award,
  },
];

export const FeatureHub: React.FC<FeatureHubProps> = ({
  defaultTab = 'SUBSCRIPTION_CALENDAR',
  className = '',
}) => {
  const [activeTab, setActiveTab] = useState<FeatureTabId>(defaultTab);

  return (
    <div className={`w-full max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6 ${className}`}>
      {/* 모듈 상단 헤더 & 통합 탭 스위처 */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-sm">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-lg sm:text-xl font-extrabold text-slate-900 tracking-tight">
                수도권 아파트 분양 & 청약 실전 라운지
              </h1>
              <p className="text-xs text-slate-500">
                서울·경기·인천 재개발·재건축 신축 분양 일정부터 84점 만점 가점 진단까지 100% 부동산 원스톱 지원
              </p>
            </div>
          </div>
          <span className="inline-flex items-center px-3 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200 text-xs font-semibold self-start sm:self-auto">
            부동산 전용 분석 센터
          </span>
        </div>

        {/* 부동산 2대 핵심 기능 탭: [아파트 청약 캘린더] | [청약 가점 계산기] */}
        <nav
          aria-label="청약 도구 탭"
          className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1"
        >
          {FEATURE_TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-3.5 p-4 rounded-xl border text-left transition-all cursor-pointer ${
                  isActive
                    ? 'bg-slate-900 text-white border-slate-900 shadow-md'
                    : 'bg-slate-50/80 text-slate-700 border-slate-200 hover:bg-slate-100 hover:border-slate-300'
                }`}
              >
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                    isActive ? 'bg-white/15 text-white' : 'bg-white text-blue-600 border border-slate-200 shadow-2xs'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-bold truncate">{tab.label}</p>
                  <p
                    className={`text-xs truncate mt-0.5 ${
                      isActive ? 'text-slate-300' : 'text-slate-500'
                    }`}
                  >
                    {tab.shortDesc}
                  </p>
                </div>
              </button>
            );
          })}
        </nav>
      </div>

      {/* 탭별 컨텐츠 전환 렌더링 컨테이너 */}
      <main className="min-h-[560px]">
        {activeTab === 'SUBSCRIPTION_CALENDAR' && (
          <SubscriptionCalendar
            onNavigateToScoreCalc={() => setActiveTab('SCORE_CALCULATOR')}
          />
        )}

        {activeTab === 'SCORE_CALCULATOR' && <ScoreCalculator />}
      </main>
    </div>
  );
};

export default FeatureHub;
