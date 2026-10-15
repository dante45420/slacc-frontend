import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuth } from "../../auth/AuthContext";
import { apiGet, apiPost, apiPostForm } from "../../api/client";
import {
  Alert,
  Button,
  EmptyState,
  Input,
  Section,
  Select,
  Spinner,
  Textarea,
  useToast,
} from "../../components/ui";
import NewsCard from "../../components/news/NewsCard.jsx";
import NewsImageField from "../../components/news/NewsImageField.jsx";
import {
  DEFAULT_CATEGORY,
  EXCERPT_MAX,
  NEWS_CATEGORIES,
  TITLE_MAX,
  statusInfo,
} from "../../components/news/newsUtils";
import useDocumentTitle from "../../hooks/useDocumentTitle";
import { clearDraft, draftFields, newsErrorText, readDraft, useNewsSession } from "./newsSession";

const EMPTY = {
  title: "",
  excerpt: "",
  content: "",
  category: DEFAULT_CATEGORY,
};

const FIELD_ORDER = ["title", "category", "excerpt", "content"];

/**
 * Admin create/edit form. Only fields the API stores are offered: title,
 * excerpt, content, category and the cover image (News model). New articles
 * are created through POST /news (always "pending") and then approved through
 * POST /admin/news/<id>/approve when "publish now" is checked.
 */
export default function NewsEditor() {
  const { t } = useTranslation();
  const { id } = useParams();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const toast = useToast();
  const { user } = useAuth();
  const handleAuthError = useNewsSession();
  const isEdit = Boolean(id);

  // Text kept from a save that hit an expired session (restored after logging in again).
  const [restored] = useState(() => readDraft(pathname));
  const [form, setForm] = useState(() =>
    restored && !isEdit ? { ...EMPTY, ...draftFields(restored) } : EMPTY,
  );
  const [article, setArticle] = useState(null); // loaded copy (edit mode)
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState("");
  const [publishNow, setPublishNow] = useState(true);
  const [loadState, setLoadState] = useState(isEdit ? "loading" : "ready"); // loading | ready | notfound | error
  const [reloadKey, setReloadKey] = useState(0);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});

  useEffect(() => {
    if (restored) clearDraft(pathname);
  }, [restored, pathname]);

  useDocumentTitle(
    isEdit ? t("news.editor.title_edit", "Editar noticia") : t("news.editor.title_new", "Nueva noticia"),
  );

  useEffect(() => {
    if (!isEdit) {
      setLoadState("ready");
      return undefined;
    }
    let cancelled = false;
    setLoadState("loading");
    apiGet(`/admin/news/${id}/view`)
      .then(data => {
        if (cancelled) return;
        if (!data || !data.id) {
          setLoadState("notfound");
          return;
        }
        setArticle(data);
        setForm(
          restored
            ? { ...EMPTY, ...draftFields(restored) }
            : {
                title: data.title || "",
                excerpt: data.excerpt || "",
                content: data.content || "",
                category: data.category || DEFAULT_CATEGORY,
              },
        );
        setLoadState("ready");
      })
      .catch(err => {
        if (cancelled) return;
        if (handleAuthError(err)) return;
        setLoadState(err?.status === 404 ? "notfound" : "error");
      });
    return () => {
      cancelled = true;
    };
  }, [id, isEdit, reloadKey, restored, handleAuthError]);

  // Object URL for the live card preview (revoked when the file changes).
  useEffect(() => {
    if (!imageFile) {
      setImagePreview("");
      return undefined;
    }
    const url = URL.createObjectURL(imageFile);
    setImagePreview(url);
    return () => URL.revokeObjectURL(url);
  }, [imageFile]);

  function validate(data) {
    const next = {};
    if (!data.title.trim()) {
      next.title = t("news.error_title_required", "Escribe el título de la noticia.");
    }
    if (!data.content.trim()) {
      next.content = t("news.error_content_required", "Escribe el contenido de la noticia.");
    }
    return next;
  }

  function update(e) {
    const { name, value } = e.target;
    const next = { ...form, [name]: value };
    setForm(next);
    // Once a field has been flagged, re-check it as the user types.
    if (fieldErrors[name]) {
      setFieldErrors(prev => ({ ...prev, [name]: validate(next)[name] }));
    }
  }

  function showFieldErrors(found) {
    setFieldErrors(found);
    const first = FIELD_ORDER.find(key => found[key]);
    if (first) document.getElementById(`news-editor-${first}`)?.focus();
    return Boolean(first);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (saving) return;
    setError("");

    if (showFieldErrors(validate(form))) return;

    const body = new FormData();
    body.append("title", form.title.trim());
    body.append("excerpt", form.excerpt.trim());
    body.append("content", form.content.trim());
    body.append("category", form.category);
    if (imageFile) body.append("image", imageFile);

    // Stays true until we navigate away, so the form cannot be sent twice.
    setSaving(true);
    try {
      if (isEdit) {
        await apiPostForm(`/admin/news/${id}/edit`, body);
        toast.success(t("news.editor.updated_toast", "Cambios guardados."));
        navigate(`/admin/news/${id}/view`, { replace: true });
        return;
      }

      const created = await apiPostForm("/news", body);
      const newId = created?.id;
      if (publishNow && newId) {
        try {
          await apiPost(`/admin/news/${newId}/approve`);
          toast.success(t("news.editor.published_toast", "Noticia creada y publicada."));
        } catch {
          toast.warning(
            t(
              "news.editor.publish_failed_toast",
              "La noticia se creó, pero quedó pendiente: no se pudo publicar. Apruébala desde su vista.",
            ),
          );
        }
      } else {
        toast.success(
          t("news.editor.pending_toast", "Noticia creada. Quedó pendiente de revisión."),
        );
      }
      navigate(newId ? `/admin/news/${newId}/view` : "/admin?tab=news", { replace: true });
    } catch (err) {
      setSaving(false);
      if (handleAuthError(err, form)) return;
      if (err?.status === 400 && err.fields) {
        const found = validate(form);
        if (err.fields.category) {
          found.category = t("news.error_category_invalid", "Elige una categoría de la lista.");
        }
        if (showFieldErrors(found)) return;
      }
      setError(newsErrorText(err, t("news.editor.save_error", "No se pudo guardar la noticia.")));
    }
  }

  const backLink = (
    <Link to="/admin?tab=news" className="back-link">
      <i className="fa-solid fa-arrow-left" aria-hidden="true"></i>
      {t("news.back_admin_list", "Volver a noticias")}
    </Link>
  );

  const status = article ? statusInfo(t, article.status) : null;
  const editTitle = t("news.editor.title_edit", "Editar noticia");

  // Compact admin hero, same as /admin/users/:id/edit (admin-detail-hero).
  const hero = (
    <header className="page-hero admin-detail-hero news-editor__hero">
      <div className="page-hero__inner">
        {backLink}
        <div className="admin-detail-hero__eyebrow">
          <p className="page-hero-kicker">{isEdit ? editTitle : t("news.title")}</p>
          {status && <span className={`badge badge-${status.badge}`}>{status.label}</span>}
        </div>
        <h1 className="page-hero-title admin-detail-hero__title">
          {isEdit ? article?.title || editTitle : t("news.editor.title_new", "Nueva noticia")}
        </h1>
        {!isEdit && (
          <p className="page-hero-subtitle admin-detail-hero__subtitle">
            {t(
              "news.editor.subtitle_new",
              "Redacta una noticia para la sección pública. Puedes publicarla de inmediato o dejarla pendiente.",
            )}
          </p>
        )}
      </div>
    </header>
  );

  if (loadState === "loading") {
    return (
      <div className="page news-editor-page">
        {hero}
        <div className="page-loading">
          <Spinner size="lg" label={t("news.detail_loading")} />
        </div>
      </div>
    );
  }

  if (loadState === "notfound" || loadState === "error") {
    const notFound = loadState === "notfound";
    return (
      <div className="page news-editor-page">
        {hero}
        <Section containerSize="sm">
          <EmptyState
            className="news-state"
            icon={
              <i className={notFound ? "fa-regular fa-newspaper" : "fa-solid fa-triangle-exclamation"}></i>
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
              <div className="news-state__actions">
                {!notFound && (
                  <Button variant="primary" onClick={() => setReloadKey(k => k + 1)}>
                    {t("news.retry")}
                  </Button>
                )}
                <Button variant={notFound ? "primary" : "outline"} to="/admin?tab=news">
                  {t("news.back_admin_list", "Volver a noticias")}
                </Button>
              </div>
            }
          />
        </Section>
      </div>
    );
  }

  const previewArticle = {
    id: article?.id || "preview",
    title: form.title || t("news.editor.preview_title", "Título de la noticia"),
    excerpt: form.excerpt,
    category: form.category,
    image_url: imagePreview || article?.image_url || "",
    created_at: article?.created_at || new Date().toISOString().replace("Z", ""),
    author_name: article?.author_name || user?.name || "",
  };

  return (
    <div className="page news-editor-page">
      {hero}

      <Section>
        <div className="news-form-layout">
          <div className="news-form-layout__main">
            <form className="card news-form-card" onSubmit={handleSubmit} noValidate>
              {restored && (
                <Alert variant="info" className="news-form-card__restored">
                  {t(
                    "news.draft_restored",
                    "Tu sesión había expirado. Recuperamos el texto que escribiste: revísalo, vuelve a adjuntar la imagen si corresponde e inténtalo de nuevo.",
                  )}
                </Alert>
              )}
              <div className="form-section">
                <h2 className="form-section-title">{t("news.editor.section_basic", "Información básica")}</h2>
                <div className="form-grid">
                  <Input
                    id="news-editor-title"
                    className="span-2"
                    label={t("news.field_title", "Título")}
                    name="title"
                    value={form.title}
                    onChange={update}
                    maxLength={TITLE_MAX}
                    placeholder={t("news.field_title_placeholder", "Ej.: Nuevas técnicas en artroplastia de cadera")}
                    error={fieldErrors.title}
                    required
                    disabled={saving}
                  />
                  <Select
                    id="news-editor-category"
                    label={t("news.field_category", "Categoría")}
                    name="category"
                    value={form.category}
                    onChange={update}
                    error={fieldErrors.category}
                    required
                    disabled={saving}
                  >
                    {NEWS_CATEGORIES.map(cat => (
                      <option key={cat.id} value={cat.id}>
                        {t(cat.labelKey, cat.label)}
                      </option>
                    ))}
                  </Select>
                  <Input
                    label={t("news.field_author", "Autor")}
                    value={article?.author_name || user?.name || ""}
                    readOnly
                    disabled
                    helperText={t("news.editor.author_help", "Se asigna automáticamente a quien crea la noticia.")}
                  />
                  <Textarea
                    id="news-editor-excerpt"
                    className="span-2"
                    label={t("news.field_excerpt", "Resumen")}
                    name="excerpt"
                    value={form.excerpt}
                    onChange={update}
                    rows={3}
                    maxLength={EXCERPT_MAX}
                    disabled={saving}
                    helperText={t(
                      "news.field_excerpt_help",
                      "Una o dos frases que se muestran en el listado de noticias ({{count}}/{{max}}).",
                      { count: form.excerpt.length, max: EXCERPT_MAX },
                    )}
                  />
                </div>
              </div>

              <div className="form-section">
                <h2 className="form-section-title">{t("news.editor.section_content", "Contenido")}</h2>
                <Textarea
                  id="news-editor-content"
                  label={t("news.field_content", "Contenido")}
                  name="content"
                  value={form.content}
                  onChange={update}
                  rows={14}
                  error={fieldErrors.content}
                  required
                  disabled={saving}
                  helperText={t(
                    "news.editor.content_help",
                    "Separa los párrafos con una línea en blanco. También se admite HTML básico (títulos, listas, enlaces).",
                  )}
                />
              </div>

              <div className="form-section">
                <h2 className="form-section-title">{t("news.editor.section_image", "Imagen principal")}</h2>
                <NewsImageField
                  label={t("news.field_image_admin", "Imagen de portada")}
                  file={imageFile}
                  currentUrl={article?.image_url || ""}
                  onChange={setImageFile}
                  disabled={saving}
                />
              </div>

              <div className="form-section">
                <h2 className="form-section-title">{t("news.editor.section_publish", "Publicación")}</h2>
                {isEdit ? (
                  <div className="news-editor__status">
                    <p className="news-editor__status-row">
                      <span>{t("news.editor.current_status", "Estado actual")}</span>
                      <span className={`badge badge-${status.badge}`}>{status.label}</span>
                    </p>
                    <p className="form-helper">
                      {t(
                        "news.editor.status_help",
                        "Para aprobar o rechazar la noticia, usa los controles de moderación en su vista.",
                      )}{" "}
                      <Link to={`/admin/news/${id}/view`} className="news-editor__link">
                        {t("news.editor.open_view", "Abrir vista de la noticia")}
                      </Link>
                    </p>
                  </div>
                ) : (
                  <label className="news-editor__check">
                    <input
                      type="checkbox"
                      checked={publishNow}
                      onChange={e => setPublishNow(e.target.checked)}
                      disabled={saving}
                    />
                    <span>
                      <span className="news-editor__check-title">
                        {t("news.editor.publish_now", "Publicar inmediatamente")}
                      </span>
                      <span className="news-editor__check-help">
                        {t(
                          "news.editor.publish_now_help",
                          "Si lo desmarcas, la noticia quedará pendiente de revisión en el panel de administración.",
                        )}
                      </span>
                    </span>
                  </label>
                )}
              </div>

              {error && (
                <Alert variant="error" className="news-form-card__alert">
                  {error}
                </Alert>
              )}

              <div className="form-actions">
                <Button variant="outline" to="/admin?tab=news" disabled={saving}>
                  {t("common.cancel")}
                </Button>
                <Button type="submit" variant="primary" loading={saving}>
                  <i className="fa-solid fa-floppy-disk" aria-hidden="true"></i>
                  {isEdit
                    ? t("news.editor.save", "Guardar cambios")
                    : publishNow
                      ? t("news.editor.create_publish", "Crear y publicar")
                      : t("news.editor.create", "Crear noticia")}
                </Button>
              </div>
            </form>
          </div>

          <aside className="news-form-layout__aside">
            <div className="news-aside-card">
              <h2 className="news-aside-card__title">{t("news.editor.preview", "Vista previa en el listado")}</h2>
              <NewsCard article={previewArticle} preview />
            </div>
          </aside>
        </div>
      </Section>
    </div>
  );
}
