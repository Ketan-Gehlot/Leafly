/* eslint-disable react-refresh/only-export-components */
import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

export type UserCoupon = {
  id: string;
  code: string;
  title: string;
  discountType: "fixed" | "percentage";
  discountValue: number; // e.g. 500 or 30
  minOrderValue: number; // e.g. 1500
  status: "available" | "used" | "expired";
  applicableCondition: string;
  expiryDate?: string;
  earnedAt: string;
};

type CouponContextType = {
  coupons: UserCoupon[];
  addCoupon: (coupon: Omit<UserCoupon, "id" | "earnedAt">) => void;
  grantWelcomeReward: () => void;
  markCouponUsed: (code: string) => void;
};

const STORAGE_KEY = "leafly_user_coupons_v1";

const INITIAL_DEMO_COUPONS: UserCoupon[] = [
  {
    id: "coupon-leafly2026",
    code: "LEAFLY2026",
    title: "Welcome Tea Ritual Voucher",
    discountType: "fixed",
    discountValue: 500,
    minOrderValue: 1500,
    status: "available",
    applicableCondition: "Valid on all orders above ₹1,500",
    expiryDate: "31 Dec 2026",
    earnedAt: new Date().toISOString(),
  },
  {
    id: "coupon-leafly30",
    code: "LEAFLY30",
    title: "Artisan 30% Privilege",
    discountType: "percentage",
    discountValue: 30,
    minOrderValue: 0,
    status: "available",
    applicableCondition: "30% off any order subtotal",
    expiryDate: "31 Dec 2026",
    earnedAt: new Date().toISOString(),
  },
];

const CouponContext = createContext<CouponContextType | undefined>(undefined);

export function CouponProvider({ children }: { children: ReactNode }) {
  const [coupons, setCoupons] = useState<UserCoupon[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (!saved) {
        return INITIAL_DEMO_COUPONS;
      }
      const parsed = JSON.parse(saved);
      return Array.isArray(parsed) && parsed.length > 0 ? parsed : INITIAL_DEMO_COUPONS;
    } catch {
      return INITIAL_DEMO_COUPONS;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(coupons));
    } catch {
      // Ignore storage errors.
    }
  }, [coupons]);

  const addCoupon = (newCoupon: Omit<UserCoupon, "id" | "earnedAt">) => {
    setCoupons((prev) => {
      if (prev.some((c) => c.code.toUpperCase() === newCoupon.code.toUpperCase())) {
        return prev;
      }
      return [
        {
          ...newCoupon,
          id: `coupon-${Date.now()}`,
          earnedAt: new Date().toISOString(),
        },
        ...prev,
      ];
    });
  };

  const grantWelcomeReward = () => {
    setCoupons((prev) => {
      const exists = prev.some((c) => c.code.toUpperCase() === "LEAFLY2026");
      if (exists) {
        return prev;
      }
      return [
        {
          id: `coupon-leafly2026-${Date.now()}`,
          code: "LEAFLY2026",
          title: "First Order Reward Gift",
          discountType: "fixed",
          discountValue: 500,
          minOrderValue: 1500,
          status: "available",
          applicableCondition: "Valid on orders of ₹1,500 or more",
          expiryDate: "31 Dec 2026",
          earnedAt: new Date().toISOString(),
        },
        ...prev,
      ];
    });
  };

  const markCouponUsed = (code: string) => {
    setCoupons((prev) =>
      prev.map((c) =>
        c.code.toUpperCase() === code.toUpperCase()
          ? { ...c, status: "used" as const }
          : c
      )
    );
  };

  return (
    <CouponContext.Provider
      value={{
        coupons,
        addCoupon,
        grantWelcomeReward,
        markCouponUsed,
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
