import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useAuth } from "../../auth/AuthContext";
import Modal from "../../components/ui/Modal";

const BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";

export default function EventDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState(false);
  const [form, setForm] = useState({
    name: user?.name || "",
    email: user?.email || "",
    phone: "",
  });

  const isAdmin = user?.role === "admin";

  useEffect(() => {
    async function load() {
      setLoading(true);
      const res = await fetch(`${BASE_URL}/events/${id}`);
      const data = await res.json();
      setEvent(data);
      setLoading(false);
    }
    if (id) load();
  }, [id]);

  useEffect(() => {
    if (user) {
      setForm(prev => ({
        ...prev,
        name: user.name || prev.name,
        email: user.email || prev.email,
      }));
    }
  }, [user]);

  async function enroll() {
    const token = localStorage.getItem("access_token");
    const headers = { "Content-Type": "application/json" };
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    const res = await fetch(`${BASE_URL}/events/${id}/enroll`, {
      method: "POST",
      headers,
      body: JSON.stringify(form),
    });
    const data = await res.json();
    if (!res.ok) return alert(data.error || "No se pudo inscribir");
    alert("Inscripción confirmada. Recibirás un correo con instrucciones.");
    setEnrolling(false);
  }

  if (loading)
    return (
      <section className="section">
        <div className="container">Cargando evento...</div>
      </section>
    );
  if (!event)
    return (
      <section className="section">
        <div className="container">Evento no encontrado</div>
      </section>
    );

  return (
    <section className="section">
      <div className="container">
        <div className="card" style={{ padding: 16 }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <h1>{event.title}</h1>
            <span
              style={{
                background:
                  event.format === "webinar"
                    ? "var(--color-accent)"
                    : "var(--color-secondary)",
                color: "white",
                padding: "4px 12px",
                borderRadius: 16,
              }}
            >
              {event.format === "webinar" ? "Webinar" : "Presencial"}
            </span>
          </div>
          {event.image_url && (
            <div style={{ margin: "12px 0" }}>
              <img
                src={
                  event.image_url.startsWith("http")
                    ? event.image_url
                    : BASE_URL.replace("/api", "") + event.image_url
                }
                alt={event.title}
                style={{
                  width: "100%",
                  maxHeight: 320,
                  objectFit: "cover",
                  borderRadius: 8,
                }}
              />
            </div>
          )}
          <p style={{ color: "var(--color-muted)" }}>{event.description}</p>
          <p>
            <strong>Fecha:</strong>{" "}
            {event.start_date
              ? new Date(event.start_date).toLocaleDateString("es-ES")
              : "Por confirmar"}
          </p>
          <p>
            <strong>Valor:</strong> ${event.price_for_user}
          </p>
          {!isAdmin && (
            <button
              className="btn btn-primary"
              onClick={() => setEnrolling(true)}
              disabled={event.is_enrolled}
            >
              {event.is_enrolled ? "Ya estás inscrito" : "Inscribirse"}
            </button>
          )}
        </div>
      </div>

      {!isAdmin && (
        <Modal
          isOpen={enrolling}
          onClose={() => setEnrolling(false)}
          title={`Inscripción: ${event.title}`}
        >
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <input
              placeholder="Nombre"
              value={form.name}
              onChange={e => setForm({ ...form, name: e.target.value })}
            />
            <input
              placeholder="Email"
              value={form.email}
              onChange={e => setForm({ ...form, email: e.target.value })}
            />
            <input
              placeholder="Teléfono"
              value={form.phone}
              onChange={e => setForm({ ...form, phone: e.target.value })}
            />
            <button className="btn btn-primary" onClick={enroll}>
              Confirmar inscripción
            </button>
          </div>
        </Modal>
      )}
    </section>
  );
}
