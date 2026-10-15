import { useCallback, useEffect, useState } from "react";
import { Link, NavLink, useLocation, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import PropTypes from "prop-types";
import { useAuth } from "../../auth/AuthContext";
import { Badge, Button, EmptyState, Section, Spinner, useToast } from "../../components/ui";
import NewsCarousel from "../../components/NewsCarousel.jsx";
import { ConfirmDialog } from "../../components/admin-detail/AdminDetailParts.jsx";
import { apiGet, apiPost, assetUrl } from "../../api/client";
import { sanitizeHtml } from "../../utils/sanitize";
import { formatTimestamp } from "../../utils/i18nLocale";
import { initials } from "../../data/board";
import useDocumentTitle from "../../hooks/useDocumentTitle";
import { newsErrorText, useNewsSession } from "./newsSession";
import {
  NEWS_CATEGORIES,
  categoryBadge,
  categoryLabel,
  isHtmlContent,
  readingMinutes,
  statusInfo,
  toParagraphs,
} from "../../components/news/newsUtils";

function StatusBadge({ status }) {
  const { t } = useTranslation();
  const info = statusInfo(t, status);
  // Badge's prop types don't list "danger" yet; the class exists in components.css.
  return <span className={`badge badge-${info.badge}`}>{info.label}</span>;
}

// Hidden when the file is missing, instead of an empty frame with a broken icon.
function CoverImage({ src }) {
  const [failed, setFailed] = useState(false);
  if (failed) return null;
  return (
    <figure className="news-article__cover">
      <img src={src} alt="" decoding="async" onError={() => setFailed(true)} />
    </figure>
  );
}

function ArticleBody({ content }) {
  const { t } = useTranslation();
  if (!content || !content.trim()) {
    return <p className="news-article__empty">{t("news.content_unavailable")}</p>;
  }
  if (isHtmlContent(content)) {
    return (
      <div
        className="prose news-article__body"
        dangerouslySetInnerHTML={{ __html: sanitizeHtml(content) }}
      />
    );
  }
  // Plain text from the textarea editors: keep paragraphs and line breaks.
  return (
    <div className="prose news-article__body">
      {toParagraphs(content).map((lines, i) => (
        <p key={i}>
          {lines.map((line, j) => (
            <span key={j}>
              {j > 0 && <br />}
              {line}
            </span>
          ))}
        </p>
      ))}
    </div>
  );
}

function PagerLink({ article, direction }) {
  const { t } = useTranslation();
  const isPrev = direction === "prev";
  return (
    <Link
      to={`/noticias/${article.id}`}
      className={`news-pager__link news-pager__link--${direction}`}
      rel={isPrev ? "prev" : "next"}
    >
      <span className="news-pager__label">
        {isPrev && <i className="fa-solid fa-arrow-left" aria-hidden="true"></i>}
        {isPrev ? t("news.previous", "Anterior") : t("news.next", "Siguiente")}
        {!isPrev && <i className="fa-solid fa-arrow-right" aria-hidden="true"></i>}
      </span>
      <span className="news-pager__title">{article.title}</span>
    </Link>
  );
}

export default function NewsDetail() {
  const { t, i18n } = useTranslation();
  const { id } = useParams();
  const { pathname } = useLocation();
  const { user } = useAuth();
  const toast = useToast();
  const isAdmin = user?.role === "admin";
  const isAdminRoute = pathname.startsWith("/admin/");

  const [news, setNews] = useState(null);
  const [status, setStatus] = useState("loading"); // loading | ready | notfound | error
  const [list, setList] = useState([]);
  const [busy, setBusy] = useState(null); // "approve" | "reject" while a moderation call runs
  const [confirmReject, setConfirmReject] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);
  const handleAuthError = useNewsSession();

  const endpoint = isAdminRoute ? `/admin/news/${id}/view` : `/news/${id}`;

  // Article. Depends on the id/route only (not on the auth object), and ignores
  // stale responses when the reader jumps to another article.
  useEffect(() => {
    let cancelled = false;
    setStatus("loading");
    setNews(null);
    apiGet(endpoint)
      .then(data => {
        if (cancelled) return;
        if (!data || typeof data !== "object" || !data.id) {
          setStatus("notfound");
          return;
        }
        setNews(data);
        setStatus("ready");
      })
      .catch(err => {
        if (cancelled) return;
        // Admin view with an expired/invalid session: log in again instead of an error card.
        if (isAdminRoute && handleAuthError(err)) return;
        setStatus(err?.status === 404 ? "notfound" : "error");
      });
    return () => {
      cancelled = true;
    };
  }, [endpoint, isAdminRoute, handleAuthError, reloadKey]);

  // Published list, for previous/next links and the "more news" block.
  useEffect(() => {
    let cancelled = false;
    apiGet("/news")
      .then(data => {
        if (!cancelled) setList(Array.isArray(data) ? data : []);
      })
      .catch(() => {
        if (!cancelled) setList([]);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const refresh = useCallback(async () => {
    try {
      const data = await apiGet(endpoint);
      if (data && data.id) setNews(data);
    } catch {
      // keep the current copy; the toast already reported the action result
    }
  }, [endpoint]);

  async function moderate(action) {
    setBusy(action);
    try {
      await apiPost(`/admin/news/${id}/${action}`);
      toast.success(
        action === "approve"
          ? t("news.approved_toast", "Noticia aprobada y publicada.")
          : t("news.rejected_toast", "Noticia rechazada."),
      );
      await refresh();
    } catch (err) {
      if (handleAuthError(err)) return;
      toast.error(
        newsErrorText(
          err,
          action === "approve"
            ? t("news.approve_error", "No se pudo aprobar la noticia.")
            : t("news.reject_error", "No se pudo rechazar la noticia."),
        ),
      );
    } finally {
      setBusy(null);
      if (action === "reject") setConfirmReject(false);
    }
  }

  useDocumentTitle(
    status === "ready" ? news?.title : status === "notfound" ? t("news.not_found") : undefined,
  );

  const backTo = isAdminRoute ? "/admin?tab=news" : "/noticias";
  const backLabel = isAdminRoute
    ? t("news.back_admin_list", "Volver a noticias")
    : t("news.back_to_news");
  const backLink = (
    <Link to={backTo} className="back-link">
      <i className="fa-solid fa-arrow-left" aria-hidden="true"></i>
      {backLabel}
    </Link>
  );

  if (status === "loading") {
    return (
      <div className="page news-article-page">
        <div className="page-loading news-article__loading">
          <Spinner size="lg" label={t("news.detail_loading")} />
        </div>
      </div>
    );
  }

  if (status === "notfound" || status === "error") {
    const notFound = status === "notfound";
    return (
      <div className="page news-article-page">
        <Section containerSize="sm" className="news-article__state">
          {backLink}
          <EmptyState
            className="news-state"
            icon={
              <i
                className={notFound ? "fa-regular fa-newspaper" : "fa-solid fa-triangle-exclamation"}
              ></i>
            }
            title={notFound ? t("news.not_found") : t("news.load_article_error", "No pudimos cargar la noticia")}
            description={
              notFound
                ? t("news.not_found_desc")
                : t(
                    "news.load_error_desc",
                    "Hubo un problema de conexión con el servidor. Inténtalo nuevamente en unos segundos.",
                  )
            }
            action={
              notFound ? (
                <Button to={backTo}>
                  {isAdminRoute ? backLabel : t("news.see_all", "Ver todas las noticias")}
                </Button>
              ) : (
                <Button variant="outline" onClick={() => setReloadKey(k => k + 1)}>
                  <i className="fa-solid fa-rotate-right" aria-hidden="true"></i>
                  {t("news.retry")}
                </Button>
              )
            }
          />
        </Section>
      </div>
    );
  }

  const index = list.findIndex(n => n.id === news.id);
  const prev = index > 0 ? list[index - 1] : null;
  const next = index >= 0 && index < list.length - 1 ? list[index + 1] : null;
  const hasMore = list.some(n => n.id !== news.id);
  const date = formatTimestamp(news.created_at, {}, i18n.language);
  const minutes = readingMinutes(news.content);

  return (
    <div className={`page news-article-page${hasMore ? " news-article-page--flush" : ""}`}>
      <article className="news-article">
        <header className="page-hero news-article__hero">
          <div className="page-hero__inner">
            {backLink}
            <div className="news-article__header">
              {news.category && (
                <Badge variant={categoryBadge(news.category)}>{categoryLabel(t, news.category)}</Badge>
              )}
              <h1 className="news-article__title">{news.title}</h1>
              {news.excerpt && <p className="news-article__lead">{news.excerpt}</p>}
              <div className="news-article__meta">
                {news.author_name && (
                  <span className="avatar news-article__avatar" aria-hidden="true">
                    {initials(news.author_name)}
                  </span>
                )}
                <div className="news-article__meta-text">
                  {news.author_name && (
                    <span className="news-article__author">
                      {t("news.by_author", { author: news.author_name })}
                    </span>
                  )}
                  <span className="news-article__meta-line">
                    {date && <time dateTime={news.created_at}>{date}</time>}
                    {date && <span aria-hidden="true"> · </span>}
                    <span>{t("news.reading_time", "{{count}} min de lectura", { count: minutes })}</span>
                  </span>
                </div>
              </div>
            </div>
          </div>
        </header>

        <Section className="news-article__section">
          {isAdmin && (
            <div className="news-admin-bar" role="region" aria-label={t("news.moderation", "Moderación")}>
              <div className="news-admin-bar__info">
                <span className="news-admin-bar__label">
                  <i className="fa-solid fa-shield-halved" aria-hidden="true"></i>
                  {t("news.moderation", "Moderación")}
                </span>
                <StatusBadge status={news.status} />
              </div>
              <div className="news-admin-bar__actions">
                {news.status !== "published" && (
                  <Button
                    size="sm"
                    variant="primary"
                    loading={busy === "approve"}
                    disabled={Boolean(busy)}
                    onClick={() => moderate("approve")}
                  >
                    <i className="fa-solid fa-check" aria-hidden="true"></i>
                    {t("news.approve")}
                  </Button>
                )}
                {news.status !== "rejected" && (
                  <Button
                    size="sm"
                    variant="outline"
                    loading={busy === "reject"}
                    disabled={Boolean(busy)}
                    onClick={() => setConfirmReject(true)}
                  >
                    <i className="fa-solid fa-xmark" aria-hidden="true"></i>
                    {t("news.reject")}
                  </Button>
                )}
                <Button size="sm" variant="outline" to={`/admin/news/${news.id}/edit`}>
                  <i className="fa-solid fa-pen" aria-hidden="true"></i>
                  {t("news.edit")}
                </Button>
              </div>
            </div>
          )}

          <div className="news-article__layout">
            <div className="news-article__main">
              {news.image_url && <CoverImage key={news.image_url} src={assetUrl(news.image_url)} />}

              <ArticleBody content={news.content} />

              {(prev || next) && (
                <nav className="news-pager" aria-label={t("news.pager_label", "Más artículos")}>
                  {prev && <PagerLink article={prev} direction="prev" />}
                  {next && <PagerLink article={next} direction="next" />}
                </nav>
              )}
            </div>

            <aside className="news-article__aside">
              <div className="news-aside-card">
                <h2 className="news-aside-card__title">{t("news.categories_title", "Categorías")}</h2>
                <ul className="news-aside-card__list" role="list">
                  {NEWS_CATEGORIES.map(cat => (
                    <li key={cat.id}>
                      <NavLink
                        to={`/noticias/${cat.id}`}
                        className={`news-aside-card__link${news.category === cat.id ? " is-current" : ""}`}
                      >
                        <i className={`fa-solid ${cat.icon}`} aria-hidden="true"></i>
                        <span>{t(cat.labelKey, cat.label)}</span>
                        <i className="fa-solid fa-chevron-right news-aside-card__chevron" aria-hidden="true"></i>
                      </NavLink>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="news-aside-card news-aside-card--cta">
                <span className="icon-tile" aria-hidden="true">
                  <i className="fa-solid fa-pen-to-square"></i>
                </span>
                <h2 className="news-aside-card__title">
                  {t("news.cta_title", "¿Tienes un artículo para compartir?")}
                </h2>
                <p className="news-aside-card__text">
                  {t(
                    "news.cta_text",
                    "Los socios pueden enviar artículos científicos y editoriales. El equipo editorial los revisa antes de publicarlos.",
                  )}
                </p>
                <Button variant="outline" to="/subir-noticia" fullWidth>
                  {t("news.submit_article")}
                </Button>
              </div>
            </aside>
          </div>
        </Section>
      </article>

      {isAdmin && (
        <ConfirmDialog
          isOpen={confirmReject}
          title={t("news.reject_confirm_title", "¿Rechazar esta noticia?")}
          confirmLabel={t("news.reject_confirm", "Rechazar noticia")}
          confirmVariant="danger"
          loading={busy === "reject"}
          onConfirm={() => moderate("reject")}
          onCancel={() => setConfirmReject(false)}
        >
          <p>
            {news.status === "published"
              ? t(
                  "news.reject_confirm_published",
                  "«{{title}}» dejará de mostrarse en la sección pública de noticias. Podrás volver a publicarla con «Aprobar».",
                  { title: news.title },
                )
              : t(
                  "news.reject_confirm_pending",
                  "«{{title}}» quedará rechazada y no se publicará. Podrás aprobarla más adelante desde esta vista.",
                  { title: news.title },
                )}
          </p>
        </ConfirmDialog>
      )}

      {hasMore && (
        <Section variant="muted" className="news-article__more">
          <div className="section-head">
            <div className="section-head__text">
              <p className="eyebrow">{t("news.kicker", "Publicaciones SLACC")}</p>
              <h2 className="section-title">{t("news.related_title")}</h2>
            </div>
            <Button variant="outline" to="/noticias">
              {t("news.see_all", "Ver todas las noticias")}
            </Button>
          </div>
          <NewsCarousel limit={9} excludeId={news.id} />
        </Section>
      )}
    </div>
  );
}

StatusBadge.propTypes = {
  status: PropTypes.string,
};

CoverImage.propTypes = {
  src: PropTypes.string.isRequired,
};

ArticleBody.propTypes = {
  content: PropTypes.string,
};

PagerLink.propTypes = {
  article: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
    title: PropTypes.string,
  }).isRequired,
  direction: PropTypes.oneOf(["prev", "next"]).isRequired,
};
