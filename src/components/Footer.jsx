import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { SUPPORTED_LANGUAGES, currentLanguage } from "../i18n";
import { useAuth } from "../auth/AuthContext.jsx";
import {
  CONTACT_EMAIL,
  INSTAGRAM_HANDLE,
  INSTAGRAM_URL,
} from "./public/contactInfo.js";

export default function Footer() {
  const { t, i18n } = useTranslation();
  const { user } = useAuth();
  const lang = currentLanguage(i18n);
  const year = new Date().getFullYear();

  const columns = [
    {
      title: t("header.society", "La Sociedad"),
      links: [
        { to: "/nosotros/mision", label: t("header.mission", "Misión, Visión y Valores") },
        { to: "/nosotros/directiva", label: t("header.board", "Mesa Directiva") },
        { to: "/nosotros/historia", label: t("header.history", "Historia") },
        { to: "/nosotros/estatutos", label: t("header.statutes", "Estatutos") },
        { to: "/comites", label: t("header.committees", "Comités") },
      ],
    },
    {
      title: t("header.education", "Educación"),
      links: [
        { to: "/educacion/aval-certificacion", label: t("header.certification", "Aval y Certificación") },
        { to: "/educacion/becas", label: t("header.scholarships", "Becas y Pasantías") },
        { to: "/educacion/videoteca", label: t("header.virtual_classroom", "Aula Virtual") },
        { to: "/eventos", label: t("header.events", "Eventos") },
        { to: "/cursos", label: t("events.filter_courses", "Cursos y talleres") },
      ],
    },
    {
      title: t("header.members", "Miembros"),
      links: [
        { to: "/por-que-ser-socio", label: t("header.benefits", "Beneficios") },
        { to: "/miembros/socios-activos", label: t("header.active_members", "Socios Activos") },
        ...(user
          ? [
              { to: "/perfil", label: t("header.profile", "Mi perfil") },
              { to: "/portal-socios", label: t("header.private_portal", "Portal Privado") },
            ]
          : [
              { to: "/solicitar-membresia", label: t("header.request_membership", "Solicitar membresía") },
              { to: "/login", label: t("header.login", "Iniciar sesión") },
            ]),
      ],
    },
    {
      title: t("header.news", "Noticias"),
      links: [
        { to: "/noticias/articulos-cientificos", label: t("header.scientific_articles", "Artículos científicos") },
        { to: "/noticias/articulos-destacados", label: t("header.featured_articles", "Artículos destacados") },
        { to: "/noticias/editoriales", label: t("header.editorials", "Editoriales") },
        { to: "/contacto", label: t("header.contact", "Contacto") },
      ],
    },
  ];

  return (
    <footer className="site-footer">
      <div className="footer-inner">
        <div className="footer-brand">
          <p className="footer-brand-name">SLACC</p>
          <p className="footer-brand-tagline">
            {t("footer.tagline", "Sociedad Latinoamericana de Cirugía de Cadera")}
          </p>
          <p className="footer-brand-tagline">
            <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>
          </p>
          <div className="footer-social">
            <a
              href={INSTAGRAM_URL}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`Instagram ${INSTAGRAM_HANDLE}`}
            >
              <i className="fa-brands fa-instagram" aria-hidden="true"></i>
            </a>
            <a href={`mailto:${CONTACT_EMAIL}`} aria-label={t("common.email", "Email")}>
              <i className="fa-solid fa-envelope" aria-hidden="true"></i>
            </a>
          </div>
        </div>

        {columns.map(col => (
          <nav className="footer-col" key={col.title} aria-label={col.title}>
            <h2>{col.title}</h2>
            <ul>
              {col.links.map(link => (
                <li key={link.to + link.label}>
                  <Link to={link.to}>{link.label}</Link>
                </li>
              ))}
            </ul>
          </nav>
        ))}
      </div>

      <div className="footer-bottom">
        <div className="footer-bottom-inner">
          <p>
            © {year} SLACC · {t("footer.rights", "Todos los derechos reservados.")}
          </p>
          <div
            className="footer-lang"
            role="group"
            aria-label={t("header.select_language", "Seleccionar idioma")}
          >
            {SUPPORTED_LANGUAGES.map(code => (
              <button
                key={code}
                type="button"
                aria-current={lang === code ? "true" : undefined}
                onClick={() => i18n.changeLanguage(code)}
              >
                {code.toUpperCase()}
              </button>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
