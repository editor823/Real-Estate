/**
 * 서울시 정비사업 구역 GeoJSON 및 엔티티 타입 정의 (seoul_data.xlsx 파싱 데이터 반영)
 */

export type BizType = "REDEVELOPMENT" | "RECONSTRUCTION" | "SINTHONG" | "MOA";

export interface DistrictProperties {
  master_uid: string;
  code?: string;
  name: string;
  raw_name?: string;
  gu?: string; // 자치구 (예: 종로구, 강남구 등)
  biz_type: BizType;
  biz_type_label: string;
  stage_code: string;
  stage_seq: number;
  stage_raw?: string; // 엑셀 원본 단계명
  stage_label?: string; // 단계 라벨명 (예: 조합설립 인가)
  sido_sugg_code: string;
  legal_dong: string;
  address_jibun?: string;
  address_doro?: string;
  approval_date: string;
  existing_households?: number; // 기존 가구수(멸실량)
  total_households?: number;    // 건립 세대수 총합계(공급량)
  sale_households?: number;     // 분양 세대수
  rent_households?: number;     // 임대 세대수
  consent_rate: number | null;
  is_transferable: boolean;
  transfer_exemption: string | null;
  is_adjacent_public: boolean;
  adjacent_public_note: string | null;
  source_type: string;
  is_active: boolean;
  centroid: [number, number]; // [lng, lat]
}

export interface DistrictFeature {
  type: "Feature";
  id: string;
  properties: DistrictProperties;
  geometry: {
    type: "Polygon" | "MultiPolygon";
    coordinates: number[][][] | number[][][][];
  };
}

export interface DistrictFeatureCollection {
  type: "FeatureCollection";
  name?: string;
  total_count?: number;
  last_crawled_at?: string;
  crs?: any;
  features: DistrictFeature[];
}
