import { Link, NavLink, useLocation } from "react-router-dom";
import PropTypes from "prop-types";
import { useCallback, useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { useAuth } from "../auth/AuthContext.jsx";
import useMediaQuery from "../hooks/useMediaQuery.js";
import { SUPPORTED_LANGUAGES, currentLanguage } from "../i18n";

// Keep in sync with the drawer breakpoint in src/styles/layout.css
const DRAWER_QUERY = "(max-width: 1099.98px)";

const LANGUAGE_NAMES = { es: "Español", en: "English", pt: "Português" };

function isSectionActive(pathname, prefixes) {
  return prefixes.some(p => pathname === p || pathname.startsWith(`${p}/`));
}

function NavItem({ id, label, to, match, children, openId, setOpenId, onNavigate, closeOnBlur }) {
  const { pathname } = useLocation();
  const hasSubmenu = Boolean(children);
  const isOpen = openId === id;
  const active = isSectionActive(pathname, match || [to]);
  const submenuId = `submenu-${id}`;

  return (
    <li
      className={`menu-item${hasSubmenu ? " has-submenu" : ""}${
        isOpen ? " submenu-open" : ""
      }`}
      onMouseLeave={() => {
        if (isOpen && globalThis.matchMedia?.("(hover: hover)").matches) {
          setOpenId(null);
        }
      }}
      onBlur={e => {
        if (closeOnBlur && isOpen && !e.currentTarget.contains(e.relatedTarget)) {
          setOpenId(null);
        }
      }}
    >
      <div className="menu-row">
        <Link
          to={to}
          className={`menu-link${active ? " active" : ""}`}
          aria-current={pathname === to ? "page" : undefined}
          onClick={onNavigate}
        >
          {label}
        </Link>
        {hasSubmenu && (
          <button
            type="button"
            className="submenu-toggle"
            aria-expanded={isOpen}
            aria-controls={submenuId}
            aria-label={label}
            onClick={() => setOpenId(isOpen ? null : id)}
          >
            <i className="fa-solid fa-chevron-down" aria-hidden="true"></i>
          </button>
        )}
      </div>
      {hasSubmenu && (
        <div className="submenu" id={submenuId}>
          {children}
        </div>
      )}
    </li>
  );
}

NavItem.propTypes = {
  id: PropTypes.string.isRequired,
  label: PropTypes.string.isRequired,
  to: PropTypes.string.isRequired,
  match: PropTypes.arrayOf(PropTypes.string),
  children: PropTypes.node,
  openId: PropTypes.string,
  setOpenId: PropTypes.func.isRequired,
  onNavigate: PropTypes.func.isRequired,
  closeOnBlur: PropTypes.bool,
};

function SubLink({ to, label, onNavigate }) {
  return (
    <NavLink to={to} end onClick={onNavigate}>
      {label}
    </NavLink>
  );
}

SubLink.propTypes = {
  to: PropTypes.string.isRequired,
  label: PropTypes.string.isRequired,
  onNavigate: PropTypes.func.isRequired,
};

export default function Header() {
  const { user, logout } = useAuth();
  const { t, i18n } = useTranslation();
  const location = useLocation();
  const isDrawer = useMediaQuery(DRAWER_QUERY);
  const lang = currentLanguage(i18n);
  const authReady = user !== undefined; // undefined while /me is loading

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [openId, setOpenId] = useState(null); // open nav submenu or header dropdown
  const [scrolled, setScrolled] = useState(false);
  const headerRef = useRef(null);
  const hamburgerRef = useRef(null);
  const drawerRef = useRef(null);

  const closeAll = useCallback(() => {
    setDrawerOpen(false);
    setOpenId(null);
  }, []);

  // Close menus on navigation
  useEffect(() => {
    closeAll();
  }, [location.pathname, closeAll]);

  // Leaving the drawer breakpoint closes the drawer
  useEffect(() => {
    if (!isDrawer) setDrawerOpen(false);
    setOpenId(null);
  }, [isDrawer]);

  // Shadow once the page is scrolled
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 4);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Lock page scroll while the drawer is open
  useEffect(() => {
    if (!drawerOpen) return undefined;
    const { overflow } = document.body.style;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = overflow;
    };
  }, [drawerOpen]);

  // Move focus into the drawer when it opens, back to the trigger when it closes
  const wasOpen = useRef(false);
  useEffect(() => {
    if (drawerOpen) {
      drawerRef.current?.querySelector(".drawer-close")?.focus({ preventScroll: true });
    } else if (wasOpen.current) {
      hamburgerRef.current?.focus({ preventScroll: true });
    }
    wasOpen.current = drawerOpen;
  }, [drawerOpen]);

  // Escape closes; clicking outside closes desktop dropdowns
  useEffect(() => {
    const onKey = e => {
      if (e.key === "Escape") {
        if (!drawerOpen && openId) {
          headerRef.current
            ?.querySelector('[aria-expanded="true"]')
            ?.focus({ preventScroll: true });
        }
        closeAll();
        return;
      }
      if (e.key === "Tab" && drawerOpen && drawerRef.current) {
        const items = [
          ...drawerRef.current.querySelectorAll(
            'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])',
          ),
        ].filter(el => el.offsetParent !== null);
        if (items.length === 0) return;
        const first = items[0];
        const last = items[items.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && (document.activeElement === last || !drawerRef.current.contains(document.activeElement))) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    const onPointer = e => {
      if (!isDrawer && openId && headerRef.current && !headerRef.current.contains(e.target)) {
        setOpenId(null);
      }
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("pointerdown", onPointer);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("pointerdown", onPointer);
    };
  }, [closeAll, isDrawer, openId, drawerOpen]);

  const changeLanguage = code => {
    i18n.changeLanguage(code);
    setOpenId(null);
  };

  const handleLogout = () => {
    logout();
    closeAll();
  };

  const navProps = { openId, setOpenId, onNavigate: closeAll, closeOnBlur: !isDrawer };

  return (
    <header
      className={`site-header${scrolled ? " is-scrolled" : ""}`}
      id="site-header"
      ref={headerRef}
    >
      <a className="skip-link" href="#main-content">
        {t("header.skip_to_content", "Saltar al contenido")}
      </a>
      <div className="nav">
        <Link to="/" className="brand" aria-label={t("header.home_label", "SLACC — Inicio")}>
          <img
            src="/LOGO SLACC_ROJO_HORIZONTAL.png"
            alt={t("header.logo_alt", "Logo de SLACC")}
            className="logo-image header-logo-image"
            width="149"
            height="60"
          />
        </Link>

        <button
          type="button"
          className={`menu-backdrop${drawerOpen ? " is-open" : ""}`}
          aria-hidden="true"
          tabIndex={-1}
          onClick={closeAll}
        />

        <nav
          className={`primary-nav${drawerOpen ? " is-open" : ""}`}
          aria-label={t("header.main_navigation", "Navegación principal")}
          ref={drawerRef}
          {...(isDrawer && !drawerOpen ? { inert: "" } : {})}
        >
          <div className="drawer-head">
            <img
              src="/LOGO SLACC_ROJO_HORIZONTAL.png"
              alt=""
              className="logo-image"
              width="90"
              height="36"
            />
            <button
              type="button"
              className="drawer-close"
              aria-label={t("common.close", "Cerrar")}
              onClick={closeAll}
            >
              <i className="fa-solid fa-xmark" aria-hidden="true"></i>
            </button>
          </div>

          <ul className="menu" id="primary-menu">
            {user?.role === "admin" && (
              <NavItem id="admin" label={t("header.admin", "Admin")} to="/admin" {...navProps} />
            )}
            <NavItem
              id="society"
              label={t("header.society", "La Sociedad")}
              to="/nosotros"
              match={["/nosotros", "/comites"]}
              {...navProps}
            >
              <SubLink to="/nosotros/mision" label={t("header.mission", "Misión, Visión y Valores")} onNavigate={closeAll} />
              <SubLink to="/nosotros/directiva" label={t("header.board", "Mesa Directiva")} onNavigate={closeAll} />
              <SubLink to="/nosotros/historia" label={t("header.history", "Historia")} onNavigate={closeAll} />
              <SubLink to="/nosotros/estatutos" label={t("header.statutes", "Estatutos")} onNavigate={closeAll} />
              <SubLink to="/comites" label={t("header.committees", "Comités")} onNavigate={closeAll} />
            </NavItem>
            <NavItem
              id="education"
              label={t("header.education", "Educación")}
              to="/educacion"
              {...navProps}
            >
              <SubLink to="/educacion/aval-certificacion" label={t("header.certification", "Aval y Certificación")} onNavigate={closeAll} />
              <SubLink to="/educacion/becas" label={t("header.scholarships", "Becas y Pasantías")} onNavigate={closeAll} />
              <SubLink to="/educacion/videoteca" label={t("header.virtual_classroom", "Aula Virtual")} onNavigate={closeAll} />
            </NavItem>
            <NavItem
              id="events"
              label={t("header.events", "Eventos")}
              to="/eventos"
              match={["/eventos", "/cursos"]}
              {...navProps}
            >
              <SubLink to="/eventos/proximos" label={t("header.upcoming_events", "Próximos")} onNavigate={closeAll} />
              <SubLink to="/eventos/pasados" label={t("header.past_events", "Pasados")} onNavigate={closeAll} />
              <SubLink to="/eventos/webinars" label={t("header.webinars", "Webinars")} onNavigate={closeAll} />
              <SubLink to="/cursos" label={t("events.filter_courses", "Cursos y talleres")} onNavigate={closeAll} />
              <SubLink to="/eventos" label={t("header.all_events", "Todos")} onNavigate={closeAll} />
            </NavItem>
            <NavItem
              id="members"
              label={t("header.members", "Miembros")}
              to="/miembros"
              match={["/miembros", "/por-que-ser-socio", "/solicitar-membresia", "/portal-socios"]}
              {...navProps}
            >
              <SubLink to="/por-que-ser-socio" label={t("header.benefits", "Beneficios")} onNavigate={closeAll} />
              <SubLink to="/miembros/socios-activos" label={t("header.active_members", "Socios Activos")} onNavigate={closeAll} />
              <SubLink to="/solicitar-membresia" label={t("header.request_membership", "Solicitar membresía")} onNavigate={closeAll} />
            </NavItem>
            <NavItem
              id="news"
              label={t("header.news", "Noticias")}
              to="/noticias"
              match={["/noticias", "/subir-noticia"]}
              {...navProps}
            >
              <SubLink to="/noticias/articulos-cientificos" label={t("header.scientific_articles", "Artículos científicos")} onNavigate={closeAll} />
              <SubLink to="/noticias/articulos-destacados" label={t("header.featured_articles", "Artículos destacados")} onNavigate={closeAll} />
              <SubLink to="/noticias/editoriales" label={t("header.editorials", "Editoriales")} onNavigate={closeAll} />
              {user && (
                <SubLink to="/subir-noticia" label={t("header.submit_article", "Enviar artículo")} onNavigate={closeAll} />
              )}
            </NavItem>
            <NavItem id="contact" label={t("header.contact", "Contacto")} to="/contacto" {...navProps} />
          </ul>

          <div className="drawer-foot">
            <div className="drawer-account" aria-busy={!authReady}>
              {!authReady ? null : user ? (
                <>
                  <p className="drawer-user">
                    <strong>{user.name || user.email}</strong>
                  </p>
                  <Link to="/perfil" className="btn btn-outline" onClick={closeAll}>
                    {t("header.profile", "Mi perfil")}
                  </Link>
                  <button type="button" className="btn btn-ghost" onClick={handleLogout}>
                    {t("header.logout", "Cerrar sesión")}
                  </button>
                </>
              ) : (
                <>
                  <Link to="/login" className="btn btn-outline" onClick={closeAll}>
                    {t("header.login", "Iniciar sesión")}
                  </Link>
                  <Link to="/solicitar-membresia" className="btn btn-accent" onClick={closeAll}>
                    {t("header.join", "Hazte socio")}
                  </Link>
                </>
              )}
            </div>
            <div
              className="drawer-lang"
              role="group"
              aria-label={t("header.select_language", "Seleccionar idioma")}
            >
              <span className="drawer-lang-label">
                <i className="fa-solid fa-earth-americas" aria-hidden="true"></i>{" "}
                {LANGUAGE_NAMES[lang]}
              </span>
              {SUPPORTED_LANGUAGES.map(code => (
                <button
                  key={code}
                  type="button"
                  aria-current={lang === code ? "true" : undefined}
                  aria-label={LANGUAGE_NAMES[code]}
                  onClick={() => changeLanguage(code)}
                >
                  {code.toUpperCase()}
                </button>
              ))}
            </div>
          </div>
        </nav>

        <div className="header-actions">
          <div
            className={`header-dropdown${openId === "lang" ? " submenu-open" : ""}`}
            onBlur={e => {
              if (openId === "lang" && !e.currentTarget.contains(e.relatedTarget)) setOpenId(null);
            }}
          >
            <button
              type="button"
              className="header-icon-btn"
              aria-haspopup="true"
              aria-expanded={openId === "lang"}
              aria-controls="language-menu"
              aria-label={t("header.select_language", "Seleccionar idioma")}
              onClick={() => setOpenId(openId === "lang" ? null : "lang")}
            >
              <i className="fa-solid fa-earth-americas" aria-hidden="true"></i>
              <span>{lang.toUpperCase()}</span>
              <i className="fa-solid fa-chevron-down" aria-hidden="true"></i>
            </button>
            <div className="submenu language-submenu" id="language-menu">
              {SUPPORTED_LANGUAGES.map(code => (
                <button
                  key={code}
                  type="button"
                  className="language-option"
                  aria-current={lang === code ? "true" : undefined}
                  onClick={() => changeLanguage(code)}
                >
                  <span className="lang-code">{code.toUpperCase()}</span>
                  {LANGUAGE_NAMES[code]}
                </button>
              ))}
            </div>
          </div>

          <div
            className={`header-dropdown user-menu${openId === "account" ? " submenu-open" : ""}`}
            onBlur={e => {
              if (openId === "account" && !e.currentTarget.contains(e.relatedTarget)) setOpenId(null);
            }}
          >
            <button
              type="button"
              className="header-icon-btn"
              aria-haspopup="true"
              aria-expanded={openId === "account"}
              aria-controls="account-menu"
              aria-label={user ? t("header.profile", "Mi perfil") : t("header.login", "Iniciar sesión")}
              onClick={() => setOpenId(openId === "account" ? null : "account")}
            >
              <i className="fa-regular fa-circle-user" aria-hidden="true"></i>
              <i className="fa-solid fa-chevron-down" aria-hidden="true"></i>
            </button>
            <div className="submenu" id="account-menu">
              {user ? (
                <>
                  <div className="submenu-meta">
                    <strong>{user.name || user.email}</strong>
                    {user.name ? user.email : null}
                  </div>
                  <Link to="/perfil" onClick={closeAll}>
                    {t("header.profile", "Mi perfil")}
                  </Link>
                  {user.role === "admin" && (
                    <Link to="/admin" onClick={closeAll}>
                      {t("header.admin", "Admin")}
                    </Link>
                  )}
                  <button type="button" onClick={handleLogout}>
                    {t("header.logout", "Cerrar sesión")}
                  </button>
                </>
              ) : (
                <>
                  <Link to="/login" onClick={closeAll}>
                    {t("header.login", "Iniciar sesión")}
                  </Link>
                  <Link to="/solicitar-membresia" onClick={closeAll}>
                    {t("header.request_membership", "Solicitar membresía")}
                  </Link>
                </>
              )}
            </div>
          </div>

          {user === null && (
            <Link to="/solicitar-membresia" className="btn btn-accent btn-sm header-cta">
              {t("header.join", "Hazte socio")}
            </Link>
          )}

          <button
            type="button"
            ref={hamburgerRef}
            className="hamburger-menu"
            onClick={() => setDrawerOpen(true)}
            aria-label={t("header.open_menu", "Abrir menú")}
            aria-expanded={drawerOpen}
            aria-controls="primary-menu"
          >
            <i className="fa-solid fa-bars" aria-hidden="true"></i>
          </button>
        </div>
      </div>
    </header>
  );
}
