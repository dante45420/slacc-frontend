import { useState } from "react";
import { Link } from "react-router-dom";

export default function JoinMembership() {
  const [appSent, setAppSent] = useState(false);
  const [appMsg, setAppMsg] = useState("");

  return (
    <section className="section">
      <div className="container">
        <div style={{ textAlign: 'center', marginBottom: 48 }}>
          <h1>Únete a SLACC</h1>
          <p style={{ fontSize: '1.2em', color: 'var(--color-muted)', maxWidth: 600, margin: '0 auto' }}>
            Conecta con especialistas en cadera de toda Latinoamérica y accede a beneficios exclusivos
          </p>
        </div>

        {/* Beneficios y Categorías */}
        <div style={{ marginBottom: 48 }}>
          <h2 style={{ textAlign: 'center', marginBottom: 32 }}>Beneficios de ser Socio</h2>
          
          <div className="cards" style={{ marginBottom: 32 }}>
            <div className="card">
              <h3>📚 Educación Continua</h3>
              <p>Acceso a cursos, webinars y materiales educativos exclusivos</p>
            </div>
            <div className="card">
              <h3>🌐 Red Profesional</h3>
              <p>Conecta con especialistas de toda Latinoamérica</p>
            </div>
            <div className="card">
              <h3>📰 Contenido Exclusivo</h3>
              <p>Noticias, casos clínicos y actualizaciones del sector</p>
            </div>
            <div className="card">
              <h3>🎯 Eventos Especializados</h3>
              <p>Congresos, talleres y encuentros profesionales</p>
            </div>
          </div>

          <h3 style={{ textAlign: 'center', marginBottom: 24 }}>Categorías de Membresía</h3>
          <div className="cards">
            <div className="card" style={{ border: '2px solid var(--color-primary)' }}>
              <div style={{ textAlign: 'center', marginBottom: 16 }}>
                <h3 style={{ color: 'var(--color-primary)' }}>Socio Joven</h3>
                <div style={{ fontSize: '2em', fontWeight: 'bold', color: 'var(--color-primary)' }}>$30</div>
                <div style={{ color: 'var(--color-muted)' }}>por año</div>
              </div>
              <p style={{ textAlign: 'center', color: 'var(--color-muted)', fontSize: '0.9em', marginBottom: 16 }}>
                Recién egresados de la especialidad
              </p>
            </div>
            
            <div className="card" style={{ border: '2px solid var(--color-secondary)', position: 'relative' }}>
              <div style={{ 
                position: 'absolute', 
                top: -10, 
                right: 20, 
                background: 'var(--color-secondary)', 
                color: 'white', 
                padding: '4px 12px', 
                borderRadius: '12px',
                fontSize: '0.8em',
                fontWeight: 'bold'
              }}>
                MÁS COMÚN
              </div>
              <div style={{ textAlign: 'center', marginBottom: 16 }}>
                <h3 style={{ color: 'var(--color-secondary)' }}>Socio Normal</h3>
                <div style={{ fontSize: '2em', fontWeight: 'bold', color: 'var(--color-secondary)' }}>$100</div>
                <div style={{ color: 'var(--color-muted)' }}>por año</div>
              </div>
              <p style={{ textAlign: 'center', color: 'var(--color-muted)', fontSize: '0.9em', marginBottom: 16 }}>
                Profesionales con experiencia
              </p>
            </div>
            
            <div className="card" style={{ border: '2px solid var(--color-accent)' }}>
              <div style={{ textAlign: 'center', marginBottom: 16 }}>
                <h3 style={{ color: 'var(--color-accent)' }}>Socio Gratuito</h3>
                <div style={{ fontSize: '2em', fontWeight: 'bold', color: 'var(--color-accent)' }}>Gratis</div>
                <div style={{ color: 'var(--color-muted)' }}>por invitación</div>
              </div>
              <p style={{ textAlign: 'center', color: 'var(--color-muted)', fontSize: '0.9em', marginBottom: 16 }}>
                Profesionales de alto estatus invitados
              </p>
            </div>
          </div>
          
          <div style={{ 
            background: 'var(--color-primary)', 
            color: 'white', 
            padding: 24, 
            borderRadius: 12, 
            textAlign: 'center',
            marginTop: 24
          }}>
            <h4 style={{ marginBottom: 16 }}>Beneficios para TODOS los socios</h4>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
              <div>✅ Acceso a noticias y contenido</div>
              <div>✅ Participación en eventos</div>
              <div>✅ Descuentos en cursos</div>
              <div>✅ Directorio de miembros</div>
              <div>✅ Red profesional</div>
              <div>✅ Materiales educativos</div>
            </div>
          </div>
        </div>

        {/* Requisitos */}
        <div style={{ marginBottom: 48 }}>
          <h3 style={{ textAlign: 'center', marginBottom: 24 }}>Requisitos para ser Socio</h3>
          <div className="cards">
            <div className="card">
              <h4>🎓 Formación Profesional</h4>
              <p>Título universitario en medicina o especialización en ortopedia/traumatología</p>
            </div>
            <div className="card">
              <h4>👨‍⚕️ Experiencia Clínica</h4>
              <p>Mínimo 2 años de experiencia en cirugía de cadera</p>
            </div>
            <div className="card">
              <h4>📄 Documentación</h4>
              <p>CV actualizado y certificados de especialización</p>
            </div>
            <div className="card">
              <h4>🤝 Compromiso</h4>
              <p>Participación activa en la comunidad y eventos de la asociación</p>
            </div>
          </div>
        </div>

        {/* Formulario de Solicitud */}
        <div style={{ maxWidth: 600, margin: '0 auto' }}>
          <h3 style={{ textAlign: 'center', marginBottom: 24 }}>Solicitar Membresía</h3>
          <ApplicationForm onResult={(ok, msg) => { setAppSent(ok); setAppMsg(msg); }} />
          {appMsg ? (
            <div style={{ 
              marginTop: 16, 
              padding: 16, 
              borderRadius: 8, 
              background: appSent ? '#d4edda' : '#f8d7da',
              color: appSent ? '#155724' : '#721c24',
              textAlign: 'center'
            }}>
              {appMsg}
            </div>
          ) : null}
        </div>

        <div style={{ textAlign: 'center', marginTop: 32 }}>
          <p>¿Ya eres socio? <Link to="/login" className="btn btn-outline">Iniciar Sesión</Link></p>
        </div>
      </div>
    </section>
  );
}

function ApplicationForm({ onResult }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [specialization, setSpecialization] = useState("");
  const [experience, setExperience] = useState("");
  const [motivation, setMotivation] = useState("");
  const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";
  
  async function send(e){
    e.preventDefault();
    try{
      const res = await fetch(`${BASE_URL}/applications`, { 
        method: 'POST', 
        headers: { 'Content-Type': 'application/json' }, 
        body: JSON.stringify({ 
          name, 
          email, 
          phone, 
          motivation,
          specialization,
          experience
        }) 
      });
      if(!res.ok){ onResult(false, 'Error al enviar solicitud'); return; }
      onResult(true, 'Solicitud enviada exitosamente. Será revisada por nuestro comité y te contactaremos pronto.');
      // Limpiar formulario
      setName(''); 
      setEmail(''); 
      setPhone(''); 
      setSpecialization(''); 
      setExperience(''); 
      setMotivation('');
    }catch{
      onResult(false, 'Error de red. Por favor intenta nuevamente.');
    }
  }
  
  return (
    <form onSubmit={send} style={{ background: '#f8f9fa', padding: 24, borderRadius: 12 }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
        <div>
          <label>Nombre Completo *</label>
          <input 
            value={name} 
            onChange={e=>setName(e.target.value)} 
            required 
            style={{ width:'100%', padding:12, border: '1px solid #ddd', borderRadius: 6 }} 
          />
        </div>
        <div>
          <label>Email *</label>
          <input 
            type="email" 
            value={email} 
            onChange={e=>setEmail(e.target.value)} 
            required 
            style={{ width:'100%', padding:12, border: '1px solid #ddd', borderRadius: 6 }} 
          />
        </div>
      </div>
      
      <div style={{ marginBottom: 16 }}>
        <label>Teléfono</label>
        <input 
          value={phone} 
          onChange={e=>setPhone(e.target.value)} 
          style={{ width:'100%', padding:12, border: '1px solid #ddd', borderRadius: 6 }} 
        />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
        <div>
          <label>Especialización *</label>
          <input 
            value={specialization} 
            onChange={e=>setSpecialization(e.target.value)} 
            placeholder="Ej: Ortopedia y Traumatología"
            required 
            style={{ width:'100%', padding:12, border: '1px solid #ddd', borderRadius: 6 }} 
          />
        </div>
        <div>
          <label>Años de Experiencia *</label>
          <input 
            type="number"
            value={experience} 
            onChange={e=>setExperience(e.target.value)} 
            placeholder="Ej: 5"
            required 
            style={{ width:'100%', padding:12, border: '1px solid #ddd', borderRadius: 6 }} 
          />
        </div>
      </div>
      
      <div style={{ marginBottom: 16 }}>
        <label>Motivación para unirse a SLACC *</label>
        <textarea 
          value={motivation} 
          onChange={e=>setMotivation(e.target.value)} 
          placeholder="Cuéntanos por qué quieres formar parte de nuestra asociación..."
          required 
          style={{ width:'100%', padding:12, border: '1px solid #ddd', borderRadius: 6, minHeight:120 }} 
        />
      </div>
      
      <button className="btn btn-primary" type="submit" style={{ width: '100%', padding: 12 }}>
        Enviar Solicitud de Membresía
      </button>
    </form>
  );
}
