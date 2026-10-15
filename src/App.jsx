import { lazy, Suspense, useEffect, useRef } from "react";
import {
  Routes,
  Route,
  Navigate,
  useLocation,
  useNavigationType,
} from "react-router-dom";
import { useTranslation } from "react-i18next";
import Header from "./components/Header.jsx";
import Footer from "./components/Footer.jsx";
import ErrorBoundary from "./components/ErrorBoundary.jsx";
import { ProtectedRoute } from "./components/ProtectedRoute.jsx";

// Public pages
const Home = lazy(() => import("./pages/public/Home.jsx"));
const Contact = lazy(() => import("./pages/public/Contact.jsx"));
const Estatutos = lazy(() => import("./pages/public/Estatutos.jsx"));
const EstatutosDocumento = lazy(
  () => import("./pages/public/EstatutosDocumento.jsx"),
);
const Comites = lazy(() => import("./pages/public/Comites.jsx"));
const Historia = lazy(() => import("./pages/public/Historia.jsx"));
const Directiva = lazy(() => import("./pages/public/Directiva.jsx"));
const Educacion = lazy(() => import("./pages/public/Educacion.jsx"));
const InternationalEN = lazy(
  () => import("./pages/public/InternationalEN.jsx"),
);
const InternationalPT = lazy(
  () => import("./pages/public/InternationalPT.jsx"),
);
const NotFound = lazy(() => import("./pages/public/NotFound.jsx"));

// Auth pages
const Login = lazy(() => import("./pages/auth/Login.jsx"));
const UserProfile = lazy(() => import("./pages/auth/UserProfile.jsx"));

// News pages
const NewsPage = lazy(() => import("./pages/news/NewsPage.jsx"));
const NewsDetail = lazy(() => import("./pages/news/NewsDetail.jsx"));
const NewsEditor = lazy(() => import("./pages/news/NewsEditor.jsx"));
const SubmitNews = lazy(() => import("./pages/news/SubmitNews.jsx"));

// Events pages
const EventsPage = lazy(() => import("./pages/events/EventsPage.jsx"));
const EventDetail = lazy(() => import("./pages/events/EventDetail.jsx"));

// Members pages
const JoinMembership = lazy(() => import("./pages/members/JoinMembership.jsx"));
const MembersBenefits = lazy(
  () => import("./pages/members/MembersBenefits.jsx"),
);
const SociosActivos = lazy(() => import("./pages/members/SociosActivos.jsx"));
const WhyJoin = lazy(() => import("./pages/members/WhyJoin.jsx"));
const MemberPortal = lazy(() => import("./pages/members/MemberPortal.jsx"));

// Admin pages
const AdminDashboard = lazy(() => import("./pages/admin/AdminDashboard.jsx"));
const AdminUserView = lazy(() => import("./pages/admin/AdminUserView.jsx"));
const AdminUserEdit = lazy(() => import("./pages/admin/AdminUserEdit.jsx"));
const ApplicationDetail = lazy(
  () => import("./pages/admin/ApplicationDetail.jsx"),
);

import { AuthProvider } from "./auth/AuthContext.jsx";
import { ToastProvider, Spinner } from "./components/ui";

// Default <title> per section; detail pages refine it with useDocumentTitle().
const ROUTE_TITLES = [
  ["/nosotros/directiva", "header.board"],
  ["/nosotros/historia", "header.history"],
  ["/nosotros/estatutos", "header.statutes"],
  ["/nosotros", "header.society"],
  ["/comites", "header.committees"],
  ["/educacion", "header.education"],
  ["/eventos", "header.events"],
  ["/cursos", "header.events"],
  ["/noticias", "header.news"],
  ["/subir-noticia", "header.submit_article"],
  ["/miembros/socios-activos", "header.active_members"],
  ["/miembros", "header.members"],
  ["/por-que-ser-socio", "header.benefits"],
  ["/portal-socios", "header.private_portal"],
  ["/solicitar-membresia", "header.request_membership"],
  ["/contacto", "header.contact"],
  ["/login", "header.login"],
  ["/perfil", "header.profile"],
  ["/admin", "header.admin"],
];

// Scroll offset per history entry, so Back/Forward returns to where you were.
const scrollPositions = new Map();

if (typeof window !== "undefined" && "scrollRestoration" in window.history) {
  window.history.scrollRestoration = "manual";
}

/** Runs fn every frame until it returns true or ~2s pass (lazy pages and data). */
function retryFrames(fn, maxFrames = 120) {
  let frame = 0;
  let tries = 0;
  const tick = () => {
    if (fn(tries >= maxFrames) || tries++ >= maxFrames) return;
    frame = requestAnimationFrame(tick);
  };
  tick();
  return () => cancelAnimationFrame(frame);
}

/**
 * Navigation side effects: scroll (top, #hash, or the saved offset on Back),
 * move focus to the new page, and set the section title / meta description.
 */
function RouteEffects() {
  const { pathname, hash, key } = useLocation();
  const navigationType = useNavigationType();
  const { t, i18n } = useTranslation();
  const isFirstRender = useRef(true);

  useEffect(() => {
    // history.state.key changes as soon as a navigation starts, before React
    // renders the next page; ignore scroll events from then on (the browser
    // clamps the offset while the next page is shorter).
    const save = () => {
      const current = window.history.state?.key ?? "default";
      if (current === key) scrollPositions.set(key, window.scrollY);
    };
    window.addEventListener("scroll", save, { passive: true });
    return () => window.removeEventListener("scroll", save);
  }, [key]);

  useEffect(() => {
    const first = isFirstRender.current;
    isFirstRender.current = false;
    const instant = top => window.scrollTo({ top, left: 0, behavior: "instant" });

    if (hash) {
      const id = decodeURIComponent(hash.slice(1));
      return retryFrames(giveUp => {
        const el = document.getElementById(id);
        if (el) {
          el.scrollIntoView({ behavior: "instant" });
          return true;
        }
        if (giveUp) instant(0);
        return false;
      });
    }

    if (navigationType === "POP" && !first && scrollPositions.has(key)) {
      const y = scrollPositions.get(key);
      return retryFrames(giveUp => {
        const reachable =
          document.documentElement.scrollHeight - window.innerHeight >= y - 1;
        if (reachable || giveUp) {
          instant(y);
          return true;
        }
        return false;
      });
    }

    instant(0);

    // Move keyboard/screen-reader focus to the new page (unless the page
    // already focused something itself, e.g. an autofocus field).
    if (!first) {
      const active = document.activeElement;
      const main = document.getElementById("main-content");
      if (main && (!active || active === document.body || !main.contains(active))) {
        main.focus({ preventScroll: true });
      }
    }
    return undefined;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname, hash, key]);

  useEffect(() => {
    const match = ROUTE_TITLES.find(
      ([prefix]) => pathname === prefix || pathname.startsWith(`${prefix}/`),
    );
    document.title = match ? `${t(match[1])} · SLACC` : "SLACC";
  }, [pathname, t, i18n.language]);

  useEffect(() => {
    const meta = document.querySelector('meta[name="description"]');
    if (meta) meta.setAttribute("content", t("meta.description"));
  }, [t, i18n.language]);

  return null;
}

export default function App() {
  const { pathname } = useLocation();

  return (
    <AuthProvider>
      <ToastProvider>
        <RouteEffects />
        <Header />
        <main id="main-content" tabIndex={-1}>
          <ErrorBoundary resetKey={pathname}>
          <Suspense
            fallback={
              <div className="page-loading">
                <Spinner size="lg" />
              </div>
            }
          >
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/en" element={<InternationalEN />} />
              <Route path="/pt" element={<InternationalPT />} />
              <Route
                path="/en/congress"
                element={<Navigate to="/eventos/proximos" replace />}
              />
              <Route
                path="/pt/congresso"
                element={<Navigate to="/eventos/proximos" replace />}
              />
              <Route path="/noticias" element={<NewsPage />} />
              <Route
                path="/noticias/articulos-cientificos"
                element={<NewsPage />}
              />
              <Route
                path="/noticias/articulos-destacados"
                element={<NewsPage />}
              />
              <Route path="/noticias/editoriales" element={<NewsPage />} />
              {/* Legacy category URLs (redirects) */}
              <Route
                path="/noticias/blog"
                element={
                  <Navigate to="/noticias/articulos-cientificos" replace />
                }
              />
              <Route
                path="/noticias/comunicados"
                element={
                  <Navigate to="/noticias/articulos-destacados" replace />
                }
              />
              <Route
                path="/noticias/prensa"
                element={<Navigate to="/noticias/editoriales" replace />}
              />
              <Route path="/noticias/:id" element={<NewsDetail />} />
              <Route path="/eventos" element={<EventsPage />} />
              <Route path="/eventos/pasados" element={<EventsPage />} />
              <Route path="/eventos/proximos" element={<EventsPage />} />
              <Route path="/eventos/webinars" element={<EventsPage />} />
              <Route path="/eventos/:id" element={<EventDetail />} />
              <Route path="/cursos" element={<EventsPage />} />
              <Route path="/cursos/:id" element={<EventDetail />} />
              <Route path="/nosotros" element={<Estatutos />} />
              <Route path="/nosotros/historia" element={<Historia />} />
              <Route path="/nosotros/directiva" element={<Directiva />} />
              <Route
                path="/nosotros/estatutos"
                element={<EstatutosDocumento />}
              />
              <Route path="/nosotros/mision" element={<Estatutos />} />
              <Route path="/comites" element={<Comites />} />
              <Route path="/educacion" element={<Educacion />} />
              <Route
                path="/educacion/aval-certificacion"
                element={<Educacion />}
              />
              <Route path="/educacion/becas" element={<Educacion />} />
              <Route path="/educacion/videoteca" element={<Educacion />} />
              <Route
                path="/programa-de-becas"
                element={<Navigate to="/educacion/becas" replace />}
              />
              <Route path="/miembros" element={<MembersBenefits />} />
              <Route
                path="/miembros/beneficios"
                element={<Navigate to="/por-que-ser-socio" replace />}
              />
              <Route
                path="/miembros/socios-activos"
                element={<SociosActivos />}
              />
              <Route
                path="/portal-socios"
                element={
                  <ProtectedRoute requirePaid>
                    <MemberPortal />
                  </ProtectedRoute>
                }
              />
              <Route path="/por-que-ser-socio" element={<WhyJoin />} />
              <Route path="/contacto" element={<Contact />} />
              <Route path="/login" element={<Login />} />
              <Route path="/perfil" element={<UserProfile />} />
              <Route path="/solicitar-membresia" element={<JoinMembership />} />
              <Route
                path="/subir-noticia"
                element={
                  <ProtectedRoute>
                    <SubmitNews />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin"
                element={
                  <ProtectedRoute requireAdmin>
                    <AdminDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/applications/:id"
                element={
                  <ProtectedRoute requireAdmin>
                    <ApplicationDetail />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/users/new"
                element={<Navigate to="/admin?tab=users" replace />}
              />
              <Route
                path="/admin/users/:id"
                element={
                  <ProtectedRoute requireAdmin>
                    <AdminUserView />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/users/:id/edit"
                element={
                  <ProtectedRoute requireAdmin>
                    <AdminUserEdit />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/news/new"
                element={
                  <ProtectedRoute requireAdmin>
                    <NewsEditor />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/news/:id/edit"
                element={
                  <ProtectedRoute requireAdmin>
                    <NewsEditor />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/news/:id/view"
                element={
                  <ProtectedRoute requireAdmin>
                    <NewsDetail />
                  </ProtectedRoute>
                }
              />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
          </ErrorBoundary>
        </main>
        <Footer />
      </ToastProvider>
    </AuthProvider>
  );
}
