import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../auth/AuthContext.jsx";
import { apiPost } from "../../api/client";
import {
  Section,
  Container,
  Card,
  Grid,
  Badge,
  Input,
  Button,
  Alert,
  useToast,
} from "../../components/ui";

export default function UserProfile() {
  const { user } = useAuth();
  const toast = useToast();

  const membershipTypeLabel = value => {
    if (!value) return "";
    const key = String(value).trim().toLowerCase();
    const labels = {
      normal: "Normal",
      joven: "Joven",
      gratuito: "Emérito",
      socio: "Socio",
    };
    return labels[key] ?? key.charAt(0).toUpperCase() + key.slice(1);
  };

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [savingPassword, setSavingPassword] = useState(false);
  const [passwordMsg, setPasswordMsg] = useState("");

  if (!user) {
    return (
      <Section variant="default" padding="lg">
        <Container>
          <Card>
            <h1 className="mb-2">Mi cuenta</h1>
            <p className="text-muted">
              Debes iniciar sesión para ver tu perfil.
            </p>
            <div className="mt-4">
              <Link to="/login">
                <Button variant="primary">Iniciar sesión</Button>
              </Link>
            </div>
          </Card>
        </Container>
      </Section>
    );
  }

  const isPaid = user.payment_status === "paid";

  async function handleChangePassword(e) {
    e.preventDefault();
    setPasswordMsg("");

    if (!currentPassword || !newPassword) {
      setPasswordMsg("Completa todos los campos.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordMsg("La confirmación no coincide.");
      return;
    }

    setSavingPassword(true);
    try {
      await apiPost("/auth/change-password", {
        current_password: currentPassword,
        new_password: newPassword,
      });
      toast.success("Contraseña actualizada");
      setPasswordMsg("Contraseña actualizada correctamente.");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      console.error(err);
      toast.error("No se pudo actualizar");
      setPasswordMsg("No se pudo actualizar la contraseña.");
    } finally {
      setSavingPassword(false);
    }
  }

  return (
    <Section variant="default" padding="lg">
      <Container size="default">
        <div className="form-wrapper-centered">
          <h1 className="mb-6">Mi cuenta</h1>

          <Card className="mb-4">
            <Grid columns={2} gap={4}>
              <div>
                <div className="text-muted">Nombre</div>
                <div className="font-semibold">{user.name}</div>
              </div>
              <div>
                <div className="text-muted">Email</div>
                <div className="font-semibold">{user.email}</div>
              </div>
              <div>
                <div className="text-muted">Tipo de membresía</div>
                <div className="font-semibold">
                  {membershipTypeLabel(user.membership_type)}
                </div>
              </div>
              <div>
                <div className="text-muted">Estado</div>
                <Badge variant={isPaid ? "success" : "warning"}>
                  {isPaid ? "Al día" : "Pago pendiente"}
                </Badge>
              </div>
            </Grid>
          </Card>

          {!isPaid && (
            <Card className="mb-4">
              <h3 className="mb-2">Regularizar tu membresía</h3>
              <p className="text-muted">
                Tu membresía presenta pagos pendientes. Puedes resolverlo
                haciendo clic en el siguiente botón.
              </p>
              <Button
                variant="primary"
                onClick={() => toast.info("Pago simulado")}
              >
                Pagar ahora
              </Button>
            </Card>
          )}

          <Card>
            <h3 className="mb-4">Cambiar contraseña</h3>
            <form onSubmit={handleChangePassword}>
              <Input
                label="Contraseña actual"
                type="password"
                value={currentPassword}
                onChange={e => setCurrentPassword(e.target.value)}
                required
              />
              <div className="grid grid-2 gap-4">
                <Input
                  label="Nueva contraseña"
                  type="password"
                  value={newPassword}
                  onChange={e => setNewPassword(e.target.value)}
                  helperText="Mínimo 8 caracteres"
                  required
                />
                <Input
                  label="Confirmar nueva contraseña"
                  type="password"
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  required
                />
              </div>

              <div className="flex justify-end mt-4">
                <Button
                  type="submit"
                  loading={savingPassword}
                  disabled={savingPassword}
                >
                  Actualizar
                </Button>
              </div>
            </form>
            {passwordMsg ? (
              <Alert variant="info" className="mt-4">
                {passwordMsg}
              </Alert>
            ) : null}
          </Card>
        </div>
      </Container>
    </Section>
  );
}
