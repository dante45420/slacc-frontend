import { useEffect } from "react";
import PropTypes from "prop-types";

export default function Modal({
  isOpen,
  onClose,
  title,
  children,
  size = "medium",
}) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  // Prevenir que se cierre al hacer clic en el contenido del modal
  const handleContentClick = e => {
    e.stopPropagation();
  };

  if (!isOpen) return null;

  const sizeClasses = {
    small: "max-w-md",
    medium: "max-w-2xl",
    large: "max-w-4xl",
    lg: "max-w-4xl",
  };

  return (
    <div className="modal-overlay">
      <div
        className="modal-backdrop"
        onClick={onClose}
        role="button"
        tabIndex={-1}
        onKeyDown={e => e.key === "Escape" && onClose()}
        aria-label="Close modal"
      />

      <div
        className={`modal-container ${sizeClasses[size]}`}
        onClick={handleContentClick}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        tabIndex={-1}
        onKeyDown={e => e.stopPropagation()}
      >
        <div className="modal-header">
          <h3 id="modal-title" className="modal-title">
            {title}
          </h3>
          <button
            onClick={onClose}
            className="modal-close-btn"
            type="button"
            aria-label="Close modal"
          >
            ×
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
  title: PropTypes.string.isRequired,
  children: PropTypes.node.isRequired,
  size: PropTypes.oneOf(["small", "medium", "large", "lg"]),
};
