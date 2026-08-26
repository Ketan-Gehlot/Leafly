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

const ELIGIBLE_COUPON_POOL: Omit<UserCoupon, "id" | "earnedAt" | "status">[] = [
  {
    code: "HARVEST15",
    title: "Seasonal Harvest Reward",
    discountType: "percentage",
    discountValue: 15,
    minOrderValue: 1200,
    applicableCondition: "15% OFF on orders of ₹1,200 or more",
    expiryDate: "31 Dec 2026",
  },
  {
    code: "RITUAL20",
    title: "Tea Master Ritual Voucher",
    discountType: "percentage",
    discountValue: 20,
    minOrderValue: 1800,
    applicableCondition: "20% OFF on ceremonial orders of ₹1,800+",
    expiryDate: "31 Dec 2026",
  },
  {
    code: "SANCTUARY250",
    title: "Sanctuary Appreciation Voucher",
    discountType: "fixed",
    discountValue: 250,
    minOrderValue: 1000,
    applicableCondition: "₹250 OFF on purchases of ₹1,000+",
    expiryDate: "31 Dec 2026",
  },
  {
    code: "CEREMONIAL500",
    title: "Grand First Flush Voucher",
    discountType: "fixed",
    discountValue: 500,
    minOrderValue: 2200,
    applicableCondition: "₹500 OFF on premium teaware & reserves ₹2,200+",
    expiryDate: "31 Dec 2026",
  },
  {
    code: "FIRST10",
    title: "Consecutive Steeping Reward",
    discountType: "percentage",
    discountValue: 10,
    minOrderValue: 800,
    applicableCondition: "10% OFF on all loose-leaf single-estate teas",
    expiryDate: "31 Dec 2026",
  },
];

const DEFAULT_WELCOME_COUPONS: UserCoupon[] = [
  {
    id: "welcome-harvest-15",
    code: "HARVEST15",
    title: "Seasonal Harvest Reward",
    discountType: "percentage",
    discountValue: 15,
    minOrderValue: 1200,
    status: "available",
    applicableCondition: "15% OFF on orders of ₹1,200 or more",
    expiryDate: "31 Dec 2026",
    earnedAt: new Date().toISOString(),
  },
  {
    id: "welcome-sanctuary-250",
    code: "SANCTUARY250",
    title: "Sanctuary Appreciation Voucher",
    discountType: "fixed",
    discountValue: 250,
    minOrderValue: 1000,
    status: "available",
    applicableCondition: "₹250 OFF on purchases of ₹1,000+",
    expiryDate: "31 Dec 2026",
    earnedAt: new Date().toISOString(),
  },
];

const CouponContext = createContext<CouponContextType | undefined>(undefined);

const COUPON_STORAGE_PREFIX = "leafly_coupons_";

export function CouponProvider({ children }: { children: ReactNode }) {
  const { currentUser } = useAuth();
  const [coupons, setCoupons] = useState<UserCoupon[]>([]);

  useEffect(() => {
    if (!currentUser?.uid) {
      setCoupons([]);
      return;
    }

    try {
      const storageKey = `${COUPON_STORAGE_PREFIX}${currentUser.uid}`;
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        setCoupons(JSON.parse(saved));
      } else {
        setCoupons(DEFAULT_WELCOME_COUPONS);
        localStorage.setItem(storageKey, JSON.stringify(DEFAULT_WELCOME_COUPONS));
      }
    } catch {
      setCoupons(DEFAULT_WELCOME_COUPONS);
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
    if (!currentUser?.uid) return null;

    const randomTemplate = ELIGIBLE_COUPON_POOL[Math.floor(Math.random() * ELIGIBLE_COUPON_POOL.length)];
    const alreadyHasActive = coupons.some(
      (c) => c.code.toUpperCase() === randomTemplate.code.toUpperCase() && c.status === "available"
    );
    if (alreadyHasActive) {
      return randomTemplate.code;
    }

    const couponId = `c-${randomTemplate.code.toLowerCase()}-${Date.now().toString(36)}`;
    const newReward: UserCoupon = {
      ...randomTemplate,
      id: couponId,
      status: "available",
      earnedAt: new Date().toISOString(),
    };

    setCoupons((prev) => {
      const next = [newReward, ...prev];
      localStorage.setItem(`${COUPON_STORAGE_PREFIX}${currentUser.uid}`, JSON.stringify(next));
      return next;
    });

    return randomTemplate.code;
  };

  const markCouponUsed = async (code: string) => {
    if (!currentUser?.uid) return;

    setCoupons((prev) => {
      const next = prev.map((c) =>
        c.code.toUpperCase() === code.toUpperCase() && c.status === "available"
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

  const validateUserCoupon = (inputCode: string, subtotal: number): CouponValidationResult => {
    const normalizedCode = inputCode.trim().toUpperCase();
    if (!normalizedCode) {
      return {
        isValid: false,
        code: "",
        discountType: "fixed",
        discountValue: 0,
        minOrderValue: 0,
        message: "Please enter a coupon code.",
      };
    }

    if (!currentUser?.uid) {
      return {
        isValid: false,
        code: normalizedCode,
        discountType: "fixed",
        discountValue: 0,
        minOrderValue: 0,
        message: "Please sign in to your account to apply your tea vouchers.",
      };
    }

    const matched = coupons.find(
      (c) => c.code.trim().toUpperCase() === normalizedCode
    );

    if (!matched) {
      return {
        isValid: false,
        code: normalizedCode,
        discountType: "fixed",
        discountValue: 0,
        minOrderValue: 0,
        message: "Coupon not available in your account.",
      };
    }

    if (matched.status === "used") {
      return {
        isValid: false,
        code: normalizedCode,
        discountType: matched.discountType,
        discountValue: matched.discountValue,
        minOrderValue: matched.minOrderValue,
        message: "This coupon has already been used.",
      };
    }

    if (matched.status === "expired") {
      return {
        isValid: false,
        code: normalizedCode,
        discountType: matched.discountType,
        discountValue: matched.discountValue,
        minOrderValue: matched.minOrderValue,
        message: "This voucher has expired.",
      };
    }

    if (matched.minOrderValue > 0 && subtotal < matched.minOrderValue) {
      return {
        isValid: false,
        code: normalizedCode,
        discountType: matched.discountType,
        discountValue: matched.discountValue,
        minOrderValue: matched.minOrderValue,
        message: `Minimum order value of ₹${matched.minOrderValue.toLocaleString("en-IN")} required.`,
      };
    }

    const message =
      matched.discountType === "fixed"
        ? `Coupon ${matched.code} applied! (₹${matched.discountValue} OFF)`
        : `Coupon ${matched.code} applied! (${matched.discountValue}% OFF)`;

    return {
      isValid: true,
      code: matched.code,
      discountType: matched.discountType,
      discountValue: matched.discountValue,
      minOrderValue: matched.minOrderValue,
      message,
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

