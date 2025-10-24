export default function Contact() {
  return (
    <section className="section">
      <div className="container" style={{ maxWidth: 880 }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: 16 }}>
          <div className="card" style={{ padding: 24 }}>
            <h1 style={{ marginTop: 0, marginBottom: 8 }}>Contacto</h1>
            <p style={{ color: 'var(--color-muted)' }}>Correo oficial de la Secretaría SLACC:</p>
            <a href="mailto:Slacc@cadera.cl" className="btn btn-primary" style={{ width: 'fit-content' }}>
              Slacc@cadera.cl
            </a>
          </div>

          <div className="card" style={{ padding: 24 }}>
            <h3 style={{ marginTop: 0 }}>Información</h3>
            <ul style={{ margin: 0, paddingLeft: 18, color: 'var(--color-muted)' }}>
              <li>Horario de atención: Lun-Vie 9:00–18:00 (GMT-3)</li>
              <li>Respuestas habituales dentro de 48 horas</li>
              <li>Idioma: Español / Portugués</li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}


