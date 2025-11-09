import { Link } from "react-router-dom";
import PropTypes from "prop-types";

export default function WhyJoin() {
  return (
    <section className="section">
      <div className="container">
        <h1 className="members-header">¿Por qué ser socio de SLACC?</h1>
        <p className="members-subtitle-with-large-spacing">
          Una red de excelencia clínica en cirugía de cadera en Latinoamérica.
        </p>

        {/* Tiles de beneficios (mismo look & feel que la sección de Beneficios) */}
        <div className="cards members-cards-with-bottom">
          <Tile
            icon={<i className="fa-solid fa-user-graduate"></i>}
            title="Formación acreditada"
            desc="Cursos y webinars con docentes expertos y contenido curado."
          />
          <Tile
            icon={<i className="fa-solid fa-users"></i>}
            title="Red profesional"
            desc="Colabora con especialistas de la región y accede a comités."
          />
          <Tile
            icon={<i className="fa-solid fa-shield-halved"></i>}
            title="Respaldo institucional"
            desc="Incrementa la confianza de tus pacientes y colegas."
          />
          <Tile
            icon={<i className="fa-solid fa-trophy"></i>}
            title="Impacto profesional"
            desc="Presenta casos, publica y participa en líneas de investigación."
          />
          <Tile
            icon={<i className="fa-solid fa-address-book"></i>}
            title="Visibilidad"
            desc="Perfil en el directorio y difusión de actividades académicas."
          />
          <Tile
            icon={<i className="fa-solid fa-chart-line"></i>}
            title="Desarrollo continuo"
            desc="Ruta de aprendizaje con actividades y talleres escalonados."
          />
        </div>

        <h2 className="members-section-title">Categorías de membresía</h2>
        <div className="cards">
          <div className="card">
            <h3 className="tile-title">Socio Joven</h3>
            <p className="tile-desc">
              Recién egresado (hasta 5 años). Cuota anual reducida y cupos
              especiales en cursos.
            </p>
          </div>
          <div className="card">
            <h3 className="tile-title">Socio Normal</h3>
            <p className="tile-desc">
              Profesional con experiencia. Acceso completo a beneficios y
              participación académica.
            </p>
          </div>
        </div>

        <div className="members-cta">
          <Link
            to="/solicitar-membresia"
            className="btn btn-primary members-cta-spacing"
          >
            Solicitar membresía
          </Link>
          <Link to="/miembros/beneficios" className="btn btn-outline">
            Ver todos los beneficios
          </Link>
        </div>
      </div>
    </section>
  );
}

function Tile({ icon, title, desc }) {
  return (
    <div className="card">
      <div className="icon-tile-container">
        <div className="icon-tile-icon">{icon}</div>
      </div>
      <h3 className="tile-title">{title}</h3>
      <p className="tile-desc">{desc}</p>
    </div>
  );
}

Tile.propTypes = {
  icon: PropTypes.node.isRequired,
  title: PropTypes.string.isRequired,
  desc: PropTypes.string.isRequired,
};
