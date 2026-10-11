const fs = require('fs');
const path = require('path');

const csvPath = path.join(__dirname, '..', 'public', '일반정비사업추진현황.csv');
const geojsonPath = path.join(__dirname, '..', 'public', 'data', 'districts.geojson');
const tsPath = path.join(__dirname, '..', 'lib', 'constants', 'districtsData.ts');

if (!fs.existsSync(csvPath)) {
  console.error(`[ERROR] ${csvPath} 파일이 없습니다.`);
  process.exit(1);
}

// 1. 기존 서울 GeoJSON 로드
const originalGeojson = JSON.parse(fs.readFileSync(geojsonPath, 'utf-8'));
const seoulFeatures = originalGeojson.features.filter(f => !f.id.startsWith('GG_RDEV_'));
console.log(`[INFO] 기존 서울 구역 수: ${seoulFeatures.length}개`);

// 2. 경기도 CSV 파싱 (EUC-KR 디코딩)
const buf = fs.readFileSync(csvPath);
const decoder = new TextDecoder('euc-kr');
const text = decoder.decode(buf);
const lines = text.split('\n').filter(l => l.trim().length > 0);

// 경기도 시·군별 중심 좌표
const CITY_CENTROIDS = {
  '수원시': [127.0286, 37.2636],
  '성남시': [127.1378, 37.4200],
  '안양시': [126.9568, 37.3943],
  '부천시': [126.7660, 37.5034],
  '안산시': [126.8308, 37.3219],
  '고양시': [126.8320, 37.6584],
  '광명시': [126.8644, 37.4786],
  '평택시': [127.1128, 36.9921],
  '용인시': [127.1775, 37.2410],
  '남양주시': [127.2165, 37.6360],
  '의정부시': [127.0338, 37.7381],
  '시흥시': [126.8031, 37.3802],
  '군포시': [126.9352, 37.3616],
  '의왕시': [126.9682, 37.3448],
  '하남시': [127.2144, 37.5393],
  '파주시': [126.7808, 37.7600],
  '김포시': [126.7157, 37.6153],
  '구리시': [127.1296, 37.5943],
  '과천시': [126.9877, 37.4292],
  '화성시': [126.8315, 37.1995],
  '동두천시': [127.0607, 37.9036],
  '안성시': [127.2798, 37.0080],
  '오산시': [127.0773, 37.1498],
  '이천시': [127.4429, 37.2723],
};

function formatDate(raw) {
  if (!raw) return null;
  const cleaned = String(raw).trim().replace(/[^0-9]/g, '');
  if (cleaned.length === 8) {
    return `${cleaned.substring(0, 4)}-${cleaned.substring(4, 6)}-${cleaned.substring(6, 8)}`;
  } else if (cleaned.length === 4) {
    return `${cleaned}-01-01`;
  }
  return null;
}

const cityIndexMap = {};
const gyeonggiFeatures = [];

// CSV 각 행 변환
for (let i = 1; i < lines.length; i++) {
  const row = lines[i].split(',');
  const city = (row[0] || '').trim();
  const rawStage = (row[1] || '').trim();
  const rawBizType = (row[2] || '').trim();
  const districtName = (row[3] || '').trim();
  const location = (row[4] || '').trim();

  if (!city || !districtName) continue;

  cityIndexMap[city] = (cityIndexMap[city] || 0) + 1;
  const idx = cityIndexMap[city];

  // 사업 단계 매핑
  let stageSeq = 1;
  let stageCode = 'PLAN_DESIGNATION';
  let stageLabel = '기본계획 / 구역지정';

  if (/준공/.test(rawStage)) {
    stageSeq = 7;
    stageCode = 'COMPLETION';
    stageLabel = '준공 및 입주';
  } else if (/착공/.test(rawStage)) {
    stageSeq = 6;
    stageCode = 'CONSTRUCTION_START';
    stageLabel = '착공 및 공사진행';
  } else if (/관리처분/.test(rawStage)) {
    stageSeq = 5;
    stageCode = 'MGMT_DISPOSAL';
    stageLabel = '관리처분인가';
  } else if (/사업시행/.test(rawStage)) {
    stageSeq = 4;
    stageCode = 'BUSINESS_AUTH';
    stageLabel = '사업시행인가';
  } else if (/조합설립/.test(rawStage)) {
    stageSeq = 3;
    stageCode = 'UNION_AUTH';
    stageLabel = '조합설립인가';
  } else if (/추진위/.test(rawStage)) {
    stageSeq = 2;
    stageCode = 'PROMOTION_COMMITTEE';
    stageLabel = '추진위원회 승인';
  }

  // 사업 유형
  const isRecon = /재건축/.test(rawBizType);
  const bizType = isRecon ? 'RECONSTRUCTION' : 'REDEVELOPMENT';
  const bizTypeLabel = isRecon ? '재건축' : '재개발';

  // 세대수
  const existHouseholds = parseInt((row[8] || '0').replace(/[^0-9]/g, ''), 10) || 0;
  const totalHouseholds = parseInt(parseFloat((row[14] || '0').replace(/[^0-9.]/g, '') || 0), 10) || 0;
  const unionHouseholds = parseInt((row[15] || '0').replace(/[^0-9]/g, ''), 10) || 0;
  const publicHouseholds = parseInt((row[16] || '0').replace(/[^0-9]/g, ''), 10) || 0;
  const rentHouseholds = parseInt((row[17] || '0').replace(/[^0-9]/g, ''), 10) || 0;
  const saleHouseholds = unionHouseholds + publicHouseholds;

  // 인허가 고시일
  const approvalDate =
    formatDate(row[48]) || // 준공
    formatDate(row[46]) || // 착공
    formatDate(row[45]) || // 관리처분
    formatDate(row[44]) || // 사업시행
    formatDate(row[43]) || // 조합설립
    formatDate(row[40]) || // 추진위
    formatDate(row[38]) || // 정비구역지정
    '2024-01-01';

  // 법정동 추출
  let legalDong = city;
  const dongMatch = location.match(/([가-힣0-9]+[동|읍|면])/);
  if (dongMatch) {
    legalDong = `${city} ${dongMatch[1]}`;
  }

  // 좌표 계산 (시·군 중심 기준 골든 스파이럴 오프셋 분산)
  const baseCoord = CITY_CENTROIDS[city] || [127.0, 37.3];
  const angle = idx * 137.5 * (Math.PI / 180);
  const radius = 0.005 + 0.0012 * Math.sqrt(idx); // 약 500m ~ 3km 범위
  const lng = Number((baseCoord[0] + radius * Math.cos(angle)).toFixed(6));
  const lat = Number((baseCoord[1] + (radius * 0.8) * Math.sin(angle)).toFixed(6));

  const delta = 0.0015;
  const polygonCoords = [
    [
      [Number((lng - delta).toFixed(6)), Number((lat + delta).toFixed(6))],
      [Number((lng + delta).toFixed(6)), Number((lat + delta * 0.9).toFixed(6))],
      [Number((lng + delta * 0.8).toFixed(6)), Number((lat - delta).toFixed(6))],
      [Number((lng - delta).toFixed(6)), Number((lat - delta * 0.9).toFixed(6))],
      [Number((lng - delta).toFixed(6)), Number((lat + delta).toFixed(6))],
    ]
  ];

  const uid = `GG_RDEV_${city}_${idx}`;
  const isTransferable = stageSeq < 5;

  const feature = {
    type: 'Feature',
    id: uid,
    properties: {
      master_uid: uid,
      code: `GG_${String(idx).padStart(4, '0')}`,
      name: `${city} ${districtName}`,
      raw_name: districtName,
      gu: city,
      legal_dong: legalDong,
      address_jibun: location || `${city} ${districtName}`,
      address_doro: location,
      biz_type: bizType,
      biz_type_label: bizTypeLabel,
      businessType: bizTypeLabel,
      raw_biz_type: rawBizType,
      isShinTong: false,
      is_shintong: false,
      isMoa: false,
      is_moa: false,
      remark: `경기도 ${city} 정비사업 (${rawStage})`,
      tags: [bizTypeLabel, city],
      stage_code: stageCode,
      stage_seq: stageSeq,
      stage_raw: rawStage || stageLabel,
      stage_label: stageLabel,
      sido_sugg_code: '41000',
      approval_date: approvalDate,
      existing_households: existHouseholds,
      total_households: totalHouseholds,
      sale_households: saleHouseholds,
      rent_households: rentHouseholds,
      consent_rate: 75,
      is_transferable: isTransferable,
      transfer_exemption: isTransferable ? '입주권 승계 안전 구간' : '1세대 1주택 법정 예외 거래 확인 필요',
      is_adjacent_public: false,
      adjacent_public_note: null,
      source_type: 'GYEONGGI_CSV',
      is_active: true,
      centroid: [lng, lat],
    },
    geometry: {
      type: 'Polygon',
      coordinates: polygonCoords,
    }
  };

  gyeonggiFeatures.push(feature);
}

console.log(`[SUCCESS] 경기도 구역 생성 완료: ${gyeonggiFeatures.length}개`);

// 3. 전체 병합 (서울 496개 + 경기도 533개 = 총 1,029개)
const allFeatures = [...seoulFeatures, ...gyeonggiFeatures];
console.log(`[SUCCESS] 총 통합 구역 수: ${allFeatures.length}개`);

const mergedGeojson = {
  type: 'FeatureCollection',
  name: 'seoul_gyeonggi_redevelopment_projects_1029',
  total_count: allFeatures.length,
  crs: {
    type: 'name',
    properties: {
      name: 'urn:ogc:def:crs:OGC:1.3:CRS84'
    }
  },
  features: allFeatures
};

// 4. districts.geojson 저장
fs.writeFileSync(geojsonPath, JSON.stringify(mergedGeojson, null, 2), 'utf-8');
console.log(`[SAVED] ${geojsonPath} 갱신 완료!`);

// 5. districtsData.ts 저장
const tsContent = `import { DistrictFeatureCollection } from "@/lib/types/district";

export const DISTRICTS_GEOJSON: DistrictFeatureCollection = ${JSON.stringify(mergedGeojson, null, 2)};
`;

fs.writeFileSync(tsPath, tsContent, 'utf-8');
console.log(`[SAVED] ${tsPath} 갱신 완료!`);
