import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Section,
  Container,
  Card,
  Badge,
  Button,
  Spinner,
  Alert,
} from "../../components/ui";

const BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";

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
          headers: { Authorization: `Bearer ${token}` },
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

  if (error) {
    return (
      <Section variant="default">
        <Container size="sm">
          <Alert variant="error">{error}</Alert>
          <Button
            variant="outline"
            onClick={() => navigate("/admin")}
            className="mt-4"
          >
            Volver al panel
          </Button>
        </Container>
      </Section>
    );
  }

  if (!user) return null;

  const roleVariant = user.role === "admin" ? "accent" : "primary";
  const statusVariant = user.is_active ? "success" : "neutral";

  let paymentVariant = "neutral";
  if (user.payment_status === "paid") paymentVariant = "success";
  else if (user.payment_status === "due") paymentVariant = "warning";

  const getMembershipTypeLabel = type => {
    if (type === "joven") return "Miembro Joven";
    if (type === "normal") return "Miembro Normal";
    if (type === "gratuito") return "Membresía Gratuita";
    return type || "No definido";
  };

  const getPaymentStatusLabel = status => {
    if (status === "paid") return "Pagado";
    if (status === "due") return "Pendiente";
    return "Ninguno";
  };

  return (
    <Section variant="default">
      <Container size="sm">
        <div className="flex items-center justify-between mb-5">
          <h1 className="mt-0 mb-0">Detalles del Usuario</h1>
          <Badge variant={roleVariant} size="md">
            {user.role === "admin" ? "Administrador" : "Miembro"}
          </Badge>
        </div>

        <Card>
          <div className="mb-5">
            <h2 className="mt-0 mb-4">{user.name}</h2>

            <div className="flex flex-col gap-4">
              <div>
                <div className="text-muted text-sm mb-1">Email</div>
                <div className="font-medium">{user.email}</div>
              </div>

              <div>
                <div className="text-muted text-sm mb-1">Estado</div>
                <div>
                  <Badge variant={statusVariant}>
                    {user.is_active ? "Activo" : "Inactivo"}
                  </Badge>
                </div>
              </div>

              {user.role === "member" && (
                <>
                  <div>
                    <div className="text-muted text-sm mb-1">
                      Tipo de Membresía
                    </div>
                    <div className="font-medium">
                      {getMembershipTypeLabel(user.membership_type)}
                    </div>
                  </div>

                  <div>
                    <div className="text-muted text-sm mb-1">
                      Estado de Pago
                    </div>
                    <div>
                      <Badge variant={paymentVariant}>
                        {getPaymentStatusLabel(user.payment_status)}
                      </Badge>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>

          <div
            className="flex gap-3 pt-4"
            style={{ borderTop: "1px solid var(--color-border)" }}
          >
            <Button variant="outline" onClick={() => navigate("/admin")}>
              Volver
            </Button>
            <Button
              variant="primary"
              onClick={() => navigate(`/admin/users/${id}/edit`)}
            >
              Editar Usuario
            </Button>
          </div>
        </Card>
      </Container>
    </Section>
  );
}
