import { useState } from "react";
import PropTypes from "prop-types";
import { useTranslation } from "react-i18next";
import { Section, PageHero } from "../../components/ui";
import {
  executiveBoard,
  initials,
  countryName,
  normalizeName,
  photoStyle,
} from "../../data/board.js";
import { currentLanguage } from "../../i18n.js";

function BoardPortrait({ member, featured = false }) {
  const className = `society-board-portrait${
    featured ? " society-board-portrait--featured" : ""
  }`;

  // Falls back to the initials avatar if the portrait file cannot load.
  const [failed, setFailed] = useState(false);

  if (member.photo && !failed) {
    return (
      <span className={className}>
        <img
          src={encodeURI(member.photo)}
          alt=""
          loading={featured ? "eager" : "lazy"}
          style={photoStyle(member.photo)}
          onError={() => setFailed(true)}
        />
      </span>
    );
  }

  return (
    <span className={`${className} society-board-initials`} aria-hidden="true">
      {initials(member.name)}
    </span>
  );
}

BoardPortrait.propTypes = {
  member: PropTypes.shape({
    name: PropTypes.string.isRequired,
    photo: PropTypes.string,
  }).isRequired,
  featured: PropTypes.bool,
};

export default function Directiva() {
  const { t, i18n } = useTranslation();
  const lang = currentLanguage(i18n);
  const roleLabel = member => t(`directiva.roles.${member.role}`, member.role);

  const president =
    executiveBoard.find(member => member.role === "Presidente") ||
    executiveBoard[0];
  const others = executiveBoard.filter(member => member !== president);
  const countryCount = new Set(
    executiveBoard.map(member => normalizeName(member.country)).filter(Boolean),
  ).size;

  return (
    <div className="page society-page society-page--flush">
      <PageHero
        kicker={t("directiva.society_kicker")}
        title={t("directiva.title")}
        subtitle={t("directiva.subtitle")}
      />

      {president && (
        <Section padding="sm" aria-label={roleLabel(president)}>
          <article className="society-board-president">
            <BoardPortrait member={president} featured />
            <div className="society-board-president-body">
              <p className="society-board-president-role">
                {roleLabel(president)}
              </p>
              <h2 className="society-board-president-name">{president.name}</h2>
              <p className="society-board-country">
                <i className="fa-solid fa-location-dot" aria-hidden="true" />
                {countryName(president.country, lang)}
              </p>
            </div>
            <dl className="society-board-stats">
              <div className="society-board-stat">
                <dt>
                  {t("directiva.stat_members", "Integrantes de la directiva")}
                </dt>
                <dd>{executiveBoard.length}</dd>
              </div>
              <div className="society-board-stat">
                <dt>{t("directiva.stat_countries", "Países representados")}</dt>
                <dd>{countryCount}</dd>
              </div>
            </dl>
          </article>
        </Section>
      )}

      {others.length > 0 && (
        <Section variant="muted" aria-labelledby="society-board-title">
          <div className="section-head">
            <div className="section-head__text">
              <p className="eyebrow">{t("header.board")}</p>
              <h2 id="society-board-title" className="section-title">
                {t("directiva.committee_title")}
              </h2>
              <p className="section-lead">
                {t("directiva.committee_subtitle")}
              </p>
            </div>
          </div>

          <ul className="society-board-grid">
            {others.map(member => (
              <li key={member.name} className="society-board-card">
                <BoardPortrait member={member} />
                <div className="society-board-card-body">
                  <h3 className="society-board-name">{member.name}</h3>
                  <p className="society-board-role">{roleLabel(member)}</p>
                  <p className="society-board-country">
                    <i
                      className="fa-solid fa-location-dot"
                      aria-hidden="true"
                    />
                    {countryName(member.country, lang)}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </Section>
      )}
    </div>
  );
}
