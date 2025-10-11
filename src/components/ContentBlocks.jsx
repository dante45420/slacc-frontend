import Button from "./ui/Button.jsx";

export function TextImage({ title, text, imageUrl, reverse = false, cta }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24, alignItems: "center" }}>
      {!reverse ? <img src={imageUrl} alt="" style={{ width: "100%", borderRadius: 12 }} /> : null}
      <div>
        {title ? <h3 style={{ marginTop: 0 }}>{title}</h3> : null}
        <p style={{ color: "var(--color-muted)" }}>{text}</p>
        {cta ? <Button onClick={cta.onClick}>{cta.label}</Button> : null}
      </div>
      {reverse ? <img src={imageUrl} alt="" style={{ width: "100%", borderRadius: 12 }} /> : null}
    </div>
  );
}

export function TeamGrid({ members = [] }) {
  const items = members.length ? members : [
    { name: "Dra. Ana Pérez", role: "Traumatóloga", photo: "https://i.pravatar.cc/200?img=1" },
    { name: "Dr. Luis Gómez", role: "Ortopedista", photo: "https://i.pravatar.cc/200?img=2" },
    { name: "Dra. Marta Silva", role: "Residente", photo: "https://i.pravatar.cc/200?img=3" }
  ];
  return (
    <div className="cards">
      {items.map((m, i) => (
        <div key={i} className="card" style={{ textAlign: "center" }}>
          <img src={m.photo} alt="" style={{ width: 120, height: 120, borderRadius: "50%", objectFit: "cover", margin: "0 auto 12px" }} />
          <h3 style={{ margin: 0 }}>{m.name}</h3>
          <p style={{ marginTop: 6, color: "var(--color-muted)" }}>{m.role}</p>
          <Button variant="outline">Conectar</Button>
        </div>
      ))}
    </div>
  );
}


