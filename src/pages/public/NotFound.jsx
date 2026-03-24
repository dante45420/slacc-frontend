import { Link } from "react-router-dom";
import { Container, Section, Button } from "../../components/ui";

export default function NotFound() {
  return (
    <Section variant="light">
      <Container>
        <div className="not-found-wrap">
          <h1 className="not-found-code">404</h1>
          <h2 className="not-found-title">Página no encontrada</h2>
          <p className="not-found-description">
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
