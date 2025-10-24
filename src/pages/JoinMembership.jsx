import { useState } from "react";

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

        {/* Solo formulario elegante */}

        {/* Requisitos removidos para enfocarse en formulario */}

        {/* Formulario de Solicitud */}
        <div style={{ maxWidth: 640, margin: '0 auto' }}>
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
  const [documentFile, setDocumentFile] = useState(null);
  
  async function send(e){
    e.preventDefault();
    try{
      const formData = new FormData();
      formData.append('name', name);
      formData.append('email', email);
      formData.append('phone', phone);
      formData.append('motivation', motivation);
      formData.append('specialization', specialization);
      formData.append('experience', experience);
      if (documentFile) formData.append('document', documentFile);

      const res = await fetch(`${BASE_URL}/applications`, { method: 'POST', body: formData });
      if(!res.ok){ onResult(false, 'Error al enviar solicitud'); return; }
      onResult(true, 'Solicitud enviada exitosamente. Será revisada por nuestro comité y te contactaremos pronto.');
      // Limpiar formulario
      setName(''); 
      setEmail(''); 
      setPhone(''); 
      setSpecialization(''); 
      setExperience(''); 
      setMotivation('');
      setDocumentFile(null);
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
      <div style={{ marginBottom: 16 }}>
        <label>Documento (PDF) *</label>
        <input 
          type="file" 
          accept="application/pdf"
          onChange={e=> setDocumentFile(e.target.files?.[0] || null)}
          required
        />
      </div>
      
      <button className="btn btn-primary" type="submit" style={{ width: '100%', padding: 12 }}>
        Enviar Solicitud de Membresía
      </button>
    </form>
  );
}
