import { Fragment, useCallback, useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { apiGet } from "../../api/client";
import { useAuth } from "../../auth/AuthContext";
import { currentLanguage } from "../../i18n";
import useDocumentTitle from "../../hooks/useDocumentTitle";
import { formatTimestamp } from "../../utils/i18nLocale";
import { Button, Section } from "../../components/ui";
import {
  BackLink,
  CredentialsPanel,
  DetailCard,
  DetailLoading,
  DetailUnavailable,
  DetailValue,
  StatusBadge,
} from "../../components/admin-detail/AdminDetailParts";
import {
  USERS_TAB,
  membershipDescription,
  membershipLabel,
  paymentLabel,
  paymentVariant,
  roleLabel,
} from "../../components/admin-detail/adminDetailUtils";

export default function AdminUserView() {
  const { id } = useParams();
  const { t, i18n } = useTranslation();
  const lang = currentLanguage(i18n);
  const auth = useAuth();
  const me = auth?.user;
  const [state, setState] = useState({ status: "loading", user: null });
  const requestId = useRef(0);

  const load = useCallback(async () => {
    const current = ++requestId.current;
    setState({ status: "loading", user: null });
    try {
      const data = await apiGet(`/admin/users/${id}`);
      if (current !== requestId.current) return;
      setState({ status: "ready", user: data });
    } catch (err) {
      if (current !== requestId.current) return;
      setState({ status: err?.status === 404 ? "not_found" : "error", user: null });
    }
  }, [id]);

  useEffect(() => {
    load();
    return () => {
      requestId.current += 1;
    };
  }, [load]);

  const user = state.user;

  useDocumentTitle(
    state.status === "ready"
      ? user.name
      : state.status === "not_found"
        ? t("adminDetail.user_not_found", "Socio no encontrado")
        : undefined,
  );

  if (state.status === "loading") {
    return <DetailLoading label={t("adminDetail.user_loading", "Cargando socio…")} />;
  }

  if (state.status !== "ready" || !user) {
    const notFound = state.status === "not_found";
    return (
      <DetailUnavailable
        notFound={notFound}
        icon="fa-regular fa-user"
        title={
          notFound
            ? t("adminDetail.user_not_found", "Socio no encontrado")
            : t("adminDetail.user_load_error", "No pudimos cargar el socio")
        }
        description={
          notFound
            ? t(
                "adminDetail.user_not_found_desc",
                "Es posible que el enlace no sea correcto o que la cuenta ya no exista.",
              )
            : t(
                "adminDetail.load_error_desc",
                "Revisa tu conexión e inténtalo nuevamente en unos segundos.",
              )
        }
        backTo={USERS_TAB}
        backLabel={t("adminDetail.back_users", "Volver a socios")}
        onRetry={load}
      />
    );
  }

  const isMember = user.role === "member";
  // The backend treats a NULL is_active as active; only an explicit false
  // locks the account out.
  const isActive = user.is_active !== false;
  const isSelf = me?.id != null && String(me.id) === String(user.id ?? id);
  const createdOn = formatTimestamp(user.created_at, {}, lang);
  const activeBadge = (
    <StatusBadge variant={isActive ? "success" : "neutral"}>
      {isActive
        ? t("adminDetail.active", "Activo")
        : t("adminDetail.inactive", "Inactivo")}
    </StatusBadge>
  );
  const paymentBadge = (
    <StatusBadge variant={paymentVariant(user.payment_status)}>
      {paymentLabel(t, user.payment_status)}
    </StatusBadge>
  );

  const account = [
    { key: "name", label: t("adminDetail.f_name", "Nombre completo"), value: user.name },
    {
      key: "email",
      label: t("adminDetail.f_email", "Correo electrónico"),
      value: user.email ? (
        <a href={`mailto:${user.email}`} className="admin-detail-link">
          {user.email}
        </a>
      ) : null,
    },
    { key: "role", label: t("adminDetail.f_role", "Rol"), value: roleLabel(t, user.role) },
    { key: "status", label: t("adminDetail.f_status", "Estado"), value: activeBadge },
    { key: "created", label: t("adminDetail.f_created", "Fecha de registro"), value: createdOn },
  ];

  const membership = [
    {
      key: "type",
      label: t("adminDetail.f_membership", "Tipo de membresía"),
      value: user.membership_type ? (
        <span className="admin-detail-stack">
          <span>{membershipLabel(t, user.membership_type)}</span>
          {membershipDescription(t, user.membership_type) && (
            <span className="admin-detail-muted">
              {membershipDescription(t, user.membership_type)}
            </span>
          )}
        </span>
      ) : null,
    },
    { key: "payment", label: t("adminDetail.f_payment", "Estado de pago"), value: paymentBadge },
    typeof user.auto_payment_enabled === "boolean" && {
      key: "auto",
      label: t("adminDetail.f_auto_payment", "Renovación automática"),
      value: user.auto_payment_enabled
        ? t("adminDetail.enabled", "Activada")
        : t("adminDetail.disabled", "Desactivada"),
    },
  ].filter(Boolean);

  const renderList = fields => (
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

  return (
    <div className="page admin-detail">
      <header className="page-hero admin-detail-hero">
        <div className="page-hero__inner">
          <BackLink to={USERS_TAB}>{t("adminDetail.back_users", "Volver a socios")}</BackLink>
          <div className="admin-detail-hero__eyebrow">
            <p className="page-hero-kicker">
              {isMember
                ? t("adminDetail.user_kicker", "Ficha de socio")
                : t("adminDetail.admin_kicker", "Cuenta de administrador")}
            </p>
            <StatusBadge variant={user.role === "admin" ? "primary" : "neutral"}>
              {roleLabel(t, user.role)}
            </StatusBadge>
            {activeBadge}
          </div>
          <h1 className="page-hero-title admin-detail-hero__title">{user.name}</h1>
          <ul className="admin-detail-hero__meta">
            {user.email && (
              <li>
                <i className="fa-regular fa-envelope" aria-hidden="true"></i>
                <span>{user.email}</span>
              </li>
            )}
            {isMember && user.membership_type && (
              <li>
                <i className="fa-regular fa-id-card" aria-hidden="true"></i>
                <span>{membershipLabel(t, user.membership_type)}</span>
              </li>
            )}
            {createdOn && (
              <li>
                <i className="fa-regular fa-calendar" aria-hidden="true"></i>
                <span>{t("adminDetail.member_since", "Registrado el {{date}}", { date: createdOn })}</span>
              </li>
            )}
          </ul>
          <div className="page-hero__actions admin-detail-hero__actions">
            <Button to={`/admin/users/${user.id ?? id}/edit`}>
              <i className="fa-solid fa-pen" aria-hidden="true"></i>
              {t("adminDetail.edit_user", "Editar socio")}
            </Button>
            {user.email && (
              <Button variant="outline" href={`mailto:${user.email}`}>
                <i className="fa-regular fa-paper-plane" aria-hidden="true"></i>
                {t("adminDetail.email_user", "Escribir al socio")}
              </Button>
            )}
          </div>
        </div>
      </header>

      <Section className="admin-detail-body">
        <div className="admin-detail-layout">
          <div className="admin-detail-main">
            <DetailCard
              icon="fa-regular fa-user"
              title={t("adminDetail.section_account", "Datos de la cuenta")}
            >
              {renderList(account)}
            </DetailCard>

            {isMember && (
              <DetailCard
                icon="fa-regular fa-id-card"
                title={t("adminDetail.section_membership", "Membresía")}
              >
                {renderList(membership)}
              </DetailCard>
            )}
          </div>

          <aside
            className="admin-detail-aside"
            aria-label={t("adminDetail.user_aside", "Estado de la cuenta")}
          >
            <section className="card admin-detail-status" aria-labelledby="admin-user-status-title">
              <div className="admin-detail-status__head">
                <h2 id="admin-user-status-title" className="admin-detail-card__title">
                  {t("adminDetail.user_status_title", "Estado de la cuenta")}
                </h2>
              </div>
              <ul className="admin-detail-checks">
                <li className={isActive ? "is-ok" : "is-off"}>
                  <i
                    className={`fa-solid ${isActive ? "fa-circle-check" : "fa-circle-minus"}`}
                    aria-hidden="true"
                  ></i>
                  <span>
                    <strong>
                      {isActive
                        ? t("adminDetail.active", "Activo")
                        : t("adminDetail.inactive", "Inactivo")}
                    </strong>
                    <span className="admin-detail-muted">
                      {isActive
                        ? t("adminDetail.active_desc", "Puede iniciar sesión en el sitio.")
                        : t(
                            "adminDetail.inactive_desc",
                            "No puede acceder al sistema hasta que se reactive.",
                          )}
                    </span>
                  </span>
                </li>
                {isMember && (
                  <li
                    className={
                      user.payment_status === "paid"
                        ? "is-ok"
                        : user.payment_status === "due"
                          ? "is-warn"
                          : "is-off"
                    }
                  >
                    <i
                      className={`fa-solid ${
                        user.payment_status === "paid"
                          ? "fa-circle-check"
                          : user.payment_status === "due"
                            ? "fa-clock"
                            : "fa-circle-minus"
                      }`}
                      aria-hidden="true"
                    ></i>
                    <span>
                      <strong>
                        {t("adminDetail.payment_state", "Pago: {{status}}", {
                          status: paymentLabel(t, user.payment_status),
                        })}
                      </strong>
                      <span className="admin-detail-muted">
                        {user.payment_status === "paid"
                          ? t("adminDetail.paid_desc", "Tiene acceso al portal de socios.")
                          : t(
                              "adminDetail.unpaid_desc",
                              "Sin acceso al portal de socios hasta registrar el pago.",
                            )}
                      </span>
                    </span>
                  </li>
                )}
              </ul>
              <div className="admin-detail-status__section">
                <Button variant="secondary" fullWidth to={`/admin/users/${user.id ?? id}/edit`}>
                  <i className="fa-solid fa-sliders" aria-hidden="true"></i>
                  {isSelf
                    ? t("adminDetail.edit_user", "Editar socio")
                    : isMember
                      ? t("adminDetail.manage_account", "Cambiar estado o membresía")
                      : t("adminDetail.manage_status", "Cambiar estado")}
                </Button>
              </div>
            </section>

            {user.initial_password && (
              <CredentialsPanel
                name={user.name}
                email={user.email}
                password={user.initial_password}
                membership={isMember ? membershipLabel(t, user.membership_type) : undefined}
              />
            )}
          </aside>
        </div>
      </Section>
    </div>
  );
}
