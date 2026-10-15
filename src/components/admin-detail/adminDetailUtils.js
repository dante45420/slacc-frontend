// Shared labels and helpers for the admin detail pages
// (application detail, member view / edit / new).

export const APPLICATIONS_TAB = "/admin?tab=applications";
export const USERS_TAB = "/admin?tab=users";

/* Application status ----------------------------------------------------- */

const APPLICATION_STATUS_VARIANTS = {
  pending: "warning",
  approved: "info",
  payment_pending: "info",
  paid: "success",
  rejected: "danger",
};

export function applicationStatusVariant(status) {
  return APPLICATION_STATUS_VARIANTS[status] || "neutral";
}

export function applicationStatusLabel(t, status) {
  const labels = {
    pending: t("adminDetail.status_pending", "Pendiente de revisión"),
    approved: t("adminDetail.status_approved", "Aprobada"),
    payment_pending: t("adminDetail.status_payment_pending", "Esperando pago"),
    paid: t("adminDetail.status_paid", "Pagada · Socio creado"),
    rejected: t("adminDetail.status_rejected", "Rechazada"),
  };
  return labels[status] || status || "—";
}

/* Membership ------------------------------------------------------------- */

export const MEMBERSHIP_TYPES = ["joven", "normal", "gratuito"];

export function membershipLabel(t, type) {
  const labels = {
    joven: t("adminDetail.membership_joven", "Next Gen"),
    normal: t("adminDetail.membership_normal", "Socio Normal"),
    gratuito: t("adminDetail.membership_gratuito", "Socio Emérito"),
  };
  return labels[type] || type || t("adminDetail.not_defined", "No definido");
}

/** Label with the yearly fee, for the approval decision. */
export function membershipPriceLabel(t, type) {
  const labels = {
    joven: t("adminDetail.membership_joven_price", "Next Gen · $30/año"),
    normal: t("adminDetail.membership_normal_price", "Socio Normal · $100/año"),
    gratuito: t("adminDetail.membership_gratuito_price", "Socio Emérito · Sin costo"),
  };
  return labels[type] || membershipLabel(t, type);
}

export function membershipDescription(t, type) {
  const labels = {
    joven: t("adminDetail.membership_joven_desc", "Para médicos recién egresados."),
    normal: t("adminDetail.membership_normal_desc", "Para profesionales con experiencia."),
    gratuito: t(
      "adminDetail.membership_gratuito_desc",
      "Para invitados de alto estatus. No paga cuota.",
    ),
  };
  return labels[type] || "";
}

/* Payment / account ------------------------------------------------------ */

const PAYMENT_VARIANTS = { paid: "success", due: "warning", none: "neutral" };

export function paymentVariant(status) {
  return PAYMENT_VARIANTS[status] || "neutral";
}

export function paymentLabel(t, status) {
  const labels = {
    paid: t("adminDetail.payment_paid", "Pagado"),
    due: t("adminDetail.payment_due", "Pendiente"),
    none: t("adminDetail.payment_none", "Sin pago"),
  };
  return labels[status] || labels.none;
}

export function roleLabel(t, role) {
  return role === "admin"
    ? t("adminDetail.role_admin", "Administrador")
    : t("adminDetail.role_member", "Socio");
}

/* Errors ----------------------------------------------------------------- */

/**
 * Message to show for a failed request: the backend's own text when it is a
 * readable sentence, otherwise the translated fallback (HTML error pages,
 * network errors, bare "HTTP 500"…).
 */
export function errorMessage(err, fallback) {
  const msg = typeof err?.message === "string" ? err.message.trim() : "";
  if (
    !msg ||
    msg.startsWith("<") ||
    msg.length > 240 ||
    /^HTTP \d+$/.test(msg) ||
    /failed to fetch|networkerror|load failed/i.test(msg) ||
    msg === "Forbidden"
  ) {
    return fallback;
  }
  return msg;
}

/* Links ------------------------------------------------------------------ */

/**
 * Only http(s) URLs become links (an applicant can type anything in
 * "website", including javascript: URLs). Bare domains get https://.
 */
export function safeExternalUrl(value) {
  const v = String(value || "").trim();
  if (!v || /\s/.test(v)) return null;
  if (/^https?:\/\/[^/\s]+/i.test(v)) return v;
  if (/^(www\.)?[a-z0-9-]+(\.[a-z0-9-]+)+(\/\S*)?$/i.test(v)) return `https://${v}`;
  return null;
}

export function whatsappUrl(value) {
  const digits = String(value || "").replace(/\D/g, "");
  return digits.length >= 8 ? `https://wa.me/${digits}` : null;
}

export function telUrl(value) {
  const clean = String(value || "").replace(/[^\d+]/g, "");
  return clean.replace(/\D/g, "").length >= 6 ? `tel:${clean}` : null;
}

export function fileNameFromUrl(url) {
  if (!url) return "";
  const last = String(url).split(/[?#]/)[0].split("/").pop() || "";
  try {
    return decodeURIComponent(last);
  } catch {
    return last;
  }
}

/* Clipboard -------------------------------------------------------------- */

/** Copies text, falling back to execCommand outside secure contexts. */
export async function copyText(text) {
  if (typeof navigator !== "undefined" && navigator.clipboard && window.isSecureContext) {
    await navigator.clipboard.writeText(text);
    return;
  }
  const area = document.createElement("textarea");
  area.value = text;
  area.setAttribute("readonly", "");
  area.style.position = "fixed";
  area.style.top = "0";
  area.style.left = "0";
  area.style.opacity = "0";
  document.body.appendChild(area);
  area.select();
  const ok = document.execCommand("copy");
  document.body.removeChild(area);
  if (!ok) throw new Error("copy failed");
}
