import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import NewsGrid from "../../components/NewsGrid.jsx";
import { Section, Button } from "../../components/ui";

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
    <Section variant="default" padding="lg">
      <div style={{ 
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: "var(--spacing-5)",
        flexWrap: 'wrap',
        gap: "var(--spacing-3)"
      }}>
        <h1 style={{ margin: 0 }}>Noticias</h1>
        <div style={{ 
          display: 'flex',
          gap: "var(--spacing-2)",
          background: "var(--color-bg-alt)",
          padding: "4px",
          borderRadius: "var(--radius)",
          border: "1px solid var(--color-border)"
        }}>
          {tabs.map(t => (
            <Button
              key={t.id}
              variant={active === t.id ? "primary" : "outline"}
              size="sm"
              onClick={() => navigate(t.to)}
              style={{
                border: "none",
                background: active === t.id ? "var(--color-primary)" : "transparent",
                color: active === t.id ? "white" : "var(--color-text)"
              }}
            >
              {t.label}
            </Button>
          ))}
        </div>
      </div>

      <NewsGrid category={active} />
    </Section>
  );
}

