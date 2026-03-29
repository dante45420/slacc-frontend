import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../../auth/AuthContext.jsx";
import { apiGet, apiPost } from "../../api/client.js";
import Section from "../../components/ui/Section.jsx";
import Button from "../../components/ui/Button.jsx";
import Card from "../../components/ui/Card.jsx";
import Badge from "../../components/ui/Badge.jsx";
import Spinner from "../../components/ui/Spinner.jsx";
import Alert from "../../components/ui/Alert.jsx";
import { useToast } from "../../components/ui/Toast.jsx";
import { sanitizeHtml } from "../../utils/sanitize.js";

const API_ORIGIN = import.meta.env.VITE_API_ORIGIN || "http://localhost:5000";

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
      const data = await apiPost(`/events/${id}/enroll`, {
        name: user.name || user.email,
        email: user.email,
        phone: user.phone || "",
      });

      toast.success(
        "¡Inscripción exitosa! " +
          (data.message || "Revisa tu email para más detalles"),
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
        <div className="event-detail-loading">
          <Spinner size="lg" />
          <p className="event-detail-loading-text">Cargando evento...</p>
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

  // Check if registration deadline has passed
  const isRegistrationClosed = event.registration_deadline
    ? new Date(event.registration_deadline) < new Date()
    : false;

  return (
    <Section variant="default" padding="lg">
      <Button variant="outline" onClick={() => navigate(-1)} className="mb-4">
        <i className="fa-solid fa-arrow-left"></i> Volver
      </Button>

      <Card className="event-detail-card">
        {event.image_url && (
          <img
            src={
              event.image_url.startsWith("http")
                ? event.image_url
                : `${API_ORIGIN}${event.image_url}`
            }
            alt={event.title}
            className="event-detail-image"
          />
        )}

        <div className="event-detail-header">
          <div className="event-detail-title-row">
            <h1 className="event-detail-title">{event.title}</h1>
            <Badge
              variant={event.format === "webinar" ? "info" : "secondary"}
              size="md"
            >
              {formatType}
            </Badge>
          </div>

          <p className="event-detail-description">{event.description}</p>
        </div>

        <div className="event-detail-meta-grid">
          <div>
            <strong className="event-detail-meta-label">Instructor</strong>
            <p className="event-detail-meta-value">
              {event.instructor || "Por definir"}
            </p>
          </div>
          <div>
            <strong className="event-detail-meta-label">Duración</strong>
            <p className="event-detail-meta-value">
              {event.duration_hours || "N/A"} horas
            </p>
          </div>
          <div>
            <strong className="event-detail-meta-label">Inicio</strong>
            <p className="event-detail-meta-value">
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
            <strong className="event-detail-meta-label">Formato</strong>
            <p className="event-detail-meta-value">{formatType}</p>
          </div>
          {event.registration_deadline && (
            <div>
              <strong className="event-detail-meta-label">Límite de inscripción</strong>
              <p className="event-detail-meta-value" style={isRegistrationClosed ? { color: 'var(--color-error)' } : {}}>
                {new Date(event.registration_deadline).toLocaleDateString("es-ES", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
                {isRegistrationClosed && " (cerrado)"}
              </p>
            </div>
          )}
        </div>

        {event.content && (
          <div
            dangerouslySetInnerHTML={{ __html: sanitizeHtml(event.content) }}
            className="event-detail-content"
          />
        )}

        <div className="event-detail-actions">
          <Button
            variant="primary"
            size="lg"
            onClick={handleEnroll}
            disabled={enrolling || event.is_enrolled || isRegistrationClosed}
          >
            {isRegistrationClosed && "La inscripción ya cerró"}
            {!isRegistrationClosed && event.is_enrolled && "Ya estás inscrito"}
            {!isRegistrationClosed && !event.is_enrolled && enrolling && "Procesando..."}
            {!isRegistrationClosed && !event.is_enrolled && !enrolling && "Inscribirse al evento"}
          </Button>
        </div>
      </Card>
    </Section>
  );
}
