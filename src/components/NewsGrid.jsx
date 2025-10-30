import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import PropTypes from "prop-types";
import Card from "./ui/Card.jsx";
import Badge from "./ui/Badge.jsx";

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
      <div style={{ textAlign: "center", padding: "var(--spacing-6)" }}>
        <p style={{ color: "var(--color-muted)" }}>Cargando noticias...</p>
      </div>
    );
  }

  return (
    <div className="cards">
      {(news || []).map(n => (
        <Card
          key={n.id}
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
          footer={
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <span
                style={{ fontSize: "0.875rem", color: "var(--color-muted)" }}
              >
                {n.created_at
                  ? new Date(n.created_at).toLocaleDateString("es-ES", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })
                  : ""}
              </span>
              <Link to={`/noticias/${n.id}`} className="btn btn-outline btn-sm">
                Leer más →
              </Link>
            </div>
          }
        >
          <h3 style={{ marginBottom: "var(--spacing-2)" }}>{n.title}</h3>
          <p
            style={{
              color: "var(--color-muted)",
              marginBottom: 0,
              lineHeight: 1.6,
            }}
          >
            {n.excerpt}
          </p>
        </Card>
      ))}
    </div>
  );
}

NewsGrid.propTypes = {
  items: PropTypes.array,
  category: PropTypes.string,
};
