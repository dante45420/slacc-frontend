import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../auth/AuthContext.jsx";
import Section from "../../components/ui/Section.jsx";
import Input from "../../components/ui/Input.jsx";
import Button from "../../components/ui/Button.jsx";
import Alert from "../../components/ui/Alert.jsx";

export default function Login() {
  const { login } = useAuth();
  const nav = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(email, password);
      nav("/");
    } catch (err) {
      console.error("Login error:", err);
      setError("Credenciales inválidas. Por favor verifica tu email y contraseña.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Section variant="primary" padding="lg" containerSize="sm">
      <div style={{ textAlign: "center", marginBottom: "var(--spacing-6)" }}>
        <h1 style={{ marginBottom: "var(--spacing-2)" }}>Iniciar Sesión</h1>
        <p style={{ color: "var(--color-muted)", fontSize: "16px" }}>
          Accede a tu cuenta de socio SLACC
        </p>
      </div>

      <div style={{ 
        background: "var(--color-bg)",
        padding: "var(--spacing-6)",
        borderRadius: "var(--radius-lg)",
        boxShadow: "var(--shadow-md)",
        border: "1px solid var(--color-border)"
      }}>
        <form onSubmit={submit}>
          <Input
            label="Email"
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="tu@email.com"
            required
          />
          
          <Input
            label="Contraseña"
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            placeholder="••••••••"
            required
          />
          
          {error && (
            <Alert variant="error" style={{ marginBottom: "var(--spacing-4)" }}>
              {error}
            </Alert>
          )}
          
          <Button
            type="submit"
            fullWidth
            loading={loading}
            disabled={loading}
          >
            Iniciar Sesión
          </Button>
        </form>

        <div style={{
          marginTop: "var(--spacing-5)",
          paddingTop: "var(--spacing-5)",
          borderTop: "1px solid var(--color-border)",
          textAlign: "center"
        }}>
          <p style={{ color: "var(--color-muted)", marginBottom: "var(--spacing-3)" }}>
            ¿No tienes una cuenta?
          </p>
          <Link to="/solicitar-membresia">
            <Button variant="outline" fullWidth>
              Solicitar membresía
            </Button>
          </Link>
        </div>
      </div>
    </Section>
  );
}
