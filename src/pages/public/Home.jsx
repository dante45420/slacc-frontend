import { Link } from "react-router-dom";
import Carousel from "../../components/Carousel.jsx";
import EventsCarousel from "../../components/EventsCarousel.jsx";
import InstagramFeed from "../../components/InstagramFeed.jsx";
import NewsCarousel from "../../components/NewsCarousel.jsx";
import { TextImage } from "../../components/ContentBlocks.jsx";
import { TeamCarousel } from "../../components/TeamCarousel.jsx";
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
                Eventos patrocinados por SLACC
              </h2>
              <Link to="/eventos/webinars">
                <Button variant="outline">
                  Ver todos <i className="fa-solid fa-arrow-right"></i>
                </Button>
              </Link>
            </div>
            <EventsCarousel />
          </div>

          <hr className="home-divider" />

          <div className="home-section">
            <h2 className="home-section-title">Noticias destacadas</h2>
            <NewsCarousel limit={9} />
          </div>

          <hr className="home-divider" />

          <div className="home-section">
            <h2 className="home-section-title">Nuestro equipo</h2>
            <TeamCarousel />
          </div>
        </div>
      </Container>
    </div>
  );
}
