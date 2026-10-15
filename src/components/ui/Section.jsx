import PropTypes from "prop-types";
import Container from "./Container";

const PADDING_CLASSES = {
  none: "section-padding-none",
  sm: "section-padding-sm",
  default: "",
  lg: "section-padding-lg",
  xl: "section-padding-xl",
};

// Legacy variant names map onto the new band styles.
const VARIANT_CLASSES = {
  default: "",
  transparent: "",
  surface: "section--surface",
  alt: "section--muted",
  muted: "section--muted",
  primary: "section--brand",
  brand: "section--brand",
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
  const classes = [
    "section",
    VARIANT_CLASSES[variant],
    PADDING_CLASSES[padding],
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <section className={classes} {...props}>
      <Container size={containerSize} className={containerClassName || ""}>
        {children}
      </Container>
    </section>
  );
}

Section.propTypes = {
  children: PropTypes.node.isRequired,
  variant: PropTypes.oneOf(Object.keys(VARIANT_CLASSES)),
  padding: PropTypes.oneOf(["none", "sm", "default", "lg", "xl"]),
  containerSize: PropTypes.oneOf(["sm", "default", "lg", "xl", "full"]),
  className: PropTypes.string,
  containerClassName: PropTypes.string,
};
