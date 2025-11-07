import PropTypes from "prop-types";

export default function Spinner({ size = "md", className }) {
  const sizeClass = `spinner-${size}`;

  return <div className={`spinner ${sizeClass} ${className || ""}`} />;
}

Spinner.propTypes = {
  size: PropTypes.oneOf(["sm", "md", "lg"]),
  className: PropTypes.string,
};
