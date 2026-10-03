import { useEffect, useState, useRef } from "react";
import { subscribeToApiLoading } from "../api/client";

export function useApiLoading() {
  const [activeCount, setActiveCount] = useState(0);

  useEffect(() => {
    return subscribeToApiLoading((count) => {
      setActiveCount(count);
    });
  }, []);

  return {
    isLoading: activeCount > 0,
    activeCount,
  };
}

export function GlobalLoader() {
  const { isLoading, activeCount } = useApiLoading();
  const [progress, setProgress] = useState(0);
  const [visible, setVisible] = useState(false);
  const timerRef = useRef(null);

  useEffect(() => {
    if (isLoading) {
      setVisible(true);
      setProgress((prev) => (prev === 0 ? 25 : Math.min(prev + 15, 80)));

      // Gradually increase progress while loading
      timerRef.current = setInterval(() => {
        setProgress((prev) => {
          if (prev < 60) return prev + 10;
          if (prev < 85) return prev + 4;
          if (prev < 95) return prev + 1;
          return prev;
        });
      }, 300);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
      if (visible) {
        setProgress(100);
        const hideTimeout = setTimeout(() => {
          setVisible(false);
          setProgress(0);
        }, 350);
        return () => clearTimeout(hideTimeout);
      }
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isLoading]);

  return (
    <>
      {/* Top Animated Progress Bar */}
      <div
        className={`global-top-progress ${visible ? "active" : ""}`}
        aria-hidden="true"
      >
        <div
          className="global-top-progress-bar"
          style={{
            width: `${progress}%`,
            opacity: visible ? 1 : 0,
          }}
        />
      </div>

      {/* Floating Action / Process Indicator */}
      <div
        className={`global-floating-loader ${isLoading ? "is-visible" : ""}`}
        role="status"
        aria-live="polite"
      >
        <span className="global-loader-spinner" />
        <span className="global-loader-text">
          {activeCount > 1 ? `Processing (${activeCount})...` : "Processing..."}
        </span>
      </div>
    </>
  );
}
