import PropTypes from "prop-types";

export default function Textarea({
  label,
  id,
  error,
  helperText,
  rows = 4,
  containerStyle,
  ...props
}) {
  const textareaId =
    id || `textarea-${label?.toLowerCase().replaceAll(/\s+/g, "-")}`;

  return (
    <div style={{ marginBottom: "var(--spacing-4)", ...containerStyle }}>
      {label && (
        <label
          htmlFor={textareaId}
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
      <textarea
        id={textareaId}
        rows={rows}
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
          fontFamily: "var(--font-family-base)",
          resize: "vertical",
          lineHeight: "1.6",
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
      />
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

Textarea.propTypes = {
  label: PropTypes.string,
  id: PropTypes.string,
  error: PropTypes.string,
  helperText: PropTypes.string,
  rows: PropTypes.number,
  containerStyle: PropTypes.object,
};
