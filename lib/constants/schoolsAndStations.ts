/**
 * 수도권 주요 지하철역 및 초·중·고 학군 데이터 & 유틸리티
 */

export interface SchoolItem {
  id: string;
  name: string;
  type: '초등' | '중학' | '고등';
  lat: number;
  lng: number;
  district: string;
}

export interface StationItem {
  id: string;
  name: string;
  line: string;
  lat: number;
  lng: number;
  isGtx?: boolean;
}

// 1. 서울·수도권 주요 환승역 및 핵심 지하철역 대표 데이터셋
export const MAJOR_STATIONS: StationItem[] = [
  // 1호선 ~ 9호선, 신분당선, 수인분당선, GTX 등 주요 거점역
  { id: 'st-01', name: '강남역', line: '2호선·신분당선', lat: 37.4979, lng: 127.0276 },
  { id: 'st-02', name: '역삼역', line: '2호선', lat: 37.5006, lng: 127.0365 },
  { id: 'st-03', name: '선릉역', line: '2호선·수인분당', lat: 37.5045, lng: 127.0490 },
  { id: 'st-04', name: '삼성역', line: '2호선·GTX-A', lat: 37.5088, lng: 127.0632, isGtx: true },
  { id: 'st-05', name: '잠실역', line: '2호선·8호선', lat: 37.5133, lng: 127.1001 },
  { id: 'st-06', name: '잠실나루역', line: '2호선', lat: 37.5207, lng: 127.1038 },
  { id: 'st-07', name: '수서역', line: '3호선·수인분당·SRT·GTX-A', lat: 37.4874, lng: 127.1014, isGtx: true },
  { id: 'st-08', name: '압구정역', line: '3호선', lat: 37.5270, lng: 127.0285 },
  { id: 'st-09', name: '신사역', line: '3호선·신분당선', lat: 37.5164, lng: 127.0202 },
  { id: 'st-10', name: '고속터미널역', line: '3호선·7호선·9호선', lat: 37.5049, lng: 127.0049 },
  { id: 'st-11', name: '서초역', line: '2호선', lat: 37.4919, lng: 127.0079 },
  { id: 'st-12', name: '방배역', line: '2호선', lat: 37.4814, lng: 126.9976 },
  { id: 'st-13', name: '이수역(총신대입구)', line: '4호선·7호선', lat: 37.4862, lng: 126.9818 },
  { id: 'st-14', name: '사당역', line: '2호선·4호선', lat: 37.4765, lng: 126.9816 },
  { id: 'st-15', name: '용산역', line: '1호선·경의중앙·KTX', lat: 37.5299, lng: 126.9648 },
  { id: 'st-16', name: '신용산역', line: '4호선', lat: 37.5292, lng: 126.9685 },
  { id: 'st-17', name: '이촌역', line: '4호선·경의중앙', lat: 37.5222, lng: 126.9739 },
  { id: 'st-18', name: '한남역', line: '경의중앙', lat: 37.5294, lng: 127.0090 },
  { id: 'st-19', name: '이태원역', line: '6호선', lat: 37.5345, lng: 126.9946 },
  { id: 'st-20', name: '서울역', line: '1호선·4호선·공항·GTX-A', lat: 37.5562, lng: 126.9723, isGtx: true },
  { id: 'st-21', name: '시청역', line: '1호선·2호선', lat: 37.5657, lng: 126.9772 },
  { id: 'st-22', name: '종로3가역', line: '1호선·3호선·5호선', lat: 37.5716, lng: 126.9918 },
  { id: 'st-23', name: '동대문역사문화공원역', line: '2호선·4호선·5호선', lat: 37.5656, lng: 127.0090 },
  { id: 'st-24', name: '왕십리역', line: '2호선·5호선·수인분당·경의중앙', lat: 37.5615, lng: 127.0378 },
  { id: 'st-25', name: '성수역', line: '2호선', lat: 37.5446, lng: 127.0559 },
  { id: 'st-26', name: '건대입구역', line: '2호선·7호선', lat: 37.5404, lng: 127.0692 },
  { id: 'st-27', name: '청량리역', line: '1호선·수인분당·경의중앙·GTX-B/C', lat: 37.5801, lng: 127.0448, isGtx: true },
  { id: 'st-28', name: '미아사거리역', line: '4호선', lat: 37.6133, lng: 127.0300 },
  { id: 'st-29', name: '미아역', line: '4호선', lat: 37.6267, lng: 127.0259 },
  { id: 'st-30', name: '수유역', line: '4호선', lat: 37.6380, lng: 127.0257 },
  { id: 'st-31', name: '창동역', line: '1호선·4호선·GTX-C', lat: 37.6532, lng: 127.0477, isGtx: true },
  { id: 'st-32', name: '노원역', line: '4호선·7호선', lat: 37.6560, lng: 127.0633 },
  { id: 'st-33', name: '상계역', line: '4호선', lat: 37.6609, lng: 127.0736 },
  { id: 'st-34', name: '연신내역', line: '3호선·6호선·GTX-A', lat: 37.6190, lng: 126.9210, isGtx: true },
  { id: 'st-35', name: '불광역', line: '3호선·6호선', lat: 37.6108, lng: 126.9298 },
  { id: 'st-36', name: '홍대입구역', line: '2호선·경의중앙·공항', lat: 37.5575, lng: 126.9244 },
  { id: 'st-37', name: '합정역', line: '2호선·6호선', lat: 37.5495, lng: 126.9138 },
  { id: 'st-38', name: '공덕역', line: '5호선·6호선·경의중앙·공항', lat: 37.5445, lng: 126.9515 },
  { id: 'st-39', name: '여의도역', line: '5호선·9호선·신안산선', lat: 37.5216, lng: 126.9242 },
  { id: 'st-40', name: '영등포역', line: '1호선·신안산선', lat: 37.5158, lng: 126.9076 },
  { id: 'st-41', name: '신도림역', line: '1호선·2호선·GTX-B', lat: 37.5088, lng: 126.8912, isGtx: true },
  { id: 'st-42', name: '목동역', line: '5호선', lat: 37.5260, lng: 126.8647 },
  { id: 'st-43', name: '광명사거리역', line: '7호선', lat: 37.4793, lng: 126.8549 },
  { id: 'st-44', name: '철산역', line: '7호선', lat: 37.4764, lng: 126.8681 },
  { id: 'st-45', name: '판교역', line: '신분당선·경강선', lat: 37.3948, lng: 127.1119 },
  { id: 'st-46', name: '인덕원역', line: '4호선·월판선·동탄인덕원선', lat: 37.4019, lng: 126.9769 },
];

// 2. 수도권 주요 초·중·고 학군 데이터셋
export const MAJOR_SCHOOLS: SchoolItem[] = [
  // 강남/서초 학군
  { id: 'sch-01', name: '대치초등학교', type: '초등', lat: 37.4938, lng: 127.0620, district: '강남구' },
  { id: 'sch-02', name: '도곡초등학교', type: '초등', lat: 37.4912, lng: 127.0510, district: '강남구' },
  { id: 'sch-03', name: '압구정초등학교', type: '초등', lat: 37.5312, lng: 127.0322, district: '강남구' },
  { id: 'sch-04', name: '반포초등학교', type: '초등', lat: 37.5028, lng: 126.9982, district: '서초구' },
  { id: 'sch-05', name: '방배초등학교', type: '초등', lat: 37.4855, lng: 126.9928, district: '서초구' },
  { id: 'sch-06', name: '휘문고등학교', type: '고등', lat: 37.5050, lng: 127.0622, district: '강남구' },
  { id: 'sch-07', name: '단국대학교사범대학부속중학교', type: '중학', lat: 37.4950, lng: 127.0588, district: '강남구' },

  // 송파/강동
  { id: 'sch-08', name: '잠실초등학교', type: '초등', lat: 37.5198, lng: 127.1070, district: '송파구' },
  { id: 'sch-09', name: '잠동초등학교', type: '초등', lat: 37.5180, lng: 127.0988, district: '송파구' },
  { id: 'sch-10', name: '한산초등학교', type: '초등', lat: 37.5262, lng: 127.1360, district: '강동구' },
  { id: 'sch-11', name: '둔촌초등학교', type: '초등', lat: 37.5250, lng: 127.1420, district: '강동구' },

  // 용산/성동/마포
  { id: 'sch-12', name: '한남초등학교', type: '초등', lat: 37.5332, lng: 127.0040, district: '용산구' },
  { id: 'sch-13', name: '보광초등학교', type: '초등', lat: 37.5280, lng: 126.9995, district: '용산구' },
  { id: 'sch-14', name: '행당초등학교', type: '초등', lat: 37.5580, lng: 127.0320, district: '성동구' },
  { id: 'sch-15', name: '옥정초등학교', type: '초등', lat: 37.5410, lng: 127.0125, district: '성동구' },
  { id: 'sch-16', name: '아현초등학교', type: '초등', lat: 37.5552, lng: 126.9555, district: '마포구' },
  { id: 'sch-17', name: '염리초등학교', type: '초등', lat: 37.5470, lng: 126.9460, district: '마포구' },

  // 강북/노원/도봉
  { id: 'sch-18', name: '수유초등학교', type: '초등', lat: 37.6320, lng: 127.0180, district: '강북구' },
  { id: 'sch-19', name: '미아초등학교', type: '초등', lat: 37.6185, lng: 127.0245, district: '강북구' },
  { id: 'sch-20', name: '송천초등학교', type: '초등', lat: 37.6145, lng: 127.0270, district: '강북구' },
  { id: 'sch-21', name: '상계초등학교', type: '초등', lat: 37.6580, lng: 127.0680, district: '노원구' },
  { id: 'sch-22', name: '중계초등학교', type: '초등', lat: 37.6500, lng: 127.0780, district: '노원구' },
  { id: 'sch-23', name: '창동초등학교', type: '초등', lat: 37.6495, lng: 127.0420, district: '도봉구' },
  { id: 'sch-24', name: '을지중학교 (은행사거리)', type: '중학', lat: 37.6515, lng: 127.0760, district: '노원구' },

  // 양천/영등포/동작
  { id: 'sch-25', name: '목운초등학교', type: '초등', lat: 37.5255, lng: 126.8745, district: '양천구' },
  { id: 'sch-26', name: '영도초등학교', type: '초등', lat: 37.5320, lng: 126.8690, district: '양천구' },
  { id: 'sch-27', name: '신길초등학교', type: '초등', lat: 37.5050, lng: 126.9150, district: '영등포구' },
  { id: 'sch-28', name: '흑석초등학교', type: '초등', lat: 37.5090, lng: 126.9620, district: '동작구' },
  { id: 'sch-29', name: '노량진초등학교', type: '초등', lat: 37.5120, lng: 126.9420, district: '동작구' },
];

/**
 * 두 좌표 사이의 직선 거리(미터) 계산 (Haversine 공식)
 */
export function calculateDistanceMeters(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const R = 6371e3; // 지구 반경 (미터)
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c);
}

/**
 * 특정 구역 중심 좌표에서 가장 가까운 지하철역 탐색
 */
export function getNearestStation(lat: number, lng: number): {
  station: StationItem;
  distanceMeters: number;
  walkMinutes: number;
  isSuperClose: boolean; // 500m 이내 초역세권 여부
} {
  let nearest = MAJOR_STATIONS[0];
  let minDistance = Infinity;

  MAJOR_STATIONS.forEach((st) => {
    const dist = calculateDistanceMeters(lat, lng, st.lat, st.lng);
    if (dist < minDistance) {
      minDistance = dist;
      nearest = st;
    }
  });

  // 성인 평균 도보 속도: 분당 약 65~70m
  const walkMinutes = Math.max(1, Math.round(minDistance / 67));

  return {
    station: nearest,
    distanceMeters: minDistance,
    walkMinutes,
    isSuperClose: minDistance <= 500,
  };
}

/**
 * 반경 800m 이내의 주변 학교 목록 반환 (초품아 여부 판별)
 */
export function getNearbySchools(
  lat: number,
  lng: number,
  radiusMeters = 800
): {
  school: SchoolItem;
  distanceMeters: number;
  walkMinutes: number;
}[] {
  const nearby: { school: SchoolItem; distanceMeters: number; walkMinutes: number }[] = [];

  MAJOR_SCHOOLS.forEach((sch) => {
    const dist = calculateDistanceMeters(lat, lng, sch.lat, sch.lng);
    if (dist <= radiusMeters) {
      nearby.push({
        school: sch,
        distanceMeters: dist,
        walkMinutes: Math.max(1, Math.round(dist / 65)),
      });
    }
  });

  return nearby.sort((a, b) => a.distanceMeters - b.distanceMeters);
}
