import { Link } from "react-router-dom";
import { Section, Card, Grid } from "../../components/ui";

const premiumModules = [
  {
    title: "Videoteca de cirugias",
    description:
      "Acceso a grabaciones comentadas, webinars pasados y casos clinicos para aprendizaje continuo.",
    icon: "fa-solid fa-video",
  },
  {
    title: "Directorio completo",
    description:
      "Busqueda avanzada de miembros por pais, ciudad y area de experticia para colaboracion profesional.",
    icon: "fa-solid fa-address-book",
  },
  {
    title: "Foros privados",
    description:
      "Espacios de discusion clinica y academica exclusivos para socios activos al dia.",
    icon: "fa-solid fa-comments",
  },
];

export default function MemberPortal() {
  return (
    <>
      <Section variant="primary" padding="lg" containerSize="lg">
        <div className="portal-header">
          <p className="portal-kicker">Area Privada</p>
          <h1 className="portal-title">Portal de Socios Activos</h1>
          <p className="portal-subtitle">
            Contenido premium exclusivo para miembros al dia con su cuota.
          </p>
        </div>
      </Section>

      <Section padding="lg" containerSize="lg">
        <Grid columns={3} gap={4} className="portal-grid">
          {premiumModules.map(module => (
            <Card key={module.title} className="portal-card">
              <div className="portal-icon" aria-hidden="true">
                <i className={module.icon}></i>
              </div>
              <h2 className="portal-card-title">{module.title}</h2>
              <p className="portal-card-description">{module.description}</p>
              <button className="btn btn-outline btn-sm" disabled>
                Proximamente
              </button>
            </Card>
          ))}
        </Grid>
      </Section>

      <Section variant="alt" padding="lg" containerSize="lg">
        <Card className="portal-help-card">
          <h2 className="portal-help-title">Soporte de membresia</h2>
          <p className="portal-help-text">
            Si necesitas ayuda con tu estado de pago o activacion de acceso,
            contacta a secretaria SLACC.
          </p>
          <div className="portal-help-actions">
            <Link to="/contacto" className="btn btn-primary">
              Contactar soporte
            </Link>
            <Link to="/perfil" className="btn btn-outline">
              Ver mi perfil
            </Link>
          </div>
        </Card>
      </Section>
    </>
  );
}
