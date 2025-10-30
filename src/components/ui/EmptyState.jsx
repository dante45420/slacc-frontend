import PropTypes from "prop-types";

export default function EmptyState({
  icon,
  title,
  description,
  action,
  style,
  ...props
}) {
  return (
    <div
      style={{
        textAlign: "center",
        padding: "var(--spacing-8) var(--spacing-5)",
        ...style,
      }}
      {...props}
    >
      {icon && (
        <div
          style={{
            fontSize: "48px",
            marginBottom: "var(--spacing-4)",
            opacity: 0.4,
          }}
        >
          {icon}
        </div>
      )}
      {title && (
        <h3
          style={{
            margin: "0 0 var(--spacing-2)",
            color: "var(--color-text)",
            fontSize: "1.25rem",
          }}
        >
          {title}
        </h3>
      )}
      {description && (
        <p
          style={{
            margin: "0 0 var(--spacing-4)",
            color: "var(--color-muted)",
            maxWidth: "400px",
            marginLeft: "auto",
            marginRight: "auto",
          }}
        >
          {description}
        </p>
      )}
      {action && <div>{action}</div>}
    </div>
  );
}

EmptyState.propTypes = {
  icon: PropTypes.node,
  title: PropTypes.string,
  description: PropTypes.string,
  action: PropTypes.node,
  style: PropTypes.object,
};
