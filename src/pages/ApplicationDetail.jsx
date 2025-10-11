import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { apiGet, apiPost } from "../api/client";

const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";

export default function ApplicationDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [application, setApplication] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [msg, setMsg] = useState("");
  const [selectedMembershipType, setSelectedMembershipType] = useState("normal");
  const [resolutionNote, setResolutionNote] = useState("");

  useEffect(() => {
    loadApplication();
  }, [id]);

  async function loadApplication() {
    try {
      setLoading(true);
      const app = await apiGet(`/admin/applications/${id}`);
      setApplication(app);
      setSelectedMembershipType(app.membership_type || "normal");
      setResolutionNote(app.resolution_note || "");
    } catch (err) {
      setError("Error al cargar la postulación");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function approveApplication() {
    if (!application) return;
    
    try {
      await apiPost(`/admin/applications/${application.id}/approve`, {
        membership_type: selectedMembershipType,
        note: resolutionNote
      });
      setMsg("Postulación aprobada. El usuario quedó en estado de pago pendiente.");
      setTimeout(() => {
        loadApplication(); // Recargar para ver el nuevo estado
      }, 2000);
    } catch (err) {
      setError("Error al aprobar la postulación");
      console.error(err);
    }
  }

  async function confirmPayment() {
    if (!application) return;
    
    try {
      const result = await apiPost(`/admin/applications/${application.id}/confirm-payment`);
      setMsg(`Pago confirmado. Usuario creado con credenciales: ${result.credentials.email} / ${result.credentials.password}`);
      setTimeout(() => {
        navigate("/admin");
      }, 3000);
    } catch (err) {
      setError("Error al confirmar el pago");
      console.error(err);
    }
  }

  async function rejectApplication() {
    if (!application) return;
    
    try {
      await apiPost(`/admin/applications/${application.id}/reject`, {
        note: resolutionNote
      });
      setMsg("Postulación rechazada.");
      setTimeout(() => {
        navigate("/admin");
      }, 2000);
    } catch (err) {
      setError("Error al rechazar la postulación");
      console.error(err);
    }
  }

  if (loading) {
    return (
      <section className="section">
        <div className="container">
          <div style={{ textAlign: 'center', padding: '48px 0' }}>
            <div style={{ fontSize: '1.2em', color: 'var(--color-muted)' }}>Cargando...</div>
          </div>
        </div>
      </section>
    );
  }

  if (error || !application) {
    return (
      <section className="section">
        <div className="container">
          <div style={{ textAlign: 'center', padding: '48px 0' }}>
            <div style={{ color: 'crimson', marginBottom: 16 }}>{error || "Postulación no encontrada"}</div>
            <button className="btn btn-outline" onClick={() => navigate("/admin")}>
              Volver al Panel Admin
            </button>
          </div>
        </div>
      </section>
    );
  }

  const getMembershipTypeLabel = (type) => {
    const types = {
      joven: "Socio Joven ($30/año)",
      normal: "Socio Normal ($100/año)", 
      gratuito: "Socio Gratuito (Gratis)"
    };
    return types[type] || type;
  };

  const getStatusLabel = (status) => {
    const statuses = {
      pending: "Pendiente",
      approved: "Aprobada",
      rejected: "Rechazada",
      payment_pending: "Esperando Pago",
      paid: "Pagada"
    };
    return statuses[status] || status;
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: "var(--color-accent)",
      approved: "var(--color-secondary)",
      rejected: "crimson",
      payment_pending: "orange",
      paid: "green"
    };
    return colors[status] || "var(--color-muted)";
  };

  return (
    <section className="section">
      <div className="container" style={{ maxWidth: 800 }}>
        <div style={{ marginBottom: 32 }}>
          <button 
            className="btn btn-outline" 
            onClick={() => navigate("/admin")}
            style={{ marginBottom: 24 }}
          >
            ← Volver al Panel Admin
          </button>
          
          <div style={{ 
            background: '#f8f9fa', 
            padding: 24, 
            borderRadius: 12, 
            border: '1px solid #e9ecef',
            marginBottom: 24
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h1 style={{ margin: 0 }}>Postulación de {application.name}</h1>
              <div style={{ 
                background: getStatusColor(application.status),
                color: 'white',
                padding: '8px 16px',
                borderRadius: 20,
                fontSize: '0.9em',
                fontWeight: 'bold'
              }}>
                {getStatusLabel(application.status)}
              </div>
            </div>
            <p style={{ color: 'var(--color-muted)', margin: 0 }}>
              Postuló el {new Date(application.created_at).toLocaleDateString('es-ES', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}
            </p>
          </div>
        </div>

        {msg && (
          <div style={{ 
            background: '#d4edda', 
            color: '#155724', 
            padding: 16, 
            borderRadius: 8, 
            marginBottom: 24,
            textAlign: 'center'
          }}>
            {msg}
          </div>
        )}

        {error && (
          <div style={{ 
            background: '#f8d7da', 
            color: '#721c24', 
            padding: 16, 
            borderRadius: 8, 
            marginBottom: 24,
            textAlign: 'center'
          }}>
            {error}
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginBottom: 32 }}>
          <div className="card">
            <h3 style={{ marginBottom: 16, color: 'var(--color-primary)' }}>Información Personal</h3>
            <div style={{ marginBottom: 12 }}>
              <strong>Nombre:</strong> {application.name}
            </div>
            <div style={{ marginBottom: 12 }}>
              <strong>Email:</strong> {application.email}
            </div>
            <div style={{ marginBottom: 12 }}>
              <strong>Teléfono:</strong> {application.phone || 'No especificado'}
            </div>
            <div style={{ marginBottom: 12 }}>
              <strong>Especialización:</strong> {application.specialization || 'No especificada'}
            </div>
            <div>
              <strong>Años de experiencia:</strong> {application.experience_years || 'No especificado'}
            </div>
          </div>

          <div className="card">
            <h3 style={{ marginBottom: 16, color: 'var(--color-primary)' }}>Motivación</h3>
            <div style={{ 
              background: '#f8f9fa', 
              padding: 16, 
              borderRadius: 8, 
              minHeight: 120,
              border: '1px solid #e9ecef'
            }}>
              {application.motivation || 'No especificada'}
            </div>
          </div>
        </div>

        {application.status === 'pending' && (
          <div className="card" style={{ marginBottom: 32 }}>
            <h3 style={{ marginBottom: 16, color: 'var(--color-primary)' }}>Decisión</h3>
            
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', marginBottom: 8, fontWeight: '500' }}>
                Tipo de Membresía a Asignar:
              </label>
              <select 
                value={selectedMembershipType} 
                onChange={e => setSelectedMembershipType(e.target.value)}
                style={{ 
                  width: '100%', 
                  padding: 12, 
                  border: '1px solid #ddd', 
                  borderRadius: 6,
                  fontSize: '1em'
                }}
              >
                <option value="joven">Socio Joven ($30/año) - Recién egresados</option>
                <option value="normal">Socio Normal ($100/año) - Profesionales con experiencia</option>
                <option value="gratuito">Socio Gratuito (Gratis) - Alto estatus invitado</option>
              </select>
            </div>

            <div style={{ marginBottom: 24 }}>
              <label style={{ display: 'block', marginBottom: 8, fontWeight: '500' }}>
                Nota de Resolución:
              </label>
              <textarea 
                value={resolutionNote} 
                onChange={e => setResolutionNote(e.target.value)}
                placeholder="Nota opcional para el postulante..."
                style={{ 
                  width: '100%', 
                  padding: 12, 
                  border: '1px solid #ddd', 
                  borderRadius: 6,
                  minHeight: 80,
                  resize: 'vertical'
                }}
              />
            </div>

            <div style={{ display: 'flex', gap: 16, justifyContent: 'flex-end' }}>
              <button 
                className="btn btn-outline" 
                onClick={rejectApplication}
                style={{ background: 'crimson', color: 'white', border: 'none' }}
              >
                Rechazar
              </button>
              <button 
                className="btn btn-primary" 
                onClick={approveApplication}
              >
                Aprobar
              </button>
            </div>
          </div>
        )}

        {application.status === 'payment_pending' && (
          <div className="card" style={{ marginBottom: 32, border: '2px solid orange' }}>
            <h3 style={{ marginBottom: 16, color: 'orange' }}>Esperando Pago</h3>
            <p style={{ marginBottom: 16, color: 'var(--color-muted)' }}>
              La postulación fue aprobada como <strong>{getMembershipTypeLabel(application.membership_type)}</strong>. 
              Una vez que la secretaria envíe el link de pago y el usuario complete el pago, 
              puedes confirmar aquí para crear las credenciales del usuario.
            </p>
            <div style={{ display: 'flex', gap: 16, justifyContent: 'flex-end' }}>
              <button 
                className="btn btn-primary" 
                onClick={confirmPayment}
                style={{ background: 'green' }}
              >
                Confirmar Pago y Crear Usuario
              </button>
            </div>
          </div>
        )}

        {application.resolution_note && (
          <div className="card">
            <h3 style={{ marginBottom: 16, color: 'var(--color-primary)' }}>Nota de Resolución</h3>
            <div style={{ 
              background: '#f8f9fa', 
              padding: 16, 
              borderRadius: 8,
              border: '1px solid #e9ecef'
            }}>
              {application.resolution_note}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
