import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { useWishlist } from "../context/WishlistContext";
import { type Product, type ProductVariantKey } from "../data/products";
import { teawareProducts } from "../data/teaware";
import { useProducts } from "../context/ProductContext";
import Footer from "../components/Footer";
import "./ProductDetail.css";

export default function ProductDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { products } = useProducts();

  const { addToCart } = useCart();
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();

  const [selectedVariant, setSelectedVariant] = useState<ProductVariantKey>("100g");
  const [addingToCart, setAddingToCart] = useState(false);
  const [addedToCart, setAddedToCart] = useState(false);

  const teawareItem = teawareProducts.find((t) => t.id === Number(id));
  const product: Product | undefined = products.find((p) => p.id === Number(id)) || (teawareItem ? {
    id: teawareItem.id,
    name: teawareItem.name,
    category: "Green",
    origin: teawareItem.material,
    caffeine: "Low",
    weight: teawareItem.capacity || "1 Unit",
    price: teawareItem.price,
    oldPrice: teawareItem.oldPrice,
    badge: teawareItem.badge,
    image: teawareItem.image,
    variants: {
      "100g": { weight: "100g", price: teawareItem.price, oldPrice: teawareItem.oldPrice },
      "250g": { weight: "250g", price: teawareItem.price },
    },
    rating: teawareItem.rating,
    reviewCount: teawareItem.reviewCount,
  } : undefined);

  /* --- product not found ----------------------------------- */

  if (!product) {
    return (
      <main className="product-detail-page">
        <div className="pdp-not-found">
          <div className="pdp-not-found-mark" aria-hidden="true">❧</div>
          <h1>Tea Not Found</h1>
          <p>We couldn&apos;t find this tea in our collection.</p>
          <button
            type="button"
            className="pdp-not-found-button"
            onClick={() => navigate("/shop")}
          >
            BROWSE ALL TEAS
          </button>
        </div>
      </main>
    );
  }

  /* --- variant pricing & details ---------------------------- */

  const currentVariantData = product.variants ? product.variants[selectedVariant] : {
    weight: selectedVariant,
    price: selectedVariant === "250g" ? Math.round(product.price * 2.2) : product.price,
    oldPrice: selectedVariant === "250g" && product.oldPrice ? Math.round(product.oldPrice * 2.2) : product.oldPrice,
  };

  const currentPrice = currentVariantData.price;
  const currentOldPrice = currentVariantData.oldPrice;
  const currentWeight = currentVariantData.weight;

  const wishlisted = isInWishlist(product.id);

  const handleAddToCart = () => {
    if (addingToCart) return;
    setAddingToCart(true);

    addToCart(
      product,
      1,
      selectedVariant,
      currentPrice,
      currentOldPrice
    );
    setAddingToCart(false);
    setAddedToCart(true);

    window.setTimeout(() => setAddedToCart(false), 1500);
  };

  const handleWishlistToggle = () => {
    if (wishlisted) {
      removeFromWishlist(product.id);
    } else {
      addToWishlist(product);
    }
  };

  const savings =
    currentOldPrice
      ? Math.round(((currentOldPrice - currentPrice) / currentOldPrice) * 100)
      : null;

  /* --- render ---------------------------------------------- */

  const isTeaware = Boolean(teawareItem);

  return (
    <main className="product-detail-page">

      {/* HEADER / BREADCRUMB */}

      <div className="pdp-header">
        <button
          type="button"
          className="pdp-back"
          onClick={() => navigate(-1)}
          aria-label="Go back"
        >
          ← BACK
        </button>

        <div className="pdp-breadcrumb" aria-label="Breadcrumb">
          <Link to="/">Home</Link>
          <span>/</span>
          <Link to={isTeaware ? "/teaware" : "/shop"}>
            {isTeaware ? "Teaware" : "Shop"}
          </Link>
          <span>/</span>
          <strong>{product.name}</strong>
        </div>
      </div>


      {/* MAIN CONTENT GRID */}

      <div className="pdp-layout">

        {/* IMAGE */}

        <div className="pdp-image-wrap">
          <img
            src={product.image}
            alt={`Leafly ${product.name}`}
            className="pdp-image"
            loading="eager"
            fetchPriority="high"
            decoding="async"
          />
          <span className={`pdp-badge ${isTeaware ? "coming-soon" : product.badge.toLowerCase()}`}>
            {isTeaware ? "Coming Soon" : product.badge}
          </span>
        </div>


        {/* PRODUCT INFO */}

        <div className="pdp-info">

          <p className="pdp-eyebrow">
            <span aria-hidden="true">✦</span>
            {isTeaware ? `${teawareItem?.material} · ${teawareItem?.category}` : `${product.origin} · ${product.category} Tea`}
          </p>

          <h1 className="pdp-name">{product.name}</h1>

          <p className="pdp-description">
            {isTeaware ? teawareItem?.description : (
              `A carefully selected ${product.category.toLowerCase()} tea from ${product.origin}, chosen for character, freshness and a memorable tea-drinking ritual.`
            )}
          </p>

          <div className="pdp-divider" aria-hidden="true">
            <span />
            <b>◈</b>
            <span />
          </div>

          {/* QUANTITY / WEIGHT VARIANT SELECTOR (TEA ONLY) */}
          {!isTeaware && (
            <div className="pdp-variant-section">
              <span className="pdp-variant-title">SELECT QUANTITY / WEIGHT</span>
              <div className="pdp-variant-buttons" role="radiogroup" aria-label="Quantity options">
                <button
                  type="button"
                  className={`pdp-variant-btn ${selectedVariant === "100g" ? "active" : ""}`}
                  onClick={() => setSelectedVariant("100g")}
                  role="radio"
                  aria-checked={selectedVariant === "100g"}
                >
                  100g
                </button>
                <button
                  type="button"
                  className={`pdp-variant-btn ${selectedVariant === "250g" ? "active" : ""}`}
                  onClick={() => setSelectedVariant("250g")}
                  role="radio"
                  aria-checked={selectedVariant === "250g"}
                >
                  250g
                </button>
              </div>
            </div>
          )}

          {/* SPECS */}
          <div className="pdp-specs">
            {isTeaware ? (
              <>
                <div className="pdp-spec">
                  <span>MATERIAL</span>
                  <strong>{teawareItem?.material}</strong>
                </div>
                <div className="pdp-spec">
                  <span>CATEGORY</span>
                  <strong>{teawareItem?.category}</strong>
                </div>
                <div className="pdp-spec">
                  <span>CAPACITY</span>
                  <strong>{teawareItem?.capacity || "Standard"}</strong>
                </div>
                <div className="pdp-spec">
                  <span>STATUS</span>
                  <strong>Coming Soon</strong>
                </div>
              </>
            ) : (
              <>
                <div className="pdp-spec">
                  <span>ORIGIN</span>
                  <strong>{product.origin}</strong>
                </div>
                <div className="pdp-spec">
                  <span>TEA TYPE</span>
                  <strong>{product.category}</strong>
                </div>
                <div className="pdp-spec">
                  <span>WEIGHT</span>
                  <strong>{currentWeight}</strong>
                </div>
                <div className="pdp-spec">
                  <span>CAFFEINE</span>
                  <strong>{product.caffeine}</strong>
                </div>
              </>
            )}
          </div>

          {/* PRICE (TEA ONLY) */}
          {!isTeaware && (
            <div className="pdp-price-row">
              <span className="pdp-price">
                ₹{currentPrice.toLocaleString("en-IN")}
              </span>
              {currentOldPrice && (
                <del className="pdp-old-price">
                  ₹{currentOldPrice.toLocaleString("en-IN")}
                </del>
              )}
              {savings && (
                <span className="pdp-savings">{savings}% OFF</span>
              )}
            </div>
          )}

          {/* ACTIONS */}
          <div className="pdp-actions">
            {isTeaware ? (
              <div className="pdp-coming-soon-btn" aria-label="Coming Soon">
                <span>✦</span>
                COMING SOON · LAUNCHING SHORTLY
              </div>
            ) : (
              <button
                type="button"
                className={`pdp-cart-button ${addedToCart ? "added" : ""}`}
                disabled={addingToCart}
                onClick={handleAddToCart}
                aria-label={addedToCart ? "Added to cart" : `Add ${product.name} (${selectedVariant}) to cart`}
              >
                {addingToCart ? (
                  <>
                    <span className="pdp-cart-spinner" aria-hidden="true" />
                    ADDING...
                  </>
                ) : addedToCart ? (
                  <>ADDED ✓</>
                ) : (
                  <>ADD TO CART 🛒</>
                )}
              </button>
            )}

            <button
              type="button"
              className={`pdp-wishlist-button ${wishlisted ? "wishlisted" : ""}`}
              onClick={handleWishlistToggle}
              aria-label={wishlisted ? `Remove ${product.name} from wishlist` : `Add ${product.name} to wishlist`}
              aria-pressed={wishlisted}
            >
              {wishlisted ? "♥" : "♡"}
            </button>
          </div>

        </div>
      </div>
      <Footer />
    </main>
  );
}
