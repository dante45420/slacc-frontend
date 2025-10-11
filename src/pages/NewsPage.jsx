import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import NewsGrid from "../components/NewsGrid.jsx";

export default function NewsPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const [active, setActive] = useState("comunicados");

  useEffect(() => {
    if (location.pathname.endsWith("/prensa")) setActive("prensa");
    else if (location.pathname.endsWith("/blog")) setActive("blog");
    else setActive("comunicados");
  }, [location.pathname]);

  const tabs = [
    { id: "comunicados", label: "Comunicados", to: "/noticias/comunicados" },
    { id: "prensa", label: "Prensa", to: "/noticias/prensa" },
    { id: "blog", label: "Blog", to: "/noticias/blog" },
  ];

  return (
    <section className="section">
      <div className="container">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <h2>Noticias</h2>
          <div style={{ display: 'flex', gap: 8 }}>
            {tabs.map(t => (
              <button key={t.id} className={active === t.id ? 'btn btn-primary' : 'btn btn-outline'} onClick={() => navigate(t.to)}>
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {/* Reutiliza exactamente las mismas tarjetas que en inicio */}
        <NewsGrid category={active} />
      </div>
    </section>
  );
}


