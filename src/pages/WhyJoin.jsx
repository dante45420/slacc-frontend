import { Link } from "react-router-dom";

export default function WhyJoin() {
  return (
    <section className="section">
      <div className="container">
        <h1 style={{ marginTop: 0, marginBottom: 12 }}>¿Por qué ser socio de SLACC?</h1>
        <p style={{ color: 'var(--color-muted)', marginTop: 0, marginBottom: 24 }}>Una red de excelencia clínica en cirugía de cadera en Latinoamérica.</p>

        {/* Tiles de beneficios (mismo look & feel que la sección de Beneficios) */}
        <div className="cards" style={{ marginBottom: 32 }}>
          <Tile icon={<IconStethoscope />} title="Formación acreditada" desc="Cursos y webinars con docentes expertos y contenido curado." />
          <Tile icon={<IconNetwork />} title="Red profesional" desc="Colabora con especialistas de la región y accede a comités." />
          <Tile icon={<IconShield />} title="Respaldo institucional" desc="Incrementa la confianza de tus pacientes y colegas." />
          <Tile icon={<IconTrophy />} title="Impacto profesional" desc="Presenta casos, publica y participa en líneas de investigación." />
          <Tile icon={<IconDirectory />} title="Visibilidad" desc="Perfil en el directorio y difusión de actividades académicas." />
          <Tile icon={<IconFunnel />} title="Desarrollo continuo" desc="Ruta de aprendizaje con actividades y talleres escalonados." />
        </div>

        <h2 style={{ marginTop: 24 }}>Categorías de membresía</h2>
        <div className="cards">
          <div className="card">
            <h3 style={{ marginTop: 0 }}>Socio Joven</h3>
            <p style={{ color: 'var(--color-muted)' }}>Recién egresado (hasta 5 años). Cuota anual reducida y cupos especiales en cursos.</p>
          </div>
          <div className="card">
            <h3 style={{ marginTop: 0 }}>Socio Normal</h3>
            <p style={{ color: 'var(--color-muted)' }}>Profesional con experiencia. Acceso completo a beneficios y participación académica.</p>
          </div>
        </div>

        <div style={{ textAlign: 'center', marginTop: 24 }}>
          <Link to="/solicitar-membresia" className="btn btn-primary" style={{ marginRight: 12 }}>
            Solicitar membresía
          </Link>
          <Link to="/miembros/beneficios" className="btn btn-outline">
            Ver todos los beneficios
          </Link>
        </div>
      </div>
    </section>
  );
}

function Tile({ icon, title, desc }){
  return (
    <div className="card" style={{ borderColor: 'var(--color-border)', background: 'var(--color-bg)' }}>
      <div style={{ width: 48, height: 48, borderRadius: 10, background: 'var(--color-bg-alt)', display: 'grid', placeItems: 'center', marginBottom: 10 }}>
        <div style={{ width: 28, height: 28, color: 'var(--color-primary)' }}>{icon}</div>
      </div>
      <h3 style={{ marginTop: 0 }}>{title}</h3>
      <p style={{ color: 'var(--color-muted)' }}>{desc}</p>
    </div>
  );
}

// Iconos SVG médicos/profesionales
function IconStethoscope(){
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 3v5a4 4 0 0 0 8 0V3"/>
      <path d="M12 14a6 6 0 0 1-6 6h-1"/>
      <circle cx="19" cy="10" r="2"/>
      <path d="M19 12v2a7 7 0 0 1-7 7"/>
    </svg>
  );
}
function IconNetwork(){
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="6" cy="6" r="2"/>
      <circle cx="18" cy="6" r="2"/>
      <circle cx="12" cy="18" r="2"/>
      <path d="M8 7l3 9"/>
      <path d="M16 7l-3 9"/>
      <path d="M8 6h8"/>
    </svg>
  );
}
function IconShield(){
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 3l7 4v6c0 5-3.5 7.5-7 8-3.5-.5-7-3-7-8V7l7-4z"/>
    </svg>
  );
}
function IconTrophy(){
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M8 21h8"/>
      <path d="M12 17a5 5 0 0 0 5-5V4H7v8a5 5 0 0 0 5 5z"/>
      <path d="M18 5h3a3 3 0 0 1-3 3"/>
      <path d="M6 5H3a3 3 0 0 0 3 3"/>
    </svg>
  );
}
function IconDirectory(){
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="14" rx="2"/>
      <path d="M7 7h7"/>
      <path d="M7 11h10"/>
      <path d="M7 15h6"/>
    </svg>
  );
}
function IconFunnel(){
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 4h18l-7 8v6l-4 2v-8z"/>
    </svg>
  );
}
