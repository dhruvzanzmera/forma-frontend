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

export function Busy({
  label = "Loading...",
  subtitle = "Fetching details from server",
  fullScreen = false,
}) {
  return (
    <div
      className={`loading-state ${fullScreen ? "full-screen" : ""}`}
      role="status"
      aria-live="polite"
      aria-busy="true"
    >
      <div className="spinner-wrapper">
        <svg
          className="spinner-ring"
          viewBox="0 0 50 50"
          aria-hidden="true"
        >
          <circle
            className="spinner-track"
            cx="25"
            cy="25"
            r="20"
            fill="none"
            strokeWidth="4"
          />
          <circle
            className="spinner-accent"
            cx="25"
            cy="25"
            r="20"
            fill="none"
            strokeWidth="4"
          />
        </svg>
      </div>
      <div className="loading-text-wrap">
        <span className="loading-label">{label}</span>
        {subtitle && <span className="loading-subtitle">{subtitle}</span>}
      </div>
    </div>
  );
}

export function ProductSkeletonGrid({ count = 4 }) {
  return (
    <div className="product-grid skeleton-grid" aria-hidden="true">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="product-card skeleton-card">
          <div className="skeleton-image skeleton-pulse" />
          <div className="skeleton-details">
            <div className="skeleton-line skeleton-line-title skeleton-pulse" />
            <div className="skeleton-line skeleton-line-sub skeleton-pulse" />
            <div className="skeleton-line skeleton-line-price skeleton-pulse" />
          </div>
        </div>
      ))}
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

