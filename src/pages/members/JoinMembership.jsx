import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import PropTypes from "prop-types";
import { useTranslation } from "react-i18next";
import { useAuth } from "../../auth/AuthContext.jsx";
import { apiPostForm } from "../../api/client";
import {
  Alert,
  Badge,
  Button,
  Input,
  PageHero,
  Section,
  Spinner,
} from "../../components/ui";
import {
  MEMBERSHIP_BADGE_VARIANTS,
  isNetworkError,
  readableServerMessage,
} from "../../components/members/memberUtils.js";

const MAX_FILES = 3;
const MB = 1024 * 1024;
const MAX_FILE_BYTES = 20 * MB; // backend validate_document limit
const MAX_TOTAL_BYTES = 30 * MB; // backend request limit is 32 MB incl. form fields

const EMPTY_FORM = {
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
};

// Order in which invalid fields receive focus (matches the visual order).
const FIELD_ORDER = [
  "name",
  "email",
  "whatsapp",
  "city",
  "country",
  "website",
  "specialization",
  "university",
  "documents",
];

// Errors about a value's format (the rest are missing required values).
const FORMAT_ERRORS = new Set([
  "members.join_err_email_invalid",
  "members.join_err_website_invalid",
  "members.join_err_whatsapp_invalid",
]);

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const URL_RE = /^(https?:\/\/)?([\w-]+\.)+[a-z]{2,}(:\d+)?([/?#]\S*)?$/i;

// Spanish defaults for keys added in this rehaul (merged into the locales by the lead).
const MESSAGE_DEFAULTS = {
  "members.join_err_email_invalid": "Ingresa un email válido.",
  "members.join_err_website_invalid":
    "Ingresa una dirección web válida (ej.: https://ejemplo.com).",
  "members.join_err_whatsapp_invalid":
    "Ingresa un número válido, con código de país.",
  "members.join_err_review":
    "Revisa los campos marcados antes de enviar tu solicitud.",
  "members.join_err_file_size": "«{{name}}» supera el máximo de 20 MB por archivo.",
  "members.join_err_total_size":
    "Los archivos superan el máximo de 30 MB en total.",
  "members.join_err_too_large":
    "Los archivos son demasiado grandes para enviarse. Reduce su tamaño e inténtalo de nuevo.",
  "members.join_err_server":
    "El servidor no pudo procesar tu solicitud. Inténtalo nuevamente en unos minutos.",
  "members.join_err_email_registered":
    "Ya existe una cuenta de socio con este email. Inicia sesión o escribe a la secretaría.",
  "members.join_err_email_pending":
    "Ya hay una solicitud en revisión con este email. Te contactaremos cuando el comité la resuelva.",
};

/** Ends a message with a full stop so another sentence can follow it. */
const asSentence = text => (/[.!?…]$/.test(text.trim()) ? text : `${text}.`);

const fileKey = file => `${file.name}-${file.size}-${file.lastModified}`;
const isPdf = file => /\.pdf$/i.test(file.name);
const totalSize = files => files.reduce((sum, f) => sum + f.size, 0);

function formatSize(bytes, lang) {
  if (bytes < MB) return `${Math.max(1, Math.round(bytes / 1024))} KB`;
  return `${(bytes / MB).toLocaleString(lang, { maximumFractionDigits: 1 })} MB`;
}

export default function JoinMembership() {
  const { t } = useTranslation();
  const { user, loading } = useAuth();

  let body;
  if (loading || user === undefined) {
    body = (
      <div className="page-loading">
        <Spinner size="lg" />
      </div>
    );
  } else if (user) {
    body = <AlreadyMemberNotice user={user} />;
  } else {
    body = <ApplicationForm />;
  }

  return (
    <div className="page members-page">
      <PageHero
        kicker={t("members.kicker", "Membresía")}
        title={t("members.join_title")}
        subtitle={t("members.join_subtitle")}
      />
      <Section>{body}</Section>
    </div>
  );
}

function AlreadyMemberNotice({ user }) {
  const { t } = useTranslation();
  const isAdmin = user.role === "admin";

  return (
    <div className="members-notice">
      <span className="icon-tile members-notice__icon" aria-hidden="true">
        <i className={isAdmin ? "fa-solid fa-user-shield" : "fa-solid fa-id-card"}></i>
      </span>
      <h2 className="members-notice__title">
        {isAdmin
          ? t("members.join_admin_title", "Tienes una sesión de administrador")
          : t("members.join_member_title", "Ya eres socio de SLACC")}
      </h2>
      <p className="members-notice__text">
        {isAdmin
          ? t(
              "members.join_admin_text",
              "Las solicitudes de membresía se revisan desde el panel de administración.",
            )
          : t("members.join_member_text", {
              name: user.name,
              defaultValue:
                "Iniciaste sesión como {{name}}. No necesitas enviar una nueva solicitud.",
            })}
      </p>
      <div className="members-notice__actions">
        {isAdmin ? (
          <Button to="/admin">{t("header.admin")}</Button>
        ) : (
          <>
            <Button to="/perfil">{t("header.profile")}</Button>
            <Button variant="outline" to="/portal-socios">
              {t("header.private_portal")}
            </Button>
          </>
        )}
      </div>
    </div>
  );
}

AlreadyMemberNotice.propTypes = {
  user: PropTypes.shape({
    name: PropTypes.string,
    role: PropTypes.string,
  }).isRequired,
};

function ApplicationForm() {
  const { t, i18n } = useTranslation();
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [documentFiles, setDocumentFiles] = useState([]);
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState(null);
  const [sending, setSending] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef(null);
  const pickButtonRef = useRef(null);
  const dropZoneRef = useRef(null);
  const successRef = useRef(null);
  const alertRef = useRef(null);

  const msg = error =>
    error
      ? t(error.key, {
          defaultValue: MESSAGE_DEFAULTS[error.key],
          ...(error.params || {}),
        })
      : "";

  // A file dropped outside the upload area would make the browser open it
  // and lose everything typed so far.
  useEffect(() => {
    const guard = e => {
      if (!e.dataTransfer?.types?.includes("Files")) return;
      if (dropZoneRef.current?.contains(e.target)) return;
      e.preventDefault();
      if (e.type === "dragover") e.dataTransfer.dropEffect = "none";
    };
    window.addEventListener("dragover", guard);
    window.addEventListener("drop", guard);
    return () => {
      window.removeEventListener("dragover", guard);
      window.removeEventListener("drop", guard);
    };
  }, []);

  useEffect(() => {
    if (submitted) successRef.current?.focus();
  }, [submitted]);

  // The submit button is disabled while sending, so focus would fall back to
  // <body>: move it to the server error instead (it is also announced).
  useEffect(() => {
    if (!formError?.fromServer || !alertRef.current) return;
    alertRef.current.focus({ preventScroll: true });
    alertRef.current.scrollIntoView({ block: "center" });
  }, [formError]);

  const resetFileInput = () => {
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleChange = field => e => {
    const { value } = e.target;
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }));
    }
  };

  const addFiles = fileList => {
    const incoming = Array.from(fileList || []);
    resetFileInput();
    if (incoming.length === 0) return;

    const merged = [...documentFiles];
    incoming.forEach(file => {
      if (!merged.some(f => fileKey(f) === fileKey(file))) merged.push(file);
    });

    let error = null;
    const notPdf = incoming.find(f => !isPdf(f));
    const tooBig = incoming.find(f => f.size > MAX_FILE_BYTES);
    if (notPdf) error = { key: "members.join_err_pdf_only" };
    else if (tooBig)
      error = { key: "members.join_err_file_size", params: { name: tooBig.name } };
    else if (merged.length > MAX_FILES) error = { key: "members.join_err_max_files" };
    else if (totalSize(merged) > MAX_TOTAL_BYTES)
      error = { key: "members.join_err_total_size" };

    if (error) {
      // An invalid selection never leaves stale files behind: start over.
      setDocumentFiles([]);
      setErrors(prev => ({ ...prev, documents: { ...error, reselect: true } }));
      return;
    }

    setDocumentFiles(merged);
    setErrors(prev => ({ ...prev, documents: null }));
  };

  const removeFile = key => {
    setDocumentFiles(prev => prev.filter(f => fileKey(f) !== key));
    resetFileInput();
    pickButtonRef.current?.focus();
  };

  const validate = () => {
    const found = {};
    const value = field => formData[field].trim();
    const required = {
      name: "members.join_err_name",
      email: "members.join_err_email",
      city: "members.join_err_city",
      country: "members.join_err_country",
      whatsapp: "members.join_err_whatsapp",
      specialization: "members.join_err_specialization",
      university: "members.join_err_university",
    };
    Object.entries(required).forEach(([field, key]) => {
      if (!value(field)) found[field] = { key };
    });
    if (!found.email && !EMAIL_RE.test(value("email"))) {
      found.email = { key: "members.join_err_email_invalid" };
    }
    if (!found.whatsapp && value("whatsapp").replace(/\D/g, "").length < 7) {
      found.whatsapp = { key: "members.join_err_whatsapp_invalid" };
    }
    if (value("website") && !URL_RE.test(value("website"))) {
      found.website = { key: "members.join_err_website_invalid" };
    }
    if (documentFiles.length === 0) {
      found.documents = errors.documents?.reselect
        ? errors.documents
        : { key: "members.join_err_documents" };
    }
    return found;
  };

  const focusFirstInvalid = found => {
    const first = FIELD_ORDER.find(field => found[field]);
    if (!first) return;
    const el =
      first === "documents"
        ? pickButtonRef.current
        : document.getElementById(`join-${first}`);
    el?.focus();
  };

  const submitError = err => {
    if (isNetworkError(err)) return { key: "members.join_err_network" };
    if (err?.status === 413) return { key: "members.join_err_too_large" };
    if (err?.status >= 500) return { key: "members.join_err_server" };
    const detail = readableServerMessage(err);
    // Duplicate-email reasons (backend _duplicate_application_error, Spanish only).
    if (err?.status === 400 && /cuenta registrada/i.test(detail)) {
      return { key: "members.join_err_email_registered", field: "email" };
    }
    if (err?.status === 400 && /solicitud en curso/i.test(detail)) {
      return { key: "members.join_err_email_pending", field: "email" };
    }
    return { key: "members.join_err_submit", detail };
  };

  async function send(e) {
    e.preventDefault();
    if (sending) return;

    const found = validate();
    setErrors(found);
    if (Object.keys(found).length > 0) {
      const missing = Object.values(found).some(err => !FORMAT_ERRORS.has(err.key));
      setFormError({
        key: missing ? "members.join_err_required" : "members.join_err_review",
      });
      focusFirstInvalid(found);
      return;
    }

    setFormError(null);
    setSending(true);
    try {
      const data = new FormData();
      Object.entries(formData).forEach(([field, value]) => {
        data.append(field, value.trim());
      });
      documentFiles.forEach((file, index) => {
        data.append(index === 0 ? "document" : `document${index + 1}`, file);
      });

      await apiPostForm("/applications", data);

      setFormData(EMPTY_FORM);
      setDocumentFiles([]);
      setErrors({});
      resetFileInput();
      setSubmitted(true);
    } catch (err) {
      console.error("Application submit failed:", err);
      const mapped = submitError(err);
      if (mapped.field) {
        setErrors({ [mapped.field]: { key: mapped.key } });
        setFormError({ key: "members.join_err_review" });
        document.getElementById(`join-${mapped.field}`)?.focus();
      } else {
        setFormError({ ...mapped, fromServer: true });
      }
    } finally {
      setSending(false);
    }
  }

  const field = (name, props = {}) => ({
    id: `join-${name}`,
    value: formData[name],
    onChange: handleChange(name),
    error: msg(errors[name]) || undefined,
    ...props,
  });

  const documentsError = errors.documents;
  const documentsLabel = t("members.join_documents_label").replace(/\s*\*\s*$/, "");

  return (
    <div className="members-join-layout">
      <div className="members-join-main">
        {submitted ? (
          <div className="members-join-card members-join-success">
            <span className="members-join-success__icon" aria-hidden="true">
              <i className="fa-solid fa-circle-check"></i>
            </span>
            <h2
              ref={successRef}
              tabIndex={-1}
              className="members-join-success__title"
            >
              {t("members.join_success_title", "¡Solicitud enviada!")}
            </h2>
            <p className="members-join-success__text">{t("members.join_success")}</p>
            <div className="members-join-success__actions">
              <Button to="/">{t("notFound.btn_home")}</Button>
              <Button
                variant="outline"
                onClick={() => {
                  setSubmitted(false);
                  setTimeout(() => document.getElementById("join-name")?.focus(), 0);
                }}
              >
                {t("members.join_send_another", "Enviar otra solicitud")}
              </Button>
            </div>
          </div>
        ) : (
          <form
            className="members-join-card"
            onSubmit={send}
            noValidate
            aria-labelledby="join-form-title"
          >
            <div className="members-join-card__head">
              <h2 id="join-form-title" className="members-join-card__title">
                {t("members.join_form_title")}
              </h2>
              <p className="members-join-card__note">
                <span className="form-required" aria-hidden="true">
                  *{" "}
                </span>
                {t(
                  "members.join_required_note",
                  "Campos obligatorios",
                )}
              </p>
            </div>

            <div
              className="form-section members-join-section"
              role="group"
              aria-labelledby="join-sec-personal"
            >
              <h3 id="join-sec-personal" className="form-section-title members-join-section__title">
                <span className="members-join-step" aria-hidden="true">1</span>
                {t("members.join_section_personal")}
              </h3>
              <div className="form-grid">
                <Input
                  {...field("name", {
                    label: t("members.join_name"),
                    placeholder: "Dr. Juan Pérez",
                    autoComplete: "name",
                    required: true,
                    className: "span-2",
                  })}
                />
                <Input
                  {...field("email", {
                    label: t("members.join_email"),
                    type: "email",
                    placeholder: t("members.join_ph_email", "juan@ejemplo.com"),
                    autoComplete: "email",
                    required: true,
                  })}
                />
                <Input
                  {...field("whatsapp", {
                    label: t("members.join_whatsapp"),
                    type: "tel",
                    inputMode: "tel",
                    placeholder: "+57 300 123 4567",
                    autoComplete: "tel",
                    helperText: t("members.join_whatsapp_help"),
                    required: true,
                  })}
                />
                <Input
                  {...field("city", {
                    label: t("members.join_city"),
                    placeholder: "Bogotá",
                    autoComplete: "address-level2",
                    required: true,
                  })}
                />
                <Input
                  {...field("country", {
                    label: t("members.join_country"),
                    placeholder: "Colombia",
                    autoComplete: "country-name",
                    required: true,
                  })}
                />
                <Input
                  {...field("website", {
                    label: t("members.join_website"),
                    type: "url",
                    inputMode: "url",
                    placeholder: t("members.join_ph_website", "https://ejemplo.com"),
                    autoComplete: "url",
                    className: "span-2",
                  })}
                />
              </div>
            </div>

            <div
              className="form-section members-join-section"
              role="group"
              aria-labelledby="join-sec-academic"
            >
              <h3 id="join-sec-academic" className="form-section-title members-join-section__title">
                <span className="members-join-step" aria-hidden="true">2</span>
                {t("members.join_section_academic")}
              </h3>
              <div className="form-grid">
                <Input
                  {...field("specialization", {
                    label: t("members.join_specialization"),
                    placeholder: t("members.join_ph_specialization", "Cirugía de Cadera"),
                    required: true,
                  })}
                />
                <Input
                  {...field("university", {
                    label: t("members.join_university"),
                    placeholder: t("members.join_ph_university", "Universidad Nacional"),
                    required: true,
                  })}
                />
                <Input
                  {...field("residency_end_date", {
                    label: t("members.join_residency_end"),
                    type: "date",
                  })}
                />
                <Input
                  {...field("fellowship_date", {
                    label: t("members.join_fellowship_date"),
                    type: "date",
                  })}
                />
                <Input
                  {...field("fellowship_location", {
                    label: t("members.join_fellowship_location"),
                    placeholder: t("members.join_ph_fellowship_location", "Hospital Universitario"),
                    className: "span-2",
                  })}
                />
              </div>
            </div>

            <div
              className="form-section members-join-section"
              role="group"
              aria-labelledby="join-sec-professional"
            >
              <h3 id="join-sec-professional" className="form-section-title members-join-section__title">
                <span className="members-join-step" aria-hidden="true">3</span>
                {t("members.join_section_professional")}
              </h3>
              <div className="form-grid">
                <Input
                  {...field("current_hospital", {
                    label: t("members.join_hospital"),
                    placeholder: t("members.join_ph_hospital", "Hospital Central"),
                    autoComplete: "organization",
                  })}
                />
                <Input
                  {...field("current_position", {
                    label: t("members.join_position"),
                    placeholder: t("members.join_ph_position", "Cirujano de Cadera"),
                    autoComplete: "organization-title",
                  })}
                />
                <Input
                  {...field("teaching_degree", {
                    label: t("members.join_teaching_degree"),
                    placeholder: t("members.join_ph_teaching_degree", "Profesor Asociado"),
                    className: "span-2",
                  })}
                />
              </div>
            </div>

            <div
              className="form-section members-join-section"
              role="group"
              aria-labelledby="join-sec-documents"
            >
              <h3 id="join-sec-documents" className="form-section-title members-join-section__title">
                <span className="members-join-step" aria-hidden="true">4</span>
                {t("members.join_section_documents")}
              </h3>

              <p className="form-label members-upload-label" id="join-documents-label">
                {documentsLabel}
                <span className="form-required" aria-hidden="true">
                  {" "}*
                </span>
              </p>

              <div
                ref={dropZoneRef}
                className={[
                  "members-upload",
                  dragOver && "is-dragover",
                  documentsError && "has-error",
                ]
                  .filter(Boolean)
                  .join(" ")}
                onDragOver={e => {
                  e.preventDefault();
                  e.dataTransfer.dropEffect = "copy";
                  if (!dragOver) setDragOver(true);
                }}
                onDragLeave={e => {
                  if (!e.currentTarget.contains(e.relatedTarget)) setDragOver(false);
                }}
                onDrop={e => {
                  e.preventDefault();
                  setDragOver(false);
                  addFiles(e.dataTransfer.files);
                }}
              >
                <input
                  ref={fileInputRef}
                  id="join-documents"
                  type="file"
                  accept="application/pdf,.pdf"
                  multiple
                  hidden
                  onChange={e => addFiles(e.target.files)}
                />
                <span className="members-upload__icon" aria-hidden="true">
                  <i className="fa-solid fa-file-arrow-up"></i>
                </span>
                <p className="members-upload__drag">
                  {t("members.join_upload_drag", "Arrastra aquí tus archivos PDF o")}
                </p>
                <button
                  ref={pickButtonRef}
                  id="join-documents-btn"
                  type="button"
                  className="btn btn-outline btn-sm members-upload__button"
                  onClick={() => fileInputRef.current?.click()}
                  aria-describedby={[
                    "join-documents-label",
                    "join-documents-help",
                    documentsError && "join-documents-error",
                  ]
                    .filter(Boolean)
                    .join(" ")}
                  aria-invalid={documentsError ? true : undefined}
                >
                  <i className="fa-solid fa-paperclip" aria-hidden="true"></i>
                  {t("members.join_upload_button", "Seleccionar archivos")}
                </button>
                <p className="members-upload__help" id="join-documents-help">
                  {t("members.join_documents_help")}.{" "}
                  {t(
                    "members.join_documents_limits",
                    "Máximo 20 MB por archivo y 30 MB en total.",
                  )}
                </p>
              </div>

              {documentsError && (
                <p className="form-error members-upload__error" id="join-documents-error" role="alert">
                  {documentsError.reselect
                    ? `${asSentence(msg(documentsError))} ${t(
                        "members.join_err_reselect",
                        "Vuelve a seleccionar tus documentos.",
                      )}`
                    : msg(documentsError)}
                </p>
              )}

              {documentFiles.length > 0 && (
                <>
                  <p className="members-upload__count">
                    {t("members.join_files_count", {
                      count: documentFiles.length,
                      max: MAX_FILES,
                      defaultValue: "{{count}} de {{max}} archivos",
                    })}
                  </p>
                  <ul className="members-upload__list">
                    {documentFiles.map(file => {
                      const key = fileKey(file);
                      return (
                        <li key={key} className="members-upload__file">
                          <i
                            className="fa-regular fa-file-pdf members-upload__file-icon"
                            aria-hidden="true"
                          ></i>
                          <span className="members-upload__file-name">{file.name}</span>
                          <span className="members-upload__file-size">
                            {formatSize(file.size, i18n.language)}
                          </span>
                          <button
                            type="button"
                            className="members-upload__remove"
                            onClick={() => removeFile(key)}
                            aria-label={t("members.join_remove_file", {
                              name: file.name,
                              defaultValue: "Eliminar {{name}}",
                            })}
                          >
                            <i className="fa-solid fa-xmark" aria-hidden="true"></i>
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                </>
              )}
            </div>

            {formError && (
              <div ref={alertRef} tabIndex={-1} className="members-join-alert">
                <Alert variant="error">
                  <strong>{msg(formError)}</strong>
                  {formError.detail && (
                    <span className="members-join-alert__detail">{formError.detail}</span>
                  )}
                </Alert>
              </div>
            )}

            <div className="form-actions members-join-actions">
              <Button type="submit" size="lg" loading={sending}>
                <i className="fa-solid fa-paper-plane members-join-actions__icon" aria-hidden="true"></i>
                {t("members.join_submit")}
              </Button>
            </div>
          </form>
        )}
      </div>

      <JoinAside />
    </div>
  );
}

function JoinAside() {
  const { t } = useTranslation();
  const categories = t("members.categories", { returnObjects: true });
  const categoryTypes = ["joven", "normal"];

  return (
    <aside
      className="members-join-aside"
      aria-label={t("members.join_aside_label", "Información sobre la solicitud")}
    >
      <div className="members-join-aside__block">
        <h2 className="members-join-aside__title">
          {t("members.join_req_title", "Antes de empezar")}
        </h2>
        <ul className="members-join-checklist">
          <li>{t("members.join_req_1", "Datos personales y de contacto.")}</li>
          <li>
            {t(
              "members.join_req_2",
              "Formación académica y lugar de tu fellowship de cadera.",
            )}
          </li>
          <li>
            {t(
              "members.join_req_3",
              "CV y certificados en PDF (hasta 3 archivos).",
            )}
          </li>
        </ul>
      </div>

      {Array.isArray(categories) && categories.length > 0 && (
        <div className="members-join-aside__block">
          <h2 className="members-join-aside__title">{t("members.categories_title")}</h2>
          <ul className="members-join-categories">
            {categories.map((category, index) => {
              const type = categoryTypes[index] || "normal";
              return (
                <li key={category.title}>
                  <Badge variant={MEMBERSHIP_BADGE_VARIANTS[type]} size="sm">
                    {category.title}
                  </Badge>
                  <p>{category.desc}</p>
                </li>
              );
            })}
          </ul>
        </div>
      )}

      <div className="members-join-aside__block">
        <h2 className="members-join-aside__title">
          {t("members.join_steps_title", "¿Qué sigue?")}
        </h2>
        <ol className="members-join-steps">
          <li>
            {t("members.join_step_1", "Envías tu solicitud con tus documentos.")}
          </li>
          <li>
            {t(
              "members.join_step_2",
              "El comité de membresía revisa tus antecedentes.",
            )}
          </li>
          <li>
            {t(
              "members.join_step_3",
              "Te contactamos por email con la resolución y los pasos para activar tu membresía.",
            )}
          </li>
        </ol>
      </div>

      <p className="members-join-aside__login">
        {t("members.join_already_member")}{" "}
        <Link to="/login">{t("members.join_login")}</Link>
      </p>
    </aside>
  );
}
