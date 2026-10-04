import { create } from "zustand";
import { DistrictProperties } from "@/lib/types/district";

interface CompareState {
  compareList: DistrictProperties[];
  isModalOpen: boolean;
  addToCompare: (district: DistrictProperties) => boolean; // 성공 시 true, 3개 초과 시 false
  removeFromCompare: (master_uid: string) => void;
  clearCompare: () => void;
  setIsModalOpen: (isOpen: boolean) => void;
  isInCompare: (master_uid: string) => boolean;
}

export const useCompareStore = create<CompareState>((set, get) => ({
  compareList: [],
  isModalOpen: false,

  addToCompare: (district) => {
    const list = get().compareList;
    if (list.some((d) => d.master_uid === district.master_uid)) {
      // 이미 있으면 제거 (토글)
      set({ compareList: list.filter((d) => d.master_uid !== district.master_uid) });
      return true;
    }
    if (list.length >= 3) {
      alert("구역 비교는 최대 3개까지 선택할 수 있습니다.");
      return false;
    }
    set({ compareList: [...list, district] });
    return true;
  },

  removeFromCompare: (master_uid) => {
    set({ compareList: get().compareList.filter((d) => d.master_uid !== master_uid) });
  },

  clearCompare: () => {
    set({ compareList: [], isModalOpen: false });
  },

  setIsModalOpen: (isModalOpen) => {
    set({ isModalOpen });
  },

  isInCompare: (master_uid) => {
    return get().compareList.some((d) => d.master_uid === master_uid);
  },
}));
