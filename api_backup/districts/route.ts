import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { DistrictFeatureCollection } from "@/lib/types/district";

/**
 * GET /api/districts
 * 서울시 정비사업 구역 GeoJSON을 필터 조건에 맞추어 반환합니다.
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const bizType = searchParams.get("bizType");
    const minConsent = searchParams.get("minConsent");
    const transferableOnly = searchParams.get("transferableOnly") === "true";

    const filePath = path.join(process.cwd(), "public", "data", "districts.geojson");
    const rawData = fs.readFileSync(filePath, "utf-8");
    const geojsonData: DistrictFeatureCollection = JSON.parse(rawData);

    // 필터링 적용
    let filteredFeatures = geojsonData.features;

    if (bizType && bizType !== "ALL") {
      filteredFeatures = filteredFeatures.filter(
        (f) => f.properties.biz_type === bizType
      );
    }

    if (minConsent) {
      const consentThreshold = parseFloat(minConsent);
      filteredFeatures = filteredFeatures.filter(
        (f) => f.properties.consent_rate !== null && f.properties.consent_rate >= consentThreshold
      );
    }

    if (transferableOnly) {
      filteredFeatures = filteredFeatures.filter(
        (f) => f.properties.is_transferable === true
      );
    }

    return NextResponse.json({
      type: "FeatureCollection",
      features: filteredFeatures,
    });
  } catch (error) {
    console.error("[ERROR] districts API 에러:", error);
    return NextResponse.json(
      { error: "구역 GeoJSON 데이터를 읽어오는 중 에러가 발생했습니다." },
      { status: 500 }
    );
  }
}
