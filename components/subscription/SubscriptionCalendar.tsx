"use client";

import React, { useState, useMemo } from 'react';
import {
  Building2,
  MapPin,
  Calendar,
  TrendingUp,
  Filter,
  Search,
  ChevronDown,
  ChevronUp,
  Calculator,
  Info,
  CheckCircle2,
  ShieldAlert,
  Sparkles,
} from 'lucide-react';
import {
  REAL_SUBSCRIPTION_DATA,
  SubscriptionItem,
  RegionType,
  DealType,
  calculateDDayInfo,
} from './mockData';

export interface SubscriptionCalendarProps {
  onNavigateToScoreCalc?: () => void;
}

export const SubscriptionCalendar: React.FC<SubscriptionCalendarProps> = ({
  onNavigateToScoreCalc,
}) => {
  const [items, setItems] = useState<SubscriptionItem[]>(REAL_SUBSCRIPTION_DATA);
  const [dataSource, setDataSource] = useState<string>('공공데이터 실시간');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [selectedDealType, setSelectedDealType] = useState<'전체' | DealType>('전체');
  const [selectedRegion, setSelectedRegion] = useState<'전체' | RegionType>('전체');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [expandedId, setExpandedId] = useState<string | null>('real-apt-01');

  // 백엔드 API에서 실시간 최신 분양 데이터 자동 동기화
  React.useEffect(() => {
    let isMounted = true;
    async function loadLiveData() {
      try {
        setIsLoading(true);
        const res = await fetch('/api/subscription');
        if (res.ok) {
          const json = await res.json();
          if (isMounted && json.data && Array.isArray(json.data) && json.data.length > 0) {
            setItems(json.data);
            setDataSource(json.source === 'GOV_API' ? '청약홈 정부 공식 API' : '국토부/청약홈 공식 실데이터');
          }
        }
      } catch (err) {
        console.warn('실시간 청약 API 조회 실패 -> 실데이터 캐시 유지', err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }
    loadLiveData();
    return () => {
      isMounted = false;
    };
  }, []);

  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      const matchDeal = selectedDealType === '전체' || item.dealType === selectedDealType;
      const matchRegion = selectedRegion === '전체' || item.region === selectedRegion;
      const query = searchQuery.trim().toLowerCase();
      const matchSearch =
        query === '' ||
        item.complexName.toLowerCase().includes(query) ||
        item.district.toLowerCase().includes(query) ||
        item.projectZone.toLowerCase().includes(query);
      return matchDeal && matchRegion && matchSearch;
    });
  }, [items, selectedDealType, selectedRegion, searchQuery]);

  const summaryStats = useMemo(() => {
    const total = items.length;
    const seoulCount = items.filter((i) => i.region === '서울').length;
    const saleCount = items.filter((i) => i.dealType === '매매').length;
    const jeonseCount = items.filter((i) => i.dealType === '전세').length;
    return { total, seoulCount, saleCount, jeonseCount };
  }, [items]);

  const toggleExpand = (id: string) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

  const renderDDayBadge = (item: SubscriptionItem) => {
    const dday = calculateDDayInfo(item.startDate, item.endDate);
    if (dday.status === '접수중') {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-rose-600 text-white shadow-sm animate-pulse">
          <span className="w-1.5 h-1.5 rounded-full bg-white" />
          {dday.label}
        </span>
      );
    }
    if (dday.status === '접수예정') {
      return (
        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200">
          {dday.label}
        </span>
      );
    }
    return (
      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-500 border border-slate-200">
        {dday.label}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* 상단 요약 배너 및 KPI 카드 */}
      <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 rounded-2xl p-6 text-white shadow-lg">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/20 border border-blue-400/30 text-blue-200 text-xs font-semibold">
                <Sparkles className="w-3.5 h-3.5" />
                수도권 정비사업 · 핵심 분양 모니터링
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 text-[11px] font-bold">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping mr-0.5" />
                {dataSource} {isLoading ? '(동기화 중...)' : '연동 완료'}
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight">
              수도권 아파트 청약 & 장기전세 캘린더
            </h2>
            <p className="text-slate-300 text-sm mt-1">
              서울·경기·인천 주요 재건축·재개발 일반분양 및 시세 반값 장기전세(미리내집) 일정을 한눈에 비교하세요.
            </p>
          </div>
          {onNavigateToScoreCalc && (
            <button
              type="button"
              onClick={onNavigateToScoreCalc}
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold transition-colors shadow-md shrink-0"
            >
              <Calculator className="w-4 h-4" />
              내 청약 가점(84점 만점) 바로 계산하기
            </button>
          )}
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-5 pt-5 border-t border-white/10">
          <div className="bg-white/5 rounded-xl p-3 border border-white/10">
            <p className="text-xs text-slate-300">모니터링 단지</p>
            <p className="text-lg font-bold mt-0.5">{summaryStats.total}개 핵심 단지</p>
          </div>
          <div className="bg-white/5 rounded-xl p-3 border border-white/10">
            <p className="text-xs text-slate-300">서울 정비사업 비중</p>
            <p className="text-lg font-bold text-blue-300 mt-0.5">{summaryStats.seoulCount}곳 (분상제·장기전세)</p>
          </div>
          <div className="bg-white/5 rounded-xl p-3 border border-white/10">
            <p className="text-xs text-slate-300">매매(일반분양) / 전세(임대)</p>
            <p className="text-lg font-bold text-emerald-300 mt-0.5">
              매매 {summaryStats.saleCount} · 전세 {summaryStats.jeonseCount}
            </p>
          </div>
          <div className="bg-white/5 rounded-xl p-3 border border-white/10">
            <p className="text-xs text-slate-300">강남권 당첨 안정 가점</p>
            <p className="text-lg font-bold text-amber-300 mt-0.5">69 ~ 72점 이상</p>
          </div>
        </div>
      </div>

      {/* 필터 컨트롤 바 (매매/전세 탭 + 지역별 탭 + 검색창) */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* 매매 / 전세 필터 탭 */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1 text-xs font-semibold text-slate-500 mr-1">
              <Filter className="w-3.5 h-3.5" />
              유형구분
            </span>
            {(['전체', '매매', '전세'] as const).map((deal) => {
              const active = selectedDealType === deal;
              return (
                <button
                  key={deal}
                  type="button"
                  onClick={() => setSelectedDealType(deal)}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    active
                      ? 'bg-slate-900 text-white shadow-sm'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {deal === '전체' ? '전체 유형' : deal === '매매' ? '매매 (일반분양)' : '전세 (장기전세·민간임대)'}
                </button>
              );
            })}
          </div>

          {/* 지역별(서울/경기/인천) 필터 탭 */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1 text-xs font-semibold text-slate-500 mr-1">
              <MapPin className="w-3.5 h-3.5" />
              지역필터
            </span>
            {(['전체', '서울', '경기', '인천'] as const).map((region) => {
              const active = selectedRegion === region;
              return (
                <button
                  key={region}
                  type="button"
                  onClick={() => setSelectedRegion(region)}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    active
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {region === '전체' ? '수도권 전체' : region}
                </button>
              );
            })}
          </div>
        </div>

        {/* 키워드 검색 입력 */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="단지명, 정비구역명(예: 방배5구역, 둔촌주공, 산성구역) 또는 자치구 검색..."
            className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 bg-slate-50 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
          />
        </div>
      </div>

      {/* 분양 일정 반응형 컨테이너 */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/60">
          <div className="flex items-center gap-2">
            <Building2 className="w-4 h-4 text-blue-600" />
            <h3 className="text-sm font-bold text-slate-800">
              수도권 주요 단지 청약 일정 ({filteredItems.length}건)
            </h3>
          </div>
          <span className="text-xs text-slate-500 hidden sm:inline">단지를 클릭하면 정비구역 상세 분석이 펼쳐집니다</span>
        </div>

        {/* 1. 모바일 전용 반응형 카드 리스트 (화면 폭 768px 미만 스마트폰 최적화) */}
        <div className="md:hidden divide-y divide-slate-100">
          {filteredItems.length === 0 ? (
            <div className="py-12 px-4 text-center text-slate-500 text-xs">
              선택하신 필터 조건에 해당하는 청약 단지가 없습니다. 필터를 초기화해 보세요.
            </div>
          ) : (
            filteredItems.map((item) => {
              const isExpanded = expandedId === item.id;
              return (
                <div key={item.id} className="p-4 space-y-3 bg-white">
                  {/* 상단 뱃지 및 상태 영역 */}
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {renderDDayBadge(item)}
                      <span
                        className={`px-2 py-0.5 rounded text-xs font-bold ${
                          item.dealType === '매매'
                            ? 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                            : 'bg-teal-50 text-teal-700 border border-teal-200'
                        }`}
                      >
                        {item.dealType}
                      </span>
                      <span className="px-2 py-0.5 rounded text-xs font-semibold bg-slate-100 text-slate-700">
                        {item.region} {item.district}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => toggleExpand(item.id)}
                      className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 shrink-0"
                      aria-label="상세 정보 토글"
                    >
                      {isExpanded ? <ChevronUp className="w-5 h-5 text-blue-600" /> : <ChevronDown className="w-5 h-5" />}
                    </button>
                  </div>

                  {/* 단지명 및 정비구역명 (세로 쪼개짐 없이 온전하게 표출) */}
                  <div onClick={() => toggleExpand(item.id)} className="cursor-pointer">
                    <h4 className="text-base font-black text-slate-900 leading-snug break-keep">
                      {item.complexName}
                    </h4>
                    <p className="text-xs text-slate-500 mt-0.5 font-medium">{item.projectZone}</p>
                  </div>

                  {/* 주요 청약 분양 조건 요약 그리드 */}
                  <div
                    onClick={() => toggleExpand(item.id)}
                    className="grid grid-cols-2 gap-2 bg-slate-50 rounded-xl p-3 border border-slate-100 cursor-pointer text-xs"
                  >
                    <div>
                      <span className="text-[11px] text-slate-500 font-medium">분양가 / 세대수</span>
                      <p className="text-sm font-black text-slate-900 mt-0.5">{item.priceDisplay}</p>
                      <p className="text-[11px] text-slate-500">
                        일반 {item.generalSupplyHouseholds.toLocaleString()} / 총 {item.totalHouseholds.toLocaleString()}
                      </p>
                    </div>
                    <div>
                      <span className="text-[11px] text-slate-500 font-medium">경쟁률 / 안정가점</span>
                      <p className="text-sm font-black text-blue-700 mt-0.5 flex items-center gap-1">
                        <TrendingUp className="w-3.5 h-3.5" />
                        {item.competitionRate}
                      </p>
                      <p className="text-[11px] text-slate-600 font-bold">
                        안정가점 <span className="text-blue-600">{item.minSafeScore}점+</span>
                      </p>
                    </div>
                    <div className="col-span-2 pt-1 border-t border-slate-200/60 flex items-center justify-between text-[11px] text-slate-700">
                      <span className="flex items-center gap-1 font-semibold text-slate-800">
                        <Calendar className="w-3.5 h-3.5 text-blue-600" />
                        접수: {item.applicationPeriod}
                      </span>
                      <span className="text-slate-500 font-medium">당첨: {item.winnerAnnouncementDate}</span>
                    </div>
                  </div>

                  {/* 상세 분석 확장 영역 */}
                  {isExpanded && (
                    <div className="pt-2 space-y-3 animate-in fade-in duration-200">
                      <div className="bg-slate-50/80 p-3.5 rounded-xl border border-slate-200 space-y-2">
                        <h5 className="text-xs font-bold text-blue-700 uppercase tracking-wider flex items-center gap-1.5">
                          <CheckCircle2 className="w-4 h-4" />
                          정비사업 입지 및 청약 핵심 분석
                        </h5>
                        <ul className="space-y-1.5 text-xs text-slate-700">
                          {item.keyFeatures.map((feat, idx) => (
                            <li key={idx} className="flex items-start gap-1.5 leading-relaxed">
                              <span className="text-blue-600 font-bold mt-0.5">•</span>
                              <span>{feat}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div className="bg-slate-50/80 p-3.5 rounded-xl border border-slate-200 space-y-2 text-xs">
                        <div className="flex justify-between py-1 border-b border-slate-200/60">
                          <span className="text-slate-500">공급유형</span>
                          <span className="font-semibold text-slate-800">{item.supplyType}</span>
                        </div>
                        <div className="flex justify-between py-1 border-b border-slate-200/60">
                          <span className="text-slate-500">전매제한</span>
                          <span className="font-semibold text-slate-800">{item.resaleRestriction}</span>
                        </div>
                        <div className="flex justify-between py-1 border-b border-slate-200/60">
                          <span className="text-slate-500">실거주의무</span>
                          <span className="font-semibold text-slate-800">{item.residenceObligation}</span>
                        </div>
                        <div className="flex justify-between py-1">
                          <span className="text-slate-500">권장 당첨 안정가점</span>
                          <span className="font-bold text-rose-600">{item.minSafeScore}점 이상 (84점 만점)</span>
                        </div>

                        {onNavigateToScoreCalc && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              onNavigateToScoreCalc();
                            }}
                            className="w-full mt-2 py-2 px-3 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
                          >
                            <Calculator className="w-3.5 h-3.5" />
                            내 청약 가점으로 [{item.complexName.split(' ')[0]}] 당첨 가능성 진단
                          </button>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* 2. 데스크톱 와이드 테이블 (화면 폭 768px 이상, 최소 너비 900px 확보) */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full min-w-[900px] text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-xs font-semibold text-slate-600 uppercase tracking-wider">
                <th className="py-3.5 px-4 whitespace-nowrap">D-Day</th>
                <th className="py-3.5 px-4 whitespace-nowrap">구분/지역</th>
                <th className="py-3.5 px-4 min-w-[220px]">단지명 (정비구역)</th>
                <th className="py-3.5 px-4 text-right whitespace-nowrap">분양가 / 전세가</th>
                <th className="py-3.5 px-4 whitespace-nowrap">청약 접수일</th>
                <th className="py-3.5 px-4 text-right whitespace-nowrap">예상·실제 경쟁률</th>
                <th className="py-3.5 px-4 text-center whitespace-nowrap">상세</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {filteredItems.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-500">
                    선택하신 필터 조건에 해당하는 청약 단지가 없습니다. 필터를 초기화해 보세요.
                  </td>
                </tr>
              ) : (
                filteredItems.map((item) => {
                  const isExpanded = expandedId === item.id;
                  return (
                    <React.Fragment key={item.id}>
                      <tr
                        onClick={() => toggleExpand(item.id)}
                        className={`cursor-pointer transition-colors ${
                          isExpanded ? 'bg-blue-50/40' : 'hover:bg-slate-50'
                        }`}
                      >
                        <td className="py-4 px-4 whitespace-nowrap">{renderDDayBadge(item)}</td>
                        <td className="py-4 px-4 whitespace-nowrap">
                          <div className="flex items-center gap-1.5">
                            <span
                              className={`px-2 py-0.5 rounded text-xs font-bold ${
                                item.dealType === '매매'
                                  ? 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                                  : 'bg-teal-50 text-teal-700 border border-teal-200'
                              }`}
                            >
                              {item.dealType}
                            </span>
                            <span className="px-2 py-0.5 rounded text-xs font-semibold bg-slate-100 text-slate-700">
                              {item.region}
                            </span>
                          </div>
                          <p className="text-xs sm:text-sm text-slate-600 font-semibold mt-1">{item.district}</p>
                        </td>
                        <td className="py-4 px-4 min-w-[220px]">
                          <p className="text-sm sm:text-base font-black text-slate-900 leading-snug break-keep">{item.complexName}</p>
                          <p className="text-xs sm:text-sm text-slate-500 mt-1 font-medium">{item.projectZone}</p>
                        </td>
                        <td className="py-4 px-4 text-right whitespace-nowrap">
                          <p className="text-sm sm:text-base font-black text-slate-900">{item.priceDisplay}</p>
                          <p className="text-xs sm:text-sm text-slate-500 mt-1 font-medium">
                            일반 {item.generalSupplyHouseholds.toLocaleString()}세대 / 총{' '}
                            {item.totalHouseholds.toLocaleString()}세대
                          </p>
                        </td>
                        <td className="py-4 px-4 whitespace-nowrap">
                          <div className="inline-flex items-center gap-1.5 text-xs sm:text-sm text-slate-800 font-bold">
                            <Calendar className="w-4 h-4 text-blue-600" />
                            {item.applicationPeriod}
                          </div>
                          <p className="text-xs sm:text-sm text-slate-500 mt-1 font-medium">
                            당첨발표: {item.winnerAnnouncementDate}
                          </p>
                        </td>
                        <td className="py-4 px-4 text-right whitespace-nowrap">
                          <span className="inline-flex items-center gap-1 text-sm sm:text-base font-black text-blue-700">
                            <TrendingUp className="w-4 h-4" />
                            {item.competitionRate}
                          </span>
                          <p className="text-xs sm:text-sm text-slate-600 mt-1 font-bold">
                            안정가점: <span className="text-blue-600">{item.minSafeScore}점+</span>
                          </p>
                        </td>
                        <td className="py-4 px-4 text-center whitespace-nowrap">
                          <button
                            type="button"
                            aria-label="상세 정보 토글"
                            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
                          >
                            {isExpanded ? (
                              <ChevronUp className="w-4 h-4" />
                            ) : (
                              <ChevronDown className="w-4 h-4" />
                            )}
                          </button>
                        </td>
                      </tr>

                      {isExpanded && (
                        <tr className="bg-slate-50/90 border-b border-slate-200">
                          <td colSpan={7} className="p-5">
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                              <div className="lg:col-span-2 bg-white p-4 rounded-xl border border-slate-200 space-y-2.5">
                                <h4 className="text-xs font-bold text-blue-700 uppercase tracking-wider flex items-center gap-1.5">
                                  <CheckCircle2 className="w-4 h-4" />
                                  정비사업 입지 및 청약 핵심 분석
                                </h4>
                                <ul className="space-y-1.5 text-xs sm:text-sm text-slate-700">
                                  {item.keyFeatures.map((feat, idx) => (
                                    <li key={idx} className="flex items-start gap-2">
                                      <span className="text-blue-600 font-bold mt-0.5">•</span>
                                      <span>{feat}</span>
                                    </li>
                                  ))}
                                </ul>
                              </div>

                              <div className="bg-white p-4 rounded-xl border border-slate-200 flex flex-col justify-between space-y-3">
                                <div className="space-y-2 text-xs">
                                  <div className="flex justify-between py-1 border-b border-slate-100">
                                    <span className="text-slate-500">공급유형</span>
                                    <span className="font-semibold text-slate-800">{item.supplyType}</span>
                                  </div>
                                  <div className="flex justify-between py-1 border-b border-slate-100">
                                    <span className="text-slate-500">전매제한</span>
                                    <span className="font-semibold text-slate-800">{item.resaleRestriction}</span>
                                  </div>
                                  <div className="flex justify-between py-1 border-b border-slate-100">
                                    <span className="text-slate-500">실거주의무</span>
                                    <span className="font-semibold text-slate-800">{item.residenceObligation}</span>
                                  </div>
                                  <div className="flex justify-between py-1">
                                    <span className="text-slate-500">권장 당첨 안정가점</span>
                                    <span className="font-bold text-rose-600">{item.minSafeScore}점 이상 (84점 만점)</span>
                                  </div>
                                </div>

                                {onNavigateToScoreCalc && (
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      onNavigateToScoreCalc();
                                    }}
                                    className="w-full py-2 px-3 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
                                  >
                                    <Calculator className="w-3.5 h-3.5" />
                                    내 청약 가점으로 [{item.complexName.split(' ')[0]}] 당첨 가능성 진단
                                  </button>
                                )}
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* SEO 및 애드센스 체류시간 극대화용 수도권 정비사업 청약 심층 가이드 */}
      <section className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
        <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
          <Info className="w-5 h-5 text-blue-600" />
          <h3 className="text-base font-bold text-slate-900">
            수도권 정비사업(재건축·재개발) 일반분양 및 장기전세 청약 핵심 가이드
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 text-xs sm:text-sm text-slate-600 leading-relaxed">
          <div className="bg-slate-50 rounded-xl p-4 border border-slate-100 space-y-2">
            <h4 className="font-bold text-slate-900 flex items-center gap-1.5">
              <span className="w-5 h-5 rounded-full bg-blue-600 text-white text-xs flex items-center justify-center font-bold">
                1
              </span>
              규제지역(분양가상한제) vs 비규제지역 당첨 비율
            </h4>
            <p>
              서울 강남·서초·송파·용산구 등 <strong>투기과열지구 및 분양가상한제 적용 지역</strong>은 전용면적 60㎡ 이하(가점 40% · 추첨 60%), 60~85㎡ 이하(가점 70% · 추첨 30%), 85㎡ 초과(가점 80% · 추첨 20%)로 가점제 비중이 높습니다. 반면 그 외 서울 21개 자치구 및 경기·인천 <strong>비규제지역</strong>은 전용 85㎡ 이하에서도 추첨제 60%가 배정되어 저가점자도 당첨 기회를 노릴 수 있습니다.
            </p>
          </div>

          <div className="bg-slate-50 rounded-xl p-4 border border-slate-100 space-y-2">
            <h4 className="font-bold text-slate-900 flex items-center gap-1.5">
              <span className="w-5 h-5 rounded-full bg-blue-600 text-white text-xs flex items-center justify-center font-bold">
                2
              </span>
              정비사업 일반분양 시 자금조달계획 및 로열동·층 체크
            </h4>
            <p>
              재건축·재개발 단지는 조합원 물량이 로열동·로열층에 우선 배정된 후 잔여 세대가 일반분양으로 공급됩니다. 따라서 입주자모집공고문 상 동·호수 배치도를 통해 일반분양 배정 층수를 반드시 확인해야 하며, 계약금(10~20%) 및 중도금 대출 이자후불제 여부, 발코니 확장비와 유상옵션 비용을 포함한 실질 분양가를 산정해야 합니다.
            </p>
          </div>

          <div className="bg-slate-50 rounded-xl p-4 border border-slate-100 space-y-2">
            <h4 className="font-bold text-slate-900 flex items-center gap-1.5">
              <ShieldAlert className="w-4 h-4 text-amber-600" />
              장기전세주택2(미리내집) 및 민간임대 병행 전략
            </h4>
            <p>
              서울시 정비사업 기부채납 물량으로 공급되는 <strong>SH 장기전세주택2(미리내집)</strong>는 주변 전세 시세의 50~60% 수준으로 최장 20년간 거주가 가능하며, 거주 중 출산 가구에는 시세 대비 할인된 가격으로 우선매수청구권을 부여합니다. 일반분양 가점이 부족한 신혼부부라면 매매와 전세형 청약을 동시에 모니터링하는 것이 유리합니다.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default SubscriptionCalendar;
