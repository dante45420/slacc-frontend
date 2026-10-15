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

const DATE_ONLY = /^\d{4}-\d{2}-\d{2}$/;
const HAS_ZONE = /(Z|[+-]\d{2}:?\d{2})$/i;

/**
 * Parses a value coming from the API.
 * - "YYYY-MM-DD" → local calendar date (JS would otherwise read it as UTC and
 *   show the previous day in the Americas).
 * - Naive "YYYY-MM-DDTHH:mm[:ss]" → local wall-clock time by default (event
 *   dates are entered as wall-clock times); pass { utc: true } for server
 *   timestamps such as created_at, which the backend stores in naive UTC.
 */
export function parseApiDate(value, { utc = false } = {}) {
  if (!value) return null;
  if (value instanceof Date) return value;
  const str = String(value).trim();
  if (DATE_ONLY.test(str)) {
    const [y, m, d] = str.split("-").map(Number);
    return new Date(y, m - 1, d);
  }
  const date = new Date(utc && !HAS_ZONE.test(str) ? `${str}Z` : str);
  return Number.isNaN(date.getTime()) ? null : date;
}

export function formatDate(dateString, options = {}, lang, { utc = false } = {}) {
  const date = parseApiDate(dateString, { utc });
  if (!date) return null;
  return date.toLocaleDateString(getDateLocale(lang), {
    year: "numeric",
    month: "long",
    day: "numeric",
    ...options,
  });
}

export function formatDateTime(dateString, lang, { utc = false } = {}) {
  const date = parseApiDate(dateString, { utc });
  if (!date) return null;
  return date.toLocaleString(getDateLocale(lang), {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/** Server timestamps (created_at, decided_at…) are naive UTC. */
export function formatTimestamp(dateString, options = {}, lang) {
  return formatDate(dateString, options, lang, { utc: true });
}
