import { Link } from "react-router-dom";
import { Container, Section, Button } from "../../components/ui";

export default function NotFound() {
  return (
    <Section variant="light">
      <Container>
        <div style={{ textAlign: "center", padding: "var(--spacing-8) 0" }}>
          <h1
            style={{
              fontSize: "6rem",
              marginBottom: "var(--spacing-4)",
              color: "var(--color-primary)",
            }}
          >
            404
          </h1>
          <h2 style={{ marginBottom: "var(--spacing-3)" }}>
            Página no encontrada
          </h2>
          <p
            style={{
              marginBottom: "var(--spacing-6)",
              color: "var(--text-muted)",
            }}
          >
            Lo sentimos, la página que buscas no existe o ha sido movida.
          </p>
          <Link to="/">
            <Button>Volver al inicio</Button>
          </Link>
        </div>
      </Container>
    </Section>
  );
}
