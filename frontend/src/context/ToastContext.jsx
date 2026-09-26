import { createContext, useContext, useState, useCallback, useMemo } from 'react';
import { X, CheckCircle, AlertTriangle, AlertCircle, Info } from 'lucide-react';

const ToastContext = createContext(null);

let toastIdCounter = 0;

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback(({ type = 'info', message, duration = 4000 }) => {
    const id = ++toastIdCounter;
    setToasts((prev) => [...prev, { id, type, message }]);

    if (duration > 0) {
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, duration);
    }

    return id;
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const toast = useMemo(() => ({
    success: (message, opts) => addToast({ type: 'success', message, ...opts }),
    error: (message, opts) => addToast({ type: 'error', message, ...opts }),
    warning: (message, opts) => addToast({ type: 'warning', message, ...opts }),
    info: (message, opts) => addToast({ type: 'info', message, ...opts }),
    showToast: (message, type = 'info', opts) => addToast({ type, message, ...opts }),
  }), [addToast]);


  const icons = {
    success: <CheckCircle size={18} style={{ color: 'var(--color-success)' }} />,
    error: <AlertCircle size={18} style={{ color: 'var(--color-danger)' }} />,
    warning: <AlertTriangle size={18} style={{ color: 'var(--color-warning)' }} />,
    info: <Info size={18} style={{ color: 'var(--color-info)' }} />,
  };

  return (
    <ToastContext.Provider value={toast}>
      {children}

      {/* Toast Container */}
      {toasts.length > 0 && (
        <div className="toast-container">
          {toasts.map((t) => (
            <div key={t.id} className={`toast toast-${t.type}`}>
              {icons[t.type]}
              <span className="toast-message">{t.message}</span>
              <button className="toast-close" onClick={() => removeToast(t.id)}>
                <X size={14} />
              </button>
            </div>
          ))}
        </div>
      )}
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx;
}

export default ToastContext;
