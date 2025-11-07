import PropTypes from "prop-types";

export default function Textarea({
  label,
  id,
  error,
  helperText,
  rows = 4,
  className,
  ...props
}) {
  const textareaId =
    id || `textarea-${label?.toLowerCase().replaceAll(/\s+/g, "-")}`;

  return (
    <div className={`form-field ${className || ""}`}>
      {label && (
        <label htmlFor={textareaId} className="form-label">
          {label}
        </label>
      )}
      <textarea
        id={textareaId}
        rows={rows}
        className={`form-textarea ${error ? "error" : ""}`}
        {...props}
      />
      {error && <p className="form-error">{error}</p>}
      {helperText && !error && <p className="form-helper">{helperText}</p>}
    </div>
  );
}

Textarea.propTypes = {
  label: PropTypes.string,
  id: PropTypes.string,
  error: PropTypes.string,
  helperText: PropTypes.string,
  rows: PropTypes.number,
  className: PropTypes.string,
};
