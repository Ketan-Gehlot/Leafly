import { useEffect } from "react";
import type { CartProduct } from "../context/CartContext";
import "./AddedToRitualModal.css";

interface AddedToRitualModalProps {
  product: CartProduct | null;
  onClose: () => void;
}

export default function AddedToRitualModal({
  product,
  onClose,
}: AddedToRitualModalProps) {
  useEffect(() => {
    if (!product) return;

    const timer = setTimeout(() => {
      onClose();
    }, 1600);

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      clearTimeout(timer);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [product, onClose]);

  if (!product) return null;

  return (
    <div
      className="added-to-ritual-overlay"
      role="dialog"
      aria-modal="true"
      aria-label="Item added to ritual"
      onClick={onClose}
    >
      <div
        className="added-to-ritual-card"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Animated Leafly Tea Pouch */}
        <div className="ritual-anim-pouch">
          <span className="ritual-pouch-brand">LEAFLY</span>
        </div>

        {/* Animated Cart Trolley */}
        <div className="ritual-anim-trolley">
          <div className="ritual-trolley-basket" />
          <div className="ritual-trolley-handle" />
          <div className="ritual-anim-wheels">
            <span />
            <span />
          </div>
        </div>

        {/* Success Confirmation Badge */}
        <div className="ritual-anim-success">
          <span className="ritual-anim-mark" aria-hidden="true">✓</span>
          <span className="ritual-anim-text">ADDED TO RITUAL</span>
        </div>
      </div>
    </div>
  );
}
