import { Section, Container, Grid, Card } from "../../components/ui";

const committees = [
  {
    id: "subespecialidades",
    name: "Comité de Subespecialidades",
    description:
      "Coordinación y desarrollo de áreas especializadas en cirugía cardiovascular",
    members: [
      { name: "Dr. Juan Pérez", role: "Presidente" },
      { name: "Dra. María García", role: "Secretaria" },
      { name: "Dr. Carlos Rodríguez", role: "Vocal" },
    ],
  },
  {
    id: "etica",
    name: "Comité de Ética",
    description:
      "Supervisión de estándares éticos y deontológicos en la práctica profesional",
    members: [
      { name: "Dra. Ana Martínez", role: "Presidenta" },
      { name: "Dr. Luis Fernández", role: "Secretario" },
      { name: "Dra. Carmen López", role: "Vocal" },
    ],
  },
  {
    id: "cientifico",
    name: "Comité Científico",
    description: "Promoción de la investigación y publicaciones científicas",
    members: [
      { name: "Dr. Roberto Sánchez", role: "Presidente" },
      { name: "Dra. Laura Torres", role: "Secretaria" },
      { name: "Dr. Miguel Ángel Ruiz", role: "Vocal" },
    ],
  },
  {
    id: "comite-a",
    name: "Comité A",
    description:
      "Grupo especializado en el desarrollo de iniciativas estratégicas",
    members: [
      { name: "Dr. Pedro Gómez", role: "Presidente" },
      { name: "Dra. Isabel Moreno", role: "Secretaria" },
      { name: "Dr. Francisco Navarro", role: "Vocal" },
    ],
  },
  {
    id: "comite-b",
    name: "Comité B",
    description: "Grupo enfocado en la coordinación de actividades académicas",
    members: [
      { name: "Dra. Patricia Jiménez", role: "Presidenta" },
      { name: "Dr. Antonio Castro", role: "Secretario" },
      { name: "Dra. Silvia Romero", role: "Vocal" },
    ],
  },
  {
    id: "comite-c",
    name: "Comité C",
    description:
      "Grupo dedicado al análisis y seguimiento de proyectos institucionales",
    members: [
      { name: "Dr. Jorge Vargas", role: "Presidente" },
      { name: "Dra. Teresa Medina", role: "Secretaria" },
      { name: "Dr. Raúl Ortiz", role: "Vocal" },
    ],
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

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "var(--spacing-8)",
          }}
        >
          {committees.map(committee => (
            <div key={committee.id} id={committee.id}>
              <Card className="p-6">
                <h2 className="text-2xl font-bold mb-3">{committee.name}</h2>
                <p className="text-gray-600 mb-6">{committee.description}</p>

                <h3 className="text-lg font-semibold mb-4">
                  Miembros del Comité
                </h3>
                <Grid cols={3} gap={4}>
                  {committee.members.map(member => (
                    <Card
                      key={member.name}
                      className="p-4"
                      style={{ background: "var(--color-bg-alt)" }}
                    >
                      <div
                        style={{
                          width: "80px",
                          height: "80px",
                          borderRadius: "50%",
                          background: "var(--color-primary)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          margin: "0 auto var(--spacing-3)",
                          fontSize: "2rem",
                          color: "white",
                        }}
                      >
                        {member.name
                          .split(" ")
                          .map(n => n[0])
                          .join("")}
                      </div>
                      <h4 className="font-semibold text-center mb-1">
                        {member.name}
                      </h4>
                      <p className="text-sm text-center text-gray-600">
                        {member.role}
                      </p>
                    </Card>
                  ))}
                </Grid>
              </Card>
            </div>
          ))}
        </div>

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
