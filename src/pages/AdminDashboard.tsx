import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useProducts } from "../context/ProductContext";
import { type Product, type TeaCategory } from "../data/products";
import { type Order, type OrderStatus } from "../types/contracts";
import "./AdminDashboard.css";

const ALL_ORDER_STATUSES: OrderStatus[] = [
  "Processing",
  "Confirmed",
  "Shipped",
  "Out for Delivery",
  "Delivered",
  "Cancelled",
];

const INITIAL_ADMIN_ORDERS: Order[] = [
  {
    id: "LF-20260824-8923",
    customerName: "Aarav Sharma",
    customerEmail: "aarav.sharma@example.com",
    customerPhone: "+91 9820011223",
    items: [
      {
        name: "Himalayan Green Tea",
        quantity: 2,
        price: 699,
        image: "/leafly-green-tea.webp",
        variant: "100g",
      },
    ],
    subtotal: 1398,
    deliveryFee: 0,
    total: 1398,
    createdAt: "2026-08-24T10:30:00Z",
    orderStatus: "Processing",
    status: "Processing",
    deliveryMethod: "Standard Delivery",
    paymentMethod: "UPI",
    paymentStatus: "Paid",
    shippingAddress: {
      fullName: "Aarav Sharma",
      addressLine1: "42 Tea Garden Lane",
      city: "Mumbai",
      state: "Maharashtra",
      postalCode: "400001",
      country: "India",
    },
  },
  {
    id: "LF-20260823-8922",
    customerName: "Priya Patel",
    customerEmail: "priya.patel@example.com",
    customerPhone: "+91 9811223344",
    items: [
      {
        name: "Silver Tips White Tea",
        quantity: 1,
        price: 899,
        image: "/leafly-white-tea.webp",
        variant: "100g",
      },
    ],
    subtotal: 899,
    deliveryFee: 0,
    total: 899,
    createdAt: "2026-08-23T14:15:00Z",
    orderStatus: "Shipped",
    status: "Shipped",
    deliveryMethod: "Express Delivery",
    paymentMethod: "Card",
    paymentStatus: "Paid",
    shippingAddress: {
      fullName: "Priya Patel",
      addressLine1: "15 Marine Drive",
      city: "Mumbai",
      state: "Maharashtra",
      postalCode: "400020",
      country: "India",
    },
  },
  {
    id: "LF-20260822-8921",
    customerName: "Rohan Gupta",
    customerEmail: "rohan.g@example.com",
    customerPhone: "+91 9833445566",
    items: [
      {
        name: "Mountain Pu-erh",
        quantity: 3,
        price: 1099,
        image: "/leafly-puerh-tea.webp",
        variant: "250g",
      },
    ],
    subtotal: 3297,
    deliveryFee: 0,
    total: 3297,
    createdAt: "2026-08-22T09:00:00Z",
    orderStatus: "Delivered",
    status: "Delivered",
    deliveryMethod: "Standard Delivery",
    paymentMethod: "Pay on Delivery",
    paymentStatus: "Delivered",
    shippingAddress: {
      fullName: "Rohan Gupta",
      addressLine1: "78 Bandra West",
      city: "Mumbai",
      state: "Maharashtra",
      postalCode: "400050",
      country: "India",
    },
  },
];

export default function AdminDashboard() {
  const { products, updateProduct, addProduct, deleteProduct } = useProducts();
  const [activeTab, setActiveTab] = useState<"dashboard" | "products" | "orders">("dashboard");
  const [orders, setOrders] = useState<Order[]>(INITIAL_ADMIN_ORDERS);
  const [ordersLoading] = useState<boolean>(false);

  const [isEditing, setIsEditing] = useState(false);
  const [currentProduct, setCurrentProduct] = useState<Partial<Product>>({});
  const [updatingOrderId, setUpdatingOrderId] = useState<string | null>(null);

  const totalSales = orders.reduce((sum, o) => sum + (o.total || 0), 0);
  const deliveredOrdersCount = orders.filter((o) => (o.orderStatus || o.status) === "Delivered").length;
  const processingOrdersCount = orders.filter((o) => (o.orderStatus || o.status) === "Processing" || (o.orderStatus || o.status) === "Confirmed").length;

  const handleEditClick = (product: Product) => {
    setCurrentProduct(product);
    setIsEditing(true);
  };

  const handleAddNewClick = () => {
    setCurrentProduct({
      name: "",
      category: "Green",
      origin: "",
      caffeine: "Medium",
      weight: "100g",
      price: 0,
      oldPrice: undefined,
      stock: 100,
      inStock: true,
      badge: "Popular",
      image: "/leafly-green-tea.webp",
      description: "",
      variants: {
        "100g": { weight: "100g", price: 0 },
        "250g": { weight: "250g", price: 0 },
      },
    });
    setIsEditing(true);
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (currentProduct.id) {
      const updated = { ...currentProduct } as Product;
      updated.variants = {
        "100g": { weight: "100g", price: updated.price, oldPrice: updated.oldPrice },
        "250g": { weight: "250g", price: Math.round(updated.price * 2.2), oldPrice: updated.oldPrice ? Math.round(updated.oldPrice * 2.2) : undefined },
      };
      await updateProduct(updated);
    } else {
      const newProduct = { ...currentProduct } as Product;
      newProduct.id = Date.now();
      newProduct.variants = {
        "100g": { weight: "100g", price: newProduct.price, oldPrice: newProduct.oldPrice },
        "250g": { weight: "250g", price: Math.round(newProduct.price * 2.2), oldPrice: newProduct.oldPrice ? Math.round(newProduct.oldPrice * 2.2) : undefined },
      };
      await addProduct(newProduct);
    }
    setIsEditing(false);
  };

  const handleDeleteProduct = async (id: number) => {
    if (window.confirm("Are you sure you want to deactivate/delete this product?")) {
      await deleteProduct(id);
    }
  };

  const handleUpdateOrderStatus = async (orderId: string, newStatus: OrderStatus) => {
    setUpdatingOrderId(orderId);
    setOrders((prev) =>
      prev.map((o) =>
        o.id === orderId ? { ...o, orderStatus: newStatus, status: newStatus } : o
      )
    );
    setUpdatingOrderId(null);
  };

  return (
    <div className="admin-layout">
      {/* SIDEBAR */}
      <aside className="admin-sidebar">
        <div className="admin-brand">
          <h2>Leafly Admin</h2>
          <small style={{ color: "rgba(247, 243, 236, 0.6)", fontSize: "11px", letterSpacing: "1px" }}>
            MANAGEMENT SANCTUARY
          </small>
        </div>
        <nav className="admin-nav">
          <button 
            className={activeTab === "dashboard" ? "active" : ""} 
            onClick={() => setActiveTab("dashboard")}
          >
            Dashboard Overview
          </button>
          <button 
            className={activeTab === "products" ? "active" : ""} 
            onClick={() => setActiveTab("products")}
          >
            Products ({products.length})
          </button>
          <button 
            className={activeTab === "orders" ? "active" : ""} 
            onClick={() => setActiveTab("orders")}
          >
            Orders ({orders.length})
          </button>
        </nav>
        
        <div className="admin-sidebar-footer">
          <Link to="/" className="admin-back-link">
            ← Back to Store
          </Link>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="admin-main">
        {activeTab === "dashboard" && (
          <div className="admin-dashboard">
            <h1>Dashboard Overview</h1>
            
            <div className="admin-stats-grid">
              <div className="admin-stat-card">
                <h3>Total Products</h3>
                <p>{products.length}</p>
                <span className="admin-stat-badge positive">Shop + Teaware Live</span>
              </div>
              <div className="admin-stat-card">
                <h3>Total Revenue</h3>
                <p>₹{totalSales.toLocaleString("en-IN")}</p>
                <span className="admin-stat-badge positive">{orders.length} Total Orders</span>
              </div>
              <div className="admin-stat-card">
                <h3>Active Processing</h3>
                <p>{processingOrdersCount}</p>
                <span className="admin-stat-badge">{deliveredOrdersCount} Delivered</span>
              </div>
            </div>

            <div className="admin-dashboard-row">
              <div className="admin-recent-orders-section" style={{ flex: 1 }}>
                <h2>Recent Customer Orders</h2>
                {ordersLoading ? (
                  <p style={{ color: "rgba(11, 43, 30, 0.6)" }}>Loading live orders from Firestore...</p>
                ) : orders.length === 0 ? (
                  <p style={{ color: "rgba(11, 43, 30, 0.6)" }}>No orders placed yet.</p>
                ) : (
                  <div className="admin-table-container">
                    <table className="admin-table">
                      <thead>
                        <tr>
                          <th>Order ID</th>
                          <th>Customer</th>
                          <th>Items</th>
                          <th>Total</th>
                          <th>Payment</th>
                          <th>Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {orders.slice(0, 8).map((order) => (
                          <tr key={order.id}>
                            <td>
                              <strong>{order.id}</strong><br/>
                              <span className="admin-order-date">
                                {new Date(order.createdAt).toLocaleDateString("en-IN", { dateStyle: "short" })}
                              </span>
                            </td>
                            <td>
                              <strong>{order.customerName || order.shippingAddress?.fullName || "Customer"}</strong><br />
                              <span style={{ fontSize: "11px", color: "rgba(11,43,30,0.6)" }}>{order.userId?.slice(0, 8)}</span>
                            </td>
                            <td>
                              {order.items?.map((it) => `${it.name} (${it.quantity})`).join(", ")}
                            </td>
                            <td>₹{order.total?.toLocaleString("en-IN")}</td>
                            <td>{order.paymentMethod || "Pay on Delivery"}</td>
                            <td>
                              <span className={`admin-status-badge ${(order.orderStatus || order.status || "processing").toLowerCase().replace(/\s+/g, "-")}`}>
                                {order.orderStatus || order.status || "Processing"}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === "products" && !isEditing && (
          <div className="admin-products">
            <div className="admin-products-header">
              <div>
                <h1>Manage Products</h1>
                <p style={{ margin: "4px 0 0", color: "rgba(11,43,30,0.6)", fontSize: "14px" }}>
                  Add, edit, change pricing, stock, badges, and catalog availability.
                </p>
              </div>
              <button className="admin-btn-primary" onClick={handleAddNewClick}>+ Add New Product</button>
            </div>
            <div className="admin-table-container">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Image</th>
                    <th>Name</th>
                    <th>Category</th>
                    <th>Price</th>
                    <th>Stock</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((product) => (
                    <tr key={product.id}>
                      <td>
                        <img src={product.image} alt={product.name} className="admin-table-img" />
                      </td>
                      <td>
                        <strong>{product.name}</strong><br />
                        <span style={{ fontSize: "11px", color: "rgba(11,43,30,0.5)" }}>{product.origin}</span>
                      </td>
                      <td>{product.category}</td>
                      <td>
                        <strong>₹{product.price.toLocaleString("en-IN")}</strong>
                        {product.oldPrice ? (
                          <span style={{ textDecoration: "line-through", color: "#999", marginLeft: "6px", fontSize: "12px" }}>
                            ₹{product.oldPrice}
                          </span>
                        ) : null}
                      </td>
                      <td>{product.stock ?? 100} units</td>
                      <td>
                        <span className={`admin-stat-badge ${product.inStock !== false ? "positive" : ""}`}>
                          {product.inStock !== false ? "In Stock" : "Out of Stock"}
                        </span>
                      </td>
                      <td>
                        <div style={{ display: "flex", gap: "8px" }}>
                          <button className="admin-btn-secondary" onClick={() => handleEditClick(product)}>Edit</button>
                          <button 
                            className="admin-btn-secondary" 
                            style={{ borderColor: "#dc2626", color: "#dc2626" }}
                            onClick={() => handleDeleteProduct(product.id)}
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === "products" && isEditing && (
          <div className="admin-edit-product">
            <h1>{currentProduct.id ? "Edit Product" : "Add New Product"}</h1>
            <form className="admin-form" onSubmit={handleSaveProduct}>
              <div className="form-group">
                <label>Product Name</label>
                <input 
                  type="text" 
                  required 
                  value={currentProduct.name || ""} 
                  onChange={(e) => setCurrentProduct({ ...currentProduct, name: e.target.value })} 
                />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Category</label>
                  <select 
                    value={currentProduct.category || "Green"} 
                    onChange={(e) => setCurrentProduct({ ...currentProduct, category: e.target.value as TeaCategory })}
                  >
                    <option value="Green">Green Tea</option>
                    <option value="White">White Tea</option>
                    <option value="Black">Black Tea</option>
                    <option value="Oolong">Oolong Tea</option>
                    <option value="Pu-erh">Pu-erh Tea</option>
                    <option value="Teaware">Teaware</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Origin / Region</label>
                  <input 
                    type="text" 
                    required 
                    placeholder="e.g. Darjeeling, Assam, Nilgiri"
                    value={currentProduct.origin || ""} 
                    onChange={(e) => setCurrentProduct({ ...currentProduct, origin: e.target.value })} 
                  />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Price (₹)</label>
                  <input 
                    type="number" 
                    required 
                    min="1"
                    value={currentProduct.price || ""} 
                    onChange={(e) => setCurrentProduct({ ...currentProduct, price: Number(e.target.value) })} 
                  />
                </div>
                <div className="form-group">
                  <label>Old Price (₹) - For Discounts</label>
                  <input 
                    type="number" 
                    min="0"
                    placeholder="Optional original price"
                    value={currentProduct.oldPrice || ""} 
                    onChange={(e) => setCurrentProduct({ ...currentProduct, oldPrice: Number(e.target.value) || undefined })} 
                  />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Stock Quantity</label>
                  <input 
                    type="number" 
                    min="0"
                    value={currentProduct.stock ?? 100} 
                    onChange={(e) => setCurrentProduct({ ...currentProduct, stock: Number(e.target.value) })} 
                  />
                </div>
                <div className="form-group">
                  <label>Availability</label>
                  <select 
                    value={currentProduct.inStock !== false ? "true" : "false"}
                    onChange={(e) => setCurrentProduct({ ...currentProduct, inStock: e.target.value === "true" })}
                  >
                    <option value="true">In Stock & Active</option>
                    <option value="false">Out of Stock</option>
                  </select>
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Badge</label>
                  <select 
                    value={currentProduct.badge || "Popular"} 
                    onChange={(e) => setCurrentProduct({ ...currentProduct, badge: e.target.value as "Premium" | "Popular" | "Bestseller" })}
                  >
                    <option value="Popular">Popular</option>
                    <option value="Premium">Premium</option>
                    <option value="Bestseller">Bestseller</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Caffeine Level</label>
                  <select 
                    value={currentProduct.caffeine || "Medium"} 
                    onChange={(e) => setCurrentProduct({ ...currentProduct, caffeine: e.target.value as "Low" | "Medium" | "High" })}
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                  </select>
                </div>
              </div>
              <div className="form-group">
                <label>Image URL</label>
                <input 
                  type="text" 
                  value={currentProduct.image || ""} 
                  onChange={(e) => setCurrentProduct({ ...currentProduct, image: e.target.value })} 
                />
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea 
                  rows={4}
                  style={{ padding: "0.75rem", borderRadius: "4px", border: "1px solid rgba(11,43,30,0.2)" }}
                  value={currentProduct.description || ""} 
                  onChange={(e) => setCurrentProduct({ ...currentProduct, description: e.target.value })} 
                />
              </div>
              <div className="form-actions">
                <button type="button" className="admin-btn-secondary" onClick={() => setIsEditing(false)}>Cancel</button>
                <button type="submit" className="admin-btn-primary">Save Product</button>
              </div>
            </form>
          </div>
        )}

        {activeTab === "orders" && (
          <div className="admin-orders">
            <h1>Customer Order Management</h1>
            <p style={{ marginTop: "-1rem", marginBottom: "1.5rem", color: "rgba(11,43,30,0.7)" }}>
              Real-time Firestore customer orders feed with live status synchronization.
            </p>

            {ordersLoading ? (
              <p>Loading real-time orders...</p>
            ) : orders.length === 0 ? (
              <p>No customer orders recorded in Firestore.</p>
            ) : (
              <div className="admin-table-container">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Order ID & Date</th>
                      <th>Customer Info</th>
                      <th>Items & Qty</th>
                      <th>Amount & Payment</th>
                      <th>Shipping Destination</th>
                      <th>Live Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map((order) => (
                      <tr key={order.id}>
                        <td>
                          <strong style={{ color: "#0b2b1e" }}>{order.id}</strong><br />
                          <span className="admin-order-date">
                            {new Date(order.createdAt).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" })}
                          </span>
                        </td>
                        <td>
                          <strong>{order.customerName || order.shippingAddress?.fullName || "Valued Customer"}</strong><br />
                          <span style={{ fontSize: "12px", color: "rgba(11,43,30,0.8)" }}>📧 {order.customerEmail || "No email"}</span><br />
                          {order.customerPhone ? (
                            <span style={{ fontSize: "12px", color: "#166534" }}>📱 {order.customerPhone}</span>
                          ) : null}
                        </td>
                        <td>
                          <div style={{ fontSize: "12.5px" }}>
                            {order.items?.map((it, idx) => (
                              <div key={idx}>
                                • {it.name} ({it.variant || it.weight || "100g"}) × {it.quantity}
                              </div>
                            ))}
                          </div>
                        </td>
                        <td>
                          <strong>₹{order.total?.toLocaleString("en-IN")}</strong><br />
                          <span style={{ fontSize: "11px", color: "rgba(11,43,30,0.6)" }}>
                            Method: {order.paymentMethod || "Pay on Delivery"}
                          </span>
                        </td>
                        <td>
                          <div style={{ fontSize: "12px", lineHeight: "1.4" }}>
                            {order.shippingAddress?.addressLine1}
                            {order.shippingAddress?.addressLine2 ? `, ${order.shippingAddress.addressLine2}` : ""}<br />
                            {order.shippingAddress?.city}, {order.shippingAddress?.state} - {order.shippingAddress?.postalCode}<br />
                            <strong>{order.shippingAddress?.country}</strong>
                          </div>
                          {order.deliveryInstructions ? (
                            <div style={{ marginTop: "6px", padding: "4px 8px", background: "#fef3c7", border: "1px solid #fde68a", borderRadius: "4px", fontSize: "11px", color: "#92400e", lineHeight: "1.3" }}>
                              <strong>📝 Delivery Instructions:</strong> {order.deliveryInstructions}
                            </div>
                          ) : null}
                        </td>
                        <td>
                          <select
                            disabled={updatingOrderId === order.id}
                            value={order.orderStatus || order.status || "Processing"}
                            onChange={(e) => handleUpdateOrderStatus(order.id, e.target.value as OrderStatus)}
                            style={{
                              padding: "6px 10px",
                              borderRadius: "6px",
                              border: "1px solid rgba(11,43,30,0.2)",
                              background: "#ffffff",
                              fontSize: "12.5px",
                              fontWeight: 600,
                              color: "#0b2b1e",
                              cursor: "pointer",
                            }}
                          >
                            {ALL_ORDER_STATUSES.map((st) => (
                              <option key={st} value={st}>
                                {st}
                              </option>
                            ))}
                          </select>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
