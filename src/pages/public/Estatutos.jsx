import { useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Section, PageHero } from "../../components/ui";

// Icons for the five institutional values, in the order of `estatutos.values`.
const VALUE_ICONS = [
  "fa-solid fa-user-doctor",
  "fa-solid fa-earth-americas",
  "fa-solid fa-graduation-cap",
  "fa-solid fa-scale-balanced",
  "fa-solid fa-lightbulb",
];

const EXPLORE_LINKS = [
  {
    to: "/nosotros/directiva",
    icon: "fa-solid fa-users",
    title: "estatutos.society_board_title",
    text: "estatutos.society_board_text",
    cta: "estatutos.society_board_btn",
  },
  {
    to: "/nosotros/historia",
    icon: "fa-solid fa-landmark",
    title: "estatutos.society_history_title",
    text: "estatutos.society_history_text",
    cta: "estatutos.society_history_btn",
  },
  {
    to: "/nosotros/estatutos",
    icon: "fa-solid fa-file-lines",
    title: "estatutos.society_statutes_title",
    text: "estatutos.society_statutes_desc",
    textDefault:
      "Consulta el marco normativo que rige la organización y el funcionamiento de la Sociedad.",
    cta: "estatutos.society_statutes_btn",
  },
];

/** "Quiénes Somos" — rendered at /nosotros and /nosotros/mision. */
export default function Estatutos() {
  const { t } = useTranslation();
  const { pathname } = useLocation();
  const values = t("estatutos.values", { returnObjects: true });
  const valueList = Array.isArray(values) ? values : [];

  // /nosotros/mision is the same page, opened at the mission & vision block.
  useEffect(() => {
    if (pathname.replace(/\/+$/, "") === "/nosotros/mision") {
      document.getElementById("mision")?.scrollIntoView();
    }
  }, [pathname]);

  return (
    <div className="page society-page">
      <PageHero
        kicker={t("header.society")}
        title={t("estatutos.title")}
        subtitle={t("estatutos.subtitle")}
      />

      <Section id="mision" aria-label={t("header.mission")}>
        <div className="society-pillars">
          <article className="society-pillar">
            <div className="society-pillar-head">
              <span className="icon-tile" aria-hidden="true">
                <i className="fa-solid fa-bullseye" />
              </span>
              <h2 className="society-pillar-title">
                {t("estatutos.mission_title")}
              </h2>
            </div>
            <p className="society-pillar-text">{t("estatutos.mission_text")}</p>
          </article>

          <article className="society-pillar">
            <div className="society-pillar-head">
              <span className="icon-tile" aria-hidden="true">
                <i className="fa-regular fa-eye" />
              </span>
              <h2 className="society-pillar-title">
                {t("estatutos.vision_title")}
              </h2>
            </div>
            <p className="society-pillar-text">{t("estatutos.vision_text")}</p>
          </article>
        </div>
      </Section>

      <Section variant="muted" aria-labelledby="society-values-title">
        <div className="society-values">
          <div className="society-values-intro">
            <p className="eyebrow">{t("estatutos.kicker")}</p>
            <h2 id="society-values-title" className="section-title">
              {t("estatutos.values_title")}
            </h2>
            <p className="section-lead">{t("estatutos.values_subtitle")}</p>
          </div>

          {valueList.map((value, index) => (
            <article key={value.title || index} className="society-value">
              <span className="icon-tile" aria-hidden="true">
                <i className={VALUE_ICONS[index] || "fa-solid fa-star"} />
              </span>
              <h3 className="society-value-title">{value.title}</h3>
              <p className="society-value-text">{value.description}</p>
            </article>
          ))}
        </div>
      </Section>

      <Section aria-labelledby="society-explore-title">
        <div className="section-head">
          <div className="section-head__text">
            <p className="eyebrow">
              {t("estatutos.explore_eyebrow", "Más sobre SLACC")}
            </p>
            <h2 id="society-explore-title" className="section-title">
              {t("estatutos.explore_title", "Conoce nuestra organización")}
            </h2>
          </div>
        </div>

        <div className="society-explore">
          {EXPLORE_LINKS.map(item => (
            <article key={item.to} className="society-explore-card">
              <span className="icon-tile" aria-hidden="true">
                <i className={item.icon} />
              </span>
              <div className="society-explore-body">
                <h3 className="society-explore-title">{t(item.title)}</h3>
                <p className="society-explore-text">
                  {t(item.text, item.textDefault)}
                </p>
                <Link to={item.to} className="link-arrow society-explore-link">
                  {t(item.cta)}
                  <i className="fa-solid fa-arrow-right" aria-hidden="true" />
                </Link>
              </div>
            </article>
          ))}
        </div>
      </Section>
    </div>
  );
}
