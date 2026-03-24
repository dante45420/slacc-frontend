import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../auth/AuthContext.jsx";
import PropTypes from "prop-types";
import { useState, useEffect } from "react";

function MenuItem({ label, to, ariaLabel, children, onClick }) {
  const [submenuOpen, setSubmenuOpen] = useState(false);

  const handleClick = e => {
    if (children && window.innerWidth <= 1200) {
      e.preventDefault();
      setSubmenuOpen(!submenuOpen);
    } else if (onClick) {
      onClick();
    }
  };

  return (
    <li className={submenuOpen ? "submenu-open" : ""}>
      <Link to={to} onClick={handleClick} aria-label={ariaLabel}>
        {label}
        {children && (
          <i
            className={`fa-solid ${
              submenuOpen ? "fa-chevron-down" : "fa-chevron-right"
            } submenu-chevron`}
          ></i>
        )}
      </Link>
      {children ? <div className="submenu">{children}</div> : null}
    </li>
  );
}

MenuItem.propTypes = {
  label: PropTypes.node.isRequired,
  to: PropTypes.string.isRequired,
  ariaLabel: PropTypes.string,
  children: PropTypes.node,
  onClick: PropTypes.func,
};

function SubLink({ to, label, onClick }) {
  return (
    <Link to={to} onClick={onClick}>
      {label}
    </Link>
  );
}

SubLink.propTypes = {
  to: PropTypes.string.isRequired,
  label: PropTypes.string.isRequired,
  onClick: PropTypes.func,
};

function SubMenuGroup({ label, children }) {
  return (
    <div className="submenu-item">
      <span className="submenu-label">{label}</span>
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
  const location = useLocation();

  useEffect(() => {
    const updateViewportAndHeader = () => {
      const header = document.getElementById("site-header");
      const viewportHeight = window.visualViewport
        ? window.visualViewport.height
        : window.innerHeight;

      document.documentElement.style.setProperty(
        "--app-height",
        `${viewportHeight}px`,
      );

      if (header) {
        const height = header.offsetHeight;
        document.documentElement.style.setProperty(
          "--header-height",
          `${height}px`,
        );
      }
    };

    updateViewportAndHeader();

    window.addEventListener("resize", updateViewportAndHeader);
    globalThis.addEventListener("orientationchange", updateViewportAndHeader);
    if (window.visualViewport) {
      window.visualViewport.addEventListener("resize", updateViewportAndHeader);
    }

    return () => {
      window.removeEventListener("resize", updateViewportAndHeader);
      globalThis.removeEventListener(
        "orientationchange",
        updateViewportAndHeader,
      );
      if (window.visualViewport) {
        window.visualViewport.removeEventListener(
          "resize",
          updateViewportAndHeader,
        );
      }
    };
  }, []);

  useEffect(() => {
    const body = document.body;
    const html = document.documentElement;

    if (mobileMenuOpen) {
      body.style.overflow = "hidden";
      html.style.overflow = "hidden";
    } else {
      body.style.overflow = "";
      html.style.overflow = "";
    }

    return () => {
      body.style.overflow = "";
      html.style.overflow = "";
    };
  }, [mobileMenuOpen]);

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
  };

  return (
    <header className="site-header" id="site-header">
      <nav className="nav">
        <Link to="/" className="brand">
          <img
            src="/LOGO SLACC_ROJO_HORIZONTAL.png"
            alt="SLACC Logo"
            className="logo-image header-logo-image"
            width="149"
            height="60"
          />
        </Link>

        <button
          className="hamburger-menu"
          onClick={toggleMobileMenu}
          aria-label="Toggle menu"
          aria-expanded={mobileMenuOpen}
        >
          <i
            className={
              mobileMenuOpen ? "fa-solid fa-xmark" : "fa-solid fa-bars"
            }
          ></i>
        </button>

        {mobileMenuOpen ? (
          <button
            type="button"
            className="menu-backdrop"
            aria-label="Cerrar menu"
            onClick={closeMobileMenu}
          />
        ) : null}

        <ul className={`menu ${mobileMenuOpen ? "menu-open" : ""}`}>
          {user?.role === "admin" && (
            <MenuItem label="Admin" to="/admin" onClick={closeMobileMenu} />
          )}
          <MenuItem label="Comités" to="/comites" onClick={closeMobileMenu} />
          <MenuItem label="Contacto" to="/contacto" onClick={closeMobileMenu} />
          <MenuItem label="Eventos" to="/eventos" onClick={closeMobileMenu}>
            <SubLink
              to="/eventos/pasados"
              label="Pasados"
              onClick={closeMobileMenu}
            />
            <SubLink
              to="/eventos/proximos"
              label="Próximos"
              onClick={closeMobileMenu}
            />
            <SubLink to="/eventos" label="Todos" onClick={closeMobileMenu} />
            <SubLink
              to="/eventos/webinars"
              label="Webinars"
              onClick={closeMobileMenu}
            />
          </MenuItem>
          <MenuItem label="Miembros" to="/miembros" onClick={closeMobileMenu}>
            <SubLink
              to="/por-que-ser-socio"
              label="Beneficios"
              onClick={closeMobileMenu}
            />
            <SubLink
              to="/miembros/directorio"
              label="Directorio"
              onClick={closeMobileMenu}
            />
            <SubLink
              to="/por-que-ser-socio"
              label="Hazte socio"
              onClick={closeMobileMenu}
            />
            <SubLink
              to="/miembros/socios-activos"
              label="Socios Activos"
              onClick={closeMobileMenu}
            />
          </MenuItem>
          <MenuItem label="Nosotros" to="/nosotros" onClick={closeMobileMenu}>
            <SubLink
              to="/nosotros/mision"
              label="Estatutos, Misión, Visión"
              onClick={closeMobileMenu}
            />
            <SubLink
              to="/nosotros/historia"
              label="Historia"
              onClick={closeMobileMenu}
            />
          </MenuItem>
          <MenuItem
            label="Noticias"
            to="/noticias/articulos-cientificos"
            onClick={closeMobileMenu}
          >
            <SubLink
              to="/noticias/articulos-cientificos"
              label="Artículos científicos"
              onClick={closeMobileMenu}
            />
            <SubLink
              to="/noticias/articulos-destacados"
              label="Artículos destacados"
              onClick={closeMobileMenu}
            />
            <SubLink
              to="/noticias/editoriales"
              label="Editoriales"
              onClick={closeMobileMenu}
            />
            {user && (
              <SubLink
                to="/subir-noticia"
                label="Enviar artículo"
                onClick={closeMobileMenu}
              />
            )}
          </MenuItem>
          <MenuItem
            label={<i className="fa-solid fa-user"></i>}
            ariaLabel={user ? "Perfil" : "Iniciar sesión"}
            to={user ? "/perfil" : "/login"}
            onClick={closeMobileMenu}
          >
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
                <SubLink
                  to="/login"
                  label="Iniciar sesión"
                  onClick={closeMobileMenu}
                />
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
