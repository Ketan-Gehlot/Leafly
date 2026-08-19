import { useNavigate } from "react-router-dom";
import { useOrderContext } from "../context/OrderContext";
import Footer from "../components/Footer";
import "./Orders.css";

const currencyFormatter = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

export default function Orders() {
  const navigate = useNavigate();
  const { orders } = useOrderContext();

  const sortedOrders = [...orders].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  return (
    <main className="orders-page">
      <div className="orders-header">
        <div>
          <p className="orders-eyebrow">MY ORDERS</p>
          <h1>MY ORDERS</h1>
          <p className="orders-tagline">Keep track of every tea ritual you&apos;ve ordered.</p>
        </div>
      </div>

      {sortedOrders.length === 0 ? (
        <div className="orders-empty">
          <h2>No orders yet</h2>
          <p>Your tea ritual is waiting.</p>
          <button type="button" className="orders-primary-button" onClick={() => navigate("/shop")}>
            EXPLORE TEAS
          </button>
        </div>
      ) : (
        <div className="orders-list">
          {sortedOrders.map((order) => (
            <article key={order.id} className="orders-card">
              <div className="orders-card-top">
                <div>
                  <p className="orders-card-label">Order ID</p>
                  <strong>{order.id}</strong>
                </div>
                <span className="orders-status">{order.status}</span>
              </div>

              <div className="orders-card-meta">
                <span>{new Date(order.createdAt).toLocaleDateString("en-IN", { dateStyle: "medium" })}</span>
                <span>{order.deliveryMethod}</span>
                <span>{currencyFormatter.format(order.total)}</span>
              </div>

              <div className="orders-items">
                {order.items.map((item) => (
                  <div key={`${order.id}-${item.id}`} className="orders-item-row">
                    <div className="orders-item-copy">
                      <strong>{item.name}</strong>
                      <small>{item.category || "Tea"} · {item.variant || item.weight || "100g"}</small>
                    </div>
                    <span>
                      {item.quantity} × {currencyFormatter.format(item.price)}
                    </span>
                  </div>
                ))}
              </div>
            </article>
          ))}
        </div>
      )}
      <Footer />
    </main>
  );
}
