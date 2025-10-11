import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../auth/AuthContext.jsx";

export default function Login() {
  const { login } = useAuth();
  const nav = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  async function submit(e) {
    e.preventDefault();
    try {
      await login(email, password);
      nav("/");
    } catch (err) {
      setError("Credenciales inválidas");
    }
  }

  return (
    <section className="section">
      <div className="container" style={{ maxWidth: 520 }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <h1>Iniciar Sesión</h1>
          <p style={{ color: 'var(--color-muted)' }}>Accede a tu cuenta de socio SLACC</p>
        </div>
        
        <form onSubmit={submit} style={{ background: '#f8f9fa', padding: 32, borderRadius: 12 }}>
          <div style={{ marginBottom: 20 }}>
            <label style={{ display: 'block', marginBottom: 8, fontWeight: '500' }}>Email</label>
            <input 
              type="email" 
              value={email} 
              onChange={e => setEmail(e.target.value)} 
              style={{ width: "100%", padding: 12, border: '1px solid #ddd', borderRadius: 6 }} 
              required 
            />
          </div>
          <div style={{ marginBottom: 20 }}>
            <label style={{ display: 'block', marginBottom: 8, fontWeight: '500' }}>Contraseña</label>
            <input 
              type="password" 
              value={password} 
              onChange={e => setPassword(e.target.value)} 
              style={{ width: "100%", padding: 12, border: '1px solid #ddd', borderRadius: 6 }} 
              required 
            />
          </div>
          {error ? (
            <div style={{ 
              background: '#f8d7da', 
              color: '#721c24', 
              padding: 12, 
              borderRadius: 6, 
              marginBottom: 20,
              textAlign: 'center'
            }}>
              {error}
            </div>
          ) : null}
          <button className="btn btn-primary" type="submit" style={{ width: '100%', padding: 12 }}>
            Iniciar Sesión
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: 24 }}>
          <p style={{ marginBottom: 16 }}>¿No eres miembro?</p>
          <Link to="/solicitar-membresia" className="btn btn-outline">
            Solicitar Membresía
          </Link>
        </div>
      </div>
    </section>
  );
}


