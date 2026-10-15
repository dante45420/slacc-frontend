// One place for the labels and badge colours of every admin status, so the
// list, the forms and the overview never disagree.
import { useMemo } from "react";
import { useTranslation } from "react-i18next";

// Same order as the public join form and the admin detail pages.
export const MEMBERSHIP_TYPES = ["joven", "normal", "gratuito"];
export const PAYMENT_STATUSES = ["paid", "due", "none"];
export const NEWS_STATUSES = ["published", "pending", "rejected"];
export const NEWS_CATEGORIES = ["articulos-cientificos", "articulos-destacados", "editoriales"];
export const APPLICATION_STATUSES = ["pending", "payment_pending", "paid", "rejected"];

export function useAdminLabels() {
  const { t, i18n } = useTranslation();

  return useMemo(() => {
    // The adminDetail.* keys are the labels the member / application detail
    // pages show, so a membership reads the same everywhere in the admin.
    const membership = type => {
      const map = {
        joven: t("adminDetail.membership_joven", "Next Gen"),
        normal: t("adminDetail.membership_normal", "Socio Normal"),
        gratuito: t("adminDetail.membership_gratuito", "Socio Emérito"),
      };
      return map[type] || (type ? type : t("admin.labels.none", "—"));
    };

    const payment = status => {
      const map = {
        paid: { label: t("admin.labels.payment_paid", "Al día"), variant: "success" },
        due: { label: t("admin.labels.payment_due", "Pago pendiente"), variant: "warning" },
        none: { label: t("admin.labels.payment_none", "Sin pago"), variant: "neutral" },
      };
      return map[status || "none"] || { label: status, variant: "neutral" };
    };

    const role = value =>
      value === "admin"
        ? { label: t("admin.labels.role_admin", "Administrador"), variant: "primary" }
        : { label: t("admin.labels.role_member", "Socio"), variant: "neutral" };

    const active = isActive =>
      isActive
        ? { label: t("admin.labels.active", "Activo"), variant: "success" }
        : { label: t("admin.labels.inactive", "Inactivo"), variant: "neutral" };

    const application = status => {
      const map = {
        pending: { label: t("admin.labels.app_pending", "Por revisar"), variant: "warning" },
        approved: { label: t("admin.labels.app_payment_pending", "Esperando pago"), variant: "info" },
        payment_pending: {
          label: t("admin.labels.app_payment_pending", "Esperando pago"),
          variant: "info",
        },
        paid: { label: t("admin.labels.app_paid", "Pagada"), variant: "success" },
        rejected: { label: t("admin.labels.app_rejected", "Rechazada"), variant: "danger" },
      };
      return map[status] || { label: status || t("admin.labels.none", "—"), variant: "neutral" };
    };

    const news = status => {
      const map = {
        published: { label: t("admin.labels.news_published", "Publicada"), variant: "success" },
        pending: { label: t("admin.labels.news_pending", "Pendiente"), variant: "warning" },
        rejected: { label: t("admin.labels.news_rejected", "Rechazada"), variant: "danger" },
      };
      return map[status] || { label: status || t("admin.labels.none", "—"), variant: "neutral" };
    };

    const category = value => {
      const map = {
        "articulos-cientificos": t("header.scientific_articles", "Artículos científicos"),
        "articulos-destacados": t("header.featured_articles", "Artículos destacados"),
        editoriales: t("header.editorials", "Editoriales"),
      };
      return map[value] || value || t("admin.labels.none", "—");
    };

    const format = value =>
      value === "presencial"
        ? { label: t("admin.labels.format_in_person", "Presencial"), variant: "secondary" }
        : { label: t("admin.labels.format_webinar", "Webinar"), variant: "info" };

    const enrollment = status => {
      const map = {
        paid: { label: t("admin.labels.enrollment_paid", "Pagado"), variant: "success" },
        pending: { label: t("admin.labels.enrollment_pending", "Pago pendiente"), variant: "warning" },
        cancelled: { label: t("admin.labels.enrollment_cancelled", "Cancelado"), variant: "neutral" },
      };
      return map[status] || { label: status || t("admin.labels.none", "—"), variant: "neutral" };
    };

    return { membership, payment, role, active, application, news, category, format, enrollment };
    // i18n.language re-creates the helpers when the UI language changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [t, i18n.language]);
}
