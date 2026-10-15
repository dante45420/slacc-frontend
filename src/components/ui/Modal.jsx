import { useEffect, useId, useRef } from "react";
import PropTypes from "prop-types";
import { useTranslation } from "react-i18next";

const SIZE_CLASSES = {
  small: "max-w-md",
  medium: "max-w-2xl",
  large: "max-w-4xl",
  lg: "max-w-4xl",
};

const FOCUSABLE =
  'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';

export default function Modal({
  isOpen,
  onClose,
  title,
  children,
  size = "medium",
  dismissible = true,
  initialFocusRef,
}) {
  const { t } = useTranslation();
  const titleId = useId();
  const dialogRef = useRef(null);
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;
  const dismissibleRef = useRef(dismissible);
  dismissibleRef.current = dismissible;

  useEffect(() => {
    if (!isOpen) return undefined;

    const previouslyFocused = document.activeElement;
    const { overflow } = document.body.style;
    document.body.style.overflow = "hidden";

    const dialog = dialogRef.current;
    const first =
      initialFocusRef?.current ||
      dialog?.querySelector(`.modal-content ${FOCUSABLE.split(", ").join(", .modal-content ")}`) ||
      dialog?.querySelector(FOCUSABLE);
    (first || dialog)?.focus();

    const onKeyDown = e => {
      if (e.key === "Escape") {
        e.stopPropagation();
        if (dismissibleRef.current) onCloseRef.current?.();
        return;
      }
      if (e.key !== "Tab" || !dialog) return;
      const items = [...dialog.querySelectorAll(FOCUSABLE)];
      if (items.length === 0) return;
      const firstEl = items[0];
      const lastEl = items[items.length - 1];
      if (e.shiftKey && document.activeElement === firstEl) {
        e.preventDefault();
        lastEl.focus();
      } else if (!e.shiftKey && document.activeElement === lastEl) {
        e.preventDefault();
        firstEl.focus();
      }
    };
    document.addEventListener("keydown", onKeyDown);

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = overflow;
      if (previouslyFocused instanceof HTMLElement) previouslyFocused.focus();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div
        className="modal-backdrop"
        onClick={dismissible ? onClose : undefined}
        aria-hidden="true"
      />
      <div
        ref={dialogRef}
        className={`modal-container ${SIZE_CLASSES[size] || SIZE_CLASSES.medium}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
      >
        <div className="modal-header">
          <h2 id={titleId} className="modal-title">
            {title}
          </h2>
          <button
            onClick={onClose}
            className="modal-close-btn"
            type="button"
            aria-label={t("common.close", "Cerrar")}
          >
            <i className="fa-solid fa-xmark" aria-hidden="true"></i>
          </button>
        </div>
        <div className="modal-content">{children}</div>
      </div>
    </div>
  );
}

Modal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  title: PropTypes.node.isRequired,
  children: PropTypes.node.isRequired,
  size: PropTypes.oneOf(["small", "medium", "large", "lg"]),
  /** false: Escape and backdrop clicks don't close it (explicit close only) */
  dismissible: PropTypes.bool,
  /** Element to focus when the dialog opens (defaults to the first field) */
  initialFocusRef: PropTypes.shape({ current: PropTypes.any }),
};
