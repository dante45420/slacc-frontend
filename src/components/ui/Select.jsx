import { useId } from "react";
import PropTypes from "prop-types";
import { useTranslation } from "react-i18next";

export default function Select({
  label,
  id,
  error,
  helperText,
  options = [],
  placeholder,
  className,
  children,
  required,
  ...props
}) {
  const { t } = useTranslation();
  const autoId = useId();
  const selectId = id || `select-${autoId}`;
  const messageId = `${selectId}-msg`;
  const message = error || helperText;
  const placeholderText =
    placeholder === undefined ? t("common.select_placeholder", "Seleccionar...") : placeholder;

  return (
    <div className={`form-field ${className || ""}`.trim()}>
      {label && (
        <label htmlFor={selectId} className="form-label">
          {label}
          {required && (
            <span className="form-required" aria-hidden="true">
              {" "}*
            </span>
          )}
        </label>
      )}
      <select
        id={selectId}
        required={required}
        className={`form-select ${error ? "error" : ""}`.trim()}
        aria-invalid={error ? true : undefined}
        aria-describedby={message ? messageId : undefined}
        {...props}
      >
        {/* Support both children (option elements) and options prop */}
        {children || (
          <>
            {placeholderText && <option value="">{placeholderText}</option>}
            {options.map(opt => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </>
        )}
      </select>
      {error && (
        <p className="form-error" id={messageId} role="alert">
          {error}
        </p>
      )}
      {helperText && !error && (
        <p className="form-helper" id={messageId}>
          {helperText}
        </p>
      )}
    </div>
  );
}

Select.propTypes = {
  label: PropTypes.node,
  id: PropTypes.string,
  error: PropTypes.string,
  helperText: PropTypes.node,
  options: PropTypes.arrayOf(
    PropTypes.shape({
      value: PropTypes.string.isRequired,
      label: PropTypes.string.isRequired,
    }),
  ),
  placeholder: PropTypes.string,
  className: PropTypes.string,
  children: PropTypes.node,
  required: PropTypes.bool,
};
