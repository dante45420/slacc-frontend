import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import PropTypes from "prop-types";
import { apiGet, apiPost } from "../../api/client";
import {
  Section,
  Container,
  Card,
  Button,
  Badge,
  Grid,
  Alert,
  Spinner,
  Modal,
  Input,
  useToast,
} from "../../components/ui";

const BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";

function InfoField({ label, value, link, fullWidth }) {
  const displayValue = value || "No especificado";

  return (
    <div style={{ gridColumn: fullWidth ? "1 / -1" : "auto" }}>
      <div
        style={{
          marginBottom: "var(--spacing-1)",
          fontWeight: "600",
          color: "var(--color-text-secondary)",
        }}
      >
        {label}
      </div>
      <div style={{ color: "var(--color-text)" }}>
        {link && value ? (
          <a
            href={value}
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: "var(--color-primary)" }}
          >
            {displayValue}
          </a>
        ) : (
          displayValue
        )}
      </div>
    </div>
  );
}

InfoField.propTypes = {
  label: PropTypes.string.isRequired,
  value: PropTypes.string,
  link: PropTypes.bool,
  fullWidth: PropTypes.bool,
};

export default function ApplicationDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [application, setApplication] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [msg, setMsg] = useState("");
  const [selectedMembershipType, setSelectedMembershipType] =
    useState("normal");
  const [resolutionNote, setResolutionNote] = useState("");
  const [credentials, setCredentials] = useState(null);
  const [showCredentialsModal, setShowCredentialsModal] = useState(false);
  const toast = useToast();

  useEffect(() => {
    loadApplication();
  }, [id]);

  async function loadApplication() {
    try {
      setLoading(true);
      const app = await apiGet(`/admin/applications/${id}`);
      setApplication(app);
      setSelectedMembershipType(app.membership_type || "normal");
      setResolutionNote(app.resolution_note || "");
    } catch (err) {
      setError("Error al cargar la postulación");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function approveApplication() {
    if (!application) return;

    try {
      await apiPost(`/admin/applications/${application.id}/approve`, {
        membership_type: selectedMembershipType,
        note: resolutionNote,
      });
      setMsg(
        "Postulación aprobada. El socio quedó en estado de pago pendiente."
      );
      setTimeout(() => {
        loadApplication(); // Recargar para ver el nuevo estado
      }, 2000);
    } catch (err) {
      setError("Error al aprobar la postulación");
      console.error(err);
    }
  }

  async function confirmPayment() {
    if (!application) return;

    try {
      const result = await apiPost(
        `/admin/applications/${application.id}/confirm-payment`
      );

      if (result.credentials) {
        setCredentials(result.credentials);
        setShowCredentialsModal(true);
      } else {
        setMsg(result.message || "Pago confirmado exitosamente");
        setTimeout(() => {
          navigate("/admin?tab=applications");
        }, 2000);
      }
    } catch (err) {
      setError("Error al confirmar el pago");
      console.error(err);
    }
  }

  function copyToClipboard(text) {
    navigator.clipboard
      .writeText(text)
      .then(() => {
        toast.success("Copiado al portapapeles");
      })
      .catch(() => {
        toast.error("Error al copiar");
      });
  }

  function handleCloseCredentialsModal() {
    setShowCredentialsModal(false);
    setCredentials(null);
    navigate("/admin?tab=applications");
  }

  async function rejectApplication() {
    if (!application) return;

    try {
      await apiPost(`/admin/applications/${application.id}/reject`, {
        note: resolutionNote,
      });
      setMsg("Postulación rechazada.");
      setTimeout(() => {
        navigate("/admin?tab=applications");
      }, 2000);
    } catch (err) {
      setError("Error al rechazar la postulación");
      console.error(err);
    }
  }

  if (loading) {
    return (
      <Section variant="default" padding="lg">
        <Container>
          <div style={{ textAlign: "center" }}>
            <Spinner size="lg" />
            <p
              style={{
                marginTop: "var(--spacing-4)",
                color: "var(--color-muted)",
              }}
            >
              Cargando aplicación...
            </p>
          </div>
        </Container>
      </Section>
    );
  }

  if (error || !application) {
    return (
      <Section variant="default" padding="lg">
        <Container>
          <Alert variant="error" style={{ marginBottom: "var(--spacing-4)" }}>
            {error || "Postulación no encontrada"}
          </Alert>
          <Button
            variant="outline"
            onClick={() => navigate("/admin?tab=applications")}
          >
            <i className="fa-solid fa-arrow-left"></i> Volver al Panel Admin
          </Button>
        </Container>
      </Section>
    );
  }

  const getMembershipTypeLabel = type => {
    const types = {
      joven: "Nex Gen ($30/año)",
      normal: "Socio Normal ($100/año)",
      gratuito: "Socio Gratuito (Gratis)",
    };
    return types[type] || type;
  };

  const getStatusLabel = status => {
    const statuses = {
      pending: "Pendiente",
      approved: "Aprobada",
      rejected: "Rechazada",
      payment_pending: "Esperando Pago",
      paid: "Pagada",
    };
    return statuses[status] || status;
  };

  const getStatusVariant = status => {
    const variants = {
      paid: "success",
      payment_pending: "warning",
      rejected: "warning",
      approved: "info",
      pending: "neutral",
    };
    return variants[status] || "neutral";
  };

  return (
    <Section variant="default" padding="lg">
      <Container size="lg">
        <Button
          variant="outline"
          onClick={() => navigate("/admin?tab=applications")}
          style={{ marginBottom: "var(--spacing-5)" }}
        >
          <i className="fa-solid fa-arrow-left"></i> Volver al Panel Admin
        </Button>

        {/* Header Card */}
        <Card style={{ marginBottom: "var(--spacing-5)" }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
              gap: "var(--spacing-4)",
              flexWrap: "wrap",
            }}
          >
            <div>
              <h1 style={{ margin: 0, marginBottom: "var(--spacing-2)" }}>
                {application.name}
              </h1>
              <p style={{ color: "var(--color-muted)", margin: 0 }}>
                Fecha de solicitud:{" "}
                {new Date(application.created_at).toLocaleDateString("es-ES", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </p>
            </div>
            <Badge variant={getStatusVariant(application.status)} size="md">
              {getStatusLabel(application.status)}
            </Badge>
          </div>
        </Card>

        {msg && (
          <Alert variant="success" style={{ marginBottom: "var(--spacing-5)" }}>
            {msg}
          </Alert>
        )}
        {error && (
          <Alert variant="error" style={{ marginBottom: "var(--spacing-5)" }}>
            {error}
          </Alert>
        )}

        {/* Personal Information */}
        <h2
          style={{
            marginBottom: "var(--spacing-4)",
            color: "var(--color-primary)",
          }}
        >
          Información Personal
        </h2>
        <Card style={{ marginBottom: "var(--spacing-5)" }}>
          <Grid columns="1fr 1fr" gap="var(--spacing-4)">
            <InfoField label="Nombre Completo" value={application.name} />
            <InfoField label="Correo Electrónico" value={application.email} />
            <InfoField label="Ciudad" value={application.city} />
            <InfoField label="País" value={application.country} />
            <InfoField label="WhatsApp" value={application.whatsapp} />
            <InfoField label="Página Web" value={application.website} link />
          </Grid>
        </Card>

        {/* Academic Information */}
        <h2
          style={{
            marginBottom: "var(--spacing-4)",
            color: "var(--color-primary)",
          }}
        >
          Información Académica
        </h2>
        <Card style={{ marginBottom: "var(--spacing-5)" }}>
          <Grid columns="1fr 1fr" gap="var(--spacing-4)">
            <InfoField
              label="Especialidad"
              value={application.specialization}
            />
            <InfoField
              label="Fecha de Término de Residencia"
              value={
                application.residency_end_date
                  ? new Date(application.residency_end_date).toLocaleDateString(
                      "es-ES"
                    )
                  : null
              }
            />
            <InfoField
              label="Universidad"
              value={application.university}
              fullWidth
            />
            <InfoField
              label="Fecha de Fellow de Cadera"
              value={
                application.fellowship_date
                  ? new Date(application.fellowship_date).toLocaleDateString(
                      "es-ES"
                    )
                  : null
              }
            />
            <InfoField
              label="Lugar de Fellow"
              value={application.fellowship_location}
            />
          </Grid>
        </Card>

        {/* Professional Information */}
        <h2
          style={{
            marginBottom: "var(--spacing-4)",
            color: "var(--color-primary)",
          }}
        >
          Información Profesional
        </h2>
        <Card style={{ marginBottom: "var(--spacing-5)" }}>
          <Grid columns="1fr 1fr" gap="var(--spacing-4)">
            <InfoField
              label="Hospital Actual"
              value={application.current_hospital}
            />
            <InfoField
              label="Cargo Actual"
              value={application.current_position}
            />
            <InfoField
              label="Grado Docente"
              value={application.teaching_degree}
              fullWidth
            />
          </Grid>
        </Card>

        {/* Documents */}
        {application.attachments && application.attachments.length > 0 && (
          <>
            <h2
              style={{
                marginBottom: "var(--spacing-4)",
                color: "var(--color-primary)",
              }}
            >
              Documentos Adjuntos
            </h2>
            <Card style={{ marginBottom: "var(--spacing-5)" }}>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "var(--spacing-3)",
                }}
              >
                {application.attachments.map((att, idx) => (
                  <a
                    key={att.id}
                    href={`${BASE_URL.replace("/api", "")}${att.file_url}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "var(--spacing-2)",
                      padding: "var(--spacing-3)",
                      background: "var(--color-bg-alt)",
                      borderRadius: "var(--radius)",
                      textDecoration: "none",
                      color: "var(--color-text)",
                      transition: "all var(--transition-fast)",
                    }}
                    onMouseOver={e =>
                      (e.currentTarget.style.background =
                        "var(--color-primary-light)")
                    }
                    onMouseOut={e =>
                      (e.currentTarget.style.background = "var(--color-bg-alt)")
                    }
                  >
                    <i
                      className="fa-solid fa-file-pdf"
                      style={{ fontSize: "1.5em", color: "var(--color-error)" }}
                    ></i>
                    <span>Documento {idx + 1}</span>
                    <i
                      className="fa-solid fa-external-link"
                      style={{ marginLeft: "auto", fontSize: "0.9em" }}
                    ></i>
                  </a>
                ))}
              </div>
            </Card>
          </>
        )}

        {/* Decision Section */}
        {application.status === "pending" && (
          <Card style={{ marginBottom: "var(--spacing-5)" }}>
            <h2
              style={{
                marginBottom: "var(--spacing-4)",
                color: "var(--color-primary)",
              }}
            >
              Decisión de la Solicitud
            </h2>

            <div style={{ marginBottom: "var(--spacing-4)" }}>
              <label
                htmlFor="membership-type-select"
                style={{
                  display: "block",
                  marginBottom: "var(--spacing-2)",
                  fontWeight: "600",
                }}
              >
                Tipo de Membresía a Asignar:
              </label>
              <select
                id="membership-type-select"
                value={selectedMembershipType}
                onChange={e => setSelectedMembershipType(e.target.value)}
                style={{
                  width: "100%",
                  padding: "var(--spacing-3)",
                  border: "1px solid var(--color-border)",
                  borderRadius: "var(--radius)",
                  fontSize: "1em",
                }}
              >
                <option value="joven">
                  Nex Gen ($30/año) - Recién egresados
                </option>
                <option value="normal">
                  Socio Normal ($100/año) - Profesionales con experiencia
                </option>
                <option value="gratuito">
                  Socio Emérito (Gratis) - Alto estatus invitado
                </option>
              </select>
            </div>

            <div style={{ marginBottom: "var(--spacing-5)" }}>
              <label
                htmlFor="resolution-note-textarea"
                style={{
                  display: "block",
                  marginBottom: "var(--spacing-2)",
                  fontWeight: "600",
                }}
              >
                Nota de Resolución:
              </label>
              <textarea
                id="resolution-note-textarea"
                value={resolutionNote}
                onChange={e => setResolutionNote(e.target.value)}
                placeholder="Nota opcional para el postulante..."
                style={{
                  width: "100%",
                  padding: "var(--spacing-3)",
                  border: "1px solid var(--color-border)",
                  borderRadius: "var(--radius)",
                  minHeight: "100px",
                  resize: "vertical",
                  fontFamily: "inherit",
                }}
              />
            </div>

            <div
              style={{
                display: "flex",
                gap: "var(--spacing-3)",
                justifyContent: "flex-end",
              }}
            >
              <Button
                variant="outline"
                onClick={rejectApplication}
                style={{
                  background: "var(--color-error)",
                  color: "white",
                  border: "none",
                }}
              >
                Rechazar
              </Button>
              <Button variant="primary" onClick={approveApplication}>
                Aprobar
              </Button>
            </div>
          </Card>
        )}

        {/* Payment Pending */}
        {application.status === "payment_pending" && (
          <Card
            style={{
              marginBottom: "var(--spacing-5)",
              border: "2px solid var(--color-warning)",
            }}
          >
            <h2
              style={{
                marginBottom: "var(--spacing-4)",
                color: "var(--color-warning)",
              }}
            >
              Esperando Confirmación de Pago
            </h2>
            <p
              style={{
                marginBottom: "var(--spacing-4)",
                color: "var(--color-muted)",
              }}
            >
              La postulación fue aprobada como{" "}
              <strong>
                {getMembershipTypeLabel(application.membership_type)}
              </strong>
              . Una vez que el socio complete el pago, confirma aquí para crear
              las credenciales.
            </p>
            <Button
              variant="primary"
              onClick={confirmPayment}
              style={{ background: "var(--color-success)" }}
            >
              Confirmar Pago y Crear Socio
            </Button>
          </Card>
        )}

        {/* Resolution Note */}
        {application.resolution_note && application.status !== "pending" && (
          <Card style={{ marginBottom: "var(--spacing-5)" }}>
            <h2
              style={{
                marginBottom: "var(--spacing-4)",
                color: "var(--color-primary)",
              }}
            >
              Nota de Resolución
            </h2>
            <div
              style={{
                background: "var(--color-bg-alt)",
                padding: "var(--spacing-4)",
                borderRadius: "var(--radius)",
                border: "1px solid var(--color-border)",
              }}
            >
              {application.resolution_note}
            </div>
          </Card>
        )}

        {/* Credentials */}
        {application.status === "paid" && application.initial_password && (
          <Card
            style={{
              marginBottom: "var(--spacing-5)",
              border: "2px solid var(--color-success)",
            }}
          >
            <h2
              style={{
                marginBottom: "var(--spacing-4)",
                color: "var(--color-success)",
              }}
            >
              Credenciales del Socio
            </h2>
            <Grid columns="1fr" gap="var(--spacing-4)">
              <div>
                <label
                  style={{
                    display: "block",
                    fontWeight: "600",
                    marginBottom: "var(--spacing-2)",
                  }}
                >
                  Email:
                </label>
                <div style={{ display: "flex", gap: "var(--spacing-2)" }}>
                  <input
                    type="text"
                    value={application.email}
                    readOnly
                    style={{
                      flex: 1,
                      padding: "var(--spacing-2)",
                      border: "1px solid var(--color-border)",
                      borderRadius: "var(--radius)",
                      background: "var(--color-bg-alt)",
                    }}
                  />
                  <Button
                    variant="primary"
                    onClick={() => copyToClipboard(application.email)}
                  >
                    Copiar
                  </Button>
                </div>
              </div>

              <div>
                <label
                  style={{
                    display: "block",
                    fontWeight: "600",
                    marginBottom: "var(--spacing-2)",
                  }}
                >
                  Contraseña Inicial:
                </label>
                <div style={{ display: "flex", gap: "var(--spacing-2)" }}>
                  <input
                    type="text"
                    value={application.initial_password}
                    readOnly
                    style={{
                      flex: 1,
                      padding: "var(--spacing-2)",
                      border: "1px solid var(--color-border)",
                      borderRadius: "var(--radius)",
                      background: "var(--color-bg-alt)",
                      fontFamily: "monospace",
                      fontSize: "1.1rem",
                      fontWeight: "bold",
                    }}
                  />
                  <Button
                    variant="primary"
                    onClick={() =>
                      copyToClipboard(application.initial_password)
                    }
                  >
                    Copiar
                  </Button>
                </div>
              </div>
            </Grid>
          </Card>
        )}
      </Container>

      {/* Credentials Modal */}
      <Modal
        isOpen={showCredentialsModal}
        onClose={handleCloseCredentialsModal}
        title="Credenciales de Socio Creadas"
      >
        <Alert variant="warning" className="mb-4">
          <strong>⚠️ IMPORTANTE:</strong> Esta información se muestra una sola
          vez. Copia estas credenciales y envíalas al socio de forma segura.
        </Alert>

        {credentials && (
          <div className="flex flex-col gap-3">
            <div>
              <label htmlFor="modal-email" className="font-semibold mb-2 block">
                Email:
              </label>
              <div className="flex gap-2">
                <Input
                  id="modal-email"
                  type="text"
                  value={credentials.email}
                  readOnly
                  className="flex-1"
                />
                <Button
                  onClick={() => copyToClipboard(credentials.email)}
                  variant="primary"
                  size="sm"
                >
                  Copiar
                </Button>
              </div>
            </div>

            <div>
              <label
                htmlFor="modal-password"
                className="font-semibold mb-2 block"
              >
                Contraseña Temporal:
              </label>
              <div className="flex gap-2">
                <Input
                  id="modal-password"
                  type="text"
                  value={credentials.password}
                  readOnly
                  className="flex-1"
                  style={{ fontFamily: "monospace", fontSize: "1.1rem" }}
                />
                <Button
                  onClick={() => copyToClipboard(credentials.password)}
                  variant="primary"
                  size="sm"
                >
                  Copiar
                </Button>
              </div>
            </div>

            <div>
              <label
                htmlFor="modal-membership"
                className="font-semibold mb-2 block"
              >
                Tipo de Membresía:
              </label>
              <Input
                id="modal-membership"
                type="text"
                value={credentials.membership_type}
                readOnly
              />
            </div>
          </div>
        )}

        <div className="flex justify-end gap-2 mt-5">
          <Button
            onClick={() => {
              if (credentials) {
                copyToClipboard(
                  `Email: ${credentials.email}\nContraseña: ${credentials.password}\nMembresía: ${credentials.membership_type}`
                );
              }
            }}
            variant="secondary"
          >
            Copiar Todo
          </Button>
          <Button onClick={handleCloseCredentialsModal} variant="primary">
            Cerrar y Continuar
          </Button>
        </div>
      </Modal>
    </Section>
  );
}

InfoField.propTypes = {
  label: PropTypes.string.isRequired,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  link: PropTypes.bool,
  fullWidth: PropTypes.bool,
};
