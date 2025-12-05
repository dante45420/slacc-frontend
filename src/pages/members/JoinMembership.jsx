import { useState } from "react";
import { Link } from "react-router-dom";
import PropTypes from "prop-types";
import { Section, Input, Button, Alert, Grid } from "../../components/ui";

export default function JoinMembership() {
  const [appSent, setAppSent] = useState(false);
  const [appMsg, setAppMsg] = useState("");

  return (
    <>
      <Section variant="primary" padding="lg">
        <div className="join-header-container">
          <h1 className="join-header-title">Únete a SLACC</h1>
          <p className="join-header-subtitle">
            Conecta con especialistas en cirugía cardiovascular de toda
            Latinoamérica y accede a beneficios exclusivos
          </p>
        </div>
      </Section>

      <Section variant="default" padding="lg" containerSize="sm">
        <div className="join-form-container">
          <h2 className="join-form-title">Solicitar Membresía</h2>

          <ApplicationForm
            onResult={(ok, msg) => {
              setAppSent(ok);
              setAppMsg(msg);
            }}
          />

          {appMsg && (
            <Alert
              variant={appSent ? "success" : "error"}
              style={{ marginTop: "var(--spacing-4)" }}
            >
              {appMsg}
            </Alert>
          )}
        </div>

        <div className="join-login-section">
          <p className="join-login-text">¿Ya eres socio?</p>
          <Link to="/login">
            <Button variant="outline">Iniciar Sesión</Button>
          </Link>
        </div>
      </Section>
    </>
  );
}

function ApplicationForm({ onResult }) {
  const [formData, setFormData] = useState({
    // Información Personal
    name: "",
    email: "",
    website: "",
    city: "",
    country: "",
    whatsapp: "",
    // Información Académica
    specialization: "",
    residency_end_date: "",
    university: "",
    fellowship_date: "",
    fellowship_location: "",
    // Información Profesional
    current_hospital: "",
    current_position: "",
    teaching_degree: "",
  });
  const [documentFiles, setDocumentFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const BASE_URL =
    import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";

  const handleChange = field => e => {
    setFormData(prev => ({ ...prev, [field]: e.target.value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: "" }));
    }
  };

  const handleFileChange = e => {
    const files = Array.from(e.target.files || []);
    if (files.length > 3) {
      setErrors(prev => ({
        ...prev,
        documents: "Máximo 3 archivos PDF permitidos",
      }));
      return;
    }

    const invalidFiles = files.filter(
      f => !f.name.toLowerCase().endsWith(".pdf")
    );
    if (invalidFiles.length > 0) {
      setErrors(prev => ({
        ...prev,
        documents: "Solo se permiten archivos PDF",
      }));
      return;
    }

    setDocumentFiles(files);
    if (errors.documents) {
      setErrors(prev => ({ ...prev, documents: "" }));
    }
  };

  const removeFile = index => {
    setDocumentFiles(prev => prev.filter((_, i) => i !== index));
  };

  const validate = () => {
    const newErrors = {};
    // Required fields
    if (!formData.name.trim()) newErrors.name = "El nombre es requerido";
    if (!formData.email.trim()) newErrors.email = "El email es requerido";
    if (!formData.city.trim()) newErrors.city = "La ciudad es requerida";
    if (!formData.country.trim()) newErrors.country = "El país es requerido";
    if (!formData.whatsapp.trim()) newErrors.whatsapp = "WhatsApp es requerido";
    if (!formData.specialization.trim())
      newErrors.specialization = "La especialidad es requerida";
    if (!formData.university.trim())
      newErrors.university = "La universidad es requerida";
    if (documentFiles.length === 0)
      newErrors.documents = "Al menos un documento PDF es requerido";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  async function send(e) {
    e.preventDefault();

    if (!validate()) {
      onResult(false, "Por favor completa todos los campos requeridos");
      return;
    }

    setLoading(true);
    try {
      const data = new FormData();
      // Personal
      data.append("name", formData.name);
      data.append("email", formData.email);
      data.append("website", formData.website);
      data.append("city", formData.city);
      data.append("country", formData.country);
      data.append("whatsapp", formData.whatsapp);
      // Academic
      data.append("specialization", formData.specialization);
      data.append("residency_end_date", formData.residency_end_date);
      data.append("university", formData.university);
      data.append("fellowship_date", formData.fellowship_date);
      data.append("fellowship_location", formData.fellowship_location);
      // Professional
      data.append("current_hospital", formData.current_hospital);
      data.append("current_position", formData.current_position);
      data.append("teaching_degree", formData.teaching_degree);
      // Documents
      documentFiles.forEach((file, index) => {
        data.append(`document${index > 0 ? index + 1 : ""}`, file);
      });

      const res = await fetch(`${BASE_URL}/applications`, {
        method: "POST",
        body: data,
      });

      if (!res.ok) {
        throw new Error("Error al enviar solicitud");
      }

      onResult(
        true,
        "¡Solicitud enviada exitosamente! Será revisada por nuestro comité y te contactaremos pronto."
      );

      // Reset form
      setFormData({
        name: "",
        email: "",
        website: "",
        city: "",
        country: "",
        whatsapp: "",
        specialization: "",
        residency_end_date: "",
        university: "",
        fellowship_date: "",
        fellowship_location: "",
        current_hospital: "",
        current_position: "",
        teaching_degree: "",
      });
      setDocumentFiles([]);
      setErrors({});
    } catch (error) {
      onResult(
        false,
        error.message || "Error de red. Por favor intenta nuevamente."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={send}>
      {/* Información Personal */}
      <h3
        style={{
          marginTop: "var(--spacing-6)",
          marginBottom: "var(--spacing-4)",
          color: "var(--color-primary)",
        }}
      >
        Información Personal
      </h3>

      <Input
        label="Nombre Completo"
        value={formData.name}
        onChange={handleChange("name")}
        error={errors.name}
        placeholder="Dr. Juan Pérez"
        required
      />

      <Grid columns="1fr 1fr" gap="var(--spacing-4)">
        <Input
          label="Correo Electrónico"
          type="email"
          value={formData.email}
          onChange={handleChange("email")}
          error={errors.email}
          placeholder="juan@ejemplo.com"
          required
        />
        <Input
          label="Página Web"
          type="url"
          value={formData.website}
          onChange={handleChange("website")}
          error={errors.website}
          placeholder="https://ejemplo.com"
        />
      </Grid>

      <Grid columns="1fr 1fr" gap="var(--spacing-4)">
        <Input
          label="Ciudad"
          value={formData.city}
          onChange={handleChange("city")}
          error={errors.city}
          placeholder="Bogotá"
          required
        />
        <Input
          label="País"
          value={formData.country}
          onChange={handleChange("country")}
          error={errors.country}
          placeholder="Colombia"
          required
        />
      </Grid>

      <Input
        label="WhatsApp"
        type="tel"
        value={formData.whatsapp}
        onChange={handleChange("whatsapp")}
        error={errors.whatsapp}
        placeholder="+57 300 123 4567"
        helperText="Incluye código de país"
        required
      />

      {/* Información Académica */}
      <h3
        style={{
          marginTop: "var(--spacing-6)",
          marginBottom: "var(--spacing-4)",
          color: "var(--color-primary)",
        }}
      >
        Información Académica
      </h3>

      <Grid columns="1fr 1fr" gap="var(--spacing-4)">
        <Input
          label="Especialidad"
          value={formData.specialization}
          onChange={handleChange("specialization")}
          error={errors.specialization}
          placeholder="Cirugía Cardiovascular"
          required
        />
        <Input
          label="Fecha de Término de la Residencia"
          type="date"
          value={formData.residency_end_date}
          onChange={handleChange("residency_end_date")}
          error={errors.residency_end_date}
        />
      </Grid>

      <Input
        label="Universidad"
        value={formData.university}
        onChange={handleChange("university")}
        error={errors.university}
        placeholder="Universidad Nacional"
        required
      />

      <Grid columns="1fr 1fr" gap="var(--spacing-4)">
        <Input
          label="Fecha de Fellow de Cadera"
          type="date"
          value={formData.fellowship_date}
          onChange={handleChange("fellowship_date")}
          error={errors.fellowship_date}
        />
        <Input
          label="Lugar Realización Fellow de Cadera"
          value={formData.fellowship_location}
          onChange={handleChange("fellowship_location")}
          error={errors.fellowship_location}
          placeholder="Hospital Universitario"
        />
      </Grid>

      {/* Información Profesional */}
      <h3
        style={{
          marginTop: "var(--spacing-6)",
          marginBottom: "var(--spacing-4)",
          color: "var(--color-primary)",
        }}
      >
        Información Profesional
      </h3>

      <Grid columns="1fr 1fr" gap="var(--spacing-4)">
        <Input
          label="Hospital Actual donde Ejerce"
          value={formData.current_hospital}
          onChange={handleChange("current_hospital")}
          error={errors.current_hospital}
          placeholder="Hospital Central"
        />
        <Input
          label="Cargo Actual"
          value={formData.current_position}
          onChange={handleChange("current_position")}
          error={errors.current_position}
          placeholder="Cirujano Cardiovascular"
        />
      </Grid>

      <Input
        label="Grado Docente"
        value={formData.teaching_degree}
        onChange={handleChange("teaching_degree")}
        error={errors.teaching_degree}
        placeholder="Profesor Asociado"
      />

      {/* Documento */}
      <h3
        style={{
          marginTop: "var(--spacing-6)",
          marginBottom: "var(--spacing-4)",
          color: "var(--color-primary)",
        }}
      >
        Documentación
      </h3>

      <div className="file-input-wrapper">
        <label htmlFor="application-document" className="file-input-label">
          Documentos CV/Certificados (PDF) *
        </label>
        <input
          id="application-document"
          type="file"
          accept="application/pdf"
          multiple
          onChange={handleFileChange}
          className={`file-input ${errors.documents ? "error" : ""}`}
          required
        />
        {documentFiles.length > 0 && (
          <div style={{ marginTop: "var(--spacing-3)" }}>
            {documentFiles.map((file, index) => (
              <div
                key={index}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "var(--spacing-2)",
                  background: "var(--color-bg-alt)",
                  borderRadius: "var(--radius-sm)",
                  marginBottom: "var(--spacing-2)",
                }}
              >
                <p className="file-selected-message" style={{ margin: 0 }}>
                  <i className="fa-solid fa-circle-check"></i> {file.name}
                </p>
                <button
                  type="button"
                  onClick={() => removeFile(index)}
                  style={{
                    background: "none",
                    border: "none",
                    color: "var(--color-error)",
                    cursor: "pointer",
                    padding: "var(--spacing-1)",
                    fontSize: "1.2em",
                  }}
                  aria-label="Eliminar archivo"
                >
                  <i className="fa-solid fa-xmark"></i>
                </button>
              </div>
            ))}
          </div>
        )}
        {errors.documents && (
          <p className="file-error-message">{errors.documents}</p>
        )}
        <p
          style={{
            fontSize: "0.875rem",
            color: "var(--color-muted)",
            marginTop: "var(--spacing-2)",
          }}
        >
          Puedes adjuntar hasta 3 archivos PDF (CV y certificados)
        </p>
      </div>

      <Button
        type="submit"
        variant="primary"
        size="lg"
        fullWidth
        loading={loading}
        disabled={loading}
      >
        Enviar Solicitud de Membresía
      </Button>
    </form>
  );
}

ApplicationForm.propTypes = {
  onResult: PropTypes.func.isRequired,
};
