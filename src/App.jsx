import { lazy, Suspense } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Header from "./components/Header.jsx";
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
const NewsList = lazy(() => import("./pages/news/NewsList.jsx"));
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
const AdminUserNew = lazy(() => import("./pages/admin/AdminUserNew.jsx"));
const ApplicationDetail = lazy(
  () => import("./pages/admin/ApplicationDetail.jsx"),
);

import { AuthProvider } from "./auth/AuthContext.jsx";
import { ToastProvider, Spinner } from "./components/ui";

export default function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <Header />
        <main>
          <Suspense
            fallback={
              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  padding: "4rem",
                }}
              >
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
              <Route path="/noticias" element={<NewsList />} />
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
                element={<MembersBenefits />}
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
                element={
                  <ProtectedRoute requireAdmin>
                    <AdminUserNew />
                  </ProtectedRoute>
                }
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
        </main>
      </ToastProvider>
    </AuthProvider>
  );
}
