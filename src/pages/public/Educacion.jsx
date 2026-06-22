import { Link, useLocation } from "react-router-dom";
import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Section, Card, Grid, PageHero } from "../../components/ui";

const routeToSection = {
  "/educacion/aval-certificacion": "aval-certificacion",
  "/educacion/becas": "becas",
  "/educacion/videoteca": "videoteca",
};

export default function Educacion() {
  const { t } = useTranslation();
  const location = useLocation();
  const certItems = t("educacion.cert_items", { returnObjects: true });
  const fellowships = t("educacion.fellowships", { returnObjects: true });
  const testimonials = t("educacion.testimonials", { returnObjects: true });

  useEffect(() => {
    const targetId = routeToSection[location.pathname];
    if (!targetId) return;

    const element = document.getElementById(targetId);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [location.pathname]);

  return (
    <>
      <Section variant="primary" padding="lg" containerSize="lg">
        <PageHero
          kicker={t("educacion.kicker")}
          title={t("educacion.title")}
          subtitle={t("educacion.subtitle")}
        >
          <div className="education-quick-links">
            <Link
              to="/educacion/aval-certificacion"
              className="btn btn-outline"
            >
              {t("educacion.nav_certification")}
            </Link>
            <Link to="/educacion/becas" className="btn btn-outline">
              {t("educacion.nav_scholarships")}
            </Link>
            <Link to="/educacion/videoteca" className="btn btn-outline">
              {t("educacion.nav_classroom")}
            </Link>
          </div>
        </PageHero>
      </Section>

      <Section padding="lg" containerSize="lg">
        <Card id="aval-certificacion" className="education-section-card">
          <h2 className="education-section-title">{t("educacion.cert_title")}</h2>
          <p className="education-section-description">
            {t("educacion.cert_description")}
          </p>
          {Array.isArray(certItems) && (
            <ul className="education-list">
              {certItems.map(item => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          )}
        </Card>
      </Section>

      <Section variant="alt" padding="lg" containerSize="lg">
        <div id="becas" className="education-section-anchor"></div>
        <h2 className="education-section-title">
          {t("educacion.scholarships_title")}
        </h2>
        <p className="education-section-description">
          {t("educacion.scholarships_description")}
        </p>

        <Grid columns={2} gap={4} className="education-fellowship-grid">
          {Array.isArray(fellowships) &&
            fellowships.map(item => (
              <Card key={item.title} className="education-fellowship-card">
                <h3 className="education-fellowship-title">{item.title}</h3>
                <p className="education-fellowship-meta">{item.mode}</p>
                <p className="education-fellowship-meta">
                  {t("educacion.duration_label")}: {item.duration}
                </p>
                <p className="education-fellowship-meta">
                  {t("educacion.location_label")}: {item.location}
                </p>
                <Link to="/contacto" className="btn btn-primary btn-sm">
                  {t("educacion.apply_btn")}
                </Link>
              </Card>
            ))}
        </Grid>

        <h3 className="education-testimonials-title">
          {t("educacion.testimonials_title")}
        </h3>
        <Grid columns={2} gap={4} className="education-testimonials-grid">
          {Array.isArray(testimonials) &&
            testimonials.map(item => (
              <Card key={item.name} className="education-testimonial-card">
                <p className="education-testimonial-text">"{item.text}"</p>
                <p className="education-testimonial-name">{item.name}</p>
              </Card>
            ))}
        </Grid>
      </Section>

      <Section padding="lg" containerSize="lg">
        <Card id="videoteca" className="education-section-card">
          <h2 className="education-section-title">
            {t("educacion.classroom_title")}
          </h2>
          <p className="education-section-description">
            {t("educacion.classroom_description")}
          </p>
          <div className="education-access-box">
            <p className="education-access-text">
              {t("educacion.classroom_access")}
            </p>
            <div className="education-access-actions">
              <Link to="/portal-socios" className="btn btn-primary">
                {t("educacion.classroom_enter")}
              </Link>
              <Link to="/solicitar-membresia" className="btn btn-outline">
                {t("educacion.classroom_join")}
              </Link>
            </div>
          </div>
        </Card>
      </Section>
    </>
  );
}
