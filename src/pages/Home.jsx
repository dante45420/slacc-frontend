import { Link } from "react-router-dom";
import Carousel from "../components/Carousel.jsx";
import CoursesCarousel from "../components/CoursesCarousel.jsx";
import InstagramFeed from "../components/InstagramFeed.jsx";
import NewsGrid from "../components/NewsGrid.jsx";
import { TextImage, TeamGrid } from "../components/ContentBlocks.jsx";

export default function Home() {
  return (
    <>
      <section>
        <Carousel />
      </section>
      <section className="section" style={{ background: "#fff" }}>
        <div className="container">
          <h2 style={{ marginTop: 0 }}>Instagram</h2>
          <InstagramFeed />
        </div>
      </section>
      <section className="section" style={{ background: "#f8f9fc" }}>
        <div className="container">
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 16,
            }}
          >
            <h2 style={{ margin: 0 }}>Cursos patrocinados por SLACC</h2>
            <Link to="/eventos/webinars" className="btn btn-outline">
              Ver todos
            </Link>
          </div>
          <CoursesCarousel />
        </div>
      </section>
      <section className="section">
        <div className="container">
          <h2>Noticias destacadas</h2>
          <NewsGrid />
        </div>
      </section>

      <section className="section">
        <div className="container">
          <h2>Nuestro equipo</h2>
          <TeamGrid />
        </div>
      </section>
      <section className="section">
        <div className="container">
          <TextImage
            title="Educación y recursos"
            text="Contenido formativo y materiales para especialistas."
            imageUrl="https://images.unsplash.com/photo-1521791136064-7986c2920216?auto=format&fit=crop&w=1200&q=60"
            cta={{
              label: "Ver educación",
              onClick: () => {
                globalThis.location.href = "/educacion";
              },
            }}
          />
        </div>
      </section>
    </>
  );
}
