import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import PropTypes from "prop-types";
import { apiGet } from "../../api/client";
import {
  Section,
  Container,
  Tabs,
  Spinner,
  Badge,
  Card,
  Button,
  Input,
  Select,
  Textarea,
  Alert,
  useToast,
} from "../../components/ui";

export default function AdminDashboard() {
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
        apiGet("/admin/news"),
      ]);

      const stats = {
        applications: {
          total: applications.length,
          pending: applications.filter(a => a.status === "pending").length,
          payment_pending: applications.filter(
            a => a.status === "payment_pending"
          ).length,
          paid: applications.filter(a => a.status === "paid").length,
          rejected: applications.filter(a => a.status === "rejected").length,
        },
        users: {
          total: users.length,
          active: users.filter(u => u.is_active).length,
          members: users.filter(u => u.role === "member").length,
          admins: users.filter(u => u.role === "admin").length,
        },
        news: {
          total: news.length,
          published: news.filter(n => n.status === "published").length,
          pending: news.filter(n => n.status === "pending").length,
          rejected: news.filter(n => n.status === "rejected").length,
        },
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
      <Section variant="default">
        <Container>
          <div className="flex justify-center p-6">
            <Spinner size="lg" />
          </div>
        </Container>
      </Section>
    );
  }

  const tabs = [
    { id: "overview", label: "Resumen" },
    { id: "users", label: "Usuarios" },
    { id: "applications", label: "Postulaciones" },
    { id: "news", label: "Noticias" },
    { id: "events", label: "Eventos" },
  ];

  return (
    <Section variant="default">
      <Container>
        <div className="mb-5">
          <h1 className="mt-0 mb-2">Panel de Administración</h1>
          <p className="text-muted mb-0">
            Gestiona usuarios, noticias, cursos y postulaciones
          </p>
        </div>

        <Tabs
          tabs={tabs}
          activeTab={activeTab}
          onChange={setActiveTab}
          variant="segmented"
          className="mb-5"
        />

        {/* Contenido de las tabs */}
        {activeTab === "overview" && <OverviewTab stats={stats} />}
        {activeTab === "users" && <UsersTab />}
        {activeTab === "applications" && <ApplicationsTab />}
        {activeTab === "news" && <NewsTab />}
        {activeTab === "events" && <EventsTab />}
      </Container>
    </Section>
  );
}

function EventFormatBadge({ format }) {
  return (
    <Badge variant={format === "webinar" ? "accent" : "secondary"}>
      {format === "webinar" ? "Webinar" : "Presencial"}
    </Badge>
  );
}

EventFormatBadge.propTypes = {
  format: PropTypes.string.isRequired,
};

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
    const token = localStorage.getItem("access_token");
    const res = await fetch(
      (import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api") +
        "/admin/events",
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    const data = await res.json();
    const now = new Date();
    const up = data.filter(e => e.start_date && new Date(e.start_date) >= now);
    const pastItems = data
      .filter(e => e.start_date && new Date(e.start_date) < now)
      .slice(0, 5);
    setUpcoming(up);
    setPast(pastItems);
    setLoading(false);
  }

  return (
    <div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 24,
        }}
      >
        <h2>Eventos</h2>
        <button
          className="btn btn-primary"
          onClick={() => navigate("/admin/eventos")}
        >
          Abrir gestor de eventos
        </button>
      </div>

      {loading ? (
        <p>Cargando...</p>
      ) : (
        <>
          <h3>Próximos</h3>
          {upcoming.length === 0 ? (
            <p style={{ color: "var(--color-muted)" }}>
              No hay eventos próximos.
            </p>
          ) : (
            <div className="cards">
              {upcoming.map(e => (
                <div key={e.id} className="card">
                  <div
                    style={{ display: "flex", justifyContent: "space-between" }}
                  >
                    <h4>{e.title}</h4>
                    <EventFormatBadge format={e.format} />
                  </div>
                  <p style={{ color: "var(--color-muted)" }}>{e.description}</p>
                  <p>
                    <strong>Fecha:</strong>{" "}
                    {e.start_date
                      ? new Date(e.start_date).toLocaleDateString("es-ES")
                      : "Por confirmar"}
                  </p>
                </div>
              ))}
            </div>
          )}

          <h3 style={{ marginTop: 24 }}>Últimos 5 pasados</h3>
          {past.length === 0 ? (
            <p style={{ color: "var(--color-muted)" }}>
              No hay eventos pasados.
            </p>
          ) : (
            <div className="cards">
              {past.map(e => (
                <div key={e.id} className="card">
                  <div
                    style={{ display: "flex", justifyContent: "space-between" }}
                  >
                    <h4>{e.title}</h4>
                    <EventFormatBadge format={e.format} />
                  </div>
                  <p style={{ color: "var(--color-muted)" }}>{e.description}</p>
                  <p>
                    <strong>Fecha:</strong>{" "}
                    {e.start_date
                      ? new Date(e.start_date).toLocaleDateString("es-ES")
                      : "Por confirmar"}
                  </p>
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

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
          gap: 24,
          marginBottom: 32,
        }}
      >
        <div className="card" style={{ textAlign: "center" }}>
          <h3 style={{ marginBottom: 8 }}>Postulaciones</h3>
          <div
            style={{
              fontSize: "2em",
              fontWeight: "bold",
              color: "var(--color-primary)",
              marginBottom: 8,
            }}
          >
            {stats.applications?.total || 0}
          </div>
          <div style={{ fontSize: "0.9em", color: "var(--color-muted)" }}>
            {stats.applications?.pending || 0} pendientes •{" "}
            {stats.applications?.payment_pending || 0} esperando pago
          </div>
        </div>

        <div className="card" style={{ textAlign: "center" }}>
          <h3 style={{ marginBottom: 8 }}>Usuarios</h3>
          <div
            style={{
              fontSize: "2em",
              fontWeight: "bold",
              color: "var(--color-secondary)",
              marginBottom: 8,
            }}
          >
            {stats.users?.total || 0}
          </div>
          <div style={{ fontSize: "0.9em", color: "var(--color-muted)" }}>
            {stats.users?.members || 0} socios • {stats.users?.admins || 0}{" "}
            admins
          </div>
        </div>

        <div className="card" style={{ textAlign: "center" }}>
          <h3 style={{ marginBottom: 8 }}>Noticias</h3>
          <div
            style={{
              fontSize: "2em",
              fontWeight: "bold",
              color: "var(--color-accent)",
              marginBottom: 8,
            }}
          >
            {stats.news?.total || 0}
          </div>
          <div style={{ fontSize: "0.9em", color: "var(--color-muted)" }}>
            {stats.news?.published || 0} publicadas • {stats.news?.pending || 0}{" "}
            pendientes
          </div>
        </div>
      </div>

      <div className="card">
        <h3 style={{ marginBottom: 16 }}>Estados de Postulaciones</h3>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              padding: "8px 0",
              borderBottom: "1px solid #eee",
            }}
          >
            <span>Pendientes</span>
            <span style={{ fontWeight: "bold", color: "var(--color-accent)" }}>
              {stats.applications?.pending || 0}
            </span>
          </div>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              padding: "8px 0",
              borderBottom: "1px solid #eee",
            }}
          >
            <span>Esperando Pago</span>
            <span style={{ fontWeight: "bold", color: "orange" }}>
              {stats.applications?.payment_pending || 0}
            </span>
          </div>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              padding: "8px 0",
              borderBottom: "1px solid #eee",
            }}
          >
            <span>Pagadas</span>
            <span style={{ fontWeight: "bold", color: "green" }}>
              {stats.applications?.paid || 0}
            </span>
          </div>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              padding: "8px 0",
            }}
          >
            <span>Rechazadas</span>
            <span style={{ fontWeight: "bold", color: "crimson" }}>
              {stats.applications?.rejected || 0}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

OverviewTab.propTypes = {
  stats: PropTypes.shape({
    applications: PropTypes.shape({
      total: PropTypes.number,
      pending: PropTypes.number,
      payment_pending: PropTypes.number,
      paid: PropTypes.number,
      rejected: PropTypes.number,
    }),
    users: PropTypes.shape({
      total: PropTypes.number,
      active: PropTypes.number,
      members: PropTypes.number,
      admins: PropTypes.number,
    }),
    news: PropTypes.shape({
      total: PropTypes.number,
      published: PropTypes.number,
      pending: PropTypes.number,
      rejected: PropTypes.number,
    }),
  }).isRequired,
};

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

  const getMembershipTypeLabel = type => {
    const types = {
      joven: "Joven",
      normal: "Normal",
      gratuito: "Gratuito",
    };
    return types[type] || type;
  };

  const getStatusColor = user => {
    if (!user.is_active) return "crimson";
    if (user.payment_status === "paid") return "green";
    if (user.payment_status === "due") return "orange";
    return "var(--color-muted)";
  };

  if (loading) {
    return (
      <div style={{ textAlign: "center", padding: "48px 0" }}>
        Cargando usuarios...
      </div>
    );
  }

  return (
    <div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 24,
        }}
      >
        <h2>Usuarios ({users.length})</h2>
        <button
          className="btn btn-primary"
          onClick={() => navigate("/admin/users/new")}
        >
          + Nuevo Usuario
        </button>
      </div>

      <div className="cards">
        {users.map(user => (
          <div key={user.id} className="card">
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
                marginBottom: 12,
              }}
            >
              <div>
                <h4 style={{ marginBottom: 4 }}>{user.name}</h4>
                <p style={{ color: "var(--color-muted)", marginBottom: 8 }}>
                  {user.email}
                </p>
                <div style={{ display: "flex", gap: 12, fontSize: "0.9em" }}>
                  <span
                    style={{
                      background: getStatusColor(user),
                      color: "white",
                      padding: "4px 8px",
                      borderRadius: 12,
                      fontSize: "0.8em",
                    }}
                  >
                    {user.role === "admin"
                      ? "Admin"
                      : getMembershipTypeLabel(user.membership_type)}
                  </span>
                  <span
                    style={{
                      background: user.is_active ? "green" : "crimson",
                      color: "white",
                      padding: "4px 8px",
                      borderRadius: 12,
                      fontSize: "0.8em",
                    }}
                  >
                    {user.is_active ? "Activo" : "Inactivo"}
                  </span>
                </div>
              </div>
              <div
                style={{
                  textAlign: "right",
                  fontSize: "0.9em",
                  color: "var(--color-muted)",
                }}
              >
                <div>Pago: {user.payment_status}</div>
                <div>
                  {new Date(user.created_at).toLocaleDateString("es-ES")}
                </div>
              </div>
            </div>
            <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
              <button
                className="btn btn-outline"
                onClick={() => navigate(`/admin/users/${user.id}`)}
                style={{ fontSize: "0.9em", padding: "6px 12px" }}
              >
                Ver Detalles
              </button>
              <button
                className="btn btn-outline"
                onClick={() => navigate(`/admin/users/${user.id}/edit`)}
                style={{ fontSize: "0.9em", padding: "6px 12px" }}
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

  const getStatusColor = status => {
    const colors = {
      pending: "var(--color-accent)",
      approved: "var(--color-secondary)",
      rejected: "crimson",
      payment_pending: "orange",
      paid: "green",
    };
    return colors[status] || "var(--color-muted)";
  };

  const getStatusLabel = status => {
    const labels = {
      pending: "Pendiente",
      approved: "Aprobada",
      rejected: "Rechazada",
      payment_pending: "Esperando Pago",
      paid: "Pagada",
    };
    return labels[status] || status;
  };

  if (loading) {
    return (
      <div style={{ textAlign: "center", padding: "48px 0" }}>
        Cargando postulaciones...
      </div>
    );
  }

  return (
    <div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 24,
        }}
      >
        <h2>Postulaciones ({applications.length})</h2>
      </div>

      <div className="cards">
        {applications.map(app => (
          <div key={app.id} className="card">
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
                marginBottom: 12,
              }}
            >
              <div>
                <h4 style={{ marginBottom: 4 }}>{app.name}</h4>
                <p style={{ color: "var(--color-muted)", marginBottom: 8 }}>
                  {app.email}
                </p>
                <p style={{ fontSize: "0.9em", marginBottom: 8 }}>
                  {app.specialization} • {app.experience_years} años exp.
                </p>
              </div>
              <div style={{ textAlign: "right" }}>
                <div
                  style={{
                    background: getStatusColor(app.status),
                    color: "white",
                    padding: "6px 12px",
                    borderRadius: 16,
                    fontSize: "0.8em",
                    fontWeight: "bold",
                    marginBottom: 8,
                  }}
                >
                  {getStatusLabel(app.status)}
                </div>
                <div style={{ fontSize: "0.9em", color: "var(--color-muted)" }}>
                  {new Date(app.created_at).toLocaleDateString("es-ES")}
                </div>
              </div>
            </div>
            <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
              <button
                className="btn btn-primary"
                onClick={() => {
                  navigate(`/admin/applications/${app.id}`);
                }}
                style={{ fontSize: "0.9em", padding: "6px 12px" }}
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
  const toast = useToast();
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
      toast.error("Error al cargar noticias");
      console.error("Error loading news:", err);
    } finally {
      setLoading(false);
    }
  }

  const getStatusVariant = status => {
    const variants = {
      published: "success",
      pending: "warning",
      rejected: "error",
    };
    return variants[status] || "default";
  };

  const getStatusLabel = status => {
    const labels = {
      published: "Publicada",
      pending: "Pendiente",
      rejected: "Rechazada",
    };
    return labels[status] || status;
  };

  if (loading) {
    return (
      <div className="flex-center" style={{ minHeight: "300px" }}>
        <Spinner size="large" />
      </div>
    );
  }

  return (
    <div>
      <div className="flex-between mb-4">
        <h2>Noticias ({news.length})</h2>
      </div>

      <SimpleNewsForm onSuccess={loadNews} />

      {news.length === 0 ? (
        <Alert variant="info">No hay noticias creadas todavía.</Alert>
      ) : (
        <div className="grid gap-4">
          {news.map(article => (
            <Card key={article.id}>
              <div className="flex-between mb-3">
                <div className="flex-1">
                  <h4 className="mb-1">{article.title}</h4>
                  <p className="text-muted mb-2">
                    {article.excerpt || "Sin resumen"}
                  </p>
                </div>
                <div className="text-right ml-4">
                  <Badge
                    variant={getStatusVariant(article.status)}
                    className="mb-2"
                  >
                    {getStatusLabel(article.status)}
                  </Badge>
                  <div className="text-sm text-muted">
                    Orden: {article.order_index}
                  </div>
                </div>
              </div>
              <div className="flex-start gap-2">
                <Button
                  variant="outline"
                  size="small"
                  onClick={() => navigate(`/admin/news/${article.id}/view`)}
                >
                  Ver
                </Button>
                <Button
                  variant="outline"
                  size="small"
                  onClick={() => navigate(`/admin/news/${article.id}/edit`)}
                >
                  Editar
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

function SimpleNewsForm({ onSuccess }) {
  const toast = useToast();
  const [title, setTitle] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [content, setContent] = useState("");
  const [category, setCategory] = useState("comunicados");
  const [loading, setLoading] = useState(false);
  const BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";

  async function submit(e) {
    e.preventDefault();
    setLoading(true);

    try {
      const form = new FormData();
      if (title) form.append("title", title);
      if (excerpt) form.append("excerpt", excerpt);
      if (content) form.append("content", content);
      if (category) form.append("category", category);
      const file = e.currentTarget.image?.files?.[0];
      if (file) form.append("image", file);

      const token = localStorage.getItem("access_token");
      const res = await fetch(`${BASE}/news`, {
        method: "POST",
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        body: form,
      });

      if (!res.ok) {
        toast.error("Error al crear la noticia");
        return;
      }

      toast.success("Noticia creada correctamente");
      setTitle("");
      setExcerpt("");
      setContent("");
      setCategory("comunicados");
      e.currentTarget.reset();
      if (onSuccess) onSuccess();
    } catch (err) {
      toast.error("Error al crear la noticia");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card className="mb-6">
      <h3 className="mb-4">Crear noticia rápida</h3>
      <form onSubmit={submit}>
        <div className="grid grid-2 gap-4 mb-4">
          <Input
            label="Título"
            placeholder="Título de la noticia"
            value={title}
            onChange={e => setTitle(e.target.value)}
          />
          <Select
            label="Categoría"
            value={category}
            onChange={e => setCategory(e.target.value)}
          >
            <option value="comunicados">Comunicados</option>
            <option value="prensa">Prensa</option>
            <option value="blog">Blog</option>
          </Select>
          <Input
            label="Resumen"
            placeholder="Resumen breve"
            value={excerpt}
            onChange={e => setExcerpt(e.target.value)}
          />
          <div>
            <label
              htmlFor="news-image-quick"
              className="block mb-2 font-medium"
            >
              Imagen
            </label>
            <input
              id="news-image-quick"
              name="image"
              type="file"
              accept="image/*"
              className="input"
            />
          </div>
        </div>
        <div className="mb-4">
          <Textarea
            label="Contenido"
            placeholder="Contenido de la noticia"
            value={content}
            onChange={e => setContent(e.target.value)}
            rows={4}
          />
        </div>
        <div className="flex-end">
          <Button type="submit" variant="primary" disabled={loading}>
            {loading ? "Creando..." : "Crear noticia"}
          </Button>
        </div>
      </form>
    </Card>
  );
}

SimpleNewsForm.propTypes = {
  onSuccess: PropTypes.func,
};
