import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Section,
  Container,
  Card,
  Input,
  Select,
  Button,
  Alert,
  Spinner,
  useToast
} from "../../components/ui";

const BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";

export default function AdminUserEdit() {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const [user, setUser] = useState(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        const token = localStorage.getItem("access_token");
        const res = await fetch(`${BASE_URL}/admin/users/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error(`Error ${res.status}`);
        setUser(await res.json());
      } catch (e) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    }
    if (id) load();
  }, [id]);

  async function save() {
    try {
      setSaving(true);
      setError(null);
      const token = localStorage.getItem("access_token");
      const res = await fetch(`${BASE_URL}/admin/users/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: user.name,
          is_active: user.is_active,
          membership_type: user.membership_type,
          payment_status: user.payment_status,
        }),
      });
      if (!res.ok) throw new Error("No se pudo guardar");
      toast.success("Usuario actualizado correctamente");
      navigate(`/admin/users/${id}`);
    } catch (e) {
      setError(e.message);
      toast.error("Error al guardar los cambios");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <Section variant="default">
        <Container size="sm">
          <div className="flex justify-center p-6">
            <Spinner size="lg" />
          </div>
        </Container>
      </Section>
    );
  }

  if (!user) {
    return (
      <Section variant="default">
        <Container size="sm">
          <Alert variant="error">No se pudo cargar el usuario</Alert>
          <Button variant="outline" onClick={() => navigate('/admin')} className="mt-4">
            Volver al panel
          </Button>
        </Container>
      </Section>
    );
  }

  return (
    <Section variant="default">
      <Container size="sm">
        <h1 className="mb-5">Editar Usuario</h1>

        {error && <Alert variant="error" className="mb-4">{error}</Alert>}

        <Card>
          <div className="flex flex-col gap-4">
            <Input
              label="Nombre completo"
              value={user.name}
              onChange={e => setUser({ ...user, name: e.target.value })}
            />

            <div>
              <label className="flex items-center gap-2" style={{ cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={user.is_active}
                  onChange={e => setUser({ ...user, is_active: e.target.checked })}
                  style={{ width: 'auto', cursor: 'pointer' }}
                />
                <span className="font-medium">Usuario activo</span>
              </label>
              <p className="text-muted text-sm mt-1 mb-0">
                Los usuarios inactivos no pueden acceder al sistema
              </p>
            </div>

            {user.role === "member" && (
              <>
                <Select
                  label="Tipo de membresía"
                  value={user.membership_type}
                  onChange={e =>
                    setUser({ ...user, membership_type: e.target.value })
                  }
                  options={[
                    { value: 'joven', label: 'Miembro Joven' },
                    { value: 'normal', label: 'Miembro Normal' },
                    { value: 'gratuito', label: 'Membresía Gratuita' }
                  ]}
                />

                <Select
                  label="Estado de pago"
                  value={user.payment_status}
                  onChange={e =>
                    setUser({ ...user, payment_status: e.target.value })
                  }
                  options={[
                    { value: 'paid', label: 'Pagado' },
                    { value: 'due', label: 'Pendiente' },
                    { value: 'none', label: 'Ninguno' }
                  ]}
                />
              </>
            )}
          </div>

          <div className="flex gap-3 mt-5 pt-4" style={{ borderTop: '1px solid var(--color-border)' }}>
            <Button
              variant="outline"
              onClick={() => navigate(-1)}
              disabled={saving}
            >
              Cancelar
            </Button>
            <Button 
              variant="primary" 
              onClick={save} 
              loading={saving}
            >
              Guardar Cambios
            </Button>
          </div>
        </Card>
      </Container>
    </Section>
  );
}
