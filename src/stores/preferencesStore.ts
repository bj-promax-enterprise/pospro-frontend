import { create } from "zustand";
import { persist } from "zustand/middleware";

export type CurrencyCode = "MYR" | "CNY" | "USD" | "SGD";
export type LanguageCode = "zh" | "en" | "ms";

interface PreferencesState {
  currency: CurrencyCode;
  language: LanguageCode;
  setCurrency: (currency: CurrencyCode) => void;
  setLanguage: (language: LanguageCode) => void;
}

export const usePreferencesStore = create<PreferencesState>()(
  persist(
    (set) => ({
      currency: "MYR",
      language: "zh",
      setCurrency: (currency) => set({ currency }),
      setLanguage: (language) => set({ language }),
    }),
    { name: "pospro-preferences" }
  )
);
