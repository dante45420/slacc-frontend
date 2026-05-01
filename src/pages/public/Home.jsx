import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import Carousel from "../../components/Carousel.jsx";
import EventsCarousel from "../../components/EventsCarousel.jsx";
import InstagramFeed from "../../components/InstagramFeed.jsx";
import NewsCarousel from "../../components/NewsCarousel.jsx";
import { TeamCarousel } from "../../components/TeamCarousel.jsx";
import Container from "../../components/ui/Container.jsx";
import Button from "../../components/ui/Button.jsx";

export default function Home() {
  const { t, i18n } = useTranslation();

  const handleLanguageSelect = (e, lang) => {
    e.preventDefault();
    i18n.changeLanguage(lang);
  };

  return (
    <div className="home-page">
      <section className="home-hero-section">
        <Carousel />
      </section>

      <Container size="lg">
        <div className="home-main-card">
          <div className="home-section">
            <h2 className="home-section-title">{t("home.instagram_title")}</h2>
            <InstagramFeed />
          </div>

          <hr className="home-divider" />

          <div className="home-section">
            <div className="home-section-header">
              <h2 className="home-section-title-inline">
                {t("home.sponsored_events")}
              </h2>
              <Link to="/eventos/webinars">
                <Button variant="outline">
                  {t("home.btn_see_all")}{" "}
                  <i className="fa-solid fa-arrow-right"></i>
                </Button>
              </Link>
            </div>
            <EventsCarousel />
          </div>

          <hr className="home-divider" />

          <div className="home-section">
            <h2 className="home-section-title">{t("home.recent_news")}</h2>
            <NewsCarousel limit={9} />
          </div>

          <hr className="home-divider" />

          <div className="home-section">
            <h2 className="home-section-title">{t("home.our_team")}</h2>
            <TeamCarousel />
          </div>
        </div>
      </Container>
    </div>
  );
}
