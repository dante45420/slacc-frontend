import PropTypes from "prop-types";

export default function Grid({
  children,
  columns = 3,
  gap = "var(--spacing-5)",
  style,
  ...props
}) {
  const gridColumns =
    typeof columns === "number"
      ? `repeat(auto-fill, minmax(${280}px, 1fr))`
      : columns;

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: gridColumns,
        gap,
        ...style,
      }}
      {...props}
    >
      {children}
    </div>
  );
}

Grid.propTypes = {
  children: PropTypes.node.isRequired,
  columns: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  gap: PropTypes.string,
  style: PropTypes.object,
};
