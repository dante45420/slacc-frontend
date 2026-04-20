import { Link } from "react-router-dom";
import { Section, Card } from "../../components/ui";

const milestones = [
  {
    year: "2018",
    title: "Fundación de la red académica",
    description:
      "Un grupo de especialistas latinoamericanos en cirugía de cadera inicia una mesa de trabajo regional para estandarizar criterios de formación y práctica clínica.",
  },
  {
    year: "2020",
    title: "Primer programa colaborativo",
    description:
      "Se formalizan actividades conjuntas entre sociedades nacionales con sesiones clínicas, ateneos y webinars regionales.",
  },
  {
    year: "2023",
    title: "Consolidación institucional",
    description:
      "SLACC fortalece su estructura académica y operativa para coordinar programas de capacitación, investigación y certificación continua.",
  },
  {
    year: "Hoy",
    title: "Expansión continental",
    description:
      "La sociedad trabaja activamente para integrar más especialistas y elevar de forma sostenida los estándares de calidad en toda Latinoamérica.",
  },
];

export default function Historia() {
  return (
    <>
      <Section variant="primary" padding="lg" containerSize="lg">
        <div className="history-header">
          <p className="history-kicker">La Sociedad</p>
          <h1 className="history-title">Nuestra Historia</h1>
          <p className="history-subtitle">
            Nacimos para unir a los especialistas en cirugía de cadera de la
            región, con una visión común: formación de excelencia, práctica
            ética y colaboración científica permanente.
          </p>
        </div>
      </Section>

      <Section padding="lg" containerSize="lg">
        <div className="history-timeline">
          {milestones.map(item => (
            <Card
              key={`${item.year}-${item.title}`}
              className="history-item-card"
            >
              <p className="history-item-year">{item.year}</p>
              <h2 className="history-item-title">{item.title}</h2>
              <p className="history-item-description">{item.description}</p>
            </Card>
          ))}
        </div>
      </Section>

      <Section variant="alt" padding="lg" containerSize="lg">
        <Card className="history-cta-card">
          <h2 className="history-cta-title">Conoce también</h2>
          <p className="history-cta-description">
            Explora nuestra organización institucional, lineamientos y equipo de
            liderazgo.
          </p>
          <div className="history-cta-actions">
            <Link to="/nosotros/directiva" className="btn btn-primary">
              Mesa Directiva
            </Link>
            <Link to="/nosotros/estatutos" className="btn btn-outline">
              Estatutos y Reglamento
            </Link>
          </div>
        </Card>
      </Section>
    </>
  );
}
