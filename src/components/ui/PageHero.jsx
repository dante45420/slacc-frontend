import PropTypes from "prop-types";

export default function PageHero({ kicker, title, subtitle, className, children }) {
  return (
    <div className={`page-hero ${className || ""}`.trim()}>
      {kicker && <p className="page-hero-kicker">{kicker}</p>}
      <h1 className="page-hero-title">{title}</h1>
      {subtitle && <p className="page-hero-subtitle">{subtitle}</p>}
      {children}
    </div>
  );
}

PageHero.propTypes = {
  kicker: PropTypes.string,
  title: PropTypes.string.isRequired,
  subtitle: PropTypes.string,
  className: PropTypes.string,
  children: PropTypes.node,
};
