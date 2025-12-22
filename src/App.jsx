import { Routes, Route, Navigate } from "react-router-dom";
import PropTypes from "prop-types";
import Header from "./components/Header.jsx";
import { ProtectedRoute } from "./components/ProtectedRoute.jsx";

// Public pages
import Home from "./pages/public/Home.jsx";
import Contact from "./pages/public/Contact.jsx";
import Estatutos from "./pages/public/Estatutos.jsx";
import Comites from "./pages/public/Comites.jsx";
import NotFound from "./pages/public/NotFound.jsx";

// Auth pages
import Login from "./pages/auth/Login.jsx";
import UserProfile from "./pages/auth/UserProfile.jsx";

// News pages
import NewsList from "./pages/news/NewsList.jsx";
import NewsPage from "./pages/news/NewsPage.jsx";
import NewsDetail from "./pages/news/NewsDetail.jsx";
import NewsEditor from "./pages/news/NewsEditor.jsx";
import SubmitNews from "./pages/news/SubmitNews.jsx";

// Events pages
import EventsPage from "./pages/events/EventsPage.jsx";
import EventDetail from "./pages/events/EventDetail.jsx";

// Members pages
import JoinMembership from "./pages/members/JoinMembership.jsx";
import MembersBenefits from "./pages/members/MembersBenefits.jsx";
import MembersDirectory from "./pages/members/MembersDirectory.jsx";
import SociosActivos from "./pages/members/SociosActivos.jsx";
import WhyJoin from "./pages/members/WhyJoin.jsx";

// Admin pages
import AdminDashboard from "./pages/admin/AdminDashboard.jsx";
import AdminUserView from "./pages/admin/AdminUserView.jsx";
import AdminUserEdit from "./pages/admin/AdminUserEdit.jsx";
import AdminUserNew from "./pages/admin/AdminUserNew.jsx";
import ApplicationDetail from "./pages/admin/ApplicationDetail.jsx";

import { AuthProvider } from "./auth/AuthContext.jsx";
import { ToastProvider } from "./components/ui";

function Placeholder({ title }) {
  return (
    <div className="container section">
      <h2>{title}</h2>
      <p>Hello world</p>
    </div>
  );
}

Placeholder.propTypes = {
  title: PropTypes.string.isRequired,
};

export default function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <Header />
        <main>
          <Routes>
            <Route path="/" element={<Home />} />
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
              element={<Navigate to="/noticias/articulos-destacados" replace />}
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
            <Route
              path="/nosotros"
              element={<Placeholder title="Nosotros" />}
            />
            <Route
              path="/nosotros/historia"
              element={<Placeholder title="Nosotros - Historia" />}
            />
            <Route path="/nosotros/mision" element={<Estatutos />} />
            <Route path="/comites" element={<Comites />} />
            <Route path="/miembros" element={<MembersBenefits />} />
            <Route path="/miembros/beneficios" element={<MembersBenefits />} />
            <Route path="/miembros/como-unirse" element={<WhyJoin />} />
            <Route path="/miembros/directorio" element={<MembersDirectory />} />
            <Route
              path="/miembros/socios-activos"
              element={<SociosActivos />}
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
        </main>
      </ToastProvider>
    </AuthProvider>
  );
}
