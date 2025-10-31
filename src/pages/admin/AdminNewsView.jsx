import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../../auth/AuthContext";
import {
  Section,
  Container,
  Card,
  Badge,
  Button,
  Alert,
  Spinner,
  useToast,
} from "../../components/ui";

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

function getStatusVariant(status) {
  switch (status) {
    case "published":
      return "success";
    case "pending":
      return "warning";
    case "rejected":
      return "error";
    default:
      return "default";
  }
}

function getStatusLabel(status) {
  if (status === "published") return "Publicada";
  if (status === "pending") return "Pendiente";
  return "Rechazada";
}

export default function AdminNewsView() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const toast = useToast();
  const [news, setNews] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function loadNews() {
      try {
        setLoading(true);
        const token = localStorage.getItem("access_token");
        const response = await fetch(`${BASE_URL}/admin/news/${id}/view`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!response.ok) {
          throw new Error(`Error ${response.status}: Noticia no encontrada`);
        }

        const data = await response.json();
        setNews(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    if (id) {
      loadNews();
    }
  }, [id]);

  async function approveNews() {
    try {
      const token = localStorage.getItem("access_token");
      const response = await fetch(`${BASE_URL}/admin/news/${id}/approve`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        toast.success("Noticia aprobada y publicada correctamente");
        navigate("/admin");
      } else {
        toast.error("Error al aprobar la noticia");
      }
    } catch (err) {
      toast.error("Error al aprobar la noticia");
      console.error("Error al aprobar:", err);
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
        navigate("/admin");
      } else {
        toast.error("Error al rechazar la noticia");
      }
    } catch (err) {
      toast.error("Error al rechazar la noticia");
      console.error("Error al rechazar:", err);
    }
  }

  if (loading) {
    return (
      <Section>
        <Container>
          <div className="flex-center" style={{ minHeight: "400px" }}>
            <Spinner size="large" />
          </div>
        </Container>
      </Section>
    );
  }

  if (error) {
    return (
      <Section>
        <Container>
          <Alert variant="error" title="Error">
            {error}
          </Alert>
          <div className="flex-center mt-4">
            <Button variant="outline" onClick={() => navigate("/admin")}>
              Volver al admin
            </Button>
          </div>
        </Container>
      </Section>
    );
  }

  if (!news) {
    return (
      <Section>
        <Container>
          <Alert variant="warning" title="No encontrada">
            La noticia solicitada no existe.
          </Alert>
          <div className="flex-center mt-4">
            <Button variant="outline" onClick={() => navigate("/admin")}>
              Volver al admin
            </Button>
          </div>
        </Container>
      </Section>
    );
  }

  return (
    <Section>
      <Container>
        <Card>
          <div className="flex-between mb-6">
            <div>
              <h1 className="mb-2">{news.title}</h1>
              <div className="flex-start gap-3">
                <Badge variant={getStatusVariant(news.status)}>
                  {getStatusLabel(news.status)}
                </Badge>
                <span className="text-muted">
                  {new Date(news.created_at).toLocaleDateString("es-ES", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </span>
              </div>
            </div>

            {user?.role === "admin" && (
              <div className="flex-start gap-2">
                {news.status === "pending" && (
                  <>
                    <Button variant="primary" onClick={approveNews}>
                      Aprobar
                    </Button>
                    <Button variant="outline" onClick={rejectNews}>
                      Rechazar
                    </Button>
                  </>
                )}
                {news.status === "published" && (
                  <Button
                    variant="outline"
                    onClick={() => navigate(`/admin/news/${news.id}/edit`)}
                  >
                    Editar
                  </Button>
                )}
                <Button variant="outline" onClick={() => navigate("/admin")}>
                  Volver
                </Button>
              </div>
            )}
          </div>

          {news.image_url && (
            <div className="mb-6">
              <img
                src={getImageUrl(news.image_url)}
                alt={news.title}
                style={{
                  width: "100%",
                  maxHeight: "400px",
                  objectFit: "cover",
                  borderRadius: "var(--radius-lg)",
                }}
              />
            </div>
          )}

          {news.excerpt && (
            <Card variant="outline" className="mb-6 p-4">
              <h3 className="text-primary mb-2">Resumen</h3>
              <p className="text-lg">{news.excerpt}</p>
            </Card>
          )}

          <div>
            <h3 className="mb-4">Contenido completo</h3>
            {news.content ? (
              <div
                dangerouslySetInnerHTML={{ __html: news.content }}
                style={{ lineHeight: 1.8 }}
              />
            ) : (
              <p className="text-muted">
                Contenido de la noticia no disponible.
              </p>
            )}
          </div>
        </Card>
      </Container>
    </Section>
  );
}
