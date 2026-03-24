import PropTypes from "prop-types";

export default function Grid({
  children,
  columns = 3,
  gap = 5,
  className,
  ...props
}) {
  let colsClass = `grid-cols-${columns}`;
  if (typeof columns === "string") {
    if (columns.trim() === "1fr 1fr") {
      colsClass = "grid-cols-equal-2";
    } else if (columns.trim() === "1fr") {
      colsClass = "grid-cols-single";
    }
  }

  const gapClass = typeof gap === "number" ? `grid-gap-${gap}` : "";
  const finalClassName = `grid ${colsClass} ${gapClass} ${className || ""}`;

  return (
    <div className={finalClassName} {...props}>
      {children}
    </div>
  );
}

Grid.propTypes = {
  children: PropTypes.node.isRequired,
  columns: PropTypes.oneOfType([
    PropTypes.oneOf([1, 2, 3, 4]),
    PropTypes.oneOf(["1fr 1fr", "1fr"]),
  ]),
  gap: PropTypes.oneOfType([
    PropTypes.oneOf([1, 2, 3, 4, 5, 6]),
    PropTypes.string,
  ]),
  className: PropTypes.string,
};
