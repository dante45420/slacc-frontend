import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";

// Import translations
import translationES from "./locales/es.json";
import translationEN from "./locales/en.json";
import translationPT from "./locales/pt.json";

const resources = {
  es: {
    translation: translationES,
  },
  en: {
    translation: translationEN,
  },
  pt: {
    translation: translationPT,
  },
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: "es",
    debug: false,

    interpolation: {
      escapeValue: false, // React ya hace el escape
    },
  });

export default i18n;
