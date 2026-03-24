import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { Card, Badge, Spinner } from "./ui";
import PropTypes from "prop-types";
import useMediaQuery from "../hooks/useMediaQuery.js";

const BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";

const categoryLabels = {
  "articulos-cientificos": "Artículos científicos",
  "articulos-destacados": "Artículos destacados",
  editoriales: "Editoriales",
};

const categoryVariants = {
  "articulos-cientificos": "accent",
  "articulos-destacados": "primary",
  editoriales: "info",
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

export default function NewsCarousel({ limit = 9, category, excludeId }) {
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [index, setIndex] = useState(0);
  const trackRef = useRef(null);
  const isMobile = useMediaQuery("(max-width: 768px)");
  const itemsPerSlide = isMobile ? 1 : 3;

  useEffect(() => {
    setLoading(true);
    const url = category
      ? `${BASE_URL}/news?category=${category}`
      : `${BASE_URL}/news`;
    fetch(url)
      .then(r => r.json())
      .then(data => {
        let filtered = data || [];
        if (excludeId) {
          filtered = filtered.filter(article => article.id !== excludeId);
        }
        setNews(filtered.slice(0, limit));
      })
      .catch(() => {
        setNews([]);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [category, limit, excludeId]);

  // Group news into slides (1 on mobile, 3 on desktop)
  const slides = [];
  for (let i = 0; i < news.length; i += itemsPerSlide) {
    slides.push(news.slice(i, i + itemsPerSlide));
  }

  useEffect(() => {
    if (index >= slides.length && slides.length > 0) {
      setIndex(0);
    }
  }, [index, slides.length]);

  useEffect(() => {
    if (trackRef.current) {
      trackRef.current.style.transform = `translateX(-${index * 100}%)`;
    }
  }, [index]);

  const slideKeys = slides.map(
    slideNews => `news-slide-${slideNews.map(article => article.id).join("-")}`,
  );

  if (loading) {
    return (
      <div className="news-grid-status">
        <Spinner size="lg" />
        <p className="news-grid-status-text">Cargando noticias...</p>
      </div>
    );
  }

  if (!news || news.length === 0) {
    return (
      <div className="news-grid-empty-state">
        <p className="news-grid-empty-text">No hay noticias disponibles.</p>
      </div>
    );
  }

  const go = i => setIndex((i + slides.length) % slides.length);

  return (
    <div className="carousel news-carousel">
      <div className="carousel-track" ref={trackRef}>
        {slides.map((slideNews, slideIdx) => (
          <div
            key={slideKeys[slideIdx]}
            className="carousel-slide news-carousel-slide"
          >
            <div className="news-carousel-container">
              {slideNews.map(article => (
                <Link
                  key={article.id}
                  to={`/noticias/${article.id}`}
                  className={`news-grid-link news-carousel-link ${
                    slideNews.length === 3
                      ? "news-carousel-link-fill"
                      : "news-carousel-link-fixed"
                  }`}
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
                    className="news-grid-card"
                  >
                    <div className="news-grid-card-body">
                      <h3 className="news-grid-card-title">{article.title}</h3>

                      <p className="news-grid-card-excerpt">
                        {article.excerpt}
                      </p>

                      <div className="news-grid-card-footer">
                        <div className="news-grid-card-meta">
                          <time className="news-grid-card-time">
                            {formatDate(article.created_at)}
                          </time>
                          {article.author_name && (
                            <span className="news-grid-card-author">
                              Por {article.author_name}
                            </span>
                          )}
                        </div>
                        <span className="news-grid-card-cta">
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
            key={`dot-${slideKeys[i]}`}
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
  excludeId: PropTypes.number,
};
