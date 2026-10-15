import { useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuth } from "../../auth/AuthContext";
import { apiPostForm } from "../../api/client";
import {
  Alert,
  Button,
  Input,
  PageHero,
  Section,
  Select,
  Textarea,
  useToast,
} from "../../components/ui";
import NewsImageField from "../../components/news/NewsImageField.jsx";
import {
  DEFAULT_CATEGORY,
  EXCERPT_MAX,
  NEWS_CATEGORIES,
  TITLE_MAX,
} from "../../components/news/newsUtils";
import { clearDraft, draftFields, newsErrorText, readDraft, useNewsSession } from "./newsSession";

const EMPTY = { title: "", excerpt: "", content: "", category: DEFAULT_CATEGORY };
const FIELD_ORDER = ["title", "category", "excerpt", "content"];

export default function SubmitNews() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { pathname } = useLocation();
  const toast = useToast();
  const handleAuthError = useNewsSession();
  // Text kept from a submission that hit an expired session (restored after logging in again).
  const [restored, setRestored] = useState(() => readDraft(pathname));
  const [form, setForm] = useState(() => (restored ? { ...EMPTY, ...draftFields(restored) } : EMPTY));
  const [imageFile, setImageFile] = useState(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});
  const [submitted, setSubmitted] = useState(null); // { id } after success
  const successRef = useRef(null);

  useEffect(() => {
    if (restored) clearDraft(pathname);
  }, [restored, pathname]);

  useEffect(() => {
    if (submitted) successRef.current?.focus();
  }, [submitted]);

  function validate(data) {
    const next = {};
    if (!data.title.trim()) {
      next.title = t("news.submit.error_title_required", "Escribe el título del artículo.");
    }
    if (!data.content.trim()) {
      next.content = t("news.submit.error_content_required", "Escribe el contenido del artículo.");
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
    if (first) document.getElementById(`submit-news-${first}`)?.focus();
    return Boolean(first);
  }

  async function submit(e) {
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

    setSaving(true);
    try {
      const data = await apiPostForm("/news", body);
      toast.success(t("news.submit.success_toast", "Artículo enviado para revisión."));
      setSubmitted({ id: data?.id });
      setForm(EMPTY);
      setImageFile(null);
      setRestored(null);
    } catch (err) {
      if (handleAuthError(err, form)) return;
      if (err?.status === 400 && err.fields) {
        const found = validate(form);
        if (err.fields.category) {
          found.category = t("news.error_category_invalid", "Elige una categoría de la lista.");
        }
        if (showFieldErrors(found)) return;
      }
      setError(newsErrorText(err, t("news.submit.error", "No pudimos enviar el artículo. Inténtalo nuevamente.")));
    } finally {
      setSaving(false);
    }
  }

  function startOver() {
    setSubmitted(null);
    setError("");
    setFieldErrors({});
  }

  return (
    <div className="page news-submit-page">
      <PageHero
        kicker={t("news.submit.kicker", "Comunidad SLACC")}
        title={t("news.submit.title", "Enviar artículo")}
        subtitle={t(
          "news.submit.subtitle",
          "Comparte un artículo científico, una publicación destacada o un editorial con los socios de la Sociedad. El equipo editorial revisará tu envío antes de publicarlo.",
        )}
      />

      <Section>
        <div className="news-form-layout">
          <div className="news-form-layout__main">
            {submitted ? (
              <div className="card news-success" role="status">
                <span className="news-success__icon" aria-hidden="true">
                  <i className="fa-solid fa-check"></i>
                </span>
                <h2 className="news-success__title" tabIndex={-1} ref={successRef}>
                  {t("news.submit.success_title", "¡Gracias! Recibimos tu artículo")}
                </h2>
                <p className="news-success__text">
                  {t(
                    "news.submit.success_text",
                    "Tu envío quedó en estado «Pendiente». Lo publicaremos en la sección Noticias en cuanto el equipo editorial lo apruebe.",
                  )}
                </p>
                {submitted.id && (
                  <p className="news-success__ref">
                    {t("news.submit.reference", "Referencia del envío: #{{id}}", { id: submitted.id })}
                  </p>
                )}
                <div className="news-success__actions">
                  <Button variant="primary" to="/noticias">
                    {t("news.back_to_news")}
                  </Button>
                  <Button variant="outline" onClick={startOver}>
                    {t("news.submit.another", "Enviar otro artículo")}
                  </Button>
                </div>
              </div>
            ) : (
              <form className="card news-form-card" onSubmit={submit} noValidate>
                {restored && (
                  <Alert variant="info" className="news-form-card__restored">
                    {t(
                      "news.draft_restored",
                      "Tu sesión había expirado. Recuperamos el texto que escribiste: revísalo, vuelve a adjuntar la imagen si corresponde e inténtalo de nuevo.",
                    )}
                  </Alert>
                )}
                <div className="form-section">
                  <h2 className="form-section-title">{t("news.submit.section_article", "Datos del artículo")}</h2>
                  <div className="form-grid">
                    <Input
                      id="submit-news-title"
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
                      id="submit-news-category"
                      label={t("news.field_category", "Categoría")}
                      name="category"
                      value={form.category}
                      onChange={update}
                      error={fieldErrors.category}
                      disabled={saving}
                      required
                    >
                      {NEWS_CATEGORIES.map(cat => (
                        <option key={cat.id} value={cat.id}>
                          {t(cat.labelKey, cat.label)}
                        </option>
                      ))}
                    </Select>
                    <Input
                      label={t("news.field_author", "Autor")}
                      value={user?.name || ""}
                      readOnly
                      disabled
                      helperText={t("news.submit.author_help", "Se publicará con el nombre de tu cuenta.")}
                    />
                    <Textarea
                      id="submit-news-excerpt"
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
                    <Textarea
                      id="submit-news-content"
                      className="span-2"
                      label={t("news.field_content", "Contenido")}
                      name="content"
                      value={form.content}
                      onChange={update}
                      rows={12}
                      error={fieldErrors.content}
                      required
                      disabled={saving}
                      helperText={t(
                        "news.field_content_help",
                        "Separa los párrafos con una línea en blanco.",
                      )}
                    />
                  </div>
                </div>

                <div className="form-section">
                  <h2 className="form-section-title">{t("news.submit.section_image", "Imagen")}</h2>
                  <NewsImageField
                    label={t("news.field_image", "Imagen de portada (opcional)")}
                    file={imageFile}
                    onChange={setImageFile}
                    disabled={saving}
                  />
                </div>

                {error && (
                  <Alert variant="error" className="news-form-card__alert">
                    {error}
                  </Alert>
                )}

                <div className="form-actions">
                  <Button variant="outline" to="/noticias" disabled={saving}>
                    {t("common.cancel")}
                  </Button>
                  <Button type="submit" variant="primary" loading={saving}>
                    <i className="fa-solid fa-paper-plane" aria-hidden="true"></i>
                    {t("news.submit.send", "Enviar para revisión")}
                  </Button>
                </div>
              </form>
            )}
          </div>

          <aside className="news-form-layout__aside">
            <div className="news-aside-card">
              <h2 className="news-aside-card__title">{t("news.submit.how_title", "Cómo funciona")}</h2>
              <ol className="news-steps" role="list">
                <li className="news-steps__item">
                  <span className="news-steps__num" aria-hidden="true">1</span>
                  <div>
                    <p className="news-steps__title">{t("news.submit.step1_title", "Envía tu artículo")}</p>
                    <p className="news-steps__text">
                      {t("news.submit.step1_text", "Completa el formulario con el título, la categoría y el contenido.")}
                    </p>
                  </div>
                </li>
                <li className="news-steps__item">
                  <span className="news-steps__num" aria-hidden="true">2</span>
                  <div>
                    <p className="news-steps__title">{t("news.submit.step2_title", "Revisión editorial")}</p>
                    <p className="news-steps__text">
                      {t("news.submit.step2_text", "Tu envío queda «Pendiente» hasta que un administrador lo revise.")}
                    </p>
                  </div>
                </li>
                <li className="news-steps__item">
                  <span className="news-steps__num" aria-hidden="true">3</span>
                  <div>
                    <p className="news-steps__title">{t("news.submit.step3_title", "Publicación")}</p>
                    <p className="news-steps__text">
                      {t("news.submit.step3_text", "Una vez aprobado, aparece en la sección Noticias con tu nombre.")}
                    </p>
                  </div>
                </li>
              </ol>
            </div>
            <div className="news-aside-card news-aside-card--muted">
              <h2 className="news-aside-card__title">{t("news.submit.tips_title", "Recomendaciones")}</h2>
              <ul className="news-tips" role="list">
                <li>{t("news.submit.tip1", "Usa un título claro y específico.")}</li>
                <li>{t("news.submit.tip2", "Incluye un resumen breve: es lo primero que leen los socios.")}</li>
                <li>{t("news.submit.tip3", "Si no subes una imagen, se usará una imagen genérica.")}</li>
              </ul>
            </div>
          </aside>
        </div>
      </Section>
    </div>
  );
}
