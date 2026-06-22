import { Link } from "react-router-dom";
import PropTypes from "prop-types";
import { useTranslation } from "react-i18next";
import { useAuth } from "../../auth/AuthContext.jsx";

const WHY_ICONS = [
  "fa-solid fa-user-graduate",
  "fa-solid fa-users",
  "fa-solid fa-shield-halved",
  "fa-solid fa-trophy",
  "fa-solid fa-address-book",
  "fa-solid fa-chart-line",
];

export default function WhyJoin() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const tiles = t("members.why_tiles", { returnObjects: true });
  const categories = t("members.categories", { returnObjects: true });

  return (
    <section className="section">
      <div className="container">
        <h1 className="members-header">{t("members.why_title")}</h1>
        <p className="members-subtitle-with-large-spacing">
          {t("members.why_subtitle")}
        </p>

        <div className="cards members-cards-with-bottom">
          {Array.isArray(tiles) &&
            tiles.map((tile, index) => (
              <Tile
                key={tile.title}
                icon={
                  <i className={WHY_ICONS[index] || "fa-solid fa-star"}></i>
                }
                title={tile.title}
                desc={tile.desc}
              />
            ))}
        </div>

        <h2 className="members-section-title">
          {t("members.categories_title")}
        </h2>
        <div className="cards">
          {Array.isArray(categories) &&
            categories.map(category => (
              <div key={category.title} className="card">
                <h3 className="tile-title">{category.title}</h3>
                <p className="tile-desc">{category.desc}</p>
              </div>
            ))}
        </div>

        <div className="members-cta">
          {!user && (
            <Link
              to="/solicitar-membresia"
              className="btn btn-primary members-cta-spacing"
            >
              {t("members.btn_apply")}
            </Link>
          )}
          <Link to="/miembros/beneficios" className="btn btn-outline">
            {t("members.btn_benefits")}
          </Link>
        </div>
      </div>
    </section>
  );
}

function Tile({ icon, title, desc }) {
  return (
    <div className="card">
      <div className="icon-tile-container">
        <div className="icon-tile-icon">{icon}</div>
      </div>
      <h3 className="tile-title">{title}</h3>
      <p className="tile-desc">{desc}</p>
    </div>
  );
}

Tile.propTypes = {
  icon: PropTypes.node.isRequired,
  title: PropTypes.string.isRequired,
  desc: PropTypes.string.isRequired,
};
