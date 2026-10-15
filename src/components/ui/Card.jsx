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
  className = "",
  ...props
}) {
  const cardClass = [
    "card",
    hoverable && "card-hoverable",
    onClick && "card-clickable",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  const handleKeyDown = e => {
    if (onClick && (e.key === "Enter" || e.key === " ")) {
      e.preventDefault();
      onClick(e);
    }
  };

  const Component = onClick ? "div" : "article";
  const interactiveProps = onClick
    ? {
        onClick,
        onKeyDown: handleKeyDown,
        role: "button",
        tabIndex: 0,
      }
    : {};

  return (
    <Component className={cardClass} {...interactiveProps} {...props}>
      {image && (
        <img
          src={image}
          alt={imageAlt ?? ""}
          className="card-image"
          loading="lazy"
        />
      )}
      {(title || badge) && (
        <div className="card-header">
          {title && <h3 className="card-title">{title}</h3>}
          {badge}
        </div>
      )}
      {description && <p className="card-description">{description}</p>}
      {children}
      {footer && <div className="card-footer">{footer}</div>}
    </Component>
  );
}

Card.propTypes = {
  title: PropTypes.node,
  description: PropTypes.node,
  image: PropTypes.string,
  imageAlt: PropTypes.string,
  badge: PropTypes.node,
  children: PropTypes.node,
  footer: PropTypes.node,
  hoverable: PropTypes.bool,
  onClick: PropTypes.func,
  className: PropTypes.string,
};
