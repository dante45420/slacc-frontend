import PropTypes from "prop-types";

export default function Grid({
  children,
  columns = 3,
  gap = 5,
  className,
  ...props
}) {
  // Support both number presets and custom grid template strings
  const isCustomTemplate = typeof columns === "string";

  let finalClassName;
  let style;

  if (isCustomTemplate) {
    const gapClass = typeof gap === "number" ? `grid-gap-${gap}` : "";
    finalClassName = `grid ${gapClass} ${className || ""}`;
    style = { gridTemplateColumns: columns };
  } else {
    const colsClass = `grid-cols-${columns}`;
    const gapClass = `grid-gap-${gap}`;
    finalClassName = `grid ${colsClass} ${gapClass} ${className || ""}`;
  }

  return (
    <div className={finalClassName} style={style} {...props}>
      {children}
    </div>
  );
}

Grid.propTypes = {
  children: PropTypes.node.isRequired,
  columns: PropTypes.oneOfType([
    PropTypes.oneOf([1, 2, 3, 4]),
    PropTypes.string,
  ]),
  gap: PropTypes.oneOfType([
    PropTypes.oneOf([1, 2, 3, 4, 5, 6]),
    PropTypes.string,
  ]),
  className: PropTypes.string,
};
