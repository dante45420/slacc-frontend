import Button from "./ui/Button.jsx";
import PropTypes from "prop-types";

export function TextImage({ title, text, imageUrl, reverse = false, cta }) {
  return (
    <div className="text-image-grid">
      {reverse ? null : (
        <img src={imageUrl} alt="" className="text-image-media" />
      )}
      <div className="text-image-content">
        {title ? <h3 className="text-image-title">{title}</h3> : null}
        <p className="text-image-description">{text}</p>
        {cta ? <Button onClick={cta.onClick}>{cta.label}</Button> : null}
      </div>
      {reverse ? (
        <img src={imageUrl} alt="" className="text-image-media" />
      ) : null}
    </div>
  );
}

TextImage.propTypes = {
  title: PropTypes.string,
  text: PropTypes.string.isRequired,
  imageUrl: PropTypes.string.isRequired,
  reverse: PropTypes.bool,
  cta: PropTypes.shape({
    onClick: PropTypes.func,
    label: PropTypes.string,
  }),
};

export function TeamGrid({ members = [] }) {
  const items = members.length
    ? members
    : [
        {
          name: "Dra. Ana Pérez",
          role: "Traumatóloga",
          photo: "https://i.pravatar.cc/200?img=1",
        },
        {
          name: "Dr. Luis Gómez",
          role: "Ortopedista",
          photo: "https://i.pravatar.cc/200?img=2",
        },
        {
          name: "Dra. Marta Silva",
          role: "Residente",
          photo: "https://i.pravatar.cc/200?img=3",
        },
      ];
  return (
    <div className="cards">
      {items.map(m => (
        <div key={m.name} className="card team-grid-card">
          <img src={m.photo} alt="" className="team-grid-photo" />
          <h3 className="team-grid-name">{m.name}</h3>
          <p className="team-grid-role">{m.role}</p>
          <Button variant="outline">Conectar</Button>
        </div>
      ))}
    </div>
  );
}

TeamGrid.propTypes = {
  members: PropTypes.arrayOf(
    PropTypes.shape({
      name: PropTypes.string,
      role: PropTypes.string,
      photo: PropTypes.string,
    }),
  ),
};
