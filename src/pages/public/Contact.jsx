import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Section, Card, Button, Input, Textarea, PageHero } from "../../components/ui";

export default function Contact() {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  });

  const handleChange = e => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = e => {
    e.preventDefault();
    const subject = encodeURIComponent(t("contact.mailto_subject"));
    const body = encodeURIComponent(
      `${t("contact.mailto_body_name")}: ${formData.name}\n${t("common.email")}: ${formData.email}\n\n${t("contact.mailto_body_message")}:\n${formData.message}`,
    );

    globalThis.location.href = `mailto:Slacc@cadera.cl?subject=${subject}&body=${body}`;
  };

  return (
    <>
      <Section variant="primary" padding="lg" containerSize="sm">
        <PageHero title={t("contact.title")} subtitle={t("contact.subtitle")} />
      </Section>

      <Section variant="default" padding="lg" containerSize="sm">
        <div className="contact-logo-wrap">
          <img
            src="/LOGO SLACC_ROJO_HORIZONTAL.png"
            alt="SLACC Logo"
            className="contact-logo"
          />
        </div>

        <Card className="contact-card contact-card-centered">
          <h2 className="contact-section-title">{t("contact.info_title")}</h2>
          <p className="contact-description">{t("contact.info_description")}</p>

          <div className="contact-email-box contact-email-box-spaced">
            <p className="contact-email-label">{t("common.email")}</p>
            <a href="mailto:Slacc@cadera.cl" className="contact-email-link">
              Slacc@cadera.cl
            </a>
          </div>

          <a href="mailto:Slacc@cadera.cl">
            <Button variant="primary" size="lg">
              {t("contact.btn_send_email")}
            </Button>
          </a>

          <div className="contact-socials">
            <h3 className="contact-socials-title">{t("contact.socials_title")}</h3>
            <div className="contact-socials-links">
              <a
                href="https://www.linkedin.com"
                target="_blank"
                rel="noreferrer"
                className="contact-social-link"
              >
                <i className="fa-brands fa-linkedin"></i> LinkedIn
              </a>
              <a
                href="https://x.com"
                target="_blank"
                rel="noreferrer"
                className="contact-social-link"
              >
                <i className="fa-brands fa-x-twitter"></i> X / Twitter
              </a>
              <a
                href="https://www.instagram.com"
                target="_blank"
                rel="noreferrer"
                className="contact-social-link"
              >
                <i className="fa-brands fa-instagram"></i>
                Instagram
              </a>
            </div>
          </div>
        </Card>

        <Card className="contact-card-alt contact-form-card">
          <h2 className="contact-section-title">{t("contact.form_title")}</h2>
          <p className="contact-description">{t("contact.form_description")}</p>

          <form onSubmit={handleSubmit} className="contact-form">
            <Input
              label={t("contact.name_label")}
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
            />
            <Input
              label={t("common.email")}
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
            />
            <Textarea
              label={t("contact.message_label")}
              name="message"
              value={formData.message}
              onChange={handleChange}
              rows={5}
              required
            />

            <Button type="submit" variant="primary" size="lg">
              {t("contact.btn_submit")}
            </Button>
          </form>
        </Card>
      </Section>
    </>
  );
}
