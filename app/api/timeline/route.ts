import { NextResponse } from "next/server";

/**
 * GET /api/timeline
 * 실시간 고시·공고 기반 정비구역 인허가 변경 피드를 반환하는 API 엔드포인트
 */
export async function GET() {
  const events = [
    {
      timeline_id: 1,
      master_uid: "SEOUL_RDEV_11215_01",
      district_name: "자양4동 신속통합기획 1구역",
      previous_stage: "PROMOT_COMM",
      new_stage: "UNION_AUTH",
      stage_seq: 4,
      notice_no: "서울시 광진구 고시 제2026-112호",
      notice_date: "2026-03-28",
      source_type: "NOTICE",
      title: "자양4동 주택재개발정비사업 조합설립인가 고시",
    },
    {
      timeline_id: 2,
      master_uid: "SEOUL_RDEV_11350_02",
      district_name: "상계5동 모아타운 관리지역",
      previous_stage: "CANDIDATE",
      new_stage: "DESIGNATED",
      stage_seq: 2,
      notice_no: "서울시고시 제2026-95호",
      notice_date: "2026-03-24",
      source_type: "NOTICE",
      title: "상계5동 일대 모아타운 관리계획 승인 및 지형도면 고시",
    },
  ];

  return NextResponse.json({
    status: "SUCCESS",
    total: events.length,
    events,
  });
}
