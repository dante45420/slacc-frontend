import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Card, Badge, Spinner } from "./ui";
import PropTypes from "prop-types";

const BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";

const categoryLabels = {
  comunicados: "Comunicado",
  prensa: "Prensa",
  blog: "Blog",
};

const categoryVariants = {
  comunicados: "primary",
  prensa: "info",
  blog: "accent",
};

function getImageUrl(imageUrl) {
  if (!imageUrl) {
    return "https://images.unsplash.com/photo-1559757148-5c350d0d3c56?auto=format&fit=crop&w=400&q=80";
  }

  if (imageUrl.startsWith("http")) {
    return imageUrl;
  }

  return `${BASE_URL.replace("/api", "")}${imageUrl}`;
}

function formatDate(dateString) {
  if (!dateString) return "";

  try {
    const date = new Date(dateString);
    if (Number.isNaN(date.getTime())) {
      return "";
    }

    return date.toLocaleDateString("es-ES", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch (error) {
    console.error("Error formatting date:", error);
    return "";
  }
}

export default function NewsCarousel({ limit = 9, category }) {
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [index, setIndex] = useState(0);

  useEffect(() => {
    setLoading(true);
    const url = category
      ? `${BASE_URL}/news?category=${category}`
      : `${BASE_URL}/news`;
    fetch(url)
      .then(r => r.json())
      .then(data => {
        const filtered = (data || []).slice(0, limit);
        setNews(filtered);
      })
      .catch(() => {
        setNews([]);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [category, limit]);

  if (loading) {
    return (
      <div
        style={{
          textAlign: "center",
          padding: "var(--spacing-8)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "var(--spacing-3)",
        }}
      >
        <Spinner size="lg" />
        <p style={{ color: "var(--color-muted)", margin: 0 }}>
          Cargando noticias...
        </p>
      </div>
    );
  }

  if (!news || news.length === 0) {
    return (
      <div
        style={{
          textAlign: "center",
          padding: "var(--spacing-8)",
          background: "var(--color-bg-alt)",
          borderRadius: "var(--radius-lg)",
          border: "1px dashed var(--color-border)",
        }}
      >
        <p
          style={{
            color: "var(--color-muted)",
            fontSize: "1.1rem",
            margin: 0,
          }}
        >
          No hay noticias disponibles.
        </p>
      </div>
    );
  }

  // Group news into slides of 3
  const slides = [];
  for (let i = 0; i < news.length; i += 3) {
    slides.push(news.slice(i, i + 3));
  }

  const go = i => setIndex((i + slides.length) % slides.length);

  return (
    <div className="carousel" style={{ height: "auto", minHeight: "500px" }}>
      <div
        className="carousel-track"
        style={{ transform: `translateX(-${index * 100}%)` }}
      >
        {slides.map((slideNews, slideIdx) => (
          <div
            key={`slide-${slideIdx}`}
            className="carousel-slide"
            style={{
              height: "auto",
              minHeight: "500px",
              background: "transparent",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: "var(--spacing-6) var(--spacing-4)",
            }}
          >
            <div
              style={{
                display: "flex",
                gap: "var(--spacing-5)",
                width: "100%",
                maxWidth: "1200px",
                justifyContent: slideNews.length < 3 ? "center" : "flex-start",
              }}
            >
              {slideNews.map(article => (
                <Link
                  key={article.id}
                  to={`/noticias/${article.id}`}
                  style={{
                    textDecoration: "none",
                    color: "inherit",
                    flex:
                      slideNews.length === 3
                        ? "1"
                        : "0 0 calc(33.333% - var(--spacing-5))",
                    maxWidth:
                      slideNews.length === 3
                        ? "none"
                        : "calc(33.333% - var(--spacing-5))",
                  }}
                >
                  <Card
                    image={getImageUrl(article.image_url)}
                    imageAlt={article.title}
                    badge={
                      article.category && (
                        <Badge
                          variant={
                            categoryVariants[article.category] || "neutral"
                          }
                        >
                          {categoryLabels[article.category] || article.category}
                        </Badge>
                      )
                    }
                    hoverable
                    style={{
                      height: "100%",
                      display: "flex",
                      flexDirection: "column",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        height: "100%",
                      }}
                    >
                      <h3
                        style={{
                          marginBottom: "var(--spacing-3)",
                          fontSize: "1.25rem",
                          lineHeight: "1.4",
                          minHeight: "2.8em",
                          maxHeight: "2.8em",
                          display: "-webkit-box",
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: "vertical",
                          overflow: "hidden",
                        }}
                      >
                        {article.title}
                      </h3>

                      <p
                        style={{
                          color: "var(--color-muted)",
                          marginBottom: "var(--spacing-4)",
                          lineHeight: "1.6",
                          minHeight: "4.8em",
                          maxHeight: "4.8em",
                          display: "-webkit-box",
                          WebkitLineClamp: 3,
                          WebkitBoxOrient: "vertical",
                          overflow: "hidden",
                        }}
                      >
                        {article.excerpt}
                      </p>

                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          marginTop: "auto",
                          paddingTop: "var(--spacing-3)",
                          borderTop: "1px solid var(--color-border)",
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            flexDirection: "column",
                            gap: "4px",
                          }}
                        >
                          <time
                            style={{
                              fontSize: "0.875rem",
                              color: "var(--color-muted)",
                              fontWeight: "500",
                            }}
                          >
                            {formatDate(article.created_at)}
                          </time>
                          {article.author_name && (
                            <span
                              style={{
                                fontSize: "0.8rem",
                                color: "var(--color-text-secondary)",
                                fontWeight: "500",
                              }}
                            >
                              Por {article.author_name}
                            </span>
                          )}
                        </div>
                        <span
                          style={{
                            color: "var(--color-primary)",
                            fontSize: "0.875rem",
                            fontWeight: "600",
                            display: "flex",
                            alignItems: "center",
                            gap: "4px",
                          }}
                        >
                          Leer más <i className="fa-solid fa-arrow-right"></i>
                        </span>
                      </div>
                    </div>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        ))}
      </div>
      <div className="carousel-nav">
        <button
          aria-label="Anterior"
          className="carousel-btn"
          onClick={() => go(index - 1)}
        >
          <i className="fa-solid fa-chevron-left"></i>
        </button>
        <button
          aria-label="Siguiente"
          className="carousel-btn"
          onClick={() => go(index + 1)}
        >
          <i className="fa-solid fa-chevron-right"></i>
        </button>
      </div>
      <div className="carousel-dots">
        {slides.map((slideNews, i) => (
          <button
            key={`dot-slide-${slideNews[0]?.id || i}`}
            className={`carousel-dot ${i === index ? "active" : ""}`}
            onClick={() => setIndex(i)}
            aria-label={`Ir a slide ${i + 1}`}
          />
        ))}
      </div>
    </div>
  );
}

NewsCarousel.propTypes = {
  limit: PropTypes.number,
  category: PropTypes.string,
};
