import { useEffect, useState } from "react";
import PropTypes from "prop-types";
import { Link, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { apiPost } from "../../api/client";
import { useAuth } from "../../auth/AuthContext";
import Alert from "../ui/Alert.jsx";
import Button from "../ui/Button.jsx";
import Input from "../ui/Input.jsx";
import Modal from "../ui/Modal.jsx";
import { KindBadge, PriceSummary } from "./EventParts.jsx";
import {
  enrollErrorMessage,
  formatPrice,
  getEventKind,
  getSchedule,
  getViewerPricing,
  isLoginRequiredError,
  isPayingMember,
} from "./eventUtils";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const NAME_ID = "events-enroll-name";

/**
 * Enrollment dialog shared by the events list and the event detail page.
 * Guests can enroll (the API allows it); logged-in users enroll with their
 * account email so the site can recognise the enrollment afterwards.
 */
export default function EnrollmentModal({ event, onClose, onEnrolled }) {
  const { t, i18n } = useTranslation();
  const { user } = useAuth();
  const location = useLocation();
  const lang = i18n.language;
  const accountEmail = user?.email || "";

  const [values, setValues] = useState({
    name: user?.name || "",
    email: accountEmail,
    phone: "",
  });
  const [fieldErrors, setFieldErrors] = useState({});
  const [submitError, setSubmitError] = useState("");
  const [needsLogin, setNeedsLogin] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [enrollment, setEnrollment] = useState(null);

  const pricing = getViewerPricing(event, user);
  const schedule = getSchedule(event, lang);
  const kind = getEventKind(event);
  const done = Boolean(enrollment);

  // The shared Modal focuses its close button; move focus to the first empty field.
  useEffect(() => {
    if (values.name) return undefined;
    const frame = requestAnimationFrame(() => document.getElementById(NAME_ID)?.focus());
    return () => cancelAnimationFrame(frame);
  }, []);

  // After success the submit button is gone: keep keyboard focus inside the dialog.
  useEffect(() => {
    if (done) document.getElementById("events-enroll-done-close")?.focus();
  }, [done]);

  function handleClose() {
    if (done) onEnrolled?.(enrollment);
    onClose();
  }

  function handleChange(e) {
    const { name, value } = e.target;
    setValues(prev => ({ ...prev, [name]: value }));
    if (fieldErrors[name]) setFieldErrors(prev => ({ ...prev, [name]: undefined }));
  }

  function validate() {
    const errors = {};
    if (!values.name.trim()) {
      errors.name = t("events.err_name_required", "Ingresa tu nombre completo.");
    }
    if (!values.email.trim()) {
      errors.email = t("events.err_email_required", "Ingresa tu correo electrónico.");
    } else if (!EMAIL_PATTERN.test(values.email.trim())) {
      errors.email = t("events.err_email_invalid", "Ingresa un correo electrónico válido.");
    }
    return errors;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (submitting) return;
    const errors = validate();
    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) {
      document.getElementById(errors.name ? NAME_ID : "events-enroll-email")?.focus();
      return;
    }

    setSubmitting(true);
    setSubmitError("");
    setNeedsLogin(false);
    try {
      const data = await apiPost(`/events/${event.id}/enroll`, {
        name: values.name.trim(),
        email: values.email.trim(),
        phone: values.phone.trim(),
      });
      setEnrollment(data?.enrollment || { student_email: values.email.trim() });
    } catch (err) {
      setSubmitError(enrollErrorMessage(err, t));
      setNeedsLogin(!user && isLoginRequiredError(err));
    } finally {
      setSubmitting(false);
    }
  }

  const title = done
    ? t("events.enroll_done_title", "Inscripción registrada")
    : t("events.enroll_dialog_title", "Inscripción al evento");

  if (done) {
    const amount = Number(enrollment.payment_amount);
    return (
      <Modal isOpen onClose={handleClose} title={title} size="small">
        <div className="events-enroll-success">
          <span className="events-enroll-success__icon" aria-hidden="true">
            <i className="fa-solid fa-check"></i>
          </span>
          <h3 className="events-enroll-success__title">
            {t("events.enroll_done_heading", "¡Listo! Tu inscripción quedó registrada")}
          </h3>
          <p>
            {t("events.enroll_done_text", "Registramos la inscripción de {{email}} en «{{title}}».", {
              email: enrollment.student_email || values.email.trim(),
              title: event.title,
            })}
          </p>
          {amount > 0 && (
            <p className="events-enroll-success__note">
              {t("events.enroll_done_payment", "Valor de la inscripción: {{amount}} (pago pendiente).", {
                amount: formatPrice(amount, lang, t),
              })}
            </p>
          )}
          {user && event.format === "webinar" && (
            <p className="events-enroll-success__note">
              {t(
                "events.enroll_done_webinar",
                "El enlace de acceso estará disponible en la página del evento mientras tengas tu sesión iniciada.",
              )}
            </p>
          )}
        </div>
        <div className="modal-footer events-enroll-footer">
          <Button id="events-enroll-done-close" onClick={handleClose}>
            {t("common.close")}
          </Button>
        </div>
      </Modal>
    );
  }

  return (
    <Modal isOpen onClose={handleClose} title={title} size="medium">
      <div className="events-enroll-summary">
        <div className="events-enroll-summary__info">
          <KindBadge kind={kind} />
          <p className="events-enroll-summary__title">{event.title}</p>
          {schedule && (
            <p className="events-enroll-summary__meta">
              <i className="fa-regular fa-calendar" aria-hidden="true"></i>
              <span>
                {schedule.dateText}
                {" · "}
                <span className="events-nowrap">{schedule.timeText}</span>
              </span>
            </p>
          )}
        </div>
        <PriceSummary pricing={pricing} />
      </div>

      {!user && (
        <p className="events-enroll-hint">
          <i className="fa-solid fa-id-card" aria-hidden="true"></i>
          <span>
            {t("events.enroll_member_hint", "¿Eres socio con la cuota al día?")}{" "}
            <Link to="/login" state={{ from: location }}>
              {t("events.enroll_member_login", "Inicia sesión para obtener el valor socio.")}
            </Link>
          </span>
        </p>
      )}
      {user && !isPayingMember(user) && pricing.member < pricing.general && (
        <p className="events-enroll-hint">
          <i className="fa-solid fa-circle-info" aria-hidden="true"></i>
          <span>
            {t(
              "events.enroll_unpaid_hint",
              "El valor socio se aplica a socios con la cuota al día. Mientras tanto se aplica el valor general.",
            )}
          </span>
        </p>
      )}

      {submitError && (
        <Alert variant="error" className="events-enroll-alert">
          {submitError}
          {needsLogin && (
            <>
              {" "}
              <Link to="/login" state={{ from: location }} className="events-enroll-alert__link">
                {t("header.login")}
              </Link>
            </>
          )}
        </Alert>
      )}

      <form className="events-enroll-form" onSubmit={handleSubmit} noValidate>
        <div className="form-grid">
          <Input
            id={NAME_ID}
            className="span-2"
            name="name"
            label={t("events.name_label", "Nombre completo")}
            autoComplete="name"
            required
            value={values.name}
            onChange={handleChange}
            error={fieldErrors.name}
          />
          <Input
            id="events-enroll-email"
            name="email"
            type="email"
            inputMode="email"
            label={t("common.email")}
            autoComplete="email"
            required
            readOnly={Boolean(accountEmail)}
            value={values.email}
            onChange={handleChange}
            error={fieldErrors.email}
            helperText={
              accountEmail ? t("events.email_account_hint", "Usamos el correo de tu cuenta.") : undefined
            }
          />
          <Input
            id="events-enroll-phone"
            name="phone"
            type="tel"
            label={t("events.phone")}
            autoComplete="tel"
            value={values.phone}
            onChange={handleChange}
            helperText={t("events.optional", "Opcional")}
          />
        </div>

        <div className="modal-footer events-enroll-footer">
          <Button variant="outline" onClick={handleClose} disabled={submitting}>
            {t("common.cancel")}
          </Button>
          <Button type="submit" loading={submitting}>
            {t("events.enroll_confirm", "Confirmar inscripción")}
          </Button>
        </div>
      </form>
    </Modal>
  );
}

EnrollmentModal.propTypes = {
  event: PropTypes.shape({
    id: PropTypes.number.isRequired,
    title: PropTypes.string.isRequired,
    format: PropTypes.string,
    start_date: PropTypes.string,
    end_date: PropTypes.string,
    price_member: PropTypes.number,
    price_non_member: PropTypes.number,
    price_joven: PropTypes.number,
    price_gratuito: PropTypes.number,
  }).isRequired,
  onClose: PropTypes.func.isRequired,
  onEnrolled: PropTypes.func,
};
