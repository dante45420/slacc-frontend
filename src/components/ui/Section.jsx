import PropTypes from "prop-types";
import Container from "./Container";

export default function Section({
  children,
  variant = "default",
  padding = "default",
  containerSize = "default",
  style,
  containerStyle,
  ...props
}) {
  const backgrounds = {
    default: "var(--color-bg)",
    alt: "var(--color-bg-alt)",
    primary:
      "linear-gradient(135deg, rgba(0,71,163,0.05) 0%, rgba(10,165,127,0.05) 100%)",
    transparent: "transparent",
  };

  const paddings = {
    none: "0",
    sm: "var(--spacing-5) 0",
    default: "var(--spacing-6) 0",
    lg: "calc(var(--spacing-6) * 1.5) 0",
    xl: "calc(var(--spacing-6) * 2) 0",
  };

  return (
    <section
      style={{
        background: backgrounds[variant],
        padding: paddings[padding],
        ...style,
      }}
      {...props}
    >
      <Container size={containerSize} style={containerStyle}>
        {children}
      </Container>
    </section>
  );
}

Section.propTypes = {
  children: PropTypes.node.isRequired,
  variant: PropTypes.oneOf(["default", "alt", "primary", "transparent"]),
  padding: PropTypes.oneOf(["none", "sm", "default", "lg", "xl"]),
  containerSize: PropTypes.oneOf(["sm", "default", "lg", "full"]),
  style: PropTypes.object,
  containerStyle: PropTypes.object,
};
