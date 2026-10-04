"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import L from "leaflet";
import { STAGES } from "@/lib/constants/stages";
import { DistrictFeature, DistrictProperties } from "@/lib/types/district";
import { useMapStore } from "@/lib/store/useMapStore";
import { Layers, RotateCcw, MapPin, ZoomIn, ZoomOut } from "lucide-react";

interface InteractiveLeafletMapProps {
  features: DistrictFeature[];
}

// 서울시 25개 자치구 중심 대표 좌표 [위도(lat), 경도(lng)]
const GU_CENTER_COORDS: Record<string, [number, number]> = {
  종로구: [37.573, 126.979],
  중구: [37.5638, 126.9976],
  용산구: [37.5323, 126.9904],
  성동구: [37.5635, 127.0368],
  광진구: [37.5385, 127.0824],
  동대문구: [37.5744, 127.0398],
  중랑구: [37.6063, 127.0928],
  성북구: [37.5894, 127.0167],
  강북구: [37.6398, 127.0255],
  도봉구: [37.6688, 127.0471],
  노원구: [37.6542, 127.0564],
  은평구: [37.6027, 126.9291],
  서대문구: [37.5791, 126.9368],
  마포구: [37.5663, 126.9086],
  양천구: [37.517, 126.8665],
  강서구: [37.551, 126.8495],
  구로구: [37.4954, 126.887],
  금천구: [37.4568, 126.8967],
  영등포구: [37.5264, 126.8963],
  동작구: [37.5124, 126.9392],
  관악구: [37.4784, 126.9515],
  서초구: [37.4837, 127.0324],
  강남구: [37.5172, 127.0473],
  송파구: [37.5145, 127.1058],
  강동구: [37.5301, 127.1238],
};

export default function InteractiveLeafletMap({ features }: InteractiveLeafletMapProps) {
  const mapRef = useRef<L.Map | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const geojsonLayerRef = useRef<L.GeoJSON | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);
  const clusterLayerRef = useRef<L.LayerGroup | null>(null);
  const tileLayerRef = useRef<L.TileLayer | null>(null);

  const { selectedUid, setSelectedUid, setSelectedDistrict, flyToTarget } = useMapStore();
  const [mapTheme, setMapTheme] = useState<"osm" | "positron">("osm");
  const [currentZoom, setCurrentZoom] = useState<number>(12);

  // 무료 오픈 타일 (API 키 불필요)
  const TILE_URLS = {
    osm: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
    positron: "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png",
  };

  // 1. 지도 초기화 (최초 1회 실행)
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const map = L.map(containerRef.current, {
      center: [37.5665, 126.978],
      zoom: 12,
      zoomControl: false,
    });

    const tileLayer = L.tileLayer(TILE_URLS.osm, {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 19,
    }).addTo(map);

    tileLayerRef.current = tileLayer;

    // 클러스터 뱃지용 레이어 그룹 (축소 뷰)
    const clusterGroup = L.layerGroup().addTo(map);
    clusterLayerRef.current = clusterGroup;

    // 개별 구역 마커용 레이어 그룹 (확대 뷰)
    const markersGroup = L.layerGroup().addTo(map);
    markersLayerRef.current = markersGroup;

    // 줌 레벨 변경 감지 이벤트
    map.on("zoomend", () => {
      setCurrentZoom(map.getZoom());
    });

    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  // 2. 테마 전환 (일반 / 다크)
  useEffect(() => {
    if (!mapRef.current || !tileLayerRef.current) return;
    tileLayerRef.current.setUrl(TILE_URLS[mapTheme]);
  }, [mapTheme]);

  // 3. 외부에서 요청된 좌표로 카메라 부드럽게 이동
  useEffect(() => {
    if (!mapRef.current || !flyToTarget) return;
    mapRef.current.flyTo(flyToTarget, 14, { duration: 0.9 });
  }, [flyToTarget]);

  // 4. 자치구별 통계 집계 (클러스터링용)
  const guClusters = useMemo(() => {
    const map = new Map<string, { count: number; totalH: number; lat: number; lng: number }>();

    features.forEach((f) => {
      const gu = f.properties.gu || "기타";
      const totalH = f.properties.total_households || 0;
      const coords = GU_CENTER_COORDS[gu] || [37.5665, 126.978];

      if (!map.has(gu)) {
        map.set(gu, { count: 0, totalH: 0, lat: coords[0], lng: coords[1] });
      }
      const data = map.get(gu)!;
      data.count += 1;
      data.totalH += totalH;
    });

    return Array.from(map.entries()).map(([gu, info]) => ({
      gu,
      count: info.count,
      totalH: info.totalH,
      lat: info.lat,
      lng: info.lng,
    }));
  }, [features]);

  // 5. 줌 레벨에 따른 클러스터링(축소 뷰) vs 개별 마커/폴리곤(확대 뷰) 렌더링
  useEffect(() => {
    if (!mapRef.current) return;
    const map = mapRef.current;

    // 기존 레이어 정리
    if (geojsonLayerRef.current) {
      map.removeLayer(geojsonLayerRef.current);
      geojsonLayerRef.current = null;
    }
    if (markersLayerRef.current) {
      markersLayerRef.current.clearLayers();
    }
    if (clusterLayerRef.current) {
      clusterLayerRef.current.clearLayers();
    }

    if (features.length === 0) return;

    // =========================================================================
    // 모드 A: 지도 축소 레벨 (currentZoom < 13) ➔ 자치구 클러스터링 모드
    // =========================================================================
    if (currentZoom < 13 && clusterLayerRef.current) {
      guClusters.forEach((cluster) => {
        // 자치구 단위 클러스터 뱃지 HTML ('영등포구 18' 등)
        const clusterHtml = `
          <div class="group relative flex items-center justify-center cursor-pointer transition-transform duration-200 hover:scale-110">
            <div class="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white text-slate-800 text-xs font-extrabold shadow-lg border-2 border-blue-500 whitespace-nowrap hover:bg-blue-600 hover:text-white hover:border-blue-600 transition-colors">
              <span class="w-2 h-2 rounded-full bg-blue-500 group-hover:bg-white animate-pulse"></span>
              <span class="tracking-tight">${cluster.gu}</span>
              <span class="px-1.5 py-0.2 rounded-full bg-blue-100 text-blue-700 group-hover:bg-white/20 group-hover:text-white font-black text-[11px]">
                ${cluster.count}
              </span>
            </div>
          </div>
        `;

        const clusterIcon = L.divIcon({
          html: clusterHtml,
          className: "gu-cluster-marker",
          iconSize: [120, 36],
          iconAnchor: [60, 18],
        });

        const marker = L.marker([cluster.lat, cluster.lng], { icon: clusterIcon });

        // 클러스터 클릭 시 해당 자치구로 부드럽게 줌인!
        marker.on("click", () => {
          map.flyTo([cluster.lat, cluster.lng], 14, { duration: 0.8 });
        });

        // 호버 시 자치구 요약 툴팁 표출
        marker.bindTooltip(
          `<strong>${cluster.gu}</strong>: 정비구역 총 ${cluster.count}개소 (공급 ${cluster.totalH.toLocaleString()}세대)`,
          { direction: "top", offset: [0, -18] }
        );

        clusterLayerRef.current?.addLayer(marker);
      });
      return;
    }

    // =========================================================================
    // 모드 B: 지도 확대 레벨 (currentZoom >= 13) ➔ 개별 구역 폴리곤 및 상세 마커
    // =========================================================================
    const createPopupHtml = (props: DistrictProperties, stageHex: string, stageName: string) => {
      const totalH = props.total_households || 0;
      const saleH = props.sale_households || 0;
      const rentH = props.rent_households || 0;
      const existingH = props.existing_households || 0;

      return `
      <div class="p-3.5 max-w-xs text-slate-800 font-sans bg-white">
        <div class="flex items-center gap-1.5 mb-1.5 flex-wrap">
          <span class="text-[10px] font-bold px-1.5 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200">
            ${props.gu || "서울시"}
          </span>
          <span class="text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
            ${props.biz_type_label || props.biz_type}
          </span>
          <span style="background-color: ${stageHex};" class="text-[10px] font-bold px-2 py-0.5 rounded-full text-white shadow-xs">
            ${stageName}
          </span>
        </div>
        
        <h3 class="text-sm font-bold text-slate-900 leading-snug">${props.name}</h3>
        <p class="text-[11px] text-slate-500 mb-2">${props.address_jibun ? props.gu + " " + props.address_jibun : props.legal_dong}</p>
        
        <!-- 건립 세대수 공급량 박스 -->
        <div class="p-2 rounded-xl bg-slate-50 border border-slate-200 mb-2">
          <div class="flex items-center justify-between text-[11px] font-bold text-slate-700 mb-1">
            <span>건립 예정 세대수</span>
            <span class="text-blue-600 font-bold">${totalH > 0 ? totalH.toLocaleString() + " 세대" : "계획중"}</span>
          </div>
          ${
            totalH > 0
              ? `
            <div class="grid grid-cols-3 gap-1 pt-1 border-t border-slate-200 text-[10px] text-center">
              <div><span class="text-slate-400 block">분양</span><strong class="text-slate-700">${saleH.toLocaleString()}</strong></div>
              <div><span class="text-slate-400 block">임대</span><strong class="text-blue-600">${rentH.toLocaleString()}</strong></div>
              <div><span class="text-slate-400 block">기존가구</span><span class="text-slate-600">${existingH > 0 ? existingH.toLocaleString() : "-"}</span></div>
            </div>
          `
              : ""
          }
        </div>

        <div class="grid grid-cols-2 gap-1.5 py-1.5 border-t border-slate-200 text-[11px]">
          <div>
            <span class="text-slate-500">주민동의율:</span>
            <strong class="ml-1 text-slate-800">${props.consent_rate ? props.consent_rate + "%" : "집계중"}</strong>
          </div>
          <div>
            <span class="text-slate-500">지위양도:</span>
            <strong class="ml-1 ${props.is_transferable ? "text-emerald-600" : "text-amber-600"}">
              ${props.is_transferable ? "가능" : "원칙 금지"}
            </strong>
          </div>
        </div>

        ${
          props.transfer_exemption
            ? `<div class="mt-1 text-[10px] text-slate-700 bg-slate-50 p-1.5 rounded border border-slate-200">
                ⚖️ ${props.transfer_exemption}
              </div>`
            : ""
        }
      </div>
      `;
    };


    // GeoJSON 폴리곤 레이어 생성
    const geojsonLayer = L.geoJSON(
      {
        type: "FeatureCollection",
        features: features,
      } as any,
      {
        style: (feature) => {
          const props = feature?.properties as DistrictProperties;
          const stage = STAGES[props.stage_code] || { hex: "#3B82F6" };
          const isSelected = selectedUid === props.master_uid;

          return {
            color: stage.hex,
            weight: isSelected ? 3.5 : 2,
            opacity: 1,
            fillColor: stage.hex,
            fillOpacity: isSelected ? 0.6 : 0.35,
          };
        },
        onEachFeature: (feature, layer) => {
          const props = feature.properties as DistrictProperties;
          const stage = STAGES[props.stage_code] || { hex: "#3B82F6", name: "진행 중" };

          const popupContent = createPopupHtml(props, stage.hex, stage.name);
          layer.bindPopup(popupContent);

          layer.on("click", () => {
            setSelectedUid(props.master_uid);
            setSelectedDistrict(props);
            if (props.centroid) {
              map.flyTo([props.centroid[1], props.centroid[0]], 14, { duration: 0.8 });
            }
          });

          layer.on("mouseover", (e) => {
            const target = e.target as L.Path;
            target.setStyle({ weight: 3.5, fillOpacity: 0.65 });
          });

          layer.on("mouseout", (e) => {
            const target = e.target as L.Path;
            const isSelected = selectedUid === props.master_uid;
            target.setStyle({
              weight: isSelected ? 3.5 : 2,
              fillOpacity: isSelected ? 0.6 : 0.35,
            });
          });

          // 개별 마커 라벨 추가 (확대 뷰에서만 표출)
          if (props.centroid && markersLayerRef.current) {
            const isSelected = selectedUid === props.master_uid;
            const markerHtml = `
              <div class="relative flex items-center justify-center cursor-pointer transition-transform duration-200 hover:scale-110 ${
                isSelected ? "scale-115 ring-2 ring-white ring-offset-2 rounded-full" : ""
              }">
                <div style="background-color: ${stage.hex};" class="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-white text-[11px] font-bold shadow-lg shadow-black/30 border-2 border-white whitespace-nowrap">
                  <span class="w-1.5 h-1.5 rounded-full bg-white animate-pulse"></span>
                  <span>${props.name}</span>
                </div>
              </div>
            `;

            const customIcon = L.divIcon({
              html: markerHtml,
              className: "custom-district-marker",
              iconSize: [120, 32],
              iconAnchor: [60, 16],
            });

            const marker = L.marker([props.centroid[1], props.centroid[0]], { icon: customIcon });
            marker.bindPopup(popupContent);

            marker.on("click", () => {
              setSelectedUid(props.master_uid);
              setSelectedDistrict(props);
              map.flyTo([props.centroid[1], props.centroid[0]], 14, { duration: 0.8 });
            });

            markersLayerRef.current.addLayer(marker);
          }
        },
      }
    ).addTo(map);

    geojsonLayerRef.current = geojsonLayer;
  }, [features, selectedUid, currentZoom, guClusters]);

  // 서울 중심 리셋 핸들러
  const handleResetView = () => {
    if (!mapRef.current) return;
    mapRef.current.flyTo([37.5665, 126.978], 12, { duration: 0.8 });
    setSelectedUid(null);
    setSelectedDistrict(null);
  };

  return (
    <div className="relative w-full h-full min-h-[500px]">
      {/* 1. Leaflet 지도 컨테이너 */}
      <div ref={containerRef} id="leaflet-map" className="w-full h-full select-none" />

      {/* 2. 클러스터링 상태 안내 플로팅 배너 */}
      {currentZoom < 13 && (
        <div className="absolute top-4 left-6 z-[500] px-3.5 py-2 rounded-xl bg-white/95 backdrop-blur-md border border-slate-200 text-slate-800 text-xs font-semibold shadow-md flex items-center gap-2 animate-in fade-in duration-300">
          <span className="w-2 h-2 rounded-full bg-blue-500 animate-ping"></span>
          <span>광역 클러스터 뷰: 자치구 뱃지를 클릭하면 해당 지역으로 확대됩니다.</span>
        </div>
      )}

      {/* 3. 우측 상단 플로팅 지도 컨트롤 */}
      <div className="absolute top-4 right-4 z-[500] flex items-center gap-2">
        <button
          onClick={() => setMapTheme(mapTheme === "osm" ? "positron" : "osm")}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/95 backdrop-blur-md border border-slate-200 shadow-md text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:text-blue-600 transition-all cursor-pointer"
        >
          <Layers className="w-3.5 h-3.5 text-blue-600" />
          <span>{mapTheme === "osm" ? "미니멀 맵" : "일반 맵"}</span>
        </button>

        <button
          onClick={handleResetView}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/95 backdrop-blur-md border border-slate-200 shadow-md text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:text-blue-600 transition-all cursor-pointer"
        >
          <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
          <span>서울 전역</span>
        </button>
      </div>

      {/* 4. 우측 하단 지도 범례 */}
      <div className="absolute bottom-4 right-4 z-[500] p-3 rounded-2xl bg-white/95 backdrop-blur-md border border-slate-200 shadow-xl max-w-xs text-xs">
        <div className="font-bold text-slate-900 mb-2 flex items-center justify-between">
          <span>정비사업 8단계 범례</span>
          <span className="text-[10px] text-slate-500 font-normal">
            {currentZoom < 13 ? "자치구별 클러스터링" : `${features.length}개 구역 표출`}
          </span>
        </div>
        <div className="grid grid-cols-2 gap-x-3 gap-y-1.5 text-[11px]">
          {Object.values(STAGES)
            .slice(0, 8)
            .map((st) => (
              <div key={st.code} className="flex items-center gap-1.5">
                <span
                  style={{ backgroundColor: st.hex }}
                  className="w-2.5 h-2.5 rounded-full shrink-0 shadow-xs"
                />
                <span className="text-slate-600 truncate">{st.name}</span>
              </div>
            ))}
        </div>
      </div>

    </div>
  );
}
