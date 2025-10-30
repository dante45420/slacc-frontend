import {
  createContext,
  useContext,
  useState,
  useCallback,
  useMemo,
} from "react";
import PropTypes from "prop-types";

const ToastContext = createContext(null);

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within ToastProvider");
  }
  return context;
}

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const removeToast = useCallback(id => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  }, []);

  const addToast = useCallback(
    (message, variant = "info", duration = 3000) => {
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
      <div className="toast-container">
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
  const icons = {
    success: "✓",
    error: "✕",
    warning: "⚠",
    info: "ℹ",
  };

  return (
    <div className={`toast toast-${variant}`}>
      <span className="toast-icon">{icons[variant]}</span>
      <span className="toast-message">{message}</span>
      <button className="toast-close" onClick={onClose} type="button">
        ✕
      </button>
    </div>
  );
}

Toast.propTypes = {
  message: PropTypes.string.isRequired,
  variant: PropTypes.oneOf(["success", "error", "warning", "info"]).isRequired,
  onClose: PropTypes.func.isRequired,
};
