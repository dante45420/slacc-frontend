import { useEffect, useState } from "react";
import PropTypes from "prop-types";
import { useTranslation } from "react-i18next";
import { apiGet } from "../api/client";
import { Button, EmptyState } from "./ui";
import NewsCard from "./news/NewsCard.jsx";
import Rail from "./home/Rail.jsx";

function NewsCardSkeleton() {
  return (
    <div className="home-skeleton" aria-hidden="true">
      <div className="home-skeleton__media" />
      <div className="home-skeleton__body">
        <span className="home-skeleton__line home-skeleton__line--short" />
        <span className="home-skeleton__line home-skeleton__line--title" />
        <span className="home-skeleton__line" />
        <span className="home-skeleton__line home-skeleton__line--mid" />
      </div>
    </div>
  );
}

/**
 * Recent articles as a rail of shared news cards (3 per view on wide
 * containers, a swipeable rail with a peeking card on phones). Used on the
 * home page and as "Más noticias" under an article (with `excludeId`).
 */
export default function NewsCarousel({ limit = 9, category, excludeId, bleed = false }) {
  const { t } = useTranslation();
  const [news, setNews] = useState([]);
  const [status, setStatus] = useState("loading");
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    // Ignore responses that arrive after the props changed or on unmount.
    let cancelled = false;
    setStatus("loading");
    const query = category ? `?category=${encodeURIComponent(category)}` : "";
    apiGet(`/news${query}`)
      .then(data => {
        if (cancelled) return;
        const list = Array.isArray(data) ? data : [];
        const filtered =
          excludeId === undefined || excludeId === null
            ? list
            : list.filter(article => String(article.id) !== String(excludeId));
        setNews(filtered.slice(0, limit));
        setStatus("ready");
      })
      .catch(() => {
        if (cancelled) return;
        setNews([]);
        setStatus("error");
      });
    return () => {
      cancelled = true;
    };
  }, [category, limit, excludeId, reloadKey]);

  if (status === "loading") {
    return (
      <div aria-busy="true">
        <span className="sr-only" role="status">
          {t("news.loading", "Cargando noticias...")}
        </span>
        <Rail variant="cards" bleed={bleed}>
          <NewsCardSkeleton />
          <NewsCardSkeleton />
          <NewsCardSkeleton />
        </Rail>
      </div>
    );
  }

  if (status === "error") {
    return (
      <EmptyState
        className="home-state"
        icon={<i className="fa-solid fa-triangle-exclamation"></i>}
        title={t("home.news_error_title", "No pudimos cargar las noticias")}
        description={t("home.load_error_desc", "Revisa tu conexión e inténtalo nuevamente.")}
        action={
          <Button variant="outline" onClick={() => setReloadKey(k => k + 1)}>
            <i className="fa-solid fa-rotate-right" aria-hidden="true"></i>
            {t("home.retry", "Reintentar")}
          </Button>
        }
      />
    );
  }

  if (news.length === 0) {
    return (
      <EmptyState
        className="home-state"
        icon={<i className="fa-regular fa-newspaper"></i>}
        title={t("home.news_empty_title", "Aún no hay noticias publicadas")}
        description={t(
          "home.news_empty_desc",
          "Vuelve pronto para conocer las novedades de la sociedad.",
        )}
      />
    );
  }

  return (
    <Rail
      variant="cards"
      bleed={bleed}
      className="home-news-rail"
      label={t("home.recent_news", "Noticias recientes")}
    >
      {news.map(article => (
        <NewsCard key={article.id} article={article} />
      ))}
    </Rail>
  );
}

NewsCarousel.propTypes = {
  limit: PropTypes.number,
  category: PropTypes.string,
  excludeId: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  bleed: PropTypes.bool,
};
