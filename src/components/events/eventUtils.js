// Shared helpers for the events area (listing, detail, enrollment modal).
import { getDateLocale, parseApiDate } from "../../utils/i18nLocale";

/**
 * Event prices are stored as plain numbers. SLACC is a multi-country society
 * and charges in US dollars; change it here if that ever changes.
 */
export const EVENT_CURRENCY = "USD";

// Locales used for money: they place "US$" before the amount and group
// thousands, which reads naturally for Latin-American users. en-CA is used for
// English because en-US prints a bare "$", which is ambiguous in the region.
const PRICE_LOCALES = { es: "es-CL", en: "en-CA", pt: "pt-BR" };

function langCode(lang) {
  return String(lang || "es").split("-")[0];
}

/** "US$1.200" / "$1,200" / "US$ 1.200"; 0 → "Gratis". */
export function formatPrice(amount, lang, t) {
  const value = Number(amount);
  if (amount === null || amount === undefined || !Number.isFinite(value)) return null;
  if (value <= 0) return t("common.free");
  const locale = PRICE_LOCALES[langCode(lang)] || PRICE_LOCALES.es;
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency: EVENT_CURRENCY,
    minimumFractionDigits: Number.isInteger(value) ? 0 : 2,
    maximumFractionDigits: 2,
  }).format(value);
}

/**
 * Same rule the backend uses when it records the amount to pay
 * (POST /events/:id/enroll): admins and active members with paid dues.
 */
export function isPayingMember(user) {
  if (!user || user.is_active === false) return false;
  return user.role === "admin" || (user.role === "member" && user.payment_status === "paid");
}

function memberPriceFor(event, membershipType) {
  const member = Number(event.price_member) || 0;
  if (membershipType === "joven") {
    return event.price_joven > 0 ? Number(event.price_joven) : member;
  }
  if (membershipType === "gratuito") {
    return event.price_gratuito > 0 ? Number(event.price_gratuito) : 0;
  }
  return member;
}

/** Price the current viewer will actually be charged, plus reference prices. */
export function getViewerPricing(event, user) {
  const general = Number(event.price_non_member) || 0;
  const member = Number(event.price_member) || 0;
  if (isPayingMember(user)) {
    const price = memberPriceFor(event, user.membership_type);
    const discount = general > 0 && price < general ? Math.round(((general - price) / general) * 100) : 0;
    return { price, general, member, isMemberPrice: true, discount, tier: user.membership_type || "normal" };
  }
  return { price: general, general, member, isMemberPrice: false, discount: 0, tier: "general" };
}

/* Kind ------------------------------------------------------------------- */

const KIND_META = {
  webinar: { icon: "fa-video", badge: "info" },
  course: { icon: "fa-graduation-cap", badge: "primary" },
  workshop: { icon: "fa-hand-holding-medical", badge: "primary" },
  congress: { icon: "fa-building-columns", badge: "accent" },
  symposium: { icon: "fa-people-group", badge: "primary" },
  in_person: { icon: "fa-calendar-days", badge: "secondary" },
};

/**
 * The API only knows the format (webinar | presencial); the kind of in-person
 * activity is inferred from the title so cards can say "Curso", "Taller"…
 */
export function getEventKind(event) {
  if (event.format === "webinar") return "webinar";
  const title = String(event.title || "").toLowerCase();
  if (/congres/.test(title)) return "congress";
  if (/simp[oó]sio|symposi/.test(title)) return "symposium";
  if (/taller|workshop|oficina/.test(title)) return "workshop";
  if (/curso|course/.test(title)) return "course";
  return "in_person";
}

export function kindMeta(kind) {
  return KIND_META[kind] || KIND_META.in_person;
}

export function kindLabel(kind, t) {
  switch (kind) {
    case "webinar":
      return t("events.format_webinar");
    case "course":
      return t("events.kind_course", "Curso");
    case "workshop":
      return t("events.kind_workshop", "Taller");
    case "congress":
      return t("events.kind_congress", "Congreso");
    case "symposium":
      return t("events.kind_symposium", "Simposio");
    default:
      return t("events.format_in_person");
  }
}

/** Courses & workshops view (/cursos): in-person training, not congresses. */
export function isCourseLike(event) {
  if (event.format === "webinar") return false;
  const kind = getEventKind(event);
  return kind !== "congress" && kind !== "symposium";
}

/* Status ----------------------------------------------------------------- */

const isMidnight = d => d.getHours() === 0 && d.getMinutes() === 0 && d.getSeconds() === 0;

// A value at exactly 00:00:00 came from a date-only input and means "that
// whole day" (same rule as slacc-backend/app/utils/event_time.py).
function wholeDayBound(date) {
  if (!date || !isMidnight(date)) return date;
  const next = new Date(date);
  next.setDate(next.getDate() + 1);
  return next;
}

function eventEnd(event) {
  const start = parseApiDate(event.start_date);
  const end = parseApiDate(event.end_date);
  if (end && (!start || end > start)) return end;
  return start;
}

const flag = value => (typeof value === "boolean" ? value : undefined);

/**
 * "ended" | "in_progress" | "inactive" | "closed" | "full" | "open".
 * Only "open" events accept enrollments (and only when not already enrolled).
 * Server flags (is_past, has_started, registration_open) win when the API
 * sends them: they are computed on the event's own clock, not the viewer's.
 */
export function getEventStatus(event, now = new Date()) {
  const start = parseApiDate(event.start_date);
  const end = wholeDayBound(eventEnd(event));
  const deadline = wholeDayBound(parseApiDate(event.registration_deadline));

  const ended = flag(event.is_past) ?? Boolean(end && end <= now);
  if (ended) return "ended";
  const started = flag(event.has_started) ?? Boolean(start && start <= now);
  if (started) return "in_progress";
  if (event.is_active === false) return "inactive";

  const open = flag(event.registration_open);
  if (open === true) return "open";
  if (deadline && deadline < now) return "closed";
  if (event.seats_left === 0) return "full";
  return open === false ? "closed" : "open";
}

export function isEnrollable(event, status = getEventStatus(event)) {
  return status === "open" && !event.is_enrolled;
}

/** Few seats left: highlighted on cards and in the detail aside. */
export function isLowSeats(event) {
  return typeof event.seats_left === "number" && event.seats_left > 0 && event.seats_left <= 10;
}

/** Badge shown next to the kind badge, or null when nothing to flag. */
export function statusBadge(event, status, t) {
  if (status === "ended") return { variant: "neutral", icon: "fa-flag-checkered", label: t("events.status_ended", "Finalizado") };
  if (status === "in_progress") return { variant: "info", icon: "fa-circle-play", label: t("events.status_in_progress", "En curso") };
  if (event.is_enrolled) return { variant: "success", icon: "fa-check", label: t("events.registered") };
  if (status === "inactive") return { variant: "neutral", icon: "fa-ban", label: t("events.status_unavailable", "No disponible") };
  if (status === "closed") return { variant: "warning", icon: "fa-lock", label: t("events.registration_closed") };
  if (status === "full") return { variant: "warning", icon: "fa-user-slash", label: t("events.status_full", "Cupos agotados") };
  if (isLowSeats(event)) return { variant: "warning", icon: "fa-hourglass-half", label: t("events.status_last_seats", "Últimos cupos") };
  return null;
}

/** Label for the (disabled) enroll button. */
export function enrollButtonLabel(event, status, t) {
  if (event.is_enrolled) return t("events.enrolled");
  if (status === "full") return t("events.status_full", "Cupos agotados");
  if (status === "inactive") return t("events.status_unavailable", "No disponible");
  if (status === "open") return t("events.enroll");
  return t("events.registration_closed");
}

/* Dates ------------------------------------------------------------------ */

/** Pieces for the date tile and fact rows (event dates are wall-clock). */
export function getDateParts(value, lang) {
  const date = parseApiDate(value);
  if (!date) return null;
  const locale = getDateLocale(lang);
  return {
    date,
    day: date.toLocaleDateString(locale, { day: "numeric" }),
    month: date.toLocaleDateString(locale, { month: "short" }).replace(/\.$/, ""),
    year: String(date.getFullYear()),
    long: date.toLocaleDateString(locale, { weekday: "long", day: "numeric", month: "long", year: "numeric" }),
    time: date.toLocaleTimeString(locale, { hour: "numeric", minute: "2-digit" }),
  };
}

function sameDay(a, b) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

function formatRange(start, end, locale, options) {
  const fmt = new Intl.DateTimeFormat(locale, options);
  if (typeof fmt.formatRange === "function") return fmt.formatRange(start, end);
  return `${fmt.format(start)} – ${fmt.format(end)}`;
}

/**
 * Human schedule for an event:
 *  { dateText: "miércoles, 21 de octubre de 2026", timeText: "18:42 – 20:42", shortDate: "21 oct" }
 * Multi-day events get a date range and no time range.
 */
export function getSchedule(event, lang) {
  const start = parseApiDate(event.start_date);
  if (!start) return null;
  const locale = getDateLocale(lang);
  const rawEnd = parseApiDate(event.end_date);
  const end = rawEnd && rawEnd > start ? rawEnd : null;
  const time = d => d.toLocaleTimeString(locale, { hour: "numeric", minute: "2-digit" });

  if (end && !sameDay(start, end)) {
    return {
      multiDay: true,
      dateText: formatRange(start, end, locale, { day: "numeric", month: "long", year: "numeric" }),
      shortDate: formatRange(start, end, locale, { day: "numeric", month: "short" }),
      timeText: time(start),
    };
  }
  return {
    multiDay: false,
    dateText: start.toLocaleDateString(locale, { weekday: "long", day: "numeric", month: "long", year: "numeric" }),
    shortDate: null,
    timeText: end ? `${time(start)} – ${time(end)}` : time(start),
  };
}

/** "2 horas", "1,5 horas" (decimal separator follows the language). */
export function formatHours(hours, t, lang) {
  const n = Number(hours);
  if (!hours || !Number.isFinite(n) || n <= 0) return null;
  const value = new Intl.NumberFormat(getDateLocale(lang), { maximumFractionDigits: 2 }).format(n);
  return `${value} ${n === 1 ? t("common.hour_one") : t("common.hour_other")}`;
}

export function seatsText(event, t) {
  if (!event.max_students) return null;
  if (event.seats_left === 0) return t("events.status_full", "Cupos agotados");
  if (typeof event.seats_left === "number") {
    return t("events.seats_left", {
      count: event.seats_left,
      defaultValue_one: "{{count}} cupo disponible",
      defaultValue_other: "{{count}} cupos disponibles",
    });
  }
  return `${event.max_students} ${t("common.spots")}`;
}

/* Misc ------------------------------------------------------------------- */

export function isHttpUrl(value) {
  return typeof value === "string" && /^https?:\/\/\S+$/i.test(value.trim());
}

const BACKEND_ERRORS = [
  [/cupos completos/i, "events.err_full", "No quedan cupos disponibles para este evento."],
  [/ya est[aá]s inscrito/i, "events.err_already_enrolled", "Este correo ya está inscrito en el evento."],
  [/plazo de inscripci[oó]n/i, "events.err_deadline", "El plazo de inscripción ya terminó."],
  [/no est[aá] activo/i, "events.err_inactive", "Este evento no está disponible para inscripciones."],
  [/ya finaliz/i, "events.ended_text", "Este evento ya finalizó."],
  [/cuenta registrada/i, "events.err_login_required", "Este correo pertenece a una cuenta registrada. Inicia sesión para inscribirte."],
  [/email inv[aá]lido/i, "events.err_email_invalid", "Ingresa un correo electrónico válido."],
  [/nombre y email/i, "events.err_name_email", "Nombre y email son requeridos"],
];

/** The email belongs to a registered account: the guest must sign in instead. */
export function isLoginRequiredError(err) {
  return /cuenta registrada/i.test(String(err?.message || ""));
}

/** Translated, human message for a failed enrollment request. */
export function enrollErrorMessage(err, t) {
  const message = String(err?.message || "");
  for (const [pattern, key, fallback] of BACKEND_ERRORS) {
    if (pattern.test(message)) return t(key, fallback);
  }
  if (
    !message ||
    /^\s*</.test(message) ||
    /^HTTP \d+/.test(message) ||
    /failed to fetch|networkerror|load failed/i.test(message)
  ) {
    return t("events.enroll_error");
  }
  return message;
}
