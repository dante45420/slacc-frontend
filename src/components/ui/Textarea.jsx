import { forwardRef, useId } from "react";
import PropTypes from "prop-types";

const Textarea = forwardRef(function Textarea({
  label,
  id,
  error,
  helperText,
  rows = 4,
  className,
  required,
  ...props
}, ref) {
  const autoId = useId();
  const textareaId = id || `textarea-${autoId}`;
  const messageId = `${textareaId}-msg`;
  const message = error || helperText;

  return (
    <div className={`form-field ${className || ""}`.trim()}>
      {label && (
        <label htmlFor={textareaId} className="form-label">
          {label}
          {required && (
            <span className="form-required" aria-hidden="true">
              {" "}*
            </span>
          )}
        </label>
      )}
      <textarea
        ref={ref}
        id={textareaId}
        rows={rows}
        required={required}
        className={`form-textarea ${error ? "error" : ""}`.trim()}
        aria-invalid={error ? true : undefined}
        aria-describedby={message ? messageId : undefined}
        {...props}
      />
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
});

Textarea.propTypes = {
  label: PropTypes.node,
  id: PropTypes.string,
  error: PropTypes.string,
  helperText: PropTypes.node,
  rows: PropTypes.number,
  className: PropTypes.string,
  required: PropTypes.bool,
};

export default Textarea;
