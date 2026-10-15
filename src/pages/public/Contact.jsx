import { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Section,
  Button,
  Input,
  Textarea,
  PageHero,
  Alert,
} from "../../components/ui";
import {
  CONTACT_EMAIL,
  INSTAGRAM_HANDLE,
  INSTAGRAM_URL,
  buildMailto,
} from "../../components/public/contactInfo";

const MESSAGE_MAX = 1500;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const EMPTY_FORM = { name: "", email: "", message: "" };

export default function Contact() {
  const { t } = useTranslation();
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});
  const [opened, setOpened] = useState(false);
  const [copyState, setCopyState] = useState("idle");

  const validate = data => {
    const next = {};
    if (!data.name.trim()) {
      next.name = t("contact.error_name_required", "Ingresa tu nombre.");
    }
    if (!data.email.trim()) {
      next.email = t("contact.error_email_required", "Ingresa tu correo electrónico.");
    } else if (!EMAIL_RE.test(data.email.trim())) {
      next.email = t(
        "contact.error_email_invalid",
        "Ingresa un correo electrónico válido, por ejemplo nombre@dominio.com.",
      );
    }
    if (!data.message.trim()) {
      next.message = t("contact.error_message_required", "Escribe tu mensaje.");
    }
    return next;
  };

  const buildBody = data =>
    [
      `${t("contact.mailto_body_name")}: ${data.name.trim()}`,
      `${t("common.email")}: ${data.email.trim()}`,
      "",
      `${t("contact.mailto_body_message")}:`,
      data.message.trim(),
    ].join("\n");

  const handleChange = e => {
    const { name, value } = e.target;
    const next = { ...formData, [name]: value };
    setFormData(next);
    setCopyState("idle");
    // Once a field has been flagged, re-check it as the user types.
    if (errors[name]) {
      const fieldError = validate(next)[name];
      setErrors(prev => ({ ...prev, [name]: fieldError }));
    }
  };

  const handleSubmit = e => {
    e.preventDefault();
    const found = validate(formData);
    setErrors(found);
    const firstInvalid = ["name", "email", "message"].find(key => found[key]);
    if (firstInvalid) {
      setOpened(false);
      document.getElementById(`contact-${firstInvalid}`)?.focus();
      return;
    }

    const href = buildMailto({
      subject: `${t("contact.mailto_subject")} - ${formData.name.trim()}`,
      body: buildBody(formData),
    });
    setOpened(true);
    setCopyState("idle");
    globalThis.location.href = href;
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(buildBody(formData));
      setCopyState("copied");
    } catch {
      setCopyState("failed");
    }
  };

  return (
    <div className="page contact-page">
      <PageHero
        kicker={t("contact.kicker", "Secretaría SLACC")}
        title={t("contact.title")}
        subtitle={t("contact.subtitle")}
      />

      <Section>
        <div className="contact-layout">
          <aside className="card contact-info" aria-labelledby="contact-info-title">
            <div className="contact-logo-wrap">
              <img
                src="/LOGO SLACC_ROJO_HORIZONTAL.png"
                alt={t(
                  "contact.logo_alt",
                  "SLACC – Sociedad Latinoamericana de Cirugía de Cadera",
                )}
                className="contact-logo"
                width="3986"
                height="1606"
                decoding="async"
              />
            </div>

            <h2 id="contact-info-title" className="contact-info__title">
              {t("contact.info_title")}
            </h2>
            <p className="contact-info__lead">{t("contact.info_description")}</p>

            <ul className="contact-channels">
              <li className="contact-channel">
                <span className="icon-tile" aria-hidden="true">
                  <i className="fa-solid fa-envelope"></i>
                </span>
                <div className="contact-channel__body">
                  <p className="contact-channel__label">{t("common.email")}</p>
                  <a
                    href={`mailto:${CONTACT_EMAIL}`}
                    className="contact-channel__value contact-channel__link"
                  >
                    {CONTACT_EMAIL}
                  </a>
                </div>
              </li>
              <li className="contact-channel">
                <span className="icon-tile" aria-hidden="true">
                  <i className="fa-brands fa-instagram"></i>
                </span>
                <div className="contact-channel__body">
                  <p className="contact-channel__label">{t("contact.socials_title")}</p>
                  <a
                    href={INSTAGRAM_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="contact-channel__value contact-channel__link"
                  >
                    Instagram {INSTAGRAM_HANDLE}
                    <span className="sr-only">
                      {" "}
                      ({t("contact.opens_new_tab", "se abre en una pestaña nueva")})
                    </span>
                  </a>
                </div>
              </li>
              <li className="contact-channel">
                <span className="icon-tile" aria-hidden="true">
                  <i className="fa-regular fa-clock"></i>
                </span>
                <div className="contact-channel__body">
                  <p className="contact-channel__label">
                    {t("contact.response_label", "Tiempo de respuesta")}
                  </p>
                  <p className="contact-channel__value">
                    {t(
                      "contact.response_note",
                      "La Secretaría responde por correo electrónico, normalmente en pocos días hábiles.",
                    )}
                  </p>
                </div>
              </li>
            </ul>

            <Button
              href={`mailto:${CONTACT_EMAIL}`}
              variant="outline"
              fullWidth
              className="contact-info__cta"
            >
              <i className="fa-regular fa-envelope" aria-hidden="true"></i>
              {t("contact.btn_send_email")}
            </Button>
          </aside>

          <div className="card contact-form-card">
            <h2 className="contact-form-card__title">{t("contact.form_title")}</h2>
            <p className="contact-form-card__lead">{t("contact.form_description")}</p>

            <form onSubmit={handleSubmit} className="contact-form" noValidate>
              <div className="form-grid">
                <Input
                  id="contact-name"
                  label={t("contact.name_label")}
                  name="name"
                  autoComplete="name"
                  value={formData.name}
                  onChange={handleChange}
                  error={errors.name}
                  required
                />
                <Input
                  id="contact-email"
                  label={t("common.email")}
                  type="email"
                  name="email"
                  autoComplete="email"
                  inputMode="email"
                  value={formData.email}
                  onChange={handleChange}
                  error={errors.email}
                  required
                />
                <Textarea
                  id="contact-message"
                  className="span-2"
                  label={t("contact.message_label")}
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  rows={6}
                  maxLength={MESSAGE_MAX}
                  error={errors.message}
                  helperText={t("contact.message_counter", "{{current}} / {{max}} caracteres", {
                    current: formData.message.length,
                    max: MESSAGE_MAX,
                  })}
                  required
                />
              </div>

              <p className="contact-form__note">
                <i className="fa-solid fa-circle-info" aria-hidden="true"></i>
                <span>
                  {t(
                    "contact.mailto_note",
                    "Al enviar se abrirá tu aplicación de correo (Outlook, Mail, Gmail…) con el mensaje dirigido a {{email}}. Solo tendrás que revisarlo y presionar «Enviar».",
                    { email: CONTACT_EMAIL },
                  )}
                </span>
              </p>

              {opened && (
                <Alert variant="success" className="contact-form__status">
                  <p>
                    {t(
                      "contact.opened_text",
                      "Abrimos tu aplicación de correo con el mensaje listo para enviar.",
                    )}
                  </p>
                  <p>
                    {t(
                      "contact.opened_fallback",
                      "¿No se abrió? Copia el mensaje y envíalo a {{email}} desde tu correo.",
                      { email: CONTACT_EMAIL },
                    )}
                  </p>
                  <div className="contact-form__copy">
                    <Button variant="outline" size="sm" onClick={handleCopy}>
                      <i className="fa-regular fa-copy" aria-hidden="true"></i>
                      {t("contact.copy_btn", "Copiar mensaje")}
                    </Button>
                    <span className="contact-form__copy-status" aria-live="polite">
                      {copyState === "copied" &&
                        t("contact.copied", "Mensaje copiado al portapapeles.")}
                      {copyState === "failed" &&
                        t(
                          "contact.copy_failed",
                          "No se pudo copiar automáticamente. Selecciona el texto del mensaje y cópialo.",
                        )}
                    </span>
                  </div>
                </Alert>
              )}

              <div className="form-actions contact-form__actions">
                <Button type="submit" size="lg">
                  <i className="fa-regular fa-paper-plane" aria-hidden="true"></i>
                  {t("contact.btn_submit")}
                </Button>
              </div>
            </form>
          </div>
        </div>
      </Section>
    </div>
  );
}
