import { useState } from "react";
import PropTypes from "prop-types";

export default function Input({
  label,
  id,
  error,
  helperText,
  className,
  type,
  ...props
}) {
  const [showPassword, setShowPassword] = useState(false);
  const inputId = id || `input-${label?.toLowerCase().replaceAll(/\s+/g, "-")}`;
  const isPassword = type === "password";
  const actualType = isPassword && showPassword ? "text" : type;

  return (
    <div className={`form-field ${className || ""}`}>
      {label && (
        <label htmlFor={inputId} className="form-label">
          {label}
        </label>
      )}
      <div style={{ position: "relative" }}>
        <input
          id={inputId}
          type={actualType}
          className={`form-input ${error ? "error" : ""}`}
          {...props}
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            style={{
              position: "absolute",
              right: "12px",
              top: "50%",
              transform: "translateY(-50%)",
              background: "none",
              border: "none",
              cursor: "pointer",
              color: "var(--color-text-secondary)",
              padding: "4px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
            aria-label={
              showPassword ? "Ocultar contraseña" : "Mostrar contraseña"
            }
          >
            {showPassword ? (
              <i className="fa-solid fa-eye-slash"></i>
            ) : (
              <i className="fa-solid fa-eye"></i>
            )}
          </button>
        )}
      </div>
      {error && <p className="form-error">{error}</p>}
      {helperText && !error && <p className="form-helper">{helperText}</p>}
    </div>
  );
}

Input.propTypes = {
  label: PropTypes.string,
  id: PropTypes.string,
  error: PropTypes.string,
  helperText: PropTypes.string,
  className: PropTypes.string,
  type: PropTypes.string,
};
