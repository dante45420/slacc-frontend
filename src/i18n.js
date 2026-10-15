import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";

// Spanish (the fallback) ships in the main bundle; English and Portuguese are
// separate chunks loaded on demand.
import translationES from "./locales/es.json";

export const SUPPORTED_LANGUAGES = ["es", "en", "pt"];

const resources = {
  es: {
    translation: translationES,
  },
};

const LAZY_LOCALES = {
  en: () => import("./locales/en.json"),
  pt: () => import("./locales/pt.json"),
};

const lazyLocaleBackend = {
  type: "backend",
  init() {},
  read(language, _namespace, callback) {
    const load = LAZY_LOCALES[language];
    if (!load) {
      callback(null, {});
      return;
    }
    load().then(
      module => callback(null, module.default),
      error => callback(error, null),
    );
  },
};

/** Two-letter code of the active UI language ("es" | "en" | "pt"). */
export function currentLanguage(instance = i18n) {
  const code = (instance.resolvedLanguage || instance.language || "es").split("-")[0];
  return SUPPORTED_LANGUAGES.includes(code) ? code : "es";
}

/** Resolves once the detected language is loaded (render after it). */
export const i18nReady = i18n
  .use(lazyLocaleBackend)
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    partialBundledLanguages: true,
    fallbackLng: "es",
    supportedLngs: SUPPORTED_LANGUAGES,
    nonExplicitSupportedLngs: true,
    load: "languageOnly",
    debug: false,
    detection: {
      order: ["localStorage", "navigator", "htmlTag"],
      caches: ["localStorage"],
    },

    interpolation: {
      escapeValue: false, // React ya hace el escape
    },

    // Components keep showing the current language while another one loads.
    react: {
      useSuspense: false,
    },
  });

const syncHtmlLang = () => {
  if (typeof document !== "undefined") {
    document.documentElement.lang = currentLanguage();
  }
};
syncHtmlLang();
i18n.on("languageChanged", syncHtmlLang);

export default i18n;
