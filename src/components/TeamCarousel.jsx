import { useState } from "react";
import PropTypes from "prop-types";
import { useTranslation } from "react-i18next";
import { Button } from "./ui";
import Rail from "./home/Rail.jsx";
import { executiveBoard, initials, countryName, photoStyle } from "../data/board.js";
import { currentLanguage } from "../i18n.js";

function MemberAvatar({ name, photo }) {
  const [failed, setFailed] = useState(false);
  const showPhoto = photo && !failed;

  return (
    <div className={`home-member__avatar${showPhoto ? "" : " home-member__avatar--initials"}`}>
      {showPhoto ? (
        <img
          src={encodeURI(photo)}
          alt=""
          style={photoStyle(photo)}
          loading="lazy"
          decoding="async"
          onError={() => setFailed(true)}
        />
      ) : (
        <span aria-hidden="true">{initials(name)}</span>
      )}
    </div>
  );
}

MemberAvatar.propTypes = {
  name: PropTypes.string.isRequired,
  photo: PropTypes.string,
};

/**
 * Board members as portrait cards in a swipeable rail (up to 4 per view).
 * Members without a real portrait get an initials avatar — never a stock
 * photo. `role` may be the Spanish key from src/data/board.js or an already
 * translated label; both resolve correctly.
 */
export function TeamCarousel({ members = executiveBoard, bleed = false, ctaTo, ctaLabel }) {
  const { t, i18n } = useTranslation();
  const lang = currentLanguage(i18n);

  if (!members || members.length === 0) return null;

  return (
    <div className="home-team">
      <Rail variant="people" bleed={bleed} label={t("header.board", "Mesa Directiva")}>
        {members.map(member => (
          <article key={member.name} className="home-member">
            <MemberAvatar name={member.name} photo={member.photo} />
            <div className="home-member__body">
              <h3 className="home-member__name">{member.name}</h3>
              {member.role && (
                <p className="home-member__role">
                  {t(`directiva.roles.${member.role}`, member.role)}
                </p>
              )}
              {member.country && (
                <p className="home-member__country">
                  <i className="fa-solid fa-location-dot" aria-hidden="true"></i>
                  {countryName(member.country, lang)}
                </p>
              )}
            </div>
          </article>
        ))}
      </Rail>

      {ctaTo && ctaLabel && (
        <div className="home-team__cta">
          <Button variant="outline" to={ctaTo}>
            {ctaLabel}
            <i className="fa-solid fa-arrow-right" aria-hidden="true"></i>
          </Button>
        </div>
      )}
    </div>
  );
}

TeamCarousel.propTypes = {
  members: PropTypes.arrayOf(
    PropTypes.shape({
      name: PropTypes.string.isRequired,
      role: PropTypes.string,
      country: PropTypes.string,
      photo: PropTypes.string,
    }),
  ),
  bleed: PropTypes.bool,
  ctaTo: PropTypes.string,
  ctaLabel: PropTypes.string,
};
