// Small helpers shared by the admin dashboard tabs.
import i18n, { currentLanguage } from "../../i18n";
import { parseApiDate } from "../../utils/i18nLocale";
import { memberInitials } from "../members/memberUtils";

/** HTTP statuses that mean the stored JWT is missing, expired or invalid. */
export const AUTH_ERROR_STATUSES = new Set([401, 422]);

export function isAuthError(err) {
  return Boolean(err && AUTH_ERROR_STATUSES.has(err.status));
}

/* Backend messages ------------------------------------------------------- */

// The Flask API only speaks Spanish. Field names it embeds in its messages
// ("Precio inválido en precio socio") → the form's own translated label.
const FIELD_LABELS = {
  "precio socio": ["admin.event_form.price_member", "Socio"],
  "precio no socio": ["admin.event_form.price_non_member", "No socio"],
  "precio next gen": ["admin.event_form.price_joven", "Next Gen"],
  "precio emérito": ["admin.event_form.price_gratuito", "Emérito"],
  "cupo máximo": ["admin.event_form.capacity", "Cupos"],
  "duración (horas)": ["admin.event_form.duration", "Duración (horas)"],
  "fecha de inicio": ["admin.event_form.start", "Inicio"],
  "fecha de término": ["admin.event_form.end", "Término"],
  "fecha límite de inscripción": ["admin.event_form.deadline", "Cierre de inscripciones"],
};

function fieldLabel(raw) {
  const clean = String(raw || "").trim();
  const entry = FIELD_LABELS[clean.toLowerCase()];
  return entry ? i18n.t(entry[0], entry[1]) : clean;
}

/**
 * Known backend messages (admin.py / public.py) → translation key, Spanish
 * default and optional interpolation values taken from the regex match.
 */
const BACKEND_ERRORS = [
  [/^forbidden$/i, "admin.errors.forbidden", "No tienes permisos para realizar esta acción."],
  [
    /^(email ya existe|ya existe un usuario con ese email)/i,
    "admin.errors.email_taken",
    "Ya existe una cuenta con ese email.",
  ],
  [
    /^email y nombre son requeridos/i,
    "admin.errors.email_name_required",
    "El email y el nombre son obligatorios.",
  ],
  [
    /^no puedes desactivar tu propia cuenta/i,
    "admin.user_form.active_self",
    "No puedes desactivar tu propia cuenta.",
  ],
  [
    /^no se puede desactivar la cuenta del owner/i,
    "admin.errors.owner_locked",
    "No se puede desactivar la cuenta del propietario del sitio.",
  ],
  [
    /^solo el owner puede crear administradores/i,
    "admin.errors.owner_only",
    "Solo el propietario del sitio puede crear administradores.",
  ],
  [/^la solicitud ya fue resuelta/i, "admin.errors.application_resolved", "Esta postulación ya fue resuelta."],
  [
    /^la solicitud no está en estado de pago pendiente/i,
    "admin.errors.application_not_awaiting_payment",
    "Esta postulación ya no está esperando el pago.",
  ],
  [/^noticia no encontrada/i, "admin.errors.news_not_found", "La noticia ya no existe."],
  [/^el título es requerido/i, "admin.event_form.title_required", "El título es obligatorio."],
  [
    /^completa el título y el contenido/i,
    "admin.errors.title_content_required",
    "Completa el título y el contenido de la noticia.",
  ],
  [
    /^el título admite un máximo/i,
    "admin.errors.title_too_long",
    "El título admite un máximo de 255 caracteres.",
  ],
  [
    /^el resumen admite un máximo/i,
    "admin.errors.excerpt_too_long",
    "El resumen admite un máximo de 500 caracteres.",
  ],
  [/^categoría inválida/i, "admin.errors.invalid_category", "La categoría no es válida."],
  [/^estado inválido/i, "admin.errors.invalid_status", "El estado no es válido."],
  [/^order_index debe ser/i, "admin.errors.invalid_order", "El orden debe ser un número entero."],
  [
    /^no se pudo (crear|actualizar) la noticia/i,
    "admin.errors.news_save_failed",
    "No se pudo guardar la noticia. Inténtalo nuevamente.",
  ],
  [
    /^imagen inválida: la imagen supera el máximo de (\d+)/i,
    "admin.errors.image_too_large",
    "La imagen supera el máximo de {{mb}} MB.",
    m => ({ mb: m[1] }),
  ],
  [
    /^imagen inválida: formato no permitido/i,
    "admin.errors.image_format",
    "Formato de imagen no permitido. Usa JPG, PNG, GIF o WebP.",
  ],
  [
    /^(imagen inválida|archivo inválido|archivo 'image' requerido)/i,
    "admin.errors.image_invalid",
    "El archivo no es una imagen válida.",
  ],
  [
    /^precio inválido en (.+)$/i,
    "admin.errors.invalid_price",
    "Revisa el precio «{{field}}»: debe ser un número igual o mayor a 0.",
    m => ({ field: fieldLabel(m[1]) }),
  ],
  [
    /^valor inválido en (.+)$/i,
    "admin.errors.invalid_number",
    "Revisa «{{field}}»: debe ser un número entero igual o mayor a 0.",
    m => ({ field: fieldLabel(m[1]) }),
  ],
  [
    /^formato inválido en (.+?)\s*\(/i,
    "admin.errors.invalid_date",
    "Revisa «{{field}}»: la fecha no es válida.",
    m => ({ field: fieldLabel(m[1]) }),
  ],
  [
    /^la fecha de término no puede ser anterior/i,
    "admin.event_form.end_before_start",
    "La fecha de término es anterior al inicio.",
  ],
];

/**
 * User-facing text for an API error. apiGet/apiPost… already extract the
 * backend's {error|message|msg}. Known backend messages are translated; any
 * other backend text is only shown as-is when the UI is in Spanish (the API's
 * language). A raw HTML error page (Flask 500), a network error or an overly
 * long body falls back to the translated message.
 */
export function errorMessage(err, fallback) {
  const msg = typeof err?.message === "string" ? err.message.trim() : "";
  if (!msg || msg.length > 240 || /<[a-z!/]/i.test(msg) || /^HTTP \d+$/.test(msg)) {
    return fallback;
  }
  if (/failed to fetch|networkerror|load failed/i.test(msg)) return fallback;
  for (const [pattern, key, defaultValue, values] of BACKEND_ERRORS) {
    const match = msg.match(pattern);
    if (match) return i18n.t(key, { defaultValue, ...(values ? values(match) : {}) });
  }
  return currentLanguage(i18n) === "es" ? msg : fallback;
}

/** "2026-10-28T18:42:30.265" → "2026-10-28T18:42" for <input type="datetime-local">. */
export function toDateTimeLocal(value) {
  if (!value) return "";
  const str = String(value).trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(str)) return `${str}T00:00`;
  const match = str.match(/^(\d{4}-\d{2}-\d{2})[T ](\d{2}:\d{2})/);
  return match ? `${match[1]}T${match[2]}` : "";
}

/** Form value → number, or `empty` when the field is blank / invalid. */
export function toNumber(value, empty = null) {
  if (value === "" || value === null || value === undefined) return empty;
  const n = Number(value);
  return Number.isFinite(n) ? n : empty;
}

/** Case/accent-insensitive "contains" over several fields. */
const normalize = value =>
  String(value ?? "")
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase();

export function matchesQuery(query, ...fields) {
  const q = normalize(query).trim();
  if (!q) return true;
  return fields.some(field => normalize(field).includes(q));
}

/**
 * Two-letter avatar initials: first name + paternal surname, honorific
 * ignored ("Dr. Carlos López Martínez" → "CL"). Same helper as the member
 * directory and profile, so one person never gets two different avatars.
 */
export function nameInitials(name) {
  return memberInitials(name || "");
}

/** Copies text to the clipboard, with a fallback for non-secure contexts. */
export async function copyToClipboard(text) {
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch {
    // fall through to the legacy path
  }
  try {
    const area = document.createElement("textarea");
    area.value = text;
    area.setAttribute("readonly", "");
    area.style.position = "fixed";
    area.style.opacity = "0";
    document.body.appendChild(area);
    area.select();
    const ok = document.execCommand("copy");
    document.body.removeChild(area);
    return ok;
  } catch {
    return false;
  }
}

/** Sort helper: newest first by an ISO date field (missing dates last). */
export function byDateDesc(field) {
  return (a, b) => {
    const da = a?.[field] ? Date.parse(a[field]) : Number.NaN;
    const db = b?.[field] ? Date.parse(b[field]) : Number.NaN;
    if (Number.isNaN(da) && Number.isNaN(db)) return 0;
    if (Number.isNaN(da)) return 1;
    if (Number.isNaN(db)) return -1;
    return db - da;
  };
}

/**
 * An event counts as upcoming until it ends. The API's `is_past` is the
 * source of truth (America/Santiago, a 00:00 end means the whole day), so the
 * admin agrees with the public site; the browser-clock rule is only a
 * fallback for payloads without it.
 */
export function isUpcomingEvent(event, now = Date.now()) {
  if (typeof event?.is_past === "boolean") return !event.is_past;
  const end = parseApiDate(event?.end_date) || parseApiDate(event?.start_date);
  return Boolean(end && end.getTime() >= now);
}
