import { useEffect, useId, useRef, useState } from "react";
import PropTypes from "prop-types";
import { useTranslation } from "react-i18next";
import { assetUrl } from "../../api/client";
import { IMAGE_ACCEPT, IMAGE_MAX_MB } from "./newsUtils";

/**
 * Cover-image picker with a translated button, file name and 16:9 preview.
 * The native input stays in the DOM (visually hidden) so it keeps keyboard
 * and screen-reader support. Previews use object URLs, never data: URLs.
 */
export default function NewsImageField({
  label,
  file,
  currentUrl,
  onChange,
  helperText,
  disabled = false,
  className = "",
}) {
  const { t } = useTranslation();
  const inputId = `news-image-${useId()}`;
  const hintId = `${inputId}-hint`;
  const inputRef = useRef(null);
  const [preview, setPreview] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!file) {
      setPreview("");
      if (inputRef.current) inputRef.current.value = "";
      return undefined;
    }
    const url = URL.createObjectURL(file);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  function handleChange(e) {
    const picked = e.target.files?.[0];
    if (!picked) return;
    const allowed = IMAGE_ACCEPT.split(",");
    if (!allowed.includes(picked.type)) {
      setError(t("news.image_type_error", "Formato no admitido. Usa una imagen JPG, PNG, WebP o GIF."));
      e.target.value = "";
      return;
    }
    if (picked.size > IMAGE_MAX_MB * 1024 * 1024) {
      setError(t("news.image_size_error", "La imagen supera los {{mb}} MB.", { mb: IMAGE_MAX_MB }));
      e.target.value = "";
      return;
    }
    setError("");
    onChange(picked);
  }

  function clear() {
    setError("");
    onChange(null);
  }

  const [brokenUrl, setBrokenUrl] = useState("");
  const candidate = preview || (currentUrl ? assetUrl(currentUrl) : "");
  const shown = candidate && candidate !== brokenUrl ? candidate : "";
  let name = t("news.image_none", "Ninguna imagen seleccionada");
  if (file) name = file.name;
  else if (currentUrl) name = t("news.image_current", "Imagen actual");

  return (
    <div className={`form-field news-upload ${className}`.trim()}>
      <label htmlFor={inputId} className="form-label">
        {label}
      </label>
      <input
        ref={inputRef}
        id={inputId}
        type="file"
        accept={IMAGE_ACCEPT}
        className="sr-only news-upload__input"
        onChange={handleChange}
        disabled={disabled}
        aria-describedby={hintId}
        aria-invalid={error ? true : undefined}
      />
      <div className={`news-upload__panel${error ? " has-error" : ""}`}>
        <div className={`news-upload__thumb${shown ? "" : " is-empty"}`}>
          {shown ? (
            <img
              src={shown}
              alt={t("news.image_preview_alt", "Vista previa de la imagen")}
              onError={() => setBrokenUrl(shown)}
            />
          ) : (
            <i className="fa-regular fa-image" aria-hidden="true"></i>
          )}
        </div>
        <div className="news-upload__info">
          <p className="news-upload__name">{name}</p>
          <p className="news-upload__hint" id={hintId}>
            {helperText ||
              t("news.image_hint", "JPG, PNG o WebP, horizontal (16:9), máximo {{mb}} MB.", {
                mb: IMAGE_MAX_MB,
              })}
          </p>
          <div className="news-upload__actions">
            <label
              htmlFor={inputId}
              className={`btn btn-outline btn-sm news-upload__button${disabled ? " is-disabled" : ""}`}
            >
              <i className="fa-solid fa-upload" aria-hidden="true"></i>
              {file || currentUrl
                ? t("news.image_change", "Cambiar imagen")
                : t("news.image_select", "Seleccionar imagen")}
            </label>
            {file && (
              <button
                type="button"
                className="btn btn-ghost btn-sm"
                onClick={clear}
                disabled={disabled}
              >
                <i className="fa-solid fa-xmark" aria-hidden="true"></i>
                {t("news.image_remove", "Quitar")}
              </button>
            )}
          </div>
        </div>
      </div>
      {error && (
        <p className="form-error" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}

NewsImageField.propTypes = {
  label: PropTypes.node.isRequired,
  file: PropTypes.object,
  currentUrl: PropTypes.string,
  onChange: PropTypes.func.isRequired,
  helperText: PropTypes.node,
  disabled: PropTypes.bool,
  className: PropTypes.string,
};
