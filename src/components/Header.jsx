import { Link } from "react-router-dom";
import { useAuth } from "../auth/AuthContext.jsx";
import PropTypes from "prop-types";

function MenuItem({ label, to, children }) {
  return (
    <li>
      <Link to={to}>{label}</Link>
      {children ? <div className="submenu">{children}</div> : null}
    </li>
  );
}

MenuItem.propTypes = {
  label: PropTypes.string.isRequired,
  to: PropTypes.string.isRequired,
  children: PropTypes.node,
};

function SubLink({ to, label }) {
  return <Link to={to}>{label}</Link>;
}

SubLink.propTypes = {
  to: PropTypes.string.isRequired,
  label: PropTypes.string.isRequired,
};

export default function Header() {
  const { user, logout } = useAuth();
  return (
    <header className="site-header">
      <nav className="container nav">
        <Link to="/" className="brand">
          <img
            src="/LOGO SLACC_ROJO_HORIZONTAL.png"
            alt="SLACC Logo"
            className="logo-image"
            style={{ height: "60px", width: "auto" }}
          />
        </Link>
        <ul className="menu">
          <MenuItem label="Inicio" to="/" />
          <MenuItem label="Nosotros" to="/nosotros">
            <SubLink to="/nosotros/historia" label="Historia" />
            <SubLink to="/nosotros/mision" label="Estatutos, Misión, Visión" />
            <SubLink to="/nosotros/comite" label="Comités" />
          </MenuItem>
          <MenuItem label="Miembros" to="/miembros">
            <SubLink to="/por-que-ser-socio" label="Beneficios" />
            <SubLink to="/por-que-ser-socio" label="Hazte socio" />
            <SubLink to="/miembros/directorio" label="Directorio" />
            <SubLink to="/miembros/socios-jovenes" label="Nex Gen" />
            <SubLink
              to="/miembros/sociedades-afines"
              label="Sociedades afines"
            />
          </MenuItem>
          <MenuItem label="Cursos" to="/cursos">
            <SubLink to="/cursos" label="Todos" />
            <SubLink to="/eventos/proximos" label="Próximos" />
            <SubLink to="/eventos/pasados" label="Pasados" />
            <SubLink to="/eventos/webinars" label="Webinars" />
          </MenuItem>
          <MenuItem label="Noticias" to="/noticias/comunicados">
            <SubLink to="/noticias/comunicados" label="Comunicados" />
            <SubLink to="/noticias/blog" label="Artículos científicos" />
          </MenuItem>
          <MenuItem label="Contacto" to="/contacto" />
          {user?.role === "admin" && <MenuItem label="Admin" to="/admin" />}
          <MenuItem label="Usuario" to={user ? "/perfil" : "/login"}>
            {user ? (
              <button
                onClick={e => {
                  e.preventDefault();
                  logout();
                }}
              >
                Cerrar sesión
              </button>
            ) : (
              <>
                <SubLink to="/login" label="Iniciar sesión" />
                <SubLink
                  to="/solicitar-membresia"
                  label="Solicitar membresía"
                />
              </>
            )}
          </MenuItem>
        </ul>
      </nav>
    </header>
  );
}
