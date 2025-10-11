export default function Card({ title, description, children, footer }) {
  return (
    <article className="card">
      {title ? <h3>{title}</h3> : null}
      {description ? <p>{description}</p> : null}
      {children}
      {footer}
    </article>
  );
}


