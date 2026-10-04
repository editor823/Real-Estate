"use client";

import { useCompareStore } from "@/lib/store/useCompareStore";
import { useMapStore } from "@/lib/store/useMapStore";
import { StageBadge } from "@/components/ui/StageBadge";
import {
  X,
  ArrowLeftRight,
  Home,
  Users,
  ShieldCheck,
  ShieldAlert,
  Clock,
  Sparkles,
  MapPin,
  ExternalLink,
} from "lucide-react";
import { cn } from "@/lib/utils";

export function CompareModal() {
  const { compareList, isModalOpen, setIsModalOpen, removeFromCompare, clearCompare } =
    useCompareStore();
  const { setSelectedUid, setSelectedDistrict } = useMapStore();

  if (!isModalOpen || compareList.length === 0) return null;

  // 예상 입주 연도 계산 도우미 (신통기획은 단축)
  const getProjectedYear = (stageSeq: number, bizType: string) => {
    if (stageSeq >= 8) return "입주 완료";
    const baseDuration = (8 - stageSeq) * 1.5;
    const duration = bizType === "SINTHONG" ? baseDuration * 0.75 : baseDuration;
    return `${Math.round(2026 + Math.max(1, duration))}년`;
  };

  const handleSelectDistrict = (district: any) => {
    setSelectedUid(district.master_uid);
    setSelectedDistrict(district);
    setIsModalOpen(false);
  };

  return (
    <div className="fixed inset-0 z-[900] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl max-h-[90vh] bg-white rounded-3xl shadow-2xl border border-gray-200 overflow-hidden flex flex-col text-gray-900">
        {/* 모달 헤더 */}
        <div className="flex items-center justify-between p-5 border-b border-gray-200 bg-gray-50">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-md shadow-blue-500/30">
              <ArrowLeftRight className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-gray-900 tracking-tight">
                정비사업 구역 1:1 심층 비교 ({compareList.length}개소)
              </h2>
              <p className="text-xs text-gray-500">
                사업성, 진행 속도, 세대수, 입주권 안전성을 한눈에 비교해 보세요.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={clearCompare}
              className="text-xs font-semibold text-gray-500 hover:text-rose-600 px-2 py-1 rounded-lg transition-colors cursor-pointer"
            >
              전체 비우기
            </button>
            <button
              onClick={() => setIsModalOpen(false)}
              className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-xl transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* 비교 테이블 본문 스크롤 */}
        <div className="flex-1 overflow-y-auto p-5 bg-white">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="py-3 px-3 text-xs font-bold text-gray-600 w-32 bg-gray-50 rounded-tl-xl">
                    비교 항목
                  </th>
                  {compareList.map((d) => (
                    <th key={d.master_uid} className="py-3 px-4 min-w-[220px]">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200 mb-1 inline-block">
                            {d.gu}
                          </span>
                          <h3
                            onClick={() => handleSelectDistrict(d)}
                            className="text-sm font-bold text-gray-900 hover:text-blue-600 transition-colors cursor-pointer"
                          >
                            {d.name}
                          </h3>
                        </div>
                        <button
                          onClick={() => removeFromCompare(d.master_uid)}
                          className="text-gray-400 hover:text-rose-600 p-1 rounded-lg transition-colors cursor-pointer"
                          title="비교에서 제외"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 text-xs">
                {/* 1. 사업 유형 */}
                <tr>
                  <td className="py-3 px-3 font-semibold text-gray-600 bg-gray-50/70">사업 유형</td>
                  {compareList.map((d) => (
                    <td key={d.master_uid} className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded-md bg-gray-100 font-semibold text-gray-700 border border-gray-200">
                        {d.biz_type_label}
                      </span>
                    </td>
                  ))}
                </tr>

                {/* 2. 추진 단계 */}
                <tr>
                  <td className="py-3 px-3 font-semibold text-gray-600 bg-gray-50/70">추진 단계</td>
                  {compareList.map((d) => (
                    <td key={d.master_uid} className="py-3 px-4">
                      <StageBadge stageCode={d.stage_code} />
                      <span className="text-[11px] text-gray-400 block mt-1">
                        최근 고시: {d.approval_date}
                      </span>
                    </td>
                  ))}
                </tr>

                {/* 3. 건립 공급 세대수 */}
                <tr>
                  <td className="py-3 px-3 font-semibold text-gray-600 bg-gray-50/70">건립 세대수</td>
                  {compareList.map((d) => {
                    const totalH = d.total_households || 0;
                    return (
                      <td key={d.master_uid} className="py-3 px-4">
                        <strong className="text-sm font-extrabold text-blue-600">
                          {totalH > 0 ? `${totalH.toLocaleString()} 세대` : "계획중"}
                        </strong>
                        {totalH > 0 && (
                          <div className="text-[11px] text-gray-500 mt-0.5 space-x-1">
                            <span>분양 {(d.sale_households || 0).toLocaleString()}</span>
                            <span>•</span>
                            <span>임대 {(d.rent_households || 0).toLocaleString()}</span>
                          </div>
                        )}
                      </td>
                    );
                  })}
                </tr>

                {/* 4. 주민 동의율 */}
                <tr>
                  <td className="py-3 px-3 font-semibold text-gray-600 bg-gray-50/70">주민 동의율</td>
                  {compareList.map((d) => (
                    <td key={d.master_uid} className="py-3 px-4">
                      <div className="flex items-center gap-1.5">
                        <Users className="w-3.5 h-3.5 text-blue-600" />
                        <strong className="text-sm font-bold text-gray-800">
                          {d.consent_rate ? `${d.consent_rate}%` : "집계중"}
                        </strong>
                        {d.consent_rate && d.consent_rate >= 70 && (
                          <span className="text-[10px] text-emerald-800 font-bold bg-emerald-100 border border-emerald-300 px-1.5 py-0.2 rounded">
                            요건충족
                          </span>
                        )}
                      </div>
                    </td>
                  ))}
                </tr>

                {/* 5. 예상 준공/입주 연도 */}
                <tr>
                  <td className="py-3 px-3 font-semibold text-gray-600 bg-gray-50/70">목표 입주</td>
                  {compareList.map((d) => (
                    <td key={d.master_uid} className="py-3 px-4">
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-indigo-600" />
                        <strong className="text-sm font-bold text-indigo-600">
                          {getProjectedYear(d.stage_seq, d.biz_type)}
                        </strong>
                      </div>
                      {d.biz_type === "SINTHONG" && (
                        <span className="text-[10px] text-amber-600 font-semibold mt-0.5 block">
                          ⚡ 신통 패스트트랙
                        </span>
                      )}
                    </td>
                  ))}
                </tr>

                {/* 6. 조합원 지위양도(전매) */}
                <tr>
                  <td className="py-3 px-3 font-semibold text-gray-600 bg-gray-50/70">지위양도</td>
                  {compareList.map((d) => (
                    <td key={d.master_uid} className="py-3 px-4">
                      <div className="flex items-center gap-1.5 mb-1">
                        {d.is_transferable ? (
                          <span className="inline-flex items-center gap-1 text-emerald-800 font-bold bg-emerald-100 border border-emerald-300 px-2 py-0.5 rounded-md">
                            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                            양도 가능
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-rose-800 font-bold bg-rose-100 border border-rose-300 px-2 py-0.5 rounded-md">
                            <ShieldAlert className="w-3.5 h-3.5 text-rose-600" />
                            원칙 금지
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-gray-500 leading-relaxed">
                        {d.transfer_exemption || "예외 규정 없음"}
                      </p>
                    </td>
                  ))}
                </tr>

                {/* 7. 공공호재 및 특수 조항 */}
                <tr>
                  <td className="py-3 px-3 font-semibold text-gray-600 bg-gray-50/70">주변 호재</td>
                  {compareList.map((d) => (
                    <td key={d.master_uid} className="py-3 px-4">
                      {d.is_adjacent_public ? (
                        <div className="p-2 rounded-xl bg-purple-50 text-[11px] text-purple-900 border border-purple-200 flex items-start gap-1.5">
                          <Sparkles className="w-3.5 h-3.5 text-purple-600 shrink-0 mt-0.5" />
                          <span>{d.adjacent_public_note || "대단지 공공기여 및 수변/역세권 연계"}</span>
                        </div>
                      ) : (
                        <span className="text-gray-400 text-xs">일반 정비구역</span>
                      )}
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* 모달 푸터 */}
        <div className="p-4 border-t border-gray-200 bg-gray-50 flex items-center justify-between">
          <span className="text-xs text-gray-500">
            구역명을 클릭하면 해당 위치로 지도가 이동하며 상세 카드가 열립니다.
          </span>
          <button
            onClick={() => setIsModalOpen(false)}
            className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-colors cursor-pointer"
          >
            닫기
          </button>
        </div>
      </div>
    </div>

  );
}
