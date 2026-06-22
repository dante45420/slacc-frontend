import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Section, Card, PageHero } from "../../components/ui";

export default function Historia() {
  const { t } = useTranslation();
  const milestones = t("historia.milestones", { returnObjects: true });

  return (
    <>
      <Section variant="primary" padding="lg" containerSize="lg">
        <PageHero
          kicker={t("historia.kicker")}
          title={t("historia.title")}
          subtitle={t("historia.subtitle")}
        />
      </Section>

      <Section padding="lg" containerSize="lg">
        <ol className="history-timeline" aria-label={t("historia.title")}>
          {Array.isArray(milestones) &&
            milestones.map((item, index) => (
              <li key={`${item.year}-${index}`} className="history-item">
                <span className="history-item-year">{item.year}</span>
                <Card
                  className="history-item-card"
                  hoverable
                  title={item.title}
                  description={item.description}
                />
              </li>
            ))}
        </ol>
      </Section>

      <Section variant="alt" padding="lg" containerSize="lg">
        <Card
          className="history-cta-card"
          title={t("historia.cta.title")}
          description={t("historia.cta.description")}
          footer={
            <div className="history-cta-actions">
              <Link to="/nosotros/directiva" className="btn btn-primary">
                {t("historia.cta.btn_board")}
              </Link>
              <Link to="/nosotros/estatutos" className="btn btn-outline">
                {t("historia.cta.btn_statutes")}
              </Link>
            </div>
          }
        />
      </Section>
    </>
  );
}
