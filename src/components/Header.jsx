import { Link } from "react-router-dom";
import { useAuth } from "../auth/AuthContext.jsx";

function MenuItem({ label, to, children }) {
  return (
    <li>
      <Link to={to}>{label}</Link>
      {children ? <div className="submenu">{children}</div> : null}
    </li>
  );
}

function SubLink({ to, label }) {
  return (
    <Link to={to}>{label}</Link>
  );
}

export default function Header() {
  const { user, logout } = useAuth();
  return (
    <header className="site-header">
      <nav className="container nav">
        <Link to="/" className="brand">SLACC</Link>
        <ul className="menu">
          <MenuItem label="Nosotros" to="/nosotros">
            <SubLink to="/nosotros/historia" label="Historia" />
            <SubLink to="/nosotros/mision" label="Misión y Visión" />
            <SubLink to="/nosotros/comite" label="Comité" />
          </MenuItem>
          <MenuItem label="Miembros" to="/miembros">
            <SubLink to="/miembros/beneficios" label="Beneficios" />
            <SubLink to="/miembros/como-unirse" label="Cómo unirse" />
            <SubLink to="/miembros/directorio" label="Directorio" />
          </MenuItem>
          <MenuItem label="Cursos" to="/cursos">
            <SubLink to="/cursos" label="Todos" />
            <SubLink to="/eventos/proximos" label="Próximos" />
            <SubLink to="/eventos/pasados" label="Pasados" />
            <SubLink to="/eventos/webinars" label="Webinars" />
          </MenuItem>
          <MenuItem label="Educación" to="/educacion">
            <SubLink to="/educacion/recursos" label="Recursos" />
            <SubLink to="/educacion/biblioteca" label="Biblioteca" />
            <SubLink to="/educacion/casos" label="Casos" />
          </MenuItem>
          <MenuItem label="Noticias" to="/noticias/comunicados">
            <SubLink to="/noticias/comunicados" label="Comunicados" />
            <SubLink to="/noticias/prensa" label="Prensa" />
            <SubLink to="/noticias/blog" label="Blog" />
          </MenuItem>
          <MenuItem label="Usuario" to={user ? "/perfil" : "/login"}>
            {user ? (
              <>
                {/* Subir noticia eliminado del menú de usuario */}
                {user.role === "admin" ? <SubLink to="/admin" label="Portal admin" /> : null}
                <a href="#" onClick={(e) => { e.preventDefault(); logout(); }}>Cerrar sesión</a>
              </>
            ) : (
              <>
                <SubLink to="/login" label="Iniciar sesión" />
                <SubLink to="/solicitar-membresia" label="Solicitar membresía" />
              </>
            )}
          </MenuItem>
        </ul>
      </nav>
    </header>
  );
}

