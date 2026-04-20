import { Section, Card, Grid } from "../../components/ui";
import { TeamCarousel } from "../../components/TeamCarousel.jsx";

const executiveBoard = [
  {
    name: "Dr. Juan Perez",
    role: "Presidente",
    country: "Chile",
    photo: "https://i.pravatar.cc/300?img=12",
  },
  {
    name: "Dra. Maria Garcia",
    role: "Vicepresidenta",
    country: "Argentina",
    photo: "https://i.pravatar.cc/300?img=47",
  },
  {
    name: "Dr. Luis Fernandez",
    role: "Secretario General",
    country: "Mexico",
    photo: "https://i.pravatar.cc/300?img=68",
  },
  {
    name: "Dra. Ana Martinez",
    role: "Tesorera",
    country: "Colombia",
    photo: "https://i.pravatar.cc/300?img=33",
  },
  {
    name: "Dr. Carlos Rodriguez",
    role: "Vocal Cientifico",
    country: "Peru",
    photo: "https://i.pravatar.cc/300?img=24",
  },
  {
    name: "Dra. Patricia Torres",
    role: "Vocal de Formacion",
    country: "Brasil",
    photo: "https://i.pravatar.cc/300?img=51",
  },
];

export default function Directiva() {
  return (
    <>
      <Section variant="primary" padding="lg" containerSize="lg">
        <div className="board-header">
          <p className="board-kicker">La Sociedad</p>
          <h1 className="board-title">Mesa Directiva y Comite Ejecutivo</h1>
          <p className="board-subtitle">
            Liderazgo regional comprometido con la excelencia academica,
            cientifica y asistencial en cirugia de cadera.
          </p>
        </div>
      </Section>

      <Section padding="lg" containerSize="lg">
        <Grid columns={3} gap={4} className="board-grid">
          {executiveBoard.map(member => (
            <Card key={member.name} className="board-member-card">
              <img
                src={member.photo}
                alt={member.name}
                className="board-member-photo"
              />
              <h2 className="board-member-name">{member.name}</h2>
              <p className="board-member-role">{member.role}</p>
              <p className="board-member-country">{member.country}</p>
            </Card>
          ))}
        </Grid>
      </Section>

      <Section variant="alt" padding="lg" containerSize="lg">
        <h2 className="board-carousel-title">Comite Ejecutivo</h2>
        <p className="board-carousel-subtitle">
          Equipo de trabajo que coordina programas academicos, relacionamiento
          regional y lineamientos tecnicos de la sociedad.
        </p>
        <TeamCarousel members={executiveBoard} />
      </Section>
    </>
  );
}
