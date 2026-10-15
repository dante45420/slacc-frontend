import PropTypes from "prop-types";

export default function EmptyState({
  icon,
  title,
  description,
  action,
  className,
  titleAs: TitleTag = "h3",
  ...props
}) {
  return (
    <div className={`empty-state ${className || ""}`.trim()} {...props}>
      {icon && (
        <div className="empty-state-icon" aria-hidden="true">
          {icon}
        </div>
      )}
      {title && <TitleTag className="empty-state-title">{title}</TitleTag>}
      {description && <p className="empty-state-description">{description}</p>}
      {action && <div className="empty-state-action">{action}</div>}
    </div>
  );
}

EmptyState.propTypes = {
  icon: PropTypes.node,
  title: PropTypes.node,
  description: PropTypes.node,
  action: PropTypes.node,
  className: PropTypes.string,
  /** Heading level for the title: h1 for full-page states, h2 inside sections */
  titleAs: PropTypes.oneOf(["h1", "h2", "h3", "h4"]),
};
