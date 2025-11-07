import PropTypes from "prop-types";

export default function Badge({
  children,
  variant = "primary",
  size = "md",
  className,
  ...props
}) {
  const variantClass = `badge-${variant}`;
  const sizeClass = size === "sm" ? "badge-sm" : "";

  return (
    <span
      className={`badge ${variantClass} ${sizeClass} ${className || ""}`}
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
  className: PropTypes.string,
};
