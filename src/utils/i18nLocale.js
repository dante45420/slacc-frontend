import i18n from "../i18n";

const LOCALE_MAP = {
  es: "es-ES",
  en: "en-US",
  pt: "pt-BR",
};

export function getDateLocale(lang = i18n.language) {
  const code = (lang || "es").split("-")[0];
  return LOCALE_MAP[code] || LOCALE_MAP.es;
}

export function formatDate(dateString, options = {}, lang) {
  if (!dateString) return null;
  return new Date(dateString).toLocaleDateString(getDateLocale(lang), {
    year: "numeric",
    month: "long",
    day: "numeric",
    ...options,
  });
}

export function formatDateTime(dateString, lang) {
  if (!dateString) return null;
  return new Date(dateString).toLocaleDateString(getDateLocale(lang), {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}
