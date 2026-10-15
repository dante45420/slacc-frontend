import { Link } from "react-router-dom";
import PropTypes from "prop-types";
import { useTranslation } from "react-i18next";
import Carousel from "../../components/Carousel.jsx";
import EventsCarousel from "../../components/EventsCarousel.jsx";
import InstagramFeed from "../../components/InstagramFeed.jsx";
import NewsCarousel from "../../components/NewsCarousel.jsx";
import { TeamCarousel } from "../../components/TeamCarousel.jsx";
import { Button, Section } from "../../components/ui";

const QUICK_LINKS = [
  {
    to: "/eventos/proximos",
    icon: "fa-calendar-days",
    titleKey: "home.quick.events_title",
    title: "Eventos y Congreso",
    descKey: "home.quick.events_desc",
    desc: "Congreso, cursos y webinars de la sociedad.",
  },
  {
    to: "/educacion",
    icon: "fa-graduation-cap",
    titleKey: "home.quick.education_title",
    title: "Educación",
    descKey: "home.quick.education_desc",
    desc: "Aval, becas, pasantías y aula virtual.",
  },
  {
    to: "/por-que-ser-socio",
    icon: "fa-id-card",
    titleKey: "home.quick.membership_title",
    title: "Membresía",
    descKey: "home.quick.membership_desc",
    desc: "Beneficios y categorías para socios.",
  },
  {
    to: "/noticias",
    icon: "fa-newspaper",
    titleKey: "home.quick.news_title",
    title: "Noticias",
    descKey: "home.quick.news_desc",
    desc: "Artículos científicos y editoriales.",
  },
];

SectionHead.propTypes = {
  kicker: PropTypes.node.isRequired,
  title: PropTypes.node.isRequired,
  lead: PropTypes.node,
  action: PropTypes.node,
};

function SectionHead({ kicker, title, lead, action }) {
  return (
    <div className="section-head">
      <div className="section-head__text">
        <p className="eyebrow">{kicker}</p>
        <h2 className="section-title">{title}</h2>
        {lead && <p className="section-lead">{lead}</p>}
      </div>
      {action}
    </div>
  );
}

export default function Home() {
  const { t } = useTranslation();

  // Each caption describes its own photo; no hardcoded dates that go stale.
  // The group photo is small (498×198), so like the congress flyer it is
  // shown crisp in a frame over a blurred copy of itself, never stretched
  // across the full-bleed hero.
  const slides = [
    {
      id: "community",
      image: "/carrusel_1.png",
      position: "50% 30%",
      poster: "/carrusel_1.png",
      posterShape: "landscape",
      posterPosition: "48% 50%",
      kicker: t("home.hero_slides.community_kicker", "Comunidad SLACC"),
      text: t(
        "home.hero_slides.community_text",
        "Cirujanos de cadera de toda Latinoamérica, unidos por la excelencia clínica.",
      ),
      to: "/miembros/socios-activos",
      linkLabel: t("home.hero_slides.community_link", "Ver socios activos"),
    },
    {
      id: "congress",
      image: "/directiva/flyer-congreso-web.jpg",
      poster: "/directiva/flyer-congreso-web.jpg",
      kicker: t("home.hero_slides.congress_kicker", "Congreso SLACC"),
      text: t("home.hero_slides.congress_text", "Primer Congreso SLACC"),
      meta: t("home.hero_slides.congress_place", "São Paulo, Brasil"),
      to: "/eventos/proximos",
      linkLabel: t("home.hero_slides.congress_link", "Ver próximos eventos"),
    },
  ];

  return (
    <div className="page home-page">
      <Carousel slides={slides} label={t("home.hero_carousel_label", "Destacados")}>
        <p className="eyebrow home-hero__eyebrow">
          {t("footer.tagline", "Sociedad Latinoamericana de Cirugía de Cadera")}
        </p>
        <h1 className="home-hero__title">{t("home.welcome_title")}</h1>
        <p className="home-hero__subtitle">{t("home.welcome_subtitle")}</p>
        <div className="home-hero__actions">
          <Button variant="inverse" size="lg" to="/nosotros">
            {t("home.hero_cta_about", "Conoce SLACC")}
          </Button>
          <Button variant="outline-inverse" size="lg" to="/solicitar-membresia">
            {t("header.request_membership", "Solicitar membresía")}
          </Button>
        </div>
      </Carousel>

      <nav className="home-quick" aria-label={t("home.quick_access", "Accesos rápidos")}>
        <ul className="home-quick__grid">
          {QUICK_LINKS.map(item => (
            <li key={item.to}>
              <Link to={item.to} className="home-quick__card">
                <span className="icon-tile" aria-hidden="true">
                  <i className={`fa-solid ${item.icon}`}></i>
                </span>
                <span className="home-quick__text">
                  <span className="home-quick__title">{t(item.titleKey, item.title)}</span>
                  <span className="home-quick__desc">{t(item.descKey, item.desc)}</span>
                </span>
                <i className="fa-solid fa-arrow-right home-quick__arrow" aria-hidden="true"></i>
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      <Section className="home-section home-section--events">
        <SectionHead
          kicker={t("home.events_kicker", "Agenda académica")}
          title={t("home.sponsored_events", "Próximos eventos")}
          lead={t(
            "home.events_lead",
            "Congresos, cursos y webinars para especialistas en cirugía de cadera.",
          )}
          action={
            <Button variant="outline" to="/eventos/proximos" className="home-section__more">
              {t("home.btn_see_all", "Ver todos")}
              <i className="fa-solid fa-arrow-right" aria-hidden="true"></i>
            </Button>
          }
        />
        <EventsCarousel limit={3} />
      </Section>

      <Section variant="surface" className="home-section home-section--news">
        <SectionHead
          kicker={t("home.news_kicker", "Actualidad")}
          title={t("home.recent_news", "Noticias recientes")}
          lead={t(
            "home.news_lead",
            "Artículos científicos, editoriales y novedades de la sociedad.",
          )}
          action={
            <Button variant="outline" to="/noticias" className="home-section__more">
              {t("home.btn_see_all_news", "Ver todas")}
              <i className="fa-solid fa-arrow-right" aria-hidden="true"></i>
            </Button>
          }
        />
        <NewsCarousel limit={6} bleed />
      </Section>

      <Section className="home-section home-section--team">
        <SectionHead
          kicker={t("header.board", "Mesa Directiva")}
          title={t("home.our_team", "Nuestro equipo")}
          lead={t("directiva.subtitle")}
          action={
            <Button variant="outline" to="/nosotros/directiva" className="home-section__more">
              {t("home.btn_board", "Ver Mesa Directiva")}
              <i className="fa-solid fa-arrow-right" aria-hidden="true"></i>
            </Button>
          }
        />
        <TeamCarousel bleed />
      </Section>

      <Section variant="muted" className="home-section home-section--instagram">
        <InstagramFeed />
      </Section>

      <Section variant="brand" className="home-cta">
        <div className="home-cta__inner">
          <div className="home-cta__text">
            <p className="eyebrow">{t("home.cta_kicker", "Membresía")}</p>
            <h2 className="home-cta__title">
              {t("home.cta_title", "Únete a la comunidad SLACC")}
            </h2>
            <p className="home-cta__lead">
              {t(
                "home.cta_text",
                "Formación continua, congresos y una red de especialistas en cirugía de cadera de toda Latinoamérica.",
              )}
            </p>
          </div>
          <div className="home-cta__actions">
            <Button variant="inverse" size="lg" to="/solicitar-membresia">
              {t("header.join", "Hazte socio")}
            </Button>
            <Button variant="outline-inverse" size="lg" to="/por-que-ser-socio">
              {t("home.cta_benefits", "Conoce los beneficios")}
            </Button>
          </div>
        </div>
      </Section>
    </div>
  );
}
