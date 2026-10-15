import PropTypes from "prop-types";

/**
 * Responsive grid. `columns` is the maximum number of columns; the grid drops
 * to fewer columns on narrow screens instead of overflowing.
 */
export default function Grid({
  children,
  columns = 3,
  gap = 5,
  className,
  style,
  ...props
}) {
  let colsClass = `grid-cols-${columns}`;
  if (typeof columns === "string") {
    colsClass = columns.trim() === "1fr" ? "grid-cols-single" : "grid-cols-2";
  }

  const gapClass = typeof gap === "number" ? `grid-gap-${gap}` : "";
  const gapStyle =
    typeof gap === "string" ? { "--grid-gap": gap, gap } : undefined;
  const finalClassName = ["grid", colsClass, gapClass, className]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={finalClassName} style={{ ...gapStyle, ...style }} {...props}>
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
  style: PropTypes.object,
};
