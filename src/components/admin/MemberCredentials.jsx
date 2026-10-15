// Shows a newly created member's email and initial password (client
// requirement: the admin must be able to read and hand over the password).
import PropTypes from "prop-types";
import { useTranslation } from "react-i18next";
import { Button, Modal } from "../ui";
import { CopyButton, CopyField } from "./AdminCommon";

const credentialsShape = PropTypes.shape({
  name: PropTypes.string,
  email: PropTypes.string.isRequired,
  password: PropTypes.string.isRequired,
});

function CredentialFields({ credentials }) {
  const { t } = useTranslation();
  return (
    <div className="admin-credentials__fields">
      <CopyField label={t("admin.credentials.email", "Email")} value={credentials.email} />
      <CopyField
        label={t("admin.credentials.password", "Contraseña inicial")}
        value={credentials.password}
        mono
      />
    </div>
  );
}

CredentialFields.propTypes = { credentials: credentialsShape.isRequired };

function allText(t, c) {
  return [
    c.name,
    `${t("admin.credentials.email", "Email")}: ${c.email}`,
    `${t("admin.credentials.password", "Contraseña inicial")}: ${c.password}`,
  ]
    .filter(Boolean)
    .join("\n");
}

/** Modal opened right after creating a member. */
export function CredentialsModal({ credentials, onClose }) {
  const { t } = useTranslation();
  return (
    <Modal
      isOpen
      onClose={onClose}
      title={t("admin.credentials.title", "Socio creado")}
      size="small"
    >
      <div className="admin-credentials">
        <div className="admin-credentials__intro">
          <span className="admin-credentials__check" aria-hidden="true">
            <i className="fa-solid fa-check"></i>
          </span>
          <p>
            {t("admin.credentials.intro", {
              name: credentials.name || credentials.email,
              defaultValue:
                "La cuenta de {{name}} está lista. Entrégale estas credenciales para su primer ingreso.",
            })}
          </p>
        </div>
        <CredentialFields credentials={credentials} />
        <div className="modal-footer admin-modal-footer">
          <CopyButton
            text={allText(t, credentials)}
            label={t("admin.credentials.copy_all", "Copiar email y contraseña")}
            display={t("admin.credentials.copy_all_short", "Copiar todo")}
          />
          <Button onClick={onClose}>{t("admin.credentials.done", "Listo")}</Button>
        </div>
      </div>
    </Modal>
  );
}

CredentialsModal.propTypes = {
  credentials: credentialsShape.isRequired,
  onClose: PropTypes.func.isRequired,
};

/** Inline card that keeps the last credentials on screen after the modal
 *  is closed, until the admin dismisses it. */
export function CredentialsCard({ credentials, onDismiss }) {
  const { t } = useTranslation();
  return (
    <section className="admin-credentials-card" aria-labelledby="admin-credentials-card-title">
      <header className="admin-credentials-card__head">
        <div>
          <p className="admin-credentials-card__kicker">
            {t("admin.credentials.card_kicker", "Último socio creado")}
          </p>
          <h3 id="admin-credentials-card-title" className="admin-credentials-card__title">
            {credentials.name || credentials.email}
          </h3>
        </div>
        <button
          type="button"
          className="admin-icon-btn"
          onClick={onDismiss}
          aria-label={t("admin.credentials.dismiss", "Ocultar credenciales")}
          title={t("admin.credentials.dismiss", "Ocultar credenciales")}
        >
          <i className="fa-solid fa-xmark" aria-hidden="true"></i>
        </button>
      </header>
      <CredentialFields credentials={credentials} />
    </section>
  );
}

CredentialsCard.propTypes = {
  credentials: credentialsShape.isRequired,
  onDismiss: PropTypes.func.isRequired,
};
