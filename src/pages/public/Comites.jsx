import { Section, Container, Grid, Card } from "../../components/ui";

const committees = [
  {
    id: 1,
    name: "Comité de Subespecialidades",
    description:
      "Coordinación y desarrollo de áreas especializadas en cirugía cardiovascular",
    icon: "🏥",
  },
  {
    id: 2,
    name: "Comité de Ética",
    description:
      "Supervisión de estándares éticos y deontológicos en la práctica profesional",
    icon: "⚖️",
  },
  {
    id: 3,
    name: "Comité Científico",
    description: "Promoción de la investigación y publicaciones científicas",
    icon: "🔬",
  },
  {
    id: 4,
    name: "Comité de Educación",
    description: "Organización de programas de formación y educación continua",
    icon: "📚",
  },
  {
    id: 5,
    name: "Comité de Acreditación",
    description:
      "Evaluación y certificación de programas de formación en cirugía cardiovascular",
    icon: "✓",
  },
  {
    id: 6,
    name: "Comité de Relaciones Internacionales",
    description: "Colaboración con sociedades y organizaciones internacionales",
    icon: "🌎",
  },
];

export default function Comites() {
  return (
    <Section>
      <Container size="lg">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-4">Comités SLACC</h1>
          <p className="text-xl text-gray-600">
            Grupos de trabajo especializados que impulsan el desarrollo de
            nuestra sociedad
          </p>
        </div>

        <Grid cols={2} gap={6}>
          {committees.map(committee => (
            <Card key={committee.id} className="p-6">
              <div className="text-5xl mb-4">{committee.icon}</div>
              <h3 className="text-xl font-bold mb-3">{committee.name}</h3>
              <p className="text-gray-600">{committee.description}</p>
            </Card>
          ))}
        </Grid>

        <div className="mt-12 bg-white rounded-lg shadow-md p-8">
          <h2 className="text-2xl font-bold mb-4">Funciones de los Comités</h2>
          <div className="space-y-4 text-gray-700">
            <p>
              Los comités de la SLACC son grupos de trabajo conformados por
              miembros destacados de la sociedad, que se encargan de áreas
              específicas del desarrollo profesional y organizacional.
            </p>
            <p>
              Cada comité trabaja de manera autónoma pero coordinada con la
              directiva, desarrollando iniciativas, programas y actividades que
              contribuyen al cumplimiento de los objetivos institucionales.
            </p>
            <p>
              Si está interesado en participar en algún comité o desea más
              información sobre sus actividades, por favor contacte a la
              secretaría de la sociedad.
            </p>
          </div>
        </div>
      </Container>
    </Section>
  );
}
