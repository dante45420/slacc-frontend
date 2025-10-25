import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import PropTypes from "prop-types";

const BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";

function getImageUrl(imageUrl) {
  if (!imageUrl) {
    // Imagen por defecto relacionada con paper científico
    return "https://images.unsplash.com/photo-1559757148-5c350d0d3c56?auto=format&fit=crop&w=400&q=80";
  }

  // Si es una URL completa, usarla tal como está
  if (imageUrl.startsWith("http")) {
    return imageUrl;
  }

  // Si es un path relativo, construir la URL completa del backend
  return `${BASE_URL.replace("/api", "")}${imageUrl}`;
}

export default function NewsGrid({ items = [], category }) {
  const [news, setNews] = useState(items);

  useEffect(() => {
    // Si nos pasan items con contenido, usamos esos y no hacemos fetch
    if (items && items.length > 0) {
      setNews(items);
      return;
    }

    // Hacer fetch solo si no tenemos items
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
      });
  }, [category, items.length]); // Depender de category y la longitud de items

  return (
    <div className="cards">
      {(news || []).map(n => (
        <div key={n.id} className="card">
          {n.image_url && (
            <img
              src={getImageUrl(n.image_url)}
              alt={n.title}
              style={{
                borderRadius: "8px",
                marginBottom: 12,
                width: "100%",
                height: "200px",
                objectFit: "cover",
              }}
            />
          )}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <h3 style={{ margin: 0 }}>{n.title}</h3>
            {n.category && (
              <span
                style={{
                  background: "var(--color-accent)",
                  color: "white",
                  padding: "2px 8px",
                  borderRadius: 12,
                  fontSize: "0.8em",
                }}
              >
                {n.category}
              </span>
            )}
          </div>
          <p style={{ color: "var(--color-muted)" }}>{n.excerpt}</p>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <span style={{ fontSize: "0.9em", color: "var(--color-muted)" }}>
              {n.created_at
                ? new Date(n.created_at).toLocaleDateString("es-ES")
                : ""}
            </span>
            <Link to={`/noticias/${n.id}`} className="btn btn-outline">
              Leer más
            </Link>
          </div>
        </div>
      ))}
    </div>
  );
}

NewsGrid.propTypes = {
  items: PropTypes.array,
  category: PropTypes.string,
};
