import PropTypes from "prop-types";

export default function Select({
  label,
  id,
  error,
  helperText,
  options = [],
  placeholder = "Seleccionar...",
  containerStyle,
  ...props
}) {
  const selectId =
    id || `select-${label?.toLowerCase().replaceAll(/\s+/g, "-")}`;

  return (
    <div style={{ marginBottom: "var(--spacing-4)", ...containerStyle }}>
      {label && (
        <label
          htmlFor={selectId}
          style={{
            display: "block",
            marginBottom: "var(--spacing-2)",
            fontWeight: "500",
            fontSize: "14px",
            color: "var(--color-text)",
          }}
        >
          {label}
        </label>
      )}
      <select
        id={selectId}
        style={{
          width: "100%",
          padding: "12px 14px",
          border: `1px solid ${
            error ? "var(--color-error)" : "var(--color-border)"
          }`,
          borderRadius: "var(--radius)",
          fontSize: "15px",
          transition: "all 0.2s ease",
          outline: "none",
          backgroundColor: "var(--color-bg)",
          cursor: "pointer",
          appearance: "none",
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%236b7280' d='M6 9L1 4h10z'/%3E%3C/svg%3E")`,
          backgroundRepeat: "no-repeat",
          backgroundPosition: "right 12px center",
          paddingRight: "36px",
        }}
        onFocus={e => {
          e.target.style.borderColor = error
            ? "var(--color-error)"
            : "var(--color-primary)";
          e.target.style.boxShadow = `0 0 0 3px ${
            error ? "rgba(239, 68, 68, 0.1)" : "rgba(0, 87, 183, 0.1)"
          }`;
        }}
        onBlur={e => {
          e.target.style.borderColor = error
            ? "var(--color-error)"
            : "var(--color-border)";
          e.target.style.boxShadow = "none";
        }}
        {...props}
      >
        {placeholder && <option value="">{placeholder}</option>}
        {options.map(opt => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      {error && (
        <p
          style={{
            margin: "var(--spacing-2) 0 0",
            fontSize: "13px",
            color: "var(--color-error)",
          }}
        >
          {error}
        </p>
      )}
      {helperText && !error && (
        <p
          style={{
            margin: "var(--spacing-2) 0 0",
            fontSize: "13px",
            color: "var(--color-muted)",
          }}
        >
          {helperText}
        </p>
      )}
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
  containerStyle: PropTypes.object,
};
