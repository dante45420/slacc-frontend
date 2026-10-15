import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Section, Button, PageHero, Spinner } from "../../components/ui";
import StatutesDocument from "../../components/society/StatutesDocument.jsx";
import {
  STATUTES_CHAPTERS,
  STATUTES_PDF_PATH,
} from "../../components/society/statutesContent.js";

const RELATED_LINKS = [
  {
    to: "/nosotros/mision",
    label: "header.mission",
    icon: "fa-solid fa-bullseye",
  },
  {
    to: "/nosotros/directiva",
    label: "header.board",
    icon: "fa-solid fa-users",
  },
  {
    to: "/nosotros/historia",
    label: "header.history",
    icon: "fa-solid fa-landmark",
  },
  { to: "/comites", label: "header.committees", icon: "fa-solid fa-sitemap" },
];

/**
 * Checks whether a static file exists in public/. The SPA fallback answers
 * missing files with index.html, so a real PDF is recognised by its type.
 * Returns "checking" | "available" | "missing".
 */
function useStaticPdf(path) {
  const [status, setStatus] = useState(path ? "checking" : "missing");

  useEffect(() => {
    if (!path) return undefined;
    let active = true;
    // Static asset on the frontend origin (not the API), so plain fetch. A
    // 1-byte range request keeps it cheap even when the PDF exists.
    fetch(path, { cache: "no-store", headers: { Range: "bytes=0-0" } })
      .then(res => {
        const type = res.headers.get("content-type") || "";
        if (active) {
          setStatus(res.ok && type.includes("pdf") ? "available" : "missing");
        }
      })
      .catch(() => {
        if (active) setStatus("missing");
      });
    return () => {
      active = false;
    };
  }, [path]);

  return status;
}

export default function EstatutosDocumento() {
  const { t } = useTranslation();
  const pdfStatus = useStaticPdf(STATUTES_PDF_PATH);
  const pdfUrl =
    pdfStatus === "available" ? encodeURI(STATUTES_PDF_PATH) : null;
  const hasText = STATUTES_CHAPTERS.length > 0;
  const { hash } = useLocation();

  // Deep links (/nosotros/estatutos#capitulo-2-articulo-3): this page is
  // lazy-loaded, so the target only exists once it has mounted.
  useEffect(() => {
    if (!hasText || !hash) return;
    document.getElementById(decodeURIComponent(hash.slice(1)))?.scrollIntoView();
  }, [hasText, hash]);

  const downloadButton = pdfUrl && (
    <Button href={pdfUrl} download variant="primary" size="lg">
      <i className="fa-solid fa-file-arrow-down" aria-hidden="true" />
      {t("estatutos_doc.btn_download_pdf", "Descargar estatutos (PDF)")}
    </Button>
  );

  const backButton = (
    <Button variant="ghost" to="/nosotros">
      <i className="fa-solid fa-arrow-left" aria-hidden="true" />
      {t("estatutos_doc.btn_back")}
    </Button>
  );

  return (
    <div className="page society-page">
      <PageHero
        kicker={t("estatutos_doc.kicker")}
        title={t("estatutos_doc.title")}
        subtitle={t(
          "estatutos_doc.intro",
          "Marco normativo que rige la organización, el funcionamiento y la membresía de la Sociedad Latinoamericana de Cirugía de Cadera.",
        )}
      >
        {hasText && downloadButton && (
          <div className="page-hero__actions">{downloadButton}</div>
        )}
      </PageHero>

      {hasText ? (
        <Section>
          <StatutesDocument
            chapters={STATUTES_CHAPTERS}
            pdfUrl={pdfUrl}
            footer={<div className="society-statutes-footer">{backButton}</div>}
          />
        </Section>
      ) : (
        <Section>
          <div className="society-statutes-pending">
            <div className="society-statutes-status" aria-live="polite">
              <span className="icon-tile" aria-hidden="true">
                <i className="fa-solid fa-file-lines" />
              </span>
              <h2 className="society-statutes-status-title">
                {t("estatutos_doc.card_title")}
              </h2>

              {pdfStatus === "checking" ? (
                <div className="society-statutes-status-loading">
                  <Spinner size="sm" />
                </div>
              ) : (
                <>
                  <p className="society-statutes-status-text">
                    {pdfUrl
                      ? t(
                          "estatutos_doc.available_text",
                          "Descarga la versión oficial vigente de los estatutos de la Sociedad en formato PDF.",
                        )
                      : t(
                          "estatutos_doc.pending_text",
                          "La versión oficial de los estatutos se publicará en esta página una vez aprobada por la Mesa Directiva. Si necesitas consultarlos antes, escribe a la secretaría de la Sociedad.",
                        )}
                  </p>
                  <div className="society-statutes-status-actions">
                    {downloadButton || (
                      <Button variant="primary" to="/contacto">
                        <i
                          className="fa-regular fa-envelope"
                          aria-hidden="true"
                        />
                        {t(
                          "estatutos_doc.btn_contact",
                          "Escribir a la secretaría",
                        )}
                      </Button>
                    )}
                    {backButton}
                  </div>
                </>
              )}
            </div>

            <nav
              className="society-statutes-related"
              aria-labelledby="society-statutes-related-title"
            >
              <h2
                id="society-statutes-related-title"
                className="society-statutes-related-title"
              >
                {t("estatutos_doc.related_title", "También en La Sociedad")}
              </h2>
              <ul>
                {RELATED_LINKS.map(link => (
                  <li key={link.to}>
                    <Link
                      to={link.to}
                      className="society-statutes-related-link"
                    >
                      <i className={link.icon} aria-hidden="true" />
                      <span>{t(link.label)}</span>
                      <i
                        className="fa-solid fa-arrow-right society-statutes-related-arrow"
                        aria-hidden="true"
                      />
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          </div>
        </Section>
      )}
    </div>
  );
}
