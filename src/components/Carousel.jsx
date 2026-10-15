import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import PropTypes from "prop-types";
import { useTranslation } from "react-i18next";

const SWIPE_MIN = 48; // px of horizontal travel that counts as a swipe

function prefersReducedMotion() {
  return (
    typeof globalThis.matchMedia === "function" &&
    globalThis.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}

/**
 * Full-bleed home hero. The headline block (`children`) stays put; the
 * background photos cross-fade and each one has a short caption + link shown
 * next to the slide controls (bottom-right on desktop, under the text on
 * phones), so the controls never cover the headline.
 *
 * Autoplay pauses on hover/focus, can be paused with a button, never starts
 * when the user prefers reduced motion, and restarts its timer after every
 * manual change. Inactive captions are aria-hidden + inert.
 */
export default function Carousel({ slides, intervalMs = 7000, label, className, children }) {
  const { t } = useTranslation();
  const total = slides.length;
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(prefersReducedMotion);
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const touch = useRef(null);

  const hasMany = total > 1;
  const running = hasMany && !paused && !hovered && !focused;
  const active = Math.min(index, Math.max(total - 1, 0));

  useEffect(() => {
    if (index >= total && total > 0) setIndex(0);
  }, [index, total]);

  // A timeout keyed on the active slide: any manual change restarts the count.
  useEffect(() => {
    if (!running) return undefined;
    const id = setTimeout(() => setIndex(i => (i + 1) % total), intervalMs);
    return () => clearTimeout(id);
  }, [running, active, total, intervalMs]);

  const go = next => setIndex(((next % total) + total) % total);

  const onTouchStart = e => {
    const p = e.touches[0];
    touch.current = { x: p.clientX, y: p.clientY };
  };

  const onTouchEnd = e => {
    const start = touch.current;
    touch.current = null;
    if (!start || !hasMany) return;
    const p = e.changedTouches[0];
    const dx = p.clientX - start.x;
    const dy = p.clientY - start.y;
    if (Math.abs(dx) >= SWIPE_MIN && Math.abs(dx) > Math.abs(dy) * 1.5) {
      go(active + (dx < 0 ? 1 : -1));
    }
  };

  // Keyboard focus inside the hero pauses autoplay; a mouse click on a control
  // does not (the timer simply restarts on the new slide).
  const onFocus = e => {
    let keyboard = true;
    try {
      keyboard = e.target.matches(":focus-visible");
    } catch {
      // older browsers without :focus-visible: treat every focus as keyboard
    }
    if (keyboard) setFocused(true);
  };

  const onBlur = e => {
    if (!e.currentTarget.contains(e.relatedTarget)) setFocused(false);
  };

  return (
    <section
      className={`home-hero ${className || ""}`.trim()}
      onPointerEnter={e => {
        if (e.pointerType === "mouse") setHovered(true);
      }}
      onPointerLeave={() => setHovered(false)}
      onFocus={onFocus}
      onBlur={onBlur}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
    >
      <div className="home-hero__media" aria-hidden="true">
        {slides.map((slide, i) => (
          <div
            key={slide.id}
            className={`home-hero__slide home-hero__slide--${slide.id}${
              slide.poster ? " home-hero__slide--backdrop" : ""
            }${i === active ? " is-active" : ""}`}
          >
            <img
              src={slide.image}
              alt=""
              className="home-hero__image"
              style={slide.position ? { objectPosition: slide.position } : undefined}
              decoding="async"
              // The first photo is the page's largest paint; later slides can wait.
              fetchpriority={i === 0 ? "high" : "low"}
            />
          </div>
        ))}
      </div>

      <div className="home-hero__inner">
        <div className="home-hero__content">{children}</div>

        {slides.some(slide => slide.poster) && (
          // Large framed image above the caption on wide screens (decorative:
          // the caption describes it). Slides with a poster show their photo
          // blurred as the backdrop, so a small or text-heavy image is never
          // stretched across the whole hero.
          <div className="home-hero__posters" aria-hidden="true">
            {slides.map((slide, i) =>
              slide.poster ? (
                <img
                  key={slide.id}
                  src={slide.poster}
                  alt=""
                  className={`home-hero__poster home-hero__poster--${
                    slide.posterShape || "portrait"
                  }${i === active ? " is-active" : ""}`}
                  style={slide.posterPosition ? { objectPosition: slide.posterPosition } : undefined}
                  decoding="async"
                />
              ) : null,
            )}
          </div>
        )}

        {total > 0 && (
          <div
            className="home-hero__highlights"
            role="region"
            aria-roledescription={t("home.carousel_role", "carrusel")}
            aria-label={label}
          >
            <div className="home-hero__captions" aria-live={running ? "off" : "polite"}>
              {slides.map((slide, i) => {
                const isActive = i === active;
                return (
                  <div
                    key={slide.id}
                    className={`home-hero__caption${isActive ? " is-active" : ""}${
                      slide.poster ? " home-hero__caption--thumb" : ""
                    }`}
                    role="group"
                    aria-roledescription={t("home.carousel_slide_role", "diapositiva")}
                    aria-label={t("home.carousel_slide_of", "{{n}} de {{total}}", {
                      n: i + 1,
                      total,
                    })}
                    aria-hidden={isActive ? undefined : "true"}
                    inert={isActive ? undefined : ""}
                  >
                    {slide.poster && (
                      // Small copy of the poster where the large one is hidden (< 1024px).
                      <img
                        src={slide.poster}
                        alt=""
                        className={`home-hero__caption-thumb home-hero__caption-thumb--${
                          slide.posterShape || "portrait"
                        }`}
                        style={slide.posterPosition ? { objectPosition: slide.posterPosition } : undefined}
                        decoding="async"
                      />
                    )}
                    <div className="home-hero__caption-body">
                      {slide.kicker && <p className="home-hero__caption-kicker">{slide.kicker}</p>}
                      <p className="home-hero__caption-text">{slide.text}</p>
                      {slide.meta && (
                        <p className="home-hero__caption-meta">
                          <i className="fa-solid fa-location-dot" aria-hidden="true"></i>
                          {slide.meta}
                        </p>
                      )}
                      {slide.to && slide.linkLabel && (
                        <Link to={slide.to} className="home-hero__caption-link">
                          {slide.linkLabel}
                          <i className="fa-solid fa-arrow-right" aria-hidden="true"></i>
                        </Link>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {hasMany && (
              <div className="home-hero__controls">
                <button
                  type="button"
                  className="carousel-arrow home-hero__toggle"
                  onClick={() => setPaused(p => !p)}
                  aria-label={
                    paused
                      ? t("home.carousel_play", "Reanudar presentación")
                      : t("home.carousel_pause", "Pausar presentación")
                  }
                >
                  <i className={`fa-solid ${paused ? "fa-play" : "fa-pause"}`} aria-hidden="true"></i>
                </button>
                <button
                  type="button"
                  className="carousel-arrow"
                  onClick={() => go(active - 1)}
                  aria-label={t("home.carousel_prev", "Anterior")}
                >
                  <i className="fa-solid fa-chevron-left" aria-hidden="true"></i>
                </button>
                <div className="home-hero__dots">
                  {slides.map((slide, i) => (
                    <button
                      key={slide.id}
                      type="button"
                      className="home-hero__dot"
                      onClick={() => go(i)}
                      aria-label={t("home.carousel_goto", "Ir a la diapositiva {{n}}", { n: i + 1 })}
                      aria-current={i === active ? "true" : undefined}
                    >
                      <span className="carousel-dot" aria-hidden="true"></span>
                    </button>
                  ))}
                </div>
                <button
                  type="button"
                  className="carousel-arrow"
                  onClick={() => go(active + 1)}
                  aria-label={t("home.carousel_next", "Siguiente")}
                >
                  <i className="fa-solid fa-chevron-right" aria-hidden="true"></i>
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
}

Carousel.propTypes = {
  slides: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      image: PropTypes.string.isRequired,
      position: PropTypes.string,
      poster: PropTypes.string,
      posterShape: PropTypes.oneOf(["portrait", "landscape"]),
      posterPosition: PropTypes.string,
      kicker: PropTypes.string,
      text: PropTypes.string.isRequired,
      meta: PropTypes.string,
      to: PropTypes.string,
      linkLabel: PropTypes.string,
    }),
  ).isRequired,
  intervalMs: PropTypes.number,
  label: PropTypes.string,
  className: PropTypes.string,
  children: PropTypes.node,
};
