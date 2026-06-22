import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Section, Card, Button, PageHero } from "../../components/ui";

export default function EstatutosDocumento() {
  const { t } = useTranslation();
  return (
    <>
      <Section variant="primary" padding="lg" containerSize="lg">
        <PageHero
          kicker={t("estatutos_doc.kicker")}
          title={t("estatutos_doc.title")}
          subtitle={t("estatutos_doc.subtitle")}
        />
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
