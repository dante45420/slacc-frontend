import { Link } from "react-router-dom";

export default function CoursesList() {
  const demo = [
    { id: 1, title: "Curso Introductorio", description: "Bases de cirugía de cadera" },
    { id: 2, title: "Workshop Avanzado", description: "Casos complejos" }
  ];
  return (
    <section className="section">
      <div className="container">
        <h2>Cursos</h2>
        <div className="cards">
          {demo.map(c => (
            <article key={c.id} className="card">
              <h3>{c.title}</h3>
              <p>{c.description}</p>
              <Link to={`/cursos/${c.id}`}>Ver detalle</Link>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}


