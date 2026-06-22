import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import PropTypes from "prop-types";
import { Card, Badge, Spinner, Grid } from "./ui";
import { formatDate as formatLocaleDate } from "../utils/i18nLocale";

const BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";

function getImageUrl(imageUrl) {
  if (!imageUrl) {
    return "https://images.unsplash.com/photo-1559757148-5c350d0d3c56?auto=format&fit=crop&w=400&q=80";
  }

  if (imageUrl.startsWith("http")) {
    return imageUrl;
  }

  return `${BASE_URL.replace("/api", "")}${imageUrl}`;
}

const categoryVariants = {
  "articulos-cientificos": "accent",
  "articulos-destacados": "primary",
  editoriales: "info",
};

const categoryKeys = {
  "articulos-cientificos": "news.tab_scientific",
  "articulos-destacados": "news.tab_featured",
  editoriales: "news.tab_editorials",
};

function formatNewsDate(dateString) {
  if (!dateString) return "";

  try {
    const date = new Date(dateString);
    if (Number.isNaN(date.getTime())) {
      return "";
    }

    return formatLocaleDate(dateString, {
      month: "short",
    });
  } catch (error) {
    console.error("Error formatting date:", error);
    return "";
  }
}

export default function NewsGrid({ items = [], category }) {
  const { t } = useTranslation();
  const [news, setNews] = useState(items);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (items && items.length > 0) {
      setNews(items);
      return;
    }

    setLoading(true);
    const url = category
      ? `${BASE_URL}/news?category=${category}`
      : `${BASE_URL}/news`;
    fetch(url)
      .then(r => r.json())
      .then(data => {
        setNews(data);
      })
      .catch(() => {
        setNews([]);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [category, items.length]);

  if (loading) {
    return (
      <div className="news-grid-status">
        <Spinner size="lg" />
        <p className="news-grid-status-text">{t("news.loading")}</p>
      </div>
    );
  }

  if (!news || news.length === 0) {
    return (
      <div className="news-grid-empty-state">
        <p className="news-grid-empty-text">{t("news.empty_category")}</p>
      </div>
    );
  }

  return (
    <Grid columns={3} gap={5}>
      {(news || []).map(n => (
        <Link key={n.id} to={`/noticias/${n.id}`} className="news-grid-link">
          <Card
            image={getImageUrl(n.image_url)}
            imageAlt={n.title}
            badge={
              n.category && (
                <Badge variant={categoryVariants[n.category] || "neutral"}>
                  {t(categoryKeys[n.category] || n.category, n.category)}
                </Badge>
              )
            }
            hoverable
            className="news-grid-card"
          >
            <div className="news-grid-card-body">
              <h3 className="news-grid-card-title">{n.title}</h3>

              <p className="news-grid-card-excerpt">{n.excerpt}</p>

              <div className="news-grid-card-footer">
                <div className="news-grid-card-meta">
                  <time className="news-grid-card-time">
                    {formatNewsDate(n.created_at)}
                  </time>
                  {n.author_name && (
                    <span className="news-grid-card-author">
                      {t("news.by_author", { author: n.author_name })}
                    </span>
                  )}
                </div>
                <span className="news-grid-card-cta">
                  {t("news.read_more")}{" "}
                  <i className="fa-solid fa-arrow-right"></i>
                </span>
              </div>
            </div>
          </Card>
        </Link>
      ))}
    </Grid>
  );
}

NewsGrid.propTypes = {
  items: PropTypes.array,
  category: PropTypes.string,
};
