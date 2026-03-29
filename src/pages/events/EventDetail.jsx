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

function formatDate(dateString, options = {}) {
  if (!dateString) return null;
  const defaultOpts = { year: "numeric", month: "long", day: "numeric" };
  return new Date(dateString).toLocaleDateString("es-ES", { ...defaultOpts, ...options });
}

function formatDateTime(dateString) {
  if (!dateString) return null;
  return new Date(dateString).toLocaleDateString("es-ES", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatPrice(price) {
  if (price === 0) return "Gratis";
  if (!price) return null;
  return `$${price.toLocaleString("es-CL")}`;
}

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
  const isRegistrationClosed = event.registration_deadline
    ? new Date(event.registration_deadline) < new Date()
    : false;

  const hasPricing = event.price_member > 0 || event.price_non_member > 0;
  const hasCapacity = event.max_students && event.max_students > 0;

  return (
    <Section variant="default" padding="lg">
      <Button variant="outline" onClick={() => navigate(-1)} className="mb-4">
        <i className="fa-solid fa-arrow-left"></i> Volver
      </Button>

      <div className="event-detail-layout">
        {/* Main Content */}
        <Card className="event-detail-main">
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
            <div className="event-detail-header-top">
              <div className="event-detail-badges">
                <Badge
                  variant={event.format === "webinar" ? "info" : "secondary"}
                  size="md"
                >
                  <i className={`fa-solid ${event.format === "webinar" ? "fa-video" : "fa-location-dot"}`}></i>
                  {formatType}
                </Badge>
                {isRegistrationClosed && (
                  <Badge variant="error" size="md">
                    <i className="fa-solid fa-lock"></i>
                    Inscripción cerrada
                  </Badge>
                )}
                {event.is_enrolled && (
                  <Badge variant="success" size="md">
                    <i className="fa-solid fa-check"></i>
                    Inscrito
                  </Badge>
                )}
              </div>
              {hasCapacity && (
                <div className="event-detail-spots">
                  <i className="fa-solid fa-users"></i>
                  <span>
                    {event.enrollment_count !== undefined
                      ? `${event.enrollment_count} / ${event.max_students}`
                      : event.max_students}{" "}
                    cupos
                  </span>
                </div>
              )}
            </div>

            <h1 className="event-detail-title">{event.title}</h1>

            {event.description && (
              <p className="event-detail-description">{event.description}</p>
            )}
          </div>

          {event.content && (
            <div className="event-detail-content-section">
              <h2 className="event-detail-section-title">
                <i className="fa-solid fa-info-circle"></i> Descripción del evento
              </h2>
              <div
                dangerouslySetInnerHTML={{ __html: sanitizeHtml(event.content) }}
                className="event-detail-content"
              />
            </div>
          )}

          {event.instructor && (
            <div className="event-detail-instructor-section">
              <h2 className="event-detail-section-title">
                <i className="fa-solid fa-chalkboard-user"></i> Instructor
              </h2>
              <div className="event-detail-instructor">
                <div className="event-detail-instructor-avatar">
                  <i className="fa-solid fa-user"></i>
                </div>
                <div className="event-detail-instructor-info">
                  <strong>{event.instructor}</strong>
                </div>
              </div>
            </div>
          )}
        </Card>

        {/* Sidebar */}
        <div className="event-detail-sidebar">
          {/* Date & Time Card */}
          <Card className="event-detail-sidebar-card">
            <h3 className="event-detail-sidebar-title">
              <i className="fa-solid fa-calendar"></i> Fecha y Hora
            </h3>
            <div className="event-detail-info-list">
              <div className="event-detail-info-item">
                <span className="event-detail-info-label">Inicio</span>
                <span className="event-detail-info-value">
                  {formatDateTime(event.start_date) || "Por confirmar"}
                </span>
              </div>
              {event.end_date && (
                <div className="event-detail-info-item">
                  <span className="event-detail-info-label">Término</span>
                  <span className="event-detail-info-value">
                    {formatDateTime(event.end_date)}
                  </span>
                </div>
              )}
              {event.duration_hours && (
                <div className="event-detail-info-item">
                  <span className="event-detail-info-label">Duración</span>
                  <span className="event-detail-info-value">
                    {event.duration_hours} {event.duration_hours === 1 ? "hora" : "horas"}
                  </span>
                </div>
              )}
              {event.registration_deadline && (
                <div className="event-detail-info-item">
                  <span className="event-detail-info-label">Inscripciones hasta</span>
                  <span
                    className="event-detail-info-value"
                    style={isRegistrationClosed ? { color: "var(--color-error)" } : {}}
                  >
                    {formatDate(event.registration_deadline)}
                    {isRegistrationClosed && " (cerrado)"}
                  </span>
                </div>
              )}
            </div>
          </Card>

          {/* Location Card */}
          <Card className="event-detail-sidebar-card">
            <h3 className="event-detail-sidebar-title">
              <i className="fa-solid fa-location-dot"></i> Ubicación
            </h3>
            <div className="event-detail-info-list">
              <div className="event-detail-info-item">
                <span className="event-detail-info-label">Formato</span>
                <span className="event-detail-info-value">{formatType}</span>
              </div>
              {event.location && (
                <div className="event-detail-info-item">
                  <span className="event-detail-info-label">
                    {event.format === "webinar" ? "Plataforma" : "Dirección"}
                  </span>
                  <span className="event-detail-info-value">{event.location}</span>
                </div>
              )}
            </div>
          </Card>

          {/* Pricing Card */}
          {hasPricing && (
            <Card className="event-detail-sidebar-card">
              <h3 className="event-detail-sidebar-title">
                <i className="fa-solid fa-ticket"></i> Precios
              </h3>
              <div className="event-detail-pricing">
                <div className="event-detail-price-item">
                  <span className="event-detail-price-label">Socios</span>
                  <span className="event-detail-price-value event-detail-price-member">
                    {formatPrice(event.price_member)}
                  </span>
                </div>
                <div className="event-detail-price-item">
                  <span className="event-detail-price-label">No socios</span>
                  <span className="event-detail-price-value">
                    {formatPrice(event.price_non_member)}
                  </span>
                </div>
                {event.price_joven > 0 && (
                  <div className="event-detail-price-item">
                    <span className="event-detail-price-label">Socios jóvenes</span>
                    <span className="event-detail-price-value event-detail-price-member">
                      {formatPrice(event.price_joven)}
                    </span>
                  </div>
                )}
              </div>
            </Card>
          )}
        </div>

        {/* Enroll Button - centered below all content */}
        <div className="event-detail-enroll-container">
          <Button
            variant="primary"
            onClick={handleEnroll}
            disabled={enrolling || event.is_enrolled || isRegistrationClosed}
            className="event-detail-enroll-btn"
          >
            {isRegistrationClosed && (
              <>
                <i className="fa-solid fa-lock"></i> La inscripción ya cerró
              </>
            )}
            {!isRegistrationClosed && event.is_enrolled && (
              <>
                <i className="fa-solid fa-check"></i> Ya estás inscrito
              </>
            )}
            {!isRegistrationClosed && !event.is_enrolled && enrolling && (
              <>
                <Spinner size="sm" /> Procesando...
              </>
            )}
            {!isRegistrationClosed && !event.is_enrolled && !enrolling && (
              <>
                <i className="fa-solid fa-pen-to-square"></i> Inscribirse al evento
              </>
            )}
          </Button>
        </div>
      </div>
    </Section>
  );
}
