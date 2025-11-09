export default function MembersYoung() {
  return (
    <section className="section">
      <div className="container-narrow">
        <h1>Socios Jóvenes</h1>
        <p className="members-subtitle-with-spacing">
          Programa para profesionales en etapa inicial de su carrera en cirugía
          de cadera.
        </p>
        <div className="cards">
          <div className="card">
            <h3>Cuota anual reducida</h3>
            <p>
              Acceso a los mismos beneficios con una cuota preferencial durante
              los primeros años.
            </p>
          </div>
          <div className="card">
            <h3>Cupos especiales</h3>
            <p>Prioridad en becas y plazas limitadas para cursos y talleres.</p>
          </div>
          <div className="card">
            <h3>Participación académica</h3>
            <p>
              Espacios para presentar ponencias y casos clínicos en congresos
              SLACC.
            </p>
          </div>
        </div>

        <div className="members-cta">
          <a href="/por-que-ser-socio" className="btn btn-primary">
            Hazte socio
          </a>
        </div>
      </div>
    </section>
  );
}
