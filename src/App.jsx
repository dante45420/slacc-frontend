import { Routes, Route } from "react-router-dom";
import PropTypes from "prop-types";
import Header from "./components/Header.jsx";

// Public pages
import Home from "./pages/public/Home.jsx";
import Contact from "./pages/public/Contact.jsx";

// Auth pages
import Login from "./pages/auth/Login.jsx";
import UserProfile from "./pages/auth/UserProfile.jsx";

// News pages
import NewsList from "./pages/news/NewsList.jsx";
import NewsPage from "./pages/news/NewsPage.jsx";
import NewsDetail from "./pages/news/NewsDetail.jsx";
import EditNews from "./pages/news/EditNews.jsx";
import NewsEditor from "./pages/news/NewsEditor.jsx";
import SubmitNews from "./pages/news/SubmitNews.jsx";

// Courses & Events pages
import CoursesPage from "./pages/courses/CoursesPage.jsx";
import CourseDetail from "./pages/courses/CourseDetail.jsx";
import EventsPage from "./pages/courses/EventsPage.jsx";
import EventDetail from "./pages/courses/EventDetail.jsx";

// Members pages
import JoinMembership from "./pages/members/JoinMembership.jsx";
import MembersBenefits from "./pages/members/MembersBenefits.jsx";
import MembersDirectory from "./pages/members/MembersDirectory.jsx";
import MembersYoung from "./pages/members/MembersYoung.jsx";
import MembersAllied from "./pages/members/MembersAllied.jsx";
import WhyJoin from "./pages/members/WhyJoin.jsx";

// Admin pages
import AdminPortal from "./pages/admin/AdminPortal.jsx";
import AdminDashboard from "./pages/admin/AdminDashboard.jsx";
import AdminEvents from "./pages/admin/AdminEvents.jsx";
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
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/noticias" element={<NewsList />} />
          <Route path="/noticias/comunicados" element={<NewsPage />} />
          <Route path="/noticias/prensa" element={<NewsPage />} />
          <Route path="/noticias/blog" element={<NewsPage />} />
          <Route path="/noticias/:id" element={<NewsDetail />} />
          <Route path="/admin/news/:id/edit" element={<EditNews />} />
          <Route path="/admin/news/:id/view" element={<NewsDetail />} />
          <Route path="/cursos" element={<CoursesPage />} />
          <Route path="/cursos/:id" element={<CourseDetail />} />
          <Route path="/eventos/proximos" element={<EventsPage />} />
          <Route path="/eventos/webinars" element={<EventsPage />} />
          <Route path="/eventos/pasados" element={<EventsPage />} />
          <Route path="/eventos/:id" element={<EventDetail />} />
          <Route path="/admin/eventos" element={<AdminEvents />} />
          <Route path="/nosotros" element={<Placeholder title="Nosotros" />} />
          <Route
            path="/nosotros/historia"
            element={<Placeholder title="Nosotros - Historia" />}
          />
          <Route
            path="/nosotros/mision"
            element={<Placeholder title="Nosotros - Misión y Visión" />}
          />
          <Route
            path="/nosotros/comite"
            element={<Placeholder title="Nosotros - Comité" />}
          />
          <Route path="/miembros" element={<MembersBenefits />} />
          <Route path="/miembros/beneficios" element={<MembersBenefits />} />
          <Route path="/miembros/como-unirse" element={<WhyJoin />} />
          <Route path="/miembros/directorio" element={<MembersDirectory />} />
          <Route path="/miembros/socios-jovenes" element={<MembersYoung />} />
          <Route
            path="/miembros/sociedades-afines"
            element={<MembersAllied />}
          />
          <Route path="/por-que-ser-socio" element={<WhyJoin />} />
          <Route path="/contacto" element={<Contact />} />
          <Route path="/eventos" element={<Placeholder title="Eventos" />} />
          <Route
            path="/eventos/proximos"
            element={<Placeholder title="Eventos - Próximos" />}
          />
          <Route
            path="/eventos/pasados"
            element={<Placeholder title="Eventos - Pasados" />}
          />
          <Route
            path="/eventos/webinars"
            element={<Placeholder title="Eventos - Webinars" />}
          />
          <Route
            path="/educacion"
            element={<Placeholder title="Educación" />}
          />
          <Route
            path="/educacion/recursos"
            element={<Placeholder title="Educación - Recursos" />}
          />
          <Route
            path="/educacion/biblioteca"
            element={<Placeholder title="Educación - Biblioteca" />}
          />
          <Route
            path="/educacion/casos"
            element={<Placeholder title="Educación - Casos" />}
          />
          <Route path="/login" element={<Login />} />
          <Route path="/perfil" element={<UserProfile />} />
          <Route path="/solicitar-membresia" element={<JoinMembership />} />
          <Route path="/subir-noticia" element={<SubmitNews />} />
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/admin/legacy" element={<AdminPortal />} />
          <Route
            path="/admin/applications/:id"
            element={<ApplicationDetail />}
          />
          <Route path="/admin/users/new" element={<AdminUserNew />} />
          <Route path="/admin/users/:id" element={<AdminUserView />} />
          <Route path="/admin/users/:id/edit" element={<AdminUserEdit />} />
          <Route path="/admin/news/new" element={<NewsEditor />} />
          <Route path="/admin/news/:id/edit" element={<NewsEditor />} />
          <Route path="/admin/news/:id/view" element={<NewsDetail />} />
          <Route path="*" element={<Placeholder title="Página" />} />
        </Routes>
      </ToastProvider>
    </AuthProvider>
  );
}
