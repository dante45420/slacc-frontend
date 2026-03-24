import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import PropTypes from "prop-types";
import { apiGet, apiPost } from "../../api/client";
import { useAuth } from "../../auth/AuthContext";

const BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";

function formatDate(dateString) {
  if (!dateString) return "Por definir";
  return new Date(dateString).toLocaleDateString("es-ES", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function isRegistrationOpen(event) {
  if (!event.registration_deadline) return true;
  return new Date() <= new Date(event.registration_deadline);
}

export default function EventsPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [showEnrollmentForm, setShowEnrollmentForm] = useState(false);

  // Determine filter from URL path
  const getFilterParams = () => {
    const path = location.pathname;
    if (path.includes("/pasados")) return "?past=true";
    if (path.includes("/proximos")) return "?past=false";
    if (path.includes("/webinars")) return "?type=webinar";
    return "";
  };

  useEffect(() => {
    loadEvents();
  }, [location.pathname]);

  async function loadEvents() {
    try {
      setLoading(true);
      const filterParams = getFilterParams();
      const data = await apiGet(`/events${filterParams}`);
      setEvents(data);
    } catch (err) {
      console.error("Error loading events:", err);
    } finally {
      setLoading(false);
    }
  }

  function handleEnrollClick(event) {
    setSelectedEvent(event);
    setShowEnrollmentForm(true);
  }

  function getPriceForUser(event) {
    if (!user) {
      return event.price_non_member;
    }

    let price;
    if (user.membership_type === "joven") {
      price = event.price_joven > 0 ? event.price_joven : event.price_member;
    } else if (user.membership_type === "gratuito") {
      price = Math.max(event.price_gratuito, 0);
    } else {
      price = event.price_member;
    }
    return price;
  }

  function getDiscountPercentage(event) {
    const fullPrice = event.price_non_member;
    const userPrice = getPriceForUser(event);
    if (fullPrice > 0 && userPrice < fullPrice) {
      return Math.round(((fullPrice - userPrice) / fullPrice) * 100);
    }
    return 0;
  }

  if (loading) {
    return (
      <section className="section">
        <div className="container">
          <p>Cargando eventos...</p>
        </div>
      </section>
    );
  }

  return (
    <section className="section events-page">
      <div className="container events-page-container">
        <div className="events-page-header">
          <h1 className="events-page-title">Eventos y Educación Continua</h1>
          <p className="events-page-subtitle">
            Amplía tus conocimientos con nuestros eventos especializados en
            cirugía de cadera
          </p>
        </div>

        {events.length === 0 ? (
          <div className="events-empty-state">
            <div className="events-empty-title">
              No hay eventos disponibles en este momento
            </div>
            <p className="events-empty-description">
              Pronto tendremos nuevos eventos disponibles. ¡Mantente atento!
            </p>
          </div>
        ) : (
          <div className="cards events-grid">
            {events.map(event => {
              const userPrice = getPriceForUser(event);
              const discount = getDiscountPercentage(event);
              const isOpen = isRegistrationOpen(event);

              return (
                <div key={event.id} className="card event-list-card">
                  {event.image_url && (
                    <img
                      src={
                        event.image_url.startsWith("http")
                          ? event.image_url
                          : `${BASE_URL.replace("/api", "")}${event.image_url}`
                      }
                      alt={event.title}
                      className="event-list-card-image"
                    />
                  )}

                  <div className="event-list-card-body">
                    <h3 className="event-list-card-title">{event.title}</h3>
                    <p className="event-list-card-description">
                      {event.description}
                    </p>
                  </div>

                  <div className="event-list-meta">
                    <div className="event-list-meta-row">
                      <span className="event-list-meta-label">Instructor:</span>
                      <span className="event-list-meta-value">
                        {event.instructor || "Por definir"}
                      </span>
                    </div>
                    <div className="event-list-meta-row">
                      <span className="event-list-meta-label">Duración:</span>
                      <span className="event-list-meta-value">
                        {event.duration_hours || "N/A"} horas
                      </span>
                    </div>
                    <div className="event-list-meta-row">
                      <span className="event-list-meta-label">Inicio:</span>
                      <span className="event-list-meta-value">
                        {formatDate(event.start_date)}
                      </span>
                    </div>
                    <div className="event-list-meta-row">
                      <span className="event-list-meta-label">Cupos:</span>
                      <span className="event-list-meta-value">
                        {event.max_students
                          ? `${event.max_students} estudiantes`
                          : "Sin límite"}
                      </span>
                    </div>
                  </div>

                  <div className="event-list-pricing-box">
                    <div className="event-list-pricing-row">
                      <div className="event-list-price-main-block">
                        <div className="event-list-price-main">
                          ${userPrice}
                        </div>
                        {discount > 0 && (
                          <div className="event-list-discount-badge">
                            {discount}% descuento para socios
                          </div>
                        )}
                      </div>
                      <div className="event-list-price-context">
                        {user ? (
                          <div>
                            <div className="event-list-price-context-label">
                              Valor socio
                            </div>
                            <div className="event-list-price-reference">
                              ${event.price_non_member}
                            </div>
                          </div>
                        ) : (
                          <div className="event-list-price-context-label">
                            Valor general
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="event-list-actions">
                    <button
                      className="btn btn-outline"
                      onClick={() => navigate(`/eventos/${event.id}`)}
                    >
                      Ver Detalles
                    </button>
                    <button
                      className="btn btn-primary"
                      onClick={() => handleEnrollClick(event)}
                      disabled={!isOpen || event.is_enrolled}
                    >
                      {(() => {
                        if (event.is_enrolled) return "Ya inscrito";
                        if (isOpen) return "Inscribirse";
                        return "Inscripción Cerrada";
                      })()}
                    </button>
                  </div>

                  {!isOpen && (
                    <div className="event-list-closed-badge">CERRADO</div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Modal de inscripción */}
        {showEnrollmentForm && selectedEvent && (
          <EnrollmentModal
            event={selectedEvent}
            user={user}
            onClose={() => {
              setShowEnrollmentForm(false);
              setSelectedEvent(null);
            }}
            onSuccess={() => {
              setShowEnrollmentForm(false);
              setSelectedEvent(null);
              loadEvents();
            }}
          />
        )}
      </div>
    </section>
  );
}

function EnrollmentModal({ event, user, onClose, onSuccess }) {
  const [formData, setFormData] = useState({
    student_name: user?.name || "",
    student_email: user?.email || "",
    student_phone: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [step, setStep] = useState(1); // 1: formulario, 2: confirmación

  let userPrice;
  if (user) {
    if (user.membership_type === "joven") {
      userPrice = event.price_joven || event.price_member;
    } else if (user.membership_type === "gratuito") {
      userPrice = event.price_gratuito || 0;
    } else {
      userPrice = event.price_member;
    }
  } else {
    userPrice = event.price_non_member;
  }

  function handleInputChange(e) {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  }

  async function handleEnroll() {
    if (!formData.student_name || !formData.student_email) {
      setError("Nombre y email son requeridos");
      return;
    }

    try {
      setLoading(true);
      // Transform field names to match backend expectations
      const payload = {
        name: formData.student_name,
        email: formData.student_email,
        phone: formData.student_phone,
      };
      await apiPost(`/events/${event.id}/enroll`, payload);
      setStep(2); // Go to success step
    } catch (err) {
      setError("Error al inscribirse: " + (err.message || "Error desconocido"));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="enrollment-modal-overlay">
      <div className="enrollment-modal-card">
        <div className="enrollment-modal-header">
          <h2 className="enrollment-modal-title">Inscribirse al Curso</h2>
          <button
            onClick={onClose}
            className="enrollment-modal-close"
            aria-label="Cerrar modal"
          >
            <i className="fa-solid fa-xmark"></i>
          </button>
        </div>

        {error && <div className="enrollment-modal-error">{error}</div>}

        {step === 1 && (
          <div className="enrollment-modal-content">
            <h3 className="enrollment-event-title">{event.title}</h3>
            <p className="enrollment-event-description">{event.description}</p>

            <div className="enrollment-field">
              <label
                htmlFor="enrollment-student-name"
                className="enrollment-label"
              >
                Nombre Completo *
              </label>
              <input
                id="enrollment-student-name"
                type="text"
                name="student_name"
                value={formData.student_name}
                onChange={handleInputChange}
                required
                className="enrollment-input"
              />
            </div>

            <div className="enrollment-field">
              <label
                htmlFor="enrollment-student-email"
                className="enrollment-label"
              >
                Email *
              </label>
              <input
                id="enrollment-student-email"
                type="email"
                name="student_email"
                value={formData.student_email}
                onChange={handleInputChange}
                required
                className="enrollment-input"
              />
            </div>

            <div className="enrollment-field">
              <label
                htmlFor="enrollment-student-phone"
                className="enrollment-label"
              >
                Teléfono
              </label>
              <input
                id="enrollment-student-phone"
                type="tel"
                name="student_phone"
                value={formData.student_phone}
                onChange={handleInputChange}
                className="enrollment-input"
              />
            </div>

            <div className="enrollment-price-panel">
              <div className="enrollment-price-row">
                <span>Valor:</span>
                <span className="enrollment-price-value">${userPrice}</span>
              </div>
              {user && (
                <div className="enrollment-price-note">
                  Descuento para socios aplicado
                </div>
              )}
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="enrollment-success">
            <div className="enrollment-success-icon">
              Inscripción confirmada
            </div>
            <h3 className="enrollment-success-title">Inscripción exitosa</h3>
            <p className="enrollment-success-text">
              Te has inscrito correctamente al curso. Recibirás un email de
              confirmación con los detalles.
            </p>
          </div>
        )}

        <div className="enrollment-actions">
          {step === 1 && (
            <>
              <button className="btn btn-outline" onClick={onClose}>
                Cancelar
              </button>
              <button
                className="btn btn-primary"
                onClick={handleEnroll}
                disabled={loading}
              >
                {loading ? "Procesando..." : "Inscribirse"}
              </button>
            </>
          )}
          {step === 2 && (
            <button className="btn btn-primary" onClick={onSuccess}>
              Cerrar
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

EnrollmentModal.propTypes = {
  event: PropTypes.shape({
    id: PropTypes.number.isRequired,
    title: PropTypes.string.isRequired,
    description: PropTypes.string,
    price_member: PropTypes.number,
    price_non_member: PropTypes.number,
    price_joven: PropTypes.number,
    price_gratuito: PropTypes.number,
    enrollment_id: PropTypes.number,
  }).isRequired,
  user: PropTypes.shape({
    name: PropTypes.string,
    email: PropTypes.string,
    membership_type: PropTypes.string,
  }),
  onClose: PropTypes.func.isRequired,
  onSuccess: PropTypes.func.isRequired,
};
