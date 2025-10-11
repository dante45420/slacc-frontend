import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { apiGet } from "../api/client";

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("overview");
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  async function loadStats() {
    try {
      const [applications, users, news] = await Promise.all([
        apiGet("/admin/applications"),
        apiGet("/admin/users"),
        apiGet("/admin/news")
      ]);

      const stats = {
        applications: {
          total: applications.length,
          pending: applications.filter(a => a.status === 'pending').length,
          payment_pending: applications.filter(a => a.status === 'payment_pending').length,
          paid: applications.filter(a => a.status === 'paid').length,
          rejected: applications.filter(a => a.status === 'rejected').length
        },
        users: {
          total: users.length,
          active: users.filter(u => u.is_active).length,
          members: users.filter(u => u.role === 'member').length,
          admins: users.filter(u => u.role === 'admin').length
        },
        news: {
          total: news.length,
          published: news.filter(n => n.status === 'published').length,
          pending: news.filter(n => n.status === 'pending').length,
          rejected: news.filter(n => n.status === 'rejected').length
        }
      };

      setStats(stats);
    } catch (err) {
      console.error("Error loading stats:", err);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
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
      <div className="container">
        <div style={{ marginBottom: 32 }}>
          <h1>Panel de Administración</h1>
          <p style={{ color: 'var(--color-muted)' }}>Gestiona usuarios, noticias, cursos y postulaciones</p>
        </div>

        {/* Tabs */}
        <div style={{ 
          display: 'flex', 
          gap: 8, 
          marginBottom: 32, 
          borderBottom: '2px solid #e9ecef',
          paddingBottom: 16
        }}>
          {[
            { id: "overview", label: "Resumen", icon: "📊" },
            { id: "users", label: "Usuarios", icon: "👥" },
            { id: "applications", label: "Postulaciones", icon: "📝" },
            { id: "news", label: "Noticias", icon: "📰" },
            { id: "events", label: "Eventos", icon: "🎟️" }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                padding: '12px 24px',
                border: 'none',
                background: activeTab === tab.id ? 'var(--color-primary)' : 'transparent',
                color: activeTab === tab.id ? 'white' : 'var(--color-muted)',
                borderRadius: '8px 8px 0 0',
                cursor: 'pointer',
                fontSize: '1em',
                fontWeight: activeTab === tab.id ? '600' : '400',
                transition: 'all 0.2s ease'
              }}
            >
              {tab.icon} {tab.label}
            </button>
          ))}
        </div>

        {/* Contenido de las tabs */}
        {activeTab === "overview" && <OverviewTab stats={stats} />}
        {activeTab === "users" && <UsersTab />}
        {activeTab === "applications" && <ApplicationsTab />}
        {activeTab === "news" && <NewsTab />}
        {activeTab === "events" && <EventsTab />}
      </div>
    </section>
  );
}

function EventsTab() {
  const navigate = useNavigate();
  const [upcoming, setUpcoming] = useState([]);
  const [past, setPast] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    load();
  }, []);

  async function load() {
    setLoading(true);
    const token = localStorage.getItem('access_token');
    const res = await fetch((import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api') + '/admin/events', {
      headers: { Authorization: `Bearer ${token}` }
    });
    const data = await res.json();
    const now = new Date();
    const up = data.filter(e => e.start_date && new Date(e.start_date) >= now);
    const pastItems = data.filter(e => e.start_date && new Date(e.start_date) < now).slice(0, 5);
    setUpcoming(up);
    setPast(pastItems);
    setLoading(false);
  }

  function Badge({ format }) {
    return <span style={{ background: format === 'webinar' ? 'var(--color-accent)' : 'var(--color-secondary)', color: 'white', padding: '2px 8px', borderRadius: 12, fontSize: '0.8em' }}>{format === 'webinar' ? 'Webinar' : 'Presencial'}</span>;
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h2>Eventos</h2>
        <button className="btn btn-primary" onClick={() => navigate('/admin/eventos')}>Abrir gestor de eventos</button>
      </div>

      {loading ? <p>Cargando...</p> : (
        <>
          <h3>Próximos</h3>
          {upcoming.length === 0 ? <p style={{ color: 'var(--color-muted)' }}>No hay eventos próximos.</p> : (
            <div className="cards">
              {upcoming.map(e => (
                <div key={e.id} className="card">
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <h4>{e.title}</h4>
                    <Badge format={e.format} />
                  </div>
                  <p style={{ color: 'var(--color-muted)' }}>{e.description}</p>
                  <p><strong>Fecha:</strong> {e.start_date ? new Date(e.start_date).toLocaleDateString('es-ES') : 'Por confirmar'}</p>
                </div>
              ))}
            </div>
          )}

          <h3 style={{ marginTop: 24 }}>Últimos 5 pasados</h3>
          {past.length === 0 ? <p style={{ color: 'var(--color-muted)' }}>No hay eventos pasados.</p> : (
            <div className="cards">
              {past.map(e => (
                <div key={e.id} className="card">
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <h4>{e.title}</h4>
                    <Badge format={e.format} />
                  </div>
                  <p style={{ color: 'var(--color-muted)' }}>{e.description}</p>
                  <p><strong>Fecha:</strong> {e.start_date ? new Date(e.start_date).toLocaleDateString('es-ES') : 'Por confirmar'}</p>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}

function OverviewTab({ stats }) {
  return (
    <div>
      <h2 style={{ marginBottom: 24 }}>Resumen General</h2>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 24, marginBottom: 32 }}>
        <div className="card" style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '2.5em', marginBottom: 8 }}>📝</div>
          <h3 style={{ marginBottom: 8 }}>Postulaciones</h3>
          <div style={{ fontSize: '2em', fontWeight: 'bold', color: 'var(--color-primary)', marginBottom: 8 }}>
            {stats.applications?.total || 0}
          </div>
          <div style={{ fontSize: '0.9em', color: 'var(--color-muted)' }}>
            {stats.applications?.pending || 0} pendientes • {stats.applications?.payment_pending || 0} esperando pago
          </div>
        </div>

        <div className="card" style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '2.5em', marginBottom: 8 }}>👥</div>
          <h3 style={{ marginBottom: 8 }}>Usuarios</h3>
          <div style={{ fontSize: '2em', fontWeight: 'bold', color: 'var(--color-secondary)', marginBottom: 8 }}>
            {stats.users?.total || 0}
          </div>
          <div style={{ fontSize: '0.9em', color: 'var(--color-muted)' }}>
            {stats.users?.members || 0} socios • {stats.users?.admins || 0} admins
          </div>
        </div>

        <div className="card" style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '2.5em', marginBottom: 8 }}>📰</div>
          <h3 style={{ marginBottom: 8 }}>Noticias</h3>
          <div style={{ fontSize: '2em', fontWeight: 'bold', color: 'var(--color-accent)', marginBottom: 8 }}>
            {stats.news?.total || 0}
          </div>
          <div style={{ fontSize: '0.9em', color: 'var(--color-muted)' }}>
            {stats.news?.published || 0} publicadas • {stats.news?.pending || 0} pendientes
          </div>
        </div>

      </div>

      <div className="card">
        <h3 style={{ marginBottom: 16 }}>Estados de Postulaciones</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #eee' }}>
            <span>Pendientes</span>
            <span style={{ fontWeight: 'bold', color: 'var(--color-accent)' }}>
              {stats.applications?.pending || 0}
            </span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #eee' }}>
            <span>Esperando Pago</span>
            <span style={{ fontWeight: 'bold', color: 'orange' }}>
              {stats.applications?.payment_pending || 0}
            </span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #eee' }}>
            <span>Pagadas</span>
            <span style={{ fontWeight: 'bold', color: 'green' }}>
              {stats.applications?.paid || 0}
            </span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0' }}>
            <span>Rechazadas</span>
            <span style={{ fontWeight: 'bold', color: 'crimson' }}>
              {stats.applications?.rejected || 0}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

function UsersTab() {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUsers();
  }, []);

  async function loadUsers() {
    try {
      const data = await apiGet("/admin/users");
      setUsers(data);
    } catch (err) {
      console.error("Error loading users:", err);
    } finally {
      setLoading(false);
    }
  }

  const getMembershipTypeLabel = (type) => {
    const types = {
      joven: "Joven",
      normal: "Normal", 
      gratuito: "Gratuito"
    };
    return types[type] || type;
  };

  const getStatusColor = (user) => {
    if (!user.is_active) return "crimson";
    if (user.payment_status === "paid") return "green";
    if (user.payment_status === "due") return "orange";
    return "var(--color-muted)";
  };

  if (loading) {
    return <div style={{ textAlign: 'center', padding: '48px 0' }}>Cargando usuarios...</div>;
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h2>Usuarios ({users.length})</h2>
        <button 
          className="btn btn-primary"
          onClick={() => navigate('/admin/users/new')}
        >
          + Nuevo Usuario
        </button>
      </div>

      <div className="cards">
        {users.map(user => (
          <div key={user.id} className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
              <div>
                <h4 style={{ marginBottom: 4 }}>{user.name}</h4>
                <p style={{ color: 'var(--color-muted)', marginBottom: 8 }}>{user.email}</p>
                <div style={{ display: 'flex', gap: 12, fontSize: '0.9em' }}>
                  <span style={{ 
                    background: getStatusColor(user), 
                    color: 'white', 
                    padding: '4px 8px', 
                    borderRadius: 12,
                    fontSize: '0.8em'
                  }}>
                    {user.role === 'admin' ? 'Admin' : getMembershipTypeLabel(user.membership_type)}
                  </span>
                  <span style={{ 
                    background: user.is_active ? 'green' : 'crimson', 
                    color: 'white', 
                    padding: '4px 8px', 
                    borderRadius: 12,
                    fontSize: '0.8em'
                  }}>
                    {user.is_active ? 'Activo' : 'Inactivo'}
                  </span>
                </div>
              </div>
              <div style={{ textAlign: 'right', fontSize: '0.9em', color: 'var(--color-muted)' }}>
                <div>Pago: {user.payment_status}</div>
                <div>{new Date(user.created_at).toLocaleDateString('es-ES')}</div>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
              <button 
                className="btn btn-outline" 
                onClick={() => navigate(`/admin/users/${user.id}`)}
                style={{ fontSize: '0.9em', padding: '6px 12px' }}
              >
                Ver Detalles
              </button>
              <button 
                className="btn btn-outline" 
                onClick={() => navigate(`/admin/users/${user.id}/edit`)}
                style={{ fontSize: '0.9em', padding: '6px 12px' }}
              >
                Editar
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function ApplicationsTab() {
  const navigate = useNavigate();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadApplications();
  }, []);

  async function loadApplications() {
    try {
      const data = await apiGet("/admin/applications");
      setApplications(data);
    } catch (err) {
      console.error("Error loading applications:", err);
    } finally {
      setLoading(false);
    }
  }

  const getStatusColor = (status) => {
    const colors = {
      pending: "var(--color-accent)",
      approved: "var(--color-secondary)",
      rejected: "crimson",
      payment_pending: "orange",
      paid: "green"
    };
    return colors[status] || "var(--color-muted)";
  };

  const getStatusLabel = (status) => {
    const labels = {
      pending: "Pendiente",
      approved: "Aprobada",
      rejected: "Rechazada",
      payment_pending: "Esperando Pago",
      paid: "Pagada"
    };
    return labels[status] || status;
  };

  if (loading) {
    return <div style={{ textAlign: 'center', padding: '48px 0' }}>Cargando postulaciones...</div>;
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h2>Postulaciones ({applications.length})</h2>
      </div>

      <div className="cards">
        {applications.map(app => (
          <div key={app.id} className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
              <div>
                <h4 style={{ marginBottom: 4 }}>{app.name}</h4>
                <p style={{ color: 'var(--color-muted)', marginBottom: 8 }}>{app.email}</p>
                <p style={{ fontSize: '0.9em', marginBottom: 8 }}>
                  {app.specialization} • {app.experience_years} años exp.
                </p>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ 
                  background: getStatusColor(app.status), 
                  color: 'white', 
                  padding: '6px 12px', 
                  borderRadius: 16,
                  fontSize: '0.8em',
                  fontWeight: 'bold',
                  marginBottom: 8
                }}>
                  {getStatusLabel(app.status)}
                </div>
                <div style={{ fontSize: '0.9em', color: 'var(--color-muted)' }}>
                  {new Date(app.created_at).toLocaleDateString('es-ES')}
                </div>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
              <button 
                className="btn btn-primary" 
                onClick={() => {
                  console.log('Navegando a:', `/admin/applications/${app.id}`);
                  navigate(`/admin/applications/${app.id}`);
                }}
                style={{ fontSize: '0.9em', padding: '6px 12px' }}
              >
                Ver Completa
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function NewsTab() {
  const navigate = useNavigate();
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadNews();
  }, []);

  async function loadNews() {
    try {
      const data = await apiGet("/admin/news");
      setNews(data);
    } catch (err) {
      console.error("Error loading news:", err);
    } finally {
      setLoading(false);
    }
  }

  const getStatusColor = (status) => {
    const colors = {
      published: "green",
      pending: "orange",
      rejected: "crimson"
    };
    return colors[status] || "var(--color-muted)";
  };

  const getStatusLabel = (status) => {
    const labels = {
      published: "Publicada",
      pending: "Pendiente",
      rejected: "Rechazada"
    };
    return labels[status] || status;
  };

  if (loading) {
    return <div style={{ textAlign: 'center', padding: '48px 0' }}>Cargando noticias...</div>;
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <h2>Noticias ({news.length})</h2>
      </div>

      <SimpleNewsForm onSuccess={loadNews} />

      <div className="cards">
        {news.map(article => (
          <div key={article.id} className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
              <div style={{ flex: 1 }}>
                <h4 style={{ marginBottom: 4 }}>{article.title}</h4>
                <p style={{ color: 'var(--color-muted)', marginBottom: 8 }}>
                  {article.excerpt || 'Sin resumen'}
                </p>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ 
                  background: getStatusColor(article.status), 
                  color: 'white', 
                  padding: '6px 12px', 
                  borderRadius: 16,
                  fontSize: '0.8em',
                  fontWeight: 'bold',
                  marginBottom: 8
                }}>
                  {getStatusLabel(article.status)}
                </div>
                <div style={{ fontSize: '0.9em', color: 'var(--color-muted)' }}>
                  Orden: {article.order_index}
                </div>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
              <button 
                className="btn btn-outline" 
                onClick={() => navigate(`/admin/news/${article.id}/view`)}
                style={{ fontSize: '0.9em', padding: '6px 12px' }}
              >
                Ver
              </button>
              <button 
                className="btn btn-outline" 
                onClick={() => navigate(`/admin/news/${article.id}/edit`)}
                style={{ fontSize: '0.9em', padding: '6px 12px' }}
              >
                Editar
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function SimpleNewsForm({ onSuccess }) {
  const [title, setTitle] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [content, setContent] = useState("");
  const [category, setCategory] = useState("comunicados");
  const [msg, setMsg] = useState("");
  const BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

  async function submit(e) {
    e.preventDefault();
    setMsg("");
    const form = new FormData();
    if (title) form.append('title', title);
    if (excerpt) form.append('excerpt', excerpt);
    if (content) form.append('content', content);
    if (category) form.append('category', category);
    const file = e.currentTarget.image?.files?.[0];
    if (file) form.append('image', file);
    const token = localStorage.getItem('access_token');
    const res = await fetch(`${BASE}/news`, { method: 'POST', headers: token ? { Authorization: `Bearer ${token}` } : undefined, body: form });
    if (!res.ok) { setMsg('Error al crear la noticia'); return; }
    setMsg('Noticia creada');
    setTitle(""); setExcerpt(""); setContent(""); setCategory("comunicados");
    if (onSuccess) onSuccess();
  }

  return (
    <form onSubmit={submit} className="card" style={{ padding: 16, marginBottom: 24 }}>
      <h3 style={{ marginBottom: 12 }}>Crear noticia rápida</h3>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <input placeholder="Título (opcional)" value={title} onChange={e => setTitle(e.target.value)} />
        <select value={category} onChange={e => setCategory(e.target.value)}>
          <option value="comunicados">Comunicados</option>
          <option value="prensa">Prensa</option>
          <option value="blog">Blog</option>
        </select>
        <input placeholder="Resumen (opcional)" value={excerpt} onChange={e => setExcerpt(e.target.value)} />
        <input name="image" type="file" accept="image/*" />
      </div>
      <textarea placeholder="Contenido (opcional)" value={content} onChange={e => setContent(e.target.value)} style={{ marginTop: 12, minHeight: 100 }} />
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 12 }}>
        <button className="btn btn-primary" type="submit">Crear</button>
      </div>
      {msg ? <div style={{ marginTop: 8, color: 'green' }}>{msg}</div> : null}
    </form>
  );
}

