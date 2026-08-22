import { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { useWishlist } from "../context/WishlistContext";
import { teawareProducts, type TeawareItem, type TeawareCategory } from "../data/teaware";
import type { CartProduct } from "../context/CartContext";
import Footer from "../components/Footer";
import "./Teaware.css";

const categories: Array<"All Teaware" | TeawareCategory> = [
  "All Teaware",
  "Teapots",
  "Tea Cups",
  "Serving & Trays",
  "Storage & Accessories",
];

export default function Teaware() {
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();

  const [category, setCategory] = useState<"All Teaware" | TeawareCategory>("All Teaware");
  const [priceFilter, setPriceFilter] = useState("All Prices");
  const [sortBy, setSortBy] = useState("Featured Collection");
  const [addingId, setAddingId] = useState<number | null>(null);
  const [addedId, setAddedId] = useState<number | null>(null);
  const [selectedItem, setSelectedItem] = useState<TeawareItem | null>(null);
  const [showBackToTop, setShowBackToTop] = useState(false);

  // Cart animation state
  const [animatingItem, setAnimatingItem] = useState<TeawareItem | null>(null);

  useEffect(() => {
    const handleScroll = () => {
      setShowBackToTop(window.scrollY > 500);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setSelectedItem(null);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const filteredProducts = useMemo(() => {
    return teawareProducts
      .filter((item) => {
        if (category !== "All Teaware" && item.category !== category) {
          return false;
        }

        if (priceFilter === "Under ₹1000") {
          return item.price < 1000;
        }
        if (priceFilter === "₹1000 – ₹2000") {
          return item.price >= 1000 && item.price <= 2000;
        }
        if (priceFilter === "Above ₹2000") {
          return item.price > 2000;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === "Price: Low to High") return a.price - b.price;
        if (sortBy === "Price: High to Low") return b.price - a.price;
        if (sortBy === "Name: A to Z") return a.name.localeCompare(b.name);
        return 0; // Featured
      });
  }, [category, priceFilter, sortBy]);

  const clearFilters = () => {
    setCategory("All Teaware");
    setPriceFilter("All Prices");
    setSortBy("Featured Collection");
  };

  const handleAddToCart = (item: TeawareItem) => {
    if (addingId === item.id) return;

    setAddingId(item.id);
    setAnimatingItem(item);

    const cartProduct: CartProduct = {
      id: item.id,
      name: item.name,
      category: item.category,
      origin: item.material,
      caffeine: "Teaware",
      weight: item.capacity || "1 Unit",
      price: item.price,
      oldPrice: item.oldPrice,
      badge: item.badge,
      image: item.image,
    };

    addToCart(cartProduct, 1, "100g", item.price, item.oldPrice);

    setTimeout(() => {
      setAddingId(null);
      setAddedId(item.id);
    }, 450);

    setTimeout(() => {
      setAnimatingItem(null);
    }, 1500);

    setTimeout(() => {
      setAddedId(null);
    }, 2000);
  };

  const toggleWishlist = (item: TeawareItem) => {
    const isWishlisted = isInWishlist(item.id);
    if (isWishlisted) {
      removeFromWishlist(item.id);
    } else {
      addToWishlist({
        id: item.id,
        name: item.name,
        category: item.category,
        origin: item.material,
        caffeine: "Teaware",
        weight: item.capacity || "1 Unit",
        price: item.price,
        oldPrice: item.oldPrice,
        badge: item.badge,
        image: item.image,
      });
    }
  };

  return (
    <main className="teaware-page">
      {/* =====================================================
          HERO
          ===================================================== */}
      <section className="teaware-hero">
        <div className="teaware-hero-inner">
          <p className="teaware-hero-eyebrow">
            <span>✦</span>
            ARTISAN BREWING GEAR
          </p>

          <div className="teaware-hero-ornament">
            <span />
            <b>✦</b>
            <span />
          </div>

          <h1>
            Vessels crafted for
            <br />
            <em>the mindful pour.</em>
          </h1>

          <p className="teaware-hero-description">
            Discover handcrafted borosilicate teapots, high-fired ceramic cups, organic bamboo trays, and airtight canisters — curated to honor the leaf and elevate your daily ritual.
          </p>
        </div>
      </section>

      {/* =====================================================
          COLLECTION
          ===================================================== */}
      <section className="teaware-collection" id="teaware-collection">
        <div className="teaware-collection-header">
          <div>
            <p className="teaware-eyebrow">CURATED COLLECTION</p>
            <h2>Teaware for every ritual.</h2>
          </div>

          <span className="teaware-count">
            {filteredProducts.length} {filteredProducts.length === 1 ? "vessel" : "vessels"}
          </span>
        </div>

        {/* CATEGORY TABS */}
        <div className="teaware-category-tabs" role="tablist" aria-label="Teaware categories">
          {categories.map((item) => (
            <button
              key={item}
              type="button"
              className={category === item ? "teaware-category-tab active" : "teaware-category-tab"}
              onClick={() => setCategory(item)}
              role="tab"
              aria-selected={category === item}
            >
              {item}
            </button>
          ))}
        </div>

        {/* FILTER BAR */}
        <div className="teaware-filter-bar">
          <div className="teaware-filters">
            <select
              value={priceFilter}
              onChange={(e) => setPriceFilter(e.target.value)}
              aria-label="Filter by price"
            >
              <option>All Prices</option>
              <option>Under ₹1000</option>
              <option>₹1000 – ₹2000</option>
              <option>Above ₹2000</option>
            </select>
          </div>

          <div className="teaware-sort">
            <label htmlFor="teaware-sort-select">SORT BY</label>
            <select
              id="teaware-sort-select"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              aria-label="Sort teaware"
            >
              <option>Featured Collection</option>
              <option>Price: Low to High</option>
              <option>Price: High to Low</option>
              <option>Name: A to Z</option>
            </select>
          </div>
        </div>

        {/* ACTIVE FILTER SUMMARY */}
        {(category !== "All Teaware" || priceFilter !== "All Prices") && (
          <div className="teaware-active-filters">
            <span>Showing filtered results</span>
            <button type="button" onClick={clearFilters}>
              Clear filters ×
            </button>
          </div>
        )}

        {/* PRODUCT GRID */}
        <div className="teaware-product-grid">
          {filteredProducts.map((item) => {
            const isWishlisted = isInWishlist(item.id);
            const isAdding = addingId === item.id;
            const isAdded = addedId === item.id;

            return (
              <article className="teaware-card" key={item.id}>
                {/* PRODUCT IMAGE */}
                <div
                  className="teaware-image-wrap"
                  onClick={() => navigate(`/product/${item.id}`)}
                  style={{ cursor: "pointer" }}
                >
                  <img
                    src={item.image}
                    alt={`Leafly ${item.name}`}
                    className="teaware-image"
                    loading="lazy"
                  />

                  <span className={`teaware-badge ${item.badge.toLowerCase()}`}>
                    {item.badge}
                  </span>

                  <button
                    type="button"
                    className={isWishlisted ? "teaware-wishlist-button active" : "teaware-wishlist-button"}
                    aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
                    aria-pressed={isWishlisted}
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleWishlist(item);
                    }}
                  >
                    {isWishlisted ? "♥" : "♡"}
                  </button>
                </div>

                {/* PRODUCT CONTENT */}
                <div className="teaware-content">
                  <p className="teaware-meta">
                    {item.material} · {item.category}
                  </p>

                  <h3
                    onClick={() => navigate(`/product/${item.id}`)}
                    style={{ cursor: "pointer" }}
                  >
                    {item.name}
                  </h3>

                  {/* RATING */}
                  <div className="teaware-rating" aria-label={`${item.rating} out of 5 stars based on ${item.reviewCount} reviews`}>
                    <div className="teaware-stars">
                      {"★".repeat(Math.floor(item.rating))}
                      <span className="teaware-rating-num">{item.rating.toFixed(1)}</span>
                    </div>
                    <span className="teaware-review-count">({item.reviewCount} reviews)</span>
                  </div>

                  {/* SHORT DESCRIPTION */}
                  <p className="teaware-short-desc">
                    {item.description}
                  </p>

                  <p className="teaware-details">
                    {item.capacity || "Standard Capacity"} · Food-Grade
                  </p>

                  <div className="teaware-price">
                    <strong>₹{item.price.toLocaleString("en-IN")}</strong>
                    {item.oldPrice && (
                      <del>₹{item.oldPrice.toLocaleString("en-IN")}</del>
                    )}
                  </div>

                  {/* ACTIONS */}
                  <div className="teaware-actions">
                    <button
                      type="button"
                      className="teaware-details-button"
                      onClick={() => navigate(`/product/${item.id}`)}
                    >
                      VIEW DETAILS
                    </button>

                    <button
                      type="button"
                      className={isAdded ? "teaware-add-button added" : "teaware-add-button"}
                      disabled={isAdding}
                      onClick={() => handleAddToCart(item)}
                    >
                      {isAdding ? (
                        <>
                          <span className="teaware-spinner" />
                          ADDING...
                        </>
                      ) : isAdded ? (
                        <>ADDED ✓</>
                      ) : (
                        <>
                          ADD TO CART
                          <span>+</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      {/* =====================================================
          PRODUCT DETAIL MODAL (Quick View Option)
          ===================================================== */}
      {selectedItem && (
        <div
          className="teaware-modal-overlay"
          role="dialog"
          aria-modal="true"
          aria-label={selectedItem.name}
          onClick={() => setSelectedItem(null)}
        >
          <div
            className="teaware-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              className="teaware-modal-close"
              onClick={() => setSelectedItem(null)}
              aria-label="Close modal"
            >
              ✕
            </button>

            <div className="teaware-modal-image-wrap">
              <img
                src={selectedItem.image}
                alt={selectedItem.name}
                className="teaware-modal-image"
              />
            </div>

            <div className="teaware-modal-info">
              <span className={`teaware-badge ${selectedItem.badge.toLowerCase()}`}>
                {selectedItem.badge}
              </span>

              <p className="teaware-meta">
                {selectedItem.material} · {selectedItem.category}
              </p>

              <h2>{selectedItem.name}</h2>

              <div className="teaware-rating">
                <div className="teaware-stars">
                  {"★".repeat(Math.floor(selectedItem.rating))}
                  <span className="teaware-rating-num">{selectedItem.rating.toFixed(1)}</span>
                </div>
                <span className="teaware-review-count">({selectedItem.reviewCount} customer reviews)</span>
              </div>

              <div className="teaware-modal-price">
                <strong>₹{selectedItem.price.toLocaleString("en-IN")}</strong>
                {selectedItem.oldPrice && (
                  <del>₹{selectedItem.oldPrice.toLocaleString("en-IN")}</del>
                )}
              </div>

              <p className="teaware-modal-desc">{selectedItem.description}</p>

              <div className="teaware-features-list">
                <h4>ARTISAN SPECIFICATIONS</h4>
                <ul>
                  {selectedItem.features.map((feat, idx) => (
                    <li key={idx}>
                      <span className="teaware-feature-dot">✦</span>
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="teaware-modal-actions">
                <button
                  type="button"
                  className="teaware-modal-add-btn"
                  onClick={() => {
                    handleAddToCart(selectedItem);
                    setSelectedItem(null);
                  }}
                >
                  ADD TO CART · ₹{selectedItem.price.toLocaleString("en-IN")}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =====================================================
          ANIMATION: CART POUCH TO TROLLEY
          ===================================================== */}
      {animatingItem && (
        <div className="teaware-anim-overlay" aria-hidden="true">
          <div className="teaware-anim-box">
            <div className="teaware-anim-pouch" />
            <div className="teaware-anim-trolley">
              <div className="teaware-anim-wheels">
                <span />
                <span />
              </div>
            </div>
            <div className="teaware-anim-success">
              <span className="teaware-anim-mark">✓</span>
              <span>ADDED TO RITUAL</span>
            </div>
          </div>
        </div>
      )}

      {/* =====================================================
          BACK TO TOP
          ===================================================== */}
      {showBackToTop && (
        <button
          type="button"
          className="teaware-back-to-top"
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          aria-label="Back to top"
        >
          ↑
        </button>
      )}

      <Footer />
    </main>
  );
}
