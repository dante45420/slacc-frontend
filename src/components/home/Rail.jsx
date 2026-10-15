import { Children, useCallback, useEffect, useId, useRef, useState } from "react";
import PropTypes from "prop-types";
import { useTranslation } from "react-i18next";

const EDGE = 4; // px tolerance when deciding whether the rail is at an end

function prefersReducedMotion() {
  return (
    typeof globalThis.matchMedia === "function" &&
    globalThis.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}

/**
 * Horizontal card rail with native scroll-snap (swipe on touch, focus scrolls
 * the focused card into view). How many cards are visible depends on the
 * rail's own width (container queries in home.css), so the same rail works in
 * a full-width home section and in a narrow article column. Prev/next buttons
 * appear only when the cards overflow.
 *
 * `variant`: "cards" (news/events, up to 3 per view) or "people" (up to 4).
 * `bleed`: on small screens the track runs to the viewport edges so the next
 * card peeks in. Only use it when the rail sits directly in a page container.
 */
export default function Rail({ label, variant = "cards", bleed = false, className, children }) {
  const { t } = useTranslation();
  const trackId = useId();
  const trackRef = useRef(null);
  const [edges, setEdges] = useState({ overflow: false, atStart: true, atEnd: true });

  const measure = useCallback(() => {
    const el = trackRef.current;
    if (!el) return;
    const max = el.scrollWidth - el.clientWidth;
    const next = {
      overflow: max > EDGE,
      atStart: el.scrollLeft <= EDGE,
      atEnd: el.scrollLeft >= max - EDGE,
    };
    setEdges(prev =>
      prev.overflow === next.overflow &&
      prev.atStart === next.atStart &&
      prev.atEnd === next.atEnd
        ? prev
        : next,
    );
  }, []);

  const count = Children.count(children);

  useEffect(() => {
    const el = trackRef.current;
    if (!el) return undefined;
    measure();
    el.addEventListener("scroll", measure, { passive: true });
    const observer =
      typeof ResizeObserver === "function" ? new ResizeObserver(measure) : null;
    observer?.observe(el);
    return () => {
      el.removeEventListener("scroll", measure);
      observer?.disconnect();
    };
  }, [measure, count]);

  const scrollPage = direction => {
    const el = trackRef.current;
    if (!el) return;
    const first = el.firstElementChild;
    const gap = parseFloat(getComputedStyle(el).columnGap) || 0;
    const step = first ? first.getBoundingClientRect().width + gap : el.clientWidth;
    // Move by as many whole cards as fit in the viewport (at least one).
    const perPage = Math.max(1, Math.floor((el.clientWidth + gap) / step));
    el.scrollBy({
      left: direction * perPage * step,
      behavior: prefersReducedMotion() ? "auto" : "smooth",
    });
  };

  const classes = [
    "home-rail",
    `home-rail--${variant}`,
    bleed && "home-rail--bleed",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={classes}>
      <ul
        className="home-rail__track"
        id={trackId}
        ref={trackRef}
        role="list"
        aria-label={label}
      >
        {Children.map(children, child =>
          child ? <li className="home-rail__item">{child}</li> : null,
        )}
      </ul>
      {edges.overflow && (
        <div className="home-rail__controls">
          <button
            type="button"
            className="carousel-arrow"
            aria-controls={trackId}
            aria-label={t("home.carousel_prev", "Anterior")}
            onClick={() => scrollPage(-1)}
            disabled={edges.atStart}
          >
            <i className="fa-solid fa-chevron-left" aria-hidden="true"></i>
          </button>
          <button
            type="button"
            className="carousel-arrow"
            aria-controls={trackId}
            aria-label={t("home.carousel_next", "Siguiente")}
            onClick={() => scrollPage(1)}
            disabled={edges.atEnd}
          >
            <i className="fa-solid fa-chevron-right" aria-hidden="true"></i>
          </button>
        </div>
      )}
    </div>
  );
}

Rail.propTypes = {
  label: PropTypes.string,
  variant: PropTypes.oneOf(["cards", "people"]),
  bleed: PropTypes.bool,
  className: PropTypes.string,
  children: PropTypes.node,
};
