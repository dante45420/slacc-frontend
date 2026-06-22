import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Section, Card, Grid, PageHero } from "../../components/ui";

export default function InternationalPT() {
  const { t } = useTranslation();
  const sections = t("intl_landing.sections_items_pt", { returnObjects: true });

  return (
    <>
      <Section variant="primary" padding="lg" containerSize="lg">
        <PageHero
          kicker={t("intl_landing.kicker_pt")}
          title={t("intl_landing.title_pt")}
          subtitle={t("intl_landing.subtitle_pt")}
        />
      </Section>

      <Section padding="lg" containerSize="lg">
        <Grid columns={2} gap={4} className="intl-grid">
          <Card className="intl-card">
            <h2 className="intl-card-title">
              {t("intl_landing.sections_title_pt")}
            </h2>
            {Array.isArray(sections) && (
              <ul className="intl-list">
                {sections.map(item => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            )}
            <Link to="/" className="btn btn-outline btn-sm">
              {t("intl_landing.go_spanish_pt")}
            </Link>
          </Card>

          <Card className="intl-card">
            <h2 className="intl-card-title">
              {t("intl_landing.congress_title_pt")}
            </h2>
            <p className="intl-congress-name">{t("intl_landing.congress_name")}</p>
            <p className="intl-card-text">{t("intl_landing.congress_text_pt")}</p>
            <Link to="/eventos/proximos" className="btn btn-primary btn-sm">
              {t("intl_landing.congress_btn_pt")}
            </Link>
          </Card>
        </Grid>
      </Section>
    </>
  );
}
