import { useState } from "react";
import { useNavigate } from "react-router-dom";
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
      const user = await login(email, password);
      // Redirect admin users to admin dashboard
      if (user?.role === "admin") {
        nav("/admin");
      } else {
        nav("/");
      }
    } catch (err) {
      console.error("Login error:", err);
      setError(
        "Credenciales inválidas. Por favor verifica tu email y contraseña.",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <Section variant="primary" padding="lg" containerSize="sm">
      <div className="login-header">
        <h1 className="login-title">Iniciar Sesión</h1>
        <p className="login-subtitle">Accede a tu cuenta de socio SLACC</p>
      </div>

      <div className="login-form-shell">
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
            <Alert variant="error" className="mb-4">
              {error}
            </Alert>
          )}

          <Button type="submit" fullWidth loading={loading} disabled={loading}>
            Iniciar Sesión
          </Button>
        </form>
      </div>
    </Section>
  );
}
