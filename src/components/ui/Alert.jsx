import PropTypes from "prop-types";
import { useTranslation } from "react-i18next";

const ICONS = {
  info: "fa-circle-info",
  success: "fa-circle-check",
  warning: "fa-triangle-exclamation",
  error: "fa-circle-exclamation",
};

export default function Alert({
  children,
  variant = "info",
  onClose,
  className,
  ...props
}) {
  const { t } = useTranslation();
  const urgent = variant === "error" || variant === "warning";

  return (
    <div
      className={`alert alert-${variant} ${className || ""}`.trim()}
      role={urgent ? "alert" : "status"}
      {...props}
    >
      <i className={`fa-solid ${ICONS[variant] || ICONS.info} alert-icon`} aria-hidden="true"></i>
      <div className="alert-content">{children}</div>
      {onClose && (
        <button
          type="button"
          onClick={onClose}
          className="alert-close"
          aria-label={t("common.close", "Cerrar")}
        >
          <i className="fa-solid fa-xmark" aria-hidden="true"></i>
        </button>
      )}
    </div>
  );
}

Alert.propTypes = {
  children: PropTypes.node.isRequired,
  variant: PropTypes.oneOf(["info", "success", "warning", "error"]),
  onClose: PropTypes.func,
  className: PropTypes.string,
};
