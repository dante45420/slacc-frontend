import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import PropTypes from "prop-types";
import { Button } from "./ui";

export function TeamCarousel({ members = [] }) {
  const [currentIndex, setCurrentIndex] = useState(0);

  const items = members.length
    ? members
    : [
        {
          name: "Dra. Ana Pérez",
          role: "Traumatóloga",
          photo: "https://i.pravatar.cc/200?img=1",
        },
        {
          name: "Dr. Luis Gómez",
          role: "Ortopedista",
          photo: "https://i.pravatar.cc/200?img=2",
        },
        {
          name: "Dra. Marta Silva",
          role: "Residente",
          photo: "https://i.pravatar.cc/200?img=3",
        },
        {
          name: "Dr. Carlos Ruiz",
          role: "Cirujano Cardiovascular",
          photo: "https://i.pravatar.cc/200?img=4",
        },
        {
          name: "Dra. Patricia Torres",
          role: "Cardióloga",
          photo: "https://i.pravatar.cc/200?img=5",
        },
        {
          name: "Dr. Miguel Santos",
          role: "Cirujano Torácico",
          photo: "https://i.pravatar.cc/200?img=6",
        },
      ];

  const itemsPerSlide = 3;
  const totalSlides = Math.ceil(items.length / itemsPerSlide);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex(prev => (prev + 1) % totalSlides);
    }, 5000);
    return () => clearInterval(interval);
  }, [totalSlides]);

  const handlePrev = () => {
    setCurrentIndex(prev => (prev - 1 + totalSlides) % totalSlides);
  };

  const handleNext = () => {
    setCurrentIndex(prev => (prev + 1) % totalSlides);
  };

  return (
    <div style={{ position: "relative" }}>
      <div style={{ overflow: "hidden", position: "relative" }}>
        <div
          style={{
            display: "flex",
            transform: `translateX(-${currentIndex * 100}%)`,
            transition: "transform 0.5s ease-in-out",
          }}
        >
          {Array.from({ length: totalSlides }).map((_, slideIndex) => {
            const startIdx = slideIndex * itemsPerSlide;
            const slideMembers = items.slice(
              startIdx,
              startIdx + itemsPerSlide
            );

            return (
              <div
                key={`slide-${slideIndex}`}
                style={{
                  minWidth: "100%",
                  display: "flex",
                  gap: "2rem",
                  justifyContent: "center",
                  padding: "2rem 1rem",
                }}
              >
                {slideMembers.map((member, idx) => (
                  <div
                    key={`${member.name}-${idx}`}
                    style={{
                      flex: "0 0 auto",
                      width: "280px",
                      textAlign: "center",
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                    }}
                  >
                    <img
                      src={member.photo}
                      alt={member.name}
                      style={{
                        width: "150px",
                        height: "150px",
                        borderRadius: "50%",
                        objectFit: "cover",
                        marginBottom: "1rem",
                        boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
                        display: "block",
                      }}
                    />
                    <h3
                      style={{
                        margin: "0.5rem 0",
                        fontSize: "1.25rem",
                        fontWeight: "600",
                      }}
                    >
                      {member.name}
                    </h3>
                    <p style={{ color: "var(--color-muted)", margin: "0" }}>
                      {member.role}
                    </p>
                  </div>
                ))}
              </div>
            );
          })}
        </div>
      </div>

      {/* Navigation Arrows */}
      <div className="carousel-nav">
        <button
          aria-label="Anterior"
          className="carousel-btn"
          onClick={handlePrev}
        >
          <i className="fa-solid fa-chevron-left"></i>
        </button>
        <button
          aria-label="Siguiente"
          className="carousel-btn"
          onClick={handleNext}
        >
          <i className="fa-solid fa-chevron-right"></i>
        </button>
      </div>

      {/* Dots */}
      <div className="carousel-dots" style={{ marginBottom: "3rem" }}>
        {Array.from({ length: totalSlides }).map((_, idx) => (
          <button
            key={`dot-team-${idx}`}
            className={`carousel-dot ${idx === currentIndex ? "active" : ""}`}
            onClick={() => setCurrentIndex(idx)}
            aria-label={`Ir a slide ${idx + 1}`}
          />
        ))}
      </div>

      {/* Directorio Button */}
      <div style={{ textAlign: "center" }}>
        <Link to="/miembros/directorio">
          <Button size="lg" variant="primary">
            Ver Directorio Completo
          </Button>
        </Link>
      </div>
    </div>
  );
}

TeamCarousel.propTypes = {
  members: PropTypes.arrayOf(
    PropTypes.shape({
      name: PropTypes.string,
      role: PropTypes.string,
      photo: PropTypes.string,
    })
  ),
};
