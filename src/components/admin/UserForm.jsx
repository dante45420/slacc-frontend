import { useState } from "react";
import PropTypes from "prop-types";
import { useTranslation } from "react-i18next";
import { apiPost, apiPut } from "../../api/client";
import { Button, Input, Select } from "../ui";
import { FormAlert } from "./AdminCommon";
import { MEMBERSHIP_TYPES, PAYMENT_STATUSES, useAdminLabels } from "./adminLabels";
import { errorMessage } from "./adminUtils";
import useAdminSession from "./useAdminSession";

/** Create a member, or edit any user (name, status and — for members —
 *  membership and payment). */
export default function UserForm({ user, isSelf = false, onSaved, onCancel }) {
  const { t } = useTranslation();
  const labels = useAdminLabels();
  const { handleAuthError } = useAdminSession();
  const isEdit = Boolean(user);
  const isMember = !isEdit || user.role === "member";
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    email: user?.email || "",
    name: user?.name || "",
    password: "",
    membership_type: user?.membership_type || "normal",
    payment_status: user?.payment_status || (isEdit ? "none" : "due"),
    is_active: user?.is_active !== false,
  });

  const set = field => e => {
    const value = e.target.type === "checkbox" ? e.target.checked : e.target.value;
    setForm(prev => ({ ...prev, [field]: value }));
  };

  async function handleSubmit(e) {
    e.preventDefault();
    if (saving) return;
    setError("");
    setSaving(true);
    try {
      if (isEdit) {
        const payload = { name: form.name.trim() };
        if (!isSelf && form.is_active !== (user?.is_active !== false)) {
          payload.is_active = form.is_active;
        }
        if (isMember) {
          payload.membership_type = form.membership_type;
          payload.payment_status = form.payment_status;
        }
        const updated = await apiPut(`/admin/users/${user.id}`, payload);
        onSaved({ type: "updated", user: updated });
      } else {
        const created = await apiPost("/admin/users/member", {
          email: form.email.trim(),
          name: form.name.trim(),
          password: form.password.trim() || undefined,
          membership_type: form.membership_type,
          payment_status: form.payment_status,
        });
        onSaved({ type: "created", user: created });
      }
    } catch (err) {
      if (handleAuthError(err)) return;
      setError(
        errorMessage(
          err,
          isEdit
            ? t("admin.user_form.update_error", "No se pudieron guardar los cambios.")
            : t("admin.user_form.create_error", "No se pudo crear el socio."),
        ),
      );
      setSaving(false);
    }
  }

  const membershipOptions = MEMBERSHIP_TYPES.map(value => ({
    value,
    label: labels.membership(value),
  }));
  const paymentOptions = PAYMENT_STATUSES.map(value => ({
    value,
    label: labels.payment(value).label,
  }));

  return (
    <form onSubmit={handleSubmit} className="admin-form">
      <FormAlert message={error} />

      <div className="form-grid">
        {isEdit ? (
          <div className="form-field span-2 admin-form-readonly">
            <span className="form-label">{t("admin.user_form.email", "Email")}</span>
            <span className="admin-form-readonly__value">{user.email}</span>
          </div>
        ) : (
          <Input
            className="span-2"
            label={t("admin.user_form.email", "Email")}
            id="user-form-email"
            type="email"
            autoComplete="off"
            placeholder={t("admin.user_form.email_placeholder", "correo@ejemplo.com")}
            value={form.email}
            onChange={set("email")}
            required
          />
        )}

        <Input
          className="span-2"
          label={t("admin.user_form.name", "Nombre completo")}
          id="user-form-name"
          placeholder={t("admin.user_form.name_placeholder", "Ej.: Dra. Ana García Rodríguez")}
          value={form.name}
          onChange={set("name")}
          required
        />

        {!isEdit && (
          <Input
            className="span-2"
            label={t("admin.user_form.password", "Contraseña inicial (opcional)")}
            id="user-form-password"
            type="password"
            autoComplete="new-password"
            placeholder={t("admin.user_form.password_placeholder", "Se genera automáticamente si la dejas vacía")}
            helperText={t(
              "admin.user_form.password_help",
              "Al crear el socio verás la contraseña inicial para entregársela.",
            )}
            value={form.password}
            onChange={set("password")}
          />
        )}

        {isMember && (
          <>
            <Select
              label={t("admin.user_form.membership", "Tipo de membresía")}
              id="user-form-membership-type"
              value={form.membership_type}
              onChange={set("membership_type")}
              options={membershipOptions}
              placeholder=""
              required
            />
            <Select
              label={t("admin.user_form.payment", "Estado de pago")}
              id="user-form-payment-status"
              value={form.payment_status}
              onChange={set("payment_status")}
              options={paymentOptions}
              placeholder=""
              required
            />
          </>
        )}

        {isEdit && !isMember && (
          <p className="span-2 admin-form-note">
            <i className="fa-solid fa-circle-info" aria-hidden="true"></i>
            {t(
              "admin.user_form.admin_note",
              "Los administradores no tienen membresía ni estado de pago.",
            )}
          </p>
        )}

        {isEdit && (
          <div className="span-2 admin-check">
            <label className="admin-check__label" htmlFor="user-form-active">
              <input
                id="user-form-active"
                type="checkbox"
                checked={form.is_active}
                onChange={set("is_active")}
                disabled={isSelf}
                aria-describedby="user-form-active-help"
              />
              <span>{t("admin.user_form.active", "Cuenta activa")}</span>
            </label>
            <p id="user-form-active-help" className="form-helper">
              {isSelf
                ? t("admin.user_form.active_self", "No puedes desactivar tu propia cuenta.")
                : t("admin.user_form.active_help", "Las cuentas inactivas no pueden iniciar sesión.")}
            </p>
          </div>
        )}
      </div>

      <div className="modal-footer admin-modal-footer">
        <Button variant="outline" onClick={onCancel} disabled={saving}>
          {t("common.cancel", "Cancelar")}
        </Button>
        <Button type="submit" loading={saving}>
          {isEdit
            ? t("admin.user_form.save", "Guardar cambios")
            : t("admin.user_form.create", "Crear socio")}
        </Button>
      </div>
    </form>
  );
}

UserForm.propTypes = {
  user: PropTypes.shape({
    id: PropTypes.number.isRequired,
    email: PropTypes.string,
    name: PropTypes.string,
    role: PropTypes.string,
    membership_type: PropTypes.string,
    payment_status: PropTypes.string,
    is_active: PropTypes.bool,
  }),
  isSelf: PropTypes.bool,
  onSaved: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired,
};
