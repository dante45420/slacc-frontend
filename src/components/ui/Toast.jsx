import {
  createContext,
  useContext,
  useState,
  useCallback,
  useMemo,
} from "react";
import PropTypes from "prop-types";
import { useTranslation } from "react-i18next";

const ToastContext = createContext(null);

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within ToastProvider");
  }
  return context;
}

export function ToastProvider({ children }) {
  const { t } = useTranslation();
  const [toasts, setToasts] = useState([]);

  const removeToast = useCallback(id => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  }, []);

  const addToast = useCallback(
    (message, variant = "info", duration = 5000) => {
      const id = Date.now() + Math.random();
      setToasts(prev => [...prev, { id, message, variant }]);

      if (duration > 0) {
        setTimeout(() => {
          removeToast(id);
        }, duration);
      }

      return id;
    },
    [removeToast]
  );

  const success = useCallback(
    (message, duration) => addToast(message, "success", duration),
    [addToast]
  );
  const error = useCallback(
    (message, duration) => addToast(message, "error", duration),
    [addToast]
  );
  const warning = useCallback(
    (message, duration) => addToast(message, "warning", duration),
    [addToast]
  );
  const info = useCallback(
    (message, duration) => addToast(message, "info", duration),
    [addToast]
  );

  const value = useMemo(
    () => ({
      success,
      error,
      warning,
      info,
      addToast,
      removeToast,
    }),
    [success, error, warning, info, addToast, removeToast]
  );

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="toast-container" role="region" aria-live="polite" aria-label={t("common.notifications", "Notificaciones")}>
        {toasts.map(toast => (
          <Toast
            key={toast.id}
            message={toast.message}
            variant={toast.variant}
            onClose={() => removeToast(toast.id)}
          />
        ))}
      </div>
    </ToastContext.Provider>
  );
}

ToastProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

function Toast({ message, variant, onClose }) {
  const { t } = useTranslation();
  const icons = {
    success: <i className="fa-solid fa-circle-check"></i>,
    error: <i className="fa-solid fa-circle-xmark"></i>,
    warning: <i className="fa-solid fa-triangle-exclamation"></i>,
    info: <i className="fa-solid fa-circle-info"></i>,
  };

  return (
    <div
      className={`toast toast-${variant}`}
      role={variant === "error" ? "alert" : "status"}
    >
      <span className="toast-icon" aria-hidden="true">
        {icons[variant]}
      </span>
      <span className="toast-message">{message}</span>
      <button
        className="toast-close"
        onClick={onClose}
        type="button"
        aria-label={t("common.close", "Cerrar")}
      >
        <i className="fa-solid fa-xmark" aria-hidden="true"></i>
      </button>
    </div>
  );
}

Toast.propTypes = {
  message: PropTypes.node.isRequired,
  variant: PropTypes.oneOf(["success", "error", "warning", "info"]).isRequired,
  onClose: PropTypes.func.isRequired,
};
