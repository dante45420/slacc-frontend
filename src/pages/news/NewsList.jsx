import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Section, Button, EmptyState } from "../../components/ui";

export default function NewsList() {
  const { t } = useTranslation();
  const demo = [
    { id: 1, title: "Primer anuncio", excerpt: "Resumen corto" },
    { id: 2, title: "Lanzamiento", excerpt: "Detalles del lanzamiento" },
  ];

  return (
    <Section variant="default" padding="lg">
      <div className="news-list-header">
        <h1 className="news-list-title">{t("news.title")}</h1>
        <Link to="/admin/news/new">
          <Button variant="primary">{t("news.new_article")}</Button>
        </Link>
      </div>

      {demo.length === 0 ? (
        <EmptyState
          icon="📰"
          title={t("news.empty_title")}
          description={t("news.empty_description")}
          action={
            <Link to="/admin/news/new">
              <Button variant="primary">{t("news.empty_action")}</Button>
            </Link>
          }
        />
      ) : (
        <div className="cards">
          {demo.map(n => (
            <article key={n.id} className="card">
              <h3>{n.title}</h3>
              <p className="news-list-excerpt">{n.excerpt}</p>
              <Link to={`/noticias/${n.id}`}>
                <Button variant="outline" size="sm">
                  {t("news.read_more")}{" "}
                  <i className="fa-solid fa-arrow-right"></i>
                </Button>
              </Link>
            </article>
          ))}
        </div>
      )}
    </Section>
  );
}
