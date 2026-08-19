/**
 * Frontend Prototype Coupon System
 * 
 * NOTE: This is currently a frontend prototype.
 * Frontend coupon evaluation is NOT secure against client-side tampering.
 * All discount calculation & code validation rules are structured here in a clean,
 * modular interface so they can later be validated or replaced by a backend API endpoint.
 */

export type CouponDef = {
  code: string;
  discountType: "fixed" | "percentage";
  discountValue: number;
  minOrderValue: number;
  description: string;
};

export type CouponValidationResult = {
  isValid: boolean;
  code: string;
  discountType: "fixed" | "percentage";
  discountValue: number;
  minOrderValue: number;
  message: string;
};

export type AppliedCoupon = {
  code: string;
  discountType: "fixed" | "percentage";
  discountValue: number;
  discountAmount: number;
  minOrderValue: number;
};

// Available coupons prototype database (mirrors future backend lookup)
export const PROTOTYPE_COUPONS: Record<string, CouponDef> = {
  LEAFLY2026: {
    code: "LEAFLY2026",
    discountType: "fixed",
    discountValue: 500,
    minOrderValue: 1500,
    description: "₹500 off on orders of ₹1,500 or more",
  },
  LEAFLY30: {
    code: "LEAFLY30",
    discountType: "percentage",
    discountValue: 30,
    minOrderValue: 0,
    description: "30% off any eligible order subtotal",
  },
};

/**
 * Validate a coupon code given the current cart subtotal
 */
export function validateCoupon(inputCode: string, subtotal: number = 0): CouponValidationResult {
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

  const coupon = PROTOTYPE_COUPONS[normalizedCode];

  if (!coupon) {
    return {
      isValid: false,
      code: normalizedCode,
      discountType: "fixed",
      discountValue: 0,
      minOrderValue: 0,
      message: "Invalid coupon code. Try LEAFLY2026 or LEAFLY30.",
    };
  }

  if (coupon.minOrderValue > 0 && subtotal < coupon.minOrderValue) {
    return {
      isValid: false,
      code: normalizedCode,
      discountType: coupon.discountType,
      discountValue: coupon.discountValue,
      minOrderValue: coupon.minOrderValue,
      message: `Minimum order value of ₹${coupon.minOrderValue.toLocaleString("en-IN")} required.`,
    };
  }

  const message =
    coupon.discountType === "fixed"
      ? `Coupon ${coupon.code} applied! (₹${coupon.discountValue} OFF)`
      : `Coupon ${coupon.code} applied! (${coupon.discountValue}% OFF)`;

  return {
    isValid: true,
    code: coupon.code,
    discountType: coupon.discountType,
    discountValue: coupon.discountValue,
    minOrderValue: coupon.minOrderValue,
    message,
  };
}

/**
 * Calculate the discount amount given an eligible subtotal and coupon parameters
 */
export function calculateDiscount(
  subtotal: number,
  discountType: "fixed" | "percentage",
  discountValue: number,
  minOrderValue: number = 0
): number {
  if (subtotal <= 0 || discountValue <= 0) {
    return 0;
  }
  if (minOrderValue > 0 && subtotal < minOrderValue) {
    return 0;
  }
  if (discountType === "percentage") {
    const calculated = Math.round((subtotal * discountValue) / 100);
    return Math.min(subtotal, calculated);
  }
  // fixed amount
  return Math.min(subtotal, discountValue);
}
