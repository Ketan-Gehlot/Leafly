import React, { useState, useEffect, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useProducts } from "../context/ProductContext";
import { useTeaware } from "../context/TeawareContext";
import { useGifting } from "../context/GiftingContext";
import { useCoupons, type UserCoupon } from "../context/CouponContext";
import { type Product, type TeaCategory, type ProductVariant } from "../data/products";
import { type TeawareItem, type TeawareCategory } from "../data/teaware";
import { type GiftHamper } from "../data/gifting";
import { useAuth } from "../context/AuthContext";
import { db } from "../lib/firebase";
import { collection, onSnapshot, doc, updateDoc, deleteDoc, query, orderBy } from "firebase/firestore";
import type { Order } from "../context/OrderContext";
import "./AdminDashboard.css";

export type AccountUser = {
  id: string;
  uid: string;
  name: string;
  email: string;
  phone?: string;
  createdAt?: string | null;
  status: string;
  authProvider: string;
  favoriteTea?: string | null;
  preferences?: Record<string, unknown> | null;
};

export default function AdminDashboard() {
  const { products, updateProduct, addProduct, loading: productsLoading } = useProducts();
  const { teaware, updateTeaware, addTeaware, deleteTeaware, loading: teawareLoading } = useTeaware();
  const { hampers, updateHamper, addHamper, deleteHamper, loading: hampersLoading } = useGifting();
  const { signOut } = useAuth();
  const navigate = useNavigate();
  const { globalCoupons, createGlobalCoupon, updateGlobalCoupon, deleteGlobalCoupon } = useCoupons();
  
  const [activeTab, setActiveTab] = useState<"dashboard" | "products" | "teaware" | "hampers" | "orders" | "accounts" | "coupons">("dashboard");
  const [isEditing, setIsEditing] = useState(false);
  const [currentProduct, setCurrentProduct] = useState<Partial<Product>>({});
  const [isEditingTeaware, setIsEditingTeaware] = useState(false);
  const [currentTeaware, setCurrentTeaware] = useState<Partial<TeawareItem>>({});
  const [isEditingHamper, setIsEditingHamper] = useState(false);
  const [currentHamper, setCurrentHamper] = useState<Partial<GiftHamper>>({});
  
  const [orders, setOrders] = useState<Order[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  // Accounts state
  const [accounts, setAccounts] = useState<AccountUser[]>([]);
  const [accountsLoading, setAccountsLoading] = useState(true);
  const [accountSearchQuery, setAccountSearchQuery] = useState("");
  const [accountFilterProvider, setAccountFilterProvider] = useState("all");
  const [selectedAccount, setSelectedAccount] = useState<AccountUser | null>(null);

  const [isEditingCoupon, setIsEditingCoupon] = useState(false);
  const [currentCoupon, setCurrentCoupon] = useState<Partial<UserCoupon>>({});

  // Real-time Firestore orders synchronization
  useEffect(() => {
    const q = query(collection(db, "orders"), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const fetchedOrders = snapshot.docs.map((docSnap) => ({
          ...docSnap.data(),
          id: docSnap.id,
        }) as Order);
        setOrders(fetchedOrders);
        setOrdersLoading(false);
      },
      (error) => {
        console.error("Error fetching orders:", error);
        setOrdersLoading(false);
      }
    );
    
    return () => unsubscribe();
  }, []);

  // Real-time Firestore customer accounts synchronization
  useEffect(() => {
    const usersCol = collection(db, "users");
    const unsubscribe = onSnapshot(
      usersCol,
      (snapshot) => {
        const fetchedAccounts: AccountUser[] = snapshot.docs.map((docSnap) => {
          const d = docSnap.data();
          const resolvedName = d.fullName || d.displayName || d.name || "Customer";
          const resolvedEmail = d.email || "No Email Provided";
          const resolvedPhone = d.phone || d.phoneNumber || d.mobile || d.mobileNumber || "—";
          const resolvedCreatedAt = d.createdAt || d.joinedAt || d.registeredAt || null;
          const resolvedProvider = d.authProvider || d.provider || (d.email ? "Email/Password" : "Direct");
          const resolvedStatus = d.status || "Active";

          return {
            id: docSnap.id,
            uid: d.uid || docSnap.id,
            name: resolvedName,
            email: resolvedEmail,
            phone: resolvedPhone,
            createdAt: resolvedCreatedAt,
            status: resolvedStatus,
            authProvider: resolvedProvider,
            favoriteTea: d.favoriteTea || null,
            preferences: d.preferences || null,
          };
        });

        // Sort descending by registration date if available
        fetchedAccounts.sort((a, b) => {
          if (!a.createdAt) return 1;
          if (!b.createdAt) return -1;
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        });

        setAccounts(fetchedAccounts);
        setAccountsLoading(false);
      },
      (error) => {
        console.error("Error listening to accounts in Firestore:", error);
        setAccountsLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

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
      badge: "Popular",
      image: "/leafly-green-tea.webp",
      stock: 10,
      customTag: { text: "", color: "#38a169" },
      variants: {
        "100g": { weight: "100g", price: 0 },
        "250g": { weight: "250g", price: 0 }
      }
    });
    setIsEditing(true);
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Clean up undefined values for Firestore
    const cleanProduct = { ...currentProduct } as Product;
    if (cleanProduct.oldPrice === undefined) cleanProduct.oldPrice = null as unknown as number;
    if (cleanProduct.badge === undefined) cleanProduct.badge = null as unknown as "Popular";

    // Preserve manually entered variants
    const newVariants: Record<string, { weight: string; price: number; oldPrice?: number }> = {};
    if (cleanProduct.variants) {
      for (const [vKey, vData] of Object.entries(cleanProduct.variants)) {
        if (vData) {
          newVariants[vKey] = {
            weight: vData.weight,
            price: vData.price,
            oldPrice: vData.oldPrice || undefined
          };
        }
      }
    }
    // Ensure at least 100g is selected if none
    if (Object.keys(newVariants).length === 0) {
      newVariants["100g"] = { weight: "100g", price: cleanProduct.price, oldPrice: cleanProduct.oldPrice || undefined };
    }

    if (currentProduct.id) {
      // Update
      const updated = { ...cleanProduct, variants: newVariants as Product["variants"] };
      await updateProduct(updated);
    } else {
      // Add new
      const newProduct = { ...cleanProduct, variants: newVariants as Product["variants"] };
      newProduct.id = Date.now();
      await addProduct(newProduct);
    }
    setIsEditing(false);
  };

  const handleEditTeawareClick = (item: TeawareItem) => {
    setCurrentTeaware(item);
    setIsEditingTeaware(true);
  };

  const handleAddNewTeawareClick = () => {
    setCurrentTeaware({
      name: "",
      category: "Teapots",
      material: "",
      capacity: "",
      price: 0,
      badge: "Popular",
      image: "",
      description: "",
      features: [""],
      rating: 5.0,
      reviewCount: 0
    });
    setIsEditingTeaware(true);
  };

  const handleSaveTeaware = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanItem = { ...currentTeaware } as TeawareItem;
    if (cleanItem.oldPrice === undefined) cleanItem.oldPrice = null as unknown as number;
    if (cleanItem.capacity === undefined) cleanItem.capacity = "";

    if (currentTeaware.id) {
      await updateTeaware(cleanItem);
    } else {
      cleanItem.id = Date.now();
      await addTeaware(cleanItem);
    }
    setIsEditingTeaware(false);
  };

  const handleDeleteTeaware = async (id: number | string) => {
    if (window.confirm("Are you sure you want to delete this teaware item?")) {
      await deleteTeaware(id);
    }
  };

  const handleEditHamperClick = (hamper: GiftHamper) => {
    setCurrentHamper(hamper);
    setIsEditingHamper(true);
  };

  const handleAddNewHamperClick = () => {
    setCurrentHamper({
      name: "",
      subtitle: "",
      price: 0,
      image: "",
      includes: [""],
      badge: ""
    });
    setIsEditingHamper(true);
  };

  const handleSaveHamper = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanHamper = { ...currentHamper } as GiftHamper;
    if (cleanHamper.badge === undefined) cleanHamper.badge = "";

    if (currentHamper.id) {
      await updateHamper(cleanHamper);
    } else {
      cleanHamper.id = Date.now();
      await addHamper(cleanHamper);
    }
    setIsEditingHamper(false);
  };

  const handleDeleteHamper = async (id: number | string) => {
    if (window.confirm("Are you sure you want to delete this hamper?")) {
      await deleteHamper(id);
    }
  };

  const handleUpdateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      await updateDoc(doc(db, "orders", orderId), { 
        status: newStatus,
        orderStatus: newStatus,
      });
    } catch (error) {
      console.error("Error updating order status:", error);
    }
  };

  const handleDeleteOrder = async (orderId: string) => {
    if (window.confirm("Are you really sure you want to delete this order?")) {
      try {
        await deleteDoc(doc(db, "orders", orderId));
        if (selectedOrder?.id === orderId) {
          setSelectedOrder(null);
        }
      } catch (error) {
        console.error("Error deleting order:", error);
      }
    }
  };

  const handleEditCoupon = (coupon: UserCoupon) => {
    setCurrentCoupon(coupon);
    setIsEditingCoupon(true);
  };

  const handleAddNewCoupon = () => {
    setCurrentCoupon({
      code: "",
      title: "",
      discountType: "percentage",
      discountValue: 10,
      minOrderValue: 0,
      status: "available",
      applicableCondition: "",
      expiryDate: "",
    });
    setIsEditingCoupon(true);
  };

  const handleSaveCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (currentCoupon.id) {
      await updateGlobalCoupon(currentCoupon as UserCoupon);
    } else {
      await createGlobalCoupon(currentCoupon as UserCoupon);
    }
    setIsEditingCoupon(false);
  };

  const handleDeleteCoupon = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this coupon?")) {
      await deleteGlobalCoupon(id);
    }
  };

  const handleLogout = async () => {
    await signOut();
    navigate("/admin/login");
  };

  // Analytics Computation
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();
  
  const currentMonthOrders = useMemo(() => orders.filter(o => {
    const d = new Date(o.createdAt);
    return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
  }), [orders, currentMonth, currentYear]);

  const currentMonthTotal = useMemo(() => currentMonthOrders.reduce((acc, o) => acc + (o.total || 0), 0), [currentMonthOrders]);
  
  const previousMonthOrders = useMemo(() => orders.filter(o => {
    const d = new Date(o.createdAt);
    const prevMonth = currentMonth === 0 ? 11 : currentMonth - 1;
    const prevYear = currentMonth === 0 ? currentYear - 1 : currentYear;
    return d.getMonth() === prevMonth && d.getFullYear() === prevYear;
  }), [orders, currentMonth, currentYear]);
  
  const previousMonthTotal = useMemo(() => previousMonthOrders.reduce((acc, o) => acc + (o.total || 0), 0), [previousMonthOrders]);
  
  const percentageIncrease = previousMonthTotal === 0 
    ? 100 
    : Math.round(((currentMonthTotal - previousMonthTotal) / previousMonthTotal) * 100);

  // Generate last 6 months sales data dynamically
  const lastSixMonthsData = useMemo(() => {
    const data = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      const monthLabel = d.toLocaleString('default', { month: 'short' });
      
      const sales = orders.filter(o => {
        const od = new Date(o.createdAt);
        return od.getMonth() === d.getMonth() && od.getFullYear() === d.getFullYear();
      }).reduce((acc, o) => acc + (o.total || 0), 0);
      
      data.push({ month: monthLabel, sales });
    }
    return data;
  }, [orders]);

  const maxSales = Math.max(1, ...lastSixMonthsData.map(d => d.sales));

  // Filtered Accounts
  const filteredAccounts = useMemo(() => {
    return accounts.filter((acc) => {
      const queryLower = accountSearchQuery.toLowerCase().trim();
      const matchesSearch =
        !queryLower ||
        acc.name.toLowerCase().includes(queryLower) ||
        acc.email.toLowerCase().includes(queryLower) ||
        (acc.phone && acc.phone.toLowerCase().includes(queryLower)) ||
        acc.uid.toLowerCase().includes(queryLower);

      const matchesProvider =
        accountFilterProvider === "all" ||
        acc.authProvider.toLowerCase().includes(accountFilterProvider.toLowerCase());

      return matchesSearch && matchesProvider;
    });
  }, [accounts, accountSearchQuery, accountFilterProvider]);

  if (productsLoading || ordersLoading || teawareLoading || hampersLoading) {
    return <div className="admin-layout"><main className="admin-main"><h2>Loading Admin Dashboard...</h2></main></div>;
  }

  return (
    <div className="admin-layout">
      {/* SIDEBAR */}
      <aside className="admin-sidebar">
        <div className="admin-brand">
          <h2>Leafly Admin</h2>
        </div>
        <nav className="admin-nav">
          <button 
            type="button"
            className={activeTab === "dashboard" ? "active" : ""} 
            onClick={() => setActiveTab("dashboard")}
          >
            Dashboard
          </button>
          <button 
            type="button"
            className={activeTab === "products" ? "active" : ""} 
            onClick={() => setActiveTab("products")}
          >
            Products
          </button>
          <button 
            type="button"
            className={activeTab === "teaware" ? "active" : ""} 
            onClick={() => setActiveTab("teaware")}
          >
            Teaware
          </button>
          <button 
            type="button"
            className={activeTab === "hampers" ? "active" : ""} 
            onClick={() => setActiveTab("hampers")}
          >
            Hampers
          </button>
          <button 
            type="button"
            className={activeTab === "orders" ? "active" : ""} 
            onClick={() => setActiveTab("orders")}
          >
            Orders
          </button>
          <button 
            type="button"
            className={activeTab === "accounts" ? "active" : ""} 
            onClick={() => setActiveTab("accounts")}
          >
            Accounts
          </button>
          <button 
            type="button"
            className={activeTab === "coupons" ? "active" : ""} 
            onClick={() => setActiveTab("coupons")}
          >
            Coupons
          </button>
        </nav>
        
        <div className="admin-sidebar-footer">
          <Link to="/" className="admin-back-link" style={{ marginBottom: "1rem", display: "block" }}>
            ← Back to Store
          </Link>
          <button type="button" onClick={handleLogout} className="admin-btn-secondary" style={{ width: "100%", padding: "0.5rem" }}>
            Logout
          </button>
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
              </div>
              <div className="admin-stat-card">
                <h3>Total Sales (This Month)</h3>
                <p>₹{currentMonthTotal.toLocaleString()}</p>
                <span className={`admin-stat-badge ${percentageIncrease >= 0 ? 'positive' : 'negative'}`}>
                  {percentageIncrease >= 0 ? '+' : ''}{percentageIncrease}% from last month
                </span>
              </div>
              <div className="admin-stat-card">
                <h3>New Orders (This Month)</h3>
                <p>{currentMonthOrders.length}</p>
              </div>
              <div className="admin-stat-card">
                <h3>Registered Accounts</h3>
                <p>{accounts.length}</p>
                <span className="admin-stat-badge positive">Live Customers</span>
              </div>
            </div>

            <div className="admin-dashboard-row">
              <div className="admin-analytics-section">
                <h2>Sales Analytics (Last 6 Months)</h2>
                <div className="admin-chart">
                  {lastSixMonthsData.map((data) => {
                    const heightPercent = (data.sales / maxSales) * 100;
                    return (
                      <div className="admin-chart-bar-wrap" key={data.month}>
                        <div className="admin-chart-tooltip">₹{data.sales.toLocaleString()}</div>
                        <div className="admin-chart-bar" style={{ height: `${heightPercent}%` }}></div>
                        <span className="admin-chart-label">{data.month}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="admin-recent-orders-section">
                <h2>Recent Orders</h2>
                <div className="admin-table-container">
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>Order ID</th>
                        <th>Customer</th>
                        <th>Total</th>
                        <th>Payment</th>
                        <th>Status</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {orders.slice(0, 5).map(order => (
                        <tr key={order.id}>
                          <td>
                            <strong>{order.id}</strong><br/>
                            <span className="admin-order-date">{new Date(order.createdAt).toLocaleDateString()}</span>
                          </td>
                          <td>{order.shippingAddress?.fullName || order.customerName || "Valued Customer"}</td>
                          <td>₹{order.total?.toLocaleString() || 0}</td>
                          <td>
                            {order.paymentMethod === "Pay on Delivery" || order.paymentMethod === "Cash on Delivery" ? (
                              <span style={{ color: "#e53e3e", fontWeight: "600", fontSize: "0.85rem", border: "1px solid #e53e3e", padding: "2px 6px", borderRadius: "4px" }}>COD</span>
                            ) : (
                              <span style={{ color: "#38a169", fontWeight: "600", fontSize: "0.85rem", border: "1px solid #38a169", padding: "2px 6px", borderRadius: "4px" }}>PREPAID</span>
                            )}
                          </td>
                          <td>
                            <span className={`admin-status-badge ${(order.orderStatus || order.status || "processing").toLowerCase()}`}>
                              {order.orderStatus || order.status || "Processing"}
                            </span>
                          </td>
                          <td>
                            <button type="button" className="admin-btn-secondary" onClick={() => setSelectedOrder(order)} style={{ marginRight: "8px" }}>View</button>
                            <button type="button" className="admin-btn-secondary" style={{ color: "#e53e3e", borderColor: "#e53e3e" }} onClick={() => handleDeleteOrder(order.id)}>Delete</button>
                          </td>
                        </tr>
                      ))}
                      {orders.length === 0 && (
                        <tr>
                          <td colSpan={6} style={{ textAlign: "center", padding: "1rem" }}>No recent orders.</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "products" && !isEditing && (
          <div className="admin-products">
            <div className="admin-products-header">
              <h1>Manage Products</h1>
              <button type="button" className="admin-btn-primary" onClick={handleAddNewClick}>+ Add New Product</button>
            </div>
            <div className="admin-table-container">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Image</th>
                    <th>Name</th>
                    <th>Category</th>
                    <th>Price</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map(product => (
                    <tr key={product.id}>
                      <td>
                        <img src={product.image} alt={product.name} className="admin-table-img" />
                      </td>
                      <td>
                        {product.name}
                        {(product.stock ?? 10) <= 0 ? (
                          <span style={{ marginLeft: "8px", fontSize: "0.8rem", color: "#e53e3e", background: "#fed7d7", padding: "2px 6px", borderRadius: "4px" }}>
                            Out of Stock
                          </span>
                        ) : (
                          <span style={{ marginLeft: "8px", fontSize: "0.8rem", color: "#38a169", background: "#c6f6d5", padding: "2px 6px", borderRadius: "4px" }}>
                            Stock: {product.stock ?? 10}
                          </span>
                        )}
                        {product.oldPrice ? (
                          <span style={{ marginLeft: "8px", fontSize: "0.8rem", color: "#e53e3e", background: "#fed7d7", padding: "2px 6px", borderRadius: "4px" }}>
                            Discounted
                          </span>
                        ) : null}
                      </td>
                      <td>{product.category}</td>
                      <td>
                        ₹{product.price.toLocaleString()}
                        {product.oldPrice ? <span style={{ textDecoration: "line-through", color: "#a0aec0", marginLeft: "8px" }}>₹{product.oldPrice}</span> : null}
                      </td>
                      <td>
                        <button type="button" className="admin-btn-secondary" onClick={() => handleEditClick(product)}>Edit</button>
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
                <label>Name</label>
                <input 
                  type="text" 
                  required 
                  value={currentProduct.name || ""} 
                  onChange={e => setCurrentProduct({ ...currentProduct, name: e.target.value })} 
                />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Category</label>
                  <select 
                    value={currentProduct.category || "Green"} 
                    onChange={e => setCurrentProduct({ ...currentProduct, category: e.target.value as TeaCategory })}
                  >
                    <option value="Green">Green</option>
                    <option value="White">White</option>
                    <option value="Black">Black</option>
                    <option value="Oolong">Oolong</option>
                    <option value="Teaware">Teaware</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Origin</label>
                  <input 
                    type="text" 
                    required 
                    value={currentProduct.origin || ""} 
                    onChange={e => setCurrentProduct({ ...currentProduct, origin: e.target.value })} 
                  />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Price (₹)</label>
                  <input 
                    type="number" 
                    required 
                    value={currentProduct.price || ""} 
                    onChange={e => setCurrentProduct({ ...currentProduct, price: Number(e.target.value) })} 
                  />
                </div>
                <div className="form-group">
                  <label>Old Price (₹) - For Discounts</label>
                  <input 
                    type="number" 
                    value={currentProduct.oldPrice || ""} 
                    onChange={e => setCurrentProduct({ ...currentProduct, oldPrice: Number(e.target.value) || undefined })} 
                  />
                  <small style={{ display: "block", marginTop: "4px", color: "#666" }}>Set higher than Price to show discount across the store.</small>
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Badge</label>
                  <select 
                    value={currentProduct.badge || "None"} 
                    onChange={e => setCurrentProduct({ ...currentProduct, badge: e.target.value === "None" ? undefined : e.target.value as "Premium" | "Popular" | "Bestseller" })}
                  >
                    <option value="None">None</option>
                    <option value="Premium">Premium</option>
                    <option value="Popular">Popular</option>
                    <option value="Bestseller">Bestseller</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Caffeine Level</label>
                  <select 
                    value={currentProduct.caffeine || "Medium"} 
                    onChange={e => setCurrentProduct({ ...currentProduct, caffeine: e.target.value as "Low" | "Medium" | "High" })}
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                  </select>
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Stock Quantity</label>
                  <input 
                    type="number" 
                    required 
                    min="0"
                    value={currentProduct.stock ?? 10} 
                    onChange={e => setCurrentProduct({ ...currentProduct, stock: parseInt(e.target.value, 10) || 0 })} 
                  />
                </div>
                <div className="form-group">
                  <label>Custom Tag (Optional)</label>
                  <div style={{ display: "flex", gap: "8px" }}>
                    <input 
                      type="text" 
                      placeholder="e.g. Limited Edition" 
                      value={currentProduct.customTag?.text || ""} 
                      onChange={e => setCurrentProduct({ ...currentProduct, customTag: { text: e.target.value, color: currentProduct.customTag?.color || "#38a169" } })} 
                      style={{ flex: 1 }}
                    />
                    <input 
                      type="color" 
                      title="Tag Color"
                      value={currentProduct.customTag?.color || "#38a169"} 
                      onChange={e => setCurrentProduct({ ...currentProduct, customTag: { text: currentProduct.customTag?.text || "", color: e.target.value } })} 
                      style={{ padding: "0", width: "40px", height: "40px", cursor: "pointer", border: "1px solid #ccc", borderRadius: "4px" }}
                    />
                  </div>
                </div>
              </div>
              
              <div className="form-row">
                <div className="form-group" style={{ width: "100%" }}>
                  <label>Available Variants & Pricing</label>
                  <p style={{ fontSize: "0.85rem", color: "#666", marginBottom: "0.5rem" }}>Specify exactly which weights are available and set their specific prices (and optional old prices).</p>
                  <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                    {(["100g", "250g", "500g", "1kg"] as const).map(vKey => {
                      const isSelected = !!currentProduct.variants?.[vKey];
                      const variantData = currentProduct.variants?.[vKey] || { weight: vKey, price: 0 };
                      return (
                        <div key={vKey} style={{ display: "flex", alignItems: "center", gap: "1rem", flexWrap: "wrap", background: "#f8f9fa", padding: "12px", borderRadius: "8px", border: "1px solid #eaeaea" }}>
                          <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", cursor: "pointer", width: "100px", fontWeight: "600" }}>
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={(e) => {
                                const newVars = { ...currentProduct.variants };
                                if (e.target.checked) {
                                  newVars[vKey] = { weight: vKey, price: currentProduct.price || 0, oldPrice: currentProduct.oldPrice || undefined };
                                } else {
                                  delete newVars[vKey];
                                }
                                setCurrentProduct({ ...currentProduct, variants: newVars as unknown as Product["variants"] });
                              }}
                            />
                            {vKey}
                          </label>
                          {isSelected && (
                            <>
                              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                                <label style={{ fontSize: "0.85rem" }}>Price (₹):</label>
                                <input
                                  type="number"
                                  style={{ padding: "4px 8px", width: "100px", borderRadius: "4px", border: "1px solid #ccc" }}
                                  value={variantData.price}
                                  onChange={(e) => {
                                    const newVars = { ...currentProduct.variants };
                                    newVars[vKey] = { ...variantData, price: Number(e.target.value) };
                                    setCurrentProduct({ ...currentProduct, variants: newVars as unknown as Product["variants"] });
                                  }}
                                  required
                                />
                              </div>
                              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                                <label style={{ fontSize: "0.85rem" }}>Old Price (₹):</label>
                                <input
                                  type="number"
                                  style={{ padding: "4px 8px", width: "100px", borderRadius: "4px", border: "1px solid #ccc" }}
                                  value={variantData.oldPrice || ""}
                                  placeholder="Optional"
                                  onChange={(e) => {
                                    const newVars = { ...currentProduct.variants };
                                    const val = Number(e.target.value);
                                    newVars[vKey] = { ...variantData, oldPrice: val || undefined };
                                    if (!val) delete newVars[vKey].oldPrice;
                                    setCurrentProduct({ ...currentProduct, variants: newVars as unknown as Product["variants"] });
                                  }}
                                />
                              </div>
                            </>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              <div className="form-actions">
                <button type="button" className="admin-btn-secondary" onClick={() => setIsEditing(false)}>Cancel</button>
                <button type="submit" className="admin-btn-primary">Save Product</button>
              </div>
            </form>
          </div>
        )}

        {activeTab === "teaware" && !isEditingTeaware && (
          <div className="admin-products">
            <div className="admin-products-header">
              <h1>Manage Teaware</h1>
              <button type="button" className="admin-btn-primary" onClick={handleAddNewTeawareClick}>+ Add New Teaware</button>
            </div>
            <div className="admin-table-container">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Image</th>
                    <th>Name</th>
                    <th>Category</th>
                    <th>Price</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {teaware.map(item => (
                    <tr key={item.id}>
                      <td>
                        <img src={item.image} alt={item.name} className="admin-table-img" />
                      </td>
                      <td>
                        {item.name}
                        {item.oldPrice ? (
                          <span style={{ marginLeft: "8px", fontSize: "0.8rem", color: "#e53e3e", background: "#fed7d7", padding: "2px 6px", borderRadius: "4px" }}>
                            Discounted
                          </span>
                        ) : null}
                      </td>
                      <td>{item.category}</td>
                      <td>
                        ₹{item.price.toLocaleString()}
                        {item.oldPrice ? <span style={{ textDecoration: "line-through", color: "#a0aec0", marginLeft: "8px" }}>₹{item.oldPrice}</span> : null}
                      </td>
                      <td>
                        <button type="button" className="admin-btn-secondary" onClick={() => handleEditTeawareClick(item)} style={{ marginRight: "8px" }}>Edit</button>
                        <button type="button" className="admin-btn-secondary" style={{ color: "#e53e3e", borderColor: "#e53e3e" }} onClick={() => handleDeleteTeaware(item.id)}>Delete</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === "teaware" && isEditingTeaware && (
          <div className="admin-edit-product">
            <h1>{currentTeaware.id ? "Edit Teaware" : "Add New Teaware"}</h1>
            <form className="admin-form" onSubmit={handleSaveTeaware}>
              <div className="form-group">
                <label>Name</label>
                <input 
                  type="text" 
                  required 
                  value={currentTeaware.name || ""} 
                  onChange={e => setCurrentTeaware({ ...currentTeaware, name: e.target.value })} 
                />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Category</label>
                  <select 
                    value={currentTeaware.category || "Teapots"} 
                    onChange={e => setCurrentTeaware({ ...currentTeaware, category: e.target.value as TeawareCategory })}
                  >
                    <option value="Teapots">Teapots</option>
                    <option value="Tea Cups">Tea Cups</option>
                    <option value="Serving & Trays">Serving & Trays</option>
                    <option value="Storage & Accessories">Storage & Accessories</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Material</label>
                  <input 
                    type="text" 
                    required 
                    value={currentTeaware.material || ""} 
                    onChange={e => setCurrentTeaware({ ...currentTeaware, material: e.target.value })} 
                  />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Price (₹)</label>
                  <input 
                    type="number" 
                    required 
                    value={currentTeaware.price || ""} 
                    onChange={e => setCurrentTeaware({ ...currentTeaware, price: Number(e.target.value) })} 
                  />
                </div>
                <div className="form-group">
                  <label>Old Price (₹)</label>
                  <input 
                    type="number" 
                    value={currentTeaware.oldPrice || ""} 
                    onChange={e => setCurrentTeaware({ ...currentTeaware, oldPrice: Number(e.target.value) || undefined })} 
                  />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Capacity / Size</label>
                  <input 
                    type="text" 
                    value={currentTeaware.capacity || ""} 
                    onChange={e => setCurrentTeaware({ ...currentTeaware, capacity: e.target.value })} 
                  />
                </div>
                <div className="form-group">
                  <label>Image URL</label>
                  <input 
                    type="text" 
                    required 
                    value={currentTeaware.image || ""} 
                    onChange={e => setCurrentTeaware({ ...currentTeaware, image: e.target.value })} 
                  />
                </div>
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea 
                  required 
                  value={currentTeaware.description || ""} 
                  onChange={e => setCurrentTeaware({ ...currentTeaware, description: e.target.value })} 
                  rows={3}
                />
              </div>
              <div className="form-actions">
                <button type="button" className="admin-btn-secondary" onClick={() => setIsEditingTeaware(false)}>Cancel</button>
                <button type="submit" className="admin-btn-primary">Save Teaware</button>
              </div>
            </form>
          </div>
        )}

        {activeTab === "hampers" && !isEditingHamper && (
          <div className="admin-products">
            <div className="admin-products-header">
              <h1>Manage Hampers</h1>
              <button type="button" className="admin-btn-primary" onClick={handleAddNewHamperClick}>+ Add New Hamper</button>
            </div>
            <div className="admin-table-container">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Image</th>
                    <th>Name</th>
                    <th>Subtitle</th>
                    <th>Price</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {hampers.map(hamper => (
                    <tr key={hamper.id}>
                      <td>
                        <img src={hamper.image} alt={hamper.name} className="admin-table-img" />
                      </td>
                      <td>
                        {hamper.name}
                        {hamper.badge && (
                          <span style={{ marginLeft: "8px", fontSize: "0.8rem", color: "#d69e2e", background: "#fefcbf", padding: "2px 6px", borderRadius: "4px" }}>
                            {hamper.badge}
                          </span>
                        )}
                      </td>
                      <td>{hamper.subtitle}</td>
                      <td>₹{hamper.price.toLocaleString()}</td>
                      <td>
                        <button type="button" className="admin-btn-secondary" onClick={() => handleEditHamperClick(hamper)} style={{ marginRight: "8px" }}>Edit</button>
                        <button type="button" className="admin-btn-secondary" style={{ color: "#e53e3e", borderColor: "#e53e3e" }} onClick={() => handleDeleteHamper(hamper.id)}>Delete</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === "hampers" && isEditingHamper && (
          <div className="admin-edit-product">
            <h1>{currentHamper.id ? "Edit Hamper" : "Add New Hamper"}</h1>
            <form className="admin-form" onSubmit={handleSaveHamper}>
              <div className="form-group">
                <label>Name</label>
                <input 
                  type="text" 
                  required 
                  value={currentHamper.name || ""} 
                  onChange={e => setCurrentHamper({ ...currentHamper, name: e.target.value })} 
                />
              </div>
              <div className="form-group">
                <label>Subtitle</label>
                <input 
                  type="text" 
                  required 
                  value={currentHamper.subtitle || ""} 
                  onChange={e => setCurrentHamper({ ...currentHamper, subtitle: e.target.value })} 
                />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Price (₹)</label>
                  <input 
                    type="number" 
                    required 
                    value={currentHamper.price || ""} 
                    onChange={e => setCurrentHamper({ ...currentHamper, price: Number(e.target.value) })} 
                  />
                </div>
                <div className="form-group">
                  <label>Badge</label>
                  <input 
                    type="text" 
                    value={currentHamper.badge || ""} 
                    onChange={e => setCurrentHamper({ ...currentHamper, badge: e.target.value })} 
                    placeholder="e.g. MOST POPULAR"
                  />
                </div>
              </div>
              <div className="form-group">
                <label>Image URL</label>
                <input 
                  type="text" 
                  required 
                  value={currentHamper.image || ""} 
                  onChange={e => setCurrentHamper({ ...currentHamper, image: e.target.value })} 
                />
              </div>
              <div className="form-group">
                <label>Includes (comma separated)</label>
                <textarea 
                  required 
                  value={(currentHamper.includes || []).join(", ")} 
                  onChange={e => setCurrentHamper({ ...currentHamper, includes: e.target.value.split(",").map(i => i.trim()) })} 
                  rows={3}
                  placeholder="e.g. 1x Assam Orthodox, 1x Brass Infuser, Tasting Journal"
                />
              </div>
              <div className="form-actions">
                <button type="button" className="admin-btn-secondary" onClick={() => setIsEditingHamper(false)}>Cancel</button>
                <button type="submit" className="admin-btn-primary">Save Hamper</button>
              </div>
            </form>
          </div>
        )}

        {activeTab === "orders" && (
          <div className="admin-products">
            <div className="admin-products-header">
              <h1>All Orders</h1>
            </div>
            <div className="admin-table-container">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Order ID</th>
                    <th>Date</th>
                    <th>Customer</th>
                    <th>Total</th>
                    <th>Payment</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map(order => (
                    <tr key={order.id}>
                      <td><strong>{order.id}</strong></td>
                      <td>{new Date(order.createdAt).toLocaleString()}</td>
                      <td>
                        {order.shippingAddress?.fullName || order.customerName || "Customer"}<br/>
                        <span style={{ fontSize: "0.85rem", color: "#666" }}>
                          {order.shippingAddress?.city ? `${order.shippingAddress.city}, ${order.shippingAddress.state}` : "Direct Order"}
                        </span>
                      </td>
                      <td>₹{order.total?.toLocaleString() || 0}</td>
                      <td>
                        {order.paymentMethod === "Pay on Delivery" || order.paymentMethod === "Cash on Delivery" ? (
                          <span style={{ color: "#e53e3e", fontWeight: "600", fontSize: "0.85rem", border: "1px solid #e53e3e", padding: "2px 6px", borderRadius: "4px" }}>COD</span>
                        ) : (
                          <span style={{ color: "#38a169", fontWeight: "600", fontSize: "0.85rem", border: "1px solid #38a169", padding: "2px 6px", borderRadius: "4px" }}>PREPAID</span>
                        )}
                      </td>
                      <td>
                        <select 
                          className={`admin-status-select ${(order.orderStatus || order.status || "processing").toLowerCase()}`}
                          value={order.orderStatus || order.status || "Processing"}
                          onChange={(e) => handleUpdateOrderStatus(order.id, e.target.value)}
                        >
                          <option value="Processing">Processing</option>
                          <option value="Shipped">Shipped</option>
                          <option value="Delivered">Delivered</option>
                          <option value="Cancelled">Cancelled</option>
                        </select>
                      </td>
                      <td>
                        <button type="button" className="admin-btn-secondary" onClick={() => setSelectedOrder(order)} style={{ marginRight: "8px" }}>View Details</button>
                        <button type="button" className="admin-btn-secondary" style={{ color: "#e53e3e", borderColor: "#e53e3e" }} onClick={() => handleDeleteOrder(order.id)}>Delete</button>
                      </td>
                    </tr>
                  ))}
                  {orders.length === 0 && (
                    <tr>
                      <td colSpan={7} style={{ textAlign: "center", padding: "2rem" }}>No orders found.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ACCOUNTS SECTION */}
        {activeTab === "accounts" && (
          <div className="admin-products">
            <div className="admin-products-header">
              <div>
                <h1>Customer Accounts</h1>
                <p style={{ margin: "4px 0 0", color: "rgba(11,43,30,0.6)", fontSize: "14px" }}>
                  Live Firestore customer accounts registry with real-time updates.
                </p>
              </div>
              <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                <span className="admin-stat-badge positive" style={{ padding: "0.4rem 0.8rem", fontSize: "0.85rem" }}>
                  {accounts.length} Registered {accounts.length === 1 ? "Customer" : "Customers"}
                </span>
              </div>
            </div>

            {/* FILTER & SEARCH BAR */}
            <div className="admin-filter-bar">
              <div className="admin-search-box">
                <span className="admin-search-icon">🔍</span>
                <input 
                  type="text" 
                  placeholder="Search by customer name, email, mobile, or UID..." 
                  value={accountSearchQuery}
                  onChange={(e) => setAccountSearchQuery(e.target.value)}
                  className="admin-search-input"
                />
              </div>

              <select 
                value={accountFilterProvider} 
                onChange={(e) => setAccountFilterProvider(e.target.value)}
                className="admin-filter-select"
              >
                <option value="all">All Authentication Methods</option>
                <option value="google">Google OAuth</option>
                <option value="email">Email / Password</option>
              </select>
            </div>

            {accountsLoading ? (
              <p style={{ padding: "2rem 0", color: "rgba(11,43,30,0.7)" }}>Loading live customer accounts from Firestore...</p>
            ) : filteredAccounts.length === 0 ? (
              <div className="admin-table-container" style={{ padding: "3rem 2rem", textAlign: "center" }}>
                <p style={{ fontSize: "1.1rem", color: "rgba(11,43,30,0.7)", margin: 0 }}>
                  {accountSearchQuery ? "No customer accounts match your search query." : "No customer accounts registered in Firestore yet."}
                </p>
              </div>
            ) : (
              <div className="admin-table-container">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Customer Info</th>
                      <th>Email Address</th>
                      <th>Phone / Mobile</th>
                      <th>Sign Up Date</th>
                      <th>Sign Up Method</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredAccounts.map((acc) => {
                      const initial = acc.name?.charAt(0)?.toUpperCase() || "U";
                      const isGoogle = acc.authProvider.toLowerCase().includes("google");
                      return (
                        <tr key={acc.id}>
                          <td>
                            <div className="admin-account-cell">
                              <div className="admin-account-avatar">{initial}</div>
                              <div>
                                <strong>{acc.name}</strong><br />
                                <span style={{ fontSize: "11px", color: "rgba(11,43,30,0.5)", fontFamily: "monospace" }}>
                                  UID: {acc.uid.slice(0, 10)}...
                                </span>
                              </div>
                            </div>
                          </td>
                          <td>
                            <span style={{ color: "var(--leafly-forest)" }}>{acc.email}</span>
                          </td>
                          <td>
                            {acc.phone && acc.phone !== "—" && acc.phone !== "Not Provided" ? (
                              <strong style={{ color: "#166534" }}>{acc.phone}</strong>
                            ) : (
                              <span style={{ color: "rgba(11,43,30,0.4)" }}>Not Provided</span>
                            )}
                          </td>
                          <td>
                            {acc.createdAt ? (
                              <span>
                                {new Date(acc.createdAt).toLocaleDateString("en-IN", {
                                  year: "numeric",
                                  month: "short",
                                  day: "numeric",
                                })}
                              </span>
                            ) : (
                              <span style={{ color: "rgba(11,43,30,0.4)" }}>Recent</span>
                            )}
                          </td>
                          <td>
                            <span className={`admin-auth-badge ${isGoogle ? "google" : "email"}`}>
                              {isGoogle ? "Google" : "Email/Password"}
                            </span>
                          </td>
                          <td>
                            <span className="admin-status-badge active">
                              {acc.status || "Active"}
                            </span>
                          </td>
                          <td>
                            <button 
                              type="button" 
                              className="admin-btn-secondary"
                              onClick={() => setSelectedAccount(acc)}
                            >
                              View Details
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* COUPONS SECTION */}
        {activeTab === "coupons" && !isEditingCoupon && (
          <div className="admin-products">
            <div className="admin-products-header">
              <h1>Manage Coupons</h1>
              <button type="button" className="admin-btn-primary" onClick={handleAddNewCoupon}>+ Add New Coupon</button>
            </div>
            <div className="admin-table-container">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Code</th>
                    <th>Title</th>
                    <th>Discount</th>
                    <th>Min Order</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {globalCoupons.map(coupon => (
                    <tr key={coupon.id}>
                      <td><strong>{coupon.code}</strong></td>
                      <td>{coupon.title}</td>
                      <td>{coupon.discountValue}{coupon.discountType === 'percentage' ? '%' : '₹'}</td>
                      <td>₹{coupon.minOrderValue}</td>
                      <td>
                        <span className={`admin-status-badge ${coupon.status === 'available' ? 'positive' : 'negative'}`}>
                          {coupon.status}
                        </span>
                      </td>
                      <td>
                        <button type="button" className="admin-btn-secondary" onClick={() => handleEditCoupon(coupon)}>Edit</button>
                        <button type="button" className="admin-btn-secondary" style={{ color: "#e53e3e", borderColor: "#e53e3e", marginLeft: "8px" }} onClick={() => handleDeleteCoupon(coupon.id)}>Delete</button>
                      </td>
                    </tr>
                  ))}
                  {globalCoupons.length === 0 && (
                    <tr>
                      <td colSpan={6} style={{ textAlign: "center", padding: "2rem" }}>No global coupons found.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === "coupons" && isEditingCoupon && (
          <div className="admin-edit-product">
            <h1>{currentCoupon.id ? "Edit Coupon" : "Add New Coupon"}</h1>
            <form className="admin-form" onSubmit={handleSaveCoupon}>
              <div className="form-group">
                <label>Coupon Code</label>
                <input type="text" required value={currentCoupon.code || ""} onChange={e => setCurrentCoupon({ ...currentCoupon, code: e.target.value })} />
              </div>
              <div className="form-group">
                <label>Title / Description</label>
                <input type="text" required value={currentCoupon.title || ""} onChange={e => setCurrentCoupon({ ...currentCoupon, title: e.target.value })} />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Discount Type</label>
                  <select value={currentCoupon.discountType || "percentage"} onChange={e => setCurrentCoupon({ ...currentCoupon, discountType: e.target.value as "percentage" | "fixed" })}>
                    <option value="percentage">Percentage (%)</option>
                    <option value="fixed">Fixed Amount (₹)</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Discount Value</label>
                  <input type="number" required value={currentCoupon.discountValue || 0} onChange={e => setCurrentCoupon({ ...currentCoupon, discountValue: Number(e.target.value) })} />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Min Order Value (₹)</label>
                  <input type="number" required value={currentCoupon.minOrderValue || 0} onChange={e => setCurrentCoupon({ ...currentCoupon, minOrderValue: Number(e.target.value) })} />
                </div>
                <div className="form-group">
                  <label>Status</label>
                  <select value={currentCoupon.status || "available"} onChange={e => setCurrentCoupon({ ...currentCoupon, status: e.target.value as "available" | "expired" | "used" })}>
                    <option value="available">Available</option>
                    <option value="expired">Expired</option>
                    <option value="used">Used / Disabled</option>
                  </select>
                </div>
              </div>
              <div className="form-actions">
                <button type="button" className="admin-btn-secondary" onClick={() => setIsEditingCoupon(false)}>Cancel</button>
                <button type="submit" className="admin-btn-primary">Save Coupon</button>
              </div>
            </form>
          </div>
        )}

        {/* ACCOUNT DETAILS MODAL */}
        {selectedAccount && (
          <div className="admin-modal-overlay" onClick={() => setSelectedAccount(null)}>
            <div className="admin-modal-content" onClick={e => e.stopPropagation()}>
              <div className="admin-modal-header">
                <h2>Customer Account Profile</h2>
                <button type="button" className="admin-modal-close" onClick={() => setSelectedAccount(null)}>×</button>
              </div>
              <div className="admin-modal-body">
                <div className="admin-order-grid">
                  <div>
                    <h3>Profile Information</h3>
                    <p><strong>Full Name:</strong> {selectedAccount.name}</p>
                    <p><strong>Email Address:</strong> {selectedAccount.email}</p>
                    <p><strong>Mobile Number:</strong> {selectedAccount.phone || "Not Provided"}</p>
                    <p><strong>Account Status:</strong> <span className="admin-status-badge active">{selectedAccount.status || "Active"}</span></p>
                  </div>
                  <div>
                    <h3>Authentication Metadata</h3>
                    <p><strong>Provider:</strong> <span className={`admin-auth-badge ${selectedAccount.authProvider.toLowerCase().includes("google") ? "google" : "email"}`}>{selectedAccount.authProvider}</span></p>
                    <p><strong>Registered Date:</strong> {selectedAccount.createdAt ? new Date(selectedAccount.createdAt).toLocaleString("en-IN") : "Recent"}</p>
                    <p><strong>User ID (UID):</strong> <code style={{ fontSize: "11px", background: "#f0ede6", padding: "2px 4px", borderRadius: "4px" }}>{selectedAccount.uid}</code></p>
                  </div>
                </div>

                {selectedAccount.favoriteTea || selectedAccount.preferences ? (
                  <div style={{ marginTop: "2rem", paddingTop: "1.5rem", borderTop: "1px solid rgba(11,43,30,0.1)" }}>
                    <h3>Curated Palate & Preferences</h3>
                    {selectedAccount.favoriteTea && (
                      <p><strong>Favorite Tea:</strong> {selectedAccount.favoriteTea}</p>
                    )}
                    {selectedAccount.preferences && typeof selectedAccount.preferences === "object" && (
                      <div style={{ display: "flex", gap: "1.5rem", flexWrap: "wrap", marginTop: "1rem" }}>
                        {Object.entries(selectedAccount.preferences).map(([key, val]) => (
                          <div key={key} style={{ background: "#fbf9f5", padding: "0.75rem 1rem", borderRadius: "6px", border: "1px solid rgba(11,43,30,0.08)" }}>
                            <small style={{ textTransform: "uppercase", letterSpacing: "0.5px", color: "rgba(11,43,30,0.6)", display: "block" }}>{key}</small>
                            <strong style={{ color: "var(--leafly-forest)" }}>{Array.isArray(val) ? val.join(", ") : String(val)}</strong>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ) : null}
              </div>
            </div>
          </div>
        )}

        {/* ORDER DETAILS MODAL */}
        {selectedOrder && (
          <div className="admin-modal-overlay" onClick={() => setSelectedOrder(null)}>
            <div className="admin-modal-content" onClick={e => e.stopPropagation()}>
              <div className="admin-modal-header">
                <h2>Order Details: {selectedOrder.id}</h2>
                <button type="button" className="admin-modal-close" onClick={() => setSelectedOrder(null)}>×</button>
              </div>
              <div className="admin-modal-body">
                <div className="admin-order-grid">
                  <div>
                    <h3>Customer Information</h3>
                    <p><strong>Name:</strong> {selectedOrder.shippingAddress?.fullName || selectedOrder.customerName || "Customer"}</p>
                    <p><strong>Email:</strong> {selectedOrder.customerEmail || "N/A"}</p>
                  </div>
                  <div>
                    <h3>Shipping Address</h3>
                    <p>{selectedOrder.shippingAddress?.addressLine1 || "N/A"}</p>
                    {selectedOrder.shippingAddress?.addressLine2 && <p>{selectedOrder.shippingAddress.addressLine2}</p>}
                    <p>{selectedOrder.shippingAddress?.city ? `${selectedOrder.shippingAddress.city}, ${selectedOrder.shippingAddress.state} ${selectedOrder.shippingAddress.postalCode}` : ""}</p>
                    <p>{selectedOrder.shippingAddress?.country || ""}</p>
                  </div>
                  <div>
                    <h3>Payment Details</h3>
                    <p><strong>Method:</strong> {selectedOrder.paymentMethod || "N/A"}</p>
                    <p><strong>Subtotal:</strong> ₹{selectedOrder.subtotal || 0}</p>
                    <p><strong>Discount:</strong> -₹{selectedOrder.discount || 0}</p>
                    <p><strong>Delivery Fee:</strong> ₹{selectedOrder.deliveryFee || 0}</p>
                    <p><strong>Total:</strong> ₹{selectedOrder.total || 0}</p>
                  </div>
                  <div>
                    <h3>Order Status</h3>
                    <p>
                      <span className={`admin-status-badge ${(selectedOrder.orderStatus || selectedOrder.status || "processing").toLowerCase()}`}>
                        {selectedOrder.orderStatus || selectedOrder.status || "Processing"}
                      </span>
                    </p>
                    <p><strong>Date:</strong> {new Date(selectedOrder.createdAt).toLocaleString()}</p>
                  </div>
                </div>
                
                <h3 style={{ marginTop: "2rem", marginBottom: "1rem" }}>Items Ordered</h3>
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Item</th>
                      <th>Variant</th>
                      <th>Price</th>
                      <th>Qty</th>
                      <th>Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(selectedOrder.items || []).map((item, idx) => (
                      <tr key={idx}>
                        <td>{item.name}</td>
                        <td>{item.variant || item.weight || "100g"}</td>
                        <td>₹{item.price}</td>
                        <td>{item.quantity}</td>
                        <td>₹{(item.price || 0) * (item.quantity || 1)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
