import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { apiGet, apiPost, apiPostForm } from "../api/client";

const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";

export default function NewsEditor() {
  const { id } = useParams();
  const navigate = useNavigate();
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
    expiry_date: ""
  });
  
  const [imageFile, setImageFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

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
        expiry_date: news.expiry_date || ""
      });
    } catch (err) {
      setError("Error al cargar la noticia");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  function handleInputChange(e) {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  }

  function handleImageChange(e) {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      // Preview de la imagen
      const reader = new FileReader();
      reader.onload = (e) => {
        setFormData(prev => ({ ...prev, image_url: e.target.result }));
      };
      reader.readAsDataURL(file);
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const formDataToSend = new FormData();
      
      // Agregar todos los campos del formulario
      Object.keys(formData).forEach(key => {
        if (formData[key] !== null && formData[key] !== undefined) {
          formDataToSend.append(key, formData[key]);
        }
      });

      // Agregar imagen si hay una nueva
      if (imageFile) {
        formDataToSend.append('image', imageFile);
      }

      if (isEdit) {
        await apiPostForm(`/admin/news/${id}/edit`, formDataToSend);
        setSuccess("Noticia actualizada correctamente");
      } else {
        await apiPostForm("/news", formDataToSend);
        setSuccess("Noticia creada correctamente");
      }

      setTimeout(() => {
        navigate("/admin");
      }, 2000);

    } catch (err) {
      setError("Error al guardar la noticia");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  if (loading && isEdit) {
    return (
      <section className="section">
        <div className="container">
          <div style={{ textAlign: 'center', padding: '48px 0' }}>
            <div style={{ fontSize: '1.2em', color: 'var(--color-muted)' }}>Cargando...</div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="section">
      <div className="container" style={{ maxWidth: 800 }}>
        <div style={{ marginBottom: 32 }}>
          <button 
            className="btn btn-outline" 
            onClick={() => navigate("/admin")}
            style={{ marginBottom: 24 }}
          >
            ← Volver al Panel Admin
          </button>
          
          <h1>{isEdit ? 'Editar Noticia' : 'Crear Nueva Noticia'}</h1>
          <p style={{ color: 'var(--color-muted)' }}>
            {isEdit ? 'Modifica los campos de la noticia' : 'Completa todos los campos para crear una nueva noticia'}
          </p>
        </div>

        {error && (
          <div style={{ 
            background: '#f8d7da', 
            color: '#721c24', 
            padding: 16, 
            borderRadius: 8, 
            marginBottom: 24,
            textAlign: 'center'
          }}>
            {error}
          </div>
        )}

        {success && (
          <div style={{ 
            background: '#d4edda', 
            color: '#155724', 
            padding: 16, 
            borderRadius: 8, 
            marginBottom: 24,
            textAlign: 'center'
          }}>
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ background: '#f8f9fa', padding: 32, borderRadius: 12 }}>
          {/* Información básica */}
          <div style={{ marginBottom: 32 }}>
            <h3 style={{ marginBottom: 16, color: 'var(--color-primary)' }}>Información Básica</h3>
            
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', marginBottom: 8, fontWeight: '500' }}>
                Título *
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                style={{ width: '100%', padding: 12, border: '1px solid #ddd', borderRadius: 6 }}
                placeholder="Título de la noticia"
              />
            </div>

            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', marginBottom: 8, fontWeight: '500' }}>
                Resumen *
              </label>
              <textarea
                name="excerpt"
                value={formData.excerpt}
                onChange={handleInputChange}
                style={{ width: '100%', padding: 12, border: '1px solid #ddd', borderRadius: 6, minHeight: 80 }}
                placeholder="Resumen breve de la noticia"
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
              <div>
                <label style={{ display: 'block', marginBottom: 8, fontWeight: '500' }}>
                  Categoría
                </label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  style={{ width: '100%', padding: 12, border: '1px solid #ddd', borderRadius: 6 }}
                >
                  <option value="general">General</option>
                  <option value="comunicados">Comunicados</option>
                  <option value="prensa">Prensa</option>
                  <option value="blog">Blog</option>
                  <option value="eventos">Eventos</option>
                  <option value="educacion">Educación</option>
                </select>
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: 8, fontWeight: '500' }}>
                  Prioridad
                </label>
                <select
                  name="priority"
                  value={formData.priority}
                  onChange={handleInputChange}
                  style={{ width: '100%', padding: 12, border: '1px solid #ddd', borderRadius: 6 }}
                >
                  <option value="low">Baja</option>
                  <option value="normal">Normal</option>
                  <option value="high">Alta</option>
                  <option value="urgent">Urgente</option>
                </select>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
              <div>
                <label style={{ display: 'block', marginBottom: 8, fontWeight: '500' }}>
                  Autor
                </label>
                <input
                  type="text"
                  name="author"
                  value={formData.author}
                  onChange={handleInputChange}
                  style={{ width: '100%', padding: 12, border: '1px solid #ddd', borderRadius: 6 }}
                  placeholder="Nombre del autor"
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: 8, fontWeight: '500' }}>
                  Fuente
                </label>
                <input
                  type="text"
                  name="source"
                  value={formData.source}
                  onChange={handleInputChange}
                  style={{ width: '100%', padding: 12, border: '1px solid #ddd', borderRadius: 6 }}
                  placeholder="Fuente de la noticia"
                />
              </div>
            </div>

            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', marginBottom: 8, fontWeight: '500' }}>
                Tags (separados por comas)
              </label>
              <input
                type="text"
                name="tags"
                value={formData.tags}
                onChange={handleInputChange}
                style={{ width: '100%', padding: 12, border: '1px solid #ddd', borderRadius: 6 }}
                placeholder="cadera, cirugía, ortopedia, investigación"
              />
            </div>
          </div>

          {/* Contenido */}
          <div style={{ marginBottom: 32 }}>
            <h3 style={{ marginBottom: 16, color: 'var(--color-primary)' }}>Contenido</h3>
            
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', marginBottom: 8, fontWeight: '500' }}>
                Contenido Completo *
              </label>
              <textarea
                name="content"
                value={formData.content}
                onChange={handleInputChange}
                style={{ width: '100%', padding: 12, border: '1px solid #ddd', borderRadius: 6, minHeight: 200 }}
                placeholder="Contenido completo de la noticia"
              />
            </div>
          </div>

          {/* Multimedia */}
          <div style={{ marginBottom: 32 }}>
            <h3 style={{ marginBottom: 16, color: 'var(--color-primary)' }}>Multimedia</h3>
            
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', marginBottom: 8, fontWeight: '500' }}>
                Imagen Principal
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                style={{ width: '100%', padding: 12, border: '1px solid #ddd', borderRadius: 6 }}
              />
              {formData.image_url && (
                <div style={{ marginTop: 12 }}>
                  <img 
                    src={formData.image_url} 
                    alt="Preview" 
                    style={{ maxWidth: '200px', maxHeight: '150px', objectFit: 'cover', borderRadius: 8 }}
                  />
                </div>
              )}
            </div>

            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', marginBottom: 8, fontWeight: '500' }}>
                Texto Alternativo de la Imagen
              </label>
              <input
                type="text"
                name="image_alt"
                value={formData.image_alt}
                onChange={handleInputChange}
                style={{ width: '100%', padding: 12, border: '1px solid #ddd', borderRadius: 6 }}
                placeholder="Descripción de la imagen para accesibilidad"
              />
            </div>

            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', marginBottom: 8, fontWeight: '500' }}>
                URL de Video (opcional)
              </label>
              <input
                type="url"
                name="video_url"
                value={formData.video_url}
                onChange={handleInputChange}
                style={{ width: '100%', padding: 12, border: '1px solid #ddd', borderRadius: 6 }}
                placeholder="https://youtube.com/watch?v=..."
              />
            </div>

            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', marginBottom: 8, fontWeight: '500' }}>
                Enlace Externo (opcional)
              </label>
              <input
                type="url"
                name="external_link"
                value={formData.external_link}
                onChange={handleInputChange}
                style={{ width: '100%', padding: 12, border: '1px solid #ddd', borderRadius: 6 }}
                placeholder="https://ejemplo.com/articulo"
              />
            </div>
          </div>

          {/* Configuración */}
          <div style={{ marginBottom: 32 }}>
            <h3 style={{ marginBottom: 16, color: 'var(--color-primary)' }}>Configuración</h3>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
              <div>
                <label style={{ display: 'block', marginBottom: 8, fontWeight: '500' }}>
                  Fecha de Publicación
                </label>
                <input
                  type="datetime-local"
                  name="publish_date"
                  value={formData.publish_date}
                  onChange={handleInputChange}
                  style={{ width: '100%', padding: 12, border: '1px solid #ddd', borderRadius: 6 }}
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: 8, fontWeight: '500' }}>
                  Fecha de Expiración
                </label>
                <input
                  type="datetime-local"
                  name="expiry_date"
                  value={formData.expiry_date}
                  onChange={handleInputChange}
                  style={{ width: '100%', padding: 12, border: '1px solid #ddd', borderRadius: 6 }}
                />
              </div>
            </div>

            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <input
                  type="checkbox"
                  name="featured"
                  checked={formData.featured}
                  onChange={handleInputChange}
                />
                <span>Destacar esta noticia</span>
              </label>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 16, justifyContent: 'flex-end' }}>
            <button 
              type="button" 
              className="btn btn-outline" 
              onClick={() => navigate("/admin")}
            >
              Cancelar
            </button>
            <button 
              type="submit" 
              className="btn btn-primary"
              disabled={loading}
            >
              {loading ? 'Guardando...' : (isEdit ? 'Actualizar Noticia' : 'Crear Noticia')}
            </button>
          </div>
        </form>
      </div>
    </section>
  );
}
