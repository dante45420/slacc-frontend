import { Fragment } from "react";
import PropTypes from "prop-types";
import { useTranslation } from "react-i18next";
import { Button } from "../ui";

const chapterId = chapterIndex => `capitulo-${chapterIndex + 1}`;
const articleId = (chapterIndex, articleIndex) =>
  `capitulo-${chapterIndex + 1}-articulo-${articleIndex + 1}`;

function TocList({ chapters }) {
  return (
    <ol className="society-statutes-toc-list">
      {chapters.map((chapter, ci) => (
        <li key={chapterId(ci)}>
          <a href={`#${chapterId(ci)}`}>{chapter.title}</a>
          {chapter.articles?.length > 0 && (
            <ol>
              {chapter.articles.map((article, ai) => (
                <li key={articleId(ci, ai)}>
                  <a href={`#${articleId(ci, ai)}`}>{article.title}</a>
                </li>
              ))}
            </ol>
          )}
        </li>
      ))}
    </ol>
  );
}

const chaptersShape = PropTypes.arrayOf(
  PropTypes.shape({
    title: PropTypes.string.isRequired,
    articles: PropTypes.arrayOf(
      PropTypes.shape({
        title: PropTypes.string.isRequired,
        paragraphs: PropTypes.arrayOf(PropTypes.string),
      }),
    ),
  }),
);

TocList.propTypes = { chapters: chaptersShape.isRequired };

/**
 * Long-form statutes: a readable .prose column with a table of contents —
 * a sticky aside on wide screens, a collapsible <details> on phones.
 */
export default function StatutesDocument({ chapters, pdfUrl, footer }) {
  const { t } = useTranslation();
  const tocTitle = t("estatutos_doc.toc_title", "Índice");

  return (
    <div className="society-statutes-layout">
      <aside className="society-statutes-aside">
        <nav className="society-statutes-toc" aria-label={tocTitle}>
          <p className="society-statutes-toc-title">{tocTitle}</p>
          <TocList chapters={chapters} />
        </nav>
        {pdfUrl && (
          <Button href={pdfUrl} download variant="outline" fullWidth>
            <i className="fa-solid fa-file-arrow-down" aria-hidden="true" />
            {t("estatutos_doc.btn_download_pdf", "Descargar estatutos (PDF)")}
          </Button>
        )}
      </aside>

      <div className="society-statutes-main">
        <details className="society-statutes-toc-mobile">
          <summary>
            <i className="fa-solid fa-list-ol" aria-hidden="true" />
            {tocTitle}
          </summary>
          <nav aria-label={tocTitle}>
            <TocList chapters={chapters} />
          </nav>
        </details>

        <div className="prose society-statutes-prose">
          {chapters.map((chapter, ci) => (
            <Fragment key={chapterId(ci)}>
              <h2 id={chapterId(ci)}>{chapter.title}</h2>
              {(chapter.articles || []).map((article, ai) => (
                <Fragment key={articleId(ci, ai)}>
                  <h3 id={articleId(ci, ai)}>{article.title}</h3>
                  {(article.paragraphs || []).map((paragraph, pi) => (
                    <p key={pi}>{paragraph}</p>
                  ))}
                </Fragment>
              ))}
            </Fragment>
          ))}
        </div>

        {footer}
      </div>
    </div>
  );
}

StatutesDocument.propTypes = {
  chapters: chaptersShape.isRequired,
  pdfUrl: PropTypes.string,
  footer: PropTypes.node,
};
