// Shared helpers for the news area (listing, detail, submit and admin editor).

/** Categories the backend accepts (ALLOWED_NEWS_CATEGORIES), in display order. */
export const NEWS_CATEGORIES = [
  {
    id: "articulos-cientificos",
    labelKey: "news.tab_scientific",
    label: "Artículos científicos",
    descKey: "news.desc_scientific",
    desc: "Investigación, evidencia clínica y técnicas quirúrgicas en cirugía de cadera.",
    badge: "accent",
    icon: "fa-microscope",
  },
  {
    id: "articulos-destacados",
    labelKey: "news.tab_featured",
    label: "Artículos destacados",
    descKey: "news.desc_featured",
    desc: "Anuncios, congresos y publicaciones que la Sociedad destaca para sus socios.",
    badge: "primary",
    icon: "fa-star",
  },
  {
    id: "editoriales",
    labelKey: "news.tab_editorials",
    label: "Editoriales",
    descKey: "news.desc_editorials",
    desc: "Opinión y reflexiones de la directiva y del comité editorial de SLACC.",
    badge: "info",
    icon: "fa-pen-nib",
  },
];

export const DEFAULT_CATEGORY = NEWS_CATEGORIES[0].id;

export const NEWS_STATUS = {
  published: { labelKey: "news.status_published", label: "Publicada", badge: "success" },
  pending: { labelKey: "news.status_pending", label: "Pendiente", badge: "warning" },
  rejected: { labelKey: "news.status_rejected", label: "Rechazada", badge: "danger" },
};

/** Limits of the News model columns (title String(255), excerpt String(500)). */
export const TITLE_MAX = 255;
export const EXCERPT_MAX = 500;

export function getCategory(id) {
  return NEWS_CATEGORIES.find(c => c.id === id) || null;
}

export function categoryLabel(t, id) {
  const cat = getCategory(id);
  return cat ? t(cat.labelKey, cat.label) : id || "";
}

export function categoryBadge(id) {
  return getCategory(id)?.badge || "neutral";
}

export function categoryIcon(id) {
  return getCategory(id)?.icon || "fa-newspaper";
}

export function statusInfo(t, status) {
  const info = NEWS_STATUS[status] || NEWS_STATUS.rejected;
  return { label: t(info.labelKey, info.label), badge: info.badge };
}

// Content written in the plain <textarea> editors is plain text; older or
// imported articles may contain HTML. Only real tags count ("<5 años" or
// "p<0.05" stay text).
const HTML_TAG =
  /<\/?(p|br|hr|h[1-6]|ul|ol|li|strong|em|b|i|u|s|sub|sup|a|img|blockquote|pre|code|table|thead|tbody|tr|th|td|div|span)(\s[^<>]*)?\/?>/i;

export function isHtmlContent(text) {
  return HTML_TAG.test(text || "");
}

/** Splits plain text into paragraphs (blank lines) made of lines (single newlines). */
export function toParagraphs(text) {
  return String(text || "")
    .replace(/\r\n?/g, "\n")
    .split(/\n\s*\n/)
    .map(block => block.split("\n").map(line => line.trim()).filter(Boolean))
    .filter(lines => lines.length > 0);
}

/** Approximate reading time in minutes (≈200 words per minute). */
export function readingMinutes(text) {
  const plain = String(text || "").replace(/<[^>]*>/g, " ");
  const words = plain.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 200));
}

/** Accepted cover image types and size (the API stores and optimises them). */
export const IMAGE_ACCEPT = "image/jpeg,image/png,image/webp,image/gif";
export const IMAGE_MAX_MB = 10;
