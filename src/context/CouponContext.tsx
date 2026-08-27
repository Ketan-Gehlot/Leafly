/* eslint-disable react-refresh/only-export-components, react-hooks/set-state-in-effect */
import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import type { UserCoupon, CouponValidationResult } from "../types/contracts";
import { useAuth } from "./AuthContext";

export type { UserCoupon, CouponValidationResult };

type CouponContextType = {
  coupons: UserCoupon[];
  addCoupon: (coupon: Omit<UserCoupon, "id" | "earnedAt">) => Promise<void>;
  grantPostOrderReward: () => Promise<string | null>;
  markCouponUsed: (code: string) => Promise<void>;
  restoreCoupon: (code: string) => Promise<void>;
  validateUserCoupon: (code: string, subtotal: number) => CouponValidationResult;
};

export const LEAFLY10_COUPON: UserCoupon = {
  id: "coupon-leafly10",
  code: "Leafly10",
  title: "Leafly Signature Discount",
  discountType: "percentage",
  discountValue: 10,
  minOrderValue: 0,
  status: "available",
  applicableCondition: "10% OFF on your entire harvest order",
  expiryDate: "31 Dec 2026",
  earnedAt: new Date().toISOString(),
};

const CouponContext = createContext<CouponContextType | undefined>(undefined);

const COUPON_STORAGE_PREFIX = "leafly_coupons_";

export function CouponProvider({ children }: { children: ReactNode }) {
  const { currentUser } = useAuth();
  const [coupons, setCoupons] = useState<UserCoupon[]>([LEAFLY10_COUPON]);

  useEffect(() => {
    if (!currentUser?.uid) {
      setCoupons([LEAFLY10_COUPON]);
      return;
    }

    try {
      const storageKey = `${COUPON_STORAGE_PREFIX}${currentUser.uid}`;
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        setCoupons(JSON.parse(saved));
      } else {
        setCoupons([LEAFLY10_COUPON]);
        localStorage.setItem(storageKey, JSON.stringify([LEAFLY10_COUPON]));
      }
    } catch {
      setCoupons([LEAFLY10_COUPON]);
    }
  }, [currentUser?.uid]);

  const addCoupon = async (newCoupon: Omit<UserCoupon, "id" | "earnedAt">) => {
    if (!currentUser?.uid) return;

    const couponId = `coupon-${newCoupon.code.toLowerCase()}-${Date.now()}`;
    const fullCoupon: UserCoupon = {
      ...newCoupon,
      id: couponId,
      earnedAt: new Date().toISOString(),
    };

    setCoupons((prev) => {
      const next = [fullCoupon, ...prev];
      localStorage.setItem(`${COUPON_STORAGE_PREFIX}${currentUser.uid}`, JSON.stringify(next));
      return next;
    });
  };

  const grantPostOrderReward = async (): Promise<string | null> => {
    return "Leafly10";
  };

  const markCouponUsed = async (code: string) => {
    if (!currentUser?.uid) return;

    setCoupons((prev) => {
      const next = prev.map((c) =>
        c.code.toUpperCase() === code.toUpperCase()
          ? { ...c, status: "used" as const }
          : c
      );
      localStorage.setItem(`${COUPON_STORAGE_PREFIX}${currentUser.uid}`, JSON.stringify(next));
      return next;
    });
  };

  const restoreCoupon = async (code: string) => {
    if (!currentUser?.uid) return;

    setCoupons((prev) => {
      const next = prev.map((c) =>
        c.code.toUpperCase() === code.toUpperCase() && c.status === "used"
          ? { ...c, status: "available" as const }
          : c
      );
      localStorage.setItem(`${COUPON_STORAGE_PREFIX}${currentUser.uid}`, JSON.stringify(next));
      return next;
    });
  };

  /**
   * ONLY 'Leafly10' is accepted.
   * Gives exactly 10% discount on order subtotal.
   * All other coupon codes return an invalid coupon error and 0 discount.
   */
  const validateUserCoupon = (inputCode: string, subtotal: number): CouponValidationResult => {
    const trimmed = inputCode.trim();
    if (!trimmed) {
      return {
        isValid: false,
        code: "",
        discountType: "percentage",
        discountValue: 0,
        minOrderValue: 0,
        message: "Please enter a coupon code.",
      };
    }

    if (trimmed.toLowerCase() === "leafly10") {
      const discountAmount = Math.round(subtotal * 0.1);
      return {
        isValid: true,
        code: "Leafly10",
        discountType: "percentage",
        discountValue: 10,
        minOrderValue: 0,
        message: `Coupon Leafly10 applied! (10% OFF · ₹${discountAmount.toLocaleString("en-IN")} saved)`,
      };
    }

    return {
      isValid: false,
      code: trimmed,
      discountType: "percentage",
      discountValue: 0,
      minOrderValue: 0,
      message: "Invalid coupon code. Use 'Leafly10' to get 10% off your order.",
    };
  };

  return (
    <CouponContext.Provider
      value={{
        coupons,
        addCoupon,
        grantPostOrderReward,
        markCouponUsed,
        restoreCoupon,
        validateUserCoupon,
      }}
    >
      {children}
    </CouponContext.Provider>
  );
}

export function useCoupons() {
  const context = useContext(CouponContext);
  if (!context) {
    throw new Error("useCoupons must be used within a CouponProvider");
  }
  return context;
}
