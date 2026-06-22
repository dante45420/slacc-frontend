import { Link } from "react-router-dom";
import PropTypes from "prop-types";
import { useTranslation } from "react-i18next";
import { useAuth } from "../../auth/AuthContext.jsx";

const BENEFIT_ICONS = [
  "fa-solid fa-stethoscope",
  "fa-solid fa-database",
  "fa-solid fa-handshake",
  "fa-solid fa-trophy",
  "fa-solid fa-graduation-cap",
  "fa-solid fa-shield-halved",
];

export default function MembersBenefits() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const tiles = t("members.benefits_tiles", { returnObjects: true });

  return (
    <section className="section">
      <div className="container">
        <h1 className="members-header">{t("members.benefits_title")}</h1>
        <p className="members-subtitle">{t("members.benefits_subtitle")}</p>

        <div className="cards members-cards">
          {Array.isArray(tiles) &&
            tiles.map((tile, index) => (
              <Tile
                key={tile.title}
                icon={
                  <i
                    className={BENEFIT_ICONS[index] || "fa-solid fa-star"}
                  ></i>
                }
                title={tile.title}
                desc={tile.desc}
              />
            ))}
        </div>

        {!user && (
          <div className="members-cta">
            <Link to="/solicitar-membresia" className="btn btn-primary">
              {t("members.btn_apply")}
            </Link>
          </div>
        )}
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
