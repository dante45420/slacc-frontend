import { useState } from "react";
import { Link } from "react-router-dom";
import PropTypes from "prop-types";
import { useTranslation } from "react-i18next";
import { Badge } from "../ui";
import { assetUrl } from "../../api/client";
import { formatTimestamp } from "../../utils/i18nLocale";
import { categoryBadge, categoryIcon, categoryLabel } from "./newsUtils";

/**
 * Article card built on the shared .news-grid-card styles.
 * `lead` renders the wide featured layout (image left, text right on wide screens).
 * `preview` renders a non-interactive copy (used by the admin editor).
 */
export default function NewsCard({ article, lead = false, preview = false, headingLevel = 3 }) {
  const { t, i18n } = useTranslation();
  const Heading = `h${headingLevel}`;
  const src = article.image_url ? assetUrl(article.image_url) : "";
  // A missing upload or an expired external URL falls back to the placeholder
  // instead of the browser's broken-image box.
  const [failedSrc, setFailedSrc] = useState("");
  const image = src && src !== failedSrc ? src : "";
  const date = article.created_at
    ? formatTimestamp(
        article.created_at,
        lead ? {} : { month: "short" },
        i18n.language,
      )
    : null;

  const inner = (
    <>
      <div className="news-card__media">
        {image ? (
          <img
            src={image}
            alt=""
            className="news-grid-card-media"
            loading={lead ? "eager" : "lazy"}
            decoding="async"
            onError={() => setFailedSrc(src)}
          />
        ) : (
          <div className="news-grid-card-placeholder news-card__placeholder" aria-hidden="true">
            <i className={`fa-solid ${categoryIcon(article.category)}`}></i>
          </div>
        )}
      </div>

      <div className="news-card__content">
        <div className="news-grid-card-body">
          {article.category && (
            <div className="news-grid-card-meta">
              <Badge variant={categoryBadge(article.category)} size="sm">
                {categoryLabel(t, article.category)}
              </Badge>
            </div>
          )}
          <Heading className="news-grid-card-title">
            {article.title || t("news.untitled", "Sin título")}
          </Heading>
          {article.excerpt && <p className="news-grid-card-excerpt">{article.excerpt}</p>}
        </div>

        <div className="news-grid-card-footer">
          <div className="news-card__byline">
            {date && (
              <time className="news-grid-card-time" dateTime={article.created_at}>
                {date}
              </time>
            )}
            {article.author_name && (
              <span className="news-grid-card-author">
                {t("news.by_author", { author: article.author_name })}
              </span>
            )}
          </div>
          {!preview && (
            <span className="news-grid-card-cta" aria-hidden="true">
              {t("news.read_more")}
              <i className="fa-solid fa-arrow-right"></i>
            </span>
          )}
        </div>
      </div>
    </>
  );

  return (
    <article
      className={`news-grid-card news-card${lead ? " news-card--lead" : ""}${
        preview ? " news-card--preview" : ""
      }`}
    >
      {preview ? (
        <div className="news-grid-link">{inner}</div>
      ) : (
        <Link to={`/noticias/${article.id}`} className="news-grid-link">
          {inner}
        </Link>
      )}
    </article>
  );
}

NewsCard.propTypes = {
  article: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    title: PropTypes.string,
    excerpt: PropTypes.string,
    image_url: PropTypes.string,
    category: PropTypes.string,
    created_at: PropTypes.string,
    author_name: PropTypes.string,
  }).isRequired,
  lead: PropTypes.bool,
  preview: PropTypes.bool,
  headingLevel: PropTypes.oneOf([2, 3, 4]),
};
