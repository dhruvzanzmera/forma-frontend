import { Package, X } from "lucide-react";

export function Notice({ children, type = "error", onClose }) {
  if (!children) return null;
  return (
    <div className={`notice ${type}`} role="status">
      {children}
      {onClose && (
        <button className="icon-button" onClick={onClose} aria-label="Dismiss">
          <X size={16} />
        </button>
      )}
    </div>
  );
}

export function Busy({ label = "Loading" }) {
  return (
    <div className="loading-state">
      <span className="spinner" />
      {label}
    </div>
  );
}

export function Empty({ title, copy, action }) {
  return (
    <div className="empty-state">
      <Package size={25} />
      <h3>{title}</h3>
      <p>{copy}</p>
      {action}
    </div>
  );
}

export function ErrorState({ error, retry }) {
  return (
    <div className="error-state">
      <p>{error}</p>
      {retry && (
        <button className="button secondary" onClick={retry}>
          Try again
        </button>
      )}
    </div>
  );
}
