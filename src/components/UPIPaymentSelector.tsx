import { useState } from "react";
import "./UPIPaymentSelector.css";

export type UPIAppId = "google_pay" | "phonepe" | "paytm" | "bhim" | "custom_vpa";

export interface UPIPaymentSelectorProps {
  totalAmount: number;
  selectedApp: UPIAppId;
  onSelectApp: (appId: UPIAppId) => void;
  vpaInput: string;
  onVpaChange: (vpa: string) => void;
  error?: string | null;
}

const UPI_APPS: {
  id: UPIAppId;
  name: string;
  badge: string;
  description: string;
  popular?: boolean;
}[] = [
  {
    id: "google_pay",
    name: "Google Pay",
    badge: "GPay",
    description: "Instant UPI payment via Google Pay",
    popular: true,
  },
  {
    id: "phonepe",
    name: "PhonePe",
    badge: "पे",
    description: "Fast UPI payment via PhonePe",
    popular: true,
  },
  {
    id: "paytm",
    name: "Paytm",
    badge: "Paytm",
    description: "Pay via Paytm UPI or Wallet",
  },
  {
    id: "bhim",
    name: "BHIM UPI",
    badge: "BHIM",
    description: "National Payments Corporation of India",
  },
];

export default function UPIPaymentSelector({
  totalAmount,
  selectedApp,
  onSelectApp,
  vpaInput,
  onVpaChange,
  error,
}: UPIPaymentSelectorProps) {
  const [showVpaInput, setShowVpaInput] = useState(selectedApp === "custom_vpa");

  return (
    <div className="leafly-upi-section" role="region" aria-label="UPI Payment Options">
      <div className="leafly-upi-header">
        <div className="leafly-upi-badge">✦ UPI INSTANT DISPATCH</div>
        <h4 className="leafly-upi-title">Pay with UPI</h4>
        <p className="leafly-upi-subtitle">
          Choose your preferred UPI app to pay ₹{totalAmount.toLocaleString("en-IN")} directly from your bank.
        </p>
      </div>

      {/* Grid of UPI Apps */}
      <div className="leafly-upi-apps-grid" role="radiogroup" aria-label="Choose your UPI app">
        {UPI_APPS.map((app) => {
          const isSelected = selectedApp === app.id && !showVpaInput;
          return (
            <button
              key={app.id}
              type="button"
              className={`leafly-upi-app-card ${isSelected ? "selected" : ""}`}
              onClick={() => {
                setShowVpaInput(false);
                onSelectApp(app.id);
              }}
              role="radio"
              aria-checked={isSelected}
              aria-label={`Pay with ${app.name}`}
            >
              <div className="leafly-upi-icon-wrap">
                {app.id === "google_pay" && (
                  <svg viewBox="0 0 24 24" width="24" height="24" aria-hidden="true">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                  </svg>
                )}
                {app.id === "phonepe" && (
                  <div className="leafly-upi-phonepe-badge" aria-hidden="true">
                    <span>पे</span>
                  </div>
                )}
                {app.id === "paytm" && (
                  <div className="leafly-upi-paytm-badge" aria-hidden="true">
                    <span>Paytm</span>
                  </div>
                )}
                {app.id === "bhim" && (
                  <div className="leafly-upi-bhim-badge" aria-hidden="true">
                    <span>BHIM</span>
                  </div>
                )}
              </div>

              <div className="leafly-upi-app-details">
                <div className="leafly-upi-app-name-row">
                  <span className="leafly-upi-app-name">{app.name}</span>
                  {app.popular && <span className="leafly-upi-popular-tag">POPULAR</span>}
                </div>
                <span className="leafly-upi-app-desc">{app.description}</span>
              </div>

              <div className={`leafly-upi-radio-circle ${isSelected ? "checked" : ""}`} aria-hidden="true">
                {isSelected && <span className="leafly-upi-radio-dot" />}
              </div>
            </button>
          );
        })}
      </div>

      {/* Alternative UPI ID Tab */}
      <div className="leafly-upi-vpa-toggle">
        <button
          type="button"
          className={`leafly-upi-vpa-btn ${showVpaInput ? "active" : ""}`}
          onClick={() => {
            setShowVpaInput(!showVpaInput);
            if (!showVpaInput) {
              onSelectApp("custom_vpa");
            } else {
              onSelectApp("google_pay");
            }
          }}
        >
          <span>{showVpaInput ? "▼" : "▶"} Or enter custom UPI ID (e.g. name@upi)</span>
        </button>
      </div>

      {showVpaInput && (
        <div className="leafly-upi-vpa-container">
          <label htmlFor="checkout-upi-vpa" className="leafly-upi-vpa-label">
            Enter Virtual Payment Address (UPI ID)
          </label>
          <div className="leafly-upi-vpa-input-wrap">
            <input
              id="checkout-upi-vpa"
              type="text"
              className="leafly-upi-vpa-input"
              placeholder="username@okhdfcbank / mobile@upi"
              value={vpaInput}
              onChange={(e) => onVpaChange(e.target.value)}
              autoComplete="off"
            />
          </div>
          <span className="leafly-upi-vpa-hint">
            A payment request will be sent to your UPI app for authorization.
          </span>
        </div>
      )}

      {/* App Redirection Notice */}
      <div className="leafly-upi-desktop-notice">
        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
          <path d="M5 12h14M12 5l7 7-7 7" />
        </svg>
        <span>
          <strong>Direct UPI App Flow:</strong> Selecting your app will directly trigger the installed UPI application (Google Pay, PhonePe, Paytm, BHIM) on your device.
        </span>
      </div>

      {error && (
        <div className="leafly-upi-error-box" role="alert">
          <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
          <span>{error}</span>
        </div>
      )}
    </div>
  );
}
