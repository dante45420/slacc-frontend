import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Section, Card, Button } from "../../components/ui";

export default function EstatutosDocumento() {
  const { t } = useTranslation();
  return (
    <>
      <Section variant="primary" padding="lg" containerSize="lg">
        <div className="statutes-header">
          <p className="statutes-kicker">{t("estatutos_doc.kicker")}</p>
          <h1 className="statutes-title">{t("estatutos_doc.title")}</h1>
          <p className="statutes-subtitle">{t("estatutos_doc.subtitle")}</p>
        </div>
      </Section>

      <Section padding="lg" containerSize="lg">
        <Card className="statutes-card">
          <h2 className="statutes-card-title">
            {t("estatutos_doc.card_title")}
          </h2>
          <p className="statutes-card-text">{t("estatutos_doc.card_text")}</p>

          <div className="statutes-actions">
            <Button variant="primary" size="lg" disabled>
              {t("estatutos_doc.btn_download")}
            </Button>
            <Link to="/nosotros" className="btn btn-outline">
              {t("estatutos_doc.btn_back")}
            </Link>
          </div>
        </Card>
      </Section>
    </>
  );
}
