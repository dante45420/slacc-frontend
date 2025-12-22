import { useEffect, useMemo, useState } from "react";
import Carousel from "./Carousel.jsx";

const BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";

export default function EventsCarousel() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        const res = await fetch(`${BASE_URL}/events`);
        const data = await res.json();
        setEvents(Array.isArray(data) ? data : []);
      } catch (e) {
        console.error("Error loading events:", e);
        setEvents([]);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const items = useMemo(() => {
    if (!events || events.length === 0) return [];
    return events.slice(0, 6).map(e => {
      let imageUrl;
      if (e.image_url?.startsWith("http")) {
        imageUrl = e.image_url;
      } else if (e.image_url) {
        imageUrl = `${BASE_URL.replace("/api", "")}${e.image_url}`;
      } else {
        imageUrl = "/carrusel_1.png";
      }

      return {
        imageUrl,
        title: e.title,
        description: e.description || "Evento patrocinado por SLACC",
        ctaText: "Ver evento",
        ctaHref: `/eventos/${e.id}`,
      };
    });
  }, [events]);

  if (loading) {
    return (
      <div
        className="container"
        style={{ padding: "24px 0", textAlign: "center" }}
      >
        Cargando eventos...
      </div>
    );
  }

  if (items.length === 0) {
    return null;
  }

  return <Carousel items={items} intervalMs={7000} />;
}
