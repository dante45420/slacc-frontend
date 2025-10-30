import { useAuth } from "../../auth/AuthContext.jsx";

export default function UserProfile() {
  const { user } = useAuth();

  if (!user) {
    return (
      <section className="section">
        <div className="container">
          <h1>Perfil</h1>
          <p>Debes iniciar sesión para ver tu perfil.</p>
        </div>
      </section>
    );
  }

  const isPaid = user.payment_status === 'paid';

  return (
    <section className="section">
      <div className="container" style={{ maxWidth: 720 }}>
        <h1>Mi Cuenta</h1>

        <div className="card" style={{ marginTop: 16 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <div style={{ color: 'var(--color-muted)', marginBottom: 4 }}>Nombre</div>
              <div style={{ fontWeight: 600 }}>{user.name}</div>
            </div>
            <div>
              <div style={{ color: 'var(--color-muted)', marginBottom: 4 }}>Email</div>
              <div style={{ fontWeight: 600 }}>{user.email}</div>
            </div>
            <div>
              <div style={{ color: 'var(--color-muted)', marginBottom: 4 }}>Tipo de membresía</div>
              <div style={{ fontWeight: 600 }}>{user.membership_type}</div>
            </div>
            <div>
              <div style={{ color: 'var(--color-muted)', marginBottom: 4 }}>Estado</div>
              <div>
                <span style={{
                  background: isPaid ? 'var(--color-secondary)' : 'crimson',
                  color: 'white',
                  padding: '4px 10px',
                  borderRadius: 12,
                  fontWeight: 700,
                  fontSize: '0.9em'
                }}>
                  {isPaid ? 'Al día' : 'Pago pendiente'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {!isPaid && (
          <div className="card" style={{ marginTop: 16 }}>
            <h3 style={{ marginTop: 0 }}>Regularizar tu membresía</h3>
            <p style={{ color: 'var(--color-muted)' }}>Tu membresía presenta pagos pendientes. Puedes resolverlo haciendo clic en el siguiente botón.</p>
            <button className="btn btn-primary" onClick={() => alert('Pago simulado')}>
              Pagar ahora
            </button>
          </div>
        )}
      </div>
    </section>
  );
}


