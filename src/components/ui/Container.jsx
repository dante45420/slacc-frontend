import PropTypes from "prop-types";

export default function Container({
  children,
  size = "default",
  style,
  ...props
}) {
  const maxWidths = {
    sm: "720px",
    default: "1100px",
    lg: "1280px",
    full: "100%",
  };

  return (
    <div
      style={{
        maxWidth: maxWidths[size],
        padding: "0 var(--spacing-5)",
        margin: "0 auto",
        ...style,
      }}
      {...props}
    >
      {children}
    </div>
  );
}

Container.propTypes = {
  children: PropTypes.node.isRequired,
  size: PropTypes.oneOf(["sm", "default", "lg", "full"]),
  style: PropTypes.object,
};
