import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { apiGet, apiPut } from "../../api/client";
import { useAuth } from "../../auth/AuthContext";
import { currentLanguage } from "../../i18n";
import useDocumentTitle from "../../hooks/useDocumentTitle";
import { formatTimestamp } from "../../utils/i18nLocale";
import { Alert, Button, Input, Section, Select, useToast } from "../../components/ui";
import {
  BackLink,
  DetailLoading,
  DetailUnavailable,
  StatusBadge,
} from "../../components/admin-detail/AdminDetailParts";
import {
  MEMBERSHIP_TYPES,
  USERS_TAB,
  errorMessage,
  membershipDescription,
  membershipLabel,
  paymentLabel,
  paymentVariant,
  roleLabel,
} from "../../components/admin-detail/adminDetailUtils";

// The backend treats a NULL is_active as active (only an explicit false locks
// the account out), so the UI must too.
function isActiveUser(user) {
  return user?.is_active !== false;
}

function formFromUser(user) {
  return {
    name: user.name || "",
    is_active: isActiveUser(user),
    membership_type: user.membership_type || "",
    payment_status: user.payment_status || "none",
  };
}

export default function AdminUserEdit() {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const { t, i18n } = useTranslation();
  const lang = currentLanguage(i18n);
  const auth = useAuth();
  const me = auth?.user;

  const [state, setState] = useState({ status: "loading", user: null });
  const [form, setForm] = useState(null);
  const [errors, setErrors] = useState({});
  const [saveError, setSaveError] = useState("");
  const [saving, setSaving] = useState(false);
  const requestId = useRef(0);
  const mounted = useRef(true);

  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);

  const load = useCallback(async () => {
    const current = ++requestId.current;
    setState({ status: "loading", user: null });
    try {
      const data = await apiGet(`/admin/users/${id}`);
      if (!mounted.current || current !== requestId.current) return;
      setState({ status: "ready", user: data });
      setForm(formFromUser(data));
      setErrors({});
      setSaveError("");
    } catch (err) {
      if (!mounted.current || current !== requestId.current) return;
      setState({ status: err?.status === 404 ? "not_found" : "error", user: null });
    }
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  const user = state.user;
  const viewPath = `/admin/users/${id}`;
  // An admin can't deactivate their own account (the backend rejects it too).
  const isSelf = Boolean(me?.id != null && user?.id != null && String(me.id) === String(user.id));

  useDocumentTitle(
    state.status === "ready"
      ? `${t("adminDetail.edit_user", "Editar socio")}: ${user.name}`
      : state.status === "not_found"
        ? t("adminDetail.user_not_found", "Socio no encontrado")
        : undefined,
  );

  function update(field, value) {
    setForm(prev => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: undefined }));
  }

  async function save(e) {
    e.preventDefault();
    if (saving || !form) return;

    const nextErrors = {};
    if (!form.name.trim()) {
      nextErrors.name = t("adminDetail.err_name_required", "El nombre es obligatorio.");
    }
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) {
      document.getElementById("edit-user-name")?.focus();
      return;
    }

    setSaving(true);
    setSaveError("");
    // Only send the account status when it actually changed, so saving other
    // fields never rewrites it (e.g. a NULL status into an explicit false).
    const payload = { name: form.name.trim() };
    if (!isSelf && form.is_active !== isActiveUser(user)) {
      payload.is_active = form.is_active;
    }
    if (user.role === "member") {
      payload.membership_type = form.membership_type;
      payload.payment_status = form.payment_status;
    }
    try {
      await apiPut(`/admin/users/${id}`, payload);
      if (!mounted.current) return;
      toast.success(t("adminDetail.saved_toast", "Socio actualizado correctamente"));
      navigate(viewPath);
    } catch (err) {
      if (!mounted.current) return;
      setSaveError(
        errorMessage(err, t("adminDetail.save_error", "No se pudieron guardar los cambios.")),
      );
    } finally {
      if (mounted.current) setSaving(false);
    }
  }

  if (state.status === "loading") {
    return <DetailLoading label={t("adminDetail.user_loading", "Cargando socio…")} />;
  }

  if (state.status !== "ready" || !user || !form) {
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
  const isActive = isActiveUser(user);
  const createdOn = formatTimestamp(user.created_at, {}, lang);
  const membershipOptions = MEMBERSHIP_TYPES.map(type => ({
    value: type,
    label: membershipLabel(t, type),
  }));
  if (form.membership_type && !MEMBERSHIP_TYPES.includes(form.membership_type)) {
    membershipOptions.push({ value: form.membership_type, label: form.membership_type });
  }
  const paymentOptions = ["paid", "due", "none"].map(value => ({
    value,
    label: paymentLabel(t, value),
  }));

  return (
    <div className="page admin-detail">
      <header className="page-hero admin-detail-hero">
        <div className="page-hero__inner">
          <BackLink to={USERS_TAB}>{t("adminDetail.back_users", "Volver a socios")}</BackLink>
          <div className="admin-detail-hero__eyebrow">
            <p className="page-hero-kicker">{t("adminDetail.edit_user", "Editar socio")}</p>
          </div>
          <h1 className="page-hero-title admin-detail-hero__title">{user.name}</h1>
          {user.email && (
            <ul className="admin-detail-hero__meta">
              <li>
                <i className="fa-regular fa-envelope" aria-hidden="true"></i>
                <span>{user.email}</span>
              </li>
            </ul>
          )}
        </div>
      </header>

      <Section className="admin-detail-body">
        <div className="admin-detail-layout">
          <div className="admin-detail-main">
            <form className="card admin-detail-form" onSubmit={save} noValidate>
              <div className="form-section">
                <h2 className="form-section-title">
                  {t("adminDetail.section_details", "Datos del socio")}
                </h2>
                <div className="form-grid">
                  <Input
                    id="edit-user-name"
                    className="span-2"
                    label={t("adminDetail.f_name", "Nombre completo")}
                    value={form.name}
                    onChange={e => update("name", e.target.value)}
                    error={errors.name}
                    autoComplete="name"
                    required
                  />
                  <Input
                    id="edit-user-email"
                    className="span-2"
                    type="email"
                    label={t("adminDetail.f_email", "Correo electrónico")}
                    value={user.email || ""}
                    disabled
                    readOnly
                    helperText={t(
                      "adminDetail.email_locked",
                      "El correo es el usuario de acceso y no se puede modificar.",
                    )}
                  />
                </div>
              </div>

              <div className="form-section">
                <h2 className="form-section-title">
                  {t("adminDetail.section_access", "Acceso")}
                </h2>
                <label className="admin-detail-toggle" htmlFor="edit-user-active">
                  <input
                    id="edit-user-active"
                    type="checkbox"
                    checked={form.is_active}
                    onChange={e => update("is_active", e.target.checked)}
                    disabled={isSelf}
                    aria-describedby="edit-user-active-help"
                  />
                  <span className="admin-detail-toggle__text">
                    <span className="admin-detail-toggle__label">
                      {t("adminDetail.active_member", "Socio activo")}
                    </span>
                    <span id="edit-user-active-help" className="admin-detail-toggle__help">
                      {isSelf
                        ? t(
                            "adminDetail.active_self",
                            "No puedes desactivar tu propia cuenta.",
                          )
                        : t(
                            "adminDetail.active_help",
                            "Los socios inactivos no pueden acceder al sistema.",
                          )}
                    </span>
                  </span>
                </label>
              </div>

              {isMember && (
                <div className="form-section">
                  <h2 className="form-section-title">
                    {t("adminDetail.section_membership", "Membresía")}
                  </h2>
                  <div className="form-grid">
                    <Select
                      id="edit-user-membership"
                      label={t("adminDetail.f_membership", "Tipo de membresía")}
                      value={form.membership_type}
                      onChange={e => update("membership_type", e.target.value)}
                      options={membershipOptions}
                      placeholder={form.membership_type ? "" : undefined}
                      helperText={membershipDescription(t, form.membership_type) || undefined}
                    />
                    <Select
                      id="edit-user-payment"
                      label={t("adminDetail.f_payment", "Estado de pago")}
                      value={form.payment_status}
                      onChange={e => update("payment_status", e.target.value)}
                      options={paymentOptions}
                      placeholder=""
                      helperText={t(
                        "adminDetail.payment_help",
                        "Solo los socios con pago al día acceden al portal.",
                      )}
                    />
                  </div>
                </div>
              )}

              {saveError && (
                <Alert
                  variant="error"
                  className="admin-detail-form__alert"
                  onClose={() => setSaveError("")}
                >
                  {saveError}
                </Alert>
              )}

              <div className="form-actions">
                <Button variant="outline" to={viewPath} disabled={saving}>
                  {t("common.cancel", "Cancelar")}
                </Button>
                <Button type="submit" variant="primary" loading={saving}>
                  {t("adminDetail.save_changes", "Guardar cambios")}
                </Button>
              </div>
            </form>
          </div>

          <aside
            className="admin-detail-aside"
            aria-label={t("adminDetail.summary", "Resumen")}
          >
            <section className="card admin-detail-status" aria-labelledby="admin-edit-summary">
              <div className="admin-detail-status__head">
                <h2 id="admin-edit-summary" className="admin-detail-card__title">
                  {t("adminDetail.current_state", "Estado actual")}
                </h2>
              </div>
              <dl className="admin-detail-summary">
                <div>
                  <dt>{t("adminDetail.f_role", "Rol")}</dt>
                  <dd>
                    <StatusBadge variant={user.role === "admin" ? "primary" : "neutral"} size="sm">
                      {roleLabel(t, user.role)}
                    </StatusBadge>
                  </dd>
                </div>
                <div>
                  <dt>{t("adminDetail.f_status", "Estado")}</dt>
                  <dd>
                    <StatusBadge variant={isActive ? "success" : "neutral"} size="sm">
                      {isActive
                        ? t("adminDetail.active", "Activo")
                        : t("adminDetail.inactive", "Inactivo")}
                    </StatusBadge>
                  </dd>
                </div>
                {isMember && (
                  <>
                    <div>
                      <dt>{t("adminDetail.f_membership", "Tipo de membresía")}</dt>
                      <dd>{membershipLabel(t, user.membership_type)}</dd>
                    </div>
                    <div>
                      <dt>{t("adminDetail.f_payment", "Estado de pago")}</dt>
                      <dd>
                        <StatusBadge variant={paymentVariant(user.payment_status)} size="sm">
                          {paymentLabel(t, user.payment_status)}
                        </StatusBadge>
                      </dd>
                    </div>
                  </>
                )}
                {createdOn && (
                  <div>
                    <dt>{t("adminDetail.f_created", "Fecha de registro")}</dt>
                    <dd>{createdOn}</dd>
                  </div>
                )}
              </dl>
              <div className="admin-detail-status__section">
                <Button variant="ghost" size="sm" to={viewPath} className="admin-detail-inline-btn">
                  <i className="fa-regular fa-id-card" aria-hidden="true"></i>
                  {t("adminDetail.view_profile", "Ver ficha del socio")}
                </Button>
              </div>
            </section>
          </aside>
        </div>
      </Section>
    </div>
  );
}
