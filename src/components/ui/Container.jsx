import PropTypes from "prop-types";

export default function Container({
  children,
  size = "default",
  className = "",
  ...props
}) {
  const sizeClass = `container-${size}`;

  return (
    <div className={`${sizeClass} ${className}`.trim()} {...props}>
      {children}
    </div>
  );
}

Container.propTypes = {
  children: PropTypes.node.isRequired,
  size: PropTypes.oneOf(["sm", "default", "lg", "xl", "full"]),
  className: PropTypes.string,
};
