import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import PropTypes from "prop-types";
import { Card, Badge, Spinner, Grid } from "./ui";

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

export default function NewsGrid({ items = [], category }) {
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
          No hay noticias disponibles en esta categoría.
        </p>
      </div>
    );
  }

  return (
    <Grid cols={3} gap="5">
      {(news || []).map(n => (
        <Link
          key={n.id}
          to={`/noticias/${n.id}`}
          style={{ textDecoration: "none", color: "inherit" }}
        >
          <Card
            image={getImageUrl(n.image_url)}
            imageAlt={n.title}
            badge={
              n.category && (
                <Badge variant={categoryVariants[n.category] || "neutral"}>
                  {categoryLabels[n.category] || n.category}
                </Badge>
              )
            }
            hoverable
            style={{ height: "100%", display: "flex", flexDirection: "column" }}
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
                {n.title}
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
                {n.excerpt}
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
                    {formatDate(n.created_at)}
                  </time>
                  {n.author_name && (
                    <span
                      style={{
                        fontSize: "0.8rem",
                        color: "var(--color-text-secondary)",
                        fontWeight: "500",
                      }}
                    >
                      Por {n.author_name}
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
    </Grid>
  );
}

NewsGrid.propTypes = {
  items: PropTypes.array,
  category: PropTypes.string,
};
