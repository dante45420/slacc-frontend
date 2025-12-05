import { useState, useEffect } from "react";
import { apiGet } from "../../api/client";
import {
  Grid,
  Card,
  Badge,
  Spinner,
  Alert,
  Section,
  Container,
} from "../../components/ui";

export default function SociosActivos() {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadMembers();
  }, []);

  async function loadMembers() {
    try {
      const data = await apiGet("/members");
      setMembers(data);
    } catch (err) {
      console.error("Error loading active members:", err);
      setError("No se pudo cargar la lista de socios activos.");
    } finally {
      setLoading(false);
    }
  }

  const getMembershipBadge = type => {
    const variants = {
      joven: "info",
      normal: "primary",
      gratuito: "success",
    };
    const labels = {
      joven: "Nex Gen",
      normal: "Socio",
      gratuito: "Emérito",
    };
    return {
      variant: variants[type] || "neutral",
      label: labels[type] || type,
    };
  };

  const getInitials = name => {
    return name
      .split(" ")
      .map(n => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const renderContent = () => {
    if (loading) {
      return (
        <div className="flex-center" style={{ minHeight: "300px" }}>
          <Spinner size="lg" />
        </div>
      );
    }

    if (error) {
      return <Alert variant="error">{error}</Alert>;
    }

    if (members.length === 0) {
      return (
        <Alert variant="info">
          No hay socios activos registrados en este momento.
        </Alert>
      );
    }

    return (
      <>
        <p className="text-muted mb-5">
          {members.length}{" "}
          {members.length === 1 ? "socio activo" : "socios activos"}
        </p>
        <Grid cols={3} gap={4}>
          {members.map(member => {
            const badge = getMembershipBadge(member.membership_type);
            return (
              <Card key={member.id} hoverable>
                <div className="flex flex-col align-center text-center gap-3">
                  <div
                    className="flex-center"
                    style={{
                      width: "80px",
                      height: "80px",
                      borderRadius: "50%",
                      background: "var(--color-primary)",
                      color: "white",
                      fontSize: "1.5rem",
                      fontWeight: "600",
                    }}
                  >
                    {getInitials(member.name)}
                  </div>
                  <div>
                    <h4 className="mb-2">{member.name}</h4>
                    <Badge variant={badge.variant}>{badge.label}</Badge>
                  </div>
                  <a
                    href={`mailto:${member.email}`}
                    className="btn btn-outline btn-sm"
                  >
                    Contactar
                  </a>
                </div>
              </Card>
            );
          })}
        </Grid>
      </>
    );
  };

  return (
    <Section>
      <Container>
        <h1 className="mb-2">Socios Activos</h1>
        <p className="text-muted mb-6" style={{ fontSize: "1.1rem" }}>
          Cirujanos cardiovasculares activos en nuestra plataforma
        </p>

        {renderContent()}
      </Container>
    </Section>
  );
}
