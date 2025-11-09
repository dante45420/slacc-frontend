import { Link } from "react-router-dom";
import { Section, Button, EmptyState } from "../../components/ui";

export default function NewsList() {
  const demo = [
    { id: 1, title: "Primer anuncio", excerpt: "Resumen corto" },
    { id: 2, title: "Lanzamiento", excerpt: "Detalles del lanzamiento" },
  ];

  return (
    <Section variant="default" padding="lg">
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "var(--spacing-5)",
          flexWrap: "wrap",
          gap: "var(--spacing-3)",
        }}
      >
        <h1 style={{ margin: 0 }}>Noticias</h1>
        <Link to="/admin/news/new">
          <Button variant="primary">Nueva Noticia</Button>
        </Link>
      </div>

      {demo.length === 0 ? (
        <EmptyState
          icon="📰"
          title="No hay noticias aún"
          description="Comienza creando tu primera noticia para compartir con la comunidad"
          action={
            <Link to="/admin/news/new">
              <Button variant="primary">Crear Primera Noticia</Button>
            </Link>
          }
        />
      ) : (
        <div className="cards">
          {demo.map(n => (
            <article key={n.id} className="card">
              <h3>{n.title}</h3>
              <p style={{ color: "var(--color-muted)" }}>{n.excerpt}</p>
              <Link to={`/noticias/${n.id}`}>
                <Button variant="outline" size="sm">
                  Leer más <i className="fa-solid fa-arrow-right"></i>
                </Button>
              </Link>
            </article>
          ))}
        </div>
      )}
    </Section>
  );
}
