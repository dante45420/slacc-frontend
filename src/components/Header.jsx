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

function SubMenuGroup({ label, children }) {
  return (
    <div className="submenu-item">
      <span style={{ cursor: "default" }}>{label}</span>
      <div className="submenu-nested">{children}</div>
    </div>
  );
}

SubMenuGroup.propTypes = {
  label: PropTypes.string.isRequired,
  children: PropTypes.node.isRequired,
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
            <SubLink to="/nosotros/mision" label="Estatutos, Misión, Visión" />
            <SubLink to="/nosotros/historia" label="Historia" />
          </MenuItem>
          <MenuItem label="Comités" to="/comites">
            <SubLink to="/comites#etica" label="Ética" />
            <SubLink to="/comites#cientifico" label="Científico" />
            <SubLink to="/comites#comite-a" label="Comité A" />
            <SubLink to="/comites#comite-b" label="Comité B" />
            <SubLink to="/comites#comite-c" label="Comité C" />
            <SubLink
              to="/comites#subespecialidades"
              label="Subespecialidades"
            />
          </MenuItem>
          <MenuItem label="Miembros" to="/miembros">
            <SubLink to="/por-que-ser-socio" label="Beneficios" />
            <SubLink to="/miembros/directorio" label="Directorio" />
            <SubLink to="/por-que-ser-socio" label="Hazte socio" />
            <SubLink to="/miembros/socios-activos" label="Socios Activos" />
          </MenuItem>
          <MenuItem label="Cursos" to="/cursos">
            <SubLink to="/eventos/pasados" label="Pasados" />
            <SubLink to="/eventos/proximos" label="Próximos" />
            <SubLink to="/cursos" label="Todos" />
            <SubLink to="/eventos/webinars" label="Webinars" />
          </MenuItem>
          <MenuItem label="Noticias" to="/noticias/comunicados">
            <SubLink to="/noticias/blog" label="Artículos científicos" />
            <SubLink to="/noticias/comunicados" label="Comunicados" />
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
