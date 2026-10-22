"use client";

import React, { useState } from 'react';
import {
  TrendingUp,
  Calendar,
  Building,
  AlertTriangle,
  BookOpen,
  ChevronDown,
  ChevronUp,
  Calculator,
  Award,
  Lock,
  Sparkles,
} from 'lucide-react';
import { REAL_IPO_DATA, IpoItem, calculateDDayInfo } from './mockData';

export interface IpoCalendarProps {
  onSelectIpoForCalc?: (ipo: IpoItem) => void;
}

interface AccordionEntry {
  id: string;
  category: '주의사항' | '핵심용어' | '청약전략';
  title: string;
  content: string;
  bulletPoints: string[];
}

const IPO_ACCORDION_DATA: AccordionEntry[] = [
  {
    id: 'acc-1',
    category: '핵심용어',
    title: '균등배정 vs 비례배정 및 기관 수요예측 핵심 용어 완벽 정리',
    content:
      '공모주 일반청약 물량의 50% 이상은 최소 청약 증거금만 납입하면 추첨·균등하게 나누어 주는 [균등배정]으로, 나머지 50% 이하는 납입한 청약 증거금 규모에 비례하여 배정하는 [비례배정] 방식으로 공급됩니다.',
    bulletPoints: [
      '기관 수요예측 경쟁률: 상장 전 기관투자자들이 희망공모가 밴드 내에서 주식을 배정받기 위해 참여한 경쟁률로, 통상 1,000 : 1 이상이면 흥행 청신호로 해석합니다.',
      '의무보유확약 비율: 기관투자자가 배정받은 주식을 상장 후 일정 기간(15일, 1개월, 3개월, 6개월) 동안 팔지 않겠다고 약속한 비율입니다. 확약 비율이 30~40% 이상으로 높을수록 상장 첫날 유통물량 부담이 줄어듭니다.',
      '상장일 가격제한폭 (60% ~ 400%): 신규 상장 종목은 상장 첫날 공모가의 60% ~ 400%(일명 따따블) 범위 내에서 시초가와 장중 가격이 형성됩니다.',
      '청약 증거금률 (50%) 및 환불일: 청약 시 신청 금액의 50%를 증거금으로 납입하며, 배정받지 못한 나머지 증거금은 청약 종료 후 통상 2영업일(주말 포함 시 최대 4일) 뒤 계좌로 자동 환불됩니다.',
    ],
  },
  {
    id: 'acc-2',
    category: '주의사항',
    title: '공모주 청약 전 반드시 확인해야 할 4대 투자 주의사항',
    content:
      '수요예측 경쟁률이 높더라도 확정 공모가가 희망 밴드 상단을 과도하게 초과했거나 구주매출 비중이 높은 경우에는 상장일 시초가 형성 이후 변동성이 크게 확대될 수 있으므로 아래 사항을 반드시 점검해야 합니다.',
    bulletPoints: [
      '중복 청약 전면 금지: 다수의 증권사가 공동 주간사로 참여하더라도 1인당 1개 증권사 계좌로만 청약해야 합니다. 여러 증권사에 중복 청약 시 가장 먼저 접수된 1건만 유효 처리되고 나머지는 취소됩니다.',
      '주간사별 계좌 개설 기한 및 마감 시간 확인: 청약 초일 전일까지 비대면 계좌 개설을 완료해야 청약이 가능한 증권사가 많으며, 청약 마감일에는 오후 4시(16:00) 정각에 마감되므로 시간 엄수가 필수입니다.',
      '환불일 주말·공휴일 경유에 따른 이자 비용 리스크: 목~금요일에 청약을 진행해 월~화요일에 환불되는 일정은 4일간 마이너스 통장 또는 파킹통장 이자 비용이 발생하므로 비례배정 실익 계산기를 통해 손익분기점을 먼저 계산해야 합니다.',
      '상장 직후 유통가능물량 비중 확인: 전체 상장주식 수 대비 상장 당일 즉시 매도 가능한 물량(기존 주주 물량 + 미확약 기관 물량)이 35%를 초과하면 오버행(잠재적 매도물량) 압력이 커질 수 있습니다.',
    ],
  },
  {
    id: 'acc-3',
    category: '청약전략',
    title: '소액 투자자(균등) vs 고액 자산가(비례) 맞춤형 공모주 실전 전략',
    content:
      '투자 가용 자금 규모와 주간사별 배정 물량에 따라 균등배정 실속 전략과 비례배정 레버리지 전략을 구분하여 접근하면 리스크 대비 확정 수익률을 높일 수 있습니다.',
    bulletPoints: [
      '소액 투자자 (균등 1주 노리기): 공동 주간사 중 배정 물량이 적더라도 청약 계좌 수가 현저히 적은 인수회사나 중소형 주간사를 선택하면 균등배정 추첨 확률을 높일 수 있습니다.',
      '비례배정 투자자 (5사6입 법칙 활용): 다수 증권사는 비례배정 시 0.5주 이상 단수를 반올림(5사6입)하여 배정하므로, 1주 배정 기준 증거금의 0.6배 또는 1.6배 구간에 맞추어 증거금을 투입하면 자금 효율성이 극대화됩니다.',
      '청약 수수료 면제 등급 활용: 일반 온라인 청약 시 통상 2,000원의 청약 수수료가 부과되나, 우대 등급 또는 파킹통장 연계 계좌를 활용하면 수수료를 아껴 균등 1주 수익률을 보전할 수 있습니다.',
    ],
  },
];

export const IpoCalendar: React.FC<IpoCalendarProps> = ({ onSelectIpoForCalc }) => {
  const [ipos, setIpos] = useState<IpoItem[]>(REAL_IPO_DATA);
  const [dataSource, setDataSource] = useState<string>('한국거래소/공시 실데이터');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [marketFilter, setMarketFilter] = useState<'ALL' | 'KOSPI' | 'KOSDAQ'>('ALL');
  const [openAccordions, setOpenAccordions] = useState<string[]>(['acc-1', 'acc-2']);

  // 백엔드 API에서 실시간 공모주 일정 데이터 자동 동기화
  React.useEffect(() => {
    let isMounted = true;
    async function loadLiveIpos() {
      try {
        setIsLoading(true);
        const res = await fetch('/api/ipo');
        if (res.ok) {
          const json = await res.json();
          if (isMounted && json.data && Array.isArray(json.data) && json.data.length > 0) {
            setIpos(json.data);
            setDataSource(json.source === 'GOV_API' ? '전자공시(DART) 공식 API' : '한국거래소/공시 공식 실데이터');
          }
        }
      } catch (err) {
        console.warn('실시간 IPO API 조회 실패 -> 실데이터 캐시 유지', err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }
    loadLiveIpos();
    return () => {
      isMounted = false;
    };
  }, []);

  const filteredIpos = ipos.filter(
    (ipo) => marketFilter === 'ALL' || ipo.market === marketFilter
  );

  const toggleAccordion = (id: string) => {
    setOpenAccordions((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const renderDDayBadge = (ipo: IpoItem) => {
    const dday = calculateDDayInfo(ipo.startDate, ipo.endDate);
    if (dday.status === '접수중') {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-600 text-white shadow-sm">
          <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
          {dday.label}
        </span>
      );
    }
    if (dday.status === '접수예정') {
      return (
        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
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
      {/* 상단 헤더 배너 */}
      <div className="bg-gradient-to-r from-indigo-950 via-slate-900 to-indigo-950 rounded-2xl p-6 text-white shadow-lg">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-indigo-200 text-xs font-semibold">
                <Sparkles className="w-3.5 h-3.5" />
                정비사업 대기자금 · 단기 유동성 운용 파트너
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 text-[11px] font-bold">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping mr-0.5" />
                {dataSource} {isLoading ? '(동기화 중...)' : '연동 완료'}
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight">
              공모주(IPO) 청약 일정 & 기관 수요예측 캘린더
            </h2>
            <p className="text-slate-300 text-sm mt-1">
              아파트 청약 계약금·중도금 대기 자금을 활용한 공모주 균등·비례배정 핵심 일정을 확인하세요.
            </p>
          </div>

          <div className="flex items-center gap-2 bg-white/10 p-1.5 rounded-xl border border-white/10 self-start">
            {(['ALL', 'KOSPI', 'KOSDAQ'] as const).map((mkt) => (
              <button
                key={mkt}
                type="button"
                onClick={() => setMarketFilter(mkt)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  marketFilter === mkt
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                {mkt === 'ALL' ? '전체 시장' : mkt}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 공모주 일정 테이블 */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 flex flex-wrap items-center justify-between gap-2 bg-slate-50/60">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-indigo-600" />
            <h3 className="text-sm font-bold text-slate-800">
              이달의 주요 공모주 청약 리스트 ({filteredIpos.length}종목)
            </h3>
          </div>
          <span className="text-xs text-slate-500">
            우측 [실익 계산] 버튼을 누르면 해당 종목 공모가가 계산기에 자동 입력됩니다
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-xs font-semibold text-slate-600 uppercase tracking-wider">
                <th className="py-3.5 px-4">D-Day</th>
                <th className="py-3.5 px-4">종목명 (시장/섹터)</th>
                <th className="py-3.5 px-4 text-right">확정공모가 (희망밴드)</th>
                <th className="py-3.5 px-4">대표 주간사</th>
                <th className="py-3.5 px-4">청약일 / 환불일</th>
                <th className="py-3.5 px-4 text-right">기관경쟁률 / 확약</th>
                <th className="py-3.5 px-4 text-center">비례 실익 계산</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {filteredIpos.map((ipo) => (
                <tr key={ipo.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-4 px-4 whitespace-nowrap">{renderDDayBadge(ipo)}</td>
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-2">
                      <span
                        className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                          ipo.market === 'KOSPI'
                            ? 'bg-blue-50 text-blue-700 border border-blue-200'
                            : 'bg-purple-50 text-purple-700 border border-purple-200'
                        }`}
                      >
                        {ipo.market}
                      </span>
                      <span className="font-bold text-slate-900">{ipo.companyName}</span>
                    </div>
                    <p className="text-xs text-slate-500 mt-1">{ipo.sector}</p>
                    <p className="text-xs text-slate-600 mt-1 line-clamp-1">{ipo.summary}</p>
                  </td>
                  <td className="py-4 px-4 text-right whitespace-nowrap">
                    <p className="font-bold text-slate-900 text-base">{ipo.offeringPriceDisplay}</p>
                    <p className="text-xs text-slate-500 mt-0.5">밴드: {ipo.desiredPriceBand}</p>
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex flex-wrap gap-1">
                      {ipo.underwriters.map((uw) => (
                        <span
                          key={uw}
                          className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-xs font-medium"
                        >
                          <Building className="w-3 h-3 text-slate-400" />
                          {uw}
                        </span>
                      ))}
                    </div>
                    <p className="text-xs text-slate-500 mt-1">
                      균등배정: {ipo.equalAllocationEstShares} (최소 {ipo.minSubscriptionShares}주)
                    </p>
                  </td>
                  <td className="py-4 px-4 whitespace-nowrap">
                    <div className="inline-flex items-center gap-1.5 font-medium text-slate-800">
                      <Calendar className="w-3.5 h-3.5 text-indigo-500" />
                      {ipo.subscriptionPeriod}
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">
                      환불: {ipo.refundDate} ({ipo.refundDays}일 소요) · 상장: {ipo.listingDate}
                    </p>
                  </td>
                  <td className="py-4 px-4 text-right whitespace-nowrap">
                    <div className="inline-flex items-center gap-1 font-bold text-indigo-700">
                      <Award className="w-3.5 h-3.5" />
                      {ipo.institutionalCompetitionRate}
                    </div>
                    <p className="text-xs text-emerald-700 font-semibold mt-0.5 flex items-center justify-end gap-1">
                      <Lock className="w-3 h-3" />
                      확약 {ipo.lockupRatio}
                    </p>
                  </td>
                  <td className="py-4 px-4 text-center whitespace-nowrap">
                    {onSelectIpoForCalc ? (
                      <button
                        type="button"
                        onClick={() => onSelectIpoForCalc(ipo)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-600 text-indigo-700 hover:text-white text-xs font-bold border border-indigo-200 transition-all"
                      >
                        <Calculator className="w-3.5 h-3.5" />
                        실익 계산
                      </button>
                    ) : (
                      <span className="text-xs text-slate-400">-</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 투자 주의사항 및 공모주 기본 용어 안내 아코디언 (SEO / 애드센스 텍스트 영역) */}
      <section className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-4">
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-indigo-600" />
            <div>
              <h3 className="text-base font-bold text-slate-900">
                공모주 투자 주의사항 및 필수 기본 용어 가이드
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                초보 투자자부터 비례배정 고액 투자자까지 반드시 숙지해야 할 핵심 체크리스트
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() =>
              setOpenAccordions(
                openAccordions.length === IPO_ACCORDION_DATA.length
                  ? []
                  : IPO_ACCORDION_DATA.map((a) => a.id)
              )
            }
            className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 self-start sm:self-auto"
          >
            {openAccordions.length === IPO_ACCORDION_DATA.length ? '모두 접기' : '모두 펼치기'}
          </button>
        </div>

        <div className="space-y-3">
          {IPO_ACCORDION_DATA.map((acc) => {
            const isOpen = openAccordions.includes(acc.id);
            return (
              <div
                key={acc.id}
                className="rounded-xl border border-slate-200 overflow-hidden transition-all"
              >
                <button
                  type="button"
                  onClick={() => toggleAccordion(acc.id)}
                  className="w-full px-5 py-4 bg-slate-50/70 hover:bg-slate-100/70 flex items-center justify-between text-left transition-colors"
                >
                  <div className="flex items-center gap-2.5">
                    <span
                      className={`px-2.5 py-0.5 rounded-md text-xs font-bold ${
                        acc.category === '주의사항'
                          ? 'bg-amber-100 text-amber-800'
                          : acc.category === '핵심용어'
                          ? 'bg-indigo-100 text-indigo-800'
                          : 'bg-emerald-100 text-emerald-800'
                      }`}
                    >
                      {acc.category}
                    </span>
                    <span className="font-bold text-slate-900 text-sm sm:text-base">
                      {acc.title}
                    </span>
                  </div>
                  {isOpen ? (
                    <ChevronUp className="w-4 h-4 text-slate-500 shrink-0" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-slate-500 shrink-0" />
                  )}
                </button>

                {isOpen && (
                  <div className="p-5 bg-white border-t border-slate-100 space-y-3 text-xs sm:text-sm text-slate-600 leading-relaxed">
                    <p className="font-medium text-slate-800 bg-slate-50 p-3.5 rounded-lg border border-slate-100">
                      {acc.content}
                    </p>
                    <ul className="space-y-2 pl-1">
                      {acc.bulletPoints.map((pt, index) => {
                        const [boldTitle, ...rest] = pt.split(':');
                        return (
                          <li key={index} className="flex items-start gap-2">
                            <AlertTriangle className="w-4 h-4 text-indigo-500 shrink-0 mt-0.5" />
                            <span>
                              <strong className="text-slate-900">{boldTitle}:</strong>
                              {rest.join(':')}
                            </span>
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
};

export default IpoCalendar;
