import { useState } from "react";
import PropTypes from "prop-types";
import { useTranslation } from "react-i18next";
import { apiPost, apiPostForm, apiPut } from "../../api/client";
import { EVENT_CURRENCY } from "../events/eventUtils";
import { Button, Input, Select, Textarea } from "../ui";
import { FormAlert } from "./AdminCommon";
import ImagePicker from "./ImagePicker";
import { useAdminLabels } from "./adminLabels";
import { errorMessage, toDateTimeLocal, toNumber } from "./adminUtils";
import useAdminSession from "./useAdminSession";

const PRICE_FIELDS = ["price_member", "price_non_member", "price_joven", "price_gratuito"];

/** "" for empty numbers, otherwise the stored value (0 stays 0). */
const numField = value => (value === null || value === undefined ? "" : String(value));

/**
 * Create or edit an event. Dates use datetime-local so the stored time is
 * kept; numbers are sent as numbers (blank price → 0, blank capacity or
 * duration → null). A picked image is uploaded after the event is saved.
 */
export default function EventForm({ event, onSaved, onCancel }) {
  const { t } = useTranslation();
  const labels = useAdminLabels();
  const { handleAuthError } = useAdminSession();
  const isEdit = Boolean(event);
  const [form, setForm] = useState({
    title: event?.title || "",
    format: event?.format || "webinar",
    description: event?.description || "",
    instructor: event?.instructor || "",
    duration_hours: numField(event?.duration_hours),
    location: event?.location || "",
    max_students: numField(event?.max_students),
    start_date: toDateTimeLocal(event?.start_date),
    end_date: toDateTimeLocal(event?.end_date),
    registration_deadline: toDateTimeLocal(event?.registration_deadline),
    price_member: numField(event?.price_member),
    price_non_member: numField(event?.price_non_member),
    price_joven: numField(event?.price_joven),
    price_gratuito: numField(event?.price_gratuito),
    is_active: event?.is_active === undefined ? true : Boolean(event.is_active),
  });
  const [imageFile, setImageFile] = useState(null);
  const [removeImage, setRemoveImage] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});

  const set = field => e => {
    const value = e.target.type === "checkbox" ? e.target.checked : e.target.value;
    setForm(prev => ({ ...prev, [field]: value }));
    if (fieldErrors[field]) setFieldErrors(prev => ({ ...prev, [field]: undefined }));
  };

  function validate() {
    const errs = {};
    if (!form.title.trim()) errs.title = t("admin.event_form.title_required", "El título es obligatorio.");
    if (form.start_date && form.end_date && form.end_date < form.start_date) {
      errs.end_date = t("admin.event_form.end_before_start", "La fecha de término es anterior al inicio.");
    }
    PRICE_FIELDS.concat(["max_students", "duration_hours"]).forEach(field => {
      const v = toNumber(form[field], null);
      if (form[field] !== "" && (v === null || v < 0)) {
        errs[field] = t("admin.event_form.number_invalid", "Ingresa un número igual o mayor a 0.");
      }
    });
    return errs;
  }

  function buildPayload() {
    const payload = {
      title: form.title.trim(),
      format: form.format,
      description: form.description.trim(),
      instructor: form.instructor.trim(),
      location: form.location.trim(),
      duration_hours: toNumber(form.duration_hours, null),
      max_students: toNumber(form.max_students, null),
      start_date: form.start_date || null,
      end_date: form.end_date || null,
      registration_deadline: form.registration_deadline || null,
      is_active: form.is_active,
    };
    PRICE_FIELDS.forEach(field => {
      payload[field] = toNumber(form[field], 0);
    });
    if (isEdit && removeImage && !imageFile) payload.image_url = "";
    return payload;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (saving) return;
    const errs = validate();
    setFieldErrors(errs);
    if (Object.keys(errs).length > 0) {
      // Field messages say what is wrong; take the admin to the first one
      // (the form is long and submitted from the bottom).
      setError("");
      const fieldIds = {
        title: "event-form-title",
        duration_hours: "event-form-duration",
        max_students: "event-form-capacity",
        end_date: "event-form-end",
      };
      const order = ["title", "duration_hours", "max_students", "end_date", ...PRICE_FIELDS];
      const firstKey = order.find(key => errs[key]);
      const first = firstKey && document.getElementById(fieldIds[firstKey] || `event-form-${firstKey}`);
      if (first) {
        first.focus({ preventScroll: true });
        first.scrollIntoView({ block: "center" });
      }
      return;
    }
    setError("");
    setSaving(true);

    let saved;
    try {
      saved = isEdit
        ? await apiPut(`/admin/events/${event.id}`, buildPayload())
        : await apiPost("/admin/events", buildPayload());
    } catch (err) {
      if (handleAuthError(err)) return;
      setError(
        errorMessage(
          err,
          isEdit
            ? t("admin.event_form.update_error", "No se pudo guardar el evento.")
            : t("admin.event_form.create_error", "No se pudo crear el evento."),
        ),
      );
      setSaving(false);
      return;
    }

    const eventId = saved?.id || event?.id;
    let warning = null;
    if (imageFile && eventId) {
      try {
        const body = new FormData();
        body.append("image", imageFile);
        await apiPostForm(`/admin/events/${eventId}/image`, body);
      } catch (err) {
        if (handleAuthError(err)) return;
        warning = t("admin.event_form.image_warning", {
          message: errorMessage(err, ""),
          defaultValue: "El evento se guardó, pero la imagen no se pudo subir. {{message}}",
        }).trim();
      }
    }
    onSaved({ type: isEdit ? "updated" : "created", warning });
  }

  const priceLabel = key =>
    ({
      price_member: t("admin.event_form.price_member", "Socio"),
      price_non_member: t("admin.event_form.price_non_member", "No socio"),
      price_joven: t("admin.event_form.price_joven", "Next Gen"),
      price_gratuito: t("admin.event_form.price_gratuito", "Emérito"),
    })[key];

  return (
    <form onSubmit={handleSubmit} className="admin-form" noValidate>
      <FormAlert message={error} />

      <fieldset className="admin-fieldset">
        <legend className="admin-fieldset__legend">
          {t("admin.event_form.section_general", "Información general")}
        </legend>
        <div className="form-grid">
          <Input
            className="span-2"
            label={t("admin.event_form.title", "Título")}
            id="event-form-title"
            value={form.title}
            onChange={set("title")}
            error={fieldErrors.title}
            required
          />
          <Select
            label={t("admin.event_form.format", "Formato")}
            id="event-form-format"
            value={form.format}
            onChange={set("format")}
            placeholder=""
            options={["webinar", "presencial"].map(value => ({ value, label: labels.format(value).label }))}
          />
          <Input
            label={t("admin.event_form.instructor", "Docente o responsable")}
            id="event-form-instructor"
            value={form.instructor}
            onChange={set("instructor")}
          />
          <Textarea
            className="span-2"
            label={t("admin.event_form.description", "Descripción")}
            id="event-form-description"
            rows={4}
            value={form.description}
            onChange={set("description")}
          />
          <Input
            className="span-2"
            label={
              form.format === "webinar"
                ? t("admin.event_form.location_online", "Enlace de conexión")
                : t("admin.event_form.location_place", "Lugar")
            }
            id="event-form-location"
            value={form.location}
            onChange={set("location")}
            placeholder={
              form.format === "webinar"
                ? t("admin.event_form.location_online_ph", "https://…")
                : t("admin.event_form.location_place_ph", "Ciudad, país o dirección")
            }
          />
          <Input
            label={t("admin.event_form.duration", "Duración (horas)")}
            id="event-form-duration"
            type="number"
            inputMode="numeric"
            min="0"
            step="1"
            value={form.duration_hours}
            onChange={set("duration_hours")}
            error={fieldErrors.duration_hours}
          />
          <Input
            label={t("admin.event_form.capacity", "Cupos")}
            id="event-form-capacity"
            type="number"
            inputMode="numeric"
            min="1"
            step="1"
            value={form.max_students}
            onChange={set("max_students")}
            error={fieldErrors.max_students}
            helperText={t("admin.event_form.capacity_help", "Déjalo vacío si no hay límite.")}
          />
        </div>
      </fieldset>

      <fieldset className="admin-fieldset">
        <legend className="admin-fieldset__legend">
          {t("admin.event_form.section_dates", "Fechas")}
        </legend>
        <div className="form-grid">
          <Input
            label={t("admin.event_form.start", "Inicio")}
            id="event-form-start"
            type="datetime-local"
            value={form.start_date}
            onChange={set("start_date")}
          />
          <Input
            label={t("admin.event_form.end", "Término")}
            id="event-form-end"
            type="datetime-local"
            value={form.end_date}
            min={form.start_date || undefined}
            onChange={set("end_date")}
            error={fieldErrors.end_date}
          />
          <Input
            label={t("admin.event_form.deadline", "Cierre de inscripciones")}
            id="event-form-deadline"
            type="datetime-local"
            value={form.registration_deadline}
            onChange={set("registration_deadline")}
            error={fieldErrors.registration_deadline}
            helperText={t(
              "admin.event_form.deadline_help",
              "Hora local. Después de esta fecha no se aceptan inscripciones.",
            )}
          />
        </div>
      </fieldset>

      <fieldset className="admin-fieldset">
        <legend className="admin-fieldset__legend">
          {t("admin.event_form.section_prices", {
            currency: EVENT_CURRENCY,
            defaultValue: "Precios ({{currency}})",
          })}
        </legend>
        <p className="admin-fieldset__hint">
          {t("admin.event_form.prices_help", "Deja 0 para que sea gratuito para ese grupo.")}
        </p>
        <div className="form-grid admin-price-grid">
          {PRICE_FIELDS.map(field => (
            <Input
              key={field}
              label={priceLabel(field)}
              id={`event-form-${field}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="any"
              placeholder="0"
              value={form[field]}
              onChange={set(field)}
              error={fieldErrors[field]}
            />
          ))}
        </div>
      </fieldset>

      <fieldset className="admin-fieldset">
        <legend className="admin-fieldset__legend">
          {t("admin.event_form.section_publication", "Imagen y publicación")}
        </legend>
        <ImagePicker
          id="event-form-image"
          label={t("admin.event_form.image", "Imagen del evento")}
          hint={t("admin.event_form.image_help", "Opcional. Se sube al guardar el evento.")}
          currentUrl={removeImage ? "" : event?.image_url || ""}
          file={imageFile}
          onFileChange={file => {
            setImageFile(file);
            if (file) setRemoveImage(false);
          }}
          onRemoveCurrent={isEdit ? () => setRemoveImage(true) : undefined}
          disabled={saving}
        />
        {removeImage && (
          <p className="form-helper admin-image-removed">
            {t("admin.event_form.image_removed", "La imagen se quitará al guardar.")}{" "}
            <button type="button" className="admin-link-btn" onClick={() => setRemoveImage(false)}>
              {t("admin.event_form.undo", "Deshacer")}
            </button>
          </p>
        )}
        <div className="admin-check">
          <label className="admin-check__label" htmlFor="event-form-active">
            <input
              id="event-form-active"
              type="checkbox"
              checked={form.is_active}
              onChange={set("is_active")}
              aria-describedby="event-form-active-help"
            />
            <span>{t("admin.event_form.active", "Evento visible en el sitio")}</span>
          </label>
          <p id="event-form-active-help" className="form-helper">
            {t("admin.event_form.active_help", "Desmárcalo para ocultarlo sin eliminarlo.")}
          </p>
        </div>
      </fieldset>

      <div className="modal-footer admin-modal-footer">
        <Button variant="outline" onClick={onCancel} disabled={saving}>
          {t("common.cancel", "Cancelar")}
        </Button>
        <Button type="submit" loading={saving}>
          {isEdit
            ? t("admin.event_form.save", "Guardar cambios")
            : t("admin.event_form.create", "Crear evento")}
        </Button>
      </div>
    </form>
  );
}

EventForm.propTypes = {
  event: PropTypes.shape({
    id: PropTypes.number.isRequired,
    title: PropTypes.string,
    format: PropTypes.string,
    description: PropTypes.string,
    instructor: PropTypes.string,
    duration_hours: PropTypes.number,
    location: PropTypes.string,
    max_students: PropTypes.number,
    start_date: PropTypes.string,
    end_date: PropTypes.string,
    registration_deadline: PropTypes.string,
    price_member: PropTypes.number,
    price_non_member: PropTypes.number,
    price_joven: PropTypes.number,
    price_gratuito: PropTypes.number,
    is_active: PropTypes.bool,
    image_url: PropTypes.string,
  }),
  onSaved: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired,
};
