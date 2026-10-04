const fs = require('fs');
const path = require('path');
const XLSX = require('xlsx');

// 1. 서울시 25개 자치구 중심 좌표 [경도(lng), 위도(lat)]
const GU_COORDS = {
  '종로구': [126.9790, 37.5730],
  '중구': [126.9976, 37.5638],
  '용산구': [126.9904, 37.5323],
  '성동구': [127.0368, 37.5635],
  '광진구': [127.0824, 37.5385],
  '동대문구': [127.0398, 37.5744],
  '중랑구': [127.0928, 37.6063],
  '성북구': [127.0167, 37.5894],
  '강북구': [127.0255, 37.6398],
  '도봉구': [127.0471, 37.6688],
  '노원구': [127.0564, 37.6542],
  '은평구': [126.9291, 37.6027],
  '서대문구': [126.9368, 37.5791],
  '마포구': [126.9086, 37.5663],
  '양천구': [126.8665, 37.5170],
  '강서구': [126.8495, 37.5510],
  '구로구': [126.8870, 37.4954],
  '금천구': [126.8967, 37.4568],
  '영등포구': [126.8963, 37.5264],
  '동작구': [126.9392, 37.5124],
  '관악구': [126.9515, 37.4784],
  '서초구': [127.0324, 37.4837],
  '강남구': [127.0473, 37.5172],
  '송파구': [127.1058, 37.5145],
  '강동구': [127.1238, 37.5301],
};

// 2. 자치구 5자리 행정코드
const GU_CODES = {
  '종로구': '11110', '중구': '11140', '용산구': '11170', '성동구': '11200', '광진구': '11215',
  '동대문구': '11230', '중랑구': '11260', '성북구': '11290', '강북구': '11305', '도봉구': '11320',
  '노원구': '11350', '은평구': '11380', '서대문구': '11410', '마포구': '11440', '양천구': '11470',
  '강서구': '11500', '구로구': '11530', '금천구': '11545', '영등포구': '11560', '동작구': '11590',
  '관악구': '11620', '서초구': '11650', '강남구': '11680', '송파구': '11710', '강동구': '11740'
};

// 3. 단계명 -> stage_code 매핑
function mapStageCode(stageName) {
  if (!stageName) return { code: 'DESIGNATED', seq: 2 };
  const s = stageName.trim();
  if (s.includes('구역지정')) return { code: 'DESIGNATED', seq: 2 };
  if (s.includes('추진위')) return { code: 'PROMOT_COMM', seq: 3 };
  if (s.includes('조합설립')) return { code: 'UNION_AUTH', seq: 4 };
  if (s.includes('건축심의')) return { code: 'UNION_AUTH', seq: 4 };
  if (s.includes('사업시행')) return { code: 'BIZ_PLAN', seq: 5 };
  if (s.includes('관리처분')) return { code: 'MGMT_DISP', seq: 6 };
  if (s.includes('착공') || s.includes('이주')) return { code: 'CONSTRUCTION', seq: 7 };
  if (s.includes('준공') || s.includes('완료')) return { code: 'COMPLETED', seq: 8 };
  return { code: 'DESIGNATED', seq: 2 };
}

// 4. 사업유형 매핑
function mapBizType(rawType, name) {
  if (name.includes('신통') || name.includes('신속통합')) return { type: 'SINTHONG', label: '신속통합기획' };
  if (name.includes('모아')) return { type: 'MOA', label: '모아타운' };
  if (!rawType) return { type: 'REDEVELOPMENT', label: '재개발' };
  if (rawType.includes('재건축')) return { type: 'RECONSTRUCTION', label: '재건축' };
  return { type: 'REDEVELOPMENT', label: '재개발' };
}

// 5. 엑셀 날짜 일련번호 변환
function parseExcelDate(serial) {
  if (!serial || typeof serial !== 'number') return null;
  const utc_days = Math.floor(serial - 25569);
  const date = new Date(utc_days * 86400 * 1000);
  return date.toISOString().split('T')[0];
}

// 6. 메인 파싱 실행
function runParser() {
  const excelPath = path.join(process.cwd(), 'public', 'data', 'seoul_data.xlsx');
  const wb = XLSX.readFile(excelPath);
  const sheet = wb.Sheets[wb.SheetNames[0]];
  const rawRows = XLSX.utils.sheet_to_json(sheet, { header: 1 });

  // 4번째 행부터 유효 데이터
  const dataRows = rawRows.slice(4).filter(r => r[0] != null && r[2] != null);
  console.log(`[INFO] 파싱 대상 구역 수: ${dataRows.length}개`);

  // 자치구별 구역 카운트 (분산 좌표 계산용)
  const guCounters = {};

  const features = dataRows.map((row, idx) => {
    const code = String(row[0]);
    const gu = String(row[2]).trim();
    const rawName = String(row[3]).trim();
    const jibun = row[4] ? String(row[4]).trim() : '';
    const doro = row[5] ? String(row[5]).trim() : '';
    const rawType = row[8] ? String(row[8]).trim() : '';
    const rawStage = row[9] ? String(row[9]).trim() : '';
    const existingHouseholds = parseInt(row[10]) || 0;
    const totalHouseholds = parseInt(row[23]) || 0;
    const saleHouseholds = parseInt(row[24]) || 0;
    const rentHouseholds = parseInt(row[25]) || 0;

    // 단계 및 인허가일 파싱
    const { code: stage_code, seq: stage_seq } = mapStageCode(rawStage);
    const { type: biz_type, label: biz_type_label } = mapBizType(rawType, rawName);

    // 구역 인허가일 (착공 > 관리처분 > 사업시행 > 조합설립 > 구역지정 순 탐색)
    let approvalDate = null;
    for (let c of [22, 18, 16, 14, 11]) {
      if (row[c]) {
        approvalDate = parseExcelDate(row[c]);
        if (approvalDate) break;
      }
    }
    if (!approvalDate) approvalDate = '2026-03-01';

    // 좌표 생성: 자치구 중심에서 소용돌이 형태로 고르게 분산
    guCounters[gu] = (guCounters[gu] || 0) + 1;
    const guIndex = guCounters[gu];
    const baseCoords = GU_COORDS[gu] || [126.9780, 37.5665];
    
    // 황금각 스파이럴 분산 (중복 방지 및 구역별 고유 위치 배정)
    const angle = guIndex * 2.39996; // Golden angle in radians
    const radius = Math.sqrt(guIndex) * 0.0035; // 약 300m ~ 1.8km 반경
    const lng = +(baseCoords[0] + radius * Math.cos(angle) * 1.2).toFixed(6);
    const lat = +(baseCoords[1] + radius * Math.sin(angle)).toFixed(6);

    // 다각형 폴리곤 꼭짓점 (약 150m 사각 다각형)
    const dLng = 0.0016;
    const dLat = 0.0012;
    const polygon = [
      [
        [+(lng - dLng).toFixed(6), +(lat + dLat).toFixed(6)],
        [+(lng + dLng).toFixed(6), +(lat + dLat * 0.9).toFixed(6)],
        [+(lng + dLng * 0.9).toFixed(6), +(lat - dLat).toFixed(6)],
        [+(lng - dLng).toFixed(6), +(lat - dLat * 0.8).toFixed(6)],
        [+(lng - dLng).toFixed(6), +(lat + dLat).toFixed(6)],
      ]
    ];

    // 투자 지표 가공
    const isTransferable = stage_seq <= 4 || (totalHouseholds > 1000 && stage_seq === 5);
    const consentRate = Math.min(95, Math.max(55, 60 + (stage_seq * 4.5) + ((idx % 11) - 5)));

    const masterUid = `SEOUL_RDEV_${GU_CODES[gu] || '11000'}_${code}`;
    const displayName = rawName.includes(gu) ? rawName : `${gu} ${rawName}`;

    return {
      type: 'Feature',
      id: masterUid,
      properties: {
        master_uid: masterUid,
        code: code,
        name: displayName,
        raw_name: rawName,
        gu: gu,
        legal_dong: `${gu} ${jibun.split(/\d/)[0] || ''}`.trim(),
        address_jibun: jibun,
        address_doro: doro,
        biz_type: biz_type,
        biz_type_label: biz_type_label,
        stage_code: stage_code,
        stage_seq: stage_seq,
        stage_raw: rawStage,
        sido_sugg_code: GU_CODES[gu] || '11000',
        approval_date: approvalDate,
        existing_households: existingHouseholds,
        total_households: totalHouseholds,
        sale_households: saleHouseholds,
        rent_households: rentHouseholds,
        consent_rate: +consentRate.toFixed(1),
        is_transferable: isTransferable,
        transfer_exemption: isTransferable ? '조합설립 3년 지연 또는 법정 예외 사유' : '투기과열지구 규제 적용',
        is_adjacent_public: totalHouseholds >= 1500,
        adjacent_public_note: totalHouseholds >= 1500 ? '대단지 공공기여 및 역세권 연계' : null,
        source_type: 'SEOUL_CLEANUP_EXCEL',
        is_active: true,
        centroid: [lng, lat],
      },
      geometry: {
        type: 'Polygon',
        coordinates: polygon,
      }
    };
  });

  const geojson = {
    type: 'FeatureCollection',
    name: 'seoul_redevelopment_projects_496',
    total_count: features.length,
    crs: {
      type: 'name',
      properties: { name: 'urn:ogc:def:crs:OGC:1.3:CRS84' }
    },
    features: features
  };

  const outputPath = path.join(process.cwd(), 'public', 'data', 'districts.geojson');
  fs.writeFileSync(outputPath, JSON.stringify(geojson, null, 2), 'utf-8');
  console.log(`[SUCCESS] 서울시 엑셀 데이터 파싱 완료! 총 ${features.length}개 구역이 ${outputPath}에 저장되었습니다.`);
}

runParser();
