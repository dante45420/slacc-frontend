import { Fragment, useCallback, useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import PropTypes from "prop-types";
import { useTranslation } from "react-i18next";
import { apiGet, apiPost, assetUrl } from "../../api/client";
import { currentLanguage } from "../../i18n";
import useDocumentTitle from "../../hooks/useDocumentTitle";
import { formatDate, formatTimestamp } from "../../utils/i18nLocale";
import { Alert, Button, Modal, Section, Select, Textarea, useToast } from "../../components/ui";
import {
  BackLink,
  ConfirmDialog,
  CredentialsPanel,
  DetailCard,
  DetailLoading,
  DetailUnavailable,
  DetailValue,
  StatusBadge,
} from "../../components/admin-detail/AdminDetailParts";
import {
  APPLICATIONS_TAB,
  MEMBERSHIP_TYPES,
  applicationStatusLabel,
  applicationStatusVariant,
  errorMessage,
  fileNameFromUrl,
  membershipDescription,
  membershipLabel,
  membershipPriceLabel,
  safeExternalUrl,
  telUrl,
  whatsappUrl,
} from "../../components/admin-detail/adminDetailUtils";

/* Helpers ---------------------------------------------------------------- */

function ExternalLink({ href, children }) {
  const { t } = useTranslation();
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" className="admin-detail-link">
      {children}
      <span className="sr-only"> ({t("adminDetail.new_tab", "se abre en una pestaña nueva")})</span>
    </a>
  );
}

ExternalLink.propTypes = {
  href: PropTypes.string.isRequired,
  children: PropTypes.node.isRequired,
};

/** <dl> rows from [{ key, label, value }] (value already rendered). */
function FieldList({ fields }) {
  return (
    <dl className="detail-list admin-detail-dl">
      {fields.map(field => (
        <Fragment key={field.key}>
          <dt>{field.label}</dt>
          <dd>
            <DetailValue>{field.value}</DetailValue>
          </dd>
        </Fragment>
      ))}
    </dl>
  );
}

FieldList.propTypes = {
  fields: PropTypes.arrayOf(
    PropTypes.shape({
      key: PropTypes.string.isRequired,
      label: PropTypes.node.isRequired,
      value: PropTypes.node,
    }),
  ).isRequired,
};

function buildSteps(app, t, lang) {
  const short = { month: "short" };
  const received = {
    key: "received",
    label: t("adminDetail.step_received", "Solicitud recibida"),
    date: formatTimestamp(app.created_at, short, lang),
    state: "done",
  };
  const decided = formatTimestamp(app.decided_at, short, lang);
  const upcomingPayment = {
    key: "payment",
    label: t("adminDetail.step_payment", "Pago de la cuota"),
    state: "upcoming",
  };
  const upcomingMember = {
    key: "member",
    label: t("adminDetail.step_member", "Cuenta de socio creada"),
    state: "upcoming",
  };

  switch (app.status) {
    case "pending":
      return [
        received,
        { key: "review", label: t("adminDetail.step_review", "En revisión"), state: "current" },
        upcomingPayment,
        upcomingMember,
      ];
    case "approved":
    case "payment_pending":
      return [
        received,
        {
          key: "review",
          label: t("adminDetail.step_approved", "Aprobada"),
          date: decided,
          state: "done",
        },
        {
          key: "payment",
          label: t("adminDetail.step_awaiting_payment", "Esperando pago"),
          state: "current",
        },
        upcomingMember,
      ];
    case "paid":
      return [
        received,
        { key: "review", label: t("adminDetail.step_approved", "Aprobada"), state: "done" },
        {
          key: "payment",
          label: t("adminDetail.step_paid", "Pago confirmado"),
          date: decided,
          state: "done",
        },
        { ...upcomingMember, state: "done" },
      ];
    case "rejected":
      return [
        received,
        {
          key: "review",
          label: t("adminDetail.step_rejected", "Rechazada"),
          date: decided,
          state: "rejected",
        },
      ];
    default:
      return [received];
  }
}

function StatusSteps({ steps }) {
  const { t } = useTranslation();
  const stateText = {
    done: t("adminDetail.step_state_done", "completado"),
    current: t("adminDetail.step_state_current", "en curso"),
    upcoming: t("adminDetail.step_state_upcoming", "pendiente"),
    rejected: t("adminDetail.step_state_rejected", "rechazado"),
  };
  const icons = {
    done: "fa-solid fa-check",
    current: "fa-solid fa-circle",
    rejected: "fa-solid fa-xmark",
  };
  return (
    <ol className="admin-detail-steps">
      {steps.map(step => (
        <li
          key={step.key}
          className={`admin-detail-step is-${step.state}`}
          aria-current={step.state === "current" ? "step" : undefined}
        >
          <span className="admin-detail-step__marker" aria-hidden="true">
            {icons[step.state] && <i className={icons[step.state]}></i>}
          </span>
          <span className="admin-detail-step__body">
            <span className="admin-detail-step__label">
              {step.label}
              <span className="sr-only"> ({stateText[step.state]})</span>
            </span>
            {step.date && <span className="admin-detail-step__date">{step.date}</span>}
          </span>
        </li>
      ))}
    </ol>
  );
}

StatusSteps.propTypes = {
  steps: PropTypes.arrayOf(
    PropTypes.shape({
      key: PropTypes.string.isRequired,
      label: PropTypes.string.isRequired,
      date: PropTypes.string,
      state: PropTypes.oneOf(["done", "current", "upcoming", "rejected"]).isRequired,
    }),
  ).isRequired,
};

/* Page ------------------------------------------------------------------- */

export default function ApplicationDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const { t, i18n } = useTranslation();
  const lang = currentLanguage(i18n);

  const [state, setState] = useState({ status: "loading", app: null });
  const [membershipType, setMembershipType] = useState("normal");
  const [resolutionNote, setResolutionNote] = useState("");
  const [submitting, setSubmitting] = useState(null); // "approve" | "reject" | "confirm"
  const [confirming, setConfirming] = useState(null); // "reject" | "confirm"
  const [actionError, setActionError] = useState("");
  const [actionMsg, setActionMsg] = useState("");
  const [credentials, setCredentials] = useState(null);

  const mounted = useRef(true);
  const requestId = useRef(0);
  const inFlight = useRef(false); // guards against double submits within one tick

  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);

  const loadApplication = useCallback(
    async ({ silent = false } = {}) => {
      const current = ++requestId.current;
      if (!silent) setState({ status: "loading", app: null });
      try {
        const data = await apiGet(`/admin/applications/${id}`);
        if (!mounted.current || current !== requestId.current) return;
        setState({ status: "ready", app: data });
        setMembershipType(data.membership_type || "normal");
        setResolutionNote(data.resolution_note || "");
      } catch (err) {
        if (!mounted.current || current !== requestId.current || silent) return;
        setState({ status: err?.status === 404 ? "not_found" : "error", app: null });
      }
    },
    [id],
  );

  useEffect(() => {
    setActionError("");
    setActionMsg("");
    setCredentials(null);
    loadApplication();
  }, [loadApplication]);

  const app = state.app;

  useDocumentTitle(
    state.status === "ready"
      ? app.name
      : state.status === "not_found"
        ? t("adminDetail.app_not_found", "Postulación no encontrada")
        : undefined,
  );

  async function approveApplication() {
    if (!app || submitting || inFlight.current) return;
    inFlight.current = true;
    setSubmitting("approve");
    setActionError("");
    setActionMsg("");
    try {
      await apiPost(`/admin/applications/${app.id}/approve`, {
        membership_type: membershipType,
        note: resolutionNote,
      });
      if (!mounted.current) return;
      setActionMsg(
        t(
          "adminDetail.approved_msg",
          "Postulación aprobada. Queda a la espera del pago de la cuota.",
        ),
      );
      toast.success(t("adminDetail.approved_toast", "Postulación aprobada"));
      await loadApplication({ silent: true });
    } catch (err) {
      if (!mounted.current) return;
      setActionError(
        errorMessage(err, t("adminDetail.approve_error", "No se pudo aprobar la postulación.")),
      );
      loadApplication({ silent: true });
    } finally {
      inFlight.current = false;
      if (mounted.current) setSubmitting(null);
    }
  }

  async function rejectApplication() {
    if (!app || submitting || inFlight.current) return;
    inFlight.current = true;
    setSubmitting("reject");
    setActionError("");
    setActionMsg("");
    try {
      await apiPost(`/admin/applications/${app.id}/reject`, { note: resolutionNote });
      if (!mounted.current) return;
      toast.success(t("adminDetail.rejected_toast", "Postulación rechazada"));
      setConfirming(null);
      navigate(APPLICATIONS_TAB);
    } catch (err) {
      if (!mounted.current) return;
      setConfirming(null);
      setActionError(
        errorMessage(err, t("adminDetail.reject_error", "No se pudo rechazar la postulación.")),
      );
      loadApplication({ silent: true });
    } finally {
      inFlight.current = false;
      if (mounted.current) setSubmitting(null);
    }
  }

  async function confirmPayment() {
    if (!app || submitting || inFlight.current) return;
    inFlight.current = true;
    setSubmitting("confirm");
    setActionError("");
    setActionMsg("");
    try {
      const result = await apiPost(`/admin/applications/${app.id}/confirm-payment`);
      if (!mounted.current) return;
      setConfirming(null);
      if (result?.credentials) {
        setCredentials(result.credentials);
        loadApplication({ silent: true });
      } else {
        toast.success(
          errorMessage(
            { message: result?.message },
            t("adminDetail.payment_confirmed", "Pago confirmado. La cuenta de socio fue creada."),
          ),
        );
        navigate(APPLICATIONS_TAB);
      }
    } catch (err) {
      if (!mounted.current) return;
      setConfirming(null);
      setActionError(
        errorMessage(err, t("adminDetail.confirm_error", "No se pudo confirmar el pago.")),
      );
      loadApplication({ silent: true });
    } finally {
      inFlight.current = false;
      if (mounted.current) setSubmitting(null);
    }
  }

  function closeCredentials() {
    setCredentials(null);
    navigate(APPLICATIONS_TAB);
  }

  /* States -------------------------------------------------------------- */

  if (state.status === "loading") {
    return <DetailLoading label={t("adminDetail.app_loading", "Cargando postulación…")} />;
  }

  if (state.status !== "ready" || !app) {
    const notFound = state.status === "not_found";
    return (
      <DetailUnavailable
        notFound={notFound}
        icon="fa-regular fa-file-lines"
        title={
          notFound
            ? t("adminDetail.app_not_found", "Postulación no encontrada")
            : t("adminDetail.app_load_error", "No pudimos cargar la postulación")
        }
        description={
          notFound
            ? t(
                "adminDetail.app_not_found_desc",
                "Es posible que el enlace no sea correcto o que la postulación ya no exista.",
              )
            : t(
                "adminDetail.load_error_desc",
                "Revisa tu conexión e inténtalo nuevamente en unos segundos.",
              )
        }
        backTo={APPLICATIONS_TAB}
        backLabel={t("adminDetail.back_applications", "Volver a postulaciones")}
        onRetry={() => loadApplication()}
      />
    );
  }

  /* Data ---------------------------------------------------------------- */

  const statusLabel = applicationStatusLabel(t, app.status);
  const statusVariant = applicationStatusVariant(app.status);
  const receivedOn = formatTimestamp(app.created_at, {}, lang);
  const website = safeExternalUrl(app.website);
  const whatsapp = whatsappUrl(app.whatsapp);
  const phone = telUrl(app.phone);
  const attachments = Array.isArray(app.attachments) ? app.attachments : [];
  const busy = submitting !== null;
  const hasYears =
    app.experience_years !== null &&
    app.experience_years !== undefined &&
    app.experience_years !== "";

  const personal = [
    { key: "name", label: t("adminDetail.f_name", "Nombre completo"), value: app.name },
    {
      key: "email",
      label: t("adminDetail.f_email", "Correo electrónico"),
      value: app.email ? (
        <a href={`mailto:${app.email}`} className="admin-detail-link">
          {app.email}
        </a>
      ) : null,
    },
    app.phone && {
      key: "phone",
      label: t("adminDetail.f_phone", "Teléfono"),
      value: phone ? (
        <a href={phone} className="admin-detail-link">
          {app.phone}
        </a>
      ) : (
        app.phone
      ),
    },
    {
      key: "whatsapp",
      label: t("adminDetail.f_whatsapp", "WhatsApp"),
      value:
        app.whatsapp && whatsapp ? (
          <ExternalLink href={whatsapp}>{app.whatsapp}</ExternalLink>
        ) : (
          app.whatsapp
        ),
    },
    { key: "city", label: t("adminDetail.f_city", "Ciudad"), value: app.city },
    { key: "country", label: t("adminDetail.f_country", "País"), value: app.country },
    {
      key: "website",
      label: t("adminDetail.f_website", "Página web"),
      value: website ? <ExternalLink href={website}>{app.website}</ExternalLink> : app.website,
    },
  ].filter(Boolean);

  const academic = [
    {
      key: "specialization",
      label: t("adminDetail.f_specialization", "Especialidad"),
      value: app.specialization,
    },
    {
      key: "residency",
      label: t("adminDetail.f_residency_end", "Término de la residencia"),
      value: formatDate(app.residency_end_date, {}, lang),
    },
    { key: "university", label: t("adminDetail.f_university", "Universidad"), value: app.university },
    {
      key: "fellowship_date",
      label: t("adminDetail.f_fellowship_date", "Fecha del fellow de cadera"),
      value: formatDate(app.fellowship_date, {}, lang),
    },
    {
      key: "fellowship_location",
      label: t("adminDetail.f_fellowship_location", "Lugar del fellow"),
      value: app.fellowship_location,
    },
  ];

  const professional = [
    {
      key: "hospital",
      label: t("adminDetail.f_hospital", "Hospital actual"),
      value: app.current_hospital,
    },
    {
      key: "position",
      label: t("adminDetail.f_position", "Cargo actual"),
      value: app.current_position,
    },
    {
      key: "teaching",
      label: t("adminDetail.f_teaching_degree", "Grado docente"),
      value: app.teaching_degree,
    },
    hasYears && {
      key: "years",
      label: t("adminDetail.f_experience", "Años de experiencia"),
      value: t("adminDetail.years", {
        count: Number(app.experience_years),
        defaultValue: Number(app.experience_years) === 1 ? "1 año" : `${app.experience_years} años`,
      }),
    },
  ].filter(Boolean);

  const membershipOptions = MEMBERSHIP_TYPES.map(type => ({
    value: type,
    label: membershipPriceLabel(t, type),
  }));

  const showNote = app.status !== "pending" && app.resolution_note;
  const showCredentials = app.status === "paid" && Boolean(app.initial_password);

  return (
    <div className="page admin-detail">
      <header className="page-hero admin-detail-hero">
        <div className="page-hero__inner">
          <BackLink to={APPLICATIONS_TAB}>
            {t("adminDetail.back_applications", "Volver a postulaciones")}
          </BackLink>
          <div className="admin-detail-hero__eyebrow">
            <p className="page-hero-kicker">
              {t("adminDetail.app_kicker", "Postulación #{{id}}", { id: app.id })}
            </p>
            <StatusBadge variant={statusVariant}>{statusLabel}</StatusBadge>
          </div>
          <h1 className="page-hero-title admin-detail-hero__title">{app.name}</h1>
          <ul className="admin-detail-hero__meta">
            {app.email && (
              <li>
                <i className="fa-regular fa-envelope" aria-hidden="true"></i>
                <span>{app.email}</span>
              </li>
            )}
            {receivedOn && (
              <li>
                <i className="fa-regular fa-calendar" aria-hidden="true"></i>
                <span>{t("adminDetail.received_on", "Recibida el {{date}}", { date: receivedOn })}</span>
              </li>
            )}
            {app.specialization && (
              <li>
                <i className="fa-solid fa-stethoscope" aria-hidden="true"></i>
                <span>{app.specialization}</span>
              </li>
            )}
          </ul>
          {app.email && (
            <div className="page-hero__actions admin-detail-hero__actions">
              <Button variant="outline" href={`mailto:${app.email}`}>
                <i className="fa-regular fa-paper-plane" aria-hidden="true"></i>
                {t("adminDetail.email_applicant", "Escribir al postulante")}
              </Button>
            </div>
          )}
        </div>
      </header>

      <Section className="admin-detail-body">
        <div
          className={`admin-detail-layout${
            showCredentials ? " admin-detail-layout--tall-aside" : ""
          }`}
        >
          <div className="admin-detail-main">
            <DetailCard
              icon="fa-regular fa-user"
              title={t("adminDetail.section_personal", "Información personal")}
            >
              <FieldList fields={personal} />
            </DetailCard>

            <DetailCard
              icon="fa-solid fa-graduation-cap"
              title={t("adminDetail.section_academic", "Información académica")}
            >
              <FieldList fields={academic} />
            </DetailCard>

            <DetailCard
              icon="fa-solid fa-hospital"
              title={t("adminDetail.section_professional", "Información profesional")}
            >
              <FieldList fields={professional} />
            </DetailCard>

            {app.motivation && (
              <DetailCard
                icon="fa-regular fa-comment-dots"
                title={t("adminDetail.section_motivation", "Motivación")}
              >
                <p className="admin-detail-text">{app.motivation}</p>
              </DetailCard>
            )}

            <DetailCard
              icon="fa-regular fa-folder-open"
              title={t("adminDetail.section_documents", "Documentos adjuntos")}
              action={
                attachments.length > 0 ? (
                  <span className="admin-detail-count">{attachments.length}</span>
                ) : null
              }
            >
              {attachments.length > 0 ? (
                <ul className="admin-detail-files">
                  {attachments.map((att, idx) => (
                    <li key={att.id ?? idx}>
                      <a
                        className="admin-detail-file"
                        href={assetUrl(att.file_url)}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <span className="admin-detail-file__icon" aria-hidden="true">
                          <i className="fa-regular fa-file-pdf"></i>
                        </span>
                        <span className="admin-detail-file__text">
                          <span className="admin-detail-file__name">
                            {t("adminDetail.document_n", "Documento {{n}}", { n: idx + 1 })}
                          </span>
                          {fileNameFromUrl(att.file_url) && (
                            <span className="admin-detail-file__meta">
                              {fileNameFromUrl(att.file_url)}
                            </span>
                          )}
                        </span>
                        <i
                          className="fa-solid fa-arrow-up-right-from-square admin-detail-file__ext"
                          aria-hidden="true"
                        ></i>
                        <span className="sr-only">
                          ({t("adminDetail.new_tab", "se abre en una pestaña nueva")})
                        </span>
                      </a>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="admin-detail-muted">
                  {t("adminDetail.no_documents", "El postulante no adjuntó documentos.")}
                </p>
              )}
            </DetailCard>
          </div>

          <aside
            className="admin-detail-aside"
            aria-label={t("adminDetail.status_aside", "Estado y acciones")}
          >
            <section className="card admin-detail-status" aria-labelledby="admin-detail-status-title">
              <div className="admin-detail-status__head">
                <h2 id="admin-detail-status-title" className="admin-detail-card__title">
                  {t("adminDetail.status_title", "Estado de la postulación")}
                </h2>
                <StatusBadge variant={statusVariant} size="sm">
                  {statusLabel}
                </StatusBadge>
              </div>

              <StatusSteps steps={buildSteps(app, t, lang)} />

              {(actionMsg || actionError) && (
                <div className="admin-detail-status__alerts">
                  {actionMsg && (
                    <Alert variant="success" onClose={() => setActionMsg("")}>
                      {actionMsg}
                    </Alert>
                  )}
                  {actionError && (
                    <Alert variant="error" onClose={() => setActionError("")}>
                      {actionError}
                    </Alert>
                  )}
                </div>
              )}

              {app.status === "pending" && (
                <form
                  className="admin-detail-status__section admin-detail-decision"
                  onSubmit={e => {
                    e.preventDefault();
                    approveApplication();
                  }}
                >
                  <h3 className="admin-detail-subtitle">
                    {t("adminDetail.decision_title", "Decisión")}
                  </h3>
                  <Select
                    id="membership-type-select"
                    label={t("adminDetail.decision_membership", "Membresía a asignar")}
                    value={membershipType}
                    onChange={e => setMembershipType(e.target.value)}
                    options={membershipOptions}
                    placeholder=""
                    helperText={membershipDescription(t, membershipType)}
                    disabled={busy}
                  />
                  <Textarea
                    id="resolution-note-textarea"
                    label={t("adminDetail.decision_note", "Nota de resolución (opcional)")}
                    value={resolutionNote}
                    onChange={e => setResolutionNote(e.target.value)}
                    placeholder={t(
                      "adminDetail.decision_note_placeholder",
                      "Nota opcional para el postulante…",
                    )}
                    rows={4}
                    disabled={busy}
                  />
                  <div className="admin-detail-decision__actions">
                    <Button
                      variant="outline"
                      className="admin-detail-btn-reject"
                      onClick={() => setConfirming("reject")}
                      disabled={busy}
                    >
                      <i className="fa-solid fa-xmark" aria-hidden="true"></i>
                      {t("adminDetail.reject", "Rechazar")}
                    </Button>
                    <Button
                      type="submit"
                      variant="primary"
                      loading={submitting === "approve"}
                      disabled={busy && submitting !== "approve"}
                    >
                      <i className="fa-solid fa-check" aria-hidden="true"></i>
                      {t("adminDetail.approve", "Aprobar")}
                    </Button>
                  </div>
                  <p className="admin-detail-hint">
                    {t(
                      "adminDetail.decision_hint",
                      "Al aprobar, la postulación queda a la espera del pago de la cuota.",
                    )}
                  </p>
                </form>
              )}

              {app.status === "payment_pending" && (
                <div className="admin-detail-status__section">
                  <h3 className="admin-detail-subtitle">
                    {t("adminDetail.payment_title", "Confirmar pago")}
                  </h3>
                  <p className="admin-detail-status__text">
                    {t(
                      "adminDetail.payment_text",
                      "Aprobada como {{membership}}. Cuando el socio complete el pago, confírmalo aquí para crear su cuenta y credenciales.",
                      { membership: membershipLabel(t, app.membership_type) },
                    )}
                  </p>
                  <Button
                    variant="primary"
                    fullWidth
                    onClick={() => setConfirming("confirm")}
                    loading={submitting === "confirm"}
                  >
                    <i className="fa-solid fa-user-check" aria-hidden="true"></i>
                    {t("adminDetail.confirm_payment", "Confirmar pago y crear socio")}
                  </Button>
                </div>
              )}

              {app.status === "paid" && (
                <div className="admin-detail-status__section">
                  <p className="admin-detail-status__text">
                    {t(
                      "adminDetail.paid_text",
                      "Pago confirmado. La cuenta de socio fue creada con membresía {{membership}}.",
                      { membership: membershipLabel(t, app.membership_type) },
                    )}
                  </p>
                </div>
              )}

              {app.status === "rejected" && !showNote && (
                <div className="admin-detail-status__section">
                  <p className="admin-detail-status__text">
                    {t("adminDetail.rejected_text", "Esta postulación fue rechazada.")}
                  </p>
                </div>
              )}

              {showNote && (
                <div className="admin-detail-status__section">
                  <h3 className="admin-detail-subtitle">
                    {t("adminDetail.note_title", "Nota de resolución")}
                  </h3>
                  <blockquote className="admin-detail-note">{app.resolution_note}</blockquote>
                </div>
              )}
            </section>

            {showCredentials && (
              <CredentialsPanel
                name={app.name}
                email={app.email}
                password={app.initial_password}
                membership={membershipLabel(t, app.membership_type)}
              />
            )}
          </aside>
        </div>
      </Section>

      <ConfirmDialog
        isOpen={confirming === "reject"}
        title={t("adminDetail.reject_confirm_title", "¿Rechazar esta postulación?")}
        confirmLabel={t("adminDetail.reject_confirm", "Rechazar postulación")}
        confirmVariant="danger"
        loading={submitting === "reject"}
        onConfirm={rejectApplication}
        onCancel={() => setConfirming(null)}
      >
        <p>
          {t(
            "adminDetail.reject_confirm_text",
            "La postulación de {{name}} quedará rechazada. Esta acción no se puede deshacer.",
            { name: app.name },
          )}
        </p>
        {resolutionNote.trim() && (
          <blockquote className="admin-detail-note">{resolutionNote}</blockquote>
        )}
      </ConfirmDialog>

      <ConfirmDialog
        isOpen={confirming === "confirm"}
        title={t("adminDetail.confirm_payment_title", "¿Confirmar el pago?")}
        confirmLabel={t("adminDetail.confirm_payment", "Confirmar pago y crear socio")}
        loading={submitting === "confirm"}
        onConfirm={confirmPayment}
        onCancel={() => setConfirming(null)}
      >
        <p>
          {t(
            "adminDetail.confirm_payment_text",
            "Se creará la cuenta de socio de {{email}} con membresía {{membership}} y el pago quedará registrado. Esta acción no se puede deshacer.",
            { email: app.email, membership: membershipLabel(t, app.membership_type) },
          )}
        </p>
      </ConfirmDialog>

      <Modal
        isOpen={credentials !== null}
        onClose={closeCredentials}
        title={t("adminDetail.cred_modal_title", "Cuenta de socio creada")}
      >
        <Alert variant="warning" className="admin-detail-modal-alert">
          <strong>{t("adminDetail.important", "Importante:")}</strong>{" "}
          {t(
            "adminDetail.cred_modal_text",
            "copia estas credenciales y envíalas al socio de forma segura.",
          )}
        </Alert>
        {credentials && (
          <CredentialsPanel
            variant="plain"
            email={credentials.email}
            password={credentials.password}
            membership={membershipLabel(t, credentials.membership_type)}
          />
        )}
        <div className="modal-footer">
          <Button variant="primary" onClick={closeCredentials}>
            {t("adminDetail.close_continue", "Cerrar y continuar")}
          </Button>
        </div>
      </Modal>
    </div>
  );
}
