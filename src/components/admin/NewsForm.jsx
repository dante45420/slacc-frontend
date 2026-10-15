import { useState } from "react";
import PropTypes from "prop-types";
import { useTranslation } from "react-i18next";
import { apiPost, apiPostForm, apiPut } from "../../api/client";
import { Button, Input, Select, Textarea } from "../ui";
import { FormAlert } from "./AdminCommon";
import ImagePicker from "./ImagePicker";
import { NEWS_CATEGORIES, NEWS_STATUSES, useAdminLabels } from "./adminLabels";
import { errorMessage, toNumber } from "./adminUtils";
import useAdminSession from "./useAdminSession";

/**
 * Create or edit a news article.
 * - Create: multipart POST /news (always lands as "pending"), then
 *   POST /admin/news/:id/approve when "Publicar ahora" is checked.
 * - Edit: PUT /admin/news/:id for the text fields and order; a new image goes
 *   through the multipart POST /admin/news/:id/edit; "Publicada" uses the
 *   approve endpoint (older backends only accept pending/rejected in PUT).
 */
export default function NewsForm({ news, onSaved, onCancel }) {
  const { t } = useTranslation();
  const labels = useAdminLabels();
  const { handleAuthError } = useAdminSession();
  const isEdit = Boolean(news);
  const [form, setForm] = useState({
    title: news?.title || "",
    category: news?.category || NEWS_CATEGORIES[0],
    excerpt: news?.excerpt || "",
    content: news?.content || "",
    status: news?.status || "pending",
    order_index: news?.order_index ?? 0,
    publish_now: true,
  });
  const [imageFile, setImageFile] = useState(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});

  const set = field => e => {
    const value = e.target.type === "checkbox" ? e.target.checked : e.target.value;
    setForm(prev => ({ ...prev, [field]: value }));
    if (fieldErrors[field]) setFieldErrors(prev => ({ ...prev, [field]: undefined }));
  };

  async function create() {
    const body = new FormData();
    body.append("title", form.title.trim());
    body.append("excerpt", form.excerpt.trim());
    body.append("content", form.content);
    body.append("category", form.category);
    if (imageFile) body.append("image", imageFile);
    const created = await apiPostForm("/news", body);
    if (form.publish_now && created?.id) {
      try {
        await apiPost(`/admin/news/${created.id}/approve`);
      } catch (err) {
        if (handleAuthError(err)) return null;
        return {
          type: "created",
          warning: t(
            "admin.news_form.publish_warning",
            "La noticia se guardó como pendiente, pero no se pudo publicar. Publícala desde su ficha.",
          ),
        };
      }
    }
    return { type: "created", published: Boolean(form.publish_now) };
  }

  async function update() {
    const payload = {
      title: form.title.trim(),
      excerpt: form.excerpt.trim(),
      content: form.content,
      category: form.category,
      order_index: toNumber(form.order_index, 0),
    };
    const statusChanged = form.status !== news.status;
    if (statusChanged && form.status !== "published") payload.status = form.status;
    // A failure here keeps the modal open with the backend's message.
    await apiPut(`/admin/news/${news.id}`, payload);

    // The text is saved from here on: later failures become a warning, the
    // modal closes and the list reloads, so nothing looks unsaved.
    const warnings = [];
    if (imageFile) {
      try {
        const body = new FormData();
        body.append("image", imageFile);
        await apiPostForm(`/admin/news/${news.id}/edit`, body);
      } catch (err) {
        if (handleAuthError(err)) return null;
        warnings.push(
          t("admin.news_form.image_warning", {
            message: errorMessage(err, ""),
            defaultValue: "Los cambios se guardaron, pero la imagen no se pudo subir. {{message}}",
          }).trim(),
        );
      }
    }
    if (statusChanged && form.status === "published") {
      try {
        await apiPost(`/admin/news/${news.id}/approve`);
      } catch (err) {
        if (handleAuthError(err)) return null;
        warnings.push(
          t(
            "admin.news_form.status_warning",
            "Los cambios se guardaron, pero la noticia no se pudo publicar.",
          ),
        );
      }
    }
    return { type: "updated", warning: warnings.join(" ") || null };
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (saving) return;
    const errs = {};
    if (!form.title.trim()) {
      errs.title = t("admin.news_form.title_required", "El título es obligatorio.");
    }
    // POST /news rejects an article without content.
    if (!isEdit && !form.content.trim()) {
      errs.content = t("admin.news_form.content_required", "El contenido es obligatorio.");
    }
    setFieldErrors(errs);
    if (Object.keys(errs).length > 0) {
      setError("");
      const first = document.getElementById(errs.title ? "news-form-title" : "news-form-content");
      first?.focus({ preventScroll: true });
      first?.scrollIntoView({ block: "center" });
      return;
    }
    setError("");
    setSaving(true);
    try {
      const result = isEdit ? await update() : await create();
      if (result) onSaved(result);
    } catch (err) {
      if (handleAuthError(err)) return;
      setError(
        errorMessage(
          err,
          isEdit
            ? t("admin.news_form.update_error", "No se pudo guardar la noticia.")
            : t("admin.news_form.create_error", "No se pudo crear la noticia."),
        ),
      );
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="admin-form" noValidate>
      <FormAlert message={error} />

      <div className="form-grid">
        <Input
          className="span-2"
          label={t("admin.news_form.title", "Título")}
          id="news-form-title"
          placeholder={t("admin.news_form.title_placeholder", "Título de la noticia")}
          value={form.title}
          onChange={set("title")}
          error={fieldErrors.title}
          required
        />
        <div className={`span-2 admin-news-meta${isEdit ? " admin-news-meta--edit" : ""}`}>
          <Select
            label={t("admin.news_form.category", "Categoría")}
            id="news-form-category"
            value={form.category}
            onChange={set("category")}
            placeholder=""
            options={NEWS_CATEGORIES.map(value => ({ value, label: labels.category(value) }))}
          />
          {isEdit ? (
            <Select
              label={t("admin.news_form.status", "Estado")}
              id="news-form-status"
              value={form.status}
              onChange={set("status")}
              placeholder=""
              options={NEWS_STATUSES.map(value => ({ value, label: labels.news(value).label }))}
            />
          ) : (
            <div className="admin-check admin-check--inline">
              <label className="admin-check__label" htmlFor="news-form-publish">
                <input
                  id="news-form-publish"
                  type="checkbox"
                  checked={form.publish_now}
                  onChange={set("publish_now")}
                  aria-describedby="news-form-publish-help"
                />
                <span>{t("admin.news_form.publish_now", "Publicar ahora")}</span>
              </label>
              <p id="news-form-publish-help" className="form-helper">
                {t(
                  "admin.news_form.publish_help",
                  "Si la desmarcas, quedará pendiente de aprobación.",
                )}
              </p>
            </div>
          )}
          {isEdit && (
            <Input
              label={t("admin.news_form.order", "Orden")}
              id="news-form-order"
              type="number"
              inputMode="numeric"
              step="1"
              value={form.order_index}
              onChange={set("order_index")}
              helperText={t("admin.news_form.order_help", "Menor número, más arriba.")}
            />
          )}
        </div>
        <Textarea
          className="span-2 admin-textarea-short"
          label={t("admin.news_form.excerpt", "Resumen")}
          id="news-form-excerpt"
          rows={2}
          placeholder={t("admin.news_form.excerpt_placeholder", "Una o dos frases que resuman la noticia")}
          value={form.excerpt}
          onChange={set("excerpt")}
        />
        <Textarea
          className="span-2"
          label={t("admin.news_form.content", "Contenido")}
          id="news-form-content"
          rows={8}
          placeholder={t("admin.news_form.content_placeholder", "Texto completo de la noticia")}
          value={form.content}
          onChange={set("content")}
          error={fieldErrors.content}
          required={!isEdit}
        />
        <div className="span-2">
          <ImagePicker
            id="news-form-image"
            label={t("admin.news_form.image", "Imagen de portada")}
            hint={
              isEdit && news.image_url
                ? t("admin.news_form.image_help_edit", "Elige una imagen solo si quieres reemplazar la actual.")
                : t("admin.news_form.image_help", "Opcional. Formato horizontal (16:9) recomendado.")
            }
            currentUrl={news?.image_url || ""}
            file={imageFile}
            onFileChange={setImageFile}
            disabled={saving}
          />
        </div>
      </div>

      <div className="modal-footer admin-modal-footer">
        {isEdit && (
          <Button
            variant="ghost"
            to={`/admin/news/${news.id}/edit`}
            className="admin-modal-footer__aside"
          >
            <i className="fa-solid fa-up-right-from-square" aria-hidden="true"></i>
            {t("admin.news_form.full_editor", "Editor completo")}
          </Button>
        )}
        <Button variant="outline" onClick={onCancel} disabled={saving}>
          {t("common.cancel", "Cancelar")}
        </Button>
        <Button type="submit" loading={saving}>
          {isEdit
            ? t("admin.news_form.save", "Guardar cambios")
            : t("admin.news_form.create", "Crear noticia")}
        </Button>
      </div>
    </form>
  );
}

NewsForm.propTypes = {
  news: PropTypes.shape({
    id: PropTypes.number.isRequired,
    title: PropTypes.string,
    category: PropTypes.string,
    excerpt: PropTypes.string,
    content: PropTypes.string,
    status: PropTypes.string,
    order_index: PropTypes.number,
    image_url: PropTypes.string,
  }),
  onSaved: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired,
};
