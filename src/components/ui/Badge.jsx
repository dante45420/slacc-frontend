import PropTypes from "prop-types";

const variants = {
  primary: {
    bg: "var(--color-primary)",
    color: "#fff",
  },
  secondary: {
    bg: "var(--color-secondary)",
    color: "#fff",
  },
  accent: {
    bg: "var(--color-accent)",
    color: "#fff",
  },
  success: {
    bg: "#10b981",
    color: "#fff",
  },
  warning: {
    bg: "#f59e0b",
    color: "#fff",
  },
  info: {
    bg: "#3b82f6",
    color: "#fff",
  },
  neutral: {
    bg: "var(--color-bg-alt)",
    color: "var(--color-text)",
  },
};

export default function Badge({
  children,
  variant = "primary",
  size = "md",
  style,
  ...props
}) {
  const colors = variants[variant] || variants.primary;
  const padding = size === "sm" ? "2px 8px" : "4px 12px";
  const fontSize = size === "sm" ? "0.75rem" : "0.85rem";

  return (
    <span
      style={{
        display: "inline-block",
        backgroundColor: colors.bg,
        color: colors.color,
        padding,
        borderRadius: "12px",
        fontSize,
        fontWeight: "500",
        lineHeight: "1.4",
        ...style,
      }}
      {...props}
    >
      {children}
    </span>
  );
}

Badge.propTypes = {
  children: PropTypes.node.isRequired,
  variant: PropTypes.oneOf([
    "primary",
    "secondary",
    "accent",
    "success",
    "warning",
    "info",
    "neutral",
  ]),
  size: PropTypes.oneOf(["sm", "md"]),
  style: PropTypes.object,
};
