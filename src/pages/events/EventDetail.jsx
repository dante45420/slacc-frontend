import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../../auth/AuthContext.jsx";
import { apiGet } from "../../api/client.js";
import Section from "../../components/ui/Section.jsx";
import Button from "../../components/ui/Button.jsx";
import Card from "../../components/ui/Card.jsx";
import Badge from "../../components/ui/Badge.jsx";
import Spinner from "../../components/ui/Spinner.jsx";
import Alert from "../../components/ui/Alert.jsx";
import { useToast } from "../../components/ui/Toast.jsx";
import { sanitizeHtml } from "../../utils/sanitize.js";

const BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";

export default function EventDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const toast = useToast();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [enrolling, setEnrolling] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        const data = await apiGet(`/events/${id}`);
        setEvent(data);
      } catch (e) {
        setError(e.message || "Error cargando evento");
      } finally {
        setLoading(false);
      }
    }
    if (id) load();
  }, [id]);

  const handleEnroll = async () => {
    if (!user) {
      toast.error("Debes iniciar sesión para inscribirte");
      navigate("/login");
      return;
    }

    setEnrolling(true);
    try {
      const token = localStorage.getItem("access_token");
      const res = await fetch(`${BASE_URL}/events/${id}/enroll`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: user.name || user.email,
          email: user.email,
          phone: user.phone || "",
        }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Error al inscribirse");
      }

      const data = await res.json();
      toast.success(
        "¡Inscripción exitosa! " +
          (data.message || "Revisa tu email para más detalles")
      );

      // Reload event data to show updated enrollment status
      const eventData = await apiGet(`/events/${id}`);
      setEvent(eventData);
    } catch (err) {
      toast.error(err.message || "Error al procesar la inscripción");
    } finally {
      setEnrolling(false);
    }
  };

  if (loading) {
    return (
      <Section variant="default">
        <div style={{ textAlign: "center", padding: "var(--spacing-8)" }}>
          <Spinner size="lg" />
          <p
            style={{
              marginTop: "var(--spacing-4)",
              color: "var(--color-muted)",
            }}
          >
            Cargando evento...
          </p>
        </div>
      </Section>
    );
  }

  if (error || !event) {
    return (
      <Section variant="default">
        <Alert variant="error">{error || "Evento no encontrado"}</Alert>
      </Section>
    );
  }

  const formatType = event.format === "webinar" ? "Webinar" : "Presencial";

  return (
    <Section variant="default" padding="lg">
      <Button
        variant="outline"
        onClick={() => navigate(-1)}
        style={{ marginBottom: "var(--spacing-4)" }}
      >
        <i className="fa-solid fa-arrow-left"></i> Volver
      </Button>

      <Card style={{ padding: "var(--spacing-6)" }}>
        {event.image_url && (
          <img
            src={
              event.image_url.startsWith("http")
                ? event.image_url
                : `${BASE_URL.replace("/api", "")}${event.image_url}`
            }
            alt={event.title}
            style={{
              width: "100%",
              maxHeight: 400,
              objectFit: "cover",
              borderRadius: "var(--radius-lg)",
              marginBottom: "var(--spacing-5)",
            }}
          />
        )}

        <div style={{ marginBottom: "var(--spacing-4)" }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
              marginBottom: "var(--spacing-3)",
              flexWrap: "wrap",
              gap: "var(--spacing-3)",
            }}
          >
            <h1 style={{ margin: 0, flex: 1 }}>{event.title}</h1>
            <Badge
              variant={event.format === "webinar" ? "info" : "secondary"}
              size="md"
            >
              {formatType}
            </Badge>
          </div>

          <p
            style={{
              color: "var(--color-muted)",
              fontSize: "18px",
              lineHeight: 1.7,
            }}
          >
            {event.description}
          </p>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
            gap: "var(--spacing-4)",
            padding: "var(--spacing-5)",
            background: "var(--color-bg-alt)",
            borderRadius: "var(--radius)",
            marginBottom: "var(--spacing-5)",
          }}
        >
          <div>
            <strong style={{ color: "var(--color-text-secondary)" }}>
              Instructor
            </strong>
            <p style={{ margin: "var(--spacing-1) 0 0" }}>
              {event.instructor || "Por definir"}
            </p>
          </div>
          <div>
            <strong style={{ color: "var(--color-text-secondary)" }}>
              Duración
            </strong>
            <p style={{ margin: "var(--spacing-1) 0 0" }}>
              {event.duration_hours || "N/A"} horas
            </p>
          </div>
          <div>
            <strong style={{ color: "var(--color-text-secondary)" }}>
              Inicio
            </strong>
            <p style={{ margin: "var(--spacing-1) 0 0" }}>
              {event.start_date
                ? new Date(event.start_date).toLocaleDateString("es-ES", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })
                : "Por confirmar"}
            </p>
          </div>
          <div>
            <strong style={{ color: "var(--color-text-secondary)" }}>
              Formato
            </strong>
            <p style={{ margin: "var(--spacing-1) 0 0" }}>{formatType}</p>
          </div>
        </div>

        {event.content && (
          <div
            dangerouslySetInnerHTML={{ __html: sanitizeHtml(event.content) }}
            style={{
              lineHeight: 1.8,
              color: "var(--color-text-secondary)",
            }}
          />
        )}

        <div
          style={{
            marginTop: "var(--spacing-6)",
            paddingTop: "var(--spacing-5)",
            borderTop: "1px solid var(--color-border)",
          }}
        >
          <Button
            variant="primary"
            size="lg"
            onClick={handleEnroll}
            disabled={enrolling || event.is_enrolled}
          >
            {event.is_enrolled && "Ya estás inscrito"}
            {!event.is_enrolled && enrolling && "Procesando..."}
            {!event.is_enrolled && !enrolling && "Inscribirse al evento"}
          </Button>
        </div>
      </Card>
    </Section>
  );
}
