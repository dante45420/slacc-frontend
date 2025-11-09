import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../auth/AuthContext";
import {
  Section,
  Container,
  Button,
  Card,
  Badge,
  Spinner,
  Alert,
  EmptyState,
  Modal,
  Input,
  Grid,
} from "../../components/ui";

const BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";

export default function EventsPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("webinar");
  const location = useLocation();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState(null);
  const [form, setForm] = useState({ name: "", email: "", phone: "" });
  const [message, setMessage] = useState("");

  useEffect(() => {
    // detectar subruta
    if (location.pathname.endsWith("/proximos")) setActiveTab("proximos");
    else if (location.pathname.endsWith("/webinars")) setActiveTab("webinar");
    else if (location.pathname.endsWith("/pasados")) setActiveTab("pasados");
    else if (location.pathname.endsWith("/cursos")) setActiveTab("todos");
    else setActiveTab("webinar");
  }, [location.pathname]);

  useEffect(() => {
    load();
  }, [activeTab]);

  async function load() {
    try {
      setLoading(true);
      let url = `${BASE_URL}/events?type=${activeTab}`;
      if (activeTab === "pasados") {
        url = `${BASE_URL}/events?past=1`;
      } else if (activeTab === "proximos") {
        url = `${BASE_URL}/events?type=presencial`;
      } else if (activeTab === "todos") {
        url = `${BASE_URL}/events`;
      }
      const res = await fetch(url);
      const data = await res.json();
      setEvents(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  function getPriceDisplay(e) {
    if (
      user?.role === "member" &&
      user?.is_active &&
      user?.payment_status === "paid"
    ) {
      if (user.membership_type === "joven")
        return e.price_joven || e.price_member;
      if (user.membership_type === "gratuito") return e.price_gratuito || 0;
      return e.price_member;
    }
    return e.price_non_member;
  }

  async function enroll(eventId) {
    try {
      const res = await fetch(`${BASE_URL}/events/${eventId}/enroll`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error al inscribir");
      setMessage("Inscripción registrada. Recibirás instrucciones por correo.");
      setEnrolling(null);
      setForm({ name: "", email: "", phone: "" });
      load();
    } catch (e) {
      alert(e.message);
    }
  }

  return (
    <Section variant="default">
      <Container>
        <h1 className="mb-4">Eventos y Webinars</h1>

        {/* Tab Navigation */}
        <div className="flex gap-2 mb-5" style={{ flexWrap: "wrap" }}>
          {[
            {
              id: "proximos",
              label: "Próximos (Presenciales)",
              to: "/eventos/proximos",
            },
            { id: "webinar", label: "Webinars", to: "/eventos/webinars" },
            { id: "pasados", label: "Pasados", to: "/eventos/pasados" },
          ].map(tab => (
            <Button
              key={tab.id}
              variant={activeTab === tab.id ? "primary" : "outline"}
              onClick={() => navigate(tab.to)}
            >
              {tab.label}
            </Button>
          ))}
        </div>

        {message && (
          <Alert variant="success" className="mb-4">
            {message}
          </Alert>
        )}

        {loading ? (
          <div className="flex justify-center p-6">
            <Spinner size="lg" />
          </div>
        ) : (
          <>
            {events.length === 0 ? (
              <EmptyState
                icon={<i className="fa-regular fa-calendar"></i>}
                title="No hay eventos disponibles"
                description="No se encontraron eventos en esta categoría. Revisa otras secciones o vuelve más tarde."
              />
            ) : (
              <Grid columns={3}>
                {events.map(e => {
                  let imageUrl = null;
                  if (e.image_url) {
                    imageUrl = e.image_url.startsWith("http")
                      ? e.image_url
                      : BASE_URL.replace("/api", "") + e.image_url;
                  }

                  return (
                    <Card
                      key={e.id}
                      image={imageUrl}
                      badge={
                        <Badge
                          variant={
                            e.format === "webinar" ? "accent" : "secondary"
                          }
                        >
                          {e.format === "webinar" ? "Webinar" : "Presencial"}
                        </Badge>
                      }
                      hoverable
                      onClick={() => navigate(`/eventos/${e.id}`)}
                    >
                      <h3 className="mt-0 mb-3">{e.title}</h3>
                      <p className="text-muted mb-4">{e.description}</p>

                      <div
                        style={{
                          display: "grid",
                          gridTemplateColumns: "1fr 1fr",
                          gap: "var(--spacing-3)",
                          fontSize: "0.9em",
                        }}
                      >
                        <div>
                          <div className="text-muted mb-1">Fecha</div>
                          <div className="font-medium">
                            {e.start_date
                              ? new Date(e.start_date).toLocaleDateString(
                                  "es-ES"
                                )
                              : "Por confirmar"}
                          </div>
                        </div>
                        <div>
                          <div className="text-muted mb-1">Precio</div>
                          <div className="font-bold text-primary">
                            ${getPriceDisplay(e)}
                          </div>
                        </div>
                        {e.max_students && (
                          <>
                            <div>
                              <div className="text-muted mb-1">Cupos</div>
                              <div className="font-medium">
                                {e.max_students}
                              </div>
                            </div>
                            <div>
                              <div className="text-muted mb-1">Disponibles</div>
                              <div className="font-medium">
                                {e.seats_left ?? "—"}
                              </div>
                            </div>
                          </>
                        )}
                      </div>
                    </Card>
                  );
                })}
              </Grid>
            )}
          </>
        )}
      </Container>

      <Modal
        isOpen={!!enrolling}
        onClose={() => setEnrolling(null)}
        title={enrolling ? `Inscripción: ${enrolling.title}` : ""}
      >
        <div className="flex flex-col gap-4">
          <Input
            label="Nombre completo"
            placeholder="Juan Pérez"
            value={form.name}
            onChange={e => setForm({ ...form, name: e.target.value })}
          />
          <Input
            label="Email"
            type="email"
            placeholder="juan@ejemplo.com"
            value={form.email}
            onChange={e => setForm({ ...form, email: e.target.value })}
          />
          <Input
            label="Teléfono"
            type="tel"
            placeholder="+56 9 1234 5678"
            value={form.phone}
            onChange={e => setForm({ ...form, phone: e.target.value })}
          />
          <Button
            variant="primary"
            fullWidth
            onClick={() => enroll(enrolling.id)}
          >
            Confirmar inscripción
          </Button>
        </div>
      </Modal>
    </Section>
  );
}
