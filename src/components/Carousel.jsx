import { useEffect, useMemo, useRef, useState } from "react";
import Button from "./ui/Button.jsx";

export default function Carousel({ items = [], intervalMs = 6000 }) {
  const [index, setIndex] = useState(0);
  const slides = useMemo(() => items.length ? items : [
    { 
      imageUrl: "/carrusel_1.png", 
      title: "Bienvenidos a SLACC", 
      description: "Conectamos especialistas en cadera en Latinoamérica.", 
      ctaText: "Conoce más", 
      ctaHref: "/nosotros" 
    },
    { 
      imageUrl: "/carrusel_2.png", 
      title: "Próximos eventos", 
      description: "Cursos y webinars para especialistas.", 
      ctaText: "Ver eventos", 
      ctaHref: "/eventos" 
    }
  ], [items]);

  useEffect(() => {
    const id = setInterval(() => setIndex(i => (i + 1) % slides.length), intervalMs);
    return () => clearInterval(id);
  }, [slides.length, intervalMs]);

  const go = (i) => setIndex((i + slides.length) % slides.length);

  return (
    <div className="carousel">
      <div className="carousel-track" style={{ transform: `translateX(-${index * 100}%)` }}>
        {slides.map((s, i) => (
          <div key={i} className="carousel-slide" style={{ backgroundImage: `url(${s.imageUrl})` }}>
            <div className="carousel-overlay" />
            <div className="carousel-content">
              <h2 className="carousel-title">{s.title}</h2>
              <p className="carousel-desc">{s.description}</p>
              <Button onClick={() => { window.location.href = s.ctaHref; }}>{s.ctaText}</Button>
            </div>
          </div>
        ))}
      </div>
      <div className="carousel-nav">
        <button aria-label="Anterior" className="carousel-btn" onClick={() => go(index - 1)}>{"<"}</button>
        <button aria-label="Siguiente" className="carousel-btn" onClick={() => go(index + 1)}>{">"}</button>
      </div>
      <div className="carousel-dots">
        {slides.map((_, i) => (
          <button key={i} className={`carousel-dot ${i === index ? "active" : ""}`} onClick={() => setIndex(i)} aria-label={`Ir a slide ${i+1}`} />
        ))}
      </div>
    </div>
  );
}


