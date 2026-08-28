/* eslint-disable react-hooks/set-state-in-effect */
import { useMemo, useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import {
  useOrderContext,
  type Order,
  type ShippingAddress,
} from "../context/OrderContext";
import DeliveryAnimation from "../components/DeliveryAnimation";
import CouponRewardAnimation from "../components/CouponRewardAnimation";
import PhoneInput from "../components/PhoneInput";
import UPIPaymentSelector, { type UPIAppId } from "../components/UPIPaymentSelector";
import UPITestModeModal from "../components/UPITestModeModal";
import { calculateDiscount, type AppliedCoupon } from "../utils/coupon";
import { useCoupons } from "../context/CouponContext";
import { useAuth, isValidGmailAddress, GMAIL_ERROR_MESSAGE } from "../context/AuthContext";
import { validatePhoneNumber, isFirstOrderCouponCode } from "../lib/validation";
import { COUNTRIES_LIST, INDIAN_STATES_AND_CITIES } from "../data/indianLocations";
import { auth, db } from "../lib/firebase";
import { doc, setDoc, updateDoc, increment } from "firebase/firestore";
import Footer from "../components/Footer";
import "./Checkout.css";

type AddressForm = {
  fullName: string;
  addressLine1: string;
  addressLine2: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
};

type FormErrors = Partial<Record<string, string>>;

function cleanFirestoreObject<T extends Record<string, unknown>>(obj: T): Record<string, unknown> {
  const cleaned: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(obj)) {
    if (value !== undefined) {
      if (value !== null && typeof value === "object" && !Array.isArray(value)) {
        cleaned[key] = cleanFirestoreObject(value as Record<string, unknown>);
      } else {
        cleaned[key] = value;
      }
    }
  }
  return cleaned;
}

function getSavedAddressesKey(uid?: string | null): string | null {
  return uid ? `leafly_saved_addresses_${uid}` : null;
}

const currencyFormatter = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

function generateOrderId() {
  const datePart = new Date().toISOString().slice(0, 10).replace(/-/g, "");
  const randomPart = String(Math.floor(Math.random() * 9000 + 1000));
  return `LF-${datePart}-${randomPart}`;
}

function readSavedAddresses(uid?: string | null): ShippingAddress[] {
  const key = getSavedAddressesKey(uid);
  if (!key) return [];
  try {
    const saved = localStorage.getItem(key);
    if (!saved) {
      return [];
    }

    const parsed = JSON.parse(saved);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

const defaultAddress: AddressForm = {
  fullName: "",
  addressLine1: "",
  addressLine2: "",
  city: "Mumbai",
  state: "Maharashtra",
  postalCode: "",
  country: "India",
};

export default function Checkout() {
  const navigate = useNavigate();
  const { items, subtotal, clearCart } = useCart();
  const { addOrder } = useOrderContext();
  const { grantPostOrderReward, markCouponUsed, validateUserCoupon, isFirstOrder } = useCoupons();
  const { currentUser, loading: authLoading, isAuthenticated } = useAuth();

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate("/login", { replace: true, state: { from: { pathname: "/checkout" } } });
    }
  }, [authLoading, isAuthenticated, navigate]);

  const [email, setEmail] = useState(() => currentUser?.email || "");
  const [phone, setPhone] = useState(() => currentUser?.phone || currentUser?.phoneNumber || "");
  const [couponInput, setCouponInput] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<AppliedCoupon | null>(null);
  const [couponFeedback, setCouponFeedback] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  // Auto-discard first-order coupon if the customer is no longer first-order eligible
  useEffect(() => {
    if (!isFirstOrder && appliedCoupon && isFirstOrderCouponCode(appliedCoupon.code)) {
      setAppliedCoupon(null);
      setCouponFeedback({
        type: "error",
        message: "This coupon is only valid on your first order.",
      });
    }
  }, [isFirstOrder, appliedCoupon]);

  const [deliveryMethod, setDeliveryMethod] = useState<"standard" | "express">("standard");
  const [paymentMethod, setPaymentMethod] = useState<"upi" | "card" | "cod">("upi");
  const [selectedUpiApp, setSelectedUpiApp] = useState<UPIAppId>("google_pay");
  const [upiVpa, setUpiVpa] = useState("");
  const [showUpiTestModal, setShowUpiTestModal] = useState(false);
  const [pendingOrderId, setPendingOrderId] = useState<string | null>(null);
  const [saveAddress, setSaveAddress] = useState(true);
  const [deliveryInstructions, setDeliveryInstructions] = useState("");

  // Order submission feedback state
  const [isProcessing, setIsProcessing] = useState(false);
  const [isBursting, setIsBursting] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [deliveryPhase, setDeliveryPhase] = useState<"idle" | "delivery" | "coupon">("idle");
  const [rewardCouponCode, setRewardCouponCode] = useState<string>("HARVEST15");

  const [shippingAddress, setShippingAddress] = useState<AddressForm>(() => {
    if (currentUser?.uid) {
      const savedAddresses = readSavedAddresses(currentUser.uid);
      if (savedAddresses.length > 0) {
        const lastSaved = savedAddresses[0];
        return {
          fullName: lastSaved.fullName || currentUser?.displayName || currentUser?.name || "",
          addressLine1: lastSaved.addressLine1 || "",
          addressLine2: lastSaved.addressLine2 || "",
          city: lastSaved.city || "Mumbai",
          state: lastSaved.state || "Maharashtra",
          postalCode: lastSaved.postalCode || "",
          country: lastSaved.country || "India",
        };
      }
      return {
        ...defaultAddress,
        fullName: currentUser?.displayName || currentUser?.name || "",
      };
    }
    return { ...defaultAddress };
  });

  const prevUidRef = useRef<string | undefined>(currentUser?.uid);

  // Synchronize with authenticated profile when logged in, or clear when logging out
  useEffect(() => {
    const prevUid = prevUidRef.current;
    prevUidRef.current = currentUser?.uid;

    if (currentUser?.uid) {
      setEmail(currentUser.email || "");
      setPhone(currentUser.phone || currentUser.phoneNumber || "");
      setDeliveryInstructions("");
      const savedAddresses = readSavedAddresses(currentUser.uid);
      if (savedAddresses.length > 0) {
        const lastSaved = savedAddresses[0];
        setShippingAddress({
          fullName: lastSaved.fullName || currentUser.displayName || currentUser.name || "",
          addressLine1: lastSaved.addressLine1 || "",
          addressLine2: lastSaved.addressLine2 || "",
          city: lastSaved.city || "Mumbai",
          state: lastSaved.state || "Maharashtra",
          postalCode: lastSaved.postalCode || "",
          country: lastSaved.country || "India",
        });
      } else {
        setShippingAddress({
          ...defaultAddress,
          fullName: currentUser.displayName || currentUser.name || "",
        });
      }
    } else if (prevUid) {
      // User explicitly logged out: reset fields for safety
      setEmail("");
      setPhone("");
      setDeliveryInstructions("");
      setShippingAddress({ ...defaultAddress });
      setAppliedCoupon(null);
      setCouponFeedback(null);
    }
  }, [currentUser?.uid, currentUser?.email, currentUser?.displayName, currentUser?.name, currentUser?.phone, currentUser?.phoneNumber]);

  const availableStates = useMemo(() => {
    if (shippingAddress.country === "India") {
      return Object.keys(INDIAN_STATES_AND_CITIES);
    }
    return [];
  }, [shippingAddress.country]);

  const availableCities = useMemo(() => {
    if (shippingAddress.country === "India" && shippingAddress.state) {
      return INDIAN_STATES_AND_CITIES[shippingAddress.state] || [];
    }
    return [];
  }, [shippingAddress.country, shippingAddress.state]);

  const handlePhoneChange = (newPhone: string) => {
    setPhone(newPhone);
    const phoneRes = validatePhoneNumber(newPhone, shippingAddress.country);
    setErrors((prev) => {
      const next = { ...prev };
      if (phoneRes.isValid) {
        delete next.phone;
      } else if (newPhone.trim() && prev.phone) {
        next.phone = phoneRes.error;
      }
      return next;
    });
  };

  const handleCountryChange = (newCountry: string) => {
    if (newCountry === "India") {
      const defaultState = "Maharashtra";
      const defaultCities = INDIAN_STATES_AND_CITIES[defaultState] || [];
      setShippingAddress((prev) => ({
        ...prev,
        country: newCountry,
        state: defaultState,
        city: defaultCities[0] || "Mumbai",
      }));
    } else {
      setShippingAddress((prev) => ({
        ...prev,
        country: newCountry,
        state: "",
        city: "",
      }));
    }

    // Immediately re-validate phone for the new country
    const phoneRes = validatePhoneNumber(phone, newCountry);
    setErrors((prev) => {
      const next = { ...prev };
      if (phoneRes.isValid) {
        delete next.phone;
      } else if (phone.trim() && prev.phone) {
        next.phone = phoneRes.error;
      }
      return next;
    });
  };

  const handleStateChange = (newState: string) => {
    const defaultCities = INDIAN_STATES_AND_CITIES[newState] || [];
    setShippingAddress((prev) => ({
      ...prev,
      state: newState,
      city: defaultCities[0] || "",
    }));
  };

  const deliveryFee = useMemo(() => {
    if (items.length === 0) return 0;
    return deliveryMethod === "express" ? 150 : 0;
  }, [deliveryMethod, items.length]);

  const discountAmount = useMemo(() => {
    if (!appliedCoupon) return 0;
    return calculateDiscount(
      subtotal,
      appliedCoupon.discountType,
      appliedCoupon.discountValue,
      appliedCoupon.minOrderValue
    );
  }, [appliedCoupon, subtotal]);

  const total = useMemo(
    () => Math.max(0, subtotal - discountAmount + deliveryFee),
    [deliveryFee, discountAmount, subtotal]
  );

  const handleApplyCoupon = (event?: React.FormEvent) => {
    if (event) event.preventDefault();

    const result = validateUserCoupon(couponInput, subtotal);

    if (result.isValid) {
      const discount = calculateDiscount(
        subtotal,
        result.discountType,
        result.discountValue,
        result.minOrderValue
      );
      setAppliedCoupon({
        code: result.code,
        discountType: result.discountType,
        discountValue: result.discountValue,
        discountAmount: discount,
        minOrderValue: result.minOrderValue,
      });
      setCouponFeedback({
        type: "success",
        message: result.message,
      });
      setCouponInput("");
    } else {
      setCouponFeedback({
        type: "error",
        message: result.message,
      });
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponFeedback(null);
    setCouponInput("");
  };

  const updateAddressField = (field: keyof AddressForm, value: string) => {
    setShippingAddress((current) => ({
      ...current,
      [field]: value,
    }));
  };

  const validateCheckout = () => {
    const nextErrors: FormErrors = {};
    if (!email.trim()) {
      nextErrors.email = "Email is required.";
    } else if (!isValidGmailAddress(email)) {
      nextErrors.email = GMAIL_ERROR_MESSAGE;
    }

    const trimmedName = shippingAddress.fullName.trim();
    if (!trimmedName) {
      nextErrors.fullName = "Full name is required.";
    } else if (trimmedName.length < 2) {
      nextErrors.fullName = "Full name must contain at least 2 characters.";
    } else if (
      /^(abc|123|test|xyz|asdf|qwerty|none|null|admin|sample|demo|tabs\s+hajs)$/i.test(trimmedName) ||
      /(.)\1{3,}/.test(trimmedName)
    ) {
      nextErrors.fullName = "Please enter a valid, legitimate human name.";
    } else if (!/^[a-zA-Z\s.'-]+$/.test(trimmedName)) {
      nextErrors.fullName = "Full name should only contain letters and spaces.";
    }

    const trimmedAddress = shippingAddress.addressLine1.trim();
    if (!trimmedAddress) {
      nextErrors.addressLine1 = "Address line 1 is required.";
    } else if (trimmedAddress.length < 5) {
      nextErrors.addressLine1 = "Please enter a complete street address (at least 5 characters).";
    } else if (/^(asdf|test|bnsnlks|qwerty|xyz|12345)$/i.test(trimmedAddress) || /(.)\1{4,}/.test(trimmedAddress)) {
      nextErrors.addressLine1 = "Please enter a valid street/house address.";
    }

    const trimmedCity = shippingAddress.city.trim();
    if (!trimmedCity) {
      nextErrors.city = "City is required.";
    } else if (trimmedCity.length < 2) {
      nextErrors.city = "City name is too short.";
    } else if (/^(nskllkan|asdf|test|xyz|123)$/i.test(trimmedCity) || /(.)\1{3,}/.test(trimmedCity)) {
      nextErrors.city = "Please enter a valid city name.";
    }

    if (!shippingAddress.state.trim()) {
      nextErrors.state = "State is required.";
    }

    if (!shippingAddress.country.trim()) {
      nextErrors.country = "Country is required.";
    }

    const cleanPostal = shippingAddress.postalCode.trim();
    if (!cleanPostal) {
      nextErrors.postalCode = "Postal/PIN code is required.";
    } else if (shippingAddress.country === "India") {
      if (!/^[1-9][0-9]{5}$/.test(cleanPostal)) {
        nextErrors.postalCode = "Indian PIN code must be exactly 6 valid digits (e.g. 400001).";
      }
    } else if (cleanPostal.length < 4 || cleanPostal.length > 12) {
      nextErrors.postalCode = "Please enter a valid postal code.";
    }

    const phoneRes = validatePhoneNumber(phone, shippingAddress.country);
    if (!phoneRes.isValid) {
      nextErrors.phone = phoneRes.error || "Please enter a valid phone number.";
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const finishOrder = async (
    orderId: string,
    orderTotal: number,
    orderSubtotal: number,
    orderDiscount: number,
    orderDeliveryFee: number,
    razorpayPaymentId?: string
  ) => {
    const resolvedPaymentMethod =
      paymentMethod === "card"
        ? "Debit / Credit Card / NetBanking"
        : paymentMethod === "upi"
          ? "UPI"
          : "Pay on Delivery";

    const isPaidOnline = Boolean(razorpayPaymentId) || resolvedPaymentMethod !== "Pay on Delivery";

    const currentUid = auth.currentUser?.uid || currentUser?.uid;
    if (!currentUid) {
      setIsProcessing(false);
      setIsBursting(false);
      setErrors({ submit: "Authentication session expired. Please sign in to complete your order." });
      return;
    }

    const order: Order = {
      id: orderId,
      userId: currentUid,
      customerId: currentUid,
      customerName: shippingAddress.fullName.trim(),
      customerEmail: email.trim().toLowerCase(),
      customerPhone: phone.trim() || currentUser?.phone || undefined,
      createdAt: new Date().toISOString(),
      status: resolvedPaymentMethod === "Pay on Delivery" ? "Confirmed" : "Processing",
      orderStatus: resolvedPaymentMethod === "Pay on Delivery" ? "Confirmed" : "Processing",
      items: items.map((item) => ({
        id: item.id || `${item.product.id}-${item.variant}`,
        productId: item.product.id,
        name: item.product.name,
        variant: item.variant || item.weight,
        weight: item.weight || item.variant,
        image: item.product.image,
        price: item.price,
        quantity: item.quantity,
        category: item.product.category,
      })),
      subtotal: orderSubtotal,
      discount: orderDiscount,
      couponCode: appliedCoupon?.code,
      deliveryFee: orderDeliveryFee,
      total: orderTotal,
      deliveryMethod:
        deliveryMethod === "express" ? "Express Delivery" : "Standard Delivery",
      deliveryInstructions: deliveryInstructions.trim() || undefined,
      paymentMethod: resolvedPaymentMethod,
      paymentStatus: resolvedPaymentMethod === "Pay on Delivery" ? "Pay on Delivery" : isPaidOnline ? "Paid" : "Pending",
      shippingAddress: {
        fullName: shippingAddress.fullName.trim(),
        addressLine1: shippingAddress.addressLine1.trim(),
        addressLine2: shippingAddress.addressLine2.trim(),
        city: shippingAddress.city.trim(),
        state: shippingAddress.state.trim(),
        postalCode: shippingAddress.postalCode.trim(),
        country: shippingAddress.country.trim(),
      },
    };

    if (saveAddress && currentUid) {
      const storageKey = getSavedAddressesKey(currentUid);
      if (storageKey) {
        const savedAddresses = readSavedAddresses(currentUid);
        const nextSaved = [
          {
            fullName: order.shippingAddress.fullName,
            addressLine1: order.shippingAddress.addressLine1,
            addressLine2: order.shippingAddress.addressLine2,
            city: order.shippingAddress.city,
            state: order.shippingAddress.state,
            postalCode: order.shippingAddress.postalCode,
            country: order.shippingAddress.country,
          },
          ...savedAddresses.filter(
            (address) =>
              !(
                address.fullName === order.shippingAddress.fullName &&
                address.addressLine1 === order.shippingAddress.addressLine1 &&
                address.city === order.shippingAddress.city &&
                address.postalCode === order.shippingAddress.postalCode
              )
          ),
        ].slice(0, 5);

        localStorage.setItem(storageKey, JSON.stringify(nextSaved));
      }
    }

    // Persist order to Firestore and decrement stock in real-time
    try {
      const cleanOrder = cleanFirestoreObject(order as unknown as Record<string, unknown>);
      await setDoc(doc(db, "orders", order.id), cleanOrder);
      for (const item of order.items) {
        if (item.productId) {
          try {
            await updateDoc(doc(db, "products", String(item.productId)), {
              stock: increment(-item.quantity),
            });
          } catch (stockError) {
            console.error(`Failed to update stock for product ${item.productId}:`, stockError);
          }
        }
      }
    } catch (error) {
      console.error("Error saving order to Firestore:", error);
    }

    addOrder(order);

    if (appliedCoupon?.code) {
      markCouponUsed(appliedCoupon.code);
    }
    
    // Grant post-order eligible coupon reward
    const grantedCode = await grantPostOrderReward();
    if (grantedCode) {
      setRewardCouponCode(grantedCode);
    }

    // Transition smoothly to delivery animation and clear purchased items from cart
    setTimeout(() => {
      clearCart();
      setIsProcessing(false);
      setIsBursting(false);
      setDeliveryPhase("delivery");
    }, 450);
  };

  const handleUpiTestSuccess = async (paymentId: string) => {
    setShowUpiTestModal(false);
    setIsBursting(true);
    setIsProcessing(true);
    const orderId = pendingOrderId || generateOrderId();
    await finishOrder(
      orderId,
      total,
      subtotal,
      discountAmount,
      deliveryFee,
      paymentId
    );
  };

  const handleUpiTestCancel = () => {
    setShowUpiTestModal(false);
    setIsProcessing(false);
    setIsBursting(false);
    setErrors((prev) => ({
      ...prev,
      submit: "UPI payment cancelled. You can retry anytime.",
    }));
  };

  const handlePlaceOrder = async () => {
    if (isProcessing) {
      return;
    }

    if (items.length === 0) {
      setErrors({ cart: "Your cart is empty. Add a tea to continue." });
      navigate("/shop");
      return;
    }

    if (appliedCoupon && isFirstOrderCouponCode(appliedCoupon.code) && !isFirstOrder) {
      setAppliedCoupon(null);
      setCouponFeedback({
        type: "error",
        message: "This coupon is only valid on your first order.",
      });
      setErrors((prev) => ({
        ...prev,
        submit: "The applied coupon is only valid on your first order. Please remove it to continue.",
      }));
      return;
    }

    const isValid = validateCheckout();

    if (!isValid) {
      setErrors((prev) => ({
        ...prev,
        submit: "Please check all required shipping and contact details.",
      }));
      return;
    }

    const orderId = generateOrderId();

    const finalizeOrder = async (razorpayPaymentId?: string) => {
      await finishOrder(
        orderId,
        total,
        subtotal,
        discountAmount,
        deliveryFee,
        razorpayPaymentId
      );
    };

    // 1. Dedicated UPI Payment Flow
    if (paymentMethod === "upi") {
      if (selectedUpiApp === "custom_vpa" && !upiVpa.trim()) {
        setErrors((prev) => ({
          ...prev,
          upi: "Please enter a valid UPI ID (e.g. yourname@upi)",
        }));
        return;
      }

      setPendingOrderId(orderId);
      setShowUpiTestModal(true);
      return;
    }

    // 2. Card / NetBanking Payment Flow
    if (paymentMethod === "card") {
      setIsBursting(true);
      setIsProcessing(true);

      const razorpayKey =
        import.meta.env.VITE_RAZORPAY_KEY_ID || "rzp_test_YourTestKeyHere";

      if (
        typeof window !== "undefined" &&
        (window as unknown as { Razorpay: unknown }).Razorpay
      ) {
        const options = {
          key: razorpayKey,
          amount: Math.round(total * 100),
          currency: "INR",
          name: "Leafly Tea Store",
          description: `Ceremonial Order ${orderId}`,
          image: "/leafly-logo.webp",
          handler: function (response: {
            razorpay_payment_id: string;
            razorpay_order_id?: string;
            razorpay_signature?: string;
          }) {
            finalizeOrder(response?.razorpay_payment_id);
          },
          prefill: {
            name: shippingAddress.fullName,
            email: email || currentUser?.email || "",
            contact: phone,
            method: "card",
          },
          method: {
            card: true,
            netbanking: true,
            upi: false,
            wallet: false,
            emi: false,
          },
          notes: {
            address: shippingAddress.addressLine1,
            orderId: orderId,
          },
          theme: {
            color: "#0b2b1e",
          },
          modal: {
            ondismiss: function () {
              setIsProcessing(false);
              setIsBursting(false);
              setErrors((prev) => ({
                ...prev,
                submit: "Payment cancelled. You can retry anytime.",
              }));
            },
          },
        };
        const RazorpayClass = (
          window as unknown as {
            Razorpay: new (opts: unknown) => {
              open: () => void;
              on: (
                event: string,
                cb: (res: { error: { description: string } }) => void
              ) => void;
            };
          }
        ).Razorpay;
        const rzp = new RazorpayClass(options);
        rzp.on("payment.failed", function (response) {
          console.error("Razorpay payment failed:", response.error);
          setIsProcessing(false);
          setIsBursting(false);
          setErrors((prev) => ({
            ...prev,
            submit: `Payment failed: ${response.error?.description || "Transaction declined."}`,
          }));
        });
        rzp.open();
      } else {
        await finalizeOrder();
      }
    } else {
      // 3. Pay on Delivery (COD) Flow
      setIsBursting(true);
      setIsProcessing(true);
      await finalizeOrder();
    }
  };

  if (items.length === 0 && deliveryPhase === "idle" && !isProcessing) {
    return (
      <main className="checkout-page checkout-page-empty">
        <div className="checkout-empty-state">
          <p className="checkout-eyebrow">YOUR CART</p>
          <h1>YOUR CART IS EMPTY</h1>
          <p>Your next tea ritual is waiting.</p>
          <button type="button" className="checkout-primary-button" onClick={() => navigate("/shop")}>
            EXPLORE TEAS
          </button>
        </div>
      </main>
    );
  }

  // Sequential phase rendering: Delivery Boy -> Coupon Reward -> Order Success
  if (deliveryPhase === "delivery") {
    return (
      <DeliveryAnimation
        onComplete={() => {
          setDeliveryPhase("coupon");
        }}
      />
    );
  }

  if (deliveryPhase === "coupon") {
    return (
      <CouponRewardAnimation
        couponCode={rewardCouponCode}
        onComplete={() => {
          navigate("/order-success");
        }}
      />
    );
  }

  return (
    <main className="checkout-page">
      <div className="checkout-header">
        <div>
          <p className="checkout-eyebrow">LEAFLY CHECKOUT</p>
          <h1>CHECKOUT</h1>
          <p className="checkout-tagline">Complete your tea ritual.</p>
        </div>

        <div className="checkout-progress" aria-label="Checkout progress">
          <span>01 CART</span>
          <span className="checkout-progress-active">02 CHECKOUT</span>
          <span>03 CONFIRMED</span>
        </div>
      </div>

      <div className="checkout-layout">
        <section className="checkout-column">
          {!currentUser && (
            <div className="checkout-auth-banner" role="alert">
              <div className="checkout-auth-banner-content">
                <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="#c9a24b" strokeWidth="2">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
                <div>
                  <strong>Authentication Required to Order</strong>
                  <p>Please log in or create an account to complete your checkout.</p>
                </div>
              </div>
              <button
                type="button"
                className="checkout-auth-banner-btn"
                onClick={() => navigate("/login", { state: { from: { pathname: "/checkout" } } })}
              >
                SIGN IN / REGISTER
              </button>
            </div>
          )}

          <div className="checkout-card">
            <div className="checkout-card-header">
              <p>CONTACT INFORMATION</p>
              {currentUser && <span style={{ fontSize: "11px", color: "#a87d22", fontWeight: 600 }}>✦ Verified Account</span>}
            </div>

            <div className="checkout-field-grid two-up">
              <label className="checkout-field">
                <span>Email {currentUser ? "(Tied to your authenticated account)" : ""}</span>
                <input
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  readOnly={Boolean(currentUser?.email)}
                  style={currentUser?.email ? { backgroundColor: "#f3efe6", cursor: "not-allowed" } : undefined}
                  aria-invalid={Boolean(errors.email)}
                />
                {errors.email && <small>{errors.email}</small>}
              </label>

              <PhoneInput
                id="checkout-phone"
                label="Phone"
                value={phone}
                country={shippingAddress.country}
                onCountryChange={handleCountryChange}
                onChange={handlePhoneChange}
                error={errors.phone}
                required
              />
            </div>
          </div>

          <div className="checkout-card">
            <div className="checkout-card-header">
              <p>DELIVERY ADDRESS</p>
            </div>

            <div className="checkout-field-grid">
              <label className="checkout-field full-width">
                <span>Full Name</span>
                <input
                  type="text"
                  value={shippingAddress.fullName}
                  onChange={(event) => updateAddressField("fullName", event.target.value)}
                  aria-invalid={Boolean(errors.fullName)}
                />
                {errors.fullName && <small>{errors.fullName}</small>}
              </label>

              <label className="checkout-field full-width">
                <span>Address Line 1</span>
                <input
                  type="text"
                  value={shippingAddress.addressLine1}
                  onChange={(event) => updateAddressField("addressLine1", event.target.value)}
                  aria-invalid={Boolean(errors.addressLine1)}
                />
                {errors.addressLine1 && <small>{errors.addressLine1}</small>}
              </label>

              <label className="checkout-field full-width">
                <span>Address Line 2</span>
                <input
                  type="text"
                  value={shippingAddress.addressLine2}
                  onChange={(event) => updateAddressField("addressLine2", event.target.value)}
                />
              </label>

              <label className="checkout-field">
                <span>Country</span>
                <select
                  className="checkout-select"
                  value={shippingAddress.country}
                  onChange={(event) => handleCountryChange(event.target.value)}
                  aria-invalid={Boolean(errors.country)}
                >
                  {COUNTRIES_LIST.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
                {errors.country && <small>{errors.country}</small>}
              </label>

              <label className="checkout-field">
                <span>State / Province</span>
                {shippingAddress.country === "India" ? (
                  <select
                    className="checkout-select"
                    value={shippingAddress.state}
                    onChange={(event) => handleStateChange(event.target.value)}
                    aria-invalid={Boolean(errors.state)}
                  >
                    <option value="">Select State / UT</option>
                    {availableStates.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                ) : (
                  <input
                    type="text"
                    value={shippingAddress.state}
                    onChange={(event) => updateAddressField("state", event.target.value)}
                    aria-invalid={Boolean(errors.state)}
                  />
                )}
                {errors.state && <small>{errors.state}</small>}
              </label>

              <label className="checkout-field">
                <span>City</span>
                {shippingAddress.country === "India" && availableCities.length > 0 ? (
                  <select
                    className="checkout-select"
                    value={shippingAddress.city}
                    onChange={(event) => updateAddressField("city", event.target.value)}
                    aria-invalid={Boolean(errors.city)}
                  >
                    <option value="">Select City</option>
                    {availableCities.map((ct) => (
                      <option key={ct} value={ct}>{ct}</option>
                    ))}
                  </select>
                ) : (
                  <input
                    type="text"
                    value={shippingAddress.city}
                    onChange={(event) => updateAddressField("city", event.target.value)}
                    aria-invalid={Boolean(errors.city)}
                  />
                )}
                {errors.city && <small>{errors.city}</small>}
              </label>

              <label className="checkout-field">
                <span>Postal Code</span>
                <input
                  type="text"
                  placeholder="e.g. 400001"
                  value={shippingAddress.postalCode}
                  onChange={(event) => updateAddressField("postalCode", event.target.value)}
                  aria-invalid={Boolean(errors.postalCode)}
                />
                {errors.postalCode && <small>{errors.postalCode}</small>}
              </label>

              <label className="checkout-field full-width">
                <span>Delivery Instructions (Optional)</span>
                <textarea
                  rows={3}
                  placeholder="Apartment number, gate instructions, preferred delivery location, etc."
                  value={deliveryInstructions}
                  onChange={(event) => setDeliveryInstructions(event.target.value)}
                />
              </label>
            </div>

            <label className="checkout-check-row">
              <input
                type="checkbox"
                checked={saveAddress}
                onChange={(event) => setSaveAddress(event.target.checked)}
              />
              <span>SAVE THIS ADDRESS</span>
            </label>
          </div>

          <div className="checkout-card">
            <div className="checkout-card-header">
              <p>DELIVERY METHOD</p>
            </div>

            <div className="checkout-option-list">
              <label className="checkout-option">
                <input
                  type="radio"
                  name="deliveryMethod"
                  checked={deliveryMethod === "standard"}
                  onChange={() => setDeliveryMethod("standard")}
                />
                <span>
                  <strong>STANDARD DELIVERY</strong>
                  <small>Free</small>
                </span>
              </label>

              <label className="checkout-option">
                <input
                  type="radio"
                  name="deliveryMethod"
                  checked={deliveryMethod === "express"}
                  onChange={() => setDeliveryMethod("express")}
                />
                <span>
                  <strong>EXPRESS DELIVERY</strong>
                  <small>₹99</small>
                </span>
              </label>
            </div>
          </div>

          <div className="checkout-card">
            <div className="checkout-card-header">
              <p>PAYMENT METHOD</p>
            </div>

            <div className="checkout-option-list payment-options" role="radiogroup" aria-label="Payment Method Selection">
              <label className={`checkout-option ${paymentMethod === "upi" ? "selected" : ""}`}>
                <input
                  type="radio"
                  name="paymentMethod"
                  value="upi"
                  checked={paymentMethod === "upi"}
                  onChange={() => {
                    setPaymentMethod("upi");
                    setErrors((prev) => {
                      const next = { ...prev };
                      delete next.upi;
                      return next;
                    });
                  }}
                  aria-label="UPI - Pay using UPI apps like Google Pay, PhonePe, Paytm, BHIM, etc."
                />
                <span className="checkout-option-content">
                  <strong className="checkout-option-title">UPI</strong>
                  <small className="checkout-option-desc">Pay using UPI apps like Google Pay, PhonePe, Paytm, BHIM, etc.</small>
                </span>
              </label>

              {paymentMethod === "upi" && (
                <UPIPaymentSelector
                  totalAmount={total}
                  selectedApp={selectedUpiApp}
                  onSelectApp={(appId) => {
                    setSelectedUpiApp(appId);
                    setErrors((prev) => {
                      const next = { ...prev };
                      delete next.upi;
                      return next;
                    });
                  }}
                  vpaInput={upiVpa}
                  onVpaChange={(vpa) => {
                    setUpiVpa(vpa);
                    setErrors((prev) => {
                      const next = { ...prev };
                      delete next.upi;
                      return next;
                    });
                  }}
                  error={errors.upi}
                />
              )}

              <label className={`checkout-option ${paymentMethod === "card" ? "selected" : ""}`}>
                <input
                  type="radio"
                  name="paymentMethod"
                  value="card"
                  checked={paymentMethod === "card"}
                  onChange={() => setPaymentMethod("card")}
                  aria-label="Debit card, credit card, or net banking - Pay securely using your card or net banking"
                />
                <span className="checkout-option-content">
                  <strong className="checkout-option-title">DEBIT CARD / CREDIT CARD / NETBANKING</strong>
                  <small className="checkout-option-desc">Pay securely using your card or net banking</small>
                </span>
              </label>

              {paymentMethod === "card" && (
                <div className="checkout-card-payment-info" role="region" aria-label="Card Payment Information">
                  <div className="checkout-card-badges">
                    <span className="checkout-card-badge">VISA</span>
                    <span className="checkout-card-badge">MasterCard</span>
                    <span className="checkout-card-badge">RuPay</span>
                    <span className="checkout-card-badge">NetBanking</span>
                  </div>
                  <p className="checkout-card-note">
                    🔒 Secured by 256-bit bank-grade encryption. You will be redirected to the secure bank gateway upon clicking Place Order.
                  </p>
                </div>
              )}

              <label className={`checkout-option ${paymentMethod === "cod" ? "selected" : ""}`}>
                <input
                  type="radio"
                  name="paymentMethod"
                  value="cod"
                  checked={paymentMethod === "cod"}
                  onChange={() => setPaymentMethod("cod")}
                  aria-label="Pay on Delivery - Pay when your order is delivered"
                />
                <span className="checkout-option-content">
                  <strong className="checkout-option-title">PAY ON DELIVERY</strong>
                  <small className="checkout-option-desc">Pay when your order is delivered</small>
                </span>
              </label>

              {paymentMethod === "cod" && (
                <div className="checkout-cod-message">
                  💵 Please keep exact cash or UPI QR payment ready at the time of delivery.
                </div>
              )}
            </div>
          </div>
        </section>

        <aside className="checkout-summary-card">
          <div className="checkout-card-header">
            <p>ORDER SUMMARY</p>
          </div>

          <div className="checkout-summary-items">
            {items.map((item) => (
              <article key={item.id} className="checkout-summary-item">
                <div className="checkout-summary-image-wrap">
                  <img src={item.product.image} alt={item.product.name} loading="lazy" />
                </div>

                <div className="checkout-summary-copy">
                  <div className="checkout-summary-row">
                    <strong>{item.product.name}</strong>
                    <span>{currencyFormatter.format(item.price * item.quantity)}</span>
                  </div>
                  <small>{item.product.category} · {item.variant || item.weight}</small>
                  <div className="checkout-summary-meta">
                    <span>Qty: {item.quantity}</span>
                    <span>{currencyFormatter.format(item.price)}</span>
                  </div>
                </div>
              </article>
            ))}
          </div>

          {/* COUPON SECTION */}
          <div className="checkout-coupon-section">
            <label htmlFor="checkout-coupon-input" className="checkout-coupon-title">
              COUPON CODE
            </label>

            {appliedCoupon ? (
              <div className="checkout-coupon-applied">
                <div className="checkout-coupon-tag">
                  <span className="checkout-coupon-code">{appliedCoupon.code}</span>
                  <span className="checkout-coupon-badge">
                    {appliedCoupon.discountType === "fixed"
                      ? `-₹${appliedCoupon.discountValue} OFF`
                      : `-${appliedCoupon.discountValue}% OFF`}
                  </span>
                </div>
                <button
                  type="button"
                  className="checkout-coupon-remove"
                  onClick={handleRemoveCoupon}
                  aria-label="Remove applied coupon"
                >
                  REMOVE
                </button>
              </div>
            ) : (
              <form className="checkout-coupon-form" onSubmit={handleApplyCoupon}>
                <input
                  id="checkout-coupon-input"
                  type="text"
                  placeholder="Enter Coupon Code"
                  value={couponInput}
                  onChange={(event) => {
                    setCouponInput(event.target.value);
                    if (couponFeedback) setCouponFeedback(null);
                  }}
                  aria-label="Coupon code"
                />
                <button
                  type="button"
                  className="checkout-coupon-apply-btn"
                  onClick={() => handleApplyCoupon()}
                >
                  APPLY
                </button>
              </form>
            )}

            {couponFeedback && (
              <p className={`checkout-coupon-message ${couponFeedback.type}`} role="status">
                {couponFeedback.message}
              </p>
            )}
          </div>

          <div className="checkout-total-box">
            <div>
              <span>Subtotal</span>
              <strong>{currencyFormatter.format(subtotal)}</strong>
            </div>
            <div>
              <span>Delivery</span>
              <strong>{deliveryFee === 0 ? "Free" : currencyFormatter.format(deliveryFee)}</strong>
            </div>
            {discountAmount > 0 && (
              <div className="checkout-discount-row">
                <span>
                  Discount ({appliedCoupon?.code} ·{" "}
                  {appliedCoupon?.discountType === "fixed"
                    ? `₹${appliedCoupon?.discountValue} OFF`
                    : `${appliedCoupon?.discountValue}%`}
                  )
                </span>
                <strong className="checkout-discount-value">-{currencyFormatter.format(discountAmount)}</strong>
              </div>
            )}
            <div className="checkout-total-final">
              <span>TOTAL</span>
              <strong>{currencyFormatter.format(total)}</strong>
            </div>
          </div>

          {errors.cart && <p className="checkout-inline-error">{errors.cart}</p>}
          {errors.submit && <p className="checkout-inline-error">{errors.submit}</p>}
          {errors.payment && <p className="checkout-inline-error">{errors.payment}</p>}

          <div className="checkout-button-container">
            <button
              type="button"
              className={`checkout-primary-button ${isProcessing ? "brewing" : ""} ${isBursting ? "bursting" : ""}`}
              disabled={isProcessing || items.length === 0}
              aria-label={isProcessing ? "Brewing ritual..." : "Place order"}
              onClick={handlePlaceOrder}
            >
              {isProcessing ? (
                <span className="checkout-brewing-content">
                  <span className="checkout-teapot-icon" aria-hidden="true">🫖</span>
                  BREWING YOUR RITUAL...
                </span>
              ) : (
                "PLACE ORDER"
              )}
            </button>

            {/* LEAF BURST PARTICLES ANIMATION */}
            {isBursting && (
              <div className="checkout-leaf-burst" aria-hidden="true">
                {[...Array(8)].map((_, i) => (
                  <span key={i} className={`burst-leaf burst-leaf-${i + 1}`}>
                    <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
                      <path d="M21 3C21 3 13.5 4.5 9 9C4.5 13.5 3 21 3 21C3 21 10.5 19.5 15 15C19.5 10.5 21 3 21 3Z" />
                      <path d="M3 21C6.5 17.5 10 14 14 10" stroke="rgba(255,255,255,0.4)" strokeWidth="1" fill="none" />
                    </svg>
                  </span>
                ))}
              </div>
            )}
          </div>
        </aside>
      </div>

      {showUpiTestModal && (
        <UPITestModeModal
          orderId={pendingOrderId || "ORD-TEST"}
          amount={total}
          selectedApp={selectedUpiApp}
          vpa={selectedUpiApp === "custom_vpa" ? upiVpa : undefined}
          onSuccess={handleUpiTestSuccess}
          onCancel={handleUpiTestCancel}
        />
      )}

      <Footer />
    </main>
  );
}
