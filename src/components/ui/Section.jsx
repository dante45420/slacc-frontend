import PropTypes from "prop-types";
import Container from "./Container";

export default function Section({
  children,
  variant = "default",
  padding = "default",
  containerSize = "default",
  className,
  containerClassName,
  ...props
}) {
  const paddingClass =
    padding === "none"
      ? "section-padding-none"
      : padding === "sm"
      ? "section-padding-sm"
      : padding === "lg"
      ? "section-padding-lg"
      : padding === "xl"
      ? "section-padding-xl"
      : "";

  const variantClass =
    variant === "transparent"
      ? "section-container-transparent"
      : variant === "alt"
      ? "section-container-alt"
      : variant === "primary"
      ? "section-container-primary"
      : "section-container";

  return (
    <section
      className={`section ${paddingClass} ${className || ""}`}
      {...props}
    >
      <Container
        size={containerSize}
        className={`${variantClass} ${containerClassName || ""}`}
      >
        {children}
      </Container>
    </section>
  );
}

Section.propTypes = {
  children: PropTypes.node.isRequired,
  variant: PropTypes.oneOf(["default", "alt", "primary", "transparent"]),
  padding: PropTypes.oneOf(["none", "sm", "default", "lg", "xl"]),
  containerSize: PropTypes.oneOf(["sm", "default", "lg", "xl", "full"]),
  className: PropTypes.string,
  containerClassName: PropTypes.string,
};
