import PropTypes from "prop-types";

export default function Select({
  label,
  id,
  error,
  helperText,
  options = [],
  placeholder = "Seleccionar...",
  className,
  children,
  ...props
}) {
  const selectId =
    id || `select-${label?.toLowerCase().replaceAll(/\s+/g, "-")}`;

  return (
    <div className={`form-field ${className || ""}`}>
      {label && (
        <label htmlFor={selectId} className="form-label">
          {label}
        </label>
      )}
      <select
        id={selectId}
        className={`form-select ${error ? "error" : ""}`}
        {...props}
      >
        {/* Support both children (option elements) and options prop */}
        {children || (
          <>
            {placeholder && <option value="">{placeholder}</option>}
            {options.map(opt => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </>
        )}
      </select>
      {error && <p className="form-error">{error}</p>}
      {helperText && !error && <p className="form-helper">{helperText}</p>}
    </div>
  );
}

Select.propTypes = {
  label: PropTypes.string,
  id: PropTypes.string,
  error: PropTypes.string,
  helperText: PropTypes.string,
  options: PropTypes.arrayOf(
    PropTypes.shape({
      value: PropTypes.string.isRequired,
      label: PropTypes.string.isRequired,
    })
  ),
  placeholder: PropTypes.string,
  className: PropTypes.string,
  children: PropTypes.node,
};
