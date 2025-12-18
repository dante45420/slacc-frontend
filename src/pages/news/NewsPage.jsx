import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import NewsGrid from "../../components/NewsGrid.jsx";
import { Section, Container, Tabs, Button } from "../../components/ui";

export default function NewsPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const [active, setActive] = useState("articulos-cientificos");

  useEffect(() => {
    if (location.pathname.endsWith("/articulos-destacados")) {
      setActive("articulos-destacados");
    } else if (location.pathname.endsWith("/editoriales")) {
      setActive("editoriales");
    } else {
      setActive("articulos-cientificos");
    }
  }, [location.pathname]);

  const tabs = [
    { id: "articulos-cientificos", label: "Artículos científicos" },
    { id: "articulos-destacados", label: "Artículos destacados" },
    { id: "editoriales", label: "Editoriales" },
  ];

  const handleTabChange = tabId => {
    setActive(tabId);
    navigate(`/noticias/${tabId}`);
  };

  return (
    <Section variant="default" padding="lg">
      <Container size="lg">
        <div
          className="flex justify-between align-center mb-6"
          style={{ flexWrap: "wrap" }}
        >
          <h1 className="mb-0">Noticias</h1>
          <Link to="/subir-noticia">
            <Button variant="primary">Enviar artículo</Button>
          </Link>
        </div>

        <Tabs tabs={tabs} activeTab={active} onChange={handleTabChange} />

        <div className="mt-6">
          <NewsGrid category={active} />
        </div>
      </Container>
    </Section>
  );
}
