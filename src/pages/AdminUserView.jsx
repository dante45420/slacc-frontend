import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";

export default function AdminUserView() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        const token = localStorage.getItem("access_token");
        const res = await fetch(`${BASE_URL}/admin/users/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (!res.ok) throw new Error(`Error ${res.status}`);
        const data = await res.json();
        setUser(data);
      } catch (e) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    }
    if (id) load();
  }, [id]);

  if (loading) return <section className="section"><div className="container">Cargando usuario...</div></section>;
  if (error) return <section className="section"><div className="container">Error: {error}</div></section>;
  if (!user) return null;

  return (
    <section className="section">
      <div className="container">
        <h2>Usuario: {user.name}</h2>
        <p><strong>Email:</strong> {user.email}</p>
        <p><strong>Rol:</strong> {user.role}</p>
        {user.role === 'member' && (
          <>
            <p><strong>Tipo membresía:</strong> {user.membership_type}</p>
            <p><strong>Estado pago:</strong> {user.payment_status}</p>
          </>
        )}
        <p><strong>Estado:</strong> {user.is_active ? 'Activo' : 'Inactivo'}</p>

        <div style={{ display: 'flex', gap: 12, marginTop: 16 }}>
          <button className="btn btn-outline" onClick={() => navigate('/admin')}>Volver</button>
          <button className="btn btn-primary" onClick={() => navigate(`/admin/users/${id}/edit`)}>Editar</button>
        </div>
      </div>
    </section>
  );
}


