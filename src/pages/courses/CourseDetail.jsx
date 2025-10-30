import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Section from "../../components/ui/Section.jsx";
import Button from "../../components/ui/Button.jsx";
import Card from "../../components/ui/Card.jsx";
import Badge from "../../components/ui/Badge.jsx";
import Spinner from "../../components/ui/Spinner.jsx";
import Alert from "../../components/ui/Alert.jsx";

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
      <Section variant="default">
        <div style={{ textAlign: "center", padding: "var(--spacing-8)" }}>
          <Spinner size="lg" />
          <p style={{ marginTop: "var(--spacing-4)", color: "var(--color-muted)" }}>
            Cargando curso...
          </p>
        </div>
      </Section>
    );
  }

  if (error || !course) {
    return (
      <Section variant="default">
        <Alert variant="error">
          {error || 'Curso no encontrado'}
        </Alert>
      </Section>
    );
  }

  const formatType = course.format === 'webinar' ? 'Webinar' : 'Presencial';

  return (
    <Section variant="default" padding="lg">
      <Button 
        variant="outline" 
        onClick={() => navigate(-1)}
        style={{ marginBottom: "var(--spacing-4)" }}
      >
        ← Volver
      </Button>
      
      <Card style={{ padding: "var(--spacing-6)" }}>
        {course.image_url && (
          <img 
            src={course.image_url.startsWith('http') ? course.image_url : `${BASE_URL.replace('/api','')}${course.image_url}`}
            alt={course.title}
            style={{ 
              width: '100%',
              maxHeight: 400,
              objectFit: 'cover',
              borderRadius: "var(--radius-lg)",
              marginBottom: "var(--spacing-5)"
            }}
          />
        )}
        
        <div style={{ marginBottom: "var(--spacing-4)" }}>
          <div style={{ 
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            marginBottom: "var(--spacing-3)",
            flexWrap: "wrap",
            gap: "var(--spacing-3)"
          }}>
            <h1 style={{ margin: 0, flex: 1 }}>{course.title}</h1>
            <Badge variant={course.format === 'webinar' ? 'info' : 'secondary'} size="md">
              {formatType}
            </Badge>
          </div>
          
          <p style={{ 
            color: 'var(--color-muted)',
            fontSize: "18px",
            lineHeight: 1.7
          }}>
            {course.description}
          </p>
        </div>
        
        <div style={{ 
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: "var(--spacing-4)",
          padding: "var(--spacing-5)",
          background: "var(--color-bg-alt)",
          borderRadius: "var(--radius)",
          marginBottom: "var(--spacing-5)"
        }}>
          <div>
            <strong style={{ color: "var(--color-text-secondary)" }}>Instructor</strong>
            <p style={{ margin: "var(--spacing-1) 0 0" }}>{course.instructor || 'Por definir'}</p>
          </div>
          <div>
            <strong style={{ color: "var(--color-text-secondary)" }}>Duración</strong>
            <p style={{ margin: "var(--spacing-1) 0 0" }}>{course.duration_hours || 'N/A'} horas</p>
          </div>
          <div>
            <strong style={{ color: "var(--color-text-secondary)" }}>Inicio</strong>
            <p style={{ margin: "var(--spacing-1) 0 0" }}>
              {course.start_date ? new Date(course.start_date).toLocaleDateString('es-ES', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              }) : 'Por confirmar'}
            </p>
          </div>
          <div>
            <strong style={{ color: "var(--color-text-secondary)" }}>Formato</strong>
            <p style={{ margin: "var(--spacing-1) 0 0" }}>{formatType}</p>
          </div>
        </div>
        
        {course.content && (
          <div 
            dangerouslySetInnerHTML={{ __html: course.content }}
            style={{ 
              lineHeight: 1.8,
              color: "var(--color-text-secondary)"
            }}
          />
        )}
        
        <div style={{ 
          marginTop: "var(--spacing-6)",
          paddingTop: "var(--spacing-5)",
          borderTop: "1px solid var(--color-border)",
          display: "flex",
          gap: "var(--spacing-3)",
          flexWrap: "wrap"
        }}>
          <Button variant="primary" size="lg">
            Inscribirse al curso
          </Button>
          <Button variant="outline" size="lg">
            Compartir
          </Button>
        </div>
      </Card>
    </Section>
  );
}


