import { useState } from "react";
import PropTypes from "prop-types";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuth } from "../../auth/AuthContext.jsx";
import { apiPost } from "../../api/client";
import {
  Alert,
  Badge,
  Button,
  Input,
  PageHero,
  Section,
  Spinner,
} from "../../components/ui";
import {
  MEMBERSHIP_BADGE_VARIANTS,
  isNetworkError,
  memberInitials,
  membershipLabel,
  paymentState,
  readableServerMessage,
} from "../../components/members/memberUtils.js";

const MIN_PASSWORD = 8;

const PAYMENT_BADGES = {
  paid: { variant: "success", key: "profile.status_paid", fallback: "Al día" },
  due: { variant: "warning", key: "profile.status_due", fallback: "Pago pendiente" },
  // "none" = no payment on record (admin panel: "Sin pago"); never claim no fee is owed.
  none: {
    variant: "neutral",
    key: "profile.status_no_payment",
    fallback: "Sin pago registrado",
  },
};

export default function UserProfile() {
  const { t } = useTranslation();
  const { user, loading, logout } = useAuth();
  const location = useLocation();
  const nav = useNavigate();
  // Set when this page itself signs the user out. The router runs navigations
  // as transitions, so `user` turns null while we are still on /perfil; without
  // this flag the guard below would bounce the user to /login instead of the
  // destination chosen by the handler.
  const [leaving, setLeaving] = useState(false);

  if (loading || user === undefined || (!user && leaving)) {
    return (
      <div className="page-loading">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  const payment = paymentState(user);
  const paymentBadge = PAYMENT_BADGES[payment];
  const isAdmin = user.role === "admin";
  const canUsePortal = isAdmin || payment === "paid";
  const membershipType = String(user.membership_type || "").toLowerCase();
  const paymentRequired = location.state?.reason === "payment_required";

  const handleLogout = () => {
    setLeaving(true);
    nav("/", { replace: true });
    logout();
  };

  const handleSessionExpired = () => {
    setLeaving(true);
    nav("/login", {
      replace: true,
      state: { from: location, reason: "session_expired" },
    });
    logout();
  };

  const links = [
    canUsePortal && {
      to: "/portal-socios",
      icon: "fa-solid fa-door-open",
      label: t("header.private_portal"),
    },
    isAdmin && {
      to: "/admin",
      icon: "fa-solid fa-gauge",
      label: t("header.admin"),
    },
    { to: "/eventos", icon: "fa-regular fa-calendar", label: t("header.events") },
    { to: "/noticias", icon: "fa-regular fa-newspaper", label: t("header.news") },
    {
      to: "/subir-noticia",
      icon: "fa-solid fa-pen-nib",
      label: t("header.submit_article"),
    },
  ].filter(Boolean);

  return (
    <div className="page members-page">
      <PageHero
        kicker={t("profile.kicker", "Mi cuenta")}
        title={t("header.profile")}
        subtitle={t(
          "profile.subtitle",
          "Revisa el estado de tu membresía y administra tu contraseña.",
        )}
      />

      <Section>
        {paymentRequired && payment !== "paid" && !isAdmin && (
          <Alert variant="warning" className="members-profile-alert">
            {t(
              "profile.payment_required",
              "El Portal de Socios está disponible solo para socios con la membresía al día. Regulariza tu pago para acceder.",
            )}
            {/* The "due" card below already offers this; other states need a way forward. */}
            {payment !== "due" && (
              <>
                {" "}
                <Link to="/contacto">{t("profile.due_cta", "Contactar a secretaría")}</Link>
              </>
            )}
          </Alert>
        )}

        <div className="members-profile-layout">
          <div className="members-profile-side">
            <section
              className="members-profile-card members-profile-summary"
              aria-labelledby="profile-name"
            >
              <div className="members-profile-summary__head">
                <span className="avatar members-profile-avatar" aria-hidden="true">
                  {memberInitials(user.name || user.email || "")}
                </span>
                <div className="members-profile-summary__id">
                  <h2 id="profile-name" className="members-profile-summary__name">
                    {user.name}
                  </h2>
                  <p className="members-profile-summary__email">{user.email}</p>
                </div>
              </div>

              <dl className="members-profile-details">
                <div className="members-profile-details__row">
                  <dt>{t("profile.membership", "Tipo de membresía")}</dt>
                  <dd>
                    {membershipType ? (
                      <Badge
                        variant={MEMBERSHIP_BADGE_VARIANTS[membershipType] || "neutral"}
                      >
                        {membershipLabel(t, membershipType)}
                      </Badge>
                    ) : (
                      "—"
                    )}
                  </dd>
                </div>
                <div className="members-profile-details__row">
                  <dt>{t("profile.payment", "Estado de pago")}</dt>
                  <dd>
                    <Badge variant={paymentBadge.variant}>
                      {t(paymentBadge.key, paymentBadge.fallback)}
                    </Badge>
                  </dd>
                </div>
                {isAdmin && (
                  <div className="members-profile-details__row">
                    <dt>{t("profile.role", "Rol")}</dt>
                    <dd>
                      <Badge variant="secondary">
                        {t("profile.role_admin", "Administrador")}
                      </Badge>
                    </dd>
                  </div>
                )}
              </dl>

              <Button
                variant="ghost"
                onClick={handleLogout}
                className="members-profile-logout"
              >
                <i className="fa-solid fa-arrow-right-from-bracket" aria-hidden="true"></i>
                {t("header.logout")}
              </Button>
            </section>

            <nav
              className="members-profile-card members-profile-links"
              aria-labelledby="profile-links-title"
            >
              <h2 id="profile-links-title" className="members-profile-card__title">
                {t("profile.links_title", "Accesos")}
              </h2>
              <ul className="members-profile-links__list">
                {links.map(link => (
                  <li key={link.to}>
                    <Link to={link.to} className="members-profile-link">
                      <i className={link.icon} aria-hidden="true"></i>
                      <span>{link.label}</span>
                      <i
                        className="fa-solid fa-chevron-right members-profile-link__chevron"
                        aria-hidden="true"
                      ></i>
                    </Link>
                  </li>
                ))}
              </ul>
              {!canUsePortal && (
                <p className="members-profile-links__note">
                  <i className="fa-solid fa-lock" aria-hidden="true"></i>
                  {t(
                    "profile.portal_locked",
                    "El Portal de Socios se habilita con la membresía al día.",
                  )}
                </p>
              )}
            </nav>
          </div>

          <div className="members-profile-main">
            {payment === "due" && (
              <section
                className="members-profile-card members-profile-due"
                aria-labelledby="profile-due-title"
              >
                <span className="icon-tile icon-tile--accent" aria-hidden="true">
                  <i className="fa-solid fa-file-invoice-dollar"></i>
                </span>
                <div className="members-profile-due__body">
                  <h2 id="profile-due-title" className="members-profile-card__title">
                    {t("profile.due_title", "Regulariza tu membresía")}
                  </h2>
                  <p className="members-profile-card__text">
                    {t(
                      "profile.due_text",
                      "Tu membresía tiene un pago pendiente. Escríbenos y la secretaría te enviará las instrucciones de pago.",
                    )}
                  </p>
                  <Button variant="primary" to="/contacto">
                    {t("profile.due_cta", "Contactar a secretaría")}
                  </Button>
                </div>
              </section>
            )}

            <ChangePasswordCard onSessionExpired={handleSessionExpired} />
          </div>
        </div>
      </Section>
    </div>
  );
}

const PASSWORD_DEFAULTS = {
  "profile.err_required": "Completa este campo.",
  "profile.err_min_length": "La nueva contraseña debe tener al menos 8 caracteres.",
  "profile.err_mismatch": "Las contraseñas no coinciden.",
  "profile.err_current_wrong": "La contraseña actual es incorrecta.",
  "profile.err_generic": "No se pudo actualizar la contraseña.",
  "profile.success": "Tu contraseña se actualizó correctamente.",
  "login.error_network":
    "No pudimos conectar con el servidor. Revisa tu conexión e inténtalo nuevamente.",
  "login.error_server":
    "El servicio no está disponible en este momento. Inténtalo nuevamente en unos minutos.",
};

/** Maps the backend's (Spanish) change-password reasons onto translated messages. */
function passwordServerError(err) {
  if (isNetworkError(err)) return { key: "login.error_network" };
  if (err?.status >= 500) return { key: "login.error_server" };
  const message = readableServerMessage(err);
  if (/actual es incorrecta/i.test(message)) return { key: "profile.err_current_wrong" };
  if (/al menos 8/i.test(message)) return { key: "profile.err_min_length" };
  return { key: "profile.err_generic", detail: message };
}

function ChangePasswordCard({ onSessionExpired }) {
  const { t } = useTranslation();
  const [values, setValues] = useState({ current: "", next: "", confirm: "" });
  const [fieldErrors, setFieldErrors] = useState({});
  const [result, setResult] = useState(null); // { variant, key, detail }
  const [saving, setSaving] = useState(false);

  const text = key => t(key, PASSWORD_DEFAULTS[key]);

  const update = name => e => {
    const { value } = e.target;
    setValues(prev => ({ ...prev, [name]: value }));
    if (fieldErrors[name]) setFieldErrors(prev => ({ ...prev, [name]: null }));
    if (result) setResult(null);
  };

  async function handleSubmit(e) {
    e.preventDefault();
    if (saving) return;

    const found = {};
    if (!values.current) found.current = "profile.err_required";
    if (!values.next) found.next = "profile.err_required";
    else if (values.next.length < MIN_PASSWORD) found.next = "profile.err_min_length";
    if (!values.confirm) found.confirm = "profile.err_required";
    else if (values.next && values.confirm !== values.next)
      found.confirm = "profile.err_mismatch";

    setFieldErrors(found);
    setResult(null);
    const firstInvalid = ["current", "next", "confirm"].find(name => found[name]);
    if (firstInvalid) {
      document.getElementById(`profile-password-${firstInvalid}`)?.focus();
      return;
    }

    setSaving(true);
    try {
      await apiPost("/auth/change-password", {
        current_password: values.current,
        new_password: values.next,
      });
      setValues({ current: "", next: "", confirm: "" });
      setResult({ variant: "success", key: "profile.success" });
    } catch (err) {
      console.error("Change password failed:", err);
      if (err?.status === 401 || err?.status === 422) {
        onSessionExpired();
        return;
      }
      const mapped = passwordServerError(err);
      if (mapped.key === "profile.err_current_wrong") {
        setFieldErrors({ current: mapped.key });
        document.getElementById("profile-password-current")?.focus();
      }
      setResult({ variant: "error", ...mapped });
    } finally {
      setSaving(false);
    }
  }

  return (
    <section
      className="members-profile-card members-profile-password"
      aria-labelledby="profile-password-title"
    >
      <div className="members-profile-password__head">
        <span className="icon-tile" aria-hidden="true">
          <i className="fa-solid fa-key"></i>
        </span>
        <div>
          <h2 id="profile-password-title" className="members-profile-card__title">
            {t("profile.password_title", "Cambiar contraseña")}
          </h2>
          <p className="members-profile-card__text">
            {t(
              "profile.password_lead",
              "Usa una contraseña de al menos 8 caracteres que no utilices en otros sitios.",
            )}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} noValidate className="members-profile-password__form">
        <Input
          id="profile-password-current"
          label={t("profile.current_password", "Contraseña actual")}
          type="password"
          value={values.current}
          onChange={update("current")}
          autoComplete="current-password"
          error={fieldErrors.current ? text(fieldErrors.current) : undefined}
          required
        />
        <div className="form-grid">
          <Input
            id="profile-password-next"
            label={t("profile.new_password", "Nueva contraseña")}
            type="password"
            value={values.next}
            onChange={update("next")}
            autoComplete="new-password"
            helperText={t("profile.min_length_help", "Mínimo 8 caracteres")}
            error={fieldErrors.next ? text(fieldErrors.next) : undefined}
            minLength={MIN_PASSWORD}
            required
          />
          <Input
            id="profile-password-confirm"
            label={t("profile.confirm_password", "Confirmar nueva contraseña")}
            type="password"
            value={values.confirm}
            onChange={update("confirm")}
            autoComplete="new-password"
            error={fieldErrors.confirm ? text(fieldErrors.confirm) : undefined}
            required
          />
        </div>

        {result && (
          <Alert variant={result.variant} className="members-profile-password__result">
            {text(result.key)}
            {result.detail ? ` ${result.detail}` : ""}
          </Alert>
        )}

        <div className="form-actions members-profile-password__actions">
          <Button type="submit" loading={saving}>
            {t("profile.submit", "Actualizar contraseña")}
          </Button>
        </div>
      </form>
    </section>
  );
}

ChangePasswordCard.propTypes = {
  onSessionExpired: PropTypes.func.isRequired,
};
