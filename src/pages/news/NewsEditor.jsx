import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { apiGet, apiPostForm } from "../../api/client";
import {
  Section,
  Container,
  Card,
  Input,
  Textarea,
  Select,
  Button,
  Spinner,
  useToast,
} from "../../components/ui";

function getSubmitButtonLabel(loading, isEdit) {
  if (loading) return "Guardando...";
  if (isEdit) return "Actualizar Noticia";
  return "Crear Noticia";
}

export default function NewsEditor() {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const isEdit = !!id;

  const [formData, setFormData] = useState({
    title: "",
    excerpt: "",
    content: "",
    category: "comunicados",
    tags: "",
    author: "",
    source: "",
    featured: false,
    priority: "normal",
    image_url: "",
    image_alt: "",
    video_url: "",
    external_link: "",
    publish_date: "",
    expiry_date: "",
  });

  const [imageFile, setImageFile] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isEdit) {
      loadNews();
    }
  }, [id]);

  async function loadNews() {
    try {
      setLoading(true);
      const news = await apiGet(`/admin/news/${id}/view`);
      setFormData({
        title: news.title || "",
        excerpt: news.excerpt || "",
        content: news.content || "",
        category: news.category || "general",
        tags: news.tags || "",
        author: news.author || "",
        source: news.source || "",
        featured: news.featured || false,
        priority: news.priority || "normal",
        image_url: news.image_url || "",
        image_alt: news.image_alt || "",
        video_url: news.video_url || "",
        external_link: news.external_link || "",
        publish_date: news.publish_date || "",
        expiry_date: news.expiry_date || "",
      });
    } catch (err) {
      toast.error("Error al cargar la noticia");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  function handleInputChange(e) {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  }

  function handleImageChange(e) {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onload = e => {
        setFormData(prev => ({ ...prev, image_url: e.target.result }));
      };
      reader.readAsDataURL(file);
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);

    try {
      const formDataToSend = new FormData();

      for (const key of Object.keys(formData)) {
        if (formData[key] !== null && formData[key] !== undefined) {
          formDataToSend.append(key, formData[key]);
        }
      }

      if (imageFile) {
        formDataToSend.append("image", imageFile);
      }

      if (isEdit) {
        await apiPostForm(`/admin/news/${id}/edit`, formDataToSend);
        toast.success("Noticia actualizada correctamente");
      } else {
        await apiPostForm("/news", formDataToSend);
        toast.success("Noticia creada correctamente");
      }

      setTimeout(() => {
        navigate("/admin");
      }, 1500);
    } catch (err) {
      toast.error("Error al guardar la noticia");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  if (loading && isEdit) {
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

  return (
    <Section>
      <Container maxWidth="800px">
        <div className="mb-6">
          <Button
            variant="outline"
            onClick={() => navigate("/admin")}
            className="mb-4"
          >
            ← Volver al Panel Admin
          </Button>

          <h1 className="mb-2">
            {isEdit ? "Editar Noticia" : "Crear Nueva Noticia"}
          </h1>
          <p className="text-muted">
            {isEdit
              ? "Modifica los campos de la noticia"
              : "Completa todos los campos para crear una nueva noticia"}
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <Card className="mb-6">
            <h3 className="text-primary mb-4">Información Básica</h3>

            <div className="mb-4">
              <Input
                label="Título *"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                placeholder="Título de la noticia"
                required
              />
            </div>

            <div className="mb-4">
              <Textarea
                label="Resumen *"
                name="excerpt"
                value={formData.excerpt}
                onChange={handleInputChange}
                placeholder="Resumen breve de la noticia"
                rows={3}
                required
              />
            </div>

            <div className="grid grid-2 gap-4 mb-4">
              <Select
                label="Categoría"
                name="category"
                value={formData.category}
                onChange={handleInputChange}
              >
                <option value="general">General</option>
                <option value="comunicados">Comunicados</option>
                <option value="prensa">Prensa</option>
                <option value="blog">Blog</option>
                <option value="eventos">Eventos</option>
                <option value="educacion">Educación</option>
              </Select>

              <Select
                label="Prioridad"
                name="priority"
                value={formData.priority}
                onChange={handleInputChange}
              >
                <option value="low">Baja</option>
                <option value="normal">Normal</option>
                <option value="high">Alta</option>
                <option value="urgent">Urgente</option>
              </Select>
            </div>

            <div className="grid grid-2 gap-4 mb-4">
              <Input
                label="Autor"
                name="author"
                value={formData.author}
                onChange={handleInputChange}
                placeholder="Nombre del autor"
              />

              <Input
                label="Fuente"
                name="source"
                value={formData.source}
                onChange={handleInputChange}
                placeholder="Fuente de la noticia"
              />
            </div>

            <div className="mb-4">
              <Input
                label="Tags (separados por comas)"
                name="tags"
                value={formData.tags}
                onChange={handleInputChange}
                placeholder="cadera, cirugía, ortopedia, investigación"
              />
            </div>
          </Card>

          <Card className="mb-6">
            <h3 className="text-primary mb-4">Contenido</h3>

            <div className="mb-4">
              <Textarea
                label="Contenido Completo *"
                name="content"
                value={formData.content}
                onChange={handleInputChange}
                placeholder="Contenido completo de la noticia"
                rows={10}
                required
              />
            </div>
          </Card>

          <Card className="mb-6">
            <h3 className="text-primary mb-4">Multimedia</h3>

            <div className="mb-4">
              <label
                htmlFor="news-image-upload"
                className="block mb-2 font-medium"
              >
                Imagen Principal
              </label>
              <input
                id="news-image-upload"
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="input"
              />
              {formData.image_url && (
                <div className="mt-3">
                  <img
                    src={formData.image_url}
                    alt="Preview"
                    style={{
                      maxWidth: "200px",
                      maxHeight: "150px",
                      objectFit: "cover",
                      borderRadius: "var(--radius-base)",
                    }}
                  />
                </div>
              )}
            </div>

            <div className="mb-4">
              <Input
                label="Texto Alternativo de la Imagen"
                name="image_alt"
                value={formData.image_alt}
                onChange={handleInputChange}
                placeholder="Descripción de la imagen para accesibilidad"
              />
            </div>

            <div className="mb-4">
              <Input
                label="URL de Video (opcional)"
                type="url"
                name="video_url"
                value={formData.video_url}
                onChange={handleInputChange}
                placeholder="https://youtube.com/watch?v=..."
              />
            </div>

            <div className="mb-4">
              <Input
                label="Enlace Externo (opcional)"
                type="url"
                name="external_link"
                value={formData.external_link}
                onChange={handleInputChange}
                placeholder="https://ejemplo.com/articulo"
              />
            </div>
          </Card>

          <Card className="mb-6">
            <h3 className="text-primary mb-4">Configuración</h3>

            <div className="grid grid-2 gap-4 mb-4">
              <Input
                label="Fecha de Publicación"
                type="datetime-local"
                name="publish_date"
                value={formData.publish_date}
                onChange={handleInputChange}
              />

              <Input
                label="Fecha de Expiración"
                type="datetime-local"
                name="expiry_date"
                value={formData.expiry_date}
                onChange={handleInputChange}
              />
            </div>

            <div className="mb-4">
              <label className="flex-start gap-2">
                <input
                  type="checkbox"
                  name="featured"
                  checked={formData.featured}
                  onChange={handleInputChange}
                />
                <span>Destacar esta noticia</span>
              </label>
            </div>
          </Card>

          <div className="flex-end gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate("/admin")}
            >
              Cancelar
            </Button>
            <Button type="submit" variant="primary" disabled={loading}>
              {getSubmitButtonLabel(loading, isEdit)}
            </Button>
          </div>
        </form>
      </Container>
    </Section>
  );
}
