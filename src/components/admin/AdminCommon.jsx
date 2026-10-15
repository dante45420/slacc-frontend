// Building blocks shared by the admin dashboard tabs.
import { useEffect, useId, useRef, useState } from "react";
import PropTypes from "prop-types";
import { useTranslation } from "react-i18next";
import { Alert, Button, Modal, Spinner } from "../ui";
import { copyToClipboard } from "./adminUtils";

/** Status pill. Renders the badge markup directly so every semantic variant
 *  (including danger) is available. */
export function StatusBadge({ label, variant = "neutral", size = "sm", icon }) {
  return (
    <span className={`badge badge-${variant}${size === "sm" ? " badge-sm" : ""} admin-badge`}>
      {icon && <i className={`fa-solid ${icon}`} aria-hidden="true"></i>}
      {label}
    </span>
  );
}

StatusBadge.propTypes = {
  label: PropTypes.node.isRequired,
  variant: PropTypes.oneOf([
    "primary",
    "secondary",
    "accent",
    "success",
    "warning",
    "info",
    "neutral",
    "danger",
  ]),
  size: PropTypes.oneOf(["sm", "md"]),
  icon: PropTypes.string,
};

export function AdminLoading({ label }) {
  const { t } = useTranslation();
  return (
    <div className="admin-state admin-state--loading">
      <Spinner size="lg" label={label || t("common.loading", "Cargando...")} />
      <p>{label || t("common.loading", "Cargando...")}</p>
    </div>
  );
}

AdminLoading.propTypes = {
  label: PropTypes.string,
};

export function AdminError({ title, message, onRetry }) {
  const { t } = useTranslation();
  return (
    <Alert variant="error" className="admin-error">
      <div className="admin-error__body">
        <div className="admin-error__text">
          <strong>{title}</strong>
          {message && <span>{message}</span>}
        </div>
        {onRetry && (
          <Button variant="outline" size="sm" onClick={onRetry}>
            <i className="fa-solid fa-rotate-right" aria-hidden="true"></i>
            {t("admin.common.retry", "Reintentar")}
          </Button>
        )}
      </div>
    </Alert>
  );
}

AdminError.propTypes = {
  title: PropTypes.node.isRequired,
  message: PropTypes.node,
  onRetry: PropTypes.func,
};

/** Error banner at the top of a modal form. Long forms are submitted from
 *  the bottom, so it scrolls itself into view whenever the message changes. */
export function FormAlert({ message }) {
  const ref = useRef(null);
  useEffect(() => {
    if (message) ref.current?.scrollIntoView({ block: "nearest" });
  }, [message]);
  if (!message) return null;
  return (
    <div ref={ref} className="admin-form-alert">
      <Alert variant="error">{message}</Alert>
    </div>
  );
}

FormAlert.propTypes = {
  message: PropTypes.node,
};

/** Heading row of a tab panel: title + count on the left, tools on the right. */
export function AdminToolbar({ title, meta, children, busy }) {
  return (
    <div className="admin-toolbar">
      <div className="admin-toolbar__heading">
        <h2 className="admin-toolbar__title">{title}</h2>
        {meta && (
          <div className="admin-toolbar__meta">
            <span>{meta}</span>
            {busy && <Spinner size="sm" className="admin-toolbar__spinner" />}
          </div>
        )}
      </div>
      {children && <div className="admin-toolbar__tools">{children}</div>}
    </div>
  );
}

AdminToolbar.propTypes = {
  title: PropTypes.node.isRequired,
  meta: PropTypes.node,
  children: PropTypes.node,
  busy: PropTypes.bool,
};

export function SearchField({ value, onChange, placeholder, label }) {
  const id = useId();
  const { t } = useTranslation();
  return (
    <div className="admin-search">
      <label htmlFor={id} className="sr-only">
        {label}
      </label>
      <i className="fa-solid fa-magnifying-glass admin-search__icon" aria-hidden="true"></i>
      <input
        id={id}
        type="search"
        className="form-input admin-search__input"
        value={value}
        placeholder={placeholder}
        onChange={e => onChange(e.target.value)}
        autoComplete="off"
      />
      {value && (
        <button
          type="button"
          className="admin-search__clear"
          onClick={() => onChange("")}
          aria-label={t("admin.common.clear_search", "Borrar búsqueda")}
        >
          <i className="fa-solid fa-xmark" aria-hidden="true"></i>
        </button>
      )}
    </div>
  );
}

SearchField.propTypes = {
  value: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
  placeholder: PropTypes.string,
  label: PropTypes.string.isRequired,
};

/** Pill filter row: options = [{ id, label, count }]. */
export function FilterPills({ options, value, onChange, label }) {
  return (
    <div className="filter-bar admin-filters" role="group" aria-label={label}>
      {options
        .filter(opt => opt.id === "all" || opt.id === value || opt.count !== 0)
        .map(opt => (
          <button
            key={opt.id}
            type="button"
            className="filter-pill admin-filter-pill"
            aria-pressed={value === opt.id}
            onClick={() => onChange(opt.id)}
          >
            {opt.label}
            {typeof opt.count === "number" && (
              <span className="admin-filter-pill__count">{opt.count}</span>
            )}
          </button>
        ))}
    </div>
  );
}

FilterPills.propTypes = {
  options: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      label: PropTypes.node.isRequired,
      count: PropTypes.number,
    }),
  ).isRequired,
  value: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
  label: PropTypes.string.isRequired,
};

/** Copy-to-clipboard button with a short "Copiado" confirmation. */
export function CopyButton({ text, label, display, compact = false }) {
  const { t } = useTranslation();
  const [state, setState] = useState("idle"); // idle | copied | failed
  const timer = useRef(null);

  useEffect(() => () => clearTimeout(timer.current), []);

  const onCopy = async () => {
    const ok = await copyToClipboard(text);
    setState(ok ? "copied" : "failed");
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setState("idle"), 2000);
  };

  let text_ = display || t("admin.common.copy", "Copiar");
  let icon = "fa-regular fa-copy";
  if (state === "copied") {
    text_ = t("admin.common.copied", "Copiado");
    icon = "fa-solid fa-check";
  } else if (state === "failed") {
    text_ = t("admin.common.copy_failed", "No se pudo copiar");
    icon = "fa-solid fa-triangle-exclamation";
  }

  return (
    <button
      type="button"
      className={`admin-copy-btn${compact ? " admin-copy-btn--compact" : ""}${
        state === "copied" ? " is-copied" : ""
      }`}
      onClick={onCopy}
      aria-label={display && !compact ? undefined : label}
      title={label}
    >
      <i className={icon} aria-hidden="true"></i>
      {!compact && <span>{text_}</span>}
      <span className="sr-only" aria-live="polite">
        {state === "copied" ? t("admin.common.copied", "Copiado") : ""}
      </span>
    </button>
  );
}

CopyButton.propTypes = {
  text: PropTypes.string.isRequired,
  label: PropTypes.string.isRequired,
  display: PropTypes.string,
  compact: PropTypes.bool,
};

/** A labelled value shown as a pill, with its own copy button. */
export function CopyField({ label, value, mono = false }) {
  const { t } = useTranslation();
  return (
    <div className="admin-copy-field">
      <span className="admin-copy-field__label">{label}</span>
      <div className="admin-copy-field__row">
        <code className={`admin-copy-field__value${mono ? " is-mono" : ""}`}>{value}</code>
        <CopyButton
          text={value}
          label={t("admin.common.copy_value", "Copiar {{label}}", { label: label.toLowerCase() })}
        />
      </div>
    </div>
  );
}

CopyField.propTypes = {
  label: PropTypes.string.isRequired,
  value: PropTypes.string.isRequired,
  mono: PropTypes.bool,
};

/** Confirmation dialog for destructive actions. */
export function ConfirmDialog({
  isOpen,
  title,
  children,
  confirmLabel,
  onConfirm,
  onCancel,
  busy = false,
  error,
}) {
  const { t } = useTranslation();
  return (
    <Modal isOpen={isOpen} onClose={busy ? () => {} : onCancel} title={title} size="small">
      <div className="admin-confirm">
        <div className="admin-confirm__icon" aria-hidden="true">
          <i className="fa-solid fa-triangle-exclamation"></i>
        </div>
        <div className="admin-confirm__body">{children}</div>
      </div>
      {error && (
        <Alert variant="error" className="admin-form-alert">
          {error}
        </Alert>
      )}
      <div className="modal-footer admin-modal-footer">
        <Button variant="outline" onClick={onCancel} disabled={busy}>
          {t("common.cancel", "Cancelar")}
        </Button>
        <Button variant="danger" onClick={onConfirm} loading={busy}>
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
  onConfirm: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired,
  busy: PropTypes.bool,
  error: PropTypes.node,
};

/** Name + secondary line cell (e.g. member name and email). */
/**
 * Main cell of a list row. `extra` repeats the data of columns that the
 * table hides on tablets (`.admin-col-hide-md` below 1024px, `"md"`; the
 * events location column below 1280px, `"lg"`), so a tablet never shows less
 * than the phone cards. The line and its column are never displayed together.
 */
export function PrimaryCell({ title, subtitle, leading, extra, extraWhen = "md" }) {
  return (
    <div className="admin-cell">
      {leading}
      <div className="admin-cell__text">
        <span className="admin-cell__title">{title}</span>
        {subtitle && <span className="admin-cell__subtitle">{subtitle}</span>}
        {extra && (
          <span className={`admin-cell__extra admin-cell__extra--${extraWhen}`}>{extra}</span>
        )}
      </div>
    </div>
  );
}

PrimaryCell.propTypes = {
  title: PropTypes.node.isRequired,
  subtitle: PropTypes.node,
  leading: PropTypes.node,
  extra: PropTypes.node,
  extraWhen: PropTypes.oneOf(["md", "lg"]),
};

/** "Label: value" chip for PrimaryCell's `extra` line. */
export function ExtraItem({ label, children, icon }) {
  return (
    <span className="admin-cell__extra-item">
      {icon && <i className={icon} aria-hidden="true"></i>}
      <span className="admin-cell__extra-label">{label}:</span> {children}
    </span>
  );
}

ExtraItem.propTypes = {
  label: PropTypes.node.isRequired,
  children: PropTypes.node.isRequired,
  icon: PropTypes.string,
};

/** Icon + text row action. `to` renders a router link. */
export function RowAction({ icon, label, ariaLabel, onClick, to, danger = false, iconOnly = false }) {
  return (
    <Button
      variant="outline"
      size="sm"
      to={to}
      onClick={onClick}
      aria-label={ariaLabel}
      title={ariaLabel}
      className={`admin-row-action${danger ? " admin-row-action--danger" : ""}${
        iconOnly ? " admin-row-action--icon" : ""
      }`}
    >
      <i className={icon} aria-hidden="true"></i>
      {!iconOnly && <span className="admin-row-action__label">{label}</span>}
    </Button>
  );
}

RowAction.propTypes = {
  icon: PropTypes.string.isRequired,
  label: PropTypes.node.isRequired,
  ariaLabel: PropTypes.string.isRequired,
  onClick: PropTypes.func,
  to: PropTypes.string,
  danger: PropTypes.bool,
  iconOnly: PropTypes.bool,
};
