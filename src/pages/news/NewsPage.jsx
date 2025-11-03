import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import NewsGrid from "../../components/NewsGrid.jsx";
import { Section, Container, Tabs } from "../../components/ui";

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
    { id: "comunicados", label: "Comunicados" },
    { id: "prensa", label: "Prensa" },
    { id: "blog", label: "Blog" },
  ];

  const handleTabChange = (tabId) => {
    setActive(tabId);
    navigate(`/noticias/${tabId}`);
  };

  return (
    <Section variant="default" padding="lg">
      <Container size="lg">
        <h1 style={{ 
          marginBottom: "var(--spacing-6)",
          fontSize: "2.5rem",
          textAlign: "center"
        }}>
          Noticias
        </h1>

        <Tabs
          tabs={tabs}
          activeTab={active}
          onChange={handleTabChange}
        />

        <div style={{ marginTop: "var(--spacing-6)" }}>
          <NewsGrid category={active} />
        </div>
      </Container>
    </Section>
  );
}

