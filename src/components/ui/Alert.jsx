import PropTypes from "prop-types";

const variants = {
  info: {
    bg: "#dbeafe",
    border: "#3b82f6",
    color: "#1e40af",
  },
  success: {
    bg: "#d1fae5",
    border: "#10b981",
    color: "#065f46",
  },
  warning: {
    bg: "#fef3c7",
    border: "#f59e0b",
    color: "#92400e",
  },
  error: {
    bg: "#fee2e2",
    border: "#ef4444",
    color: "#991b1b",
  },
};

export default function Alert({
  children,
  variant = "info",
  onClose,
  style,
  ...props
}) {
  const colors = variants[variant] || variants.info;

  return (
    <div
      style={{
        backgroundColor: colors.bg,
        border: `1px solid ${colors.border}`,
        borderLeft: `4px solid ${colors.border}`,
        color: colors.color,
        padding: "var(--spacing-4)",
        borderRadius: "var(--radius)",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "flex-start",
        gap: "var(--spacing-3)",
        ...style,
      }}
      {...props}
    >
      <div style={{ flex: 1 }}>{children}</div>
      {onClose && (
        <button
          onClick={onClose}
          style={{
            background: "none",
            border: "none",
            color: colors.color,
            cursor: "pointer",
            fontSize: "20px",
            lineHeight: 1,
            padding: 0,
            opacity: 0.7,
          }}
          onMouseEnter={e => (e.target.style.opacity = 1)}
          onMouseLeave={e => (e.target.style.opacity = 0.7)}
        >
          ×
        </button>
      )}
    </div>
  );
}

Alert.propTypes = {
  children: PropTypes.node.isRequired,
  variant: PropTypes.oneOf(["info", "success", "warning", "error"]),
  onClose: PropTypes.func,
  style: PropTypes.object,
};
