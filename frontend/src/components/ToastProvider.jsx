import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";
import "./toast.css";

const ToastContext = createContext(null);

const DEFAULT_DURATION_MS = 3500;

const normalizeMessage = (message) => {
  if (message === null || message === undefined) return "";
  if (typeof message === "string") return message;
  return message;
};

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback(
    ({
      message,
      type = "info",
      durationMs = DEFAULT_DURATION_MS,
      actions = [],
    }) => {
      const id = `${Date.now()}-${Math.random().toString(16).slice(2)}`;
      setToasts((prev) => [
        ...prev,
        {
          id,
          message: normalizeMessage(message),
          type,
          actions: Array.isArray(actions) ? actions : [],
        },
      ]);

      if (durationMs > 0) {
        window.setTimeout(() => removeToast(id), durationMs);
      }

      return id;
    },
    [removeToast]
  );

  const api = useMemo(() => {
    const wrap =
      (type) =>
      (message, options = {}) =>
        showToast({ message, type, ...options });

    return {
      show: showToast,
      info: wrap("info"),
      success: wrap("success"),
      warning: wrap("warning"),
      error: wrap("error"),
      remove: removeToast,
    };
  }, [removeToast, showToast]);

  return (
    <ToastContext.Provider value={api}>
      {children}
      <div className="toast-container" role="region" aria-label="Notifications">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`toast-item toast-${t.type}`}
            role="status"
            aria-live="polite"
          >
            <div className="toast-content">
              <div className="toast-message">{t.message}</div>
              {Array.isArray(t.actions) && t.actions.length > 0 && (
                <div className="toast-actions">
                  {t.actions.map((a, idx) => (
                    <button
                      key={idx}
                      type="button"
                      className={`toast-action ${
                        a?.variant ? `toast-action-${a.variant}` : ""
                      }`}
                      onClick={() => {
                        try {
                          a?.onClick?.();
                        } finally {
                          if (a?.dismissOnClick !== false) removeToast(t.id);
                        }
                      }}
                    >
                      {a?.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
            <button
              type="button"
              className="toast-close"
              onClick={() => removeToast(t.id)}
              aria-label="Dismiss notification"
            >
              ×
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    throw new Error("useToast must be used within ToastProvider");
  }
  return ctx;
}
