import PropTypes from "prop-types";

export default function PageHero({
  kicker,
  title,
  subtitle,
  align = "left",
  className,
  children,
}) {
  return (
    <header
      className={`page-hero${align === "center" ? " page-hero--center" : ""} ${
        className || ""
      }`.trim()}
    >
      <div className="page-hero__inner">
        {kicker && <p className="page-hero-kicker">{kicker}</p>}
        <h1 className="page-hero-title">{title}</h1>
        {subtitle && <p className="page-hero-subtitle">{subtitle}</p>}
        {children}
      </div>
    </header>
  );
}

PageHero.propTypes = {
  kicker: PropTypes.node,
  title: PropTypes.node.isRequired,
  subtitle: PropTypes.node,
  align: PropTypes.oneOf(["left", "center"]),
  className: PropTypes.string,
  children: PropTypes.node,
};
