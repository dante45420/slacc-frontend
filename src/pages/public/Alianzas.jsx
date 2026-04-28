import { useTranslation } from "react-i18next";
import { Section, Card, Grid } from "../../components/ui";

const alliedSocieties = [
  {
    country: "Argentina",
    society: "Sociedad Argentina de Cirugia de Cadera",
    contact: "contacto.argentina@slacc.org",
    status: "Activa",
  },
  {
    country: "Mexico",
    society: "Sociedad Mexicana de Cirugia de Cadera",
    contact: "contacto.mexico@slacc.org",
    status: "Activa",
  },
  {
    country: "Colombia",
    society: "Sociedad Colombiana de Cadera y Pelvis",
    contact: "contacto.colombia@slacc.org",
    status: "Activa",
  },
  {
    country: "Chile",
    society: "Comite Chileno de Cirugia de Cadera",
    contact: "contacto.chile@slacc.org",
    status: "En integracion",
  },
  {
    country: "Peru",
    society: "Capitulo Peruano de Cirugia de Cadera",
    contact: "contacto.peru@slacc.org",
    status: "En integracion",
  },
  {
    country: "Brasil",
    society: "Grupo Brasileiro de Cirurgia do Quadril",
    contact: "contacto.brasil@slacc.org",
    status: "Activa",
  },
];

export default function Alianzas() {
  const { t } = useTranslation();

  return (
    <>
      <Section variant="primary" padding="lg" containerSize="lg">
        <div className="alliances-header">
          <p className="alliances-kicker">{t("alianzas.kicker")}</p>
          <h1 className="alliances-title">{t("alianzas.title")}</h1>
          <p className="alliances-subtitle">{t("alianzas.subtitle")}</p>
        </div>
      </Section>

      <Section padding="lg" containerSize="lg">
        <Card className="alliances-map-card">
          <h2 className="alliances-map-title">{t("alianzas.map_title")}</h2>
          <p className="alliances-map-description">{t("alianzas.map_desc")}</p>
          <div className="alliances-map-placeholder" aria-hidden="true">
            <i className="fa-solid fa-map-location-dot"></i>
            <span>{t("alianzas.map_placeholder")}</span>
          </div>
        </Card>
      </Section>

      <Section variant="alt" padding="lg" containerSize="lg">
        <Grid columns={3} gap={4} className="alliances-grid">
          {alliedSocieties.map(society => (
            <Card
              key={`${society.country}-${society.society}`}
              className="alliances-card"
            >
              <div className="alliances-card-header">
                <h2 className="alliances-card-country">{society.country}</h2>
                <span className="alliances-status">
                  {t(`alianzas.status.${society.status}`, society.status)}
                </span>
              </div>
              <p className="alliances-card-society">{society.society}</p>
              <a
                href={`mailto:${society.contact}`}
                className="alliances-contact"
              >
                {society.contact}
              </a>
            </Card>
          ))}
        </Grid>
      </Section>
    </>
  );
}
