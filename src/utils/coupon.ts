export type UserCouponItem = {
  code: string;
  discountType: "fixed" | "percentage";
  discountValue: number;
  minOrderValue: number;
  status: "available" | "used" | "expired";
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

/**
 * Validate a coupon code strictly against the authenticated customer's owned vouchers
 */
export function validateCouponAgainstUserVouchers(
  inputCode: string,
  userCoupons: UserCouponItem[],
  subtotal: number = 0
): CouponValidationResult {
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

  const coupon = userCoupons.find(
    (c) => c.code.trim().toUpperCase() === normalizedCode
  );

  if (!coupon) {
    return {
      isValid: false,
      code: normalizedCode,
      discountType: "fixed",
      discountValue: 0,
      minOrderValue: 0,
      message: "Coupon not available in your account.",
    };
  }

  if (coupon.status === "used") {
    return {
      isValid: false,
      code: normalizedCode,
      discountType: coupon.discountType,
      discountValue: coupon.discountValue,
      minOrderValue: coupon.minOrderValue,
      message: "This coupon has already been used.",
    };
  }

  if (coupon.status === "expired") {
    return {
      isValid: false,
      code: normalizedCode,
      discountType: coupon.discountType,
      discountValue: coupon.discountValue,
      minOrderValue: coupon.minOrderValue,
      message: "This coupon has expired.",
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

