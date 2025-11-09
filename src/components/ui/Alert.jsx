import PropTypes from "prop-types";

export default function Alert({
  children,
  variant = "info",
  onClose,
  className,
  ...props
}) {
  const variantClass = `alert-${variant}`;

  return (
    <div className={`alert ${variantClass} ${className || ""}`} {...props}>
      <div className="alert-content">{children}</div>
      {onClose && (
        <button onClick={onClose} className="alert-close">
          <i className="fa-solid fa-xmark"></i>
        </button>
      )}
    </div>
  );
}

Alert.propTypes = {
  children: PropTypes.node.isRequired,
  variant: PropTypes.oneOf(["info", "success", "warning", "error"]),
  onClose: PropTypes.func,
  className: PropTypes.string,
};
