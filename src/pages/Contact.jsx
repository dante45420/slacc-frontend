import { Section, Card, Button, Grid } from "../components/ui";

export default function Contact() {
  return (
    <>
      <Section variant="primary" padding="lg" containerSize="sm">
        <div style={{ textAlign: "center" }}>
          <h1 style={{ marginBottom: "var(--spacing-3)" }}>Contáctanos</h1>
          <p style={{ fontSize: "18px", color: "var(--color-muted)" }}>
            Estamos aquí para responder tus preguntas
          </p>
        </div>
      </Section>

      <Section variant="default" padding="lg" containerSize="default">
        <Grid
          columns="1.2fr 0.8fr"
          gap="var(--spacing-5)"
          style={{ maxWidth: "900px", margin: "0 auto" }}
        >
          <Card style={{ padding: "var(--spacing-6)" }}>
            <h2 style={{ marginTop: 0, marginBottom: "var(--spacing-3)" }}>
              Información de Contacto
            </h2>
            <p
              style={{
                color: "var(--color-muted)",
                marginBottom: "var(--spacing-4)",
              }}
            >
              Correo oficial de la Secretaría SLACC
            </p>

            <div
              style={{
                background: "var(--color-bg-alt)",
                padding: "var(--spacing-4)",
                borderRadius: "var(--radius)",
                marginBottom: "var(--spacing-4)",
                border: "1px solid var(--color-border)",
              }}
            >
              <p
                style={{
                  margin: 0,
                  fontSize: "14px",
                  color: "var(--color-muted)",
                  marginBottom: "var(--spacing-2)",
                }}
              >
                Email
              </p>
              <a
                href="mailto:Slacc@cadera.cl"
                style={{
                  fontSize: "18px",
                  fontWeight: "600",
                  color: "var(--color-primary)",
                  textDecoration: "none",
                }}
              >
                Slacc@cadera.cl
              </a>
            </div>

            <a href="mailto:Slacc@cadera.cl">
              <Button
                variant="primary"
                size="lg"
                style={{ width: "fit-content" }}
              >
                Enviar Email
              </Button>
            </a>
          </Card>

          <Card
            style={{
              padding: "var(--spacing-6)",
              background: "var(--color-bg-alt)",
            }}
          >
            <h3 style={{ marginTop: 0, marginBottom: "var(--spacing-4)" }}>
              Horarios de Atención
            </h3>
            <ul
              style={{
                margin: 0,
                paddingLeft: 0,
                listStyle: "none",
                color: "var(--color-text-secondary)",
              }}
            >
              <li
                style={{
                  padding: "var(--spacing-3) 0",
                  borderBottom: "1px solid var(--color-border)",
                  display: "flex",
                  alignItems: "center",
                  gap: "var(--spacing-2)",
                }}
              >
                <span style={{ fontSize: "20px" }}>🕐</span>
                <span>Lun-Vie 9:00–18:00 (GMT-3)</span>
              </li>
              <li
                style={{
                  padding: "var(--spacing-3) 0",
                  borderBottom: "1px solid var(--color-border)",
                  display: "flex",
                  alignItems: "center",
                  gap: "var(--spacing-2)",
                }}
              >
                <span style={{ fontSize: "20px" }}>⏱️</span>
                <span>Respuesta en 48 horas</span>
              </li>
              <li
                style={{
                  padding: "var(--spacing-3) 0",
                  display: "flex",
                  alignItems: "center",
                  gap: "var(--spacing-2)",
                }}
              >
                <span style={{ fontSize: "20px" }}>🌎</span>
                <span>Español / Portugués</span>
              </li>
            </ul>
          </Card>
        </Grid>
      </Section>
    </>
  );
}
