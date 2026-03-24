import { Section, Card, Button, Grid } from "../../components/ui";

export default function Contact() {
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
        </Card>
      </Section>
    </>
  );
}
