import { useEffect, useState } from "react";
import PropTypes from "prop-types";
import { useTranslation } from "react-i18next";
import { assetUrl } from "../../api/client";

/**
 * Image field for admin forms: preview (new file or current image), a
 * label-styled picker around a visually hidden but focusable file input, and
 * remove actions. The preview object URL is revoked whenever the file
 * changes and on unmount.
 */
export default function ImagePicker({
  id,
  label,
  hint,
  currentUrl,
  file,
  onFileChange,
  onRemoveCurrent,
  disabled = false,
}) {
  const { t } = useTranslation();
  const [preview, setPreview] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!file) {
      setPreview(null);
      return undefined;
    }
    const url = URL.createObjectURL(file);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  const shown = preview || (currentUrl ? assetUrl(currentUrl) : "");

  const handleChange = e => {
    const picked = e.target.files?.[0];
    e.target.value = "";
    if (!picked) return;
    if (picked.type && !picked.type.startsWith("image/")) {
      setError(t("admin.image.invalid", "Elige un archivo de imagen (JPG, PNG o WebP)."));
      return;
    }
    setError("");
    onFileChange(picked);
  };

  let pickLabel = t("admin.image.choose", "Elegir imagen");
  if (file || shown) pickLabel = t("admin.image.replace", "Cambiar imagen");

  return (
    <div className="form-field admin-image">
      <span className="form-label" id={`${id}-label`}>
        {label}
      </span>
      <div className="admin-image__body">
        <div className={`admin-image__preview${shown ? "" : " is-empty"}`}>
          {shown ? (
            <img src={shown} alt={t("admin.image.preview_alt", "Vista previa de la imagen")} />
          ) : (
            <span className="admin-image__placeholder" aria-hidden="true">
              <i className="fa-regular fa-image"></i>
            </span>
          )}
        </div>
        <div className="admin-image__side">
          {file ? (
            <p className="admin-image__file" title={file.name}>
              <i className="fa-solid fa-paperclip" aria-hidden="true"></i>
              {file.name}
            </p>
          ) : (
            <p className="admin-image__hint">
              {shown
                ? t("admin.image.current", "Imagen actual")
                : t("admin.image.none", "Sin imagen")}
            </p>
          )}
          <div className="admin-image__actions">
            <input
              id={id}
              type="file"
              accept="image/*"
              className="admin-visually-hidden"
              onChange={handleChange}
              disabled={disabled}
              aria-describedby={hint ? `${id}-hint` : undefined}
            />
            <label
              htmlFor={id}
              className={`btn btn-outline btn-sm admin-image__pick${disabled ? " is-disabled" : ""}`}
            >
              <i className="fa-solid fa-upload" aria-hidden="true"></i>
              {pickLabel}
            </label>
            {file && (
              <button
                type="button"
                className="btn btn-ghost btn-sm"
                onClick={() => onFileChange(null)}
                disabled={disabled}
              >
                {t("admin.image.discard", "Descartar")}
              </button>
            )}
            {!file && currentUrl && onRemoveCurrent && (
              <button
                type="button"
                className="btn btn-ghost btn-sm admin-image__remove"
                onClick={onRemoveCurrent}
                disabled={disabled}
              >
                <i className="fa-regular fa-trash-can" aria-hidden="true"></i>
                {t("admin.image.remove", "Quitar imagen")}
              </button>
            )}
          </div>
          {hint && (
            <p className="form-helper" id={`${id}-hint`}>
              {hint}
            </p>
          )}
          {error && (
            <p className="form-error" role="alert">
              {error}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

ImagePicker.propTypes = {
  id: PropTypes.string.isRequired,
  label: PropTypes.string.isRequired,
  hint: PropTypes.string,
  currentUrl: PropTypes.string,
  file: PropTypes.object,
  onFileChange: PropTypes.func.isRequired,
  onRemoveCurrent: PropTypes.func,
  disabled: PropTypes.bool,
};
