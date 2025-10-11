import { Link } from "react-router-dom";

export default function NewsList() {
  const demo = [
    { id: 1, title: "Primer anuncio", excerpt: "Resumen corto" },
    { id: 2, title: "Lanzamiento", excerpt: "Detalles del lanzamiento" }
  ];
  return (
    <section className="section">
      <div className="container">
        <h2>Noticias</h2>
        <div className="cards">
          {demo.map(n => (
            <article key={n.id} className="card">
              <h3>{n.title}</h3>
              <p>{n.excerpt}</p>
              <Link to={`/noticias/${n.id}`}>Leer más</Link>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}


