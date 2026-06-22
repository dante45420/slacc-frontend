import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Container, Section, Button } from "../../components/ui";

export default function NotFound() {
  const { t } = useTranslation();

  return (
    <Section variant="light">
      <Container>
        <div className="not-found-wrap">
          <h1 className="not-found-code">404</h1>
          <h2 className="not-found-title">{t("notFound.title")}</h2>
          <p className="not-found-description">{t("notFound.description")}</p>
          <Link to="/">
            <Button>{t("notFound.btn_home")}</Button>
          </Link>
        </div>
      </Container>
    </Section>
  );
}
