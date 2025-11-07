import PropTypes from "prop-types";

export default function Input({
  label,
  id,
  error,
  helperText,
  className,
  ...props
}) {
  const inputId = id || `input-${label?.toLowerCase().replaceAll(/\s+/g, "-")}`;

  return (
    <div className={`form-field ${className || ""}`}>
      {label && (
        <label htmlFor={inputId} className="form-label">
          {label}
        </label>
      )}
      <input
        id={inputId}
        className={`form-input ${error ? "error" : ""}`}
        {...props}
      />
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
};
