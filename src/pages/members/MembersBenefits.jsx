import { Link } from "react-router-dom";
import PropTypes from "prop-types";

export default function MembersBenefits() {
  return (
    <section className="section">
      <div className="container">
        <h1 className="members-header">Beneficios para Miembros</h1>
        <p className="members-subtitle">
          Ventajas pensadas para especialistas en cadera, con foco clínico y
          académico.
        </p>

        <div className="cards members-cards">
          <Tile
            icon={<i className="fa-solid fa-stethoscope"></i>}
            title="Práctica clínica destacada"
            desc="Difunde tu experiencia y casos con respaldo institucional."
          />
          <Tile
            icon={<i className="fa-solid fa-database"></i>}
            title="Información centralizada"
            desc="Casos, documentos y recursos organizados en un solo lugar."
          />
          <Tile
            icon={<i className="fa-solid fa-handshake"></i>}
            title="Confianza y red"
            desc="Conecta con especialistas y potencia tu credibilidad."
          />
          <Tile
            icon={<i className="fa-solid fa-trophy"></i>}
            title="Reconocimiento académico"
            desc="Comités, publicaciones y ponencias en eventos SLACC."
          />
          <Tile
            icon={<i className="fa-solid fa-graduation-cap"></i>}
            title="Formación continua"
            desc="Cursos, talleres y webinars con curaduría experta."
          />
          <Tile
            icon={<i className="fa-solid fa-shield-halved"></i>}
            title="Independencia digital"
            desc="Tu presencia profesional sin depender de redes sociales."
          />
        </div>

        <div className="members-cta">
          <Link to="/solicitar-membresia" className="btn btn-primary">
            Solicitar membresía
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
