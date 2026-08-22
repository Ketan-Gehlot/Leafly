import { useEffect, useMemo, useState } from "react";
import deliveryBoyImg from "../assets/delivery-boy.webp";
import "./DeliveryAnimation.css";

type DeliveryAnimationProps = {
  onComplete: () => void;
};

export default function DeliveryAnimation({
  onComplete,
}: DeliveryAnimationProps) {
  const prefersReducedMotion = useMemo(() => {
    if (typeof window === "undefined") {
      return false;
    }
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }, []);

  // Strict step sequence for delivery boy only:
  // Step 1: "entering" - enters smoothly from the left
  // Step 2: "arriving" - moves across to center
  // Step 3: "confirmed" - shows "ORDER PLACED SUCCESSFULLY"
  // Step 4: "exiting" - completes movement smoothly
  const [step, setStep] = useState<"entering" | "arriving" | "confirmed" | "exiting">(
    prefersReducedMotion ? "confirmed" : "entering"
  );

  useEffect(() => {
    if (prefersReducedMotion) {
      const timer = window.setTimeout(() => {
        onComplete();
      }, 1200);
      return () => window.clearTimeout(timer);
    }

    const t1 = window.setTimeout(() => setStep("arriving"), 1000);
    const t2 = window.setTimeout(() => setStep("confirmed"), 2000);
    const t3 = window.setTimeout(() => setStep("exiting"), 3200);
    const t4 = window.setTimeout(() => onComplete(), 3900);

    return () => {
      window.clearTimeout(t1);
      window.clearTimeout(t2);
      window.clearTimeout(t3);
      window.clearTimeout(t4);
    };
  }, [onComplete, prefersReducedMotion]);

  return (
    <div
      className="leafly-delivery-stage"
      role="status"
      aria-live="polite"
      aria-label="Order placed. Delivery in progress"
    >
      <div className="leafly-delivery-scene">
        {/* Soft background glow & tea ambiance */}
        <div className="leafly-delivery-glow" aria-hidden="true" />

        {/* ZONE 1: TOP SUCCESS MESSAGE / HUD — isolated in its own top space */}
        <div className="leafly-delivery-hud-zone">
          <div className="leafly-delivery-hud">
            {(step === "entering" || step === "arriving") && (
              <div className="leafly-delivery-text-block fade-in">
                <p className="leafly-delivery-eyebrow">TEA RITUAL IN MOTION</p>
                <h2 className="leafly-delivery-heading">DISPATCHING YOUR TEA</h2>
                <span className="leafly-delivery-subtext">Carefully packed with intention</span>
              </div>
            )}

            {(step === "confirmed" || step === "exiting") && (
              <div className="leafly-delivery-text-block pop-in">
                <span className="leafly-success-badge">✓</span>
                <p className="leafly-delivery-eyebrow">CONFIRMED</p>
                <h2 className="leafly-delivery-heading">ORDER PLACED SUCCESSFULLY</h2>
                <span className="leafly-delivery-subtext">Your fresh harvest tea is on its journey</span>
              </div>
            )}
          </div>
        </div>

        {/* ZONE 2: BOTTOM DELIVERY BOY TRACK — isolated in bottom track, never overlaps text */}
        <div className="leafly-delivery-track-zone" aria-hidden="true">
          <div className="leafly-delivery-ground" />
          <div className={`leafly-courier-wrapper ${step}`}>
            <div className="leafly-courier-figure">
              <img
                src={deliveryBoyImg}
                alt="Leafly Tea Courier"
                className="leafly-courier-img"
                loading="eager"
                fetchPriority="high"
              />
              <div className="leafly-courier-package-glow" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
