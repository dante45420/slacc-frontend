import { useCallback, useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import PropTypes from "prop-types";
import { Button, EmptyState, Pagination } from "./ui";
import NewsCard from "./news/NewsCard.jsx";
import { apiGet } from "../api/client";

// Page 1 shows the lead card + 9 cards (three full rows); later pages show 9.
const FIRST_PAGE = 10;
const PAGE_SIZE = 9;

function pageCount(total, featureFirst) {
  if (!featureFirst) return Math.max(1, Math.ceil(total / PAGE_SIZE));
  if (total <= FIRST_PAGE) return 1;
  return 1 + Math.ceil((total - FIRST_PAGE) / PAGE_SIZE);
}

function pageSlice(list, page, featureFirst) {
  if (!featureFirst) return list.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  if (page === 1) return list.slice(0, FIRST_PAGE);
  const start = FIRST_PAGE + (page - 2) * PAGE_SIZE;
  return list.slice(start, start + PAGE_SIZE);
}

function NewsGridSkeleton() {
  const { t } = useTranslation();
  return (
    <div className="news-feed" aria-busy="true">
      <span className="sr-only" role="status">
        {t("news.loading")}
      </span>
      {[0, 1, 2, 3].map(i => (
        <div
          key={i}
          className={`news-skeleton${i === 0 ? " news-skeleton--lead" : ""}`}
          aria-hidden="true"
        >
          <div className="news-skeleton__media" />
          <div className="news-skeleton__body">
            <span className="news-skeleton__line news-skeleton__line--short" />
            <span className="news-skeleton__line news-skeleton__line--title" />
            <span className="news-skeleton__line" />
            <span className="news-skeleton__line news-skeleton__line--mid" />
          </div>
        </div>
      ))}
    </div>
  );
}

/**
 * Article listing. Fetches /news (optionally by category) unless `items` is given.
 * The first article becomes a wide lead card on larger screens (`featureFirst`).
 */
export default function NewsGrid({ items, category, featureFirst = true, emptyAction }) {
  const { t } = useTranslation();
  const controlled = Array.isArray(items);
  const [news, setNews] = useState(controlled ? items : []);
  const [status, setStatus] = useState(controlled ? "ready" : "loading");
  const [page, setPage] = useState(1);
  const [reloadKey, setReloadKey] = useState(0);
  const topRef = useRef(null);

  useEffect(() => {
    if (controlled) {
      setNews(items);
      setStatus("ready");
      return undefined;
    }

    // Ignore responses that arrive after the category changed (or on unmount),
    // so a slow earlier request can never overwrite the current list.
    let cancelled = false;
    setStatus("loading");
    setPage(1);
    const query = category ? `?category=${encodeURIComponent(category)}` : "";
    apiGet(`/news${query}`)
      .then(data => {
        if (cancelled) return;
        setNews(Array.isArray(data) ? data : []);
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
  }, [category, controlled, items, reloadKey]);

  const retry = useCallback(() => setReloadKey(k => k + 1), []);

  const changePage = useCallback(next => {
    setPage(next);
    topRef.current?.scrollIntoView({ block: "start" });
  }, []);

  if (status === "loading") {
    return <NewsGridSkeleton />;
  }

  if (status === "error") {
    return (
      <EmptyState
        className="news-state"
        icon={<i className="fa-solid fa-triangle-exclamation"></i>}
        title={t("news.load_error_title", "No pudimos cargar las noticias")}
        description={t(
          "news.load_error_desc",
          "Hubo un problema de conexión con el servidor. Inténtalo nuevamente en unos segundos.",
        )}
        action={
          <Button variant="outline" onClick={retry}>
            <i className="fa-solid fa-rotate-right" aria-hidden="true"></i>
            {t("news.retry")}
          </Button>
        }
      />
    );
  }

  if (news.length === 0) {
    return (
      <EmptyState
        className="news-state"
        icon={<i className="fa-regular fa-newspaper"></i>}
        title={t("news.empty_list_title", "Aún no hay publicaciones")}
        description={t("news.empty_category")}
        action={emptyAction}
      />
    );
  }

  const totalPages = pageCount(news.length, featureFirst);
  const current = Math.min(page, totalPages);
  const visible = pageSlice(news, current, featureFirst);
  const withLead = featureFirst && current === 1;

  return (
    <div className="news-grid" ref={topRef}>
      <ul className="news-feed" role="list">
        {visible.map((article, i) => (
          <li
            key={article.id}
            className={`news-feed__item${withLead && i === 0 ? " news-feed__item--lead" : ""}`}
          >
            <NewsCard article={article} lead={withLead && i === 0} />
          </li>
        ))}
      </ul>
      <Pagination
        currentPage={current}
        totalPages={totalPages}
        onPageChange={changePage}
        showFirstLast={false}
      />
    </div>
  );
}

NewsGrid.propTypes = {
  items: PropTypes.array,
  category: PropTypes.string,
  featureFirst: PropTypes.bool,
  emptyAction: PropTypes.node,
};
