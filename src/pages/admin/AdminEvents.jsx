import { useEffect, useState } from "react";
import PropTypes from "prop-types";
import {
  Section,
  Container,
  Card,
  Input,
  Select,
  Button,
  Badge,
  Table,
  Modal,
  Spinner,
  Alert,
  useToast,
} from "../../components/ui";

const BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";

const initialFormState = {
  title: "",
  description: "",
  instructor: "",
  duration_hours: "",
  format: "webinar",
  max_students: "",
  price_member: "",
  price_non_member: "",
  price_joven: "",
  price_gratuito: "",
  start_date: "",
  end_date: "",
  registration_deadline: "",
  is_active: true,
  image_url: "",
};

export default function AdminEvents() {
  const toast = useToast();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [enrollmentsModal, setEnrollmentsModal] = useState({
    open: false,
    data: null,
  });
  const [form, setForm] = useState(initialFormState);

  useEffect(() => {
    loadEvents();
  }, []);

  async function loadEvents() {
    try {
      setLoading(true);
      const token = localStorage.getItem("access_token");
      const res = await fetch(`${BASE_URL}/admin/events`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setEvents(data);
    } catch (err) {
      toast.error("Error al cargar eventos");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function createEvent() {
    try {
      const token = localStorage.getItem("access_token");
      const res = await fetch(`${BASE_URL}/admin/events`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(form),
      });

      if (res.ok) {
        toast.success("Evento creado correctamente");
        setForm(initialFormState);
        loadEvents();
      } else {
        const data = await res.json();
        toast.error(data.error || "No se pudo crear el evento");
      }
    } catch (err) {
      toast.error("Error al crear el evento");
      console.error(err);
    }
  }

  async function updateEvent(event) {
    try {
      const token = localStorage.getItem("access_token");
      const res = await fetch(`${BASE_URL}/admin/events/${event.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(event),
      });

      if (res.ok) {
        toast.success("Evento actualizado correctamente");
        loadEvents();
      } else {
        const data = await res.json();
        toast.error(data.error || "No se pudo actualizar");
      }
    } catch (err) {
      toast.error("Error al actualizar el evento");
      console.error(err);
    }
  }

  async function removeEvent(id) {
    if (!confirm("¿Estás seguro de eliminar este evento?")) return;

    try {
      const token = localStorage.getItem("access_token");
      const res = await fetch(`${BASE_URL}/admin/events/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        toast.success("Evento eliminado correctamente");
        loadEvents();
      } else {
        const data = await res.json();
        toast.error(data.error || "No se pudo eliminar");
      }
    } catch (err) {
      toast.error("Error al eliminar el evento");
      console.error(err);
    }
  }

  async function viewEnrollments(id) {
    try {
      const token = localStorage.getItem("access_token");
      const res = await fetch(`${BASE_URL}/admin/events/${id}/enrollments`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setEnrollmentsModal({ open: true, data });
    } catch (err) {
      toast.error("Error al cargar inscritos");
      console.error(err);
    }
  }

  async function uploadImage(eventId, file) {
    try {
      const token = localStorage.getItem("access_token");
      const fd = new FormData();
      fd.append("image", file);
      const res = await fetch(`${BASE_URL}/admin/events/${eventId}/image`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: fd,
      });

      if (res.ok) {
        toast.success("Imagen subida correctamente");
        loadEvents();
      } else {
        const data = await res.json();
        toast.error(data.error || "Error al subir imagen");
      }
    } catch (err) {
      toast.error("Error al subir la imagen");
      console.error(err);
    }
  }

  function getImageUrl(url) {
    if (!url) return null;
    if (url.startsWith("http")) return url;
    return BASE_URL.replace("/api", "") + url;
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

  return (
    <Section>
      <Container>
        <h2 className="mb-6">Gestión de Eventos y Cursos</h2>

        <Card className="mb-8">
          <h3 className="mb-4">Crear nuevo evento</h3>
          <div className="grid grid-2 gap-4 mb-4">
            <Input
              label="Título"
              value={form.title}
              onChange={e => setForm({ ...form, title: e.target.value })}
              placeholder="Título del evento"
            />
            <Select
              label="Formato"
              value={form.format}
              onChange={e => setForm({ ...form, format: e.target.value })}
            >
              <option value="webinar">Webinar</option>
              <option value="presencial">Presencial</option>
            </Select>
            <Input
              label="Instructor"
              value={form.instructor}
              onChange={e => setForm({ ...form, instructor: e.target.value })}
              placeholder="Nombre del instructor"
            />
            <Input
              label="Capacidad máxima"
              type="number"
              value={form.max_students}
              onChange={e =>
                setForm({ ...form, max_students: Number(e.target.value) })
              }
              placeholder="Número de estudiantes"
            />
            <Input
              label="Precio socio"
              type="number"
              value={form.price_member}
              onChange={e =>
                setForm({ ...form, price_member: Number(e.target.value) })
              }
              placeholder="0"
            />
            <Input
              label="Precio no socio"
              type="number"
              value={form.price_non_member}
              onChange={e =>
                setForm({ ...form, price_non_member: Number(e.target.value) })
              }
              placeholder="0"
            />
            <Input
              label="Precio joven"
              type="number"
              value={form.price_joven}
              onChange={e =>
                setForm({ ...form, price_joven: Number(e.target.value) })
              }
              placeholder="0"
            />
            <Input
              label="Precio gratuito"
              type="number"
              value={form.price_gratuito}
              onChange={e =>
                setForm({ ...form, price_gratuito: Number(e.target.value) })
              }
              placeholder="0"
            />
            <Input
              label="Fecha inicio"
              type="date"
              value={form.start_date}
              onChange={e => setForm({ ...form, start_date: e.target.value })}
            />
            <Input
              label="Fecha fin"
              type="date"
              value={form.end_date}
              onChange={e => setForm({ ...form, end_date: e.target.value })}
            />
            <Input
              label="Límite inscripción"
              type="date"
              value={form.registration_deadline}
              onChange={e =>
                setForm({ ...form, registration_deadline: e.target.value })
              }
            />
          </div>
          <Button variant="primary" onClick={createEvent}>
            Crear evento
          </Button>
        </Card>

        <div className="mb-4 flex-between">
          <h3>Eventos existentes ({events.length})</h3>
        </div>

        {events.length === 0 ? (
          <Alert variant="info">No hay eventos creados todavía.</Alert>
        ) : (
          <div className="grid gap-6">
            {events.map(event => (
              <EventCard
                key={event.id}
                event={event}
                onUpdate={updateEvent}
                onDelete={removeEvent}
                onViewEnrollments={viewEnrollments}
                onUploadImage={uploadImage}
                getImageUrl={getImageUrl}
              />
            ))}
          </div>
        )}

        <EnrollmentsModal
          modal={enrollmentsModal}
          onClose={() => setEnrollmentsModal({ open: false, data: null })}
        />
      </Container>
    </Section>
  );
}

function EventCard({
  event,
  onUpdate,
  onDelete,
  onViewEnrollments,
  onUploadImage,
  getImageUrl,
}) {
  const [localEvent, setLocalEvent] = useState(event);

  const handleChange = (field, value) => {
    setLocalEvent({ ...localEvent, [field]: value });
  };

  return (
    <Card>
      <div className="flex-between mb-4">
        <h4>{localEvent.title || "Sin título"}</h4>
        <Badge variant={localEvent.format === "webinar" ? "info" : "success"}>
          {localEvent.format === "webinar" ? "Webinar" : "Presencial"}
        </Badge>
      </div>

      {localEvent.image_url && (
        <img
          src={getImageUrl(localEvent.image_url)}
          alt={localEvent.title}
          className="mb-4"
          style={{
            width: "100%",
            height: "200px",
            objectFit: "cover",
            borderRadius: "var(--radius-base)",
          }}
        />
      )}

      <div className="grid grid-2 gap-4 mb-4">
        <Input
          label="Título"
          value={localEvent.title || ""}
          onChange={e => handleChange("title", e.target.value)}
        />
        <Select
          label="Formato"
          value={localEvent.format || "webinar"}
          onChange={e => handleChange("format", e.target.value)}
        >
          <option value="webinar">Webinar</option>
          <option value="presencial">Presencial</option>
        </Select>
        <Input
          label="Instructor"
          value={localEvent.instructor || ""}
          onChange={e => handleChange("instructor", e.target.value)}
        />
        <Input
          label="Capacidad"
          type="number"
          value={localEvent.max_students || ""}
          onChange={e => handleChange("max_students", Number(e.target.value))}
        />
        <Input
          label="Precio socio"
          type="number"
          value={localEvent.price_member || 0}
          onChange={e => handleChange("price_member", Number(e.target.value))}
        />
        <Input
          label="Precio no socio"
          type="number"
          value={localEvent.price_non_member || 0}
          onChange={e =>
            handleChange("price_non_member", Number(e.target.value))
          }
        />
        <Input
          label="Precio joven"
          type="number"
          value={localEvent.price_joven || 0}
          onChange={e => handleChange("price_joven", Number(e.target.value))}
        />
        <Input
          label="Precio gratuito"
          type="number"
          value={localEvent.price_gratuito || 0}
          onChange={e => handleChange("price_gratuito", Number(e.target.value))}
        />
        <Input
          label="Fecha inicio"
          type="date"
          value={
            localEvent.start_date ? localEvent.start_date.substring(0, 10) : ""
          }
          onChange={e => handleChange("start_date", e.target.value)}
        />
        <Input
          label="Fecha fin"
          type="date"
          value={
            localEvent.end_date ? localEvent.end_date.substring(0, 10) : ""
          }
          onChange={e => handleChange("end_date", e.target.value)}
        />
        <Input
          label="Límite inscripción"
          type="date"
          value={
            localEvent.registration_deadline
              ? localEvent.registration_deadline.substring(0, 10)
              : ""
          }
          onChange={e => handleChange("registration_deadline", e.target.value)}
        />
      </div>

      <div className="flex-start gap-2 flex-wrap">
        <Button variant="primary" onClick={() => onUpdate(localEvent)}>
          Guardar cambios
        </Button>
        <Button variant="outline" onClick={() => onViewEnrollments(event.id)}>
          Ver inscritos
        </Button>
        <Button variant="outline" onClick={() => onDelete(event.id)}>
          Eliminar
        </Button>
        <Button variant="outline" asChild>
          <label style={{ cursor: "pointer", margin: 0 }}>
            Subir imagen
            <input
              type="file"
              accept="image/*"
              style={{ display: "none" }}
              onChange={e => {
                const file = e.target.files?.[0];
                if (file) onUploadImage(event.id, file);
              }}
            />
          </label>
        </Button>
      </div>
    </Card>
  );
}

EventCard.propTypes = {
  event: PropTypes.object.isRequired,
  onUpdate: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
  onViewEnrollments: PropTypes.func.isRequired,
  onUploadImage: PropTypes.func.isRequired,
  getImageUrl: PropTypes.func.isRequired,
};

function EnrollmentsModal({ modal, onClose }) {
  const open = !!modal?.open;
  const data = modal?.data;

  if (!open || !data) return null;

  const event = data.event || {};
  const enrollments = Array.isArray(data.enrollments) ? data.enrollments : [];
  const validEnrollments = enrollments.filter(
    e => e.payment_status !== "cancelled"
  );
  const capacity = event.max_students || null;
  const seatsLeft = capacity
    ? Math.max(0, capacity - validEnrollments.length)
    : null;

  const columns = [
    {
      key: "student_name",
      label: "Nombre",
    },
    {
      key: "student_email",
      label: "Email",
    },
    {
      key: "student_phone",
      label: "Teléfono",
      render: row => row.student_phone || "-",
    },
    {
      key: "payment_status",
      label: "Estado pago",
      render: row => (
        <Badge
          variant={
            row.payment_status === "paid"
              ? "success"
              : row.payment_status === "pending"
              ? "warning"
              : "default"
          }
        >
          {row.payment_status}
        </Badge>
      ),
    },
    {
      key: "payment_amount",
      label: "Monto",
      render: row => `$${row.payment_amount}`,
    },
  ];

  return (
    <Modal
      isOpen={open}
      onClose={onClose}
      title={`Inscritos: ${event.title || ""}`}
      size="large"
    >
      <div className="mb-4 flex-start gap-4 text-muted">
        <span>
          <strong>Capacidad:</strong> {capacity ?? "Sin límite"}
        </span>
        <span>
          <strong>Inscritos:</strong> {validEnrollments.length}
        </span>
        <span>
          <strong>Disponibles:</strong> {seatsLeft ?? "—"}
        </span>
      </div>

      {validEnrollments.length === 0 ? (
        <Alert variant="info">No hay inscritos aún.</Alert>
      ) : (
        <Table columns={columns} data={validEnrollments} striped hoverable />
      )}

      <div className="flex-end mt-4">
        <Button variant="outline" onClick={onClose}>
          Cerrar
        </Button>
      </div>
    </Modal>
  );
}

EnrollmentsModal.propTypes = {
  modal: PropTypes.shape({
    open: PropTypes.bool,
    data: PropTypes.shape({
      event: PropTypes.object,
      enrollments: PropTypes.array,
    }),
  }),
  onClose: PropTypes.func.isRequired,
};
