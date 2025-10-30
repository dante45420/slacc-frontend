import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiGet, apiPost } from "../../api/client";
import Modal from "../../components/ui/Modal";

const BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";

// Función para obtener URL de imagen (EXACTA misma lógica que NewsGrid)
function getImageUrl(imageUrl) {
  if (!imageUrl) {
    // Imagen por defecto relacionada con paper científico
    return "https://images.unsplash.com/photo-1559757148-5c350d0d3c56?auto=format&fit=crop&w=400&q=80";
  }

  // Si es una URL completa, usarla tal como está
  if (imageUrl.startsWith("http")) {
    return imageUrl;
  }

  // Si es un path relativo, construir la URL completa del backend
  return `${BASE_URL.replace("/api", "")}${imageUrl}`;
}

export default function AdminPortal() {
  const navigate = useNavigate();
  const [apps, setApps] = useState([]);
  const [news, setNews] = useState([]);
  const [msg, setMsg] = useState("");
  const [selectedApp, setSelectedApp] = useState(null);

  async function load() {
    const [a, n] = await Promise.all([
      apiGet("/admin/applications"),
      apiGet("/admin/news"),
    ]);
    setApps(a);
    setNews(n);
  }
  useEffect(() => {
    load();
  }, []);

  async function approveApp(id) {
    const r = await apiPost(`/admin/applications/${id}/approve`, {
      note: "Ok",
    });
    setMsg(`Aprobado: ${JSON.stringify(r.credentials)}`);
    setSelectedApp(null); // cerrar modal
    load();
  }

  async function rejectApp(id) {
    await apiPost(`/admin/applications/${id}/reject`, { note: "No cumple" });
    setMsg("Solicitud rechazada");
    setSelectedApp(null); // cerrar modal
    load();
  }

  async function reorderNews(id, newOrder) {
    try {
      const token = localStorage.getItem("access_token");
      const res = await fetch(`${BASE_URL}/admin/news/reorder`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify([{ id, order_index: newOrder }]),
      });
      if (!res.ok) throw new Error("Error al reordenar");
      setMsg("Orden actualizado correctamente");
      load(); // recargar lista
    } catch (err) {
      setMsg("Error al reordenar: " + err.message);
    }
  }

  function openAppDetails(app) {
    navigate(`/admin/applications/${app.id}`);
  }

  // Agrupar noticias por estado
  const newsByStatus = {
    pending: news.filter(n => n.status === "pending"),
    published: news.filter(n => n.status === "published"),
    rejected: news.filter(n => n.status === "rejected"),
  };

  return (
    <section className="section">
      <div className="container">
        <h2>Portal admin</h2>
        {msg ? <p>{msg}</p> : null}

        <h3>Postulaciones</h3>
        <div className="cards">
          {apps.map(a => (
            <div key={a.id} className="card">
              <h4>
                {a.name} ({a.email})
              </h4>
              <p>Estado: {a.status}</p>
              <button
                className="btn btn-outline"
                onClick={() => openAppDetails(a)}
              >
                Ver completo
              </button>
            </div>
          ))}
        </div>

        <h3 style={{ marginTop: 32 }}>Noticias</h3>

        {/* Noticias pendientes */}
        {newsByStatus.pending.length > 0 && (
          <div style={{ marginBottom: 32 }}>
            <h4 style={{ color: "var(--color-accent)", marginBottom: 16 }}>
              Pendientes de revisión
            </h4>
            <div className="cards">
              {newsByStatus.pending.map(n => (
                <div key={n.id} className="card">
                  <h4>{n.title}</h4>
                  <p>{n.excerpt}</p>
                  <img
                    src={getImageUrl(n.image_url)}
                    alt={n.title}
                    style={{
                      width: "100%",
                      height: "150px",
                      objectFit: "cover",
                      borderRadius: "var(--radius)",
                      marginBottom: 12,
                    }}
                  />
                  <a
                    href={`/admin/news/${n.id}/view`}
                    className="btn btn-outline"
                    target="_blank"
                  >
                    Ver completa
                  </a>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Noticias publicadas */}
        {newsByStatus.published.length > 0 && (
          <div style={{ marginBottom: 32 }}>
            <h4 style={{ color: "var(--color-secondary)", marginBottom: 16 }}>
              Publicadas
            </h4>
            <div className="cards">
              {newsByStatus.published.map(n => (
                <div key={n.id} className="card">
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "flex-start",
                      marginBottom: 12,
                    }}
                  >
                    <div style={{ flex: 1 }}>
                      <h4>{n.title}</h4>
                      <p>{n.excerpt}</p>
                    </div>
                    <div style={{ marginLeft: 16, textAlign: "center" }}>
                      <div
                        style={{
                          fontSize: "12px",
                          color: "var(--color-muted)",
                          marginBottom: 8,
                        }}
                      >
                        Orden: {n.order_index}
                      </div>
                      <div
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          gap: 4,
                        }}
                      >
                        <button
                          className="btn btn-outline"
                          style={{ padding: "4px 8px", fontSize: "12px" }}
                          onClick={() => reorderNews(n.id, n.order_index - 1)}
                          disabled={n.order_index <= 1}
                        >
                          ↑
                        </button>
                        <button
                          className="btn btn-outline"
                          style={{ padding: "4px 8px", fontSize: "12px" }}
                          onClick={() => reorderNews(n.id, n.order_index + 1)}
                        >
                          ↓
                        </button>
                      </div>
                    </div>
                  </div>
                  <img
                    src={getImageUrl(n.image_url)}
                    alt={n.title}
                    style={{
                      width: "100%",
                      height: "150px",
                      objectFit: "cover",
                      borderRadius: "var(--radius)",
                      marginBottom: 12,
                    }}
                  />
                  <a
                    href={`/noticias/${n.id}`}
                    className="btn btn-outline"
                    target="_blank"
                  >
                    Ver completa
                  </a>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Noticias rechazadas */}
        {newsByStatus.rejected.length > 0 && (
          <div>
            <h4 style={{ color: "var(--color-muted)", marginBottom: 16 }}>
              Rechazadas
            </h4>
            <div className="cards">
              {newsByStatus.rejected.map(n => (
                <div key={n.id} className="card">
                  <h4>{n.title}</h4>
                  <p>{n.excerpt}</p>
                  <img
                    src={getImageUrl(n.image_url)}
                    alt={n.title}
                    style={{
                      width: "100%",
                      height: "150px",
                      objectFit: "cover",
                      borderRadius: "var(--radius)",
                      marginBottom: 12,
                    }}
                  />
                  <a
                    href={`/admin/news/${n.id}/view`}
                    className="btn btn-outline"
                    target="_blank"
                  >
                    Ver completa
                  </a>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Modal para aplicación completa */}
      <Modal
        isOpen={!!selectedApp}
        onClose={() => setSelectedApp(null)}
        title={`Postulación de ${selectedApp?.name}`}
        size="large"
      >
        {selectedApp && (
          <div>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 16,
                marginBottom: 24,
              }}
            >
              <div>
                <h4>Información personal</h4>
                <p>
                  <strong>Nombre:</strong> {selectedApp.name}
                </p>
                <p>
                  <strong>Email:</strong> {selectedApp.email}
                </p>
                <p>
                  <strong>Teléfono:</strong>{" "}
                  {selectedApp.phone || "No especificado"}
                </p>
                <p>
                  <strong>Estado:</strong> {selectedApp.status}
                </p>
                <p>
                  <strong>Fecha de solicitud:</strong>{" "}
                  {new Date(selectedApp.created_at).toLocaleDateString("es-ES")}
                </p>
              </div>
              <div>
                <h4>Motivación</h4>
                <div
                  style={{
                    background: "#f5f5f5",
                    padding: 12,
                    borderRadius: 8,
                    minHeight: 100,
                  }}
                >
                  {selectedApp.motivation || "No especificada"}
                </div>
              </div>
            </div>

            {selectedApp.resolution_note && (
              <div style={{ marginBottom: 24 }}>
                <h4>Nota de resolución</h4>
                <p>{selectedApp.resolution_note}</p>
              </div>
            )}

            {/* Botones de acción */}
            <div
              style={{
                display: "flex",
                gap: 16,
                justifyContent: "flex-end",
                borderTop: "1px solid #eee",
                paddingTop: 16,
              }}
            >
              <button
                className="btn btn-outline"
                onClick={() => setSelectedApp(null)}
              >
                Cancelar
              </button>
              <button
                className="btn btn-outline"
                onClick={() => rejectApp(selectedApp.id)}
              >
                Rechazar
              </button>
              <button
                className="btn btn-primary"
                onClick={() => approveApp(selectedApp.id)}
              >
                Aprobar
              </button>
            </div>
          </div>
        )}
      </Modal>
    </section>
  );
}
