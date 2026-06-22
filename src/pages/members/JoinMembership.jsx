import { useState } from "react";
import { Link } from "react-router-dom";
import PropTypes from "prop-types";
import { useTranslation } from "react-i18next";
import { Section, Input, Button, Alert, Grid, PageHero } from "../../components/ui";

export default function JoinMembership() {
  const { t } = useTranslation();
  const [appSent, setAppSent] = useState(false);
  const [appMsg, setAppMsg] = useState("");

  return (
    <>
      <Section variant="primary" padding="lg">
        <PageHero
          title={t("members.join_title")}
          subtitle={t("members.join_subtitle")}
        />
      </Section>

      <Section variant="default" padding="lg" containerSize="sm">
        <div className="join-form-container">
          <h2 className="join-form-title">{t("members.join_form_title")}</h2>

          <ApplicationForm
            onResult={(ok, msg) => {
              setAppSent(ok);
              setAppMsg(msg);
            }}
          />

          {appMsg && (
            <Alert variant={appSent ? "success" : "error"} className="mt-4">
              {appMsg}
            </Alert>
          )}
        </div>

        <div className="join-login-section">
          <p className="join-login-text">{t("members.join_already_member")}</p>
          <Link to="/login">
            <Button variant="outline">{t("members.join_login")}</Button>
          </Link>
        </div>
      </Section>
    </>
  );
}

function ApplicationForm({ onResult }) {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
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
        documents: t("members.join_err_max_files"),
      }));
      return;
    }

    const invalidFiles = files.filter(
      f => !f.name.toLowerCase().endsWith(".pdf"),
    );
    if (invalidFiles.length > 0) {
      setErrors(prev => ({
        ...prev,
        documents: t("members.join_err_pdf_only"),
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
    if (!formData.name.trim()) newErrors.name = t("members.join_err_name");
    if (!formData.email.trim()) newErrors.email = t("members.join_err_email");
    if (!formData.city.trim()) newErrors.city = t("members.join_err_city");
    if (!formData.country.trim())
      newErrors.country = t("members.join_err_country");
    if (!formData.whatsapp.trim())
      newErrors.whatsapp = t("members.join_err_whatsapp");
    if (!formData.specialization.trim())
      newErrors.specialization = t("members.join_err_specialization");
    if (!formData.university.trim())
      newErrors.university = t("members.join_err_university");
    if (documentFiles.length === 0)
      newErrors.documents = t("members.join_err_documents");

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  async function send(e) {
    e.preventDefault();

    if (!validate()) {
      onResult(false, t("members.join_err_required"));
      return;
    }

    setLoading(true);
    try {
      const data = new FormData();
      data.append("name", formData.name);
      data.append("email", formData.email);
      data.append("website", formData.website);
      data.append("city", formData.city);
      data.append("country", formData.country);
      data.append("whatsapp", formData.whatsapp);
      data.append("specialization", formData.specialization);
      data.append("residency_end_date", formData.residency_end_date);
      data.append("university", formData.university);
      data.append("fellowship_date", formData.fellowship_date);
      data.append("fellowship_location", formData.fellowship_location);
      data.append("current_hospital", formData.current_hospital);
      data.append("current_position", formData.current_position);
      data.append("teaching_degree", formData.teaching_degree);
      documentFiles.forEach((file, index) => {
        data.append(`document${index > 0 ? index + 1 : ""}`, file);
      });

      const res = await fetch(`${BASE_URL}/applications`, {
        method: "POST",
        body: data,
      });

      if (!res.ok) {
        throw new Error(t("members.join_err_submit"));
      }

      onResult(true, t("members.join_success"));

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
        error.message || t("members.join_err_network"),
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={send}>
      <h3 className="join-section-title">
        {t("members.join_section_personal")}
      </h3>

      <Input
        label={t("members.join_name")}
        value={formData.name}
        onChange={handleChange("name")}
        error={errors.name}
        placeholder="Dr. Juan Pérez"
        required
      />

      <Grid columns="1fr 1fr" gap="var(--spacing-4)">
        <Input
          label={t("members.join_email")}
          type="email"
          value={formData.email}
          onChange={handleChange("email")}
          error={errors.email}
          placeholder="juan@ejemplo.com"
          required
        />
        <Input
          label={t("members.join_website")}
          type="url"
          value={formData.website}
          onChange={handleChange("website")}
          error={errors.website}
          placeholder="https://ejemplo.com"
        />
      </Grid>

      <Grid columns="1fr 1fr" gap="var(--spacing-4)">
        <Input
          label={t("members.join_city")}
          value={formData.city}
          onChange={handleChange("city")}
          error={errors.city}
          placeholder="Bogotá"
          required
        />
        <Input
          label={t("members.join_country")}
          value={formData.country}
          onChange={handleChange("country")}
          error={errors.country}
          placeholder="Colombia"
          required
        />
      </Grid>

      <Input
        label={t("members.join_whatsapp")}
        type="tel"
        value={formData.whatsapp}
        onChange={handleChange("whatsapp")}
        error={errors.whatsapp}
        placeholder="+57 300 123 4567"
        helperText={t("members.join_whatsapp_help")}
        required
      />

      <h3 className="join-section-title">
        {t("members.join_section_academic")}
      </h3>

      <Grid columns="1fr 1fr" gap="var(--spacing-4)">
        <Input
          label={t("members.join_specialization")}
          value={formData.specialization}
          onChange={handleChange("specialization")}
          error={errors.specialization}
          placeholder="Cirugía de Cadera"
          required
        />
        <Input
          label={t("members.join_residency_end")}
          type="date"
          value={formData.residency_end_date}
          onChange={handleChange("residency_end_date")}
          error={errors.residency_end_date}
        />
      </Grid>

      <Input
        label={t("members.join_university")}
        value={formData.university}
        onChange={handleChange("university")}
        error={errors.university}
        placeholder="Universidad Nacional"
        required
      />

      <Grid columns="1fr 1fr" gap="var(--spacing-4)">
        <Input
          label={t("members.join_fellowship_date")}
          type="date"
          value={formData.fellowship_date}
          onChange={handleChange("fellowship_date")}
          error={errors.fellowship_date}
        />
        <Input
          label={t("members.join_fellowship_location")}
          value={formData.fellowship_location}
          onChange={handleChange("fellowship_location")}
          error={errors.fellowship_location}
          placeholder="Hospital Universitario"
        />
      </Grid>

      <h3 className="join-section-title">
        {t("members.join_section_professional")}
      </h3>

      <Grid columns="1fr 1fr" gap="var(--spacing-4)">
        <Input
          label={t("members.join_hospital")}
          value={formData.current_hospital}
          onChange={handleChange("current_hospital")}
          error={errors.current_hospital}
          placeholder="Hospital Central"
        />
        <Input
          label={t("members.join_position")}
          value={formData.current_position}
          onChange={handleChange("current_position")}
          error={errors.current_position}
          placeholder="Cirujano de Cadera"
        />
      </Grid>

      <Input
        label={t("members.join_teaching_degree")}
        value={formData.teaching_degree}
        onChange={handleChange("teaching_degree")}
        error={errors.teaching_degree}
        placeholder="Profesor Asociado"
      />

      <h3 className="join-section-title">
        {t("members.join_section_documents")}
      </h3>

      <div className="file-input-wrapper">
        <label htmlFor="application-document" className="file-input-label">
          {t("members.join_documents_label")}
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
          <div className="join-files-list">
            {documentFiles.map((file, index) => (
              <div
                key={`${file.name}-${file.size}-${file.lastModified}`}
                className="join-file-row"
              >
                <p className="file-selected-message join-file-name">
                  <i className="fa-solid fa-circle-check"></i> {file.name}
                </p>
                <button
                  type="button"
                  onClick={() => removeFile(index)}
                  className="join-file-remove"
                  aria-label={t("common.remove_file")}
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
        <p className="join-file-help">{t("members.join_documents_help")}</p>
      </div>

      <Button
        type="submit"
        variant="primary"
        size="lg"
        fullWidth
        loading={loading}
        disabled={loading}
      >
        {t("members.join_submit")}
      </Button>
    </form>
  );
}

ApplicationForm.propTypes = {
  onResult: PropTypes.func.isRequired,
};
