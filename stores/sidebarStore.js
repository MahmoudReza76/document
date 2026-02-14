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
  setExpandedSections: (newState) => set({expandedSections: newState}),

  isOpen: false,
  toggleSidebar: () => set((state) => ({isOpen: !state.isOpen})),
  closeSidebar: () => set({isOpen: false}),
  openSidebar: () => set({isOpen: true})
}));
