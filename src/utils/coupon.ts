/**
 * Frontend Prototype Coupon System
 * 
 * NOTE: This is currently a frontend prototype.
 * Frontend coupon evaluation is NOT secure against client-side tampering.
 * All discount calculation & code validation rules are structured here in a clean,
 * modular interface so they can later be validated or replaced by a backend API endpoint.
 */

export type CouponValidationResult = {
  isValid: boolean;
  code: string;
  discountPercentage: number;
  message: string;
};

export type AppliedCoupon = {
  code: string;
  discountPercentage: number;
  discountAmount: number;
};

// Available coupons prototype database (mirrors future backend lookup)
const PROTOTYPE_COUPONS: Record<string, { discountPercentage: number; description: string }> = {
  LEAFLY30: {
    discountPercentage: 30,
    description: "30% off eligible order subtotal",
  },
};

/**
 * Validate a coupon code (case-insensitive prototype evaluator)
 */
export function validateCoupon(inputCode: string): CouponValidationResult {
  const normalizedCode = inputCode.trim().toUpperCase();

  if (!normalizedCode) {
    return {
      isValid: false,
      code: "",
      discountPercentage: 0,
      message: "Please enter a coupon code.",
    };
  }

  const coupon = PROTOTYPE_COUPONS[normalizedCode];

  if (coupon) {
    return {
      isValid: true,
      code: normalizedCode,
      discountPercentage: coupon.discountPercentage,
      message: `Coupon ${normalizedCode} applied! (${coupon.discountPercentage}% off)`,
    };
  }

  return {
    isValid: false,
    code: normalizedCode,
    discountPercentage: 0,
    message: "Invalid coupon code. Try LEAFLY30.",
  };
}

/**
 * Calculate the discount amount given an eligible subtotal and discount percentage
 */
export function calculateDiscount(subtotal: number, discountPercentage: number): number {
  if (subtotal <= 0 || discountPercentage <= 0) {
    return 0;
  }
  return Math.round((subtotal * discountPercentage) / 100);
}
