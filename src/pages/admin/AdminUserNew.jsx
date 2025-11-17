import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Section,
  Container,
  Card,
  Input,
  Select,
  Button,
  Alert,
  useToast,
} from "../../components/ui";

const BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";

export default function AdminUserNew() {
  const navigate = useNavigate();
  const toast = useToast();
  const [form, setForm] = useState({
    email: "",
    name: "",
    password: "",
    membership_type: "normal",
    payment_status: "due",
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  async function submit(e) {
    e.preventDefault();
    try {
      setSaving(true);
      setError(null);
      const token = localStorage.getItem("access_token");
      const res = await fetch(`${BASE_URL}/admin/users/member`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error("No se pudo crear");
      const data = await res.json();
      toast.success(
        `Usuario creado correctamente. Contraseña inicial: ${data.initial_password}`
      );
      setTimeout(() => {
        navigate("/admin?tab=users");
      }, 2000);
    } catch (e) {
      setError(e.message);
      toast.error("Error al crear el usuario");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Section variant="default">
      <Container size="sm">
        <div className="mb-5">
          <Button
            variant="outline"
            onClick={() => navigate("/admin?tab=users")}
            className="mb-4"
          >
            <i className="fa-solid fa-arrow-left"></i> Volver al Panel Admin
          </Button>

          <h1 className="mb-2">Crear Usuario</h1>
          <p className="text-muted">
            Completa el formulario para crear un nuevo miembro
          </p>
        </div>

        {error && (
          <Alert variant="error" className="mb-4">
            {error}
          </Alert>
        )}

        <Card>
          <form onSubmit={submit}>
            <div className="mb-4">
              <Input
                label="Email *"
                id="new-user-email"
                type="email"
                placeholder="correo@ejemplo.com"
                value={form.email}
                onChange={e => setForm({ ...form, email: e.target.value })}
                required
              />
            </div>

            <div className="mb-4">
              <Input
                label="Nombre completo *"
                id="new-user-name"
                type="text"
                placeholder="Nombre del usuario"
                value={form.name}
                onChange={e => setForm({ ...form, name: e.target.value })}
                required
              />
            </div>

            <div className="mb-4">
              <Input
                label="Contraseña (opcional)"
                id="new-user-password"
                type="password"
                placeholder="Dejar vacío para generar automáticamente"
                value={form.password}
                onChange={e => setForm({ ...form, password: e.target.value })}
              />
              <p className="text-muted text-sm mt-2">
                Si no especificas una contraseña, se generará una
                automáticamente
              </p>
            </div>

            <div className="mb-4">
              <Select
                label="Tipo de membresía *"
                id="new-user-membership-type"
                value={form.membership_type}
                onChange={e =>
                  setForm({ ...form, membership_type: e.target.value })
                }
                required
              >
                <option value="joven">Joven</option>
                <option value="normal">Normal</option>
                <option value="gratuito">Gratuito</option>
              </Select>
            </div>

            <div className="mb-5">
              <Select
                label="Estado de pago *"
                id="new-user-payment-status"
                value={form.payment_status}
                onChange={e =>
                  setForm({ ...form, payment_status: e.target.value })
                }
                required
              >
                <option value="paid">Pagado</option>
                <option value="due">Pendiente</option>
              </Select>
            </div>

            <div className="flex justify-end gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate("/admin?tab=users")}
                disabled={saving}
              >
                Cancelar
              </Button>
              <Button type="submit" variant="primary" disabled={saving}>
                {saving ? "Creando..." : "Crear Usuario"}
              </Button>
            </div>
          </form>
        </Card>
      </Container>
    </Section>
  );
}
