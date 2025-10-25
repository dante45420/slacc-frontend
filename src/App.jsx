import { Routes, Route } from "react-router-dom";
import PropTypes from "prop-types";
import Header from "./components/Header.jsx";
import Home from "./pages/Home.jsx";
import NewsList from "./pages/NewsList.jsx";
import NewsPage from "./pages/NewsPage.jsx";
import NewsDetail from "./pages/NewsDetail.jsx";
import EditNews from "./pages/EditNews.jsx";
import AdminNewsView from "./pages/AdminNewsView.jsx";
import CoursesPage from "./pages/CoursesPage.jsx";
import CourseDetail from "./pages/CourseDetail.jsx";
import Login from "./pages/Login.jsx";
import JoinMembership from "./pages/JoinMembership.jsx";
import SubmitNews from "./pages/SubmitNews.jsx";
import AdminPortal from "./pages/AdminPortal.jsx";
import AdminDashboard from "./pages/AdminDashboard.jsx";
import ApplicationDetail from "./pages/ApplicationDetail.jsx";
import NewsEditor from "./pages/NewsEditor.jsx";
import { AuthProvider } from "./auth/AuthContext.jsx";
import EventsPage from "./pages/EventsPage.jsx";
import AdminEvents from "./pages/AdminEvents.jsx";
import EventDetail from "./pages/EventDetail.jsx";
import AdminUserView from "./pages/AdminUserView.jsx";
import AdminUserEdit from "./pages/AdminUserEdit.jsx";
import AdminUserNew from "./pages/AdminUserNew.jsx";
import MembersBenefits from "./pages/MembersBenefits.jsx";
import MembersDirectory from "./pages/MembersDirectory.jsx";
import MembersYoung from "./pages/MembersYoung.jsx";
import MembersAllied from "./pages/MembersAllied.jsx";
import WhyJoin from "./pages/WhyJoin.jsx";
import Contact from "./pages/Contact.jsx";
import UserProfile from "./pages/UserProfile.jsx";

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
      <Header />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/noticias" element={<NewsList />} />
        <Route path="/noticias/comunicados" element={<NewsPage />} />
        <Route path="/noticias/prensa" element={<NewsPage />} />
        <Route path="/noticias/blog" element={<NewsPage />} />
        <Route path="/noticias/:id" element={<NewsDetail />} />
        <Route path="/admin/news/:id/edit" element={<EditNews />} />
        <Route path="/admin/news/:id/view" element={<AdminNewsView />} />
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
        <Route path="/miembros/sociedades-afines" element={<MembersAllied />} />
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
        <Route path="/educacion" element={<Placeholder title="Educación" />} />
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
        <Route path="/admin/applications/:id" element={<ApplicationDetail />} />
        <Route path="/admin/users/new" element={<AdminUserNew />} />
        <Route path="/admin/users/:id" element={<AdminUserView />} />
        <Route path="/admin/users/:id/edit" element={<AdminUserEdit />} />
        <Route path="/admin/news/new" element={<NewsEditor />} />
        <Route path="/admin/news/:id/edit" element={<NewsEditor />} />
        <Route path="/admin/news/:id/view" element={<AdminNewsView />} />
        <Route path="*" element={<Placeholder title="Página" />} />
      </Routes>
    </AuthProvider>
  );
}
