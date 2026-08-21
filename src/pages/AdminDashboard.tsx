import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useProducts } from "../context/ProductContext";
import { type Product, type TeaCategory } from "../data/products";
import { recentOrders, salesAnalytics } from "../data/mockOrders";
import { useAuth } from "../context/AuthContext";
import "./AdminDashboard.css";

export default function AdminDashboard() {
  const { products, updateProduct, addProduct, deleteProduct } = useProducts();
  const { signOut } = useAuth();
  const [activeTab, setActiveTab] = useState<"dashboard" | "products">("dashboard");
  
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [currentProduct, setCurrentProduct] = useState<Partial<Product>>({});

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
      variants: {
        "100g": { weight: "100g", price: 0 },
        "250g": { weight: "250g", price: 0 }
      }
    });
    setIsEditing(true);
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      if (currentProduct.id) {
        // Update
        const updated = { ...currentProduct } as Product;
        updated.variants = {
          "100g": { weight: "100g", price: updated.price, oldPrice: updated.oldPrice },
          "250g": { weight: "250g", price: Math.round(updated.price * 2.2), oldPrice: updated.oldPrice ? Math.round(updated.oldPrice * 2.2) : undefined }
        };
        await updateProduct(updated);
      } else {
        // Add new
        const newProduct = { ...currentProduct } as Product;
        newProduct.id = Date.now();
        newProduct.variants = {
          "100g": { weight: "100g", price: newProduct.price, oldPrice: newProduct.oldPrice },
          "250g": { weight: "250g", price: Math.round(newProduct.price * 2.2), oldPrice: newProduct.oldPrice ? Math.round(newProduct.oldPrice * 2.2) : undefined }
        };
        await addProduct(newProduct);
      }
      setIsEditing(false);
    } catch (error) {
      console.error("Failed to save product", error);
      alert("Failed to save product. Check console.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteProduct = async (id: number) => {
    if (window.confirm("Are you sure you want to delete this product?")) {
      try {
        await deleteProduct(id);
      } catch (error) {
        console.error("Failed to delete product", error);
        alert("Failed to delete product.");
      }
    }
  };

  return (
    <div className="admin-layout">
      {/* SIDEBAR */}
      <aside className="admin-sidebar">
        <div className="admin-brand flex justify-between items-center">
          <h2>Leafly Admin</h2>
          <button onClick={signOut} className="text-xs bg-red-600 text-white px-2 py-1 rounded hover:bg-red-700">Logout</button>
        </div>
        <nav className="admin-nav">
          <button 
            className={activeTab === "dashboard" ? "active" : ""} 
            onClick={() => setActiveTab("dashboard")}
          >
            Dashboard
          </button>
          <button 
            className={activeTab === "products" ? "active" : ""} 
            onClick={() => setActiveTab("products")}
          >
            Products
          </button>
          <button disabled>Orders (Mock)</button>
          <button disabled>Customers (Mock)</button>
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
              </div>
              <div className="admin-stat-card">
                <h3>Total Sales (This Month)</h3>
                <p>₹{salesAnalytics.currentMonthTotal.toLocaleString()}</p>
                <span className="admin-stat-badge positive">+{salesAnalytics.percentageIncrease}% from last month</span>
              </div>
              <div className="admin-stat-card">
                <h3>New Orders</h3>
                <p>{recentOrders.length}</p>
              </div>
            </div>

            <div className="admin-dashboard-row">
              <div className="admin-analytics-section">
                <h2>Sales Analytics (Last 6 Months)</h2>
                <div className="admin-chart">
                  {salesAnalytics.lastSixMonths.map((data) => {
                    const maxSales = Math.max(...salesAnalytics.lastSixMonths.map(d => d.sales));
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
                        <th>Item & Qty</th>
                        <th>Total</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {recentOrders.map(order => (
                        <tr key={order.id}>
                          <td>
                            <strong>{order.id}</strong><br/>
                            <span className="admin-order-date">{order.date}</span>
                          </td>
                          <td>{order.customerName}</td>
                          <td>{order.quantity}x {order.productName}</td>
                          <td>₹{order.total.toLocaleString()}</td>
                          <td>
                            <span className={`admin-status-badge ${order.status.toLowerCase()}`}>
                              {order.status}
                            </span>
                          </td>
                        </tr>
                      ))}
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
              <button className="admin-btn-primary" onClick={handleAddNewClick}>+ Add New Product</button>
            </div>
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
                    <td>{product.name}</td>
                    <td>{product.category}</td>
                    <td>₹{product.price.toLocaleString()}</td>
                    <td>
                      <button className="admin-btn-secondary" onClick={() => handleEditClick(product)} style={{marginRight: '8px'}}>Edit</button>
                      <button className="admin-btn-secondary" onClick={() => handleDeleteProduct(product.id)} style={{color: 'red', borderColor: 'red'}}>Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
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
                  onChange={e => setCurrentProduct({...currentProduct, name: e.target.value})} 
                />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Category</label>
                  <select 
                    value={currentProduct.category || "Green"} 
                    onChange={e => setCurrentProduct({...currentProduct, category: e.target.value as TeaCategory})}
                  >
                    <option value="Green">Green</option>
                    <option value="White">White</option>
                    <option value="Black">Black</option>
                    <option value="Oolong">Oolong</option>
                    <option value="Pu-erh">Pu-erh</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Origin</label>
                  <input 
                    type="text" 
                    required 
                    value={currentProduct.origin || ""} 
                    onChange={e => setCurrentProduct({...currentProduct, origin: e.target.value})} 
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
                    onChange={e => setCurrentProduct({...currentProduct, price: Number(e.target.value)})} 
                  />
                </div>
                <div className="form-group">
                  <label>Old Price (₹) - For Discounts</label>
                  <input 
                    type="number" 
                    value={currentProduct.oldPrice || ""} 
                    onChange={e => setCurrentProduct({...currentProduct, oldPrice: Number(e.target.value) || undefined})} 
                  />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Badge</label>
                  <select 
                    value={currentProduct.badge || "Popular"} 
                    onChange={e => setCurrentProduct({...currentProduct, badge: e.target.value as "Premium" | "Popular" | "Bestseller"})}
                  >
                    <option value="Premium">Premium</option>
                    <option value="Popular">Popular</option>
                    <option value="Bestseller">Bestseller</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Caffeine Level</label>
                  <select 
                    value={currentProduct.caffeine || "Medium"} 
                    onChange={e => setCurrentProduct({...currentProduct, caffeine: e.target.value as "Low" | "Medium" | "High"})}
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                  </select>
                </div>
              </div>
              <div className="form-actions">
                <button type="button" className="admin-btn-secondary" onClick={() => setIsEditing(false)} disabled={isSaving}>Cancel</button>
                <button type="submit" className="admin-btn-primary" disabled={isSaving}>
                  {isSaving ? "Saving..." : "Save Product"}
                </button>
              </div>
            </form>
          </div>
        )}
      </main>
    </div>
  );
}
