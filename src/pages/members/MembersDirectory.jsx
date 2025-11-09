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
          <div key={g.name} className="directory-group">
            <h3 className="directory-group-title">{g.name}</h3>
            <div className="cards">
              {g.members.map(m => (
                <div key={m.email} className="card directory-member-card">
                  <img
                    src={m.photo}
                    alt={m.name}
                    className="directory-member-photo"
                  />
                  <div>
                    <h4 className="directory-member-name">{m.name}</h4>
                    <div className="directory-member-location">
                      {m.city}, {m.country}
                    </div>
                    <div className="directory-member-specialty">
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
