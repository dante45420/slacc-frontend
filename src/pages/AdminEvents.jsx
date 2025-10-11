import { useEffect, useState } from "react";
import Modal from "../components/ui/Modal";

const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";

export default function AdminEvents() {
  const [events, setEvents] = useState([]);
  const [enrollmentsModal, setEnrollmentsModal] = useState({ open: false, data: null });
  const [form, setForm] = useState({
    title: '', description: '', instructor: '', duration_hours: '',
    format: 'webinar', max_students: '', price_member: '', price_non_member: '',
    price_joven: '', price_gratuito: '', start_date: '', end_date: '', registration_deadline: '',
    is_active: true, image_url: ''
  });

  useEffect(() => { load(); }, []);

  async function load() {
    const token = localStorage.getItem('access_token');
    const res = await fetch(`${BASE_URL}/admin/events`, { headers: { Authorization: `Bearer ${token}` } });
    const data = await res.json();
    setEvents(data);
  }

  async function createEvent() {
    const token = localStorage.getItem('access_token');
    const res = await fetch(`${BASE_URL}/admin/events`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify(form)
    });
    if (res.ok) {
      setForm({ title: '', description: '', instructor: '', duration_hours: '', format: 'webinar', max_students: '', price_member: '', price_non_member: '', price_joven: '', price_gratuito: '', start_date: '', end_date: '', registration_deadline: '', is_active: true, image_url: '' });
      load();
    } else {
      const data = await res.json();
      alert(data.error || 'No se pudo crear');
    }
  }

  async function removeEvent(id) {
    const token = localStorage.getItem('access_token');
    const res = await fetch(`${BASE_URL}/admin/events/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` }
    });
    if (!res.ok) {
      const data = await res.json();
      alert(data.error || 'No se pudo eliminar');
    }
    load();
  }

  async function viewEnrollments(id) {
    const token = localStorage.getItem('access_token');
    const res = await fetch(`${BASE_URL}/admin/events/${id}/enrollments`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    const data = await res.json();
    setEnrollmentsModal({ open: true, data });
  }

  return (
    <div>
      <h2>Eventos (Cursos en vivo)</h2>
      <div className="card" style={{ padding: 16, marginBottom: 24 }}>
        <h3>Crear evento</h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <input placeholder="Título" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} />
          <select value={form.format} onChange={e => setForm({ ...form, format: e.target.value })}>
            <option value="webinar">Webinar</option>
            <option value="presencial">Presencial</option>
          </select>
          <input placeholder="Instructor" value={form.instructor} onChange={e => setForm({ ...form, instructor: e.target.value })} />
          <input placeholder="Capacidad" type="number" value={form.max_students} onChange={e => setForm({ ...form, max_students: Number(e.target.value) })} />
          <input placeholder="Precio socio" type="number" value={form.price_member} onChange={e => setForm({ ...form, price_member: Number(e.target.value) })} />
          <input placeholder="Precio no socio" type="number" value={form.price_non_member} onChange={e => setForm({ ...form, price_non_member: Number(e.target.value) })} />
          <input placeholder="Precio joven" type="number" value={form.price_joven} onChange={e => setForm({ ...form, price_joven: Number(e.target.value) })} />
          <input placeholder="Precio gratuito" type="number" value={form.price_gratuito} onChange={e => setForm({ ...form, price_gratuito: Number(e.target.value) })} />
          <input placeholder="Fecha inicio" type="date" value={form.start_date} onChange={e => setForm({ ...form, start_date: e.target.value })} />
          <input placeholder="Fecha fin" type="date" value={form.end_date} onChange={e => setForm({ ...form, end_date: e.target.value })} />
          <input placeholder="Límite inscripción" type="date" value={form.registration_deadline} onChange={e => setForm({ ...form, registration_deadline: e.target.value })} />
        </div>
        <button className="btn btn-primary" style={{ marginTop: 12 }} onClick={createEvent}>Crear</button>
      </div>

      <div className="cards">
        {events.map(e => (
          <div key={e.id} className="card">
            <h4>{e.title}</h4>
            {e.image_url && (
              <img src={e.image_url.startsWith('http') ? e.image_url : (import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api').replace('/api','') + e.image_url} alt={e.title} style={{ width: '100%', height: 120, objectFit: 'cover', borderRadius: 8, marginBottom: 8 }} />
            )}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              <input value={e.title || ''} onChange={ev => setEvents(events.map(x => x.id === e.id ? { ...x, title: ev.target.value } : x))} placeholder="Título" />
              <select value={e.format || 'webinar'} onChange={ev => setEvents(events.map(x => x.id === e.id ? { ...x, format: ev.target.value } : x))}>
                <option value="webinar">Webinar</option>
                <option value="presencial">Presencial</option>
              </select>
              <input value={e.instructor || ''} onChange={ev => setEvents(events.map(x => x.id === e.id ? { ...x, instructor: ev.target.value } : x))} placeholder="Instructor" />
              <input type="number" value={e.max_students || ''} onChange={ev => setEvents(events.map(x => x.id === e.id ? { ...x, max_students: Number(ev.target.value) } : x))} placeholder="Capacidad" />
              <input type="number" value={e.price_member || 0} onChange={ev => setEvents(events.map(x => x.id === e.id ? { ...x, price_member: Number(ev.target.value) } : x))} placeholder="Precio socio" />
              <input type="number" value={e.price_non_member || 0} onChange={ev => setEvents(events.map(x => x.id === e.id ? { ...x, price_non_member: Number(ev.target.value) } : x))} placeholder="Precio no socio" />
              <input type="number" value={e.price_joven || 0} onChange={ev => setEvents(events.map(x => x.id === e.id ? { ...x, price_joven: Number(ev.target.value) } : x))} placeholder="Precio joven" />
              <input type="number" value={e.price_gratuito || 0} onChange={ev => setEvents(events.map(x => x.id === e.id ? { ...x, price_gratuito: Number(ev.target.value) } : x))} placeholder="Precio gratuito" />
              <input type="date" value={e.start_date ? e.start_date.substring(0,10) : ''} onChange={ev => setEvents(events.map(x => x.id === e.id ? { ...x, start_date: ev.target.value } : x))} placeholder="Fecha inicio" />
              <input type="date" value={e.end_date ? e.end_date.substring(0,10) : ''} onChange={ev => setEvents(events.map(x => x.id === e.id ? { ...x, end_date: ev.target.value } : x))} placeholder="Fecha fin" />
              <input type="date" value={e.registration_deadline ? e.registration_deadline.substring(0,10) : ''} onChange={ev => setEvents(events.map(x => x.id === e.id ? { ...x, registration_deadline: ev.target.value } : x))} placeholder="Fecha límite" />
            </div>
            <div style={{ display: 'flex', gap: 8, marginTop: 8, flexWrap: 'wrap' }}>
              <button className="btn btn-primary" onClick={async () => {
                const token = localStorage.getItem('access_token');
                const res = await fetch(`${(import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api')}/admin/events/${e.id}`, {
                  method: 'PUT',
                  headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                  body: JSON.stringify(e)
                });
                const data = await res.json();
                if (!res.ok) return alert(data.error || 'No se pudo guardar');
                load();
              }}>Guardar</button>
              <button className="btn btn-outline" onClick={() => viewEnrollments(e.id)}>Ver inscritos</button>
              <button className="btn btn-outline" onClick={() => removeEvent(e.id)}>Eliminar</button>
              <label className="btn btn-outline" style={{ cursor: 'pointer' }}>
                Subir imagen
                <input type="file" accept="image/*" style={{ display: 'none' }} onChange={async (ev) => {
                  const file = ev.target.files?.[0];
                  if (!file) return;
                  const token = localStorage.getItem('access_token');
                  const fd = new FormData();
                  fd.append('image', file);
                  const res = await fetch(`${(import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api')}/admin/events/${e.id}/image`, {
                    method: 'POST',
                    headers: { Authorization: `Bearer ${token}` },
                    body: fd
                  });
                  const data = await res.json();
                  if (!res.ok) return alert(data.error || 'Error al subir');
                  load();
                }} />
              </label>
            </div>
          </div>
        ))}
      </div>
      <EnrollmentsModal modal={enrollmentsModal} onClose={() => setEnrollmentsModal({ open: false, data: null })} />
    </div>
  );
}

function EnrollmentsModal({ modal, onClose }) {
  const open = !!modal?.open;
  const data = modal?.data;
  if (!open || !data) return null;

  const event = data.event || {};
  const enrollments = Array.isArray(data.enrollments) ? data.enrollments : [];
  const validEnrollments = enrollments.filter(e => e.payment_status !== 'cancelled');
  const capacity = event.max_students || null;
  const seatsLeft = capacity ? Math.max(0, capacity - validEnrollments.length) : null;

  return (
    <Modal isOpen={open} onClose={onClose} title={`Inscritos: ${event.title || ''}`} size="large">
      <div style={{ marginBottom: 12, color: 'var(--color-muted)' }}>
        <span><strong>Capacidad:</strong> {capacity ?? 'Sin límite'}</span>
        <span style={{ marginLeft: 16 }}><strong>Inscritos:</strong> {validEnrollments.length}</span>
        <span style={{ marginLeft: 16 }}><strong>Disponibles:</strong> {seatsLeft ?? '—'}</span>
      </div>
      {validEnrollments.length === 0 ? (
        <p style={{ color: 'var(--color-muted)' }}>No hay inscritos aún.</p>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <th style={{ textAlign: 'left', borderBottom: '1px solid #eee', padding: '8px' }}>Nombre</th>
                <th style={{ textAlign: 'left', borderBottom: '1px solid #eee', padding: '8px' }}>Email</th>
                <th style={{ textAlign: 'left', borderBottom: '1px solid #eee', padding: '8px' }}>Teléfono</th>
                <th style={{ textAlign: 'left', borderBottom: '1px solid #eee', padding: '8px' }}>Estado pago</th>
                <th style={{ textAlign: 'right', borderBottom: '1px solid #eee', padding: '8px' }}>Monto</th>
              </tr>
            </thead>
            <tbody>
              {validEnrollments.map(e => (
                <tr key={e.id}>
                  <td style={{ padding: '8px', borderBottom: '1px solid #f1f1f1' }}>{e.student_name}</td>
                  <td style={{ padding: '8px', borderBottom: '1px solid #f1f1f1' }}>{e.student_email}</td>
                  <td style={{ padding: '8px', borderBottom: '1px solid #f1f1f1' }}>{e.student_phone || '-'}</td>
                  <td style={{ padding: '8px', borderBottom: '1px solid #f1f1f1' }}>{e.payment_status}</td>
                  <td style={{ padding: '8px', borderBottom: '1px solid #f1f1f1', textAlign: 'right' }}>${e.payment_amount}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 12 }}>
        <button className="btn btn-outline" onClick={onClose}>Cerrar</button>
      </div>
    </Modal>
  );
}


