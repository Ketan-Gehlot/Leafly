import { useEffect, useMemo, useState } from "react";
import "./CouponRewardAnimation.css";

type CouponRewardAnimationProps = {
  onComplete: () => void;
  couponCode?: string;
};

export default function CouponRewardAnimation({
  onComplete,
  couponCode = "LEAFLY2026",
}: CouponRewardAnimationProps) {
  const prefersReducedMotion = useMemo(() => {
    if (typeof window === "undefined") {
      return false;
    }
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }, []);

  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const duration = prefersReducedMotion ? 1800 : 3200;
    const timer = window.setTimeout(() => {
      onComplete();
    }, duration);

    return () => window.clearTimeout(timer);
  }, [onComplete, prefersReducedMotion]);

  const handleCopy = (event: React.MouseEvent) => {
    event.stopPropagation();
    try {
      navigator.clipboard.writeText(couponCode);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1500);
    } catch {
      // Ignore clipboard write issues
    }
  };

  return (
    <div
      className="leafly-reward-stage"
      role="status"
      aria-live="polite"
      aria-label="First order reward coupon"
    >
      <div className="leafly-reward-scene">
        {/* Shimmering celebration ambient glow */}
        <div className="leafly-reward-ambient-glow" aria-hidden="true" />
        <div className="leafly-reward-sparkles" aria-hidden="true">
          <span className="sparkle s1">✦</span>
          <span className="sparkle s2">✦</span>
          <span className="sparkle s3">✦</span>
          <span className="sparkle s4">✦</span>
          <span className="sparkle s5">✦</span>
        </div>

        <div className="leafly-reward-container">
          <div className="leafly-reward-icon-wrap" aria-hidden="true">
            <span className="leafly-reward-gift-icon">🎁</span>
          </div>

          <p className="leafly-reward-eyebrow">A SPECIAL REWARD FOR YOU</p>
          <h2 className="leafly-reward-title">FIRST ORDER GIFT</h2>
          <p className="leafly-reward-subtitle">
            Thank you for beginning your tea ritual with Leafly. Use this code for your next collection:
          </p>

          <div
            className="leafly-reward-voucher"
            onClick={handleCopy}
            title="Click to copy code"
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                handleCopy(e as unknown as React.MouseEvent);
              }
            }}
          >
            <div className="leafly-voucher-top">
              <span className="leafly-voucher-tag">WELCOME VOUCHER</span>
              <span className="leafly-voucher-discount">SPECIAL SAVINGS</span>
            </div>

            <div className="leafly-voucher-code-row">
              <strong className="leafly-voucher-code">{couponCode}</strong>
              <button
                type="button"
                className="leafly-voucher-copy-badge"
                onClick={handleCopy}
              >
                {copied ? "COPIED ✓" : "COPY CODE"}
              </button>
            </div>

            <div className="leafly-voucher-footer">
              <span>Valid on all single-origin teas & collections</span>
            </div>
          </div>

          <button
            type="button"
            className="leafly-reward-continue-btn"
            onClick={onComplete}
          >
            CONTINUE TO ORDER SUMMARY →
          </button>
        </div>
      </div>
    </div>
  );
}
