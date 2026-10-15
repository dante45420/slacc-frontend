import { useCallback, useEffect, useRef, useState } from "react";
import PropTypes from "prop-types";
import { useTranslation } from "react-i18next";
import { apiGet } from "../../api/client";
import { currentLanguage } from "../../i18n";
import { formatTimestamp } from "../../utils/i18nLocale";
import { formatPrice } from "../events/eventUtils";
import { Button, Modal, Table } from "../ui";
import { AdminError, AdminLoading, CopyButton, PrimaryCell, StatusBadge } from "./AdminCommon";
import { useAdminLabels } from "./adminLabels";
import { errorMessage } from "./adminUtils";
import useAdminSession from "./useAdminSession";

/** Enrolment list for one event (GET /admin/events/:id/enrollments). */
export default function EnrollmentsModal({ event, onClose }) {
  const { t, i18n } = useTranslation();
  const lang = currentLanguage(i18n);
  const labels = useAdminLabels();
  const { handleAuthError } = useAdminSession();
  const [state, setState] = useState({ status: "loading", data: null, error: null });
  const requestId = useRef(0);
  const eventId = event?.id;

  const load = useCallback(async () => {
    if (!eventId) return;
    const id = ++requestId.current;
    setState({ status: "loading", data: null, error: null });
    try {
      const data = await apiGet(`/admin/events/${eventId}/enrollments`);
      if (id === requestId.current) setState({ status: "ready", data, error: null });
    } catch (err) {
      if (id !== requestId.current || handleAuthError(err)) return;
      setState({ status: "error", data: null, error: err });
    }
  }, [eventId, handleAuthError]);

  useEffect(() => {
    if (eventId) load();
    return () => {
      requestId.current += 1;
    };
  }, [eventId, load]);

  const all = Array.isArray(state.data?.enrollments) ? state.data.enrollments : [];
  const active = all.filter(e => e.payment_status !== "cancelled");
  const cancelled = all.length - active.length;
  const paid = active.filter(e => e.payment_status === "paid").length;
  const capacity = state.data?.event?.max_students ?? event?.max_students ?? null;
  const seatsLeft = capacity ? Math.max(0, capacity - active.length) : null;

  const columns = [
    {
      key: "student_name",
      label: t("admin.enrollments.col_name", "Participante"),
      className: "admin-col-primary",
      render: row => (
        <PrimaryCell
          title={row.student_name || "—"}
          subtitle={
            row.is_member
              ? row.membership_type
                ? labels.membership(row.membership_type)
                : t("admin.enrollments.member", "Socio")
              : t("admin.enrollments.non_member", "No socio")
          }
        />
      ),
    },
    {
      key: "student_email",
      label: t("admin.enrollments.col_contact", "Contacto"),
      render: row => (
        <div className="admin-contact">
          <a href={`mailto:${row.student_email}`}>{row.student_email}</a>
          {row.student_phone && <span>{row.student_phone}</span>}
        </div>
      ),
    },
    {
      key: "payment_status",
      label: t("admin.enrollments.col_payment", "Pago"),
      render: row => <StatusBadge {...labels.enrollment(row.payment_status)} />,
    },
    {
      key: "payment_amount",
      label: t("admin.enrollments.col_amount", "Monto"),
      className: "admin-col-num admin-col-nowrap",
      render: row => formatPrice(row.payment_amount, lang, t) ?? "—",
    },
    {
      key: "enrollment_date",
      label: t("admin.enrollments.col_date", "Inscripción"),
      className: "admin-col-nowrap",
      render: row => formatTimestamp(row.enrollment_date, { month: "short" }, lang) || "—",
    },
  ];

  const emails = active.map(e => e.student_email).filter(Boolean).join(", ");

  return (
    <Modal
      isOpen
      onClose={onClose}
      title={t("admin.enrollments.title", "Inscritos")}
      size="large"
    >
      <div className="admin-enrollments">
        <p className="admin-enrollments__event">{event.title}</p>

        {state.status === "loading" && (
          <AdminLoading label={t("admin.enrollments.loading", "Cargando inscritos…")} />
        )}
        {state.status === "error" && (
          <AdminError
            title={t("admin.enrollments.load_error", "No se pudo cargar la lista de inscritos.")}
            message={errorMessage(state.error, t("admin.common.load_error_hint", "Revisa tu conexión e inténtalo de nuevo."))}
            onRetry={load}
          />
        )}
        {state.status === "ready" && (
          <>
            <dl className="admin-enrollments__stats">
              <div>
                <dt>{t("admin.enrollments.enrolled", "Inscritos")}</dt>
                <dd>{active.length}</dd>
              </div>
              <div>
                <dt>{t("admin.enrollments.paid", "Pagados")}</dt>
                <dd>{paid}</dd>
              </div>
              <div>
                <dt>{t("admin.enrollments.capacity", "Cupos")}</dt>
                <dd>{capacity ?? t("common.unlimited", "Sin límite")}</dd>
              </div>
              <div>
                <dt>{t("admin.enrollments.available", "Disponibles")}</dt>
                <dd>{seatsLeft ?? "—"}</dd>
              </div>
            </dl>
            {cancelled > 0 && (
              <p className="admin-enrollments__note">
                {t("admin.enrollments.cancelled_note", {
                  count: cancelled,
                  defaultValue_one: "{{count}} inscripción cancelada no se muestra.",
                  defaultValue: "{{count}} inscripciones canceladas no se muestran.",
                })}
              </p>
            )}
            <Table
              columns={columns}
              data={active}
              className="admin-table"
              emptyText={t("admin.enrollments.empty", "Todavía no hay inscritos en este evento.")}
            />
          </>
        )}

        <div className="modal-footer admin-modal-footer">
          {state.status === "ready" && emails && (
            <CopyButton
              text={emails}
              label={t("admin.enrollments.copy_emails", "Copiar emails de los inscritos")}
              display={t("admin.enrollments.copy_emails_short", "Copiar emails")}
            />
          )}
          <Button variant="outline" onClick={onClose}>
            {t("common.close", "Cerrar")}
          </Button>
        </div>
      </div>
    </Modal>
  );
}

EnrollmentsModal.propTypes = {
  event: PropTypes.shape({
    id: PropTypes.number.isRequired,
    title: PropTypes.string,
    max_students: PropTypes.number,
  }).isRequired,
  onClose: PropTypes.func.isRequired,
};
