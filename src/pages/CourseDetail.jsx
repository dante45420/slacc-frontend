import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";

export default function CourseDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        const res = await fetch(`${BASE_URL}/courses/${id}`);
        if (!res.ok) throw new Error("No se pudo cargar el curso");
        const data = await res.json();
        setCourse(data);
      } catch (e) {
        setError(e.message || "Error cargando curso");
      } finally {
        setLoading(false);
      }
    }
    if (id) load();
  }, [id]);

  if (loading) {
    return (
      <section className="section">
        <div className="container">Cargando curso...</div>
      </section>
    );
  }

  if (error || !course) {
    return (
      <section className="section">
        <div className="container">
          <p style={{ color: 'crimson' }}>{error || 'Curso no encontrado'}</p>
        </div>
      </section>
    );
  }

  return (
    <section className="section">
      <div className="container">
        <button className="btn btn-outline" onClick={() => navigate(-1)} style={{ marginBottom: 16 }}>
          ← Volver
        </button>
        <div className="card" style={{ padding: 24 }}>
          {course.image_url && (
            <img 
              src={course.image_url.startsWith('http') ? course.image_url : `${BASE_URL.replace('/api','')}${course.image_url}`}
              alt={course.title}
              style={{ width: '100%', maxHeight: 360, objectFit: 'cover', borderRadius: 8, marginBottom: 16 }}
            />
          )}
          <h1 style={{ marginBottom: 8 }}>{course.title}</h1>
          <p style={{ color: 'var(--color-muted)', marginBottom: 16 }}>{course.description}</p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 24 }}>
            <div><strong>Instructor:</strong> {course.instructor || 'Por definir'}</div>
            <div><strong>Duración:</strong> {course.duration_hours || 'N/A'} horas</div>
            <div><strong>Inicio:</strong> {course.start_date ? new Date(course.start_date).toLocaleDateString('es-ES') : 'Por confirmar'}</div>
            <div><strong>Formato:</strong> {course.format === 'webinar' ? 'Webinar' : 'Presencial'}</div>
          </div>
          <div dangerouslySetInnerHTML={{ __html: course.content || '' }} style={{ lineHeight: 1.8 }} />
        </div>
      </div>
    </section>
  );
}


