import { Link } from "react-router-dom";
import Carousel from "../../components/Carousel.jsx";
import CoursesCarousel from "../../components/CoursesCarousel.jsx";
import InstagramFeed from "../../components/InstagramFeed.jsx";
import NewsGrid from "../../components/NewsGrid.jsx";
import { TextImage, TeamGrid } from "../../components/ContentBlocks.jsx";
import Section from "../../components/ui/Section.jsx";
import Button from "../../components/ui/Button.jsx";

export default function Home() {
  return (
    <>
      <section>
        <Carousel />
      </section>
      
      <Section variant="default">
        <h2 style={{ marginTop: 0 }}>Instagram</h2>
        <InstagramFeed />
      </Section>
      
      <Section variant="alt">
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "var(--spacing-4)",
            flexWrap: "wrap",
            gap: "var(--spacing-3)"
          }}
        >
          <h2 style={{ margin: 0 }}>Cursos patrocinados por SLACC</h2>
          <Link to="/eventos/webinars">
            <Button variant="outline">Ver todos →</Button>
          </Link>
        </div>
        <CoursesCarousel />
      </Section>
      
      <Section variant="default">
        <h2 style={{ marginTop: 0 }}>Noticias destacadas</h2>
        <NewsGrid />
      </Section>

      <Section variant="alt">
        <h2 style={{ marginTop: 0 }}>Nuestro equipo</h2>
        <TeamGrid />
      </Section>
      
      <Section variant="primary">
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
      </Section>
    </>
  );
}
