import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Section, Button } from "../../components/ui";
import useDocumentTitle from "../../hooks/useDocumentTitle";

const HELPFUL_LINKS = [
  { to: "/eventos", icon: "fa-calendar-days", labelKey: "header.events", label: "Eventos" },
  { to: "/noticias", icon: "fa-newspaper", labelKey: "header.news", label: "Noticias" },
  { to: "/contacto", icon: "fa-envelope", labelKey: "header.contact", label: "Contacto" },
];

export default function NotFound() {
  const { t } = useTranslation();
  useDocumentTitle(t("notFound.title"));

  return (
    <div className="page notfound-page">
      <Section padding="lg" containerSize="sm">
        <div className="notfound">
          <p className="notfound__code" aria-hidden="true">
            404
          </p>
          <p className="eyebrow notfound__eyebrow">{t("notFound.eyebrow", "Error 404")}</p>
          <h1 className="notfound__title">{t("notFound.title")}</h1>
          <p className="notfound__text">{t("notFound.description")}</p>

          <div className="notfound__actions">
            <Button to="/" size="lg">
              <i className="fa-solid fa-house" aria-hidden="true"></i>
              {t("notFound.btn_home")}
            </Button>
          </div>

          <nav className="notfound__links" aria-labelledby="notfound-links-title">
            <h2 id="notfound-links-title" className="notfound__links-title">
              {t("notFound.links_title", "También puedes visitar")}
            </h2>
            <ul className="notfound__list">
              {HELPFUL_LINKS.map(link => (
                <li key={link.to}>
                  <Link to={link.to} className="notfound-link">
                    <span className="icon-tile" aria-hidden="true">
                      <i className={`fa-solid ${link.icon}`}></i>
                    </span>
                    <span className="notfound-link__label">{t(link.labelKey, link.label)}</span>
                    <i className="fa-solid fa-arrow-right notfound-link__arrow" aria-hidden="true"></i>
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </Section>
    </div>
  );
}
