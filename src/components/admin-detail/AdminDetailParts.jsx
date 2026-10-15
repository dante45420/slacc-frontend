import { useEffect, useId, useRef, useState } from "react";
import { Link } from "react-router-dom";
import PropTypes from "prop-types";
import { useTranslation } from "react-i18next";
import { Badge, Button, EmptyState, Modal, Section, Spinner, useToast } from "../ui";
import { copyText } from "./adminDetailUtils";

/* Status badge ----------------------------------------------------------- */

/** Badge that also accepts "danger" (styled by .badge-danger). */
export function StatusBadge({ variant, children, size = "md", icon }) {
  const isDanger = variant === "danger";
  return (
    <Badge
      variant={isDanger ? "accent" : variant}
      size={size}
      className={isDanger ? "badge-danger" : undefined}
    >
      {icon && <i className={icon} aria-hidden="true"></i>}
      {children}
    </Badge>
  );
}

StatusBadge.propTypes = {
  variant: PropTypes.string.isRequired,
  children: PropTypes.node.isRequired,
  size: PropTypes.oneOf(["sm", "md"]),
  icon: PropTypes.string,
};

/* Back link -------------------------------------------------------------- */

export function BackLink({ to, children }) {
  return (
    <Link to={to} className="back-link">
      <i className="fa-solid fa-arrow-left" aria-hidden="true"></i>
      {children}
    </Link>
  );
}

BackLink.propTypes = {
  to: PropTypes.string.isRequired,
  children: PropTypes.node.isRequired,
};

/* Card with icon heading -------------------------------------------------- */

export function DetailCard({ icon, title, action, children, className }) {
  const headingId = useId();
  return (
    <section
      className={`card admin-detail-card ${className || ""}`.trim()}
      aria-labelledby={headingId}
    >
      <header className="admin-detail-card__head">
        {icon && (
          <span className="admin-detail-card__icon" aria-hidden="true">
            <i className={icon}></i>
          </span>
        )}
        <h2 id={headingId} className="admin-detail-card__title">
          {title}
        </h2>
        {action && <div className="admin-detail-card__action">{action}</div>}
      </header>
      {children}
    </section>
  );
}

DetailCard.propTypes = {
  icon: PropTypes.string,
  title: PropTypes.node.isRequired,
  action: PropTypes.node,
  children: PropTypes.node,
  className: PropTypes.string,
};

/** Value for a <dd>: shows a muted "No especificado" when empty. */
export function DetailValue({ children }) {
  const { t } = useTranslation();
  const empty =
    children === null ||
    children === undefined ||
    children === false ||
    (typeof children === "string" && children.trim() === "");
  if (empty) {
    return (
      <span className="admin-detail-empty">
        {t("adminDetail.not_specified", "No especificado")}
      </span>
    );
  }
  return children;
}

DetailValue.propTypes = {
  children: PropTypes.node,
};

/* Page states ------------------------------------------------------------ */

export function DetailLoading({ label }) {
  return (
    <div className="page admin-detail">
      <div className="page-loading admin-detail-loading">
        <Spinner size="lg" label={label} />
        <p>{label}</p>
      </div>
    </div>
  );
}

DetailLoading.propTypes = {
  label: PropTypes.string.isRequired,
};

/** Not-found / load-error state with a way back (and a retry for errors). */
export function DetailUnavailable({
  notFound,
  icon,
  title,
  description,
  backTo,
  backLabel,
  onRetry,
}) {
  const { t } = useTranslation();
  return (
    <div className="page admin-detail">
      <Section containerSize="sm">
        <BackLink to={backTo}>{backLabel}</BackLink>
        <EmptyState
          className="admin-detail-unavailable"
          icon={
            <i
              className={
                notFound ? icon || "fa-regular fa-folder-open" : "fa-solid fa-triangle-exclamation"
              }
            ></i>
          }
          title={title}
          description={description}
          action={
            <div className="admin-detail-state-actions">
              {!notFound && onRetry && (
                <Button variant="outline" onClick={onRetry}>
                  <i className="fa-solid fa-rotate-right" aria-hidden="true"></i>
                  {t("adminDetail.retry", "Reintentar")}
                </Button>
              )}
              <Button to={backTo}>{backLabel}</Button>
            </div>
          }
        />
      </Section>
    </div>
  );
}

DetailUnavailable.propTypes = {
  notFound: PropTypes.bool,
  icon: PropTypes.string,
  title: PropTypes.node.isRequired,
  description: PropTypes.node,
  backTo: PropTypes.string.isRequired,
  backLabel: PropTypes.node.isRequired,
  onRetry: PropTypes.func,
};

/* Credentials (plaintext initial password — client requirement) ---------- */

function useCopy() {
  const { t } = useTranslation();
  const toast = useToast();
  const [copied, setCopied] = useState(null);
  const timer = useRef(null);

  useEffect(() => () => clearTimeout(timer.current), []);

  async function copy(key, text) {
    try {
      await copyText(text);
      setCopied(key);
      clearTimeout(timer.current);
      timer.current = setTimeout(() => setCopied(null), 2000);
      toast.success(t("adminDetail.copied", "Copiado al portapapeles"), 2500);
    } catch {
      toast.error(t("adminDetail.copy_error", "No se pudo copiar. Selecciona el texto y cópialo manualmente."));
    }
  }

  return { copied, copy };
}

/**
 * Email + initial password (+ optional membership) with copy buttons.
 * `variant="card"` wraps it in a card with a heading; `variant="plain"` is
 * for use inside a modal.
 */
export function CredentialsPanel({ name, email, password, membership, variant = "card" }) {
  const { t } = useTranslation();
  const { copied, copy } = useCopy();
  const headingId = useId();

  const rows = [
    {
      key: "email",
      icon: "fa-regular fa-envelope",
      label: t("adminDetail.cred_email", "Email"),
      value: email,
      copyLabel: t("adminDetail.copy_email", "Copiar email"),
    },
    {
      key: "password",
      icon: "fa-solid fa-lock",
      label: t("adminDetail.cred_password", "Contraseña inicial"),
      value: password,
      copyLabel: t("adminDetail.copy_password", "Copiar contraseña"),
      mono: true,
    },
  ];

  const allText = [
    `${t("adminDetail.cred_email", "Email")}: ${email}`,
    `${t("adminDetail.cred_password", "Contraseña inicial")}: ${password}`,
    membership ? `${t("adminDetail.cred_membership", "Membresía")}: ${membership}` : null,
  ]
    .filter(Boolean)
    .join("\n");

  const list = (
    <>
      <dl className="admin-detail-cred-list">
        {rows.map(row => (
          <div className="admin-detail-cred" key={row.key}>
            <dt className="admin-detail-cred__label">
              <i className={row.icon} aria-hidden="true"></i>
              {row.label}
            </dt>
            <dd className="admin-detail-cred__row">
              <code
                className={`admin-detail-pill${row.mono ? " admin-detail-pill--secret" : ""}`}
              >
                {row.value}
              </code>
              <button
                type="button"
                className={`admin-detail-copy${copied === row.key ? " is-copied" : ""}`}
                onClick={() => copy(row.key, row.value)}
                aria-label={row.copyLabel}
                title={row.copyLabel}
              >
                <i
                  className={`fa-solid ${copied === row.key ? "fa-check" : "fa-copy"}`}
                  aria-hidden="true"
                ></i>
              </button>
            </dd>
          </div>
        ))}
        {membership && (
          <div className="admin-detail-cred">
            <dt className="admin-detail-cred__label">
              <i className="fa-regular fa-id-card" aria-hidden="true"></i>
              {t("adminDetail.cred_membership", "Membresía")}
            </dt>
            <dd className="admin-detail-cred__plain">{membership}</dd>
          </div>
        )}
      </dl>
      <Button
        variant="secondary"
        size="sm"
        fullWidth
        className="admin-detail-cred__all"
        onClick={() => copy("all", allText)}
      >
        <i
          className={`fa-solid ${copied === "all" ? "fa-check" : "fa-clipboard"}`}
          aria-hidden="true"
        ></i>
        {t("adminDetail.copy_all", "Copiar todo")}
      </Button>
    </>
  );

  if (variant === "plain") {
    return <div className="admin-detail-credentials-plain">{list}</div>;
  }

  return (
    <section
      className="card admin-detail-credentials"
      aria-labelledby={headingId}
    >
      <header className="admin-detail-credentials__head">
        <span className="admin-detail-credentials__icon" aria-hidden="true">
          <i className="fa-solid fa-key"></i>
        </span>
        <div className="admin-detail-credentials__heading">
          <h2 id={headingId} className="admin-detail-card__title">
            {t("adminDetail.cred_title", "Credenciales del socio")}
          </h2>
          {name && (
            <p className="admin-detail-credentials__subtitle">
              {t("adminDetail.cred_subtitle", "Acceso inicial de {{name}}", { name })}
            </p>
          )}
        </div>
      </header>
      {list}
      <p className="admin-detail-credentials__note">
        <i className="fa-solid fa-shield-halved" aria-hidden="true"></i>
        {t(
          "adminDetail.cred_note",
          "Envía estas credenciales al socio por un canal seguro.",
        )}
      </p>
    </section>
  );
}

CredentialsPanel.propTypes = {
  name: PropTypes.string,
  email: PropTypes.string.isRequired,
  password: PropTypes.string.isRequired,
  membership: PropTypes.string,
  variant: PropTypes.oneOf(["card", "plain"]),
};

/* Confirmation dialog ---------------------------------------------------- */

export function ConfirmDialog({
  isOpen,
  title,
  children,
  confirmLabel,
  confirmVariant = "primary",
  loading = false,
  onConfirm,
  onCancel,
}) {
  const { t } = useTranslation();
  return (
    <Modal isOpen={isOpen} onClose={loading ? () => {} : onCancel} title={title} size="small">
      <div className="admin-detail-confirm">{children}</div>
      <div className="modal-footer admin-detail-confirm__footer">
        <Button variant="outline" onClick={onCancel} disabled={loading}>
          {t("common.cancel", "Cancelar")}
        </Button>
        <Button variant={confirmVariant} onClick={onConfirm} loading={loading}>
          {confirmLabel}
        </Button>
      </div>
    </Modal>
  );
}

ConfirmDialog.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  title: PropTypes.node.isRequired,
  children: PropTypes.node.isRequired,
  confirmLabel: PropTypes.node.isRequired,
  confirmVariant: PropTypes.string,
  loading: PropTypes.bool,
  onConfirm: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired,
};
