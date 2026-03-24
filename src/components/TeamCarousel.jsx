import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import PropTypes from "prop-types";
import { Button } from "./ui";
import useMediaQuery from "../hooks/useMediaQuery.js";

export function TeamCarousel({ members = [] }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const trackRef = useRef(null);
  const isMobile = useMediaQuery("(max-width: 768px)");
  const itemsPerSlide = isMobile ? 1 : 3;

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

  const totalSlides = Math.ceil(items.length / itemsPerSlide);
  const slideKeys = Array.from({ length: totalSlides }).map((_, slideIndex) => {
    const startIdx = slideIndex * itemsPerSlide;
    const slideMembers = items.slice(startIdx, startIdx + itemsPerSlide);
    return `team-slide-${slideMembers.map(member => member.name).join("-")}`;
  });

  useEffect(() => {
    if (currentIndex >= totalSlides && totalSlides > 0) {
      setCurrentIndex(0);
    }
  }, [currentIndex, totalSlides]);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex(prev => (prev + 1) % totalSlides);
    }, 5000);
    return () => clearInterval(interval);
  }, [totalSlides]);

  useEffect(() => {
    if (trackRef.current) {
      trackRef.current.style.transform = `translateX(-${currentIndex * 100}%)`;
    }
  }, [currentIndex]);

  const handlePrev = () => {
    setCurrentIndex(prev => (prev - 1 + totalSlides) % totalSlides);
  };

  const handleNext = () => {
    setCurrentIndex(prev => (prev + 1) % totalSlides);
  };

  return (
    <div className="team-carousel">
      <div className="team-carousel-viewport">
        <div className="team-carousel-track" ref={trackRef}>
          {Array.from({ length: totalSlides }).map((_, slideIndex) => {
            const startIdx = slideIndex * itemsPerSlide;
            const slideMembers = items.slice(
              startIdx,
              startIdx + itemsPerSlide,
            );

            return (
              <div key={slideKeys[slideIndex]} className="team-carousel-slide">
                {slideMembers.map((member, idx) => (
                  <div
                    key={`${member.name}-${idx}`}
                    className="team-member-card team-carousel-member-card"
                  >
                    <img
                      src={member.photo}
                      alt={member.name}
                      className="team-carousel-member-image"
                    />
                    <h3 className="team-carousel-member-name">{member.name}</h3>
                    <p className="team-carousel-member-role">{member.role}</p>
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
      <div className="carousel-dots team-carousel-dots">
        {Array.from({ length: totalSlides }).map((_, idx) => (
          <button
            key={`dot-${slideKeys[idx]}`}
            className={`carousel-dot ${idx === currentIndex ? "active" : ""}`}
            onClick={() => setCurrentIndex(idx)}
            aria-label={`Ir a slide ${idx + 1}`}
          />
        ))}
      </div>

      {/* Directorio Button */}
      <div className="team-carousel-cta">
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
    }),
  ),
};
