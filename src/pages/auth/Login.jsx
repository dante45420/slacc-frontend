import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuth } from "../../auth/AuthContext.jsx";
import Section from "../../components/ui/Section.jsx";
import Input from "../../components/ui/Input.jsx";
import Button from "../../components/ui/Button.jsx";
import Alert from "../../components/ui/Alert.jsx";
import PageHero from "../../components/ui/PageHero.jsx";

export default function Login() {
  const { t } = useTranslation();
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
      if (user?.role === "admin") {
        nav("/admin");
      } else {
        nav("/");
      }
    } catch (err) {
      console.error("Login error:", err);
      setError(t("login.error"));
    } finally {
      setLoading(false);
    }
  }

  return (
    <Section variant="primary" padding="lg" containerSize="sm">
      <PageHero title={t("login.title")} subtitle={t("login.subtitle")} />

      <div className="login-form-shell">
        <form onSubmit={submit}>
          <Input
            label={t("common.email")}
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="tu@email.com"
            required
          />

          <Input
            label={t("login.password")}
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
            {t("login.submit")}
          </Button>
        </form>
      </div>
    </Section>
  );
}
