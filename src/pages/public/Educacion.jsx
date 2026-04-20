import { Link, useLocation } from "react-router-dom";
import { useEffect } from "react";
import { Section, Card, Grid } from "../../components/ui";

const routeToSection = {
  "/educacion/aval-certificacion": "aval-certificacion",
  "/educacion/becas": "becas",
  "/educacion/videoteca": "videoteca",
};

const fellowships = [
  {
    title: "Fellowship Regional en Reconstruccion Primaria",
    mode: "Convocatoria abierta",
    duration: "3 meses",
    location: "Sede acreditada SLACC",
  },
  {
    title: "Pasantia en Revision Compleja de Cadera",
    mode: "Proxima convocatoria",
    duration: "6 semanas",
    location: "Programa multicentrico",
  },
];

const testimonials = [
  {
    name: "Dra. Carolina R.",
    text: "La pasantia me permitio estandarizar tecnicas y volver a mi centro con protocolos aplicables desde el primer mes.",
  },
  {
    name: "Dr. Miguel A.",
    text: "El acompanamiento docente y la red de mentores de SLACC elevaron sustancialmente la calidad de mi formacion.",
  },
];

export default function Educacion() {
  const location = useLocation();

  useEffect(() => {
    const targetId = routeToSection[location.pathname];
    if (!targetId) return;

    const element = document.getElementById(targetId);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [location.pathname]);

  return (
    <>
      <Section variant="primary" padding="lg" containerSize="lg">
        <div className="education-header">
          <p className="education-kicker">Educacion y Formacion</p>
          <h1 className="education-title">
            Formacion Continua en Cirugia de Cadera
          </h1>
          <p className="education-subtitle">
            Programas academicos para garantizar calidad formativa, innovacion
            quirurgica y desarrollo profesional en toda Latinoamerica.
          </p>

          <div className="education-quick-links">
            <Link
              to="/educacion/aval-certificacion"
              className="btn btn-outline"
            >
              Aval y Certificacion
            </Link>
            <Link to="/educacion/becas" className="btn btn-outline">
              Becas y Pasantias
            </Link>
            <Link to="/educacion/videoteca" className="btn btn-outline">
              Aula Virtual
            </Link>
          </div>
        </div>
      </Section>

      <Section padding="lg" containerSize="lg">
        <Card id="aval-certificacion" className="education-section-card">
          <h2 className="education-section-title">Aval y Certificacion</h2>
          <p className="education-section-description">
            SLACC coordina y supervisa estandares de formacion para garantizar
            programas consistentes en cirugia de cadera a nivel regional.
          </p>
          <ul className="education-list">
            <li>Requisitos academicos y clinicos para centros sede.</li>
            <li>Evaluacion periodica de hospitales acreditados.</li>
            <li>Rutas de certificacion para formacion medica continua.</li>
          </ul>
        </Card>
      </Section>

      <Section variant="alt" padding="lg" containerSize="lg">
        <div id="becas" className="education-section-anchor"></div>
        <h2 className="education-section-title">
          Programa de Becas y Pasantias
        </h2>
        <p className="education-section-description">
          Convocatorias para fellows y especialistas jovenes con foco en
          entrenamiento practico, mentorship y rotaciones estructuradas.
        </p>

        <Grid columns={2} gap={4} className="education-fellowship-grid">
          {fellowships.map(item => (
            <Card key={item.title} className="education-fellowship-card">
              <h3 className="education-fellowship-title">{item.title}</h3>
              <p className="education-fellowship-meta">{item.mode}</p>
              <p className="education-fellowship-meta">
                Duracion: {item.duration}
              </p>
              <p className="education-fellowship-meta">Sede: {item.location}</p>
              <Link to="/contacto" className="btn btn-primary btn-sm">
                Postular / Solicitar informacion
              </Link>
            </Card>
          ))}
        </Grid>

        <h3 className="education-testimonials-title">
          Testimonios de ex-becarios
        </h3>
        <Grid columns={2} gap={4} className="education-testimonials-grid">
          {testimonials.map(item => (
            <Card key={item.name} className="education-testimonial-card">
              <p className="education-testimonial-text">"{item.text}"</p>
              <p className="education-testimonial-name">{item.name}</p>
            </Card>
          ))}
        </Grid>
      </Section>

      <Section padding="lg" containerSize="lg">
        <Card id="videoteca" className="education-section-card">
          <h2 className="education-section-title">Aula Virtual y Videoteca</h2>
          <p className="education-section-description">
            Biblioteca de cirugias comentadas, webinars grabados y discusion de
            casos clinicos para estudio asincronico.
          </p>
          <div className="education-access-box">
            <p className="education-access-text">
              Acceso exclusivo para miembros activos de la sociedad.
            </p>
            <div className="education-access-actions">
              <Link to="/portal-socios" className="btn btn-primary">
                Ingresar a Aula Virtual
              </Link>
              <Link to="/solicitar-membresia" className="btn btn-outline">
                Hazte socio
              </Link>
            </div>
          </div>
        </Card>
      </Section>
    </>
  );
}
