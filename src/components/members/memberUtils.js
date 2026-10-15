// Helpers shared by the membership pages (directory, profile, portal).

const HONORIFIC = /^(dra?|prof(?:a|essor)?|profa|lic|mg|msc|phd)\.?\s+/i;

/** "Dra. Ana García Rodríguez" → "Ana García Rodríguez" (repeated titles too). */
export function stripHonorific(name = "") {
  let clean = String(name).trim();
  let prev;
  do {
    prev = clean;
    clean = clean.replace(HONORIFIC, "");
  } while (clean !== prev);
  return clean;
}

function nameTokens(name) {
  return stripHonorific(name).split(/\s+/).filter(Boolean);
}

/**
 * Paternal surname following the Hispanic convention used by the members:
 * "Carlos López Martínez" → "López", "Dante Parodi" → "Parodi".
 */
export function surnameOf(name) {
  const tokens = nameTokens(name);
  if (tokens.length >= 3) return tokens[tokens.length - 2];
  if (tokens.length === 2) return tokens[1];
  return tokens[0] || "";
}

/** "Dr. Carlos López Martínez" → "CL" (first name + surname, honorific ignored). */
export function memberInitials(name) {
  const tokens = nameTokens(name);
  if (tokens.length === 0) return "?";
  const first = tokens[0][0] || "";
  const last = tokens.length > 1 ? surnameOf(name)[0] || "" : "";
  return `${first}${last}`.toUpperCase();
}

/** Lower-case, accent-free text for search and sorting. */
export function normalizeText(value = "") {
  return String(value)
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .trim();
}

const collator = new Intl.Collator("es", { sensitivity: "base" });

/** Sort comparator: surname, then full name without honorific. */
export function compareBySurname(a, b) {
  return (
    collator.compare(surnameOf(a.name), surnameOf(b.name)) ||
    collator.compare(stripHonorific(a.name), stripHonorific(b.name))
  );
}

export const MEMBERSHIP_BADGE_VARIANTS = {
  joven: "info",
  normal: "primary",
  gratuito: "success",
};

/** Translated membership label, consistent across directory, profile and admin. */
export function membershipLabel(t, type) {
  const key = String(type || "").trim().toLowerCase();
  if (!key) return "";
  if (key in MEMBERSHIP_BADGE_VARIANTS) return t(`members.badge_${key}`);
  if (key === "socio") return t("members.badge_normal");
  return key.charAt(0).toUpperCase() + key.slice(1);
}

/**
 * Payment state of a user, mapped explicitly like the admin panel:
 * "paid" → up to date, "due" → payment pending, anything else (incl. "none"
 * and emeritus members) → no fee due.
 */
export function paymentState(user) {
  const status = String(user?.payment_status || "").toLowerCase();
  if (status === "paid") return "paid";
  if (status === "due" && user?.membership_type !== "gratuito") return "due";
  return "none";
}

/** True when an API error message is safe to show verbatim (not an HTML page). */
export function readableServerMessage(err) {
  const msg = typeof err?.message === "string" ? err.message.trim() : "";
  if (!msg || msg.length > 280 || msg.startsWith("<") || /^HTTP \d+$/.test(msg)) {
    return "";
  }
  return msg;
}

/** fetch() rejects with a TypeError when the network/CORS fails (no HTTP status). */
export function isNetworkError(err) {
  return !err?.status && (err instanceof TypeError || err?.name === "TypeError");
}
