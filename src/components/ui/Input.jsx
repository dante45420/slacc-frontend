import { forwardRef, useId, useState } from "react";
import PropTypes from "prop-types";
import { useTranslation } from "react-i18next";

const Input = forwardRef(function Input({
  label,
  id,
  error,
  helperText,
  className,
  type,
  required,
  ...props
}, ref) {
  const { t } = useTranslation();
  const [showPassword, setShowPassword] = useState(false);
  const autoId = useId();
  const inputId = id || `input-${autoId}`;
  const messageId = `${inputId}-msg`;
  const isPassword = type === "password";
  const actualType = isPassword && showPassword ? "text" : type;
  const message = error || helperText;

  return (
    <div className={`form-field ${className || ""}`.trim()}>
      {label && (
        <label htmlFor={inputId} className="form-label">
          {label}
          {required && (
            <span className="form-required" aria-hidden="true">
              {" "}*
            </span>
          )}
        </label>
      )}
      <div className="input-wrapper">
        <input
          ref={ref}
          id={inputId}
          type={actualType}
          required={required}
          className={`form-input ${error ? "error" : ""}`.trim()}
          aria-invalid={error ? true : undefined}
          aria-describedby={message ? messageId : undefined}
          {...props}
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="input-password-toggle"
            aria-label={
              showPassword
                ? t("common.hide_password", "Ocultar contraseña")
                : t("common.show_password", "Mostrar contraseña")
            }
            aria-pressed={showPassword}
          >
            <i
              className={`fa-solid ${showPassword ? "fa-eye-slash" : "fa-eye"}`}
              aria-hidden="true"
            ></i>
          </button>
        )}
      </div>
      {error && (
        <p className="form-error" id={messageId} role="alert">
          {error}
        </p>
      )}
      {helperText && !error && (
        <p className="form-helper" id={messageId}>
          {helperText}
        </p>
      )}
    </div>
  );
});

Input.propTypes = {
  label: PropTypes.node,
  id: PropTypes.string,
  error: PropTypes.string,
  helperText: PropTypes.node,
  className: PropTypes.string,
  type: PropTypes.string,
  required: PropTypes.bool,
};

export default Input;
