import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import PropTypes from "prop-types";
import { apiGet } from "../../api/client";
import {
  Section,
  Container,
  Tabs,
  Spinner,
  Badge,
  Button,
  Input,
  Select,
  Textarea,
  Alert,
  Table,
  Modal,
  useToast,
} from "../../components/ui";

// Helper function to format dates safely
function formatDateHelper(dateString, defaultText = "Sin fecha") {
  if (!dateString) return defaultText;

  try {
    const date = new Date(dateString);
    if (Number.isNaN(date.getTime())) {
      return "Fecha inválida";
    }

    return date.toLocaleDateString("es-ES", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch (error) {
    console.error("Error formatting date:", error);
    return "Fecha inválida";
  }
}

export default function AdminDashboard() {
  const [searchParams] = useSearchParams();
  const tabFromUrl = searchParams.get("tab");
  const [activeTab, setActiveTab] = useState(tabFromUrl || "overview");
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  // Update active tab when URL changes
  useEffect(() => {
    if (tabFromUrl) {
      setActiveTab(tabFromUrl);
    }
  }, [tabFromUrl]);

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
  const toast = useToast();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);

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
    // Sort by start_date descending (upcoming first)
    const sorted = data.sort((a, b) => {
      if (!a.start_date) return 1;
      if (!b.start_date) return -1;
      return new Date(b.start_date) - new Date(a.start_date);
    });
    setEvents(sorted);
    setLoading(false);
  }

  const handleCreateSuccess = () => {
    setShowCreateModal(false);
    load();
  };

  const handleEditClick = event => {
    setEditingEvent(event);
    setShowCreateModal(true);
  };

  const handleEditSuccess = () => {
    setShowCreateModal(false);
    setEditingEvent(null);
    load();
  };

  const handleModalClose = () => {
    setShowCreateModal(false);
    setEditingEvent(null);
  };

  const handleDelete = async eventId => {
    if (!confirm("¿Estás seguro de que deseas eliminar este evento?")) return;

    try {
      const token = localStorage.getItem("access_token");
      const res = await fetch(
        `${
          import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api"
        }/admin/events/${eventId}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (res.ok) {
        toast.success("Evento eliminado correctamente");
        load();
      } else {
        toast.error("Error al eliminar el evento");
      }
    } catch (err) {
      toast.error("Error al eliminar el evento");
      console.error(err);
    }
  };

  const isUpcoming = dateString => {
    if (!dateString) return false;
    try {
      return new Date(dateString) >= new Date();
    } catch {
      return false;
    }
  };

  if (loading) {
    return (
      <div className="flex-center min-h-300">
        <Spinner size="lg" />
      </div>
    );
  }

  const columns = [
    {
      key: "title",
      label: "Evento",
      render: row => {
        let description = row.description || "Sin descripción";
        if (description.length > 100) {
          description = description.substring(0, 100) + "...";
        }

        return (
          <div>
            <div className="table-title">{row.title}</div>
            <div className="table-subtitle">{description}</div>
          </div>
        );
      },
    },
    {
      key: "format",
      label: "Formato",
      render: row => <EventFormatBadge format={row.format} />,
    },
    {
      key: "start_date",
      label: "Fecha",
      render: row => (
        <div>
          <div className="table-date">
            {formatDateHelper(row.start_date, "Por confirmar")}
          </div>
          <Badge
            variant={isUpcoming(row.start_date) ? "info" : "neutral"}
            size="sm"
          >
            {isUpcoming(row.start_date) ? "Próximo" : "Pasado"}
          </Badge>
        </div>
      ),
    },
    {
      key: "location",
      label: "Ubicación",
      render: row => (
        <span className="text-sm text-muted">{row.location || "N/A"}</span>
      ),
    },
    {
      key: "actions",
      label: "Acciones",
      render: row => (
        <div style={{ display: "flex", gap: "var(--spacing-2)" }}>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleEditClick(row)}
          >
            Editar
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleDelete(row.id)}
          >
            Eliminar
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div>
      <div className="flex justify-between align-center mb-5">
        <div>
          <h2 className="card-title-no-margin">Eventos</h2>
          <p className="card-subtitle-muted">
            {events.length} {events.length === 1 ? "evento" : "eventos"} en
            total
          </p>
        </div>
        <Button variant="primary" onClick={() => setShowCreateModal(true)}>
          + Crear evento
        </Button>
      </div>

      {events.length === 0 ? (
        <Alert variant="info">
          No hay eventos registrados todavía. Haz clic en "Crear evento" para
          empezar.
        </Alert>
      ) : (
        <Table columns={columns} data={events} hoverable />
      )}

      <Modal
        isOpen={showCreateModal}
        onClose={handleModalClose}
        title={editingEvent ? "Editar Evento" : "Crear Nuevo Evento"}
        size="lg"
      >
        <EventForm
          event={editingEvent}
          onSuccess={editingEvent ? handleEditSuccess : handleCreateSuccess}
          onCancel={handleModalClose}
        />
      </Modal>
    </div>
  );
}

function EventForm({ event, onSuccess, onCancel }) {
  const toast = useToast();
  const [loading, setLoading] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [imageUrl, setImageUrl] = useState(event?.image_url || "");
  const [createdEventId, setCreatedEventId] = useState(event?.id || null);
  const [justCreated, setJustCreated] = useState(false);
  const [form, setForm] = useState({
    title: event?.title || "",
    description: event?.description || "",
    instructor: event?.instructor || "",
    duration_hours: event?.duration_hours || "",
    format: event?.format || "webinar",
    location: event?.location || "",
    max_students: event?.max_students || "",
    price_member: event?.price_member || "",
    price_non_member: event?.price_non_member || "",
    price_joven: event?.price_joven || "",
    price_gratuito: event?.price_gratuito || "",
    start_date: event?.start_date ? event.start_date.split("T")[0] : "",
    end_date: event?.end_date ? event.end_date.split("T")[0] : "",
    registration_deadline: event?.registration_deadline
      ? event.registration_deadline.split("T")[0]
      : "",
    is_active: event?.is_active === undefined || event.is_active,
  });

  const getImageUrl = url => {
    const apiBase =
      import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";
    if (!url) return null;
    if (url.startsWith("http")) return url;
    return apiBase.replace("/api", "") + url;
  };

  const handleImageUpload = async file => {
    if (!createdEventId) {
      toast.error("Debes crear el evento primero antes de subir una imagen");
      return;
    }

    setUploadingImage(true);
    try {
      const token = localStorage.getItem("access_token");
      const fd = new FormData();
      fd.append("image", file);
      const res = await fetch(
        `${
          import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api"
        }/admin/events/${createdEventId}/image`,
        {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
          body: fd,
        }
      );

      if (res.ok) {
        const data = await res.json();
        setImageUrl(data.image_url);
        toast.success("Imagen subida correctamente");
      } else {
        const data = await res.json();
        toast.error(data.error || "Error al subir imagen");
      }
    } catch (err) {
      toast.error("Error al subir la imagen");
      console.error(err);
    } finally {
      setUploadingImage(false);
    }
  };

  const getButtonText = () => {
    if (loading) return "Guardando...";
    if (justCreated) return "Finalizar";
    return event ? "Actualizar Evento" : "Crear Evento";
  };

  const handleSubmit = async e => {
    e.preventDefault();

    if (justCreated) {
      onSuccess();
      return;
    }

    setLoading(true);

    try {
      const token = localStorage.getItem("access_token");
      const url = event
        ? `${
            import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api"
          }/admin/events/${event.id}`
        : `${
            import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api"
          }/admin/events`;

      const res = await fetch(url, {
        method: event ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(form),
      });

      if (res.ok) {
        const data = await res.json();
        toast.success(
          event
            ? "Evento actualizado correctamente"
            : "Evento creado correctamente"
        );

        if (!event && data.id) {
          setCreatedEventId(data.id);
          setJustCreated(true);
        } else {
          onSuccess();
        }
      } else {
        const data = await res.json();
        toast.error(data.error || "Error al guardar el evento");
      }
    } catch (err) {
      toast.error("Error al guardar el evento");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {justCreated && (
        <Alert variant="success" className="mb-4">
          ¡Evento creado exitosamente! Ahora puedes subir una imagen o cerrar el
          formulario.
        </Alert>
      )}

      <div className="grid grid-2 gap-4 mb-4">
        <Input
          label="Título"
          value={form.title}
          onChange={e => setForm({ ...form, title: e.target.value })}
          required
          disabled={justCreated}
        />
        <Select
          label="Formato"
          value={form.format}
          onChange={e => setForm({ ...form, format: e.target.value })}
          disabled={justCreated}
        >
          <option value="webinar">Webinar</option>
          <option value="presencial">Presencial</option>
        </Select>
      </div>

      <div className="mb-4">
        <Textarea
          label="Descripción"
          value={form.description}
          onChange={e => setForm({ ...form, description: e.target.value })}
          rows={3}
          disabled={justCreated}
        />
      </div>

      <div className="grid grid-2 gap-4 mb-4">
        <Input
          label="Instructor"
          value={form.instructor}
          onChange={e => setForm({ ...form, instructor: e.target.value })}
          disabled={justCreated}
        />
        <Input
          label="Duración (horas)"
          type="number"
          value={form.duration_hours}
          onChange={e => setForm({ ...form, duration_hours: e.target.value })}
          disabled={justCreated}
        />
      </div>

      <div className="grid grid-2 gap-4 mb-4">
        <Input
          label="Ubicación"
          value={form.location}
          onChange={e => setForm({ ...form, location: e.target.value })}
          placeholder={
            form.format === "webinar" ? "Link del webinar" : "Dirección física"
          }
          disabled={justCreated}
        />
        <Input
          label="Capacidad Máxima (Opcional)"
          type="number"
          value={form.max_students}
          onChange={e => setForm({ ...form, max_students: e.target.value })}
          disabled={justCreated}
        />
      </div>

      <div className="grid grid-2 gap-4 mb-4">
        <Input
          label="Fecha de Inicio"
          type="date"
          value={form.start_date}
          onChange={e => setForm({ ...form, start_date: e.target.value })}
          disabled={justCreated}
        />
        <Input
          label="Fecha de Fin"
          type="date"
          value={form.end_date}
          onChange={e => setForm({ ...form, end_date: e.target.value })}
          disabled={justCreated}
        />
      </div>

      <div className="mb-4">
        <Input
          label="Límite de Inscripción"
          type="date"
          value={form.registration_deadline}
          onChange={e =>
            setForm({ ...form, registration_deadline: e.target.value })
          }
          disabled={justCreated}
        />
      </div>

      <h3 className="mb-3" style={{ fontSize: "1.1rem" }}>
        Precios
      </h3>
      <div className="grid grid-2 gap-4 mb-4">
        <Input
          label="Valor Socio"
          type="number"
          value={form.price_member}
          onChange={e => setForm({ ...form, price_member: e.target.value })}
          disabled={justCreated}
        />
        <Input
          label="Valor No Socio"
          type="number"
          value={form.price_non_member}
          onChange={e => setForm({ ...form, price_non_member: e.target.value })}
          disabled={justCreated}
        />
      </div>

      <div className="grid grid-2 gap-4 mb-4">
        <Input
          label="Valor Nex Gen"
          type="number"
          value={form.price_joven}
          onChange={e => setForm({ ...form, price_joven: e.target.value })}
          disabled={justCreated}
        />
        <Input
          label="Valor Socio Emérito"
          type="number"
          value={form.price_gratuito}
          onChange={e => setForm({ ...form, price_gratuito: e.target.value })}
          disabled={justCreated}
        />
      </div>

      <div className="mb-4">
        <h3 className="mb-3" style={{ fontSize: "1.1rem" }}>
          Imagen del evento{" "}
          {!event && (
            <span className="text-muted text-sm font-normal">(Opcional)</span>
          )}
        </h3>
        {imageUrl && (
          <div className="mb-3">
            <img
              src={getImageUrl(imageUrl)}
              alt="Preview"
              style={{
                maxWidth: "100%",
                maxHeight: "300px",
                borderRadius: "var(--radius-base)",
                border: "1px solid var(--color-border)",
              }}
            />
          </div>
        )}
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={uploadingImage || (!event && !justCreated)}
          asChild
        >
          <label
            style={{
              cursor:
                uploadingImage || (!event && !justCreated)
                  ? "not-allowed"
                  : "pointer",
              margin: 0,
            }}
          >
            {uploadingImage ? "Subiendo..." : "Subir imagen"}
            <input
              type="file"
              accept="image/*"
              style={{ display: "none" }}
              disabled={!event && !justCreated}
              onChange={e => {
                const file = e.target.files?.[0];
                if (file) handleImageUpload(file);
              }}
            />
          </label>
        </Button>
        {!event && !justCreated && (
          <p className="text-muted text-sm mt-2">
            La imagen se puede subir después de crear el evento.
          </p>
        )}
        {justCreated && !imageUrl && (
          <p className="text-muted text-sm mt-2">
            Ahora puedes subir una imagen o cerrar y hacerlo después editando el
            evento.
          </p>
        )}
      </div>

      <div className="mb-4">
        <label
          style={{
            display: "flex",
            alignItems: "center",
            gap: "var(--spacing-2)",
          }}
        >
          <input
            type="checkbox"
            checked={form.is_active}
            onChange={e => setForm({ ...form, is_active: e.target.checked })}
            disabled={justCreated}
          />
          <span>Evento activo</span>
        </label>
      </div>

      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit" variant="primary" disabled={loading}>
          {getButtonText()}
        </Button>
      </div>
    </form>
  );
}

EventForm.propTypes = {
  event: PropTypes.object,
  onSuccess: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired,
};

function OverviewTab({ stats }) {
  return (
    <div>
      <h2 className="mb-24">Resumen General</h2>

      <div className="grid-auto-fit">
        <div className="card card-centered">
          <h3>Postulaciones</h3>
          <div className="large-number-accent">
            {stats.applications?.total || 0}
          </div>
          <div className="small-muted-text">
            {stats.applications?.pending || 0} pendientes •{" "}
            {stats.applications?.payment_pending || 0} esperando pago
          </div>
        </div>

        <div className="card card-centered">
          <h3>Usuarios</h3>
          <div className="large-number-secondary">
            {stats.users?.total || 0}
          </div>
          <div className="small-muted-text">
            {stats.users?.members || 0} socios • {stats.users?.admins || 0}{" "}
            admins
          </div>
        </div>

        <div className="card card-centered">
          <h3>Noticias</h3>
          <div className="large-number-accent">{stats.news?.total || 0}</div>
          <div className="small-muted-text">
            {stats.news?.published || 0} publicadas • {stats.news?.pending || 0}{" "}
            pendientes
          </div>
        </div>
      </div>

      <div className="card">
        <h3 className="mb-16">Estados de Postulaciones</h3>
        <div className="flex-column-gap-8">
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
    if (!type) return "N/A";
    const types = {
      joven: "Nex Gen",
      normal: "Normal",
      gratuito: "Emérito",
    };
    return types[type] || type;
  };

  const getPaymentStatusVariant = status => {
    if (status === "paid") return "success";
    if (status === "due") return "warning";
    return "neutral";
  };

  const getPaymentStatusLabel = status => {
    if (!status || status === "none") return "Sin pago";
    if (status === "paid") return "Pagado";
    if (status === "due") return "Pendiente";
    return status;
  };

  if (loading) {
    return (
      <div className="flex-center" style={{ minHeight: "300px" }}>
        <Spinner size="lg" />
      </div>
    );
  }

  const columns = [
    {
      key: "name",
      label: "Usuario",
      render: row => (
        <div>
          <div style={{ fontWeight: "600", marginBottom: "4px" }}>
            {row.name}
          </div>
          <div style={{ fontSize: "0.875rem", color: "var(--color-muted)" }}>
            {row.email}
          </div>
        </div>
      ),
    },
    {
      key: "role",
      label: "Rol",
      render: row => (
        <Badge variant={row.role === "admin" ? "primary" : "neutral"}>
          {row.role === "admin" ? "Administrador" : "Miembro"}
        </Badge>
      ),
    },
    {
      key: "membership_type",
      label: "Membresía",
      render: row => (
        <span style={{ fontSize: "0.875rem" }}>
          {getMembershipTypeLabel(row.membership_type)}
        </span>
      ),
    },
    {
      key: "payment_status",
      label: "Estado de Pago",
      render: row => (
        <Badge variant={getPaymentStatusVariant(row.payment_status)}>
          {getPaymentStatusLabel(row.payment_status)}
        </Badge>
      ),
    },
    {
      key: "is_active",
      label: "Estado",
      render: row => (
        <Badge variant={row.is_active ? "success" : "error"}>
          {row.is_active ? "Activo" : "Inactivo"}
        </Badge>
      ),
    },
    {
      key: "actions",
      label: "Acciones",
      render: row => (
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate(`/admin/users/${row.id}`)}
          >
            Ver
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate(`/admin/users/${row.id}/edit`)}
          >
            Editar
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div>
      <div className="flex justify-between align-center mb-5">
        <div>
          <h2 style={{ margin: 0, marginBottom: "4px" }}>Usuarios</h2>
          <p style={{ margin: 0, color: "var(--color-muted)" }}>
            {users.length} {users.length === 1 ? "usuario" : "usuarios"} en
            total
          </p>
        </div>
        <Button variant="primary" onClick={() => navigate("/admin/users/new")}>
          + Crear Usuario
        </Button>
      </div>

      {users.length === 0 ? (
        <Alert variant="info">No hay usuarios registrados todavía.</Alert>
      ) : (
        <Table columns={columns} data={users} hoverable />
      )}
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

  const getStatusVariant = status => {
    const variants = {
      pending: "warning",
      approved: "info",
      rejected: "warning",
      payment_pending: "warning",
      paid: "success",
    };
    return variants[status] || "neutral";
  };

  const getStatusLabel = status => {
    if (!status) return "Sin estado";
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
      <div className="flex-center" style={{ minHeight: "300px" }}>
        <Spinner size="lg" />
      </div>
    );
  }

  const columns = [
    {
      key: "name",
      label: "Solicitante",
      render: row => (
        <div>
          <div style={{ fontWeight: "600", marginBottom: "4px" }}>
            {row.name}
          </div>
          <div style={{ fontSize: "0.875rem", color: "var(--color-muted)" }}>
            {row.email}
          </div>
        </div>
      ),
    },
    {
      key: "specialization",
      label: "Especialización",
      render: row => (
        <span style={{ fontSize: "0.875rem" }}>
          {row.specialization || "No especificada"}
        </span>
      ),
    },
    {
      key: "specialization",
      label: "Especialidad",
      render: row => (
        <span style={{ fontSize: "0.875rem" }}>
          {row.specialization || "No especificada"}
        </span>
      ),
    },
    {
      key: "status",
      label: "Estado",
      render: row => (
        <Badge variant={getStatusVariant(row.status)}>
          {getStatusLabel(row.status)}
        </Badge>
      ),
    },
    {
      key: "created_at",
      label: "Fecha",
      render: row => (
        <span style={{ fontSize: "0.875rem", color: "var(--color-muted)" }}>
          {formatDateHelper(row.created_at, "Sin fecha")}
        </span>
      ),
    },
    {
      key: "actions",
      label: "Acciones",
      render: row => (
        <Button
          variant="primary"
          size="sm"
          onClick={() => navigate(`/admin/applications/${row.id}`)}
        >
          Ver Detalles
        </Button>
      ),
    },
  ];

  return (
    <div>
      <div className="flex justify-between align-center mb-5">
        <div>
          <h2 style={{ margin: 0, marginBottom: "4px" }}>Postulaciones</h2>
          <p style={{ margin: 0, color: "var(--color-muted)" }}>
            {applications.length}{" "}
            {applications.length === 1 ? "postulación" : "postulaciones"} en
            total
          </p>
        </div>
      </div>

      {applications.length === 0 ? (
        <Alert variant="info">No hay postulaciones registradas todavía.</Alert>
      ) : (
        <Table columns={columns} data={applications} hoverable />
      )}
    </div>
  );
}

function NewsTab() {
  const navigate = useNavigate();
  const toast = useToast();
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);

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
      rejected: "warning",
    };
    return variants[status] || "neutral";
  };

  const getStatusLabel = status => {
    if (!status) return "Sin estado";

    const labels = {
      published: "Publicada",
      pending: "Pendiente",
      rejected: "Rechazada",
    };
    return labels[status] || status;
  };

  const getCategoryLabel = category => {
    if (!category) return "Sin categoría";

    const labels = {
      comunicados: "Comunicado",
      prensa: "Prensa",
      blog: "Blog",
    };
    return labels[category] || category;
  };

  const handleCreateSuccess = () => {
    setShowCreateModal(false);
    loadNews();
  };

  if (loading) {
    return (
      <div className="flex-center" style={{ minHeight: "300px" }}>
        <Spinner size="lg" />
      </div>
    );
  }

  const columns = [
    {
      key: "title",
      label: "Título",
      render: row => {
        let excerpt = "Sin resumen";
        if (row.excerpt) {
          excerpt =
            row.excerpt.length > 80
              ? row.excerpt.substring(0, 80) + "..."
              : row.excerpt;
        }

        return (
          <div>
            <div style={{ fontWeight: "600", marginBottom: "4px" }}>
              {row.title}
            </div>
            <div style={{ fontSize: "0.875rem", color: "var(--color-muted)" }}>
              {excerpt}
            </div>
          </div>
        );
      },
    },
    {
      key: "category",
      label: "Categoría",
      render: row => (
        <Badge variant="neutral">{getCategoryLabel(row.category)}</Badge>
      ),
    },
    {
      key: "status",
      label: "Estado",
      render: row => (
        <Badge variant={getStatusVariant(row.status)}>
          {getStatusLabel(row.status)}
        </Badge>
      ),
    },
    {
      key: "order_index",
      label: "Orden",
      render: row => (
        <span style={{ fontSize: "0.875rem" }}>{row.order_index}</span>
      ),
    },
    {
      key: "created_at",
      label: "Fecha",
      render: row => (
        <span style={{ fontSize: "0.875rem", color: "var(--color-muted)" }}>
          {formatDateHelper(row.created_at, "Sin fecha")}
        </span>
      ),
    },
    {
      key: "actions",
      label: "Acciones",
      render: row => (
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate(`/noticias/${row.id}`)}
          >
            Ver
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate(`/admin/news/${row.id}/edit`)}
          >
            Editar
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div>
      <div className="flex justify-between align-center mb-5">
        <div>
          <h2 style={{ margin: 0, marginBottom: "4px" }}>Noticias</h2>
          <p style={{ margin: 0, color: "var(--color-muted)" }}>
            {news.length} {news.length === 1 ? "noticia" : "noticias"} en total
          </p>
        </div>
        <Button variant="primary" onClick={() => setShowCreateModal(true)}>
          + Crear noticia
        </Button>
      </div>

      {news.length === 0 ? (
        <Alert variant="info">
          No hay noticias creadas todavía. Haz clic en "Crear noticia" para
          empezar.
        </Alert>
      ) : (
        <Table columns={columns} data={news} hoverable />
      )}

      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Crear nueva noticia"
        size="lg"
      >
        <SimpleNewsForm onSuccess={handleCreateSuccess} />
      </Modal>
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

      // Reset file input if form exists
      if (e.currentTarget) {
        const fileInput = e.currentTarget.querySelector('input[type="file"]');
        if (fileInput) fileInput.value = "";
      }

      if (onSuccess) onSuccess();
    } catch (err) {
      toast.error("Error al crear la noticia");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={submit}>
      <div className="grid grid-2 gap-4 mb-4">
        <Input
          label="Título"
          placeholder="Título de la noticia"
          value={title}
          onChange={e => setTitle(e.target.value)}
          required
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
      </div>
      <div className="mb-4">
        <Input
          label="Resumen"
          placeholder="Resumen breve de la noticia"
          value={excerpt}
          onChange={e => setExcerpt(e.target.value)}
        />
      </div>
      <div className="mb-4">
        <Textarea
          label="Contenido"
          placeholder="Contenido completo de la noticia"
          value={content}
          onChange={e => setContent(e.target.value)}
          rows={6}
        />
      </div>
      <div className="mb-4">
        <label htmlFor="news-image-quick" className="block mb-2 font-medium">
          Imagen (opcional)
        </label>
        <input
          id="news-image-quick"
          name="image"
          type="file"
          accept="image/*"
          className="w-full p-2"
          style={{
            border: "1px solid var(--color-border)",
            borderRadius: "var(--radius-base)",
          }}
        />
      </div>
      <div className="flex justify-center gap-2">
        <Button type="submit" variant="primary" disabled={loading}>
          {loading ? "Creando..." : "Crear noticia"}
        </Button>
      </div>
    </form>
  );
}

SimpleNewsForm.propTypes = {
  onSuccess: PropTypes.func,
};
