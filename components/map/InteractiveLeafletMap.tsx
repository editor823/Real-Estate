"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import L from "leaflet";
import { STAGES } from "@/lib/constants/stages";
import { DistrictFeature, DistrictProperties } from "@/lib/types/district";
import { useMapStore } from "@/lib/store/useMapStore";
import { Layers, RotateCcw, MapPin, ZoomIn, ZoomOut, GraduationCap, Train } from "lucide-react";
import { MAJOR_SCHOOLS, MAJOR_STATIONS } from "@/lib/constants/schoolsAndStations";

interface InteractiveLeafletMapProps {
  features: DistrictFeature[];
}

// 수도권(서울 25개 자치구 + 경기도 24개 시·군) 중심 대표 좌표 [위도(lat), 경도(lng)]
const GU_CENTER_COORDS: Record<string, [number, number]> = {
  // 서울 25개 구
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
  // 경기도 24개 시·군
  수원시: [37.2636, 127.0286],
  성남시: [37.4200, 127.1378],
  안양시: [37.3943, 126.9568],
  부천시: [37.5034, 126.7660],
  안산시: [37.3219, 126.8308],
  고양시: [37.6584, 126.8320],
  광명시: [37.4786, 126.8644],
  평택시: [36.9921, 127.1128],
  용인시: [37.2410, 127.1775],
  남양주시: [37.6360, 127.2165],
  의정부시: [37.7381, 127.0338],
  시흥시: [37.3802, 126.8031],
  군포시: [37.3616, 126.9352],
  의왕시: [37.3448, 126.9682],
  하남시: [37.5393, 127.2144],
  파주시: [37.7600, 126.7808],
  김포시: [37.6153, 126.7157],
  구리시: [37.5943, 127.1296],
  과천시: [37.4292, 126.9877],
  화성시: [37.1995, 126.8315],
  동두천시: [37.9036, 127.0607],
  안성시: [37.0080, 127.2798],
  오산시: [37.1498, 127.0773],
  이천시: [37.2723, 127.4429],
};

export default function InteractiveLeafletMap({ features }: InteractiveLeafletMapProps) {
  const mapRef = useRef<L.Map | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const geojsonLayerRef = useRef<L.GeoJSON | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);
  const clusterLayerRef = useRef<L.LayerGroup | null>(null);
  const tileLayerRef = useRef<L.TileLayer | null>(null);
  const schoolsLayerRef = useRef<L.LayerGroup | null>(null);
  const walkRadiusLayerRef = useRef<L.LayerGroup | null>(null);

  // 구역 선택 시 전체 지도를 다시 그리지 않고 해당 구역만 즉시 하이라이트하기 위한 레이어 참조 맵
  const layersByUidRef = useRef<Map<string, { layer: L.Path; defaultHex: string; marker?: L.Marker }>>(new Map());
  const prevSelectedUidRef = useRef<string | null>(null);

  const { selectedUid, setSelectedUid, setSelectedDistrict, flyToTarget, selectedDistrict } = useMapStore();
  const [mapTheme, setMapTheme] = useState<"osm" | "positron">("positron");
  const [currentZoom, setCurrentZoom] = useState<number>(10);
  const [showSchools, setShowSchools] = useState<boolean>(false);
  const [showWalkRadius, setShowWalkRadius] = useState<boolean>(false);

  // 무료 오픈 타일 (네이버 스타일의 깔끔한 미니멀 카토 타일)
  const TILE_URLS = {
    osm: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
    positron: "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png",
  };

  // 1. 지도 초기화 (수도권 전체가 보이도록 중심과 줌 레벨 최적화, Canvas 가속 활성화)
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const map = L.map(containerRef.current, {
      center: [37.53, 126.99],
      zoom: 11,
      zoomControl: false,
      preferCanvas: true, // 브라우저 DOM 과부하를 막는 고성능 HTML5 Canvas 가속 렌더링
    });

    const tileLayer = L.tileLayer(TILE_URLS.positron, {
      attribution:
        '&copy; <a href="https://carto.com/">CARTO</a> &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      maxZoom: 19,
      subdomains: ["a", "b", "c", "d"],
    }).addTo(map);

    tileLayerRef.current = tileLayer;

    // 클러스터 뱃지용 레이어 그룹 (축소 뷰)
    const clusterGroup = L.layerGroup().addTo(map);
    clusterLayerRef.current = clusterGroup;

    // 개별 구역 마커용 레이어 그룹 (확대 뷰)
    const markersGroup = L.layerGroup().addTo(map);
    markersLayerRef.current = markersGroup;

    // 학군(초품아) 레이어 그룹
    const schoolsGroup = L.layerGroup().addTo(map);
    schoolsLayerRef.current = schoolsGroup;

    // 도보권 반경 레이어 그룹
    const walkGroup = L.layerGroup().addTo(map);
    walkRadiusLayerRef.current = walkGroup;

    // 줌 레벨 변경 감지 이벤트
    map.on("zoomend", () => {
      setCurrentZoom(map.getZoom());
    });

    mapRef.current = map;

    // 지도 컨테이너 렌더링 후 리사이즈 강제 갱신 (지도가 접히거나 하얗게 뜨는 문제 방지)
    const timer = setTimeout(() => {
      if (mapRef.current) {
        mapRef.current.invalidateSize();
      }
    }, 150);

    return () => {
      clearTimeout(timer);
      map.remove();
      mapRef.current = null;
    };
  }, []);

  // 2. 테마 전환 (일반 / 미니멀)
  useEffect(() => {
    if (!mapRef.current || !tileLayerRef.current) return;
    tileLayerRef.current.setUrl(TILE_URLS[mapTheme]);
  }, [mapTheme]);

  // 3. 외부(목록 등)에서 요청된 좌표로 카메라 부드럽게 이동 (이미 확대되어 있다면 줌 아웃되지 않고 현재 줌 유지)
  useEffect(() => {
    if (!mapRef.current || !flyToTarget) return;
    const currentZoomLevel = mapRef.current.getZoom();
    const targetZoom = Math.max(currentZoomLevel, 14);
    mapRef.current.flyTo(flyToTarget, targetZoom, { duration: 0.9 });
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

    // 기존 레이어 및 참조 정리
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
    layersByUidRef.current.clear();

    if (features.length === 0) return;

    // =========================================================================
    // 모드 A: 지도 축소 레벨 (currentZoom < 14.5) ➔ 자치구 클러스터링 모드 (네이버 부동산 스타일)
    // =========================================================================
    if (currentZoom < 14.5 && clusterLayerRef.current) {
      guClusters.forEach((cluster) => {
        // 자치구 단위 클러스터 뱃지 HTML ('동대문구 28' 등 네이버 스타일 원형/알약 뱃지)
        const clusterHtml = `
          <div class="group relative flex items-center justify-center cursor-pointer transition-transform duration-200 hover:scale-110">
            <div class="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-900/95 text-white text-xs font-extrabold shadow-xl border-2 border-emerald-400 whitespace-nowrap hover:bg-emerald-600 hover:border-white transition-all backdrop-blur-md">
              <span class="w-2 h-2 rounded-full bg-emerald-400 group-hover:bg-white animate-pulse"></span>
              <span class="tracking-tight text-xs font-extrabold">${cluster.gu}</span>
              <span class="px-2 py-0.5 rounded-full bg-emerald-500/30 text-emerald-300 group-hover:bg-white group-hover:text-emerald-800 font-black text-[11px]">
                ${cluster.count}
              </span>
            </div>
          </div>
        `;

        const clusterIcon = L.divIcon({
          html: clusterHtml,
          className: "gu-cluster-marker",
          iconSize: [130, 36],
          iconAnchor: [65, 18],
        });

        const marker = L.marker([cluster.lat, cluster.lng], { icon: clusterIcon });

        // 클러스터 클릭 시 해당 자치구로 부드럽게 줌인! (개별 구역이 선명하게 나타나는 15.5 레벨)
        marker.on("click", () => {
          map.flyTo([cluster.lat, cluster.lng], 15.5, { duration: 0.8 });
        });

        // 호버 시 자치구 요약 툴팁 표출
        marker.bindTooltip(
          `<div class="p-1"><strong>${cluster.gu}</strong>: 정비사업 <strong>${cluster.count}개 구역</strong><br/><span class="text-xs text-slate-500">클릭하면 동네 상세 구역으로 확대됩니다</span></div>`,
          { direction: "top", offset: [0, -18] }
        );

        clusterLayerRef.current?.addLayer(marker);
      });
      return;
    }

    // =========================================================================
    // 모드 B: 지도 확대 레벨 (currentZoom >= 14.5) ➔ 개별 구역 폴리곤 및 상세 마커
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

    // 고성능 Canvas 렌더러로 수백 개 구역 폴리곤 일괄 드로잉 (렉 원천 차단)
    const canvasRenderer = L.canvas({ padding: 0.5 });

    const geojsonLayer = L.geoJSON(
      {
        type: "FeatureCollection",
        features: features,
      } as any,
      {
        style: (feature) => {
          const props = feature?.properties as DistrictProperties;
          const stage = STAGES[props.stage_code] || { hex: "#3B82F6" };
          return {
            renderer: canvasRenderer,
            color: stage.hex,
            weight: 2,
            opacity: 0.9,
            fillColor: stage.hex,
            fillOpacity: 0.35,
          };
        },
        onEachFeature: (feature, layer) => {
          const props = feature.properties as DistrictProperties;
          const stage = STAGES[props.stage_code] || { hex: "#3B82F6", name: "진행 중" };

          const popupContent = createPopupHtml(props, stage.hex, stage.name);
          layer.bindPopup(popupContent);

          let itemMarker: L.Marker | undefined;

          // 지도에서 구역 클릭 시: 줌 아웃이나 화면 이동 없이 현재 지도 상태를 그대로 유지하고 왼쪽 상세 글만 오픈!
          layer.on("click", () => {
            setSelectedUid(props.master_uid);
            setSelectedDistrict(props);
          });

          layer.on("mouseover", (e) => {
            const target = e.target as L.Path;
            if (selectedUid !== props.master_uid) {
              target.setStyle({ weight: 3.5, fillOpacity: 0.65 });
            }
          });

          layer.on("mouseout", (e) => {
            const target = e.target as L.Path;
            if (selectedUid !== props.master_uid) {
              target.setStyle({
                weight: 2,
                fillOpacity: 0.35,
              });
            }
          });

          // 개별 마커 라벨 추가 (확대 뷰에서만 표출)
          if (props.centroid && markersLayerRef.current) {
            const markerHtml = `
              <div class="relative flex items-center justify-center cursor-pointer transition-transform duration-200 hover:scale-110">
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

            itemMarker = L.marker([props.centroid[1], props.centroid[0]], { icon: customIcon });
            itemMarker.bindPopup(popupContent);

            // 마커 클릭 시에도 줌 아웃 없이 지도는 그대로 두고 왼쪽 상세 카드만 표시
            itemMarker.on("click", () => {
              setSelectedUid(props.master_uid);
              setSelectedDistrict(props);
            });

            markersLayerRef.current.addLayer(itemMarker);
          }

          // 빠른 스타일 업데이트를 위해 참조 등록
          layersByUidRef.current.set(props.master_uid, {
            layer: layer as L.Path,
            defaultHex: stage.hex,
            marker: itemMarker,
          });
        },
      }
    ).addTo(map);

    geojsonLayerRef.current = geojsonLayer;
  }, [features, currentZoom, guClusters]);

  // 6. 구역 선택(selectedUid) 시 지도를 다시 그리지 않고 해당 구역만 즉시 하이라이트 (0.001초 초고속 반응)
  useEffect(() => {
    // 1) 이전 선택 구역 스타일 원래대로 복구
    if (prevSelectedUidRef.current) {
      const prevData = layersByUidRef.current.get(prevSelectedUidRef.current);
      if (prevData?.layer) {
        prevData.layer.setStyle({
          color: prevData.defaultHex,
          weight: 2,
          fillColor: prevData.defaultHex,
          fillOpacity: 0.35,
        });
      }
    }

    // 2) 새로 선택된 구역만 강조 하이라이트
    if (selectedUid) {
      const currData = layersByUidRef.current.get(selectedUid);
      if (currData?.layer) {
        currData.layer.setStyle({
          color: "#2563EB",
          weight: 4,
          fillColor: "#3B82F6",
          fillOpacity: 0.7,
        });
        currData.layer.bringToFront();
      }
    }

    prevSelectedUidRef.current = selectedUid;
  }, [selectedUid]);

  // 7. [네이버 부동산 킬러 기능 2] 초품아 / 학군 지도 레이어 토글 렌더링
  useEffect(() => {
    if (!schoolsLayerRef.current) return;
    schoolsLayerRef.current.clearLayers();

    if (!showSchools) return;

    MAJOR_SCHOOLS.forEach((sch) => {
      // 학교 위치 마커
      const schoolHtml = `
        <div class="group relative flex items-center justify-center cursor-pointer transition-transform duration-200 hover:scale-115">
          <div class="flex items-center gap-1 px-2 py-0.8 rounded-full bg-emerald-600 text-white text-[10px] font-bold shadow-md shadow-emerald-700/30 border border-white whitespace-nowrap">
            <span>🏫</span>
            <span>${sch.name}</span>
          </div>
        </div>
      `;

      const schoolIcon = L.divIcon({
        html: schoolHtml,
        className: "school-marker",
        iconSize: [110, 26],
        iconAnchor: [55, 13],
      });

      const marker = L.marker([sch.lat, sch.lng], { icon: schoolIcon });
      marker.bindTooltip(`<strong>${sch.name}</strong> (${sch.type})<br/>안심 통학 구역 반경 300m`, {
        direction: "top",
        offset: [0, -10],
      });

      // 300m 안심 통학권 반경 서클
      const circle = L.circle([sch.lat, sch.lng], {
        radius: 300,
        color: "#059669",
        weight: 1.5,
        fillColor: "#10B981",
        fillOpacity: 0.12,
        dashArray: "3, 3",
      });

      schoolsLayerRef.current?.addLayer(circle);
      schoolsLayerRef.current?.addLayer(marker);
    });
  }, [showSchools]);

  // 8. [네이버 부동산 킬러 기능 5] 초역세권 500m 도보권(7분) 서클 레이어 토글
  useEffect(() => {
    if (!walkRadiusLayerRef.current) return;
    walkRadiusLayerRef.current.clearLayers();

    if (!showWalkRadius && !selectedDistrict) return;

    // A) 선택된 구역 중심에서 500m(도보 7분) 원형 링 표출
    if (selectedDistrict?.centroid) {
      const circle = L.circle([selectedDistrict.centroid[1], selectedDistrict.centroid[0]], {
        radius: 500,
        color: "#4F46E5",
        weight: 2,
        fillColor: "#6366F1",
        fillOpacity: 0.15,
        dashArray: "4, 4",
      });
      circle.bindTooltip(`<strong>${selectedDistrict.name}</strong><br/>도보 7분 생활권 (반경 500m)`, {
        direction: "top",
      });
      walkRadiusLayerRef.current.addLayer(circle);
    }

    // B) 역세권 토글 활성화 시 수도권 핵심 지하철역 마커 + 500m 원 표출
    if (showWalkRadius) {
      MAJOR_STATIONS.forEach((st) => {
        const stationHtml = `
          <div class="flex items-center gap-1 px-2 py-0.5 rounded-full bg-indigo-700 text-white text-[10px] font-bold shadow-md border border-white whitespace-nowrap">
            <span>🚇</span>
            <span>${st.name}</span>
          </div>
        `;
        const icon = L.divIcon({
          html: stationHtml,
          className: "station-marker",
          iconSize: [90, 24],
          iconAnchor: [45, 12],
        });
        const marker = L.marker([st.lat, st.lng], { icon });
        marker.bindTooltip(`<strong>${st.name}</strong> (${st.line})<br/>역세권 기준 반경 500m`, {
          direction: "top",
          offset: [0, -10],
        });

        const stCircle = L.circle([st.lat, st.lng], {
          radius: 500,
          color: "#4338CA",
          weight: 1.5,
          fillColor: "#4F46E5",
          fillOpacity: 0.08,
          dashArray: "3, 3",
        });

        walkRadiusLayerRef.current?.addLayer(stCircle);
        walkRadiusLayerRef.current?.addLayer(marker);
      });
    }
  }, [showWalkRadius, selectedDistrict]);

  // 수도권 전체 리셋 핸들러
  const handleResetView = () => {
    if (!mapRef.current) return;
    mapRef.current.flyTo([37.45, 126.98], 10, { duration: 0.8 });
    setSelectedUid(null);
    setSelectedDistrict(null);
  };

  return (
    <div className="relative w-full h-full" style={{ width: "100%", height: "100%" }}>
      {/* 1. Leaflet 지도 컨테이너 */}
      <div
        ref={containerRef}
        id="leaflet-map"
        className="w-full h-full select-none"
        style={{ width: "100%", height: "100%" }}
      />

      {/* 2. 클러스터링 상태 안내 플로팅 배너 */}
      {currentZoom < 13 && (
        <div className="absolute top-4 left-6 z-[500] px-3.5 py-2 rounded-xl bg-white/95 backdrop-blur-md border border-slate-200 text-slate-800 text-xs font-semibold shadow-md flex items-center gap-2 animate-in fade-in duration-300">
          <span className="w-2 h-2 rounded-full bg-blue-500 animate-ping"></span>
          <span>광역 클러스터 뷰: 자치구 뱃지를 클릭하면 해당 지역으로 확대됩니다.</span>
        </div>
      )}

      {/* 3. 우측 상단 플로팅 지도 컨트롤 (네이버 부동산 스타일 레이어 스위처) */}
      <div className="absolute top-4 right-4 z-[500] flex items-center gap-1.5 flex-wrap justify-end">
        {/* 학군 지도 토글 */}
        <button
          onClick={() => setShowSchools(!showSchools)}
          className={`flex items-center gap-1 px-2.5 py-1.5 rounded-xl border shadow-md text-xs font-semibold transition-all cursor-pointer ${
            showSchools
              ? "bg-emerald-600 border-emerald-600 text-white font-bold shadow-emerald-600/30"
              : "bg-white/95 backdrop-blur-md border-slate-200 text-slate-700 hover:bg-slate-50"
          }`}
          title="주변 초·중·고교 위치 및 300m 안심 통학권 레이어를 켜고 끕니다"
        >
          <GraduationCap className="w-3.5 h-3.5" />
          <span>초품아·학군</span>
        </button>

        {/* 역세권 500m 도보권 토글 */}
        <button
          onClick={() => setShowWalkRadius(!showWalkRadius)}
          className={`flex items-center gap-1 px-2.5 py-1.5 rounded-xl border shadow-md text-xs font-semibold transition-all cursor-pointer ${
            showWalkRadius
              ? "bg-indigo-600 border-indigo-600 text-white font-bold shadow-indigo-600/30"
              : "bg-white/95 backdrop-blur-md border-slate-200 text-slate-700 hover:bg-slate-50"
          }`}
          title="지하철역 및 구역 중심 반경 500m(도보 7분 역세권) 링을 켜고 끕니다"
        >
          <Train className="w-3.5 h-3.5" />
          <span>역세권 500m</span>
        </button>

        {/* 미니멀/일반 테마 */}
        <button
          onClick={() => setMapTheme(mapTheme === "osm" ? "positron" : "osm")}
          className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-white/95 backdrop-blur-md border border-slate-200 shadow-md text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-all cursor-pointer"
        >
          <Layers className="w-3.5 h-3.5 text-blue-600" />
          <span>{mapTheme === "osm" ? "미니멀" : "일반"}</span>
        </button>

        {/* 전역 리셋 */}
        <button
          onClick={handleResetView}
          className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-white/95 backdrop-blur-md border border-slate-200 shadow-md text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:text-blue-600 transition-all cursor-pointer"
          title="수도권 전체 보기로 지도 위치를 초기화합니다"
        >
          <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
          <span>수도권 전역</span>
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
