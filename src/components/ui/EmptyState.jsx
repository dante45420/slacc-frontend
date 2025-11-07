import PropTypes from "prop-types";

export default function EmptyState({
  icon,
  title,
  description,
  action,
  className,
  ...props
}) {
  return (
    <div className={`empty-state ${className || ""}`} {...props}>
      {icon && <div className="empty-state-icon">{icon}</div>}
      {title && <h3 className="empty-state-title">{title}</h3>}
      {description && <p className="empty-state-description">{description}</p>}
      {action && <div>{action}</div>}
    </div>
  );
}

EmptyState.propTypes = {
  icon: PropTypes.node,
  title: PropTypes.string,
  description: PropTypes.string,
  action: PropTypes.node,
  className: PropTypes.string,
};
