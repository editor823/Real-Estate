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
  SUBSCRIPTION_MOCK_DATA,
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
  const [selectedDealType, setSelectedDealType] = useState<'전체' | DealType>('전체');
  const [selectedRegion, setSelectedRegion] = useState<'전체' | RegionType>('전체');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [expandedId, setExpandedId] = useState<string | null>('apt-seoul-01');

  const filteredItems = useMemo(() => {
    return SUBSCRIPTION_MOCK_DATA.filter((item) => {
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
  }, [selectedDealType, selectedRegion, searchQuery]);

  const summaryStats = useMemo(() => {
    const total = SUBSCRIPTION_MOCK_DATA.length;
    const seoulCount = SUBSCRIPTION_MOCK_DATA.filter((i) => i.region === '서울').length;
    const saleCount = SUBSCRIPTION_MOCK_DATA.filter((i) => i.dealType === '매매').length;
    const jeonseCount = SUBSCRIPTION_MOCK_DATA.filter((i) => i.dealType === '전세').length;
    return { total, seoulCount, saleCount, jeonseCount };
  }, []);

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
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/20 border border-blue-400/30 text-blue-200 text-xs font-semibold mb-2">
              <Sparkles className="w-3.5 h-3.5" />
              수도권 정비사업 · 핵심 분양 모니터링
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

      {/* 분양 일정 반응형 테이블 */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/60">
          <div className="flex items-center gap-2">
            <Building2 className="w-4 h-4 text-blue-600" />
            <h3 className="text-sm font-bold text-slate-800">
              수도권 주요 단지 청약 일정 ({filteredItems.length}건)
            </h3>
          </div>
          <span className="text-xs text-slate-500">행을 클릭하면 정비구역 상세 분석이 펼쳐집니다</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-xs font-semibold text-slate-600 uppercase tracking-wider">
                <th className="py-3.5 px-4">D-Day</th>
                <th className="py-3.5 px-4">구분/지역</th>
                <th className="py-3.5 px-4">단지명 (정비구역)</th>
                <th className="py-3.5 px-4 text-right">분양가 / 전세가</th>
                <th className="py-3.5 px-4">청약 접수일</th>
                <th className="py-3.5 px-4 text-right">예상·실제 경쟁률</th>
                <th className="py-3.5 px-4 text-center">상세</th>
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
                          <p className="text-xs text-slate-500 mt-1">{item.district}</p>
                        </td>
                        <td className="py-4 px-4">
                          <p className="font-bold text-slate-900">{item.complexName}</p>
                          <p className="text-xs text-slate-500 mt-0.5">{item.projectZone}</p>
                        </td>
                        <td className="py-4 px-4 text-right whitespace-nowrap">
                          <p className="font-bold text-slate-900">{item.priceDisplay}</p>
                          <p className="text-xs text-slate-500 mt-0.5">
                            일반공급 {item.generalSupplyHouseholds.toLocaleString()}세대 / 총{' '}
                            {item.totalHouseholds.toLocaleString()}세대
                          </p>
                        </td>
                        <td className="py-4 px-4 whitespace-nowrap">
                          <div className="inline-flex items-center gap-1.5 text-slate-700 font-medium">
                            <Calendar className="w-3.5 h-3.5 text-slate-400" />
                            {item.applicationPeriod}
                          </div>
                          <p className="text-xs text-slate-500 mt-0.5">
                            발표: {item.winnerAnnouncementDate}
                          </p>
                        </td>
                        <td className="py-4 px-4 text-right whitespace-nowrap">
                          <span className="inline-flex items-center gap-1 font-bold text-blue-700">
                            <TrendingUp className="w-3.5 h-3.5" />
                            {item.competitionRate}
                          </span>
                          <p className="text-xs text-slate-500 mt-0.5">
                            안정가점: {item.minSafeScore}점+
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
