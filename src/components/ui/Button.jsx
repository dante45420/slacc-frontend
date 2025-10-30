import PropTypes from "prop-types";

export default function Button({
  variant = "primary",
  size = "md",
  fullWidth = false,
  loading = false,
  disabled = false,
  children,
  style,
  ...props
}) {
  const baseClass = "btn";

  let variantClass = "btn-primary";
  if (variant === "outline") variantClass = "btn-outline";
  else if (variant === "secondary") variantClass = "btn-secondary";
  else if (variant === "danger") variantClass = "btn-danger";

  let sizeClass = "";
  if (size === "sm") sizeClass = "btn-sm";
  else if (size === "lg") sizeClass = "btn-lg";

  const className = `${baseClass} ${variantClass} ${sizeClass}`.trim();

  let cursor = "pointer";
  if (loading) cursor = "wait";
  else if (disabled) cursor = "not-allowed";

  return (
    <button
      className={className}
      disabled={disabled || loading}
      style={{
        width: fullWidth ? "100%" : undefined,
        opacity: loading ? 0.7 : 1,
        cursor,
        ...style,
      }}
      {...props}
    >
      {loading ? "Cargando..." : children}
    </button>
  );
}

Button.propTypes = {
  variant: PropTypes.oneOf(["primary", "secondary", "outline", "danger"]),
  size: PropTypes.oneOf(["sm", "md", "lg"]),
  fullWidth: PropTypes.bool,
  loading: PropTypes.bool,
  disabled: PropTypes.bool,
  children: PropTypes.node.isRequired,
  style: PropTypes.object,
};
