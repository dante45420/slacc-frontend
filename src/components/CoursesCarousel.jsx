import { useEffect, useMemo, useState } from "react";
import Carousel from "./Carousel.jsx";

const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";

export default function CoursesCarousel() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        const res = await fetch(`${BASE_URL}/courses`);
        const data = await res.json();
        setCourses(Array.isArray(data) ? data : []);
      } catch (e) {
        setCourses([]);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const items = useMemo(() => {
    if (!courses || courses.length === 0) return [];
    return courses.slice(0, 6).map(c => ({
      imageUrl: c.image_url?.startsWith('http') ? c.image_url : (c.image_url ? `${BASE_URL.replace('/api','')}${c.image_url}` : "/carrusel_1.png"),
      title: c.title,
      description: c.description || "Curso patrocinado por SLACC",
      ctaText: "Ver curso",
      ctaHref: `/eventos/${c.id}`
    }));
  }, [courses]);

  if (loading) {
    return (
      <div className="container" style={{ padding: "24px 0", textAlign: "center" }}>
        Cargando cursos...
      </div>
    );
  }

  if (items.length === 0) {
    return null;
  }

  return <Carousel items={items} intervalMs={7000} />;
}


