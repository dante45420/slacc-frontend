import PropTypes from "prop-types";

export default function Spinner({
  size = "md",
  color = "var(--color-primary)",
}) {
  const sizes = {
    sm: 20,
    md: 40,
    lg: 60,
  };

  const dimension = sizes[size];

  return (
    <div
      style={{
        display: "inline-block",
        width: dimension,
        height: dimension,
        border: `3px solid ${color}20`,
        borderTopColor: color,
        borderRadius: "50%",
        animation: "spin 0.8s linear infinite",
      }}
    />
  );
}

Spinner.propTypes = {
  size: PropTypes.oneOf(["sm", "md", "lg"]),
  color: PropTypes.string,
};
