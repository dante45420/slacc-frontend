import { useTranslation } from "react-i18next";
import { Section, PageHero, Button } from "../../components/ui";

export default function Historia() {
  const { t } = useTranslation();
  const milestones = t("historia.milestones", { returnObjects: true });
  const items = Array.isArray(milestones) ? milestones : [];

  return (
    <div className="page society-page society-page--flush">
      <PageHero
        kicker={t("historia.kicker")}
        title={t("historia.title")}
        subtitle={t("historia.subtitle")}
      />

      <Section>
        <ol className="society-timeline" aria-label={t("historia.title")}>
          {items.map((item, index) => (
            <li key={`${item.year}-${index}`} className="society-timeline-item">
              <span className="society-timeline-dot" aria-hidden="true" />
              <p className="society-timeline-year">{item.year}</p>
              <article className="society-timeline-card">
                <h2 className="society-timeline-title">{item.title}</h2>
                <p className="society-timeline-text">{item.description}</p>
              </article>
            </li>
          ))}
        </ol>
      </Section>

      <Section
        variant="brand"
        className="society-cta"
        aria-labelledby="society-history-cta"
      >
        <div className="society-cta-inner">
          <div className="society-cta-text">
            <p className="eyebrow">{t("historia.kicker")}</p>
            <h2 id="society-history-cta" className="society-cta-title">
              {t("historia.cta.title")}
            </h2>
            <p className="society-cta-lead">{t("historia.cta.description")}</p>
          </div>
          <div className="society-cta-actions">
            <Button variant="inverse" size="lg" to="/nosotros/directiva">
              {t("historia.cta.btn_board")}
            </Button>
            <Button variant="outline-inverse" size="lg" to="/nosotros/estatutos">
              {t("historia.cta.btn_statutes")}
            </Button>
          </div>
        </div>
      </Section>
    </div>
  );
}
