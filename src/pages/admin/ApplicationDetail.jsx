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
    <div>
      <div>{label}</div>
      <div>
        {link && value ? (
          <a href={value} target="_blank" rel="noopener noreferrer">
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
        "Postulación aprobada. El socio quedó en estado de pago pendiente.",
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
        `/admin/applications/${application.id}/confirm-payment`,
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
          <div>
            <Spinner size="lg" />
            <p>Cargando aplicación...</p>
          </div>
        </Container>
      </Section>
    );
  }

  if (error || !application) {
    return (
      <Section variant="default" padding="lg">
        <Container>
          <Alert variant="error">{error || "Postulación no encontrada"}</Alert>
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
        >
          <i className="fa-solid fa-arrow-left"></i> Volver al Panel Admin
        </Button>

        {/* Header Card */}
        <Card>
          <div>
            <div>
              <h1>{application.name}</h1>
              <p>
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

        {msg && <Alert variant="success">{msg}</Alert>}
        {error && <Alert variant="error">{error}</Alert>}

        {/* Personal Information */}
        <h2>Información Personal</h2>
        <Card>
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
        <h2>Información Académica</h2>
        <Card>
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
                      "es-ES",
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
                      "es-ES",
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
        <h2>Información Profesional</h2>
        <Card>
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
            <h2>Documentos Adjuntos</h2>
            <Card>
              <div>
                {application.attachments.map((att, idx) => (
                  <a
                    key={att.id}
                    href={`${BASE_URL.replace("/api", "")}${att.file_url}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    onMouseOver={e =>
                      (e.currentTarget.style.background =
                        "var(--color-primary-light)")
                    }
                    onMouseOut={e =>
                      (e.currentTarget.style.background = "var(--color-bg-alt)")
                    }
                  >
                    <i className="fa-solid fa-file-pdf"></i>
                    <span>Documento {idx + 1}</span>
                    <i className="fa-solid fa-external-link"></i>
                  </a>
                ))}
              </div>
            </Card>
          </>
        )}

        {/* Decision Section */}
        {application.status === "pending" && (
          <Card>
            <h2>Decisión de la Solicitud</h2>

            <div>
              <label htmlFor="membership-type-select">
                Tipo de Membresía a Asignar:
              </label>
              <select
                id="membership-type-select"
                value={selectedMembershipType}
                onChange={e => setSelectedMembershipType(e.target.value)}
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

            <div>
              <label htmlFor="resolution-note-textarea">
                Nota de Resolución:
              </label>
              <textarea
                id="resolution-note-textarea"
                value={resolutionNote}
                onChange={e => setResolutionNote(e.target.value)}
                placeholder="Nota opcional para el postulante..."
              />
            </div>

            <div>
              <Button variant="outline" onClick={rejectApplication}>
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
          <Card>
            <h2>Esperando Confirmación de Pago</h2>
            <p>
              La postulación fue aprobada como{" "}
              <strong>
                {getMembershipTypeLabel(application.membership_type)}
              </strong>
              . Una vez que el socio complete el pago, confirma aquí para crear
              las credenciales.
            </p>
            <Button variant="primary" onClick={confirmPayment}>
              Confirmar Pago y Crear Socio
            </Button>
          </Card>
        )}

        {/* Resolution Note */}
        {application.resolution_note && application.status !== "pending" && (
          <Card>
            <h2>Nota de Resolución</h2>
            <div>{application.resolution_note}</div>
          </Card>
        )}

        {/* Credentials */}
        {application.status === "paid" && application.initial_password && (
          <Card className="credentials-card">
            <div className="credentials-header">
              <div className="credentials-icon">
                <i className="fa-solid fa-key"></i>
              </div>
              <div>
                <h2 className="credentials-title">Credenciales del Socio</h2>
                <p className="credentials-subtitle">
                  Información de acceso para {application.name}
                </p>
              </div>
            </div>

            <div className="credentials-list">
              <div className="credential-item">
                <div className="credential-label">
                  <i className="fa-solid fa-envelope"></i>
                  Email
                </div>
                <div className="credential-value-row">
                  <code className="credential-value">{application.email}</code>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => copyToClipboard(application.email)}
                  >
                    <i className="fa-solid fa-copy"></i>
                  </Button>
                </div>
              </div>

              <div className="credential-item">
                <div className="credential-label">
                  <i className="fa-solid fa-lock"></i>
                  Contraseña Inicial
                </div>
                <div className="credential-value-row">
                  <code className="credential-value">
                    {application.initial_password}
                  </code>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      copyToClipboard(application.initial_password)
                    }
                  >
                    <i className="fa-solid fa-copy"></i>
                  </Button>
                </div>
              </div>
            </div>
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
                  `Email: ${credentials.email}\nContraseña: ${credentials.password}\nMembresía: ${credentials.membership_type}`,
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
