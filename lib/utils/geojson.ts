/**
 * 공간 데이터(GeoJSON) 처리 및 변환 유틸리티
 */

export interface DistrictFeatureProperties {
  master_uid: string;
  name: string;
  biz_type: "REDEVELOPMENT" | "RECONSTRUCTION" | "SINTHONG" | "MOA";
  stage_code: string;
  stage_seq: number;
  consent_rate: number | null;
  is_transferable: boolean;
  transfer_exemption: string | null;
  is_adjacent_public: boolean;
  approval_date: string | null;
}

export interface BoundingBox {
  minLon: number;
  minLat: number;
  maxLon: number;
  maxLat: number;
}

/**
 * 지도 bounds 객체로부터 [minLon, minLat, maxLon, maxLat] 형식의 BBox를 추출합니다.
 */
export function formatBBox(bounds: {
  getWest: () => number;
  getSouth: () => number;
  getEast: () => number;
  getNorth: () => number;
}): BoundingBox {
  return {
    minLon: bounds.getWest(),
    minLat: bounds.getSouth(),
    maxLon: bounds.getEast(),
    maxLat: bounds.getNorth(),
  };
}
