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
  const [mapTheme, setMapTheme] = useState<"vworld" | "vworld_white" | "osm">("vworld");
  const [currentZoom, setCurrentZoom] = useState<number>(10);
  const [showSchools, setShowSchools] = useState<boolean>(false);
  const [showWalkRadius, setShowWalkRadius] = useState<boolean>(false);
  const [showLegend, setShowLegend] = useState<boolean>(false);

  // 100% 영구 무료 공식 지도 타일 (API 키 및 결제 전혀 불필요, 워터마크 0개)
  const TILE_URLS = {
    // 대한민국 국토교통부 공식 브이월드(VWorld) 한글 배경지도 (네이버/카카오급 선명한 국내 지형)
    vworld: "https://xdworld.vworld.kr/2d/Base/service/{z}/{x}/{y}.png",
    // 국토교통부 브이월드 미니멀 화이트 백지도
    vworld_white: "https://xdworld.vworld.kr/2d/white/service/{z}/{x}/{y}.png",
    // 오픈스트리트맵 글로벌 표준 타일
    osm: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
  };

  // 1. 지도 초기화 (모바일 화면 감지 및 중심/줌 레벨 반응형 최적화)
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    // 모바일(화면 폭 640px 미만)에서는 서울 중심 줌 12로 더 확대하여 마커 겹침 방지
    const isMobile = typeof window !== "undefined" && window.innerWidth < 640;
    const initialCenter: [number, number] = isMobile ? [37.55, 126.98] : [37.53, 126.99];
    const initialZoom = isMobile ? 12 : 11;

    const map = L.map(containerRef.current, {
      center: initialCenter,
      zoom: initialZoom,
      zoomControl: false,
      preferCanvas: true, // 브라우저 DOM 과부하를 막는 고성능 HTML5 Canvas 가속 렌더링
    });

    setCurrentZoom(initialZoom);

    // 타일 깨짐 및 하얀 사각형 빈 공간 방지 옵션 적용 (버퍼링 최적화)
    const tileLayer = L.tileLayer(TILE_URLS.vworld, {
      attribution:
        '&copy; <a href="https://www.vworld.kr/">국토교통부 VWorld</a> 공간정보오픈플랫폼',
      maxZoom: 19,
      minZoom: 8,
      keepBuffer: 6, // 화면 밖 타일 6개를 미리 캐싱하여 하얀 빈 박스 방지
      updateWhenIdle: false, // 이동 중에도 부드럽게 타일 유지
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

  // 4. 자치구별 & 광역 권역별 통계 집계 (반응형 2단계 클러스터링용)
  const { guClusters, megaClusters } = useMemo(() => {
    const map = new Map<string, { count: number; totalH: number; lat: number; lng: number }>();
    let seoulCount = 0;
    let gyeonggiCount = 0;

    features.forEach((f) => {
      const gu = f.properties.gu || "기타";
      const totalH = f.properties.total_households || 0;
      const coords = GU_CENTER_COORDS[gu] || [37.5665, 126.978];

      const isSeoul = gu.endsWith("구") && gu !== "처인구" && gu !== "수지구" && gu !== "기흥구" && gu !== "일산동구" && gu !== "일산서구" && gu !== "덕양구" && gu !== "수정구" && gu !== "중원구" && gu !== "분당구" && gu !== "만안구" && gu !== "동안구" && gu !== "상록구" && gu !== "단원구" && gu !== "원미구" && gu !== "소사구" && gu !== "오정구" && gu !== "권선구" && gu !== "팔달구" && gu !== "영통구" && gu !== "장안구";

      if (isSeoul) {
        seoulCount += 1;
      } else {
        gyeonggiCount += 1;
      }

      if (!map.has(gu)) {
        map.set(gu, { count: 0, totalH: 0, lat: coords[0], lng: coords[1] });
      }
      const data = map.get(gu)!;
      data.count += 1;
      data.totalH += totalH;
    });

    const guList = Array.from(map.entries()).map(([gu, info]) => ({
      gu,
      count: info.count,
      totalH: info.totalH,
      lat: info.lat,
      lng: info.lng,
    }));

    const megaList = [
      {
        name: "서울시 전역",
        count: seoulCount,
        lat: 37.555,
        lng: 126.985,
        targetZoom: 12.5,
      },
      {
        name: "경기도 전역",
        count: gyeonggiCount,
        lat: 37.310,
        lng: 127.120,
        targetZoom: 12.0,
      },
    ];

    return { guClusters: guList, megaClusters: megaList };
  }, [features]);

  // 5. 줌 레벨에 따른 스마트 클러스터링(광역 ➔ 자치구 ➔ 개별 구역) 렌더링
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
    // 모드 A-1: 극축소 광역 레벨 (currentZoom < 11.5) ➔ 서울/경기 2대 메가 클러스터 (마커 겹침 100% 박멸!)
    // =========================================================================
    if (currentZoom < 11.5 && clusterLayerRef.current) {
      megaClusters.forEach((mega) => {
        const megaHtml = `
          <div class="cursor-pointer transition-transform duration-200 hover:scale-105 active:scale-95">
            <div class="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-slate-900/95 text-white shadow-2xl border-2 border-emerald-400 whitespace-nowrap backdrop-blur-md">
              <span class="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping"></span>
              <span class="text-xs sm:text-sm font-black tracking-tight">${mega.name}</span>
              <span class="px-2.5 py-0.5 rounded-full bg-emerald-500 text-white font-black text-xs shadow-xs">
                ${mega.count}개 구역
              </span>
            </div>
          </div>
        `;

        const megaIcon = L.divIcon({
          html: megaHtml,
          className: "mega-cluster-marker",
          iconSize: [160, 44],
          iconAnchor: [80, 22],
        });

        const marker = L.marker([mega.lat, mega.lng], { icon: megaIcon });
        marker.on("click", () => {
          map.flyTo([mega.lat, mega.lng], mega.targetZoom, { duration: 0.8 });
        });
        clusterLayerRef.current?.addLayer(marker);
      });
      return;
    }

    // =========================================================================
    // 모드 A-2: 자치구 단위 클러스터 레벨 (11.5 <= currentZoom < 14.5) ➔ 자치구별 깔끔한 알약 뱃지
    // =========================================================================
    if (currentZoom < 14.5 && clusterLayerRef.current) {
      guClusters.forEach((cluster) => {
        const clusterHtml = `
          <div class="cursor-pointer transition-transform duration-150 active:scale-95">
            <div class="flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-900/90 text-white text-[11px] font-extrabold shadow-lg border border-emerald-400/80 whitespace-nowrap backdrop-blur-xs">
              <span class="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
              <span class="tracking-tight">${cluster.gu}</span>
              <span class="px-1.5 py-0.2 rounded-full bg-emerald-500/30 text-emerald-300 font-bold text-[10px]">
                ${cluster.count}
              </span>
            </div>
          </div>
        `;

        const clusterIcon = L.divIcon({
          html: clusterHtml,
          className: "gu-cluster-marker",
          iconSize: [100, 28],
          iconAnchor: [50, 14],
        });

        const marker = L.marker([cluster.lat, cluster.lng], { icon: clusterIcon });

        marker.on("click", () => {
          map.flyTo([cluster.lat, cluster.lng], 15.5, { duration: 0.8 });
        });

        marker.bindTooltip(
          `<div class="p-1"><strong>${cluster.gu}</strong>: <strong>${cluster.count}개 구역</strong><br/><span class="text-[10px] text-slate-500">터치하면 상세 구역으로 확대됩니다</span></div>`,
          { direction: "top", offset: [0, -14] }
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

      {/* 2. 클러스터링 상태 안내 플로팅 배너 (PC에서만 표출) */}
      {currentZoom < 14.5 && (
        <div className="hidden md:flex absolute top-4 left-6 z-[500] px-3.5 py-2 rounded-xl bg-white/95 backdrop-blur-md border border-slate-200 text-slate-800 text-xs font-semibold shadow-md items-center gap-2 animate-in fade-in duration-300">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
          <span>광역 클러스터 뷰: 뱃지를 터치하면 동네 상세 구역으로 줌인됩니다.</span>
        </div>
      )}

      {/* 3. 우측 상단 플로팅 지도 컨트롤 */}
      <div className="absolute top-2.5 sm:top-4 right-2.5 sm:right-4 z-[500] flex items-center gap-1 sm:gap-1.5 flex-wrap justify-end">
        {/* 학군 지도 토글 */}
        <button
          onClick={() => setShowSchools(!showSchools)}
          className={`flex items-center gap-1 px-2 sm:px-2.5 py-1 sm:py-1.5 rounded-xl border shadow-sm text-[11px] sm:text-xs font-semibold transition-all cursor-pointer ${
            showSchools
              ? "bg-emerald-600 border-emerald-600 text-white font-bold shadow-emerald-600/30"
              : "bg-white/95 backdrop-blur-md border-slate-200 text-slate-700 hover:bg-slate-50"
          }`}
          title="주변 초·중·고교 위치 및 300m 안심 통학권 레이어를 켜고 끕니다"
        >
          <GraduationCap className="w-3.5 h-3.5" />
          <span>초품아</span>
        </button>

        {/* 역세권 500m 도보권 토글 */}
        <button
          onClick={() => setShowWalkRadius(!showWalkRadius)}
          className={`flex items-center gap-1 px-2 sm:px-2.5 py-1 sm:py-1.5 rounded-xl border shadow-sm text-[11px] sm:text-xs font-semibold transition-all cursor-pointer ${
            showWalkRadius
              ? "bg-indigo-600 border-indigo-600 text-white font-bold shadow-indigo-600/30"
              : "bg-white/95 backdrop-blur-md border-slate-200 text-slate-700 hover:bg-slate-50"
          }`}
          title="지하철역 및 구역 중심 반경 500m(도보 7분 역세권) 링을 켜고 끕니다"
        >
          <Train className="w-3.5 h-3.5" />
          <span>역세권</span>
        </button>

        {/* 국토교통부 브이월드 일반/백지도 테마 전환 */}
        <button
          onClick={() => setMapTheme(mapTheme === "vworld" ? "vworld_white" : "vworld")}
          className="flex items-center gap-1 px-2 sm:px-2.5 py-1 sm:py-1.5 rounded-xl bg-white/95 backdrop-blur-md border border-slate-200 shadow-sm text-[11px] sm:text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-all cursor-pointer"
          title="국토교통부 일반 지도와 미니멀 백지도를 전환합니다"
        >
          <Layers className="w-3.5 h-3.5 text-blue-600" />
          <span>{mapTheme === "vworld" ? "백지도" : "일반"}</span>
        </button>

        {/* 전역 리셋 */}
        <button
          onClick={handleResetView}
          className="flex items-center gap-1 px-2 sm:px-2.5 py-1 sm:py-1.5 rounded-xl bg-white/95 backdrop-blur-md border border-slate-200 shadow-sm text-[11px] sm:text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:text-blue-600 transition-all cursor-pointer"
          title="수도권 전체 보기로 지도 위치를 초기화합니다"
        >
          <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
          <span className="hidden sm:inline">수도권 </span>전역
        </button>
      </div>

      {/* 4. 우측 하단 지도 범례 (모바일에서는 토글 버튼으로 화면 가림 방지) */}
      <div className="absolute bottom-3 right-3 sm:bottom-4 sm:right-4 z-[500] flex flex-col items-end">
        {/* 모바일 토글 버튼 */}
        <button
          onClick={() => setShowLegend(!showLegend)}
          className="md:hidden flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-white/95 backdrop-blur-md border border-slate-200 text-slate-800 text-xs font-bold shadow-md hover:bg-slate-50 mb-1 cursor-pointer"
        >
          <span>🎨 범례</span>
          <span className="text-[10px] text-slate-400">{showLegend ? "▲" : "▼"}</span>
        </button>

        {/* 범례 본체: PC에서는 상시 표출, 모바일에서는 showLegend가 true일 때만 표출 */}
        <div className={`${showLegend ? "block" : "hidden md:block"} p-2.5 sm:p-3 rounded-2xl bg-white/95 backdrop-blur-md border border-slate-200 shadow-xl max-w-xs text-xs animate-in fade-in duration-200`}>
          <div className="font-bold text-slate-900 mb-2 flex items-center justify-between gap-3">
            <span>정비사업 8단계 범례</span>
            <span className="text-[10px] text-slate-500 font-normal">
              {currentZoom < 14.5 ? "광역 클러스터링" : `${features.length}개 구역 표출`}
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

    </div>
  );
}
