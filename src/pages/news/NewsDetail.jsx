import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../auth/AuthContext";
import {
  Section,
  Container,
  Button,
  Badge,
  Card,
  Grid,
  Spinner,
  useToast,
} from "../../components/ui";
import { sanitizeHtml } from "../../utils/sanitize";

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

function getStatusLabel(status) {
  if (status === "published") return "Publicada";
  if (status === "pending") return "Pendiente";
  return "Rechazada";
}

function getCategoryBadgeVariant(category) {
  if (category === "comunicados") return "primary";
  if (category === "prensa") return "info";
  return "accent";
}

function getCategoryLabel(category) {
  if (category === "comunicados") return "Comunicado";
  if (category === "prensa") return "Prensa";
  return "Blog";
}

function getStatusBadgeVariant(status) {
  if (status === "published") return "success";
  if (status === "pending") return "warning";
  return "error";
}

function formatDate(dateString) {
  if (!dateString) return "Fecha no disponible";

  try {
    const date = new Date(dateString);
    if (Number.isNaN(date.getTime())) {
      return "Fecha no disponible";
    }

    return date.toLocaleDateString("es-ES", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  } catch (error) {
    console.error("Error formatting date:", error);
    return "Fecha no disponible";
  }
}

export default function NewsDetail() {
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
          <div style={{ textAlign: "center", padding: "var(--spacing-8)" }}>
            <Spinner size="lg" />
            <p
              style={{
                marginTop: "var(--spacing-4)",
                color: "var(--color-muted)",
              }}
            >
              Cargando noticia...
            </p>
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
            <h2 style={{ color: "var(--color-error)" }}>Error</h2>
            <p style={{ marginBottom: "var(--spacing-4)" }}>{error}</p>
            <Button
              variant="outline"
              onClick={() => globalThis.location.reload()}
            >
              Reintentar
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
            <h2>Noticia no encontrada</h2>
            <p style={{ marginBottom: "var(--spacing-4)" }}>
              La noticia que buscas no existe o ha sido eliminada.
            </p>
            <Link to="/noticias">
              <Button variant="primary">Volver a noticias</Button>
            </Link>
          </Card>
        </Container>
      </Section>
    );
  }

  return (
    <Section variant="default" padding="lg">
      <Container size="lg">
        <article style={{ maxWidth: "900px", margin: "0 auto" }}>
          {/* Header */}
          <header style={{ marginBottom: "var(--spacing-6)" }}>
            <div
              className="flex justify-between align-start gap-4 mb-5"
              style={{ flexWrap: "wrap" }}
            >
              <div style={{ flex: "1 1 auto" }}>
                {/* Category Badge */}
                {news.category && (
                  <Badge
                    variant={getCategoryBadgeVariant(news.category)}
                    style={{ marginBottom: "var(--spacing-3)" }}
                  >
                    {getCategoryLabel(news.category)}
                  </Badge>
                )}

                {/* Title */}
                <h1
                  style={{
                    fontSize: "2.5rem",
                    lineHeight: "1.2",
                    marginBottom: "var(--spacing-3)",
                    color: "var(--color-text)",
                  }}
                >
                  {news.title}
                </h1>

                {/* Meta information */}
                <div
                  className="flex align-center gap-3"
                  style={{ flexWrap: "wrap" }}
                >
                  <Badge variant={getStatusBadgeVariant(news.status)}>
                    {getStatusLabel(news.status)}
                  </Badge>
                  <time
                    dateTime={news.created_at}
                    style={{ color: "var(--color-muted)", fontSize: "0.95rem" }}
                  >
                    {formatDate(news.created_at)}
                  </time>
                </div>
              </div>

              {/* Admin actions */}
              {user?.role === "admin" && (
                <div
                  className="flex gap-2"
                  style={{ flexShrink: 0, alignSelf: "flex-start" }}
                >
                  {news.status === "pending" && (
                    <>
                      <Button variant="primary" size="sm" onClick={approveNews}>
                        Aprobar
                      </Button>
                      <Button variant="outline" size="sm" onClick={rejectNews}>
                        Rechazar
                      </Button>
                    </>
                  )}
                  {news.status === "published" && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => navigate(`/admin/news/${news.id}/edit`)}
                    >
                      Editar
                    </Button>
                  )}
                </div>
              )}
            </div>
          </header>

          {/* Featured image */}
          {news.image_url && (
            <div
              style={{
                marginBottom: "var(--spacing-7)",
                borderRadius: "var(--radius-lg)",
                overflow: "hidden",
                boxShadow: "var(--shadow-md)",
              }}
            >
              <img
                src={getImageUrl(news.image_url)}
                alt={news.title}
                style={{
                  width: "100%",
                  maxHeight: "500px",
                  objectFit: "cover",
                  display: "block",
                }}
              />
            </div>
          )}

          {/* Excerpt */}
          {news.excerpt && (
            <div
              style={{
                marginBottom: "var(--spacing-7)",
                padding: "var(--spacing-5)",
                background: "var(--color-bg-alt)",
                borderLeft: "4px solid var(--color-primary)",
                borderRadius: "var(--radius-base)",
              }}
            >
              <p
                style={{
                  fontSize: "1.25rem",
                  lineHeight: "1.7",
                  margin: 0,
                  color: "var(--color-text)",
                  fontWeight: "500",
                }}
              >
                {news.excerpt}
              </p>
            </div>
          )}

          {/* Content */}
          <div
            className="news-content-body"
            style={{
              fontSize: "1.1rem",
              lineHeight: "1.8",
              color: "var(--color-text)",
              marginBottom: "var(--spacing-7)",
            }}
          >
            {news.content ? (
              <div
                dangerouslySetInnerHTML={{ __html: sanitizeHtml(news.content) }}
              />
            ) : (
              <p style={{ color: "var(--color-muted)" }}>
                Contenido de la noticia no disponible.
              </p>
            )}
          </div>

          {/* Navigation */}
          <div
            className="flex justify-between gap-4 mb-7"
            style={{
              paddingTop: "var(--spacing-6)",
              borderTop: "1px solid var(--color-border)",
              flexWrap: "wrap",
            }}
          >
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
            <div
              style={{
                paddingTop: "var(--spacing-6)",
                borderTop: "1px solid var(--color-border)",
              }}
            >
              <h2
                style={{
                  marginBottom: "var(--spacing-5)",
                  fontSize: "1.75rem",
                }}
              >
                Más noticias
              </h2>
              <Grid cols={3} gap="4">
                {more.map(n => (
                  <Card
                    key={n.id}
                    image={getImageUrl(n.image_url)}
                    imageAlt={n.title}
                    hoverable
                  >
                    <h4
                      style={{
                        marginBottom: "var(--spacing-2)",
                        fontSize: "1.1rem",
                        lineHeight: "1.4",
                      }}
                    >
                      {n.title}
                    </h4>
                    <p
                      style={{
                        color: "var(--color-muted)",
                        marginBottom: "var(--spacing-3)",
                        fontSize: "0.95rem",
                        lineHeight: "1.6",
                      }}
                    >
                      {n.excerpt}
                    </p>
                    <Link to={`/noticias/${n.id}`}>
                      <Button variant="outline" size="sm">
                        Leer más <i className="fa-solid fa-arrow-right"></i>
                      </Button>
                    </Link>
                  </Card>
                ))}
              </Grid>
            </div>
          )}
        </article>
      </Container>
    </Section>
  );
}
