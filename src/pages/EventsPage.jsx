import { useEffect, useState } from "react";
import Modal from "../components/ui/Modal";
import { useAuth } from "../auth/AuthContext";

const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";

import { useNavigate, useLocation } from "react-router-dom";

export default function EventsPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("webinar");
  const location = useLocation();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState(null);
  const [form, setForm] = useState({ name: "", email: "", phone: "" });
  const [message, setMessage] = useState("");

  useEffect(() => {
    // detectar subruta
    if (location.pathname.endsWith('/proximos')) setActiveTab('proximos');
    else if (location.pathname.endsWith('/webinars')) setActiveTab('webinar');
    else if (location.pathname.endsWith('/pasados')) setActiveTab('pasados');
    else if (location.pathname.endsWith('/cursos')) setActiveTab('todos');
    else setActiveTab('webinar');
  }, [location.pathname]);

  useEffect(() => { load(); }, [activeTab]);

  async function load() {
    try {
      setLoading(true);
      let url = `${BASE_URL}/events?type=${activeTab}`;
      if (activeTab === 'pasados') {
        url = `${BASE_URL}/events?past=1`;
      } else if (activeTab === 'proximos') {
        url = `${BASE_URL}/events?type=presencial`;
      } else if (activeTab === 'todos') {
        url = `${BASE_URL}/events`;
      }
      const res = await fetch(url);
      const data = await res.json();
      setEvents(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  function getPriceDisplay(e) {
    if (user && user.role === 'member' && user.is_active && user.payment_status === 'paid') {
      if (user.membership_type === 'joven') return e.price_joven || e.price_member;
      if (user.membership_type === 'gratuito') return e.price_gratuito || 0;
      return e.price_member;
    }
    return e.price_non_member;
  }

  async function enroll(eventId) {
    try {
      const res = await fetch(`${BASE_URL}/events/${eventId}/enroll`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Error al inscribir');
      setMessage('Inscripción registrada. Recibirás instrucciones por correo.');
      setEnrolling(null);
      setForm({ name: '', email: '', phone: '' });
      load();
    } catch (e) {
      alert(e.message);
    }
  }

  return (
    <section className="section">
      <div className="container">
        <h1>Eventos</h1>
        <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
          {[
            { id: 'proximos', label: 'Próximos (Presenciales)', to: '/eventos/proximos' },
            { id: 'webinar', label: 'Webinars', to: '/eventos/webinars' },
            { id: 'pasados', label: 'Pasados', to: '/eventos/pasados' }
          ].map(tab => (
            <button key={tab.id} className={activeTab === tab.id ? 'btn btn-primary' : 'btn btn-outline'} onClick={() => navigate(tab.to)}>
              {tab.label}
            </button>
          ))}
        </div>

        {message && <p style={{ color: 'green' }}>{message}</p>}

        {loading ? (
          <p>Cargando eventos...</p>
        ) : (
          <div className="cards">
            {events.map(e => (
              <div key={e.id} className="card" onClick={() => navigate(`/eventos/${e.id}`)} style={{ cursor: 'pointer' }}>
                {e.image_url && (
                  <img src={e.image_url.startsWith('http') ? e.image_url : (BASE_URL.replace('/api','') + e.image_url)} alt={e.title} style={{ width: '100%', height: 140, objectFit: 'cover', borderRadius: 8, marginBottom: 8 }} />
                )}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <h3>{e.title}</h3>
                  <span style={{ background: e.format === 'webinar' ? 'var(--color-accent)' : 'var(--color-secondary)', color: 'white', padding: '2px 8px', borderRadius: 12, fontSize: '0.8em' }}>{e.format === 'webinar' ? 'Webinar' : 'Presencial'}</span>
                </div>
                <p>{e.description}</p>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginTop: 8 }}>
                  <div>
                    <div style={{ fontSize: '0.9em', color: 'var(--color-muted)' }}>Fecha</div>
                    <div><strong>{e.start_date ? new Date(e.start_date).toLocaleDateString('es-ES') : 'Por confirmar'}</strong></div>
                  </div>
                  <div>
                    <div style={{ fontSize: '0.9em', color: 'var(--color-muted)' }}>Precio</div>
                    <div><strong>${getPriceDisplay(e)}</strong></div>
                  </div>
                  <div>
                    <div style={{ fontSize: '0.9em', color: 'var(--color-muted)' }}>Cupos</div>
                    <div><strong>{e.max_students || 'Sin límite'}</strong></div>
                  </div>
                  <div>
                    <div style={{ fontSize: '0.9em', color: 'var(--color-muted)' }}>Disponibles</div>
                    <div><strong>{e.seats_left ?? '—'}</strong></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <Modal isOpen={!!enrolling} onClose={() => setEnrolling(null)} title={enrolling ? `Inscripción: ${enrolling.title}` : ''}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <input placeholder="Nombre" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
          <input placeholder="Email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
          <input placeholder="Teléfono" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} />
          <button className="btn btn-primary" onClick={() => enroll(enrolling.id)}>Confirmar inscripción</button>
        </div>
      </Modal>
    </section>
  );
}


