import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";

const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";

export default function NewsDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [news, setNews] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [more, setMore] = useState([]);
  const [prevNext, setPrevNext] = useState({ prev: null, next: null });

  useEffect(() => {
    async function loadNews() {
      try {
        setLoading(true);
        console.log("Cargando noticia ID:", id);
        console.log("Usuario actual:", user);
        
        const token = localStorage.getItem("access_token");
        console.log("Token encontrado:", token ? "Sí" : "No");
        
        const headers = {};
        if (token) {
          headers['Authorization'] = `Bearer ${token}`;
        }
        
        console.log("Headers:", headers);
        
        const response = await fetch(`${BASE_URL}/news/${id}`, { headers });
        console.log("Response status:", response.status);
        console.log("Response ok:", response.ok);
        
        if (!response.ok) {
          const errorText = await response.text();
          console.log("Error response:", errorText);
          throw new Error(`Error ${response.status}: ${errorText}`);
        }
        
        const data = await response.json();
        console.log("Noticia cargada:", data);
        setNews(data);
        // Cargar más noticias y calcular anterior/siguiente
        try {
          const listRes = await fetch(`${BASE_URL}/news`);
          const list = await listRes.json();
          setMore(list.filter(n => n.id !== data.id).slice(0, 6));
          const idx = list.findIndex(n => n.id === data.id);
          setPrevNext({
            prev: idx > 0 ? list[idx - 1] : null,
            next: idx >= 0 && idx < list.length - 1 ? list[idx + 1] : null
          });
        } catch(e) {
          // ignorar errores de lista
        }
      } catch (err) {
        console.error("Error cargando noticia:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    if (id) {
      loadNews();
    }
  }, [id, user]);

  async function approveNews() {
    try {
      const token = localStorage.getItem("access_token");
      const response = await fetch(`${BASE_URL}/admin/news/${id}/approve`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        loadNews(); // recargar noticia
      }
    } catch (err) {
      console.error('Error al aprobar:', err);
    }
  }

  async function rejectNews() {
    try {
      const token = localStorage.getItem("access_token");
      const response = await fetch(`${BASE_URL}/admin/news/${id}/reject`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        loadNews(); // recargar noticia
      }
    } catch (err) {
      console.error('Error al rechazar:', err);
    }
  }

  function getImageUrl(imageUrl) {
    if (!imageUrl) {
      return "https://images.unsplash.com/photo-1559757148-5c350d0d3c56?auto=format&fit=crop&w=800&q=80";
    }
    
    if (imageUrl.startsWith('http')) {
      return imageUrl;
    }
    
    return `${BASE_URL.replace('/api', '')}${imageUrl}`;
  }

  if (loading) {
    return (
      <section className="section">
        <div className="container">
          <p>Cargando noticia...</p>
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
          <button className="btn btn-outline" onClick={() => window.location.reload()}>
            Reintentar
          </button>
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
        <article className="news-detail">
          {/* Header con título y estado */}
          <header className="news-header">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 'var(--spacing-lg)' }}>
              <div>
                <h1 className="news-title">{news.title}</h1>
                <div className="news-meta">
                  <span className="news-status" style={{ 
                    padding: '4px 12px', 
                    borderRadius: 'var(--radius)', 
                    fontSize: 'var(--font-size-sm)',
                    backgroundColor: news.status === 'published' ? 'var(--color-secondary)' : 
                                  news.status === 'pending' ? 'var(--color-accent)' : 'var(--color-muted)',
                    color: 'white'
                  }}>
                    {news.status === 'published' ? 'Publicada' : 
                     news.status === 'pending' ? 'Pendiente' : 'Rechazada'}
                  </span>
                  <time dateTime={news.created_at} style={{ marginLeft: 'var(--spacing)', color: 'var(--color-text-light)' }}>
                    {new Date(news.created_at).toLocaleDateString('es-ES', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </time>
                </div>
              </div>
              
              {/* Botones de admin */}
              {user?.role === 'admin' && (
                <div style={{ display: 'flex', gap: 'var(--spacing-sm)' }}>
                  {news.status === 'pending' && (
                    <>
                      <button className="btn btn-primary" onClick={approveNews}>
                        Aprobar
                      </button>
                      <button className="btn btn-outline" onClick={rejectNews}>
                        Rechazar
                      </button>
                    </>
                  )}
                  {news.status === 'published' && (
                    <button className="btn btn-outline" onClick={() => navigate(`/admin/news/${news.id}/edit`)}>
                      Editar
                    </button>
                  )}
                </div>
              )}
            </div>
          </header>

          {/* Imagen de la noticia */}
          {news.image_url && (
            <div className="news-image" style={{ marginBottom: 'var(--spacing-xl)' }}>
              <img 
                src={getImageUrl(news.image_url)} 
                alt={news.title}
                style={{
                  width: "100%",
                  maxHeight: "400px",
                  objectFit: "cover",
                  borderRadius: "var(--radius)",
                }}
              />
            </div>
          )}

          {/* Contenido de la noticia */}
          <div className="news-content">
            {/* Resumen */}
            {news.excerpt && (
              <div className="news-excerpt" style={{ 
                marginBottom: 'var(--spacing-xl)',
                padding: 'var(--spacing-lg)',
                backgroundColor: 'var(--color-bg-light)',
                borderRadius: 'var(--radius)',
                borderLeft: '4px solid var(--color-primary)'
              }}>
                <h3 style={{ marginBottom: 'var(--spacing-sm)', color: 'var(--color-primary)' }}>Resumen</h3>
                <p style={{ fontSize: 'var(--font-size-lg)', lineHeight: 1.6, margin: 0 }}>
                  {news.excerpt}
                </p>
              </div>
            )}
            
            {/* Contenido completo */}
            <div className="news-body">
              <h3 style={{ marginBottom: 'var(--spacing-lg)' }}>Contenido completo</h3>
              {news.content ? (
                <div dangerouslySetInnerHTML={{ __html: news.content }} 
                     style={{ lineHeight: 1.8, fontSize: 'var(--font-size-base)' }} />
              ) : (
                <p>Contenido de la noticia no disponible.</p>
              )}
            </div>
          </div>
        </article>
        {/* Navegación anterior / siguiente */}
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 'var(--spacing-xl)' }}>
          <div>
            {prevNext.prev && (
              <Link to={`/noticias/${prevNext.prev.id}`} className="btn btn-outline">← {prevNext.prev.title}</Link>
            )}
          </div>
          <div>
            {prevNext.next && (
              <Link to={`/noticias/${prevNext.next.id}`} className="btn btn-outline">{prevNext.next.title} →</Link>
            )}
          </div>
        </div>

        {/* Más noticias */}
        {more.length > 0 && (
          <div style={{ marginTop: 'var(--spacing-xl)' }}>
            <h3 style={{ marginBottom: 12 }}>Más noticias</h3>
            <div className="cards">
              {more.map(n => (
                <div key={n.id} className="card">
                  {n.image_url && (
                    <img 
                      src={n.image_url.startsWith('http') ? n.image_url : `${BASE_URL.replace('/api','')}${n.image_url}`} 
                      alt={n.title}
                      style={{ width: '100%', height: 160, objectFit: 'cover', borderRadius: 8, marginBottom: 8 }}
                    />
                  )}
                  <h4 style={{ margin: 0 }}>{n.title}</h4>
                  <p style={{ color: 'var(--color-muted)' }}>{n.excerpt}</p>
                  <Link to={`/noticias/${n.id}`} className="btn btn-outline">Leer más</Link>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}


