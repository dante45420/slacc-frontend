import { useEffect, useMemo, useState } from "react";
import Button from "./ui/Button.jsx";
import PropTypes from "prop-types";

export default function Carousel({ items = [], intervalMs = 6000 }) {
  const [index, setIndex] = useState(0);
  const slides = useMemo(
    () =>
      items.length
        ? items
        : [
            {
              imageUrl: "/carrusel_1.png",
              title: "Conócenos",
              description:
                "Sociedad Latinoamericana de Cadera – colaboración para la excelencia clínica.",
              ctaText: "Quiénes somos",
              ctaHref: "/miembros/beneficios",
            },
            {
              imageUrl: "/carrusel_2.png",
              title: "Primer Congreso SLACC",
              description: "21–31 de octubre de 2026 · São Paulo, Brasil.",
              ctaText: "Ver agenda",
              ctaHref: "/eventos/proximos",
            },
            {
              imageUrl: "/carrusel_1.png",
              title: "Cómo hacerte socio",
              description:
                "Beneficios, categorías y requisitos para unirte a SLACC.",
              ctaText: "Solicitar membresía",
              ctaHref: "/solicitar-membresia",
            },
          ],
    [items]
  );

  useEffect(() => {
    const id = setInterval(
      () => setIndex(i => (i + 1) % slides.length),
      intervalMs
    );
    return () => clearInterval(id);
  }, [slides.length, intervalMs]);

  const go = i => setIndex((i + slides.length) % slides.length);

  return (
    <div className="carousel">
      <div
        className="carousel-track"
        style={{ transform: `translateX(-${index * 100}%)` }}
      >
        {slides.map(s => (
          <div
            key={s.title}
            className="carousel-slide"
            style={{ backgroundImage: `url(${s.imageUrl})` }}
          >
            <div className="carousel-overlay" />
            <div className="carousel-content">
              <h2 className="carousel-title">{s.title}</h2>
              <p className="carousel-desc">{s.description}</p>
              <Button
                onClick={() => {
                  globalThis.location.href = s.ctaHref;
                }}
              >
                {s.ctaText}
              </Button>
            </div>
          </div>
        ))}
      </div>
      <div className="carousel-nav">
        <button
          aria-label="Anterior"
          className="carousel-btn"
          onClick={() => go(index - 1)}
        >
          {"<"}
        </button>
        <button
          aria-label="Siguiente"
          className="carousel-btn"
          onClick={() => go(index + 1)}
        >
          {">"}
        </button>
      </div>
      <div className="carousel-dots">
        {slides.map((s, i) => (
          <button
            key={`dot-${s.title}-${i}`}
            className={`carousel-dot ${i === index ? "active" : ""}`}
            onClick={() => setIndex(i)}
            aria-label={`Ir a slide ${i + 1}`}
          />
        ))}
      </div>
    </div>
  );
}

Carousel.propTypes = {
  items: PropTypes.arrayOf(
    PropTypes.shape({
      imageUrl: PropTypes.string,
      title: PropTypes.string,
      description: PropTypes.string,
      ctaText: PropTypes.string,
      ctaHref: PropTypes.string,
    })
  ),
  intervalMs: PropTypes.number,
};
