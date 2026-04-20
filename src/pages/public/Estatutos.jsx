import { Link } from "react-router-dom";
import { Section, Card, Grid } from "../../components/ui";

const values = [
  {
    title: "Excelencia Académica y Quirúrgica",
    description:
      "Promovemos la estandarización y actualización constante en las técnicas quirúrgicas más avanzadas y seguras para el beneficio de los pacientes.",
    icon: "fa-solid fa-user-doctor",
  },
  {
    title: "Integración Regional",
    description:
      "Creemos en la fuerza de la unidad. Fomentamos el trabajo colaborativo y el intercambio cultural y científico entre las sociedades de cadera de todos los países latinoamericanos.",
    icon: "fa-solid fa-earth-americas",
  },
  {
    title: "Compromiso Docente",
    description:
      "Asumimos la responsabilidad de guiar, facilitar y avalar la formación de nuevos cirujanos a través de programas estructurados, pasantías y becas de especialización.",
    icon: "fa-solid fa-graduation-cap",
  },
  {
    title: "Ética Profesional",
    description:
      "Guiamos todas nuestras acciones e investigaciones bajo los más estrictos principios de integridad, transparencia y rigor científico.",
    icon: "fa-solid fa-scale-balanced",
  },
  {
    title: "Innovación",
    description:
      "Apoyamos y difundimos la investigación científica y el desarrollo de nuevas tecnologías aplicadas a la ortopedia y traumatología de cadera.",
    icon: "fa-solid fa-lightbulb",
  },
];

export default function Estatutos() {
  return (
    <>
      <Section variant="primary" padding="lg" containerSize="lg">
        <div className="about-header">
          <p className="about-kicker">Pilares Institucionales</p>
          <h1 className="about-title">Quiénes Somos</h1>
          <p className="about-subtitle">
            Somos la Sociedad Latinoamericana de Cirugía de Cadera, una red
            científica orientada a fortalecer la práctica quirúrgica, académica
            y ética de nuestra especialidad en toda la región.
          </p>
        </div>
      </Section>

      <Section padding="lg" containerSize="lg">
        <div className="about-pillars-grid">
          <Card className="about-pillars-card">
            <h2 className="about-pillars-title">Nuestra Misión</h2>
            <p className="about-pillars-text">
              Congregar y representar a los cirujanos especialistas en cadera de
              toda Latinoamérica, fomentando la excelencia académica, científica
              y ética en el tratamiento de las patologías de cadera. Nos
              dedicamos a impulsar el intercambio de conocimientos, la difusión
              de nuevas técnicas quirúrgicas y a coordinar, supervisar y ser
              garantes de la más alta calidad en la formación de las nuevas
              generaciones de especialistas, trabajando en estrecha sinergia con
              las sociedades nacionales de cada país.
            </p>
          </Card>

          <Card className="about-pillars-card">
            <h2 className="about-pillars-title">Nuestra Visión</h2>
            <p className="about-pillars-text">
              Ser la institución científica de referencia y el ente rector de la
              cirugía de cadera en Latinoamérica. Aspiramos a consolidar una red
              integrada de especialistas que eleve de manera constante los
              estándares de calidad en el cuidado del paciente, liderando la
              innovación quirúrgica, la investigación científica y la
              certificación de programas de formación médica continua a nivel
              continental.
            </p>
          </Card>
        </div>
      </Section>

      <Section variant="alt" padding="lg" containerSize="lg">
        <div className="about-values-header">
          <h2 className="about-values-title">Nuestros Fundamentos y Valores</h2>
          <p className="about-values-subtitle">
            Estos principios orientan cada acción institucional, cada instancia
            académica y cada decisión científica que promovemos en SLACC.
          </p>
        </div>

        <Grid columns={3} gap={4} className="about-values-grid">
          {values.map(value => (
            <Card key={value.title} className="about-value-card">
              <div className="about-value-icon" aria-hidden="true">
                <i className={value.icon}></i>
              </div>
              <h3 className="about-value-title">{value.title}</h3>
              <p className="about-value-description">{value.description}</p>
            </Card>
          ))}
        </Grid>
      </Section>

      <Section padding="lg" containerSize="lg">
        <div className="about-society-grid">
          <Card className="about-society-card">
            <h2 className="about-society-title">Mesa Directiva</h2>
            <p className="about-society-text">
              Conoce al comite ejecutivo y a los lideres que coordinan la agenda
              academica y cientifica de SLACC.
            </p>
            <Link to="/nosotros/directiva" className="btn btn-outline">
              Ver Mesa Directiva
            </Link>
          </Card>

          <Card className="about-society-card">
            <h2 className="about-society-title">Historia</h2>
            <p className="about-society-text">
              Revisa la evolucion institucional de la sociedad y los hitos que
              marcaron nuestra integracion regional.
            </p>
            <Link to="/nosotros/historia" className="btn btn-outline">
              Ver Historia
            </Link>
          </Card>

          <Card className="about-society-card">
            <h2 className="about-society-title">Estatutos</h2>
            <p className="about-society-text">
              Descarga el reglamento institucional vigente en formato PDF.
            </p>
            <Link to="/nosotros/estatutos" className="btn btn-primary">
              Ver seccion de Estatutos
            </Link>
          </Card>
        </div>
      </Section>
    </>
  );
}
