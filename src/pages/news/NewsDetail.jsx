import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuth } from "../../auth/AuthContext";
import {
  Section,
  Container,
  Button,
  Badge,
  Card,
  Spinner,
  useToast,
} from "../../components/ui";
import NewsCarousel from "../../components/NewsCarousel.jsx";
import { sanitizeHtml } from "../../utils/sanitize";
import { formatDate as formatLocaleDate } from "../../utils/i18nLocale";

const BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";

function getImageUrl(imageUrl) {
  if (!imageUrl) {
    return "https://images.unsplash.com/photo-1559757148-5c350d0d3c56?auto=format&fit=crop&w=800&q=80";
  }

  if (imageUrl.startsWith("http")) {
    return imageUrl;
  }

  return `${BASE_URL.replace("/api", "")}${imageUrl}`;
}

function getStatusColor(status) {
  if (status === "published") return "var(--color-secondary)";
  if (status === "pending") return "var(--color-accent)";
  return "var(--color-muted)";
}

function getCategoryLabel(category, t) {
  if (category === "articulos-cientificos") return t("news.tab_scientific");
  if (category === "articulos-destacados") return t("news.tab_featured");
  if (category === "editoriales") return t("news.tab_editorials");
  return category;
}

function getCategoryBadgeVariant(category) {
  if (category === "articulos-destacados") return "primary";
  if (category === "editoriales") return "info";
  return "accent";
}

function getStatusBadgeVariant(status) {
  if (status === "published") return "success";
  if (status === "pending") return "warning";
  return "error";
}

function getStatusLabel(status, t) {
  if (status === "published") return t("news.status_published");
  if (status === "pending") return t("news.status_pending");
  return t("news.status_rejected");
}

function formatDate(dateString, t) {
  if (!dateString) return t("news.date_unavailable");

  try {
    const date = new Date(dateString);
    if (Number.isNaN(date.getTime())) {
      return t("news.date_unavailable");
    }

    return formatLocaleDate(dateString) || t("news.date_unavailable");
  } catch (error) {
    console.error("Error formatting date:", error);
    return t("news.date_unavailable");
  }
}

export default function NewsDetail() {
  const { t } = useTranslation();
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const toast = useToast();
  const [news, setNews] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [more, setMore] = useState([]);
  const [prevNext, setPrevNext] = useState({ prev: null, next: null });

  async function loadNews() {
    try {
      setLoading(true);
      const token = localStorage.getItem("access_token");

      const headers = {};
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }

      const response = await fetch(`${BASE_URL}/news/${id}`, { headers });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Error response:", errorText);
        throw new Error(`Error ${response.status}: ${errorText}`);
      }

      const data = await response.json();
      setNews(data);
      // Cargar más noticias y calcular anterior/siguiente
      try {
        const listRes = await fetch(`${BASE_URL}/news`);
        const list = await listRes.json();
        setMore(list.filter(n => n.id !== data.id).slice(0, 6));
        const idx = list.findIndex(n => n.id === data.id);
        setPrevNext({
          prev: idx > 0 ? list[idx - 1] : null,
          next: idx >= 0 && idx < list.length - 1 ? list[idx + 1] : null,
        });
      } catch (e) {
        console.error("Error loading news list:", e);
      }
    } catch (err) {
      console.error("Error cargando noticia:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (id) {
      loadNews();
    }
  }, [id, user]);

  async function approveNews() {
    try {
      const token = localStorage.getItem("access_token");
      const response = await fetch(`${BASE_URL}/admin/news/${id}/approve`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        toast.success("Noticia aprobada correctamente");
        await loadNews(); // recargar noticia
      } else {
        toast.error("Error al aprobar la noticia");
      }
    } catch (err) {
      console.error("Error al aprobar:", err);
      toast.error("Error al aprobar la noticia");
    }
  }

  async function rejectNews() {
    try {
      const token = localStorage.getItem("access_token");
      const response = await fetch(`${BASE_URL}/admin/news/${id}/reject`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        toast.success("Noticia rechazada");
        await loadNews(); // recargar noticia
      } else {
        toast.error("Error al rechazar la noticia");
      }
    } catch (err) {
      console.error("Error al rechazar:", err);
      toast.error("Error al rechazar la noticia");
    }
  }

  if (loading) {
    return (
      <Section variant="default" padding="lg">
        <Container size="default">
          <div className="news-detail-loading">
            <Spinner size="lg" />
            <p className="news-detail-loading-text">{t("news.detail_loading")}</p>
          </div>
        </Container>
      </Section>
    );
  }

  if (error) {
    return (
      <Section variant="default" padding="lg">
        <Container size="default">
          <Card>
            <h2 className="news-detail-error-title">{t("news.error_title")}</h2>
            <p className="news-detail-error-text">{error}</p>
            <Button
              variant="outline"
              onClick={() => globalThis.location.reload()}
            >
              {t("news.retry")}
            </Button>
          </Card>
        </Container>
      </Section>
    );
  }

  if (!news) {
    return (
      <Section variant="default" padding="lg">
        <Container size="default">
          <Card>
            <h2>{t("news.not_found")}</h2>
            <p className="news-detail-error-text">{t("news.not_found_desc")}</p>
            <Link to="/noticias">
              <Button variant="primary">{t("news.back_to_news")}</Button>
            </Link>
          </Card>
        </Container>
      </Section>
    );
  }

  return (
    <Section variant="default" padding="lg">
      <Container size="lg">
        <article className="news-detail-article">
          {/* Back to Admin button for admins */}
          {user?.role === "admin" && (
            <div className="mb-4">
              <Button
                variant="outline"
                onClick={() => navigate("/admin?tab=news")}
              >
                <i className="fa-solid fa-arrow-left"></i> {t("news.back_admin")}
              </Button>
            </div>
          )}

          {/* Header */}
          <header className="news-detail-header">
            <div className="flex justify-between align-start gap-4 mb-5 flex-wrap">
              <div className="news-detail-title-wrap">
                {/* Category Badge */}
                {news.category && (
                  <Badge
                    variant={getCategoryBadgeVariant(news.category)}
                    className="mb-3"
                  >
                    {getCategoryLabel(news.category, t)}
                  </Badge>
                )}

                {/* Title */}
                <h1 className="news-detail-title">{news.title}</h1>

                {/* Meta information */}
                <div className="flex align-center gap-3 flex-wrap">
                  <Badge variant={getStatusBadgeVariant(news.status)}>
                    {getStatusLabel(news.status, t)}
                  </Badge>
                  <time
                    dateTime={news.created_at}
                    className="news-detail-meta-text"
                  >
                    {formatDate(news.created_at, t)}
                  </time>
                  {news.author_name && (
                    <span className="news-detail-meta-text">
                      {t("news.by_author", { author: news.author_name })}
                    </span>
                  )}
                </div>
              </div>

              {/* Admin actions */}
              {user?.role === "admin" && (
                <div className="flex gap-2 news-detail-admin-actions">
                  {news.status === "pending" && (
                    <>
                      <Button variant="primary" size="sm" onClick={approveNews}>
                        {t("news.approve")}
                      </Button>
                      <Button variant="outline" size="sm" onClick={rejectNews}>
                        {t("news.reject")}
                      </Button>
                    </>
                  )}
                  {news.status === "published" && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => navigate(`/admin/news/${news.id}/edit`)}
                    >
                      {t("news.edit")}
                    </Button>
                  )}
                </div>
              )}
            </div>
          </header>

          {/* Featured image */}
          {news.image_url && (
            <div className="news-detail-image-wrap">
              <img
                src={getImageUrl(news.image_url)}
                alt={news.title}
                className="news-detail-image"
              />
            </div>
          )}

          {/* Excerpt */}
          {news.excerpt && (
            <div className="news-detail-excerpt-wrap">
              <p className="news-detail-excerpt">{news.excerpt}</p>
            </div>
          )}

          {/* Content */}
          <div className="news-content-body news-detail-content">
            {news.content ? (
              <div
                dangerouslySetInnerHTML={{ __html: sanitizeHtml(news.content) }}
              />
            ) : (
              <p className="text-muted">{t("news.content_unavailable")}</p>
            )}
          </div>

          {/* Navigation */}
          <div className="flex justify-between gap-4 mb-7 news-detail-nav flex-wrap">
            <div>
              {prevNext.prev && (
                <Link to={`/noticias/${prevNext.prev.id}`}>
                  <Button variant="outline" size="sm">
                    <i className="fa-solid fa-arrow-left"></i>{" "}
                    {prevNext.prev.title.length > 30
                      ? prevNext.prev.title.substring(0, 30) + "..."
                      : prevNext.prev.title}
                  </Button>
                </Link>
              )}
            </div>
            <div>
              {prevNext.next && (
                <Link to={`/noticias/${prevNext.next.id}`}>
                  <Button variant="outline" size="sm">
                    {prevNext.next.title.length > 30
                      ? prevNext.next.title.substring(0, 30) + "..."
                      : prevNext.next.title}{" "}
                    <i className="fa-solid fa-arrow-right"></i>
                  </Button>
                </Link>
              )}
            </div>
          </div>

          {/* Related news */}
          {more.length > 0 && (
            <div className="news-detail-more">
              <h2 className="news-detail-more-title">{t("news.related_title")}</h2>
              <NewsCarousel limit={9} excludeId={news?.id} />
            </div>
          )}
        </article>
      </Container>
    </Section>
  );
}
