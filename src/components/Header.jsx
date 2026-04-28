import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../auth/AuthContext.jsx";
import PropTypes from "prop-types";
import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";

function MenuItem({ label, to, ariaLabel, children, onClick, className }) {
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
    <li className={`${submenuOpen ? "submenu-open" : ""} ${className || ""}`}>
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
  className: PropTypes.string,
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
  const [languageOpen, setLanguageOpen] = useState(false);
  const location = useLocation();
  const { t, i18n } = useTranslation();

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
    setLanguageOpen(false);
  }, [location.pathname]);

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
    setLanguageOpen(false);
  };

  const handleLanguageToggle = () => {
    setLanguageOpen(prev => !prev);
  };

  const handleLanguageSelect = lang => {
    i18n.changeLanguage(lang);
    setLanguageOpen(false);
    closeMobileMenu();
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
          aria-label={t("header.select_language", "Toggle menu")}
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
            <MenuItem
              label={t("header.admin", "Admin")}
              to="/admin"
              onClick={closeMobileMenu}
            />
          )}
          <MenuItem
            label={t("header.society", "La Sociedad")}
            to="/nosotros"
            onClick={closeMobileMenu}
          >
            <SubLink
              to="/nosotros/mision"
              label={t("header.mission", "Misión, Visión y Valores")}
              onClick={closeMobileMenu}
            />
            <SubLink
              to="/nosotros/directiva"
              label={t("header.board", "Mesa Directiva")}
              onClick={closeMobileMenu}
            />
            <SubLink
              to="/nosotros/historia"
              label={t("header.history", "Historia")}
              onClick={closeMobileMenu}
            />
            <SubLink
              to="/nosotros/estatutos"
              label={t("header.statutes", "Estatutos")}
              onClick={closeMobileMenu}
            />
            <SubLink
              to="/comites"
              label={t("header.committees", "Comités")}
              onClick={closeMobileMenu}
            />
          </MenuItem>
          <MenuItem
            label={t("header.alliances", "Alianzas")}
            to="/alianzas"
            onClick={closeMobileMenu}
          />
          <MenuItem
            label={t("header.education", "Educación")}
            to="/educacion"
            onClick={closeMobileMenu}
          >
            <SubLink
              to="/educacion/aval-certificacion"
              label={t("header.certification", "Aval y Certificación")}
              onClick={closeMobileMenu}
            />
            <SubLink
              to="/educacion/becas"
              label={t("header.scholarships", "Becas y Pasantías")}
              onClick={closeMobileMenu}
            />
            <SubLink
              to="/educacion/videoteca"
              label={t("header.virtual_classroom", "Aula Virtual")}
              onClick={closeMobileMenu}
            />
          </MenuItem>
          <MenuItem
            label={t("header.events", "Eventos")}
            to="/eventos"
            onClick={closeMobileMenu}
          >
            <SubLink
              to="/eventos/pasados"
              label={t("header.past_events", "Pasados")}
              onClick={closeMobileMenu}
            />
            <SubLink
              to="/eventos/proximos"
              label={t("header.upcoming_events", "Próximos")}
              onClick={closeMobileMenu}
            />
            <SubLink
              to="/eventos/proximos"
              label={t("header.congress", "Congreso Latinoamericano")}
              onClick={closeMobileMenu}
            />
            <SubLink
              to="/eventos"
              label={t("header.all_events", "Todos")}
              onClick={closeMobileMenu}
            />
            <SubLink
              to="/eventos/webinars"
              label={t("header.webinars", "Webinars")}
              onClick={closeMobileMenu}
            />
          </MenuItem>
          <MenuItem
            label={t("header.members", "Miembros")}
            to="/miembros"
            onClick={closeMobileMenu}
          >
            <SubLink
              to="/por-que-ser-socio"
              label={t("header.benefits", "Beneficios")}
              onClick={closeMobileMenu}
            />
            <SubLink
              to="/miembros/directorio"
              label={t("header.directory", "Directorio")}
              onClick={closeMobileMenu}
            />
            <SubLink
              to="/por-que-ser-socio"
              label={t("header.join", "Hazte socio")}
              onClick={closeMobileMenu}
            />
            <SubLink
              to="/miembros/socios-activos"
              label={t("header.active_members", "Socios Activos")}
              onClick={closeMobileMenu}
            />
            <SubLink
              to="/portal-socios"
              label={t("header.private_portal", "Portal Privado")}
              onClick={closeMobileMenu}
            />
          </MenuItem>
          <MenuItem
            label={t("header.news", "Noticias")}
            to="/noticias/articulos-cientificos"
            onClick={closeMobileMenu}
          >
            <SubLink
              to="/noticias/articulos-cientificos"
              label={t("header.scientific_articles", "Artículos científicos")}
              onClick={closeMobileMenu}
            />
            <SubLink
              to="/noticias/articulos-destacados"
              label={t("header.featured_articles", "Artículos destacados")}
              onClick={closeMobileMenu}
            />
            <SubLink
              to="/noticias/editoriales"
              label={t("header.editorials", "Editoriales")}
              onClick={closeMobileMenu}
            />
            {user && (
              <SubLink
                to="/subir-noticia"
                label={t("header.submit_article", "Enviar artículo")}
                onClick={closeMobileMenu}
              />
            )}
          </MenuItem>
          <MenuItem
            label={t("header.contact", "Contacto")}
            to="/contacto"
            onClick={closeMobileMenu}
          />
          <MenuItem
            label={<i className="fa-solid fa-user"></i>}
            ariaLabel={
              user
                ? t("header.profile", "Perfil")
                : t("header.login", "Iniciar sesión")
            }
            to={user ? "/perfil" : "/login"}
            onClick={closeMobileMenu}
            className="user-menu"
          >
            {user ? (
              <button
                onClick={e => {
                  e.preventDefault();
                  logout();
                  closeMobileMenu();
                }}
              >
                {t("header.logout", "Cerrar sesión")}
              </button>
            ) : (
              <>
                <SubLink
                  to="/login"
                  label={t("header.login", "Iniciar sesión")}
                  onClick={closeMobileMenu}
                />
                <SubLink
                  to="/solicitar-membresia"
                  label={t("header.request_membership", "Solicitar membresía")}
                  onClick={closeMobileMenu}
                />
              </>
            )}
          </MenuItem>
          <li
            className={`language-selector ${languageOpen ? "submenu-open" : ""}`}
          >
            <button
              type="button"
              className="language-trigger"
              aria-label="Seleccionar idioma"
              aria-expanded={languageOpen}
              onClick={handleLanguageToggle}
            >
              <i className="fa-solid fa-earth-americas"></i>
            </button>
            <div className="submenu language-submenu">
              <button
                type="button"
                style={{
                  background: "none",
                  border: "none",
                  padding: "0.75rem 1rem",
                  cursor: "pointer",
                  textAlign: "left",
                  width: "100%",
                }}
                onClick={() => handleLanguageSelect("es")}
              >
                ES
              </button>
              <button
                type="button"
                style={{
                  background: "none",
                  border: "none",
                  padding: "0.75rem 1rem",
                  cursor: "pointer",
                  textAlign: "left",
                  width: "100%",
                }}
                onClick={() => handleLanguageSelect("en")}
              >
                EN
              </button>
              <button
                type="button"
                style={{
                  background: "none",
                  border: "none",
                  padding: "0.75rem 1rem",
                  cursor: "pointer",
                  textAlign: "left",
                  width: "100%",
                }}
                onClick={() => handleLanguageSelect("pt")}
              >
                PT
              </button>
            </div>
          </li>
        </ul>
      </nav>
    </header>
  );
}
