import { Link } from "react-router-dom";
import { useAuth } from "../auth/AuthContext.jsx";
import PropTypes from "prop-types";
import { useState } from "react";

function MenuItem({ label, to, children, onClick }) {
  return (
    <li>
      <Link to={to} onClick={onClick}>{label}</Link>
      {children ? <div className="submenu">{children}</div> : null}
    </li>
  );
}

MenuItem.propTypes = {
  label: PropTypes.string.isRequired,
  to: PropTypes.string.isRequired,
  children: PropTypes.node,
  onClick: PropTypes.func,
};

function SubLink({ to, label, onClick }) {
  return <Link to={to} onClick={onClick}>{label}</Link>;
}

SubLink.propTypes = {
  to: PropTypes.string.isRequired,
  label: PropTypes.string.isRequired,
  onClick: PropTypes.func,
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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
  };

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
        
        <button 
          className="hamburger-menu" 
          onClick={toggleMobileMenu}
          aria-label="Toggle menu"
        >
          <i className={mobileMenuOpen ? "fa-solid fa-xmark" : "fa-solid fa-bars"}></i>
        </button>

        <ul className={`menu ${mobileMenuOpen ? "menu-open" : ""}`}>
          <MenuItem label="Inicio" to="/" onClick={closeMobileMenu} />
          <MenuItem label="Nosotros" to="/nosotros" onClick={closeMobileMenu}>
            <SubLink to="/nosotros/mision" label="Estatutos, Misión, Visión" onClick={closeMobileMenu} />
            <SubLink to="/nosotros/historia" label="Historia" onClick={closeMobileMenu} />
          </MenuItem>
          <MenuItem label="Comités" to="/comites" onClick={closeMobileMenu}>
            <SubLink to="/comites#etica" label="Ética" onClick={closeMobileMenu} />
            <SubLink to="/comites#cientifico" label="Científico" onClick={closeMobileMenu} />
            <SubLink to="/comites#comite-a" label="Comité A" onClick={closeMobileMenu} />
            <SubLink to="/comites#comite-b" label="Comité B" onClick={closeMobileMenu} />
            <SubLink to="/comites#comite-c" label="Comité C" onClick={closeMobileMenu} />
            <SubLink
              to="/comites#subespecialidades"
              label="Subespecialidades"
              onClick={closeMobileMenu}
            />
          </MenuItem>
          <MenuItem label="Miembros" to="/miembros" onClick={closeMobileMenu}>
            <SubLink to="/por-que-ser-socio" label="Beneficios" onClick={closeMobileMenu} />
            <SubLink to="/miembros/directorio" label="Directorio" onClick={closeMobileMenu} />
            <SubLink to="/por-que-ser-socio" label="Hazte socio" onClick={closeMobileMenu} />
            <SubLink to="/miembros/socios-activos" label="Socios Activos" onClick={closeMobileMenu} />
          </MenuItem>
          <MenuItem label="Cursos" to="/cursos" onClick={closeMobileMenu}>
            <SubLink to="/eventos/pasados" label="Pasados" onClick={closeMobileMenu} />
            <SubLink to="/eventos/proximos" label="Próximos" onClick={closeMobileMenu} />
            <SubLink to="/cursos" label="Todos" onClick={closeMobileMenu} />
            <SubLink to="/eventos/webinars" label="Webinars" onClick={closeMobileMenu} />
          </MenuItem>
          <MenuItem label="Noticias" to="/noticias/comunicados" onClick={closeMobileMenu}>
            <SubLink to="/noticias/blog" label="Artículos científicos" onClick={closeMobileMenu} />
            <SubLink to="/noticias/comunicados" label="Comunicados" onClick={closeMobileMenu} />
          </MenuItem>
          <MenuItem label="Contacto" to="/contacto" onClick={closeMobileMenu} />
          {user?.role === "admin" && <MenuItem label="Admin" to="/admin" onClick={closeMobileMenu} />}
          <MenuItem label="Usuario" to={user ? "/perfil" : "/login"} onClick={closeMobileMenu}>
            {user ? (
              <button
                onClick={e => {
                  e.preventDefault();
                  logout();
                  closeMobileMenu();
                }}
              >
                Cerrar sesión
              </button>
            ) : (
              <>
                <SubLink to="/login" label="Iniciar sesión" onClick={closeMobileMenu} />
                <SubLink
                  to="/solicitar-membresia"
                  label="Solicitar membresía"
                  onClick={closeMobileMenu}
                />
              </>
            )}
          </MenuItem>
        </ul>
      </nav>
    </header>
  );
}
