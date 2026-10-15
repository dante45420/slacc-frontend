import { forwardRef } from "react";
import { Link } from "react-router-dom";
import PropTypes from "prop-types";
import { useTranslation } from "react-i18next";

const VARIANTS = {
  primary: "btn-primary",
  accent: "btn-accent",
  secondary: "btn-secondary",
  outline: "btn-outline",
  ghost: "btn-ghost",
  danger: "btn-danger",
  inverse: "btn-inverse",
  "outline-inverse": "btn-outline-inverse",
};

const SIZES = { sm: "btn-sm", md: "", lg: "btn-lg" };

/**
 * Button. Renders a router <Link> when `to` is set, an <a> when `href` is set,
 * otherwise a <button>. Never wrap a Button in a Link — pass `to` instead.
 */
const Button = forwardRef(function Button(
  {
    variant = "primary",
    size = "md",
    fullWidth = false,
    loading = false,
    disabled = false,
    to,
    href,
    type,
    children,
    className,
    ...props
  },
  ref,
) {
  const { t } = useTranslation();
  const classes = [
    "btn",
    VARIANTS[variant] || VARIANTS.primary,
    SIZES[size],
    fullWidth && "btn-full-width",
    loading && "btn-loading",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  const content = (
    <>
      {children}
      {loading && <span className="sr-only">{t("common.loading", "Cargando...")}</span>}
    </>
  );

  if (to || href) {
    const inactive = disabled || loading;
    const linkProps = {
      ...props,
      ref,
      className: classes,
      "aria-disabled": inactive || undefined,
      tabIndex: inactive ? -1 : props.tabIndex,
    };
    if (inactive) {
      linkProps.onClick = e => e.preventDefault();
    }
    return to ? (
      <Link to={to} {...linkProps}>
        {content}
      </Link>
    ) : (
      <a href={href} {...linkProps}>
        {content}
      </a>
    );
  }

  return (
    <button
      ref={ref}
      type={type || "button"}
      className={classes}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      {...props}
    >
      {content}
    </button>
  );
});

Button.propTypes = {
  variant: PropTypes.oneOf(Object.keys(VARIANTS)),
  size: PropTypes.oneOf(["sm", "md", "lg"]),
  fullWidth: PropTypes.bool,
  loading: PropTypes.bool,
  disabled: PropTypes.bool,
  to: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
  href: PropTypes.string,
  type: PropTypes.oneOf(["button", "submit", "reset"]),
  children: PropTypes.node.isRequired,
  className: PropTypes.string,
  tabIndex: PropTypes.number,
};

export default Button;
