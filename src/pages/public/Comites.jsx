import { useTranslation } from "react-i18next";
import { Section, Container, Grid, Card } from "../../components/ui";

export default function Comites() {
  const { t } = useTranslation();
  const committees = t("comites.list", { returnObjects: true });

  // Nombres de los comités originales (para que las fotos/iniciales funcionen bien si lo modifican luego)
  const originalMembersList = [
    [
      { name: "Dr. Juan Pérez", role: "Presidente" },
      { name: "Dra. María García", role: "Secretaria" },
      { name: "Dr. Carlos Rodríguez", role: "Vocal" },
    ],
    [
      { name: "Dra. Ana Martínez", role: "Presidenta" },
      { name: "Dr. Luis Fernández", role: "Secretario" },
      { name: "Dra. Carmen López", role: "Vocal" },
    ],
    [
      { name: "Dr. Roberto Sánchez", role: "Presidente" },
      { name: "Dra. Laura Torres", role: "Secretaria" },
      { name: "Dr. Miguel Ángel Ruiz", role: "Vocal" },
    ],
    [
      { name: "Dr. Pedro Gómez", role: "Presidente" },
      { name: "Dra. Isabel Moreno", role: "Secretaria" },
      { name: "Dr. Francisco Navarro", role: "Vocal" },
    ],
    [
      { name: "Dra. Patricia Jiménez", role: "Presidenta" },
      { name: "Dr. Antonio Castro", role: "Secretario" },
      { name: "Dra. Silvia Romero", role: "Vocal" },
    ],
    [
      { name: "Dr. Jorge Vargas", role: "Presidente" },
      { name: "Dra. Teresa Medina", role: "Secretaria" },
      { name: "Dr. Raúl Ortiz", role: "Vocal" },
    ],
  ];

  return (
    <Section>
      <Container size="lg">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-4">{t("comites.title")}</h1>
          <p className="text-xl text-gray-600">{t("comites.subtitle")}</p>
        </div>

        <div className="comites-list">
          {Array.isArray(committees) &&
            committees.map((committee, index) => (
              <div key={index} id={`comite-${index}`}>
                <Card className="p-6">
                  <h2 className="text-2xl font-bold mb-3">{committee.name}</h2>
                  <p className="text-gray-600 mb-6">{committee.description}</p>

                  <h3 className="text-lg font-semibold mb-4">
                    {t("comites.members_title")}
                  </h3>
                  <Grid cols={3} gap={4}>
                    {originalMembersList[index].map(member => (
                      <Card
                        key={member.name}
                        className="p-4 comites-member-card"
                      >
                        <div className="comites-member-initials">
                          {member.name
                            .split(" ")
                            .map(n => n[0])
                            .join("")}
                        </div>
                        <h4 className="font-semibold text-center mb-1">
                          {member.name}
                        </h4>
                        <p className="text-sm text-center text-gray-600">
                          {committee.roles[member.role] || member.role}
                        </p>
                      </Card>
                    ))}
                  </Grid>
                </Card>
              </div>
            ))}
        </div>

        <div className="mt-12 bg-white rounded-lg shadow-md p-8">
          <h2 className="text-2xl font-bold mb-4">
            {t("comites.functions_title")}
          </h2>
          <div className="space-y-4 text-gray-700">
            <p>{t("comites.functions_p1")}</p>
            <p>{t("comites.functions_p2")}</p>
            <p>{t("comites.functions_p3")}</p>
          </div>
        </div>
      </Container>
    </Section>
  );
}
