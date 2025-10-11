import { useState } from "react";
import { useNavigate } from "react-router-dom";

const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";

export default function AdminUserNew() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    email: '',
    name: '',
    password: '',
    membership_type: 'normal',
    payment_status: 'due'
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  async function submit() {
    try {
      setSaving(true);
      const token = localStorage.getItem("access_token");
      const res = await fetch(`${BASE_URL}/admin/users/member`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(form)
      });
      if (!res.ok) throw new Error('No se pudo crear');
      const data = await res.json();
      alert(`Usuario creado. Password: ${data.initial_password}`);
      navigate(`/admin/users/${data.id}`);
    } catch (e) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="section">
      <div className="container">
        <h2>Nuevo Usuario (Miembro)</h2>
        {error && <p style={{ color: 'crimson' }}>{error}</p>}
        <div className="card" style={{ padding: 16, maxWidth: 600 }}>
          <label>Email</label>
          <input value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />

          <label style={{ marginTop: 12 }}>Nombre</label>
          <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />

          <label style={{ marginTop: 12 }}>Contraseña (opcional)</label>
          <input value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} />

          <label style={{ marginTop: 12 }}>Tipo de membresía</label>
          <select value={form.membership_type} onChange={e => setForm({ ...form, membership_type: e.target.value })}>
            <option value="joven">Joven</option>
            <option value="normal">Normal</option>
            <option value="gratuito">Gratuito</option>
          </select>

          <label style={{ marginTop: 12 }}>Estado de pago</label>
          <select value={form.payment_status} onChange={e => setForm({ ...form, payment_status: e.target.value })}>
            <option value="paid">Pagado</option>
            <option value="due">Pendiente</option>
          </select>
        </div>

        <div style={{ display: 'flex', gap: 12, marginTop: 16 }}>
          <button className="btn btn-outline" onClick={() => navigate(-1)} disabled={saving}>Cancelar</button>
          <button className="btn btn-primary" onClick={submit} disabled={saving}>Crear</button>
        </div>
      </div>
    </section>
  );
}


