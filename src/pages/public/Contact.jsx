import { useState } from "react";
import { Section, Card, Button, Input, Textarea } from "../../components/ui";

export default function Contact() {
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
    const subject = encodeURIComponent("Consulta desde sitio web SLACC");
    const body = encodeURIComponent(
      `Nombre: ${formData.name}\nEmail: ${formData.email}\n\nMensaje:\n${formData.message}`,
    );

    globalThis.location.href = `mailto:Slacc@cadera.cl?subject=${subject}&body=${body}`;
  };

  return (
    <>
      <Section variant="primary" padding="lg" containerSize="sm">
        <div className="contact-header">
          <h1 className="contact-title">Contáctanos</h1>
          <p className="contact-subtitle">
            Estamos aquí para responder tus preguntas
          </p>
        </div>
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
          <h2 className="contact-section-title">Información de Contacto</h2>
          <p className="contact-description">
            Correo oficial de la Secretaría SLACC
          </p>

          <div className="contact-email-box contact-email-box-spaced">
            <p className="contact-email-label">Email</p>
            <a href="mailto:Slacc@cadera.cl" className="contact-email-link">
              Slacc@cadera.cl
            </a>
          </div>

          <a href="mailto:Slacc@cadera.cl">
            <Button variant="primary" size="lg">
              Enviar Email
            </Button>
          </a>

          <div className="contact-socials">
            <h3 className="contact-socials-title">Redes sociales</h3>
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
          <h2 className="contact-section-title">Formulario de contacto</h2>
          <p className="contact-description">
            Completa el formulario y abriremos tu cliente de correo con el
            mensaje listo para enviar.
          </p>

          <form onSubmit={handleSubmit} className="contact-form">
            <Input
              label="Nombre"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
            />
            <Input
              label="Email"
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
            />
            <Textarea
              label="Mensaje"
              name="message"
              value={formData.message}
              onChange={handleChange}
              rows={5}
              required
            />

            <Button type="submit" variant="primary" size="lg">
              Enviar consulta
            </Button>
          </form>
        </Card>
      </Section>
    </>
  );
}
