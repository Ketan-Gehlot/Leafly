import { useNavigate } from "react-router-dom";
import { useOrderContext } from "../context/OrderContext";
import Footer from "../components/Footer";
import "./OrderSuccess.css";

const currencyFormatter = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

export default function OrderSuccess() {
  const navigate = useNavigate();
  const { latestOrder } = useOrderContext();

  const order = latestOrder;

  if (!order) {
    return (
      <main className="order-success-page order-success-empty">
        <div className="order-success-card">
          <p className="order-success-eyebrow">ORDER STATUS</p>
          <h1>ORDER CONFIRMED</h1>
          <p>No recent order was found.</p>
          <button type="button" className="order-success-primary" onClick={() => navigate("/shop")}>
            CONTINUE SHOPPING
          </button>
        </div>
        <Footer />
      </main>
    );
  }

  return (
    <main className="order-success-page">
      <div className="order-success-card">
        <p className="order-success-eyebrow">ORDER STATUS</p>
        <h1>ORDER CONFIRMED</h1>
        <p className="order-success-tagline">Your tea is on its way.</p>

        <div className="order-success-grid">
          <div className="order-success-block">
            <span>Order ID</span>
            <strong>{order.id}</strong>
          </div>
          <div className="order-success-block">
            <span>Order Date</span>
            <strong>{new Date(order.createdAt).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" })}</strong>
          </div>
          <div className="order-success-block">
            <span>Total</span>
            <strong>{currencyFormatter.format(order.total)}</strong>
          </div>
          <div className="order-success-block">
            <span>Delivery</span>
            <strong>{order.deliveryMethod}</strong>
          </div>
        </div>

        <div className="order-success-details">
          <div>
            <span>Items</span>
            <ul>
              {order.items.map((item) => (
                <li key={item.id}>
                  {item.name} {item.variant ? `(${item.variant})` : ""} × {item.quantity}
                </li>
              ))}
            </ul>
          </div>

          <div>
            <span>Shipping Address</span>
            <p>
              {order.shippingAddress.fullName}
              <br />
              {order.shippingAddress.addressLine1}
              {order.shippingAddress.addressLine2 ? `, ${order.shippingAddress.addressLine2}` : ""}
              <br />
              {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.postalCode}
              <br />
              {order.shippingAddress.country}
            </p>
          </div>
        </div>

        <div className="order-success-actions">
          <button type="button" className="order-success-secondary" onClick={() => navigate("/orders")}>
            VIEW MY ORDERS
          </button>
          <button type="button" className="order-success-primary" onClick={() => navigate("/shop")}>
            CONTINUE SHOPPING
          </button>
        </div>
      </div>
      <Footer />
    </main>
  );
}
