import PropTypes from "prop-types";
import Container from "./Container";

const PADDING_CLASSES = {
  none: "section-padding-none",
  sm: "section-padding-sm",
  default: "",
  lg: "section-padding-lg",
  xl: "section-padding-xl",
};

const VARIANT_CLASSES = {
  default: "section-container",
  alt: "section-container-alt",
  primary: "section-container-primary",
  transparent: "section-container-transparent",
};

export default function Section({
  children,
  variant = "default",
  padding = "default",
  containerSize = "default",
  className,
  containerClassName,
  ...props
}) {
  const paddingClass = PADDING_CLASSES[padding] || "";
  const variantClass = VARIANT_CLASSES[variant] || "section-container";

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
