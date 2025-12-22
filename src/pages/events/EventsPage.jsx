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
    <section className="section">
      <div className="container">
        <div style={{ textAlign: "center", marginBottom: 48 }}>
          <h1>Eventos y Educación Continua</h1>
          <p
            style={{
              fontSize: "1.2em",
              color: "var(--color-muted)",
              maxWidth: 600,
              margin: "0 auto",
            }}
          >
            Amplía tus conocimientos con nuestros eventos especializados en
            cirugía de cadera
          </p>
        </div>

        {events.length === 0 ? (
          <div style={{ textAlign: "center", padding: "48px 0" }}>
            <div
              style={{
                fontSize: "1.2em",
                color: "var(--color-muted)",
                marginBottom: 16,
              }}
            >
              No hay eventos disponibles en este momento
            </div>
            <p style={{ color: "var(--color-muted)" }}>
              Pronto tendremos nuevos eventos disponibles. ¡Mantente atento!
            </p>
          </div>
        ) : (
          <div className="cards">
            {events.map(event => {
              const userPrice = getPriceForUser(event);
              const discount = getDiscountPercentage(event);
              const isOpen = isRegistrationOpen(event);

              return (
                <div
                  key={event.id}
                  className="card"
                  style={{ position: "relative" }}
                >
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
                        height: "200px",
                        objectFit: "cover",
                        borderRadius: "var(--radius)",
                        marginBottom: 16,
                      }}
                    />
                  )}

                  <div style={{ marginBottom: 16 }}>
                    <h3 style={{ marginBottom: 8 }}>{event.title}</h3>
                    <p
                      style={{ color: "var(--color-muted)", marginBottom: 12 }}
                    >
                      {event.description}
                    </p>
                  </div>

                  <div style={{ marginBottom: 16 }}>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        marginBottom: 8,
                      }}
                    >
                      <span style={{ fontWeight: "500" }}>Instructor:</span>
                      <span>{event.instructor || "Por definir"}</span>
                    </div>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        marginBottom: 8,
                      }}
                    >
                      <span style={{ fontWeight: "500" }}>Duración:</span>
                      <span>{event.duration_hours || "N/A"} horas</span>
                    </div>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        marginBottom: 8,
                      }}
                    >
                      <span style={{ fontWeight: "500" }}>Inicio:</span>
                      <span>{formatDate(event.start_date)}</span>
                    </div>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        marginBottom: 8,
                      }}
                    >
                      <span style={{ fontWeight: "500" }}>Cupos:</span>
                      <span>
                        {event.max_students
                          ? `${event.max_students} estudiantes`
                          : "Sin límite"}
                      </span>
                    </div>
                  </div>

                  <div
                    style={{
                      background: "#f8f9fa",
                      padding: 16,
                      borderRadius: 8,
                      marginBottom: 16,
                      border: "1px solid #e9ecef",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                      }}
                    >
                      <div>
                        <div
                          style={{
                            fontSize: "1.5em",
                            fontWeight: "bold",
                            color: "var(--color-primary)",
                          }}
                        >
                          ${userPrice}
                        </div>
                        {discount > 0 && (
                          <div
                            style={{
                              fontSize: "0.9em",
                              color: "var(--color-secondary)",
                            }}
                          >
                            {discount}% descuento para socios
                          </div>
                        )}
                      </div>
                      <div
                        style={{
                          textAlign: "right",
                          fontSize: "0.9em",
                          color: "var(--color-muted)",
                        }}
                      >
                        {user ? (
                          <div>
                            <div>Valor socio</div>
                            <div
                              style={{
                                textDecoration: "line-through",
                                color: "var(--color-muted)",
                              }}
                            >
                              ${event.price_non_member}
                            </div>
                          </div>
                        ) : (
                          <div>Valor general</div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div style={{ display: "flex", gap: 8 }}>
                    <button
                      className="btn btn-outline"
                      onClick={() => navigate(`/eventos/${event.id}`)}
                      style={{ flex: 1 }}
                    >
                      Ver Detalles
                    </button>
                    <button
                      className="btn btn-primary"
                      onClick={() => handleEnrollClick(event)}
                      disabled={!isOpen || event.is_enrolled}
                      style={{ flex: 1 }}
                    >
                      {(() => {
                        if (event.is_enrolled) return "Ya inscrito";
                        if (isOpen) return "Inscribirse";
                        return "Inscripción Cerrada";
                      })()}
                    </button>
                  </div>

                  {!isOpen && (
                    <div
                      style={{
                        position: "absolute",
                        top: 16,
                        right: 16,
                        background: "crimson",
                        color: "white",
                        padding: "4px 8px",
                        borderRadius: 12,
                        fontSize: "0.8em",
                        fontWeight: "bold",
                      }}
                    >
                      CERRADO
                    </div>
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
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: "rgba(0,0,0,0.5)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
        padding: 20,
      }}
    >
      <div
        style={{
          background: "var(--color-bg)",
          borderRadius: 12,
          padding: 32,
          maxWidth: 500,
          width: "100%",
          maxHeight: "90vh",
          overflow: "auto",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 24,
          }}
        >
          <h2>Inscribirse al Curso</h2>
          <button
            onClick={onClose}
            style={{
              background: "none",
              border: "none",
              fontSize: "1.5em",
              cursor: "pointer",
            }}
          >
            <i className="fa-solid fa-xmark"></i>
          </button>
        </div>

        {error && (
          <div
            style={{
              background: "#f8d7da",
              color: "#721c24",
              padding: 12,
              borderRadius: 6,
              marginBottom: 16,
              textAlign: "center",
            }}
          >
            {error}
          </div>
        )}

        {step === 1 && (
          <div>
            <h3 style={{ marginBottom: 16 }}>{event.title}</h3>
            <p style={{ color: "var(--color-muted)", marginBottom: 24 }}>
              {event.description}
            </p>

            <div style={{ marginBottom: 16 }}>
              <label
                htmlFor="enrollment-student-name"
                style={{ display: "block", marginBottom: 8, fontWeight: "500" }}
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
                style={{
                  width: "100%",
                  padding: 12,
                  border: "1px solid #ddd",
                  borderRadius: 6,
                }}
              />
            </div>

            <div style={{ marginBottom: 16 }}>
              <label
                htmlFor="enrollment-student-email"
                style={{ display: "block", marginBottom: 8, fontWeight: "500" }}
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
                style={{
                  width: "100%",
                  padding: 12,
                  border: "1px solid #ddd",
                  borderRadius: 6,
                }}
              />
            </div>

            <div style={{ marginBottom: 24 }}>
              <label
                htmlFor="enrollment-student-phone"
                style={{ display: "block", marginBottom: 8, fontWeight: "500" }}
              >
                Teléfono
              </label>
              <input
                id="enrollment-student-phone"
                type="tel"
                name="student_phone"
                value={formData.student_phone}
                onChange={handleInputChange}
                style={{
                  width: "100%",
                  padding: 12,
                  border: "1px solid #ddd",
                  borderRadius: 6,
                }}
              />
            </div>

            <div
              style={{
                background: "#f8f9fa",
                padding: 16,
                borderRadius: 8,
                marginBottom: 24,
                border: "1px solid #e9ecef",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <span style={{ fontWeight: "500" }}>Valor:</span>
                <span
                  style={{
                    fontSize: "1.5em",
                    fontWeight: "bold",
                    color: "var(--color-primary)",
                  }}
                >
                  ${userPrice}
                </span>
              </div>
              {user && (
                <div
                  style={{
                    fontSize: "0.9em",
                    color: "var(--color-secondary)",
                    marginTop: 4,
                  }}
                >
                  Descuento para socios aplicado
                </div>
              )}
            </div>
          </div>
        )}

        {step === 2 && (
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: "3em", marginBottom: 16 }}>🎉</div>
            <h3 style={{ marginBottom: 16 }}>¡Inscripción Exitosa!</h3>
            <p style={{ color: "var(--color-muted)", marginBottom: 24 }}>
              Te has inscrito correctamente al curso. Recibirás un email de
              confirmación con los detalles.
            </p>
          </div>
        )}

        <div style={{ display: "flex", gap: 12, justifyContent: "flex-end" }}>
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
