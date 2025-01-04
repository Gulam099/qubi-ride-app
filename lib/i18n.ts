// utils/i18n.ts
import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import { I18nManager } from "react-native";

// Import translation files
import en from "@/locales/en.json";
import ar from "@/locales/ar.json";

// Example usage in i18n setup
i18n.use(initReactI18next).init({
  resources: {
    en: { translation: en },
    ar: { translation: ar },
  },
  lng: "en", // Adjust for Arabic detection
  fallbackLng: "en",
  interpolation: {
    escapeValue: false,
  },
});

export default i18n;
