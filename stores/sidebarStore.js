import {create} from "zustand";

export const useSidebarStore = create((set) => ({
  expandedSections: {},
  toggleSection: (section) =>
    set((state) => ({
      expandedSections: {
        ...state.expandedSections,
        [section]: !state.expandedSections[section]
      }
    })),
  setExpandedSections: (newState) => set({expandedSections: newState})
}));
