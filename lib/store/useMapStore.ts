import { create } from "zustand";

interface MapState {
  center: [number, number]; // [경도, 위도]
  zoom: number;
  selectedUid: string | null;
  selectedDistrict: any | null;
  flyToTarget: [number, number] | null; // [위도(lat), 경도(lng)]
  setCenter: (center: [number, number]) => void;
  setZoom: (zoom: number) => void;
  setSelectedUid: (uid: string | null) => void;
  setSelectedDistrict: (district: any | null) => void;
  setFlyToTarget: (target: [number, number] | null) => void;
}

export const useMapStore = create<MapState>((set) => ({
  center: [126.978, 37.5665], // 서울시청 중심좌표
  zoom: 12,
  selectedUid: null,
  selectedDistrict: null,
  flyToTarget: null,
  setCenter: (center) => set({ center }),
  setZoom: (zoom) => set({ zoom }),
  setSelectedUid: (selectedUid) => set({ selectedUid }),
  setSelectedDistrict: (selectedDistrict) => set({ selectedDistrict }),
  setFlyToTarget: (flyToTarget) => set({ flyToTarget }),
}));
