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

      <Section variant="default" padding="lg" containerSize="default">
        <div className="contact-grid-wrapper">
          <Grid columns="1.2fr 0.8fr" gap="var(--spacing-5)">
            <Card className="contact-card">
              <h2 className="contact-section-title">Información de Contacto</h2>
              <p className="contact-description">
                Correo oficial de la Secretaría SLACC
              </p>

              <div className="contact-email-box">
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

            <Card className="contact-card-alt">
              <h3 className="contact-section-title">Horarios de Atención</h3>
              <ul className="contact-schedule-list">
                <li className="contact-schedule-item">
                  <i className="fa-regular fa-clock contact-schedule-icon"></i>
                  <span>Lun-Vie 9:00–18:00 (GMT-3)</span>
                </li>
                <li className="contact-schedule-item">
                  <i className="fa-regular fa-hourglass-half contact-schedule-icon"></i>
                  <span>Respuesta en 48 horas</span>
                </li>
                <li className="contact-schedule-item">
                  <i className="fa-solid fa-globe contact-schedule-icon"></i>
                  <span>Español / Portugués</span>
                </li>
              </ul>
            </Card>
          </Grid>
        </div>
      </Section>
    </>
  );
}
