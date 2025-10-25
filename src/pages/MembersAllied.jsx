export default function MembersAllied() {
  const allies = [
    { name: "Sociedad Argentina de Ortopedia", url: "#", country: "Argentina" },
    { name: "Sociedad Brasileña de Ortopedia", url: "#", country: "Brasil" },
    { name: "Sociedad Mexicana de Traumatología", url: "#", country: "México" },
  ];
  return (
    <section className="section">
      <div className="container" style={{ maxWidth: 840 }}>
        <h1>Sociedades Afines</h1>
        <p style={{ color: "var(--color-muted)" }}>
          Organizaciones con las que SLACC mantiene colaboración y actividades
          conjuntas.
        </p>
        <div className="cards" style={{ marginTop: 16 }}>
          {allies.map(a => (
            <a
              key={a.name}
              href={a.url}
              className="card"
              style={{ textDecoration: "none" }}
            >
              <h3 style={{ marginBottom: 4 }}>{a.name}</h3>
              <div style={{ color: "var(--color-muted)" }}>{a.country}</div>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
