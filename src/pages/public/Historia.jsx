import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Section, Card } from "../../components/ui";

export default function Historia() {
  const { t } = useTranslation();

  const milestones = t("historia.milestones", { returnObjects: true });

  return (
    <>
      <Section variant="primary" padding="lg" containerSize="lg">
        <div className="history-header">
          <p className="history-kicker">{t("historia.kicker")}</p>
          <h1 className="history-title">{t("historia.title")}</h1>
          <p className="history-subtitle">{t("historia.subtitle")}</p>
        </div>
      </Section>

      <Section padding="lg" containerSize="lg">
        <div className="history-timeline">
          {Array.isArray(milestones) &&
            milestones.map((item, index) => (
              <Card key={`${item.year}-${index}`} className="history-item-card">
                <p className="history-item-year">{item.year}</p>
                <h2 className="history-item-title">{item.title}</h2>
                <p className="history-item-description">{item.description}</p>
              </Card>
            ))}
        </div>
      </Section>

      <Section variant="alt" padding="lg" containerSize="lg">
        <Card className="history-cta-card">
          <h2 className="history-cta-title">{t("historia.cta.title")}</h2>
          <p className="history-cta-description">
            {t("historia.cta.description")}
          </p>
          <div className="history-cta-actions">
            <Link to="/nosotros/directiva" className="btn btn-primary">
              {t("historia.cta.btn_board")}
            </Link>
            <Link to="/nosotros/estatutos" className="btn btn-outline">
              {t("historia.cta.btn_statutes")}
            </Link>
          </div>
        </Card>
      </Section>
    </>
  );
}
