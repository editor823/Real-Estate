import { create } from "zustand";

export type SortOption = "LATEST" | "HOUSEHOLDS" | "PROGRESS";
export type InvestmentPersona = "ALL" | "EARLY_SEED" | "IMMINENT_SAFE";

interface FilterState {
  searchQuery: string;
  selectedGu: string;
  bizType: string;
  minConsentRate: number;
  isConsentFilterActive: boolean;
  transferableOnly: boolean;
  publicAdjacentOnly: boolean;
  minHouseholds: number; // 0: 전체, 1000: 1000세대 이상 대단지
  sortBy: SortOption; // 정렬 옵션 (최신 고시순, 계획 세대수 큰 순, 사업 진척도 빠른 순)
  investmentPersona: InvestmentPersona; // 투자 성향별 퀵 필터 (초기 소액 vs 입주 임박 안전)
  setSearchQuery: (query: string) => void;
  setSelectedGu: (gu: string) => void;
  setBizType: (type: string) => void;
  setMinConsentRate: (rate: number) => void;
  setIsConsentFilterActive: (active: boolean) => void;
  setTransferableOnly: (active: boolean) => void;
  setPublicAdjacentOnly: (active: boolean) => void;
  setMinHouseholds: (min: number) => void;
  setSortBy: (sort: SortOption) => void;
  setInvestmentPersona: (persona: InvestmentPersona) => void;
  resetFilters: () => void;
}

export const useFilterStore = create<FilterState>((set) => ({
  searchQuery: "",
  selectedGu: "ALL",
  bizType: "ALL",
  minConsentRate: 70,
  isConsentFilterActive: false,
  transferableOnly: false,
  publicAdjacentOnly: false,
  minHouseholds: 0,
  sortBy: "LATEST",
  investmentPersona: "ALL",
  setSearchQuery: (searchQuery) => set({ searchQuery }),
  setSelectedGu: (selectedGu) => set({ selectedGu }),
  setBizType: (bizType) => set({ bizType }),
  setMinConsentRate: (minConsentRate) => set({ minConsentRate }),
  setIsConsentFilterActive: (isConsentFilterActive) => set({ isConsentFilterActive }),
  setTransferableOnly: (transferableOnly) => set({ transferableOnly }),
  setPublicAdjacentOnly: (publicAdjacentOnly) => set({ publicAdjacentOnly }),
  setMinHouseholds: (minHouseholds) => set({ minHouseholds }),
  setSortBy: (sortBy) => set({ sortBy }),
  setInvestmentPersona: (investmentPersona) => set({ investmentPersona }),
  resetFilters: () =>
    set({
      searchQuery: "",
      selectedGu: "ALL",
      bizType: "ALL",
      minConsentRate: 70,
      isConsentFilterActive: false,
      transferableOnly: false,
      publicAdjacentOnly: false,
      minHouseholds: 0,
      sortBy: "LATEST",
      investmentPersona: "ALL",
    }),
}));
