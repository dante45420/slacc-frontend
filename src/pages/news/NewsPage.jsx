import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import NewsGrid from "../../components/NewsGrid.jsx";
import { Section, Container, Tabs, Button } from "../../components/ui";

export default function NewsPage() {
  const { t } = useTranslation();
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
    { id: "articulos-cientificos", label: t("news.tab_scientific") },
    { id: "articulos-destacados", label: t("news.tab_featured") },
    { id: "editoriales", label: t("news.tab_editorials") },
  ];

  const handleTabChange = tabId => {
    setActive(tabId);
    navigate(`/noticias/${tabId}`);
  };

  return (
    <Section variant="default" padding="lg">
      <Container size="lg">
        <div className="flex justify-between align-center mb-6 flex-wrap gap-3">
          <h1 className="mb-0">{t("news.title")}</h1>
          <Link to="/subir-noticia">
            <Button variant="primary">{t("news.submit_article")}</Button>
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
