import { Link } from "react-router-dom";
import Carousel from "../../components/Carousel.jsx";
import CoursesCarousel from "../../components/CoursesCarousel.jsx";
import InstagramFeed from "../../components/InstagramFeed.jsx";
import NewsGrid from "../../components/NewsGrid.jsx";
import { TextImage, TeamGrid } from "../../components/ContentBlocks.jsx";
import Container from "../../components/ui/Container.jsx";
import Button from "../../components/ui/Button.jsx";

export default function Home() {
  return (
    <div className="home-page">
      <section className="home-hero-section">
        <Carousel />
      </section>

      <Container size="lg">
        <div className="home-main-card">
          <div className="home-section">
            <h2 className="home-section-title">Síguenos en Instagram</h2>
            <InstagramFeed />
          </div>

          <hr className="home-divider" />

          <div className="home-section">
            <div className="home-section-header">
              <h2 className="home-section-title-inline">
                Cursos patrocinados por SLACC
              </h2>
              <Link to="/eventos/webinars">
                <Button variant="outline">Ver todos →</Button>
              </Link>
            </div>
            <CoursesCarousel />
          </div>

          <hr className="home-divider" />

          <div className="home-section">
            <h2 className="home-section-title">Noticias destacadas</h2>
            <NewsGrid />
          </div>

          <hr className="home-divider" />

          <div className="home-section">
            <h2 className="home-section-title">Nuestro equipo</h2>
            <TeamGrid />
          </div>

          <hr className="home-divider" />

          <div>
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
        </div>
      </Container>
    </div>
  );
}
