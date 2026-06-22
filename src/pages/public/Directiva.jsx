import { useTranslation } from "react-i18next";
import { Section, Card, Grid, PageHero } from "../../components/ui";
import { TeamCarousel } from "../../components/TeamCarousel.jsx";

const executiveBoard = [
  {
    name: "Dr. Dante Parodi",
    role: "Presidente",
    country: "Chile",
    photo: "https://i.pravatar.cc/300?img=12",
  },
  {
    name: "Dr. Marcelo Queiroz",
    role: "1er. Vicepresidente",
    country: "Brasil",
    photo: "https://i.pravatar.cc/300?img=47",
  },
  {
    name: "Dr. Ricardo Munafo",
    role: "2do vicepresidente",
    country: "Argentina",
    photo: "/directiva/Ricardo Munafo.jpeg",
  },
  {
    name: "Dr. Pablo Cornejo",
    role: "Secretario",
    country: "Ecuador",
    photo: "/directiva/Pablo Cornejo.jpeg",
  },
  {
    name: "Dr. Yuri Ochoa",
    role: "Tesorero",
    country: "Peru",
    photo: "https://i.pravatar.cc/300?img=68",
  },
  {
    name: "Dr. Fidel Dobarganes",
    role: "Director internacional",
    country: "México",
    photo: "/directiva/Fidel Dobarganes.jpeg",
  },
  {
    name: "Dra. Daniela Seidel",
    role: "Directora Next Gen",
    country: "México",
    photo: "https://i.pravatar.cc/300?img=33",
  },
];

export default function Directiva() {
  const { t } = useTranslation();

  return (
    <>
      <Section variant="primary" padding="lg" containerSize="lg">
        <PageHero
          kicker={t("directiva.society_kicker")}
          title={t("directiva.title")}
          subtitle={t("directiva.subtitle")}
        />
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
              <p className="board-member-role">
                {t(`directiva.roles.${member.role}`, member.role)}
              </p>
              <p className="board-member-country">{member.country}</p>
            </Card>
          ))}
        </Grid>
      </Section>

      <Section variant="alt" padding="lg" containerSize="lg">
        <h2 className="board-carousel-title">
          {t("directiva.committee_title")}
        </h2>
        <p className="board-carousel-subtitle">
          {t("directiva.committee_subtitle")}
        </p>
        <TeamCarousel
          members={executiveBoard.map(m => ({
            ...m,
            role: t(`directiva.roles.${m.role}`, m.role),
          }))}
        />
      </Section>
    </>
  );
}
