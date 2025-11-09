export default function MembersAllied() {
  const allies = [
    { name: "Sociedad Argentina de Ortopedia", url: "#", country: "Argentina" },
    { name: "Sociedad Brasileña de Ortopedia", url: "#", country: "Brasil" },
    { name: "Sociedad Mexicana de Traumatología", url: "#", country: "México" },
  ];
  return (
    <section className="section">
      <div className="container-narrow">
        <h1>Sociedades Afines</h1>
        <p className="members-subtitle">
          Organizaciones con las que SLACC mantiene colaboración y actividades
          conjuntas.
        </p>
        <div className="cards members-cards">
          {allies.map(a => (
            <a key={a.name} href={a.url} className="card">
              <h3 className="tile-title-with-spacing">{a.name}</h3>
              <div className="tile-desc">{a.country}</div>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
