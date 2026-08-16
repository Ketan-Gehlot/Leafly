import {
  useEffect,
  useMemo,
  useState,
} from "react";
import { useCart } from "../context/CartContext";
import { useWishlist } from "../context/WishlistContext";
import "./Shop.css";

type TeaCategory =
  | "Green"
  | "White"
  | "Black"
  | "Oolong"
  | "Pu-erh";

type Product = {
  id: number;
  name: string;
  category: TeaCategory;
  origin: string;
  caffeine: "Low" | "Medium" | "High";
  weight: string;
  price: number;
  oldPrice?: number;
  badge: "Premium" | "Popular" | "Bestseller";
  image: string;
};

const products: Product[] = [
  {
    id: 1,
    name: "Himalayan Green Tea",
    category: "Green",
    origin: "Darjeeling",
    caffeine: "Medium",
    weight: "50g",
    price: 699,
    oldPrice: 799,
    badge: "Premium",
    image: "/leafly-green-tea.png",
  },
  {
    id: 2,
    name: "Silver Tips White Tea",
    category: "White",
    origin: "Darjeeling",
    caffeine: "Low",
    weight: "40g",
    price: 899,
    badge: "Popular",
    image: "/leafly-white-tea.png",
  },
  {
    id: 3,
    name: "Darjeeling First Flush",
    category: "Black",
    origin: "Darjeeling",
    caffeine: "High",
    weight: "50g",
    price: 749,
    oldPrice: 849,
    badge: "Bestseller",
    image: "/leafly-black-tea.png",
  },
  {
    id: 4,
    name: "Artisan Oolong",
    category: "Oolong",
    origin: "Assam",
    caffeine: "Medium",
    weight: "50g",
    price: 999,
    badge: "Premium",
    image: "/leafly-oolong-tea.png",
  },
  {
    id: 5,
    name: "Assam Golden Black",
    category: "Black",
    origin: "Assam",
    caffeine: "High",
    weight: "100g",
    price: 649,
    badge: "Popular",
    image: "/leafly-black-tea.png",
  },
  {
    id: 6,
    name: "Kashmir White Reserve",
    category: "White",
    origin: "Kashmir",
    caffeine: "Low",
    weight: "40g",
    price: 1199,
    badge: "Premium",
    image: "/leafly-white-tea.png",
  },
  {
    id: 7,
    name: "Mountain Pu-erh",
    category: "Pu-erh",
    origin: "Assam",
    caffeine: "Medium",
    weight: "50g",
    price: 1099,
    badge: "Bestseller",
    image: "/leafly-puer-tea.png",
  },
  {
    id: 8,
    name: "Reserve Oolong",
    category: "Oolong",
    origin: "Darjeeling",
    caffeine: "Medium",
    weight: "50g",
    price: 1299,
    oldPrice: 1499,
    badge: "Premium",
    image: "/leafly-oolong-tea.png",
  },
];

const categories = [
  "All Teas",
  "Green",
  "White",
  "Black",
  "Oolong",
  "Pu-erh",
];

export default function Shop() {
  const {
    addToCart: addProductToCart,
    cartCount,
  } = useCart();

  const {
    addToWishlist,
    removeFromWishlist,
    isInWishlist,
  } = useWishlist();

  const [category, setCategory] = useState("All Teas");

  const [priceFilter, setPriceFilter] =
    useState("All Prices");

  const [originFilter, setOriginFilter] =
    useState("All Origins");

  const [caffeineFilter, setCaffeineFilter] =
    useState("All Caffeine Levels");

  const [sortBy, setSortBy] =
    useState("Featured Collection");

  const [addingId, setAddingId] =
    useState<number | null>(null);

  const [addedId, setAddedId] =
    useState<number | null>(null);

  const [selectedProduct, setSelectedProduct] =
    useState<Product | null>(null);

  const [showBackToTop, setShowBackToTop] =
    useState(false);

  /*
   * BACK TO TOP VISIBILITY
   */
  useEffect(() => {
    const handleScroll = () => {
      setShowBackToTop(window.scrollY > 500);
    };

    handleScroll();

    window.addEventListener(
      "scroll",
      handleScroll,
      { passive: true }
    );

    return () => {
      window.removeEventListener(
        "scroll",
        handleScroll
      );
    };
  }, []);

  /*
   * ESCAPE CLOSES PRODUCT MODAL
   */
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setSelectedProduct(null);
      }
    };

    window.addEventListener(
      "keydown",
      handleKeyDown
    );

    return () => {
      window.removeEventListener(
        "keydown",
        handleKeyDown
      );
    };
  }, []);

  /*
   * FILTER + SORT
   */
  const filteredProducts = useMemo(() => {
    let result = [...products];

    if (category !== "All Teas") {
      result = result.filter(
        (product) =>
          product.category === category
      );
    }

    if (originFilter !== "All Origins") {
      result = result.filter(
        (product) =>
          product.origin === originFilter
      );
    }

    if (
      caffeineFilter !==
      "All Caffeine Levels"
    ) {
      result = result.filter(
        (product) =>
          product.caffeine === caffeineFilter
      );
    }

    if (priceFilter === "Under ₹750") {
      result = result.filter(
        (product) =>
          product.price < 750
      );
    }

    if (priceFilter === "₹750 – ₹1000") {
      result = result.filter(
        (product) =>
          product.price >= 750 &&
          product.price <= 1000
      );
    }

    if (priceFilter === "Above ₹1000") {
      result = result.filter(
        (product) =>
          product.price > 1000
      );
    }

    if (sortBy === "Price: Low to High") {
      result.sort(
        (a, b) => a.price - b.price
      );
    }

    if (sortBy === "Price: High to Low") {
      result.sort(
        (a, b) => b.price - a.price
      );
    }

    if (sortBy === "Name: A to Z") {
      result.sort((a, b) =>
        a.name.localeCompare(b.name)
      );
    }

    return result;
  }, [
    category,
    priceFilter,
    originFilter,
    caffeineFilter,
    sortBy,
  ]);

  /*
   * WISHLIST
   */
  const toggleWishlist = (id: number) => {
    const product = products.find(
      (item) => item.id === id
    );

    if (!product) {
      return;
    }

    if (isInWishlist(id)) {
      removeFromWishlist(id);
    } else {
      addToWishlist(product);
    }
  };

  /*
   * CART
   */
  const addToCart = (id: number) => {
    const product = products.find(
      (item) => item.id === id
    );

    if (!product || addingId !== null) {
      return;
    }

    setAddingId(id);

    window.setTimeout(() => {
      addProductToCart(product);
      setAddingId(null);
      setAddedId(id);

      window.setTimeout(() => {
        setAddedId(null);
      }, 1500);
    }, 650);
  };

  /*
   * CLEAR FILTERS
   */
  const clearFilters = () => {
    setCategory("All Teas");
    setPriceFilter("All Prices");
    setOriginFilter("All Origins");
    setCaffeineFilter(
      "All Caffeine Levels"
    );
    setSortBy("Featured Collection");
  };

  /*
   * BACK TO TOP
   */
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  /*
   * FOOTER CATEGORY NAVIGATION
   */
  const selectCategoryFromFooter = (
    selectedCategory: string
  ) => {
    setCategory(selectedCategory);
    setPriceFilter("All Prices");
    setOriginFilter("All Origins");
    setCaffeineFilter(
      "All Caffeine Levels"
    );
    setSortBy("Featured Collection");

    window.scrollTo({
      top: 300,
      behavior: "smooth",
    });
  };

  return (
    <main className="leafly-shop-page">

      {/* =====================================================
          HERO
          ===================================================== */}

      <section className="shop-hero">
        <div className="shop-hero-content">

          <div className="shop-eyebrow">
            <span />
            <p>THE LEAFLY TEA HOUSE</p>
            <span />
          </div>

          <h1>
            Exceptional tea,
            <br />
            <em>chosen with intention.</em>
          </h1>

          <p className="shop-hero-description">
            Explore our collection of
            single-origin teas, carefully
            selected for character,
            freshness and rituals that
            make every cup worth slowing
            down for.
          </p>

        </div>
      </section>


      {/* =====================================================
          COLLECTION
          ===================================================== */}

      <section
        className="shop-collection"
        id="tea-collection"
      >

        <div className="shop-collection-header">

          <div>
            <p className="collection-eyebrow">
              THE COLLECTION
            </p>

            <h2>
              Tea for every ritual.
            </h2>
          </div>

          <span className="tea-count">
            {filteredProducts.length}{" "}
            {filteredProducts.length === 1
              ? "tea"
              : "teas"}
          </span>

        </div>


        {/* CATEGORY TABS */}

        <div
          className="category-tabs"
          role="tablist"
          aria-label="Tea categories"
        >

          {categories.map((item) => (
            <button
              key={item}
              type="button"
              className={
                category === item
                  ? "category-tab active"
                  : "category-tab"
              }
              onClick={() =>
                setCategory(item)
              }
              role="tab"
              aria-selected={
                category === item
              }
            >
              {item}
            </button>
          ))}

        </div>


        {/* FILTER BAR */}

        <div className="shop-filter-bar">

          <div className="shop-filters">

            <select
              value={priceFilter}
              onChange={(event) =>
                setPriceFilter(
                  event.target.value
                )
              }
              aria-label="Filter by price"
            >
              <option>
                All Prices
              </option>
              <option>
                Under ₹750
              </option>
              <option>
                ₹750 – ₹1000
              </option>
              <option>
                Above ₹1000
              </option>
            </select>


            <select
              value={originFilter}
              onChange={(event) =>
                setOriginFilter(
                  event.target.value
                )
              }
              aria-label="Filter by origin"
            >
              <option>
                All Origins
              </option>
              <option>
                Darjeeling
              </option>
              <option>
                Assam
              </option>
              <option>
                Kashmir
              </option>
            </select>


            <select
              value={caffeineFilter}
              onChange={(event) =>
                setCaffeineFilter(
                  event.target.value
                )
              }
              aria-label="Filter by caffeine"
            >
              <option>
                All Caffeine Levels
              </option>
              <option>Low</option>
              <option>Medium</option>
              <option>High</option>
            </select>

          </div>


          <div className="shop-sort">

            <span>Sort by</span>

            <select
              value={sortBy}
              onChange={(event) =>
                setSortBy(
                  event.target.value
                )
              }
              aria-label="Sort products"
            >
              <option>
                Featured Collection
              </option>

              <option>
                Price: Low to High
              </option>

              <option>
                Price: High to Low
              </option>

              <option>
                Name: A to Z
              </option>
            </select>

          </div>

        </div>


        {/* ACTIVE FILTER SUMMARY */}

        {(category !== "All Teas" ||
          priceFilter !== "All Prices" ||
          originFilter !== "All Origins" ||
          caffeineFilter !==
            "All Caffeine Levels") && (
          <div className="active-filters">

            <span>
              Showing filtered results
            </span>

            <button
              type="button"
              onClick={clearFilters}
            >
              Clear filters ×
            </button>

          </div>
        )}


        {/* PRODUCT GRID */}

        <div className="shop-product-grid">

          {filteredProducts.map(
            (product) => {

              const isWishlisted =
                isInWishlist(
                  product.id
                );

              const isAdding =
                addingId === product.id;

              const isAdded =
                addedId === product.id;

              return (
                <article
                  className="shop-product-card"
                  key={product.id}
                >

                  {/* PRODUCT IMAGE */}

                  <div className="product-image-wrap">

                    <img
                      src={product.image}
                      alt={`Leafly ${product.name}`}
                      className="product-image"
                      loading="lazy"
                    />

                    <span
                      className={`product-badge ${product.badge.toLowerCase()}`}
                    >
                      {product.badge}
                    </span>

                    <button
                      type="button"
                      className={
                        isWishlisted
                          ? "wishlist-button active"
                          : "wishlist-button"
                      }
                      aria-label={
                        isWishlisted
                          ? "Remove from wishlist"
                          : "Add to wishlist"
                      }
                      aria-pressed={
                        isWishlisted
                      }
                      onClick={() =>
                        toggleWishlist(
                          product.id
                        )
                      }
                    >
                      {isWishlisted
                        ? "♥"
                        : "♡"}
                    </button>

                  </div>


                  {/* PRODUCT CONTENT */}

                  <div className="product-content">

                    <p className="product-meta">
                      {product.origin} ·{" "}
                      {product.category} Tea
                    </p>

                    <h3>
                      {product.name}
                    </h3>

                    <p className="product-details">
                      {product.weight} ·{" "}
                      {product.caffeine} Caffeine
                    </p>

                    <div className="product-price">

                      <strong>
                        ₹
                        {product.price.toLocaleString(
                          "en-IN"
                        )}
                      </strong>

                      {product.oldPrice && (
                        <del>
                          ₹
                          {product.oldPrice.toLocaleString(
                            "en-IN"
                          )}
                        </del>
                      )}

                    </div>


                    {/* ACTIONS */}

                    <div className="product-actions">

                      <button
                        type="button"
                        className="details-button"
                        onClick={() =>
                          setSelectedProduct(
                            product
                          )
                        }
                      >
                        DETAILS
                        <span>+</span>
                      </button>


                      <button
                        type="button"
                        className={
                          isAdded
                            ? "add-cart-button added"
                            : "add-cart-button"
                        }
                        disabled={isAdding}
                        onClick={() =>
                          addToCart(
                            product.id
                          )
                        }
                      >

                        {isAdding ? (
                          <>
                            <span className="cart-spinner" />
                            ADDING...
                          </>
                        ) : isAdded ? (
                          <>
                            ADDED
                            <span>✓</span>
                          </>
                        ) : (
                          <>
                            ADD TO CART
                            <span>🛒</span>
                          </>
                        )}

                      </button>

                    </div>

                  </div>

                </article>
              );
            }
          )}

        </div>


        {/* EMPTY STATE */}

        {filteredProducts.length === 0 && (
          <div className="shop-empty">

            <span>✦</span>

            <h3>
              No teas found.
            </h3>

            <p>
              Try adjusting your filters.
            </p>

            <button
              type="button"
              onClick={clearFilters}
            >
              RESET FILTERS
            </button>

          </div>
        )}

      </section>


      {/* =====================================================
          SHOP PROMISES
          ===================================================== */}

      <section className="shop-promises">

        <div>
          <span>◌</span>

          <strong>
            WHOLE LEAF TEAS
          </strong>

          <p>
            Real leaves, real flavour.
          </p>
        </div>

        <div>
          <span>⌂</span>

          <strong>
            SINGLE ORIGIN
          </strong>

          <p>
            Teas from distinct regions.
          </p>
        </div>

        <div>
          <span>♨</span>

          <strong>
            FRESHLY PACKED
          </strong>

          <p>
            Packed in small batches.
          </p>
        </div>

        <div>
          <span>◇</span>

          <strong>
            SECURE & SAFE
          </strong>

          <p>
            Secure payments, always.
          </p>
        </div>

      </section>


      {/* =====================================================
          FOOTER
          ===================================================== */}

      <footer className="shop-footer">

        <div className="shop-footer-main">

          {/* BRAND */}

          <div className="shop-footer-brand">

            <div className="shop-footer-logo">
              LEAFLY
            </div>

            <p className="shop-footer-tagline">
              Tea worth slowing down for.
            </p>

            <p className="shop-footer-copy">
              A carefully curated tea house
              bringing characterful,
              single-origin leaves into
              everyday rituals.
            </p>

            <div
              className="shop-footer-mark"
              aria-hidden="true"
            >
              ❧
            </div>

          </div>


          {/* SHOP */}

          <div className="shop-footer-column">

            <p className="shop-footer-title">
              SHOP
            </p>

            <button
              type="button"
              onClick={() =>
                selectCategoryFromFooter(
                  "All Teas"
                )
              }
            >
              All Teas
            </button>

            <button
              type="button"
              onClick={() =>
                selectCategoryFromFooter(
                  "Green"
                )
              }
            >
              Green Tea
            </button>

            <button
              type="button"
              onClick={() =>
                selectCategoryFromFooter(
                  "White"
                )
              }
            >
              White Tea
            </button>

            <button
              type="button"
              onClick={() =>
                selectCategoryFromFooter(
                  "Black"
                )
              }
            >
              Black Tea
            </button>

          </div>


          {/* COLLECTION */}

          <div className="shop-footer-column">

            <p className="shop-footer-title">
              COLLECTION
            </p>

            <button
              type="button"
              onClick={() =>
                selectCategoryFromFooter(
                  "Oolong"
                )
              }
            >
              Oolong
            </button>

            <button
              type="button"
              onClick={() =>
                selectCategoryFromFooter(
                  "Pu-erh"
                )
              }
            >
              Pu-erh
            </button>

            <button
              type="button"
              onClick={() =>
                selectCategoryFromFooter(
                  "All Teas"
                )
              }
            >
              Bestsellers
            </button>

            <button
              type="button"
              onClick={clearFilters}
            >
              Clear Filters
            </button>

          </div>


          {/* PHILOSOPHY */}

          <div className="shop-footer-column">

            <p className="shop-footer-title">
              THE LEAFLY RITUAL
            </p>

            <p className="shop-footer-note">
              "Good tea asks you to pause,
              breathe, and stay a little
              longer."
            </p>

            <div
              className="shop-footer-mark"
              aria-hidden="true"
            >
              ✦
            </div>

          </div>

        </div>


        {/* FOOTER BOTTOM */}

        <div className="shop-footer-bottom">

          <span>
            © {new Date().getFullYear()} LEAFLY
            TEA HOUSE
          </span>

          <span>
            SINGLE ORIGIN · WHOLE LEAF ·
            INTENTIONALLY CHOSEN
          </span>

        </div>

      </footer>


      {/* =====================================================
          PRODUCT DETAIL MODAL
          ===================================================== */}

      {selectedProduct && (
        <div
          className="product-detail-overlay"
          onClick={() =>
            setSelectedProduct(null)
          }
          role="presentation"
        >

          <div
            className="product-detail-modal"
            onClick={(event) =>
              event.stopPropagation()
            }
            role="dialog"
            aria-modal="true"
            aria-label={`${selectedProduct.name} details`}
          >

            <button
              type="button"
              className="product-detail-close"
              aria-label="Close product details"
              onClick={() =>
                setSelectedProduct(null)
              }
            >
              ×
            </button>


            {/* IMAGE */}

            <div className="product-detail-image">

              <img
                src={selectedProduct.image}
                alt={selectedProduct.name}
              />

              <span
                className={`product-badge ${selectedProduct.badge.toLowerCase()}`}
              >
                {selectedProduct.badge}
              </span>

            </div>


            {/* INFORMATION */}

            <div className="product-detail-content">

              <p className="product-detail-meta">
                {selectedProduct.origin} ·{" "}
                {selectedProduct.category} Tea
              </p>

              <h2>
                {selectedProduct.name}
              </h2>

              <p className="product-detail-description">
                A carefully selected{" "}
                {selectedProduct.category.toLowerCase()}{" "}
                tea from{" "}
                {selectedProduct.origin},
                chosen for character,
                freshness and a memorable
                tea-drinking ritual.
              </p>


              <div className="product-detail-specs">

                <div>
                  <span>ORIGIN</span>
                  <strong>
                    {selectedProduct.origin}
                  </strong>
                </div>

                <div>
                  <span>TEA TYPE</span>
                  <strong>
                    {selectedProduct.category}
                  </strong>
                </div>

                <div>
                  <span>WEIGHT</span>
                  <strong>
                    {selectedProduct.weight}
                  </strong>
                </div>

                <div>
                  <span>CAFFEINE</span>
                  <strong>
                    {selectedProduct.caffeine}
                  </strong>
                </div>

              </div>


              <div className="product-detail-price">

                <strong>
                  ₹
                  {selectedProduct.price.toLocaleString(
                    "en-IN"
                  )}
                </strong>

                {selectedProduct.oldPrice && (
                  <del>
                    ₹
                    {selectedProduct.oldPrice.toLocaleString(
                      "en-IN"
                    )}
                  </del>
                )}

              </div>


              <button
                type="button"
                className="product-detail-cart"
                onClick={() => {
                  addToCart(
                    selectedProduct.id
                  );

                  setSelectedProduct(null);
                }}
              >
                ADD TO CART
                <span>🛒</span>
              </button>

            </div>

          </div>

        </div>
      )}


      {/* =====================================================
          FLOATING CART
          ===================================================== */}

      {cartCount > 0 && (
        <button
          type="button"
          className="floating-cart"
          aria-label={`${cartCount} teas in cart`}
          onClick={() => {
            /*
             * Replace this later with your real cart
             * route/modal when the cart page is connected.
             */
            window.scrollTo({
              top: 0,
              behavior: "smooth",
            });
          }}
        >

          <span className="floating-cart-icon">
            🛒
          </span>

          <span>
            {cartCount}{" "}
            {cartCount === 1
              ? "tea"
              : "teas"}{" "}
            in cart
          </span>

          <span
            className="floating-cart-leaf"
            aria-hidden="true"
          >
            ❧
          </span>

        </button>
      )}


      {/* =====================================================
          BACK TO TOP
          LEAF SYMBOL — NO ARROW
          ===================================================== */}

      {showBackToTop && (
        <button
          type="button"
          className="back-to-top"
          onClick={scrollToTop}
          aria-label="Back to top"
          title="Back to top"
        >
          <span aria-hidden="true">
            ❧
          </span>

          <small>
            TOP
          </small>
        </button>
      )}

    </main>
  );
}