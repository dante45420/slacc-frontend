import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuth } from "../../auth/AuthContext.jsx";
import { Badge, Button, PageHero, Section } from "../../components/ui";
import { stripHonorific } from "../../components/members/memberUtils.js";

const MODULE_ICONS = [
  "fa-solid fa-video",
  "fa-solid fa-address-book",
  "fa-solid fa-comments",
];

export default function MemberPortal() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const modules = t("portal.modules", { returnObjects: true });
  const firstName = stripHonorific(user?.name || "").split(/\s+/)[0];

  const quickLinks = [
    {
      to: "/perfil",
      icon: "fa-solid fa-user",
      title: t("header.profile"),
      text: t(
        "portal.link_profile",
        "Revisa tu membresía, tu estado de pago y cambia tu contraseña.",
      ),
    },
    {
      to: "/eventos/proximos",
      icon: "fa-regular fa-calendar",
      title: t("header.events"),
      text: t(
        "portal.link_events",
        "Próximos congresos, cursos y webinars de la sociedad.",
      ),
    },
    {
      to: "/noticias",
      icon: "fa-regular fa-newspaper",
      title: t("header.news"),
      text: t(
        "portal.link_news",
        "Artículos científicos, editoriales y novedades de SLACC.",
      ),
    },
    {
      to: "/miembros/socios-activos",
      icon: "fa-solid fa-address-book",
      title: t("header.active_members"),
      text: t(
        "portal.link_directory",
        "Encuentra y contacta a otros socios activos de la región.",
      ),
    },
    {
      to: "/subir-noticia",
      icon: "fa-solid fa-pen-nib",
      title: t("header.submit_article"),
      text: t(
        "portal.link_submit",
        "Propón un artículo o caso para publicarlo en el sitio.",
      ),
    },
  ];

  return (
    <div className="page members-page">
      <PageHero
        kicker={t("portal.kicker")}
        title={t("portal.title")}
        subtitle={
          firstName
            ? `${t("portal.greeting", {
                name: firstName,
                defaultValue: "Hola, {{name}}.",
              })} ${t("portal.subtitle")}`
            : t("portal.subtitle")
        }
      />

      <Section>
        <div className="section-head">
          <div className="section-head__text">
            <p className="eyebrow">{t("portal.quick_eyebrow", "Disponible ahora")}</p>
            <h2 className="section-title">
              {t("portal.quick_title", "Accesos rápidos")}
            </h2>
          </div>
        </div>
        <ul className="members-links members-links--grid">
          {quickLinks.map(link => (
            <li key={link.to}>
              <Link to={link.to} className="members-link-card">
                <span className="icon-tile" aria-hidden="true">
                  <i className={link.icon}></i>
                </span>
                <span className="members-link-card__body">
                  <span className="members-link-card__title">{link.title}</span>
                  <span className="members-link-card__text">{link.text}</span>
                </span>
                <i
                  className="fa-solid fa-arrow-right members-link-card__arrow"
                  aria-hidden="true"
                ></i>
              </Link>
            </li>
          ))}
        </ul>
      </Section>

      {Array.isArray(modules) && modules.length > 0 && (
        <Section variant="surface">
          <div className="section-head">
            <div className="section-head__text">
              <p className="eyebrow">{t("common.coming_soon")}</p>
              <h2 className="section-title">
                {t("portal.soon_title", "Nuevas herramientas para socios")}
              </h2>
              <p className="section-lead">
                {t(
                  "portal.soon_lead",
                  "Estamos preparando estos módulos exclusivos. Te avisaremos cuando estén disponibles.",
                )}
              </p>
            </div>
          </div>
          <ul className="members-soon">
            {modules.map((module, index) => (
              <li key={module.title} className="members-soon__card">
                <div className="members-soon__head">
                  <span className="icon-tile" aria-hidden="true">
                    <i className={MODULE_ICONS[index] || "fa-solid fa-star"}></i>
                  </span>
                  <Badge variant="neutral" size="sm">
                    {t("common.coming_soon")}
                  </Badge>
                </div>
                <h3 className="members-soon__title">{module.title}</h3>
                <p className="members-soon__text">{module.description}</p>
              </li>
            ))}
          </ul>
        </Section>
      )}

      <Section>
        <div className="members-help">
          <span className="icon-tile" aria-hidden="true">
            <i className="fa-solid fa-headset"></i>
          </span>
          <div className="members-help__body">
            <h2 className="members-help__title">{t("portal.help_title")}</h2>
            <p className="members-help__text">{t("portal.help_text")}</p>
          </div>
          <div className="members-help__actions">
            <Button to="/contacto">{t("portal.help_contact")}</Button>
            <Button variant="outline" to="/perfil">
              {t("portal.help_profile")}
            </Button>
          </div>
        </div>
      </Section>
    </div>
  );
}
