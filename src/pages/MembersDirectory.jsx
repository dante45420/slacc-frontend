export default function MembersDirectory() {
  const groups = [
    {
      name: "Cirugía de Preservación",
      members: [
        {
          name: "Dra. Ana Pérez",
          city: "Ciudad de México",
          country: "México",
          speciality: "Artroscopía",
          email: "ana.perez@example.com",
          photo: "https://i.pravatar.cc/200?img=11",
        },
        {
          name: "Dr. Luis Gómez",
          city: "Bogotá",
          country: "Colombia",
          speciality: "Displasia",
          email: "luis.gomez@example.com",
          photo: "https://i.pravatar.cc/200?img=12",
        },
        {
          name: "Dra. Marta Silva",
          city: "Santiago",
          country: "Chile",
          speciality: "Osteotomías",
          email: "marta.silva@example.com",
          photo: "https://i.pravatar.cc/200?img=13",
        },
      ],
    },
    {
      name: "Artroplastia",
      members: [
        {
          name: "Dr. Pedro Rivas",
          city: "Lima",
          country: "Perú",
          speciality: "Revisión compleja",
          email: "pedro.rivas@example.com",
          photo: "https://i.pravatar.cc/200?img=21",
        },
        {
          name: "Dra. Sofía Duarte",
          city: "Quito",
          country: "Ecuador",
          speciality: "Primaria cementada",
          email: "sofia.duarte@example.com",
          photo: "https://i.pravatar.cc/200?img=22",
        },
        {
          name: "Dr. Bruno Almeida",
          city: "São Paulo",
          country: "Brasil",
          speciality: "No cementada",
          email: "bruno.almeida@example.com",
          photo: "https://i.pravatar.cc/200?img=23",
        },
      ],
    },
    {
      name: "Trauma de Cadera",
      members: [
        {
          name: "Dra. Paula Núñez",
          city: "Montevideo",
          country: "Uruguay",
          speciality: "Fracturas acetabulares",
          email: "paula.nunez@example.com",
          photo: "https://i.pravatar.cc/200?img=31",
        },
        {
          name: "Dr. Carlos Vega",
          city: "Buenos Aires",
          country: "Argentina",
          speciality: "Fracturas de cuello femoral",
          email: "carlos.vega@example.com",
          photo: "https://i.pravatar.cc/200?img=32",
        },
        {
          name: "Dra. Laura Paredes",
          city: "La Paz",
          country: "Bolivia",
          speciality: "Politrauma",
          email: "laura.paredes@example.com",
          photo: "https://i.pravatar.cc/200?img=33",
        },
      ],
    },
  ];
  return (
    <section className="section">
      <div className="container">
        <h1>Directorio de Miembros</h1>
        {groups.map(g => (
          <div key={g.name} style={{ marginTop: 16 }}>
            <h3 style={{ margin: "8px 0 12px" }}>{g.name}</h3>
            <div className="cards">
              {g.members.map(m => (
                <div
                  key={m.email}
                  className="card"
                  style={{
                    display: "grid",
                    gridTemplateColumns: "72px 1fr",
                    gap: 12,
                    alignItems: "center",
                  }}
                >
                  <img
                    src={m.photo}
                    alt={m.name}
                    style={{
                      width: 72,
                      height: 72,
                      borderRadius: "50%",
                      objectFit: "cover",
                    }}
                  />
                  <div>
                    <h4 style={{ margin: 0 }}>{m.name}</h4>
                    <div
                      style={{ color: "var(--color-muted)", marginBottom: 6 }}
                    >
                      {m.city}, {m.country}
                    </div>
                    <div style={{ marginBottom: 8 }}>
                      Especialidad: <strong>{m.speciality}</strong>
                    </div>
                    <a href={`mailto:${m.email}`} className="btn btn-outline">
                      Contactar
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
