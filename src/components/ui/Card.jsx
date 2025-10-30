import PropTypes from "prop-types";

export default function Card({
  title,
  description,
  image,
  imageAlt,
  badge,
  children,
  footer,
  hoverable = false,
  onClick,
  style,
  className = "",
  ...props
}) {
  const cardClass = `card ${
    hoverable ? "card-hoverable" : ""
  } ${className}`.trim();

  const handleKeyPress = e => {
    if (onClick && (e.key === "Enter" || e.key === " ")) {
      e.preventDefault();
      onClick(e);
    }
  };

  const Component = onClick ? "div" : "article";
  const interactiveProps = onClick
    ? {
        onClick,
        onKeyPress: handleKeyPress,
        role: "button",
        tabIndex: 0,
      }
    : {};

  return (
    <Component
      className={cardClass}
      {...interactiveProps}
      style={{
        cursor: onClick ? "pointer" : undefined,
        ...style,
      }}
      {...props}
    >
      {image && (
        <img
          src={image}
          alt={imageAlt || title || "Card image"}
          style={{
            width: "100%",
            height: "200px",
            objectFit: "cover",
            borderRadius: "8px",
            marginBottom: "var(--spacing-3)",
          }}
        />
      )}
      {(title || badge) && (
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            marginBottom: title ? "var(--spacing-2)" : 0,
          }}
        >
          {title && <h3 style={{ margin: 0, flex: 1 }}>{title}</h3>}
          {badge}
        </div>
      )}
      {description && (
        <p
          style={{
            color: "var(--color-muted)",
            marginBottom: "var(--spacing-3)",
          }}
        >
          {description}
        </p>
      )}
      {children}
      {footer && (
        <div
          style={{
            marginTop: "var(--spacing-4)",
            paddingTop: "var(--spacing-3)",
            borderTop: "1px solid var(--color-border)",
          }}
        >
          {footer}
        </div>
      )}
    </Component>
  );
}

Card.propTypes = {
  title: PropTypes.string,
  description: PropTypes.string,
  image: PropTypes.string,
  imageAlt: PropTypes.string,
  badge: PropTypes.node,
  children: PropTypes.node,
  footer: PropTypes.node,
  hoverable: PropTypes.bool,
  onClick: PropTypes.func,
  style: PropTypes.object,
  className: PropTypes.string,
};
