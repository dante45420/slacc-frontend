import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../../auth/AuthContext";
import {
  Section,
  Container,
  Card,
  Input,
  Textarea,
  Button,
  Spinner,
  useToast,
} from "../../components/ui";

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

export default function EditNews() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const toast = useToast();
  const [news, setNews] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);

  // Form state
  const [title, setTitle] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [content, setContent] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [currentImage, setCurrentImage] = useState("");

  useEffect(() => {
    async function loadNews() {
      try {
        setLoading(true);
        const token = localStorage.getItem("access_token");
        const response = await fetch(`${BASE_URL}/news/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!response.ok) {
          throw new Error("Noticia no encontrada");
        }
        const data = await response.json();
        setNews(data);

        // Llenar el formulario
        setTitle(data.title || "");
        setExcerpt(data.excerpt || "");
        setContent(data.content || "");
        setCurrentImage(data.image_url || "");
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

  async function handleSubmit(e) {
    e.preventDefault();
    if (!user || user.role !== "admin") return;

    setSaving(true);
    try {
      const formData = new FormData();
      formData.append("title", title);
      formData.append("excerpt", excerpt);
      formData.append("content", content);
      if (imageFile) {
        formData.append("image", imageFile);
      }

      const token = localStorage.getItem("access_token");
      const response = await fetch(`${BASE_URL}/admin/news/${id}/edit`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Error al actualizar la noticia");
      }

      toast.success("Noticia actualizada correctamente");
      navigate(`/noticias/${id}`);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  }

  if (loading && !title) {
    return (
      <Section variant="default" padding="lg">
        <Container size="lg">
          <div className="flex-center min-h-400">
            <Spinner size="lg" />
          </div>
        </Container>
      </Section>
    );
  }

  if (error) {
    return (
      <Section variant="default" padding="lg">
        <Container>
          <h2>Error</h2>
          <p>{error}</p>
        </Container>
      </Section>
    );
  }

  if (!news) {
    return (
      <Section variant="default" padding="lg">
        <Container>
          <h2>Noticia no encontrada</h2>
        </Container>
      </Section>
    );
  }

  return (
    <Section variant="default" padding="lg">
      <Container size="lg">
        <div className="form-wrapper-centered">
          <div className="mb-6">
            <Button
              variant="outline"
              onClick={() => navigate(`/noticias/${id}`)}
              className="mb-4"
            >
              <i className="fa-solid fa-arrow-left"></i> Volver a la noticia
            </Button>
            <h1 className="mb-2">Editar noticia</h1>
          </div>

          <form onSubmit={handleSubmit}>
            <Card className="mb-6">
              <Input
                label="Título *"
                type="text"
                value={title}
                onChange={e => setTitle(e.target.value)}
                required
                className="mb-4"
              />

              <Textarea
                label="Resumen *"
                value={excerpt}
                onChange={e => setExcerpt(e.target.value)}
                required
                rows={3}
                className="mb-4"
              />

              <Textarea
                label="Contenido completo *"
                value={content}
                onChange={e => setContent(e.target.value)}
                required
                rows={10}
                className="mb-4"
              />

              <div className="mb-0">
                <label
                  htmlFor="edit-news-image"
                  className="block mb-2 font-medium"
                >
                  Imagen
                </label>

                {currentImage && (
                  <div className="mb-4">
                    <p className="text-sm text-muted mb-2">Imagen actual:</p>
                    <img
                      src={getImageUrl(currentImage)}
                      alt="Imagen actual"
                      className="rounded"
                      style={{
                        maxWidth: "300px",
                        maxHeight: "200px",
                        objectFit: "cover",
                        border: "1px solid var(--color-border)",
                      }}
                    />
                  </div>
                )}

                <input
                  id="edit-news-image"
                  type="file"
                  accept="image/*"
                  onChange={e => setImageFile(e.target.files[0])}
                  className="w-full p-2"
                  style={{
                    border: "1px solid var(--color-border)",
                    borderRadius: "var(--radius-base)",
                  }}
                />
                <p className="text-sm text-muted mt-2">
                  Deja vacío para mantener la imagen actual
                </p>
              </div>
            </Card>

            <div className="flex justify-center gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate(`/noticias/${id}`)}
              >
                Cancelar
              </Button>
              <Button type="submit" variant="primary" disabled={saving}>
                {saving ? "Guardando..." : "Guardar cambios"}
              </Button>
            </div>
          </form>
        </div>
      </Container>
    </Section>
  );
}
