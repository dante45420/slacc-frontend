import { NavLink, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuth } from "../../auth/AuthContext";
import NewsGrid from "../../components/NewsGrid.jsx";
import { Button, PageHero, Section } from "../../components/ui";
import { NEWS_CATEGORIES, getCategory } from "../../components/news/newsUtils";
import useDocumentTitle from "../../hooks/useDocumentTitle";

/**
 * /noticias (all categories) and /noticias/<category>.
 * The category comes straight from the URL, so the grid never shows a stale tab.
 * Same pattern as /eventos/* and /educacion/*: the hero title and subtitle
 * follow the active filter, and the filter pills sit inside the hero.
 */
export default function NewsPage() {
  const { t } = useTranslation();
  const { pathname } = useLocation();
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";

  const segment = pathname.split("/").filter(Boolean)[1] || "";
  const active = getCategory(segment);
  const category = active?.id;

  const categoryName = active ? t(active.labelKey, active.label) : "";
  useDocumentTitle(active ? `${categoryName} · ${t("news.title")}` : undefined);

  const title = active ? categoryName : t("news.title");
  const subtitle = active
    ? t(active.descKey, active.desc)
    : t(
        "news.subtitle",
        "Artículos científicos, novedades y editoriales de la Sociedad Latinoamericana de Cirugía de Cadera.",
      );

  return (
    <div className="page news-page">
      <PageHero kicker={t("news.kicker", "Publicaciones SLACC")} title={title} subtitle={subtitle}>
        <div className="news-page__toolbar">
          <nav className="news-page__filters" aria-label={t("news.categories_label", "Categorías de noticias")}>
            <ul className="filter-bar" role="list">
              <li>
                <NavLink to="/noticias" end className="filter-pill">
                  {t("news.tab_all", "Todas")}
                </NavLink>
              </li>
              {NEWS_CATEGORIES.map(cat => (
                <li key={cat.id}>
                  <NavLink to={`/noticias/${cat.id}`} className="filter-pill">
                    {t(cat.labelKey, cat.label)}
                  </NavLink>
                </li>
              ))}
            </ul>
          </nav>
          <div className="news-page__actions">
            {isAdmin && (
              <Button variant="outline" to="/admin/news/new">
                <i className="fa-solid fa-plus" aria-hidden="true"></i>
                {t("news.new_article")}
              </Button>
            )}
            <Button variant="primary" to="/subir-noticia">
              <i className="fa-solid fa-pen-to-square" aria-hidden="true"></i>
              {t("news.submit_article")}
            </Button>
          </div>
        </div>
      </PageHero>

      <Section className="news-page__section">
        <h2 className="sr-only">{active ? categoryName : t("news.all_title", "Todas las publicaciones")}</h2>
        <NewsGrid
          key={category || "all"}
          category={category}
          emptyAction={
            category ? (
              <Button variant="outline" to="/noticias">
                {t("news.see_all", "Ver todas las noticias")}
              </Button>
            ) : undefined
          }
        />
      </Section>
    </div>
  );
}
