import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import DeliveryAnimation from "../components/DeliveryAnimation";
import { useCart } from "../context/CartContext";
import {
  useOrderContext,
  type Order,
  type ShippingAddress,
} from "../context/OrderContext";
import "./Checkout.css";

type DeliveryMethod = "standard" | "express";
type PaymentMethod = "card" | "upi" | "cod";

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

const SAVED_ADDRESSES_KEY = "leafly_saved_addresses";
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

function readSavedAddresses(): ShippingAddress[] {
  try {
    const saved = localStorage.getItem(SAVED_ADDRESSES_KEY);
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
  city: "",
  state: "",
  postalCode: "",
  country: "India",
};

export default function Checkout() {
  const navigate = useNavigate();
  const { items, subtotal, clearCart } = useCart();
  const { addOrder } = useOrderContext();

  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [shippingAddress, setShippingAddress] = useState<AddressForm>(defaultAddress);
  const [deliveryMethod, setDeliveryMethod] = useState<DeliveryMethod>("standard");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("card");
  const [saveAddress, setSaveAddress] = useState(false);
  const [cardNumber, setCardNumber] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvv, setCvv] = useState("");
  const [cardName, setCardName] = useState("");
  const [upiId, setUpiId] = useState("");
  const [errors, setErrors] = useState<FormErrors>({});
  const [isAnimating, setIsAnimating] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    const savedAddresses = readSavedAddresses();

    if (savedAddresses.length > 0) {
      const lastSaved = savedAddresses[0];
      setShippingAddress({
        fullName: lastSaved.fullName,
        addressLine1: lastSaved.addressLine1,
        addressLine2: lastSaved.addressLine2 ?? "",
        city: lastSaved.city,
        state: lastSaved.state,
        postalCode: lastSaved.postalCode,
        country: lastSaved.country,
      });
      setSaveAddress(true);
    }
  }, []); // This effect should only run once on mount to load saved addresses

  const deliveryFee = useMemo(
    () => (deliveryMethod === "express" ? 99 : 0),
    [deliveryMethod]
  );

  const total = useMemo(() => subtotal + deliveryFee, [deliveryFee, subtotal]);

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
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      nextErrors.email = "Enter a valid email address.";
    }

    if (!phone.trim()) {
      nextErrors.phone = "Phone number is required.";
    }

    if (!shippingAddress.fullName.trim()) {
      nextErrors.fullName = "Full name is required.";
    }

    if (!shippingAddress.addressLine1.trim()) {
      nextErrors.addressLine1 = "Address line 1 is required.";
    }

    if (!shippingAddress.city.trim()) {
      nextErrors.city = "City is required.";
    }

    if (!shippingAddress.state.trim()) {
      nextErrors.state = "State is required.";
    }

    if (!shippingAddress.postalCode.trim()) {
      nextErrors.postalCode = "Postal code is required.";
    }

    if (!shippingAddress.country.trim()) {
      nextErrors.country = "Country is required.";
    }

    if (paymentMethod === "card") {
      if (!cardNumber.trim()) {
        nextErrors.cardNumber = "Card number is required.";
      }

      if (!expiry.trim()) {
        nextErrors.expiry = "Expiry is required.";
      }

      if (!cvv.trim()) {
        nextErrors.cvv = "CVV is required.";
      }

      if (!cardName.trim()) {
        nextErrors.cardName = "Name on card is required.";
      }
    }

    if (paymentMethod === "upi" && !upiId.trim()) {
      nextErrors.upiId = "UPI ID is required.";
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handlePlaceOrder = () => {
    if (isProcessing) {
      return;
    }

    if (items.length === 0) {
      setErrors({ cart: "Your cart is empty. Add a tea to continue." });
      navigate("/shop");
      return;
    }

    const isValid = validateCheckout();

    if (!isValid) {
      return;
    }

    setIsProcessing(true);

    const order: Order = {
      id: generateOrderId(),
      createdAt: new Date().toISOString(),
      status: "Processing",
      items: items.map(({ product, quantity }) => ({
        id: String(product.id),
        name: product.name,
        image: product.image,
        price: product.price,
        quantity,
        category: product.category,
      })),
      subtotal,
      deliveryFee,
      total,
      deliveryMethod:
        deliveryMethod === "express" ? "Express Delivery" : "Standard Delivery",
      paymentMethod:
        paymentMethod === "card"
          ? "Card"
          : paymentMethod === "upi"
            ? "UPI"
            : "Cash on Delivery",
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

    if (saveAddress) {
      const savedAddresses = readSavedAddresses();
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

      localStorage.setItem(SAVED_ADDRESSES_KEY, JSON.stringify(nextSaved));
    }

    addOrder(order);
    clearCart();
    setIsProcessing(false);
    setIsAnimating(true);
  };

  if (items.length === 0 && !isAnimating) {
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

  if (isAnimating) {
    return (
      <DeliveryAnimation
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
          <div className="checkout-card">
            <div className="checkout-card-header">
              <p>CONTACT INFORMATION</p>
            </div>

            <div className="checkout-field-grid two-up">
              <label className="checkout-field">
                <span>Email</span>
                <input
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  aria-invalid={Boolean(errors.email)}
                />
                {errors.email && <small>{errors.email}</small>}
              </label>

              <label className="checkout-field">
                <span>Phone</span>
                <input
                  type="tel"
                  value={phone}
                  onChange={(event) => setPhone(event.target.value)}
                  aria-invalid={Boolean(errors.phone)}
                />
                {errors.phone && <small>{errors.phone}</small>}
              </label>
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
                <span>City</span>
                <input
                  type="text"
                  value={shippingAddress.city}
                  onChange={(event) => updateAddressField("city", event.target.value)}
                  aria-invalid={Boolean(errors.city)}
                />
                {errors.city && <small>{errors.city}</small>}
              </label>

              <label className="checkout-field">
                <span>State</span>
                <input
                  type="text"
                  value={shippingAddress.state}
                  onChange={(event) => updateAddressField("state", event.target.value)}
                  aria-invalid={Boolean(errors.state)}
                />
                {errors.state && <small>{errors.state}</small>}
              </label>

              <label className="checkout-field">
                <span>Postal Code</span>
                <input
                  type="text"
                  value={shippingAddress.postalCode}
                  onChange={(event) => updateAddressField("postalCode", event.target.value)}
                  aria-invalid={Boolean(errors.postalCode)}
                />
                {errors.postalCode && <small>{errors.postalCode}</small>}
              </label>

              <label className="checkout-field">
                <span>Country</span>
                <input
                  type="text"
                  value={shippingAddress.country}
                  onChange={(event) => updateAddressField("country", event.target.value)}
                  aria-invalid={Boolean(errors.country)}
                />
                {errors.country && <small>{errors.country}</small>}
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

            <div className="checkout-option-list payment-options">
              <label className="checkout-option">
                <input
                  type="radio"
                  name="paymentMethod"
                  checked={paymentMethod === "card"}
                  onChange={() => setPaymentMethod("card")}
                />
                <span>
                  <strong>CARD</strong>
                </span>
              </label>

              <label className="checkout-option">
                <input
                  type="radio"
                  name="paymentMethod"
                  checked={paymentMethod === "upi"}
                  onChange={() => setPaymentMethod("upi")}
                />
                <span>
                  <strong>UPI</strong>
                </span>
              </label>

              <label className="checkout-option">
                <input
                  type="radio"
                  name="paymentMethod"
                  checked={paymentMethod === "cod"}
                  onChange={() => setPaymentMethod("cod")}
                />
                <span>
                  <strong>CASH ON DELIVERY</strong>
                </span>
              </label>
            </div>

            {paymentMethod === "card" && (
              <div className="checkout-field-grid">
                <label className="checkout-field full-width">
                  <span>Card Number</span>
                  <input
                    type="text"
                    value={cardNumber}
                    onChange={(event) => setCardNumber(event.target.value)}
                    aria-invalid={Boolean(errors.cardNumber)}
                  />
                  {errors.cardNumber && <small>{errors.cardNumber}</small>}
                </label>

                <label className="checkout-field">
                  <span>Expiry</span>
                  <input
                    type="text"
                    value={expiry}
                    onChange={(event) => setExpiry(event.target.value)}
                    aria-invalid={Boolean(errors.expiry)}
                  />
                  {errors.expiry && <small>{errors.expiry}</small>}
                </label>

                <label className="checkout-field">
                  <span>CVV</span>
                  <input
                    type="password"
                    value={cvv}
                    onChange={(event) => setCvv(event.target.value)}
                    aria-invalid={Boolean(errors.cvv)}
                  />
                  {errors.cvv && <small>{errors.cvv}</small>}
                </label>

                <label className="checkout-field full-width">
                  <span>Name on Card</span>
                  <input
                    type="text"
                    value={cardName}
                    onChange={(event) => setCardName(event.target.value)}
                    aria-invalid={Boolean(errors.cardName)}
                  />
                  {errors.cardName && <small>{errors.cardName}</small>}
                </label>
              </div>
            )}

            {paymentMethod === "upi" && (
              <label className="checkout-field full-width">
                <span>UPI ID</span>
                <input
                  type="text"
                  value={upiId}
                  onChange={(event) => setUpiId(event.target.value)}
                  aria-invalid={Boolean(errors.upiId)}
                />
                {errors.upiId && <small>{errors.upiId}</small>}
              </label>
            )}

            {paymentMethod === "cod" && (
              <div className="checkout-cod-message">
                Pay in cash when your tea arrives. No payment is processed now.
              </div>
            )}
          </div>
        </section>

        <aside className="checkout-summary-card">
          <div className="checkout-card-header">
            <p>ORDER SUMMARY</p>
          </div>

          <div className="checkout-summary-items">
            {items.map(({ product, quantity }) => (
              <article key={product.id} className="checkout-summary-item">
                <div className="checkout-summary-image-wrap">
                  <img src={product.image} alt={product.name} />
                </div>

                <div className="checkout-summary-copy">
                  <div className="checkout-summary-row">
                    <strong>{product.name}</strong>
                    <span>{currencyFormatter.format(product.price * quantity)}</span>
                  </div>
                  <small>{product.category}</small>
                  <div className="checkout-summary-meta">
                    <span>Qty: {quantity}</span>
                    <span>{currencyFormatter.format(product.price)}</span>
                  </div>
                </div>
              </article>
            ))}
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
            <div>
              <span>Discount</span>
              <strong>₹0</strong>
            </div>
            <div className="checkout-total-final">
              <span>TOTAL</span>
              <strong>{currencyFormatter.format(total)}</strong>
            </div>
          </div>

          {errors.cart && <p className="checkout-inline-error">{errors.cart}</p>}

          <button
            type="button"
            className="checkout-primary-button"
            disabled={isProcessing || items.length === 0}
            aria-label={isProcessing ? "Processing order" : "Place order"}
            onClick={handlePlaceOrder}
          >
            {isProcessing ? "PROCESSING ORDER..." : "PLACE ORDER"}
          </button>
        </aside>
      </div>
    </main>
  );
}
