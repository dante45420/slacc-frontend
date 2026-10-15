import { useState } from "react";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuth } from "../../auth/AuthContext.jsx";
import { Alert, Button, Input, Spinner } from "../../components/ui";
import {
  isNetworkError,
  readableServerMessage,
} from "../../components/members/memberUtils.js";

/** Where to go after signing in: the page that asked for it, else a role default. */
function redirectTarget(user, from) {
  if (from?.pathname && from.pathname !== "/login") {
    return `${from.pathname}${from.search || ""}${from.hash || ""}`;
  }
  return user?.role === "admin" ? "/admin" : "/perfil";
}

export default function Login() {
  const { t } = useTranslation();
  const { user, loading: authLoading, login } = useAuth();
  const nav = useNavigate();
  const location = useLocation();
  const from = location.state?.from;
  const sessionExpired = location.state?.reason === "session_expired";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null); // { key, detail }
  const [submitting, setSubmitting] = useState(false);

  if (authLoading || user === undefined) {
    return (
      <div className="page-loading">
        <Spinner size="lg" />
      </div>
    );
  }

  // Already signed in: never show the form again (it would silently swap accounts).
  if (user) {
    return <Navigate to={redirectTarget(user, from)} replace />;
  }

  async function submit(e) {
    e.preventDefault();
    if (submitting) return;
    if (!email.trim() || !password) {
      setError({ key: "login.error_required" });
      return;
    }
    setError(null);
    setSubmitting(true);
    try {
      const loggedIn = await login(email.trim(), password);
      nav(redirectTarget(loggedIn, from), { replace: true });
    } catch (err) {
      console.error("Login error:", err);
      if (err?.status === 401) setError({ key: "login.error" });
      // 403 = account deactivated from the admin panel (backend code "account_inactive").
      else if (err?.status === 403) setError({ key: "login.error_inactive" });
      else if (isNetworkError(err)) setError({ key: "login.error_network" });
      else if (err?.status >= 500) setError({ key: "login.error_server" });
      else
        setError({
          key: "login.error_generic",
          detail: readableServerMessage(err),
        });
      setSubmitting(false);
    }
  }

  const errorText = key => {
    const defaults = {
      "login.error_required": "Ingresa tu email y tu contraseña.",
      "login.error_network":
        "No pudimos conectar con el servidor. Revisa tu conexión e inténtalo nuevamente.",
      "login.error_server":
        "El servicio no está disponible en este momento. Inténtalo nuevamente en unos minutos.",
      "login.error_generic": "No pudimos iniciar sesión.",
      "login.error_inactive":
        "Tu cuenta está desactivada. Escribe a la secretaría de SLACC para reactivarla.",
    };
    return t(key, defaults[key]);
  };

  return (
    <div className="page members-auth-page">
      <div className="members-auth-wrap">
        <div className="members-auth-card">
          <div className="members-auth-card__head">
            <span className="icon-tile members-auth-card__icon" aria-hidden="true">
              <i className="fa-solid fa-lock"></i>
            </span>
            <p className="eyebrow">{t("portal.kicker")}</p>
            <h1 className="members-auth-card__title">{t("login.title")}</h1>
            <p className="members-auth-card__lead">{t("login.subtitle")}</p>
          </div>

          {sessionExpired && !error && (
            <Alert variant="info" className="members-auth-card__alert">
              {t("login.session_expired", "Tu sesión expiró. Vuelve a iniciar sesión.")}
            </Alert>
          )}

          <form onSubmit={submit} noValidate className="members-auth-form">
            <Input
              id="login-email"
              label={t("common.email")}
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder={t("login.email_placeholder", "tu@email.com")}
              autoComplete="email"
              inputMode="email"
              required
            />

            <Input
              id="login-password"
              label={t("login.password")}
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
              autoComplete="current-password"
              required
            />

            {error && (
              <Alert variant="error" className="members-auth-card__alert">
                {errorText(error.key)}
                {error.detail ? ` ${error.detail}` : ""}
              </Alert>
            )}

            <Button type="submit" size="lg" fullWidth loading={submitting}>
              {t("login.submit")}
            </Button>
          </form>

          <p className="members-auth-card__help">
            {t("login.forgot", "¿Olvidaste tu contraseña?")}{" "}
            <Link to="/contacto">
              {t("login.forgot_link", "Escribe a la secretaría")}
            </Link>
          </p>
        </div>

        <div className="members-auth-aside">
          <p className="members-auth-aside__text">
            {t("login.no_account", "¿Aún no eres socio?")}
          </p>
          <Button variant="outline" to="/solicitar-membresia">
            {t("members.btn_apply")}
          </Button>
        </div>
      </div>
    </div>
  );
}
