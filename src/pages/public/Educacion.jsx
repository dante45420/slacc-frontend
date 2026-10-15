import { useEffect } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import PropTypes from "prop-types";
import { Section, PageHero, Button, Badge } from "../../components/ui";
import { initials } from "../../data/board";

const BASE_PATH = "/educacion";

// The three programmes. /educacion shows all of them; each sub-path shows its own.
const PROGRAMS = [
  {
    id: "aval-certificacion",
    path: "/educacion/aval-certificacion",
    icon: "fa-award",
    navKey: "educacion.nav_certification",
    summaryKey: "educacion.overview_certification",
    summaryDefault: "Estándares de formación y acreditación de centros formadores en la región.",
  },
  {
    id: "becas",
    path: "/educacion/becas",
    icon: "fa-user-graduate",
    navKey: "educacion.nav_scholarships",
    summaryKey: "educacion.overview_scholarships",
    summaryDefault: "Fellowships y pasantías con mentoría en centros acreditados por SLACC.",
  },
  {
    id: "videoteca",
    path: "/educacion/videoteca",
    icon: "fa-circle-play",
    navKey: "educacion.nav_classroom",
    summaryKey: "educacion.overview_classroom",
    summaryDefault: "Cirugías comentadas, webinars grabados y casos clínicos para socios.",
  },
];

const CERT_ICONS = ["fa-hospital", "fa-clipboard-check", "fa-certificate"];

const asArray = value => (Array.isArray(value) ? value : []);

function ProgramCard({ program }) {
  const { t } = useTranslation();
  return (
    <Link to={program.path} className="card card-hoverable edu-program-card">
      <span className="icon-tile" aria-hidden="true">
        <i className={`fa-solid ${program.icon}`}></i>
      </span>
      <h3 className="edu-program-card__title">{t(program.navKey)}</h3>
      <p className="edu-program-card__text">{t(program.summaryKey, program.summaryDefault)}</p>
      <span className="link-arrow edu-program-card__more">
        {t("educacion.overview_more", "Ver programa")}
        <i className="fa-solid fa-arrow-right" aria-hidden="true"></i>
      </span>
    </Link>
  );
}

function CertificationSection({ variant }) {
  const { t } = useTranslation();
  const certItems = asArray(t("educacion.cert_items", { returnObjects: true }));

  return (
    <Section variant={variant} id="aval-certificacion" className="edu-section">
      <div className="section-head">
        <div className="section-head__text">
          <p className="eyebrow">{t("educacion.cert_eyebrow", "Acreditación")}</p>
          <h2 className="section-title">{t("educacion.cert_title")}</h2>
          <p className="section-lead">{t("educacion.cert_description")}</p>
        </div>
      </div>

      {certItems.length > 0 && (
        <ol className="edu-cert-list">
          {certItems.map((item, index) => (
            <li key={item} className="card edu-cert-item">
              <div className="edu-cert-item__top">
                <span className="icon-tile" aria-hidden="true">
                  <i className={`fa-solid ${CERT_ICONS[index % CERT_ICONS.length]}`}></i>
                </span>
                <span className="edu-cert-item__num" aria-hidden="true">
                  {String(index + 1).padStart(2, "0")}
                </span>
              </div>
              <p className="edu-cert-item__text">{item}</p>
            </li>
          ))}
        </ol>
      )}

      <div className="edu-callout">
        <div className="edu-callout__text">
          <h3 className="edu-callout__title">
            {t("educacion.cert_cta_title", "¿Tu centro busca el aval SLACC?")}
          </h3>
          <p>
            {t(
              "educacion.cert_cta_text",
              "Escríbenos para conocer los requisitos, el proceso de evaluación y los plazos.",
            )}
          </p>
        </div>
        <Button to="/contacto" variant="outline">
          {t("educacion.cert_cta_btn", "Solicitar información")}
        </Button>
      </div>
    </Section>
  );
}

function ScholarshipsSection({ variant }) {
  const { t } = useTranslation();
  const fellowships = asArray(t("educacion.fellowships", { returnObjects: true }));
  const testimonials = asArray(t("educacion.testimonials", { returnObjects: true }));

  return (
    <Section variant={variant} id="becas" className="edu-section">
      <div className="section-head">
        <div className="section-head__text">
          <p className="eyebrow">{t("educacion.scholarships_eyebrow", "Formación práctica")}</p>
          <h2 className="section-title">{t("educacion.scholarships_title")}</h2>
          <p className="section-lead">{t("educacion.scholarships_description")}</p>
        </div>
      </div>

      {fellowships.length > 0 && (
        <div className="edu-fellowships">
          {fellowships.map(item => (
            <article key={item.title} className="card edu-fellowship">
              <Badge variant="primary" className="edu-fellowship__badge">
                <i className="fa-regular fa-calendar" aria-hidden="true"></i>
                {item.mode}
              </Badge>
              <h3 className="edu-fellowship__title">{item.title}</h3>
              <dl className="edu-fellowship__facts">
                <div className="edu-fellowship__fact">
                  <dt>
                    <i className="fa-regular fa-clock" aria-hidden="true"></i>
                    {t("educacion.duration_label")}
                  </dt>
                  <dd>{item.duration}</dd>
                </div>
                <div className="edu-fellowship__fact">
                  <dt>
                    <i className="fa-solid fa-location-dot" aria-hidden="true"></i>
                    {t("educacion.location_label")}
                  </dt>
                  <dd>{item.location}</dd>
                </div>
              </dl>
              <div className="edu-fellowship__footer">
                <Button to="/contacto" variant="primary" fullWidth>
                  {t("educacion.apply_btn")}
                </Button>
              </div>
            </article>
          ))}
        </div>
      )}

      {testimonials.length > 0 && (
        <div className="edu-testimonials">
          <h3 className="edu-subtitle">{t("educacion.testimonials_title")}</h3>
          <div className="edu-testimonials__grid">
            {testimonials.map(item => (
              <figure key={item.name} className="card edu-quote">
                <i className="fa-solid fa-quote-left edu-quote__mark" aria-hidden="true"></i>
                <blockquote className="edu-quote__text">
                  <p>{item.text}</p>
                </blockquote>
                <figcaption className="edu-quote__author">
                  <span className="avatar" aria-hidden="true">
                    {initials(item.name)}
                  </span>
                  <span className="edu-quote__name">{item.name}</span>
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
      )}
    </Section>
  );
}

function ClassroomSection({ variant }) {
  const { t } = useTranslation();
  const resources = [
    {
      icon: "fa-video",
      title: t("educacion.classroom_item_surgeries", "Cirugías comentadas"),
      text: t(
        "educacion.classroom_item_surgeries_text",
        "Videos de procedimientos con comentarios de los especialistas que los realizaron.",
      ),
    },
    {
      icon: "fa-display",
      title: t("educacion.classroom_item_webinars", "Webinars grabados"),
      text: t(
        "educacion.classroom_item_webinars_text",
        "Sesiones académicas de la sociedad disponibles para verlas cuando quieras.",
      ),
    },
    {
      icon: "fa-notes-medical",
      title: t("educacion.classroom_item_cases", "Discusión de casos clínicos"),
      text: t(
        "educacion.classroom_item_cases_text",
        "Casos reales analizados paso a paso para el estudio asincrónico.",
      ),
    },
  ];

  return (
    <Section variant={variant} id="videoteca" className="edu-section">
      <div className="section-head">
        <div className="section-head__text">
          <p className="eyebrow">{t("educacion.classroom_eyebrow", "Aprendizaje en línea")}</p>
          <h2 className="section-title">{t("educacion.classroom_title")}</h2>
          <p className="section-lead">{t("educacion.classroom_description")}</p>
        </div>
      </div>

      <div className="edu-resources">
        {resources.map(item => (
          <article key={item.icon} className="card edu-resource">
            <div className="edu-resource__top">
              <span className="icon-tile" aria-hidden="true">
                <i className={`fa-solid ${item.icon}`}></i>
              </span>
              <Badge variant="neutral" size="sm">
                <i className="fa-regular fa-clock" aria-hidden="true"></i>
                {t("common.coming_soon")}
              </Badge>
            </div>
            <h3 className="edu-resource__title">{item.title}</h3>
            <p className="edu-resource__text">{item.text}</p>
          </article>
        ))}
      </div>
      <p className="edu-resources__note">
        {t(
          "educacion.classroom_soon_note",
          "Estamos preparando el catálogo. Los socios activos podrán acceder a él desde el Portal de Socios en cuanto esté disponible.",
        )}
      </p>

      <div className="edu-access">
        <span className="icon-tile icon-tile--accent edu-access__icon" aria-hidden="true">
          <i className="fa-solid fa-lock"></i>
        </span>
        <div className="edu-access__text">
          <h3 className="edu-access__title">{t("educacion.classroom_access")}</h3>
          <p>
            {t(
              "educacion.classroom_access_text",
              "Inicia sesión con tu cuenta de socio para entrar, o solicita tu membresía para obtener acceso.",
            )}
          </p>
        </div>
        <div className="edu-access__actions">
          <Button to="/portal-socios" variant="primary">
            {t("educacion.classroom_enter")}
          </Button>
          <Button to="/solicitar-membresia" variant="accent">
            {t("educacion.classroom_join")}
          </Button>
        </div>
      </div>
    </Section>
  );
}

const programShape = PropTypes.shape({
  id: PropTypes.string.isRequired,
  path: PropTypes.string.isRequired,
  icon: PropTypes.string.isRequired,
  navKey: PropTypes.string.isRequired,
  summaryKey: PropTypes.string.isRequired,
  summaryDefault: PropTypes.string.isRequired,
});

ProgramCard.propTypes = { program: programShape.isRequired };
CertificationSection.propTypes = { variant: PropTypes.string };
ScholarshipsSection.propTypes = { variant: PropTypes.string };
ClassroomSection.propTypes = { variant: PropTypes.string };

const SECTION_COMPONENTS = {
  "aval-certificacion": CertificationSection,
  becas: ScholarshipsSection,
  videoteca: ClassroomSection,
};

export default function Educacion() {
  const { t } = useTranslation();
  const location = useLocation();
  const activeProgram = PROGRAMS.find(p => p.path === location.pathname.replace(/\/+$/, ""));
  const visiblePrograms = activeProgram ? [activeProgram] : PROGRAMS;
  const otherPrograms = activeProgram ? PROGRAMS.filter(p => p !== activeProgram) : [];

  // Re-clicking the link of the page you are on (hero pills or header menu)
  // still gives feedback: go back to the top, like a normal page load.
  // Legacy hash links (/educacion#becas) scroll to their section here, because
  // on a cold load the app-level handler runs before this lazy page mounts.
  useEffect(() => {
    if (location.hash) {
      const target = document.getElementById(decodeURIComponent(location.hash.slice(1)));
      if (target) {
        target.scrollIntoView();
        return;
      }
    }
    window.scrollTo({ top: 0 });
  }, [location.key, location.hash]);

  return (
    <div className="page edu-page">
      <PageHero
        kicker={t("educacion.kicker")}
        title={t("educacion.title")}
        subtitle={t("educacion.subtitle")}
      >
        <nav className="edu-subnav" aria-label={t("educacion.subnav_label", "Programas de educación")}>
          <div className="filter-bar edu-subnav__bar">
            <NavLink
              to={BASE_PATH}
              end
              className={({ isActive }) => `filter-pill${isActive ? " active" : ""}`}
            >
              {t("educacion.nav_overview", "Todos los programas")}
            </NavLink>
            {PROGRAMS.map(program => (
              <NavLink
                key={program.id}
                to={program.path}
                className={({ isActive }) => `filter-pill${isActive ? " active" : ""}`}
              >
                <i className={`fa-solid ${program.icon}`} aria-hidden="true"></i>
                {t(program.navKey)}
              </NavLink>
            ))}
          </div>
        </nav>
      </PageHero>

      {!activeProgram && (
        <Section className="edu-overview">
          <h2 className="sr-only">{t("educacion.subnav_label", "Programas de educación")}</h2>
          <div className="edu-programs">
            {PROGRAMS.map(program => (
              <ProgramCard key={program.id} program={program} />
            ))}
          </div>
        </Section>
      )}

      {visiblePrograms.map((program, index) => {
        const SectionComponent = SECTION_COMPONENTS[program.id];
        const variant = activeProgram ? "default" : index % 2 === 0 ? "surface" : "default";
        return <SectionComponent key={program.id} variant={variant} />;
      })}

      {otherPrograms.length > 0 && (
        <Section variant="muted" className="edu-more">
          <div className="section-head">
            <div className="section-head__text">
              <p className="eyebrow">{t("educacion.kicker")}</p>
              <h2 className="section-title">
                {t("educacion.more_title", "Otros programas de formación")}
              </h2>
            </div>
            <Button to={BASE_PATH} variant="outline">
              {t("educacion.nav_overview", "Todos los programas")}
            </Button>
          </div>
          <div className="edu-programs edu-programs--two">
            {otherPrograms.map(program => (
              <ProgramCard key={program.id} program={program} />
            ))}
          </div>
        </Section>
      )}
    </div>
  );
}
