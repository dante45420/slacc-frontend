import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Section, Card, Grid, PageHero } from "../../components/ui";

export default function Estatutos() {
  const { t } = useTranslation();
  const values = t("estatutos.values", { returnObjects: true });

  const fallBackIcons = [
    "fa-solid fa-user-doctor",
    "fa-solid fa-earth-americas",
    "fa-solid fa-graduation-cap",
    "fa-solid fa-scale-balanced",
    "fa-solid fa-lightbulb",
  ];

  return (
    <>
      <Section variant="primary" padding="lg" containerSize="lg">
        <PageHero
          kicker={t("estatutos.kicker")}
          title={t("estatutos.title")}
          subtitle={t("estatutos.subtitle")}
        />
      </Section>

      <Section padding="lg" containerSize="lg">
        <div className="about-pillars-grid">
          <Card className="about-pillars-card">
            <h2 className="about-pillars-title">
              {t("estatutos.mission_title")}
            </h2>
            <p className="about-pillars-text">{t("estatutos.mission_text")}</p>
          </Card>

          <Card className="about-pillars-card">
            <h2 className="about-pillars-title">
              {t("estatutos.vision_title")}
            </h2>
            <p className="about-pillars-text">{t("estatutos.vision_text")}</p>
          </Card>
        </div>
      </Section>

      <Section variant="alt" padding="lg" containerSize="lg">
        <div className="about-values-header">
          <h2 className="about-values-title">{t("estatutos.values_title")}</h2>
          <p className="about-values-subtitle">
            {t("estatutos.values_subtitle")}
          </p>
        </div>

        <Grid columns={3} gap={4} className="about-values-grid">
          {Array.isArray(values) &&
            values.map((value, index) => (
              <Card key={index} className="about-value-card">
                <div className="about-value-icon" aria-hidden="true">
                  <i className={fallBackIcons[index] || "fa-solid fa-star"}></i>
                </div>
                <h3 className="about-value-title">{value.title}</h3>
                <p className="about-value-description">{value.description}</p>
              </Card>
            ))}
        </Grid>
      </Section>

      <Section padding="lg" containerSize="lg">
        <div className="about-society-grid">
          <Card className="about-society-card">
            <h2 className="about-society-title">
              {t("estatutos.society_board_title")}
            </h2>
            <p className="about-society-text">
              {t("estatutos.society_board_text")}
            </p>
            <Link to="/nosotros/directiva" className="btn btn-outline">
              {t("estatutos.society_board_btn")}
            </Link>
          </Card>

          <Card className="about-society-card">
            <h2 className="about-society-title">
              {t("estatutos.society_history_title")}
            </h2>
            <p className="about-society-text">
              {t("estatutos.society_history_text")}
            </p>
            <Link to="/nosotros/historia" className="btn btn-outline">
              {t("estatutos.society_history_btn")}
            </Link>
          </Card>

          <Card className="about-society-card">
            <h2 className="about-society-title">
              {t("estatutos.society_statutes_title")}
            </h2>
            <p className="about-society-text">
              {t("estatutos.society_statutes_text")}
            </p>
            <Link to="/nosotros/estatutos" className="btn btn-primary">
              {t("estatutos.society_statutes_btn")}
            </Link>
          </Card>
        </div>
      </Section>
    </>
  );
}
