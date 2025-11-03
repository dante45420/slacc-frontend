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
      <div style={{ 
        textAlign: "center", 
        padding: "var(--spacing-8)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "var(--spacing-3)"
      }}>
        <Spinner size="lg" />
        <p style={{ color: "var(--color-muted)", margin: 0 }}>
          Cargando noticias...
        </p>
      </div>
    );
  }

  if (!news || news.length === 0) {
    return (
      <div style={{ 
        textAlign: "center", 
        padding: "var(--spacing-8)",
        background: "var(--color-bg-alt)",
        borderRadius: "var(--radius-lg)",
        border: "1px dashed var(--color-border)"
      }}>
        <p style={{ 
          color: "var(--color-muted)",
          fontSize: "1.1rem",
          margin: 0
        }}>
          No hay noticias disponibles en esta categoría.
        </p>
      </div>
    );
  }

  return (
    <Grid cols={3} gap="5">
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
        >
          <h3 style={{ 
            marginBottom: "var(--spacing-3)",
            fontSize: "1.25rem",
            lineHeight: "1.4",
            minHeight: "2.8em",
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            overflow: "hidden"
          }}>
            {n.title}
          </h3>
          
          <p style={{
            color: "var(--color-muted)",
            marginBottom: "var(--spacing-4)",
            lineHeight: "1.6",
            display: "-webkit-box",
            WebkitLineClamp: 3,
            WebkitBoxOrient: "vertical",
            overflow: "hidden"
          }}>
            {n.excerpt}
          </p>

          <div style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginTop: "auto",
            paddingTop: "var(--spacing-3)",
            borderTop: "1px solid var(--color-border)"
          }}>
            <time
              style={{ 
                fontSize: "0.875rem", 
                color: "var(--color-muted)",
                fontWeight: "500"
              }}
            >
              {formatDate(n.created_at)}
            </time>
            <Link 
              to={`/noticias/${n.id}`} 
              style={{
                color: "var(--color-primary)",
                textDecoration: "none",
                fontSize: "0.875rem",
                fontWeight: "600",
                display: "flex",
                alignItems: "center",
                gap: "4px",
                transition: "color var(--transition-fast)"
              }}
              onMouseEnter={(e) => e.target.style.color = "var(--color-secondary)"}
              onMouseLeave={(e) => e.target.style.color = "var(--color-primary)"}
            >
              Leer más
              {" "}
              <span style={{ fontSize: "1.1em" }}>→</span>
            </Link>
          </div>
        </Card>
      ))}
    </Grid>
  );
}

NewsGrid.propTypes = {
  items: PropTypes.array,
  category: PropTypes.string,
};
