import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
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

function isRegistrationOpen(course) {
  if (!course.registration_deadline) return true;
  return new Date() <= new Date(course.registration_deadline);
}

export default function CoursesPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [showEnrollmentForm, setShowEnrollmentForm] = useState(false);

  useEffect(() => {
    loadCourses();
  }, []);

  async function loadCourses() {
    try {
      setLoading(true);
      const data = await apiGet("/courses");
      setCourses(data);
    } catch (err) {
      console.error("Error loading courses:", err);
    } finally {
      setLoading(false);
    }
  }

  function handleEnrollClick(course) {
    setSelectedCourse(course);
    setShowEnrollmentForm(true);
  }

  function getPriceForUser(course) {
    if (!user) {
      return course.price_non_member;
    }

    let price;
    if (user.membership_type === "joven") {
      price = course.price_joven > 0 ? course.price_joven : course.price_member;
    } else if (user.membership_type === "gratuito") {
      price = Math.max(course.price_gratuito, 0);
    } else {
      price = course.price_member;
    }
    return price;
  }

  function getDiscountPercentage(course) {
    const fullPrice = course.price_non_member;
    const userPrice = getPriceForUser(course);
    if (fullPrice > 0 && userPrice < fullPrice) {
      return Math.round(((fullPrice - userPrice) / fullPrice) * 100);
    }
    return 0;
  }

  if (loading) {
    return (
      <section className="section">
        <div className="container">
          <p>Cargando cursos...</p>
        </div>
      </section>
    );
  }

  return (
    <section className="section">
      <div className="container">
        <div style={{ textAlign: "center", marginBottom: 48 }}>
          <h1>Cursos y Educación Continua</h1>
          <p
            style={{
              fontSize: "1.2em",
              color: "var(--color-muted)",
              maxWidth: 600,
              margin: "0 auto",
            }}
          >
            Amplía tus conocimientos con nuestros cursos especializados en
            cirugía de cadera
          </p>
        </div>

        {courses.length === 0 ? (
          <div style={{ textAlign: "center", padding: "48px 0" }}>
            <div
              style={{
                fontSize: "1.2em",
                color: "var(--color-muted)",
                marginBottom: 16,
              }}
            >
              No hay cursos disponibles en este momento
            </div>
            <p style={{ color: "var(--color-muted)" }}>
              Pronto tendremos nuevos cursos disponibles. ¡Mantente atento!
            </p>
          </div>
        ) : (
          <div className="cards">
            {courses.map(course => {
              const userPrice = getPriceForUser(course);
              const discount = getDiscountPercentage(course);
              const isOpen = isRegistrationOpen(course);

              return (
                <div
                  key={course.id}
                  className="card"
                  style={{ position: "relative" }}
                >
                  {course.image_url && (
                    <img
                      src={
                        course.image_url.startsWith("http")
                          ? course.image_url
                          : `${BASE_URL.replace("/api", "")}${course.image_url}`
                      }
                      alt={course.title}
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
                    <h3 style={{ marginBottom: 8 }}>{course.title}</h3>
                    <p
                      style={{ color: "var(--color-muted)", marginBottom: 12 }}
                    >
                      {course.description}
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
                      <span>{course.instructor || "Por definir"}</span>
                    </div>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        marginBottom: 8,
                      }}
                    >
                      <span style={{ fontWeight: "500" }}>Duración:</span>
                      <span>{course.duration_hours || "N/A"} horas</span>
                    </div>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        marginBottom: 8,
                      }}
                    >
                      <span style={{ fontWeight: "500" }}>Inicio:</span>
                      <span>{formatDate(course.start_date)}</span>
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
                        {course.max_students
                          ? `${course.max_students} estudiantes`
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
                              ${course.price_non_member}
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
                      onClick={() => navigate(`/cursos/${course.id}`)}
                      style={{ flex: 1 }}
                    >
                      Ver Detalles
                    </button>
                    <button
                      className="btn btn-primary"
                      onClick={() => handleEnrollClick(course)}
                      disabled={!isOpen || course.is_enrolled}
                      style={{ flex: 1 }}
                    >
                      {(() => {
                        if (course.is_enrolled) return "Ya inscrito";
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
        {showEnrollmentForm && selectedCourse && (
          <EnrollmentModal
            course={selectedCourse}
            user={user}
            onClose={() => {
              setShowEnrollmentForm(false);
              setSelectedCourse(null);
            }}
            onSuccess={() => {
              setShowEnrollmentForm(false);
              setSelectedCourse(null);
              loadCourses();
            }}
          />
        )}
      </div>
    </section>
  );
}

function EnrollmentModal({ course, user, onClose, onSuccess }) {
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
      userPrice = course.price_joven || course.price_member;
    } else if (user.membership_type === "gratuito") {
      userPrice = course.price_gratuito || 0;
    } else {
      userPrice = course.price_member;
    }
  } else {
    userPrice = course.price_non_member;
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
      await apiPost(`/courses/${course.id}/enroll`, formData);
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
            <h3 style={{ marginBottom: 16 }}>{course.title}</h3>
            <p style={{ color: "var(--color-muted)", marginBottom: 24 }}>
              {course.description}
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
  course: PropTypes.shape({
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
