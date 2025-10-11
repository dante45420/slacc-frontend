import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";

export default function AdminUserEdit() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function load() {
      try {
        const token = localStorage.getItem("access_token");
        const res = await fetch(`${BASE_URL}/admin/users/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (!res.ok) throw new Error(`Error ${res.status}`);
        setUser(await res.json());
      } catch (e) {
        setError(e.message);
      }
    }
    if (id) load();
  }, [id]);

  async function save() {
    try {
      setSaving(true);
      const token = localStorage.getItem("access_token");
      const res = await fetch(`${BASE_URL}/admin/users/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          name: user.name,
          is_active: user.is_active,
          membership_type: user.membership_type,
          payment_status: user.payment_status
        })
      });
      if (!res.ok) throw new Error('No se pudo guardar');
      alert('Usuario actualizado');
      navigate(`/admin/users/${id}`);
    } catch (e) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  }

  if (!user) return <section className="section"><div className="container">Cargando...</div></section>;

  return (
    <section className="section">
      <div className="container">
        <h2>Editar Usuario</h2>

        {error && <p style={{ color: 'crimson' }}>{error}</p>}

        <div className="card" style={{ padding: 16, maxWidth: 600 }}>
          <label>Nombre</label>
          <input value={user.name} onChange={e => setUser({ ...user, name: e.target.value })} />

          <label style={{ marginTop: 12 }}>Activo</label>
          <input type="checkbox" checked={user.is_active} onChange={e => setUser({ ...user, is_active: e.target.checked })} />

          {user.role === 'member' && (
            <>
              <label style={{ marginTop: 12 }}>Tipo de membresía</label>
              <select value={user.membership_type} onChange={e => setUser({ ...user, membership_type: e.target.value })}>
                <option value="joven">Joven</option>
                <option value="normal">Normal</option>
                <option value="gratuito">Gratuito</option>
              </select>

              <label style={{ marginTop: 12 }}>Estado de pago</label>
              <select value={user.payment_status} onChange={e => setUser({ ...user, payment_status: e.target.value })}>
                <option value="paid">Pagado</option>
                <option value="due">Pendiente</option>
              </select>
            </>
          )}
        </div>

        <div style={{ display: 'flex', gap: 12, marginTop: 16 }}>
          <button className="btn btn-outline" onClick={() => navigate(-1)} disabled={saving}>Cancelar</button>
          <button className="btn btn-primary" onClick={save} disabled={saving}>Guardar</button>
        </div>
      </div>
    </section>
  );
}


