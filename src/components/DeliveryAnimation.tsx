import { useEffect, useMemo } from "react";
import "./DeliveryAnimation.css";

type DeliveryAnimationProps = {
  onComplete: () => void;
};

export default function DeliveryAnimation({ onComplete }: DeliveryAnimationProps) {
  const prefersReducedMotion = useMemo(() => {
    if (typeof window === "undefined") {
      return false;
    }

    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }, []);

  useEffect(() => {
    const duration = prefersReducedMotion ? 1200 : 3500;
    const timer = window.setTimeout(() => {
      onComplete();
    }, duration);

    return () => window.clearTimeout(timer);
  }, [onComplete, prefersReducedMotion]);

  return (
    <div
      className="delivery-animation"
      role="status"
      aria-live="polite"
      aria-label="Tea delivery in progress"
    >
      <div className="delivery-animation-scene">
        <div className="delivery-animation-ground" aria-hidden="true" />

        <div className="delivery-animation-rider-wrap" aria-hidden="true">
          <div className="delivery-animation-rider">
            <svg viewBox="0 0 420 180" className="delivery-animation-svg" role="img" aria-label="Leafly delivery rider">
              <defs>
                <linearGradient id="vehicleBody" x1="0%" x2="100%" y1="0%" y2="0%">
                  <stop offset="0%" stopColor="#0b2b1e" />
                  <stop offset="100%" stopColor="#071f16" />
                </linearGradient>
                <linearGradient id="bagFill" x1="0%" x2="100%" y1="0%" y2="100%">
                  <stop offset="0%" stopColor="#c9a24b" />
                  <stop offset="100%" stopColor="#d5ae59" />
                </linearGradient>
              </defs>

              <g className="delivery-wheels">
                <circle cx="95" cy="132" r="24" />
                <circle cx="282" cy="132" r="24" />
              </g>

              <g className="delivery-frame">
                <path d="M98 128h90l38-42h40l26 42h24" fill="none" stroke="#0b2b1e" strokeWidth="6" strokeLinejoin="round" strokeLinecap="round" />
                <path d="M146 84h82l-26 42h-56l0-42Z" fill="url(#vehicleBody)" opacity="0.95" />
                <path d="M286 99h42l-8 29h-34v-29Z" fill="#0b2b1e" opacity="0.9" />
                <rect x="138" y="58" width="70" height="24" rx="8" fill="#f7f3ec" stroke="#0b2b1e" strokeWidth="3" />
                <text x="169" y="75" textAnchor="middle" fontSize="11" fontWeight="700" fill="#0b2b1e" fontFamily="Arial, sans-serif">LEAFLY</text>
              </g>

              <g className="delivery-rider-figure">
                <circle cx="176" cy="41" r="18" fill="#f7f3ec" stroke="#0b2b1e" strokeWidth="3" />
                <path d="M176 59l-10 22 15 7 13-7-12-22Z" fill="#0b2b1e" />
                <path d="M164 82h24l12 34h-48l12-34Z" fill="#d5ae59" />
                <path d="M108 96l52 5 21-8 36 38h-116l7-35Z" fill="#0b2b1e" opacity="0.95" />
                <rect x="202" y="92" width="48" height="46" rx="8" fill="url(#bagFill)" stroke="#0b2b1e" strokeWidth="3" />
                <text x="226" y="116" textAnchor="middle" fontSize="10" fontWeight="700" fill="#0b2b1e" fontFamily="Arial, sans-serif">TEA</text>
                <path d="M144 90h-18l-20 30" fill="none" stroke="#0b2b1e" strokeWidth="6" strokeLinecap="round" />
                <path d="M212 90h14l22 32" fill="none" stroke="#0b2b1e" strokeWidth="6" strokeLinecap="round" />
              </g>

              <g className="delivery-bubbles" aria-hidden="true">
                <circle cx="320" cy="38" r="5" fill="#c9a24b" opacity="0.7" />
                <circle cx="342" cy="24" r="3" fill="#d5ae59" opacity="0.9" />
                <circle cx="360" cy="46" r="2.5" fill="#0b2b1e" opacity="0.5" />
              </g>
            </svg>
          </div>
        </div>

        <div className="delivery-animation-copy" aria-live="polite">
          <p className="delivery-animation-step">PREPARING YOUR TEA</p>
          <h2>YOUR TEA IS ON ITS WAY</h2>
          <span>Carefully packed. On the way to you.</span>
        </div>
      </div>
    </div>
  );
}
