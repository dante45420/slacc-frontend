import { useState } from "react";
import { Link } from "react-router-dom";
import PropTypes from "prop-types";
import { Section, Input, Textarea, Select, Button, Alert, Grid } from "../../components/ui";

export default function JoinMembership() {
  const [appSent, setAppSent] = useState(false);
  const [appMsg, setAppMsg] = useState("");

  return (
    <>
      <Section variant="primary" padding="lg">
        <div style={{ textAlign: "center", maxWidth: "700px", margin: "0 auto" }}>
          <h1 style={{ marginBottom: "var(--spacing-3)" }}>Únete a SLACC</h1>
          <p style={{
            fontSize: "18px",
            color: "var(--color-muted)",
            lineHeight: 1.7
          }}>
            Conecta con especialistas en cirugía cardiovascular de toda Latinoamérica y accede a
            beneficios exclusivos
          </p>
        </div>
      </Section>

      <Section variant="default" padding="lg" containerSize="sm">
        <div style={{ 
          background: "var(--color-bg)",
          padding: "var(--spacing-6)",
          borderRadius: "var(--radius-lg)",
          boxShadow: "var(--shadow-md)",
          border: "1px solid var(--color-border)"
        }}>
          <h2 style={{ textAlign: "center", marginTop: 0, marginBottom: "var(--spacing-5)" }}>
            Solicitar Membresía
          </h2>
          
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

        <div style={{ textAlign: "center", marginTop: "var(--spacing-5)" }}>
          <p style={{ color: "var(--color-muted)", marginBottom: "var(--spacing-3)" }}>
            ¿Ya eres socio?
          </p>
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
    name: "",
    email: "",
    phone: "",
    specialization: "",
    experience: "",
    motivation: ""
  });
  const [documentFile, setDocumentFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";

  const handleChange = (field) => (e) => {
    setFormData(prev => ({ ...prev, [field]: e.target.value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: "" }));
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = "El nombre es requerido";
    if (!formData.email.trim()) newErrors.email = "El email es requerido";
    if (!formData.specialization.trim()) newErrors.specialization = "La especialización es requerida";
    if (!formData.experience) newErrors.experience = "Los años de experiencia son requeridos";
    if (!formData.motivation.trim()) newErrors.motivation = "La motivación es requerida";
    if (!documentFile) newErrors.document = "El documento PDF es requerido";
    
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
      data.append("name", formData.name);
      data.append("email", formData.email);
      data.append("phone", formData.phone);
      data.append("motivation", formData.motivation);
      data.append("specialization", formData.specialization);
      data.append("experience", formData.experience);
      if (documentFile) data.append("document", documentFile);

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
        phone: "",
        specialization: "",
        experience: "",
        motivation: ""
      });
      setDocumentFile(null);
      setErrors({});
    } catch (error) {
      onResult(false, error.message || "Error de red. Por favor intenta nuevamente.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={send}>
      <Grid columns="1fr 1fr" gap="var(--spacing-4)">
        <Input
          label="Nombre Completo"
          value={formData.name}
          onChange={handleChange("name")}
          error={errors.name}
          placeholder="Dr. Juan Pérez"
          required
        />
        <Input
          label="Email"
          type="email"
          value={formData.email}
          onChange={handleChange("email")}
          error={errors.email}
          placeholder="juan@ejemplo.com"
          required
        />
      </Grid>

      <Input
        label="Teléfono"
        type="tel"
        value={formData.phone}
        onChange={handleChange("phone")}
        error={errors.phone}
        placeholder="+57 300 123 4567"
        helperText="Incluye código de país"
      />

      <Grid columns="1fr 1fr" gap="var(--spacing-4)">
        <Input
          label="Especialización"
          value={formData.specialization}
          onChange={handleChange("specialization")}
          error={errors.specialization}
          placeholder="Ej: Cirugía Cardiovascular"
          required
        />
        <Input
          label="Años de Experiencia"
          type="number"
          min="0"
          value={formData.experience}
          onChange={handleChange("experience")}
          error={errors.experience}
          placeholder="5"
          required
        />
      </Grid>

      <Textarea
        label="Motivación para unirse a SLACC"
        value={formData.motivation}
        onChange={handleChange("motivation")}
        error={errors.motivation}
        placeholder="Cuéntanos por qué quieres formar parte de nuestra asociación..."
        rows={6}
        required
      />

      <div style={{ marginBottom: "var(--spacing-4)" }}>
        <label 
          htmlFor="application-document"
          style={{
            display: "block",
            marginBottom: "var(--spacing-2)",
            fontWeight: "500",
            fontSize: "14px"
          }}
        >
          Documento (PDF) *
        </label>
        <input
          id="application-document"
          type="file"
          accept="application/pdf"
          onChange={e => {
            setDocumentFile(e.target.files?.[0] || null);
            if (errors.document) {
              setErrors(prev => ({ ...prev, document: "" }));
            }
          }}
          style={{
            width: "100%",
            padding: "12px",
            border: `1px solid ${errors.document ? 'var(--color-error)' : 'var(--color-border)'}`,
            borderRadius: "var(--radius)",
            fontSize: "14px"
          }}
          required
        />
        {documentFile && (
          <p style={{ 
            margin: "var(--spacing-2) 0 0",
            fontSize: "13px",
            color: "var(--color-success)"
          }}>
            ✓ {documentFile.name}
          </p>
        )}
        {errors.document && (
          <p style={{
            margin: "var(--spacing-2) 0 0",
            fontSize: "13px",
            color: "var(--color-error)"
          }}>
            {errors.document}
          </p>
        )}
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
