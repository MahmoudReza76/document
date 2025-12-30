"use client";

import {create} from "zustand";

export const useAppStore = create((set) => ({
  projectKey: null,
  lang: "fa",
  direction: "rtl",

  setProjectKey: (key) => set({projectKey: key}),

  setLang: (newLang, languages = []) => {
    const found = languages.find((l) => l.LanguageCode === newLang);
    const newDirection = found?.Direction || "ltr";

    set({
      lang: newLang,
      direction: newDirection
    });
  }
}));
