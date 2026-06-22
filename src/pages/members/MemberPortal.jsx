import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Section, Card, Grid, PageHero } from "../../components/ui";

const MODULE_ICONS = [
  "fa-solid fa-video",
  "fa-solid fa-address-book",
  "fa-solid fa-comments",
];

export default function MemberPortal() {
  const { t } = useTranslation();
  const modules = t("portal.modules", { returnObjects: true });

  return (
    <>
      <Section variant="primary" padding="lg" containerSize="lg">
        <PageHero
          kicker={t("portal.kicker")}
          title={t("portal.title")}
          subtitle={t("portal.subtitle")}
        />
      </Section>

      <Section padding="lg" containerSize="lg">
        <Grid columns={3} gap={4} className="portal-grid">
          {Array.isArray(modules) &&
            modules.map((module, index) => (
              <Card key={module.title} className="portal-card">
                <div className="portal-icon" aria-hidden="true">
                  <i className={MODULE_ICONS[index] || "fa-solid fa-star"}></i>
                </div>
                <h2 className="portal-card-title">{module.title}</h2>
                <p className="portal-card-description">{module.description}</p>
                <button className="btn btn-outline btn-sm" disabled>
                  {t("common.coming_soon")}
                </button>
              </Card>
            ))}
        </Grid>
      </Section>

      <Section variant="alt" padding="lg" containerSize="lg">
        <Card className="portal-help-card">
          <h2 className="portal-help-title">{t("portal.help_title")}</h2>
          <p className="portal-help-text">{t("portal.help_text")}</p>
          <div className="portal-help-actions">
            <Link to="/contacto" className="btn btn-primary">
              {t("portal.help_contact")}
            </Link>
            <Link to="/perfil" className="btn btn-outline">
              {t("portal.help_profile")}
            </Link>
          </div>
        </Card>
      </Section>
    </>
  );
}
