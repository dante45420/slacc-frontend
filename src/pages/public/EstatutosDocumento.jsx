import { Link } from "react-router-dom";
import { Section, Card, Button } from "../../components/ui";

export default function EstatutosDocumento() {
  return (
    <>
      <Section variant="primary" padding="lg" containerSize="lg">
        <div className="statutes-header">
          <p className="statutes-kicker">La Sociedad</p>
          <h1 className="statutes-title">Estatutos y Reglamento</h1>
          <p className="statutes-subtitle">
            Aqui podras descargar el documento oficial de estatutos una vez que
            la version final sea publicada por la directiva.
          </p>
        </div>
      </Section>

      <Section padding="lg" containerSize="lg">
        <Card className="statutes-card">
          <h2 className="statutes-card-title">Documento Institucional</h2>
          <p className="statutes-card-text">
            La descarga del PDF se encuentra temporalmente deshabilitada hasta
            contar con el archivo definitivo validado por el cliente.
          </p>

          <div className="statutes-actions">
            <Button variant="primary" size="lg" disabled>
              Descargar Estatutos PDF (Proximamente)
            </Button>
            <Link to="/nosotros" className="btn btn-outline">
              Volver a Quienes Somos
            </Link>
          </div>
        </Card>
      </Section>
    </>
  );
}
