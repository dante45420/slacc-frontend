import PropTypes from "prop-types";

/** Grid of benefit cards, each with an icon tile, a title and a short text. */
export default function FeatureTiles({ items, icons, headingLevel = 2 }) {
  if (!Array.isArray(items) || items.length === 0) return null;
  const Heading = `h${headingLevel}`;

  return (
    <ul className="members-tiles">
      {items.map((item, index) => (
        <li key={item.title} className="members-tile">
          <span className="icon-tile members-tile-icon" aria-hidden="true">
            <i className={icons[index] || "fa-solid fa-star"}></i>
          </span>
          <Heading className="members-tile-title">{item.title}</Heading>
          <p className="members-tile-text">{item.desc}</p>
        </li>
      ))}
    </ul>
  );
}

FeatureTiles.propTypes = {
  items: PropTypes.arrayOf(
    PropTypes.shape({
      title: PropTypes.string.isRequired,
      desc: PropTypes.string,
    }),
  ),
  icons: PropTypes.arrayOf(PropTypes.string).isRequired,
  headingLevel: PropTypes.oneOf([2, 3]),
};
