import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../../auth/AuthContext";

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

      setMsg("Noticia actualizada correctamente");
      navigate(`/noticias/${id}`);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <section className="section">
        <div className="container">
          <p>Cargando...</p>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="section">
        <div className="container">
          <h2>Error</h2>
          <p>{error}</p>
        </div>
      </section>
    );
  }

  if (!news) {
    return (
      <section className="section">
        <div className="container">
          <h2>Noticia no encontrada</h2>
        </div>
      </section>
    );
  }

  return (
    <section className="section">
      <div className="container">
        <h2>Editar noticia</h2>

        <form onSubmit={handleSubmit} style={{ maxWidth: "800px" }}>
          <div style={{ marginBottom: "var(--spacing-lg)" }}>
            <label
              htmlFor="title"
              style={{
                display: "block",
                marginBottom: "8px",
                fontWeight: "bold",
              }}
            >
              Título *
            </label>
            <input
              id="title"
              type="text"
              value={title}
              onChange={e => setTitle(e.target.value)}
              required
              style={{
                width: "100%",
                padding: "12px",
                border: "1px solid var(--color-border)",
                borderRadius: "var(--radius)",
                fontSize: "16px",
              }}
            />
          </div>

          <div style={{ marginBottom: "var(--spacing-lg)" }}>
            <label
              htmlFor="excerpt"
              style={{
                display: "block",
                marginBottom: "8px",
                fontWeight: "bold",
              }}
            >
              Resumen *
            </label>
            <textarea
              id="excerpt"
              value={excerpt}
              onChange={e => setExcerpt(e.target.value)}
              required
              rows={3}
              style={{
                width: "100%",
                padding: "12px",
                border: "1px solid var(--color-border)",
                borderRadius: "var(--radius)",
                fontSize: "16px",
                resize: "vertical",
              }}
            />
          </div>

          <div style={{ marginBottom: "var(--spacing-lg)" }}>
            <label
              htmlFor="content"
              style={{
                display: "block",
                marginBottom: "8px",
                fontWeight: "bold",
              }}
            >
              Contenido completo *
            </label>
            <textarea
              id="content"
              value={content}
              onChange={e => setContent(e.target.value)}
              required
              rows={10}
              style={{
                width: "100%",
                padding: "12px",
                border: "1px solid var(--color-border)",
                fontSize: "16px",
                resize: "vertical",
              }}
            />
          </div>

          <div style={{ marginBottom: "var(--spacing-lg)" }}>
            <label
              htmlFor="edit-news-image"
              style={{
                display: "block",
                marginBottom: "8px",
                fontWeight: "bold",
              }}
            >
              Imagen
            </label>

            {/* Imagen actual */}
            {currentImage && (
              <div style={{ marginBottom: "16px" }}>
                <p
                  style={{
                    fontSize: "14px",
                    color: "var(--color-text-light)",
                    marginBottom: "8px",
                  }}
                >
                  Imagen actual:
                </p>
                <img
                  src={getImageUrl(currentImage)}
                  alt="Imagen actual"
                  style={{
                    maxWidth: "200px",
                    maxHeight: "150px",
                    objectFit: "cover",
                    borderRadius: "var(--radius)",
                    border: "1px solid var(--color-border)",
                  }}
                />
              </div>
            )}

            {/* Input para nueva imagen */}
            <input
              id="edit-news-image"
              type="file"
              accept="image/*"
              onChange={e => setImageFile(e.target.files[0])}
              style={{
                width: "100%",
                padding: "8px",
                border: "1px solid var(--color-border)",
                borderRadius: "var(--radius)",
              }}
            />
            <p
              style={{
                fontSize: "14px",
                color: "var(--color-text-light)",
                marginTop: "8px",
              }}
            >
              Deja vacío para mantener la imagen actual
            </p>
          </div>

          <div
            style={{ display: "flex", gap: "16px", justifyContent: "flex-end" }}
          >
            <button
              type="button"
              className="btn btn-outline"
              onClick={() => navigate(`/noticias/${id}`)}
            >
              Cancelar
            </button>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? "Guardando..." : "Guardar cambios"}
            </button>
          </div>
        </form>
      </div>
    </section>
  );
}
