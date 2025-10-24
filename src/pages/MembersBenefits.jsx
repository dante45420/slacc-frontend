import { Link } from "react-router-dom";

export default function MembersBenefits() {
  return (
    <section className="section">
      <div className="container">
        <h1 style={{ marginBottom: 12 }}>Beneficios para Miembros</h1>
        <p style={{ color: 'var(--color-muted)', marginTop: 0 }}>Ventajas pensadas para especialistas en cadera, con foco clínico y académico.</p>

        <div className="cards" style={{ marginTop: 16 }}>
          <Tile icon={<IconStethoscope />} title="Práctica clínica destacada" desc="Difunde tu experiencia y casos con respaldo institucional." />
          <Tile icon={<IconDatabase />} title="Información centralizada" desc="Casos, documentos y recursos organizados en un solo lugar." />
          <Tile icon={<IconHandshake />} title="Confianza y red" desc="Conecta con especialistas y potencia tu credibilidad." />
          <Tile icon={<IconTrophy />} title="Reconocimiento académico" desc="Comités, publicaciones y ponencias en eventos SLACC." />
          <Tile icon={<IconFunnel />} title="Formación continua" desc="Cursos, talleres y webinars con curaduría experta." />
          <Tile icon={<IconShield />} title="Independencia digital" desc="Tu presencia profesional sin depender de redes sociales." />
        </div>

        <div style={{ textAlign: 'center', marginTop: 24 }}>
          <Link to="/solicitar-membresia" className="btn btn-primary">Solicitar membresía</Link>
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

// Iconos simples en SVG (paleta del sitio)
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
function IconDatabase(){
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <ellipse cx="12" cy="5" rx="7" ry="3"/>
      <path d="M5 5v6c0 1.7 3.1 3 7 3s7-1.3 7-3V5"/>
      <path d="M5 11v6c0 1.7 3.1 3 7 3s7-1.3 7-3v-6"/>
    </svg>
  );
}
function IconHandshake(){
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 12l3-3 3 3"/>
      <path d="M2 12l4-4 6 6 4-4 6 6"/>
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
function IconFunnel(){
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 4h18l-7 8v6l-4 2v-8z"/>
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


