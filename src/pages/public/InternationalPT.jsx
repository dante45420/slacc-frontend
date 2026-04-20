import { Link } from "react-router-dom";
import { Section, Card, Grid } from "../../components/ui";

export default function InternationalPT() {
  return (
    <>
      <Section variant="primary" padding="lg" containerSize="lg">
        <div className="intl-header">
          <p className="intl-kicker">SLACC Internacional</p>
          <h1 className="intl-title">
            Sociedade Latino-Americana de Cirurgia do Quadril
          </h1>
          <p className="intl-subtitle">
            Secoes principais e informacoes do congresso em Portugues.
          </p>
        </div>
      </Section>

      <Section padding="lg" containerSize="lg">
        <Grid columns={2} gap={4} className="intl-grid">
          <Card className="intl-card">
            <h2 className="intl-card-title">Secoes Principais</h2>
            <ul className="intl-list">
              <li>A Sociedade</li>
              <li>Aliancas Nacionais</li>
              <li>Educacao e Fellowships</li>
              <li>Eventos Cientificos</li>
              <li>Associacao e Diretorio</li>
            </ul>
            <Link to="/" className="btn btn-outline btn-sm">
              Ir para site em Espanhol
            </Link>
          </Card>

          <Card className="intl-card">
            <h2 className="intl-card-title">Congresso Principal</h2>
            <p className="intl-congress-name">SLARD 2026 - Save the Date</p>
            <p className="intl-card-text">
              Acompanhe novidades do congresso, envio de trabalhos e cronograma
              de inscricoes na secao de Eventos.
            </p>
            <Link to="/eventos/proximos" className="btn btn-primary btn-sm">
              Ver informacoes do congresso
            </Link>
          </Card>
        </Grid>
      </Section>
    </>
  );
}
