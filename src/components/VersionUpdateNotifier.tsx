import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import "./VersionUpdateNotifier.css";

// Declare global build time injected by Vite
declare const __APP_BUILD_TIME__: string | undefined;

export default function VersionUpdateNotifier() {
  const location = useLocation();
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  // Catch dynamic Vite chunk load errors after new deployments and auto-reload
  useEffect(() => {
    const handlePreloadError = () => {
      console.warn("Vite dynamic chunk load error detected. Reloading newest application bundle...");
      window.location.reload();
    };

    window.addEventListener("vite:preloadError", handlePreloadError);
    return () => window.removeEventListener("vite:preloadError", handlePreloadError);
  }, []);

  useEffect(() => {
    let isMounted = true;
    const initialBuildTime = typeof __APP_BUILD_TIME__ !== "undefined" ? __APP_BUILD_TIME__ : null;

    const checkVersion = async () => {
      // Never interrupt active checkout or order placement
      if (location.pathname.startsWith("/checkout")) {
        return;
      }

      try {
        const res = await fetch(`/version.json?_t=${Date.now()}`, {
          cache: "no-store",
          headers: { "Cache-Control": "no-cache" },
        });

        if (!res.ok) return;

        const data = await res.json();
        if (data && data.buildTime && isMounted) {
          if (initialBuildTime && String(data.buildTime) !== String(initialBuildTime)) {
            setUpdateAvailable(true);
          }
        }
      } catch {
        // Silently ignore network check errors
      }
    };

    // Check on initial load after brief delay
    const initialTimer = setTimeout(checkVersion, 10000);

    // Periodically check every 3 minutes
    const interval = setInterval(checkVersion, 3 * 60 * 1000);

    // Check when user returns to tab
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        checkVersion();
      }
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      isMounted = false;
      clearTimeout(initialTimer);
      clearInterval(interval);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [location.pathname]);

  const handleUpdate = () => {
    window.location.reload();
  };

  // Don't show in checkout or if dismissed
  if (!updateAvailable || dismissed || location.pathname.startsWith("/checkout")) {
    return null;
  }

  return (
    <aside
      className="leafly-update-toast"
      role="status"
      aria-live="polite"
      aria-label="Application update available"
    >
      <div className="leafly-update-content">
        <span className="leafly-update-icon" aria-hidden="true">??</span>
        <div className="leafly-update-text">
          <strong>New harvest available</strong>
          <p>Leafly has been updated with fresh features & improvements.</p>
        </div>
      </div>

      <div className="leafly-update-actions">
        <button
          type="button"
          className="leafly-update-btn primary"
          onClick={handleUpdate}
        >
          UPDATE NOW
        </button>
        <button
          type="button"
          className="leafly-update-btn dismiss"
          onClick={() => setDismissed(true)}
          aria-label="Dismiss update notification"
        >
          
        </button>
      </div>
    </aside>
  );
}
