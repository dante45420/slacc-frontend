import PropTypes from "prop-types";

export default function Button({
  variant = "primary",
  size = "md",
  fullWidth = false,
  loading = false,
  disabled = false,
  children,
  className,
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

  const widthClass = fullWidth ? "btn-full-width" : "";
  const loadingClass = loading ? "btn-loading" : "";

  const finalClassName =
    `${baseClass} ${variantClass} ${sizeClass} ${widthClass} ${loadingClass} ${
      className || ""
    }`.trim();

  return (
    <button
      className={finalClassName}
      disabled={disabled || loading}
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
  className: PropTypes.string,
};
