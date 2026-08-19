import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import Footer from "../components/Footer";
import "./TeaCollections.css";

type TeaCollection = {
  id: string;
  name: string;
  subtitle: string;
  description: string;
  character: string;
  caffeine: string;
  origin: string;
  image: string;
};

const collections: TeaCollection[] = [
  {
    id: "green",
    name: "Green Tea",
    subtitle: "Fresh · Bright · Refined",
    description:
      "Fresh, expressive teas with delicate vegetal notes, clean finishes and a naturally uplifting character.",
    character: "Fresh & vegetal",
    caffeine: "Medium",
    origin: "Darjeeling",
    image: "/leafly-green-tea.png",
  },
  {
    id: "white",
    name: "White Tea",
    subtitle: "Delicate · Silken · Quiet",
    description:
      "The gentlest expression of the leaf. Soft, floral and beautifully restrained for slower rituals.",
    character: "Floral & delicate",
    caffeine: "Low",
    origin: "Darjeeling",
    image: "/leafly-white-tea.png",
  },
  {
    id: "black",
    name: "Black Tea",
    subtitle: "Bold · Deep · Classic",
    description:
      "Full-bodied teas with depth, warmth and structure. A timeless choice for the morning ritual.",
    character: "Bold & malty",
    caffeine: "High",
    origin: "Assam",
    image: "/leafly-black-tea.png",
  },
  {
    id: "oolong",
    name: "Oolong",
    subtitle: "Complex · Aromatic · Layered",
    description:
      "Partially oxidised teas that sit beautifully between green and black, revealing layer after layer.",
    character: "Floral & layered",
    caffeine: "Medium",
    origin: "Darjeeling",
    image: "/leafly-oolong-tea.png",
  },
  {
    id: "puerh",
    name: "Pu-erh",
    subtitle: "Earthy · Mature · Deep",
    description:
      "Rich, earthy teas with a mature character that rewards patience and repeated steeping.",
    character: "Earthy & smooth",
    caffeine: "Medium",
    origin: "Assam",
    image: "/leafly-puer-tea.png",
  },
];

const featuredProducts = [
  {
    id: 1,
    name: "Himalayan Green Tea",
    category: "Green",
    origin: "Darjeeling",
    weight: "50g",
    price: 699,
    image: "/leafly-green-tea.png",
  },
  {
    id: 2,
    name: "Silver Tips White Tea",
    category: "White",
    origin: "Darjeeling",
    weight: "40g",
    price: 899,
    image: "/leafly-white-tea.png",
  },
  {
    id: 3,
    name: "Darjeeling First Flush",
    category: "Black",
    origin: "Darjeeling",
    weight: "50g",
    price: 749,
    image: "/leafly-black-tea.png",
  },
];

export default function TeaCollections() {
  const navigate = useNavigate();

  const { addToCart } = useCart();

  const [activeCollection, setActiveCollection] =
    useState("green");

  const [addedId, setAddedId] =
    useState<number | null>(null);

  const [selectedRitual, setSelectedRitual] =
    useState<"bright" | "slow" | "deep">("bright");

  const active =
    collections.find(
      (collection) =>
        collection.id === activeCollection
    ) ?? collections[0];

  const handleCollectionClick = (
    collection: TeaCollection
  ) => {
    setActiveCollection(collection.id);
  };

  const handleAddToCart = (
    product: (typeof featuredProducts)[number]
  ) => {
    const collection = collections.find(
      (c) => c.name.includes(product.category)
    );
    
    addToCart({
      id: product.id,
      name: product.name,
      category: product.category,
      origin: product.origin,
      weight: product.weight,
      price: product.price,
      image: product.image,
      caffeine: collection?.caffeine ?? "Medium",
      badge: product.category,
    });

    setAddedId(product.id);

    window.setTimeout(() => {
      setAddedId(null);
    }, 1500);
  };

  return (
    <main className="leafly-collections-page">

      {/* =====================================================
          HERO
      ===================================================== */}

      <section className="collections-hero">

        <div className="collections-hero-content">

          <div className="collections-eyebrow">
            <span />
            <p>THE LEAFLY COLLECTIONS</p>
            <span />
          </div>

          <h1>
            Find the tea
            <br />
            <em>that feels like you.</em>
          </h1>

          <p className="collections-hero-description">
            From bright green teas to deep,
            earthy pu-erh, explore our
            collection by character, origin
            and ritual.
          </p>

        </div>

      </section>


      {/* =====================================================
          COLLECTION INTRO
      ===================================================== */}

      <section className="collections-intro">

        <div>
          <p className="collections-section-label">
            EXPLORE BY CHARACTER
          </p>

          <h2>
            Five expressions
            <br />
            of the leaf.
          </h2>
        </div>

        <p className="collections-intro-copy">
          Every tea has its own rhythm.
          Some are bright and energetic.
          Others ask you to slow down.
          Explore the Leafly collection and
          discover the character that belongs
          in your ritual.
        </p>

      </section>


      {/* =====================================================
          COLLECTION SELECTOR
      ===================================================== */}

      <section className="collections-selector">

        <div className="collection-list">

          {collections.map((collection) => (
            <button
              key={collection.id}
              type="button"
              className={
                activeCollection === collection.id
                  ? "collection-selector-item active"
                  : "collection-selector-item"
              }
              onClick={() =>
                handleCollectionClick(
                  collection
                )
              }
            >
              <span className="collection-number">
                {String(
                  collections.indexOf(
                    collection
                  ) + 1
                ).padStart(2, "0")}
              </span>

              <span className="collection-selector-name">
                {collection.name}
              </span>

              <span className="collection-selector-arrow">
                ✦
              </span>
            </button>
          ))}

        </div>


        {/* FEATURED COLLECTION */}

        <article className="collection-feature">

          <div className="collection-feature-image">

            <img
              src={active.image}
              alt={active.name}
              loading="lazy"
            />

            <span>
              {active.origin}
            </span>

          </div>


          <div className="collection-feature-content">

            <p className="collection-feature-label">
              {active.subtitle}
            </p>

            <h2>
              {active.name}
            </h2>

            <p className="collection-feature-description">
              {active.description}
            </p>


            <div className="collection-spec-grid">

              <div>
                <span>CHARACTER</span>
                <strong>
                  {active.character}
                </strong>
              </div>

              <div>
                <span>CAFFEINE</span>
                <strong>
                  {active.caffeine}
                </strong>
              </div>

              <div>
                <span>ORIGIN</span>
                <strong>
                  {active.origin}
                </strong>
              </div>

            </div>


            <button
              type="button"
              className="collection-explore-button"
              onClick={() =>
                navigate("/shop")
              }
            >
              EXPLORE THIS COLLECTION
              <span>✦</span>
            </button>

          </div>

        </article>

      </section>


      {/* =====================================================
          RITUAL SECTION
      ===================================================== */}

      <section className="collections-ritual">

        <div className="ritual-content">

          <p className="collections-section-label">
            CHOOSE YOUR RITUAL
          </p>

          <h2>
            The right tea
            <br />
            changes the moment.
          </h2>

          <p>
            A morning that needs clarity.
            An afternoon that needs slowing
            down. An evening that deserves
            something warm and grounding.
            There is a leaf for every moment.
          </p>

        </div>

        <div className="ritual-cards">

          <article
            className={`ritual-interactive-card ${selectedRitual === "bright" ? "selected" : ""}`}
            onClick={() => setSelectedRitual("bright")}
            tabIndex={0}
            role="button"
            aria-pressed={selectedRitual === "bright"}
          >
            <div className="ritual-card-header">
              <span>01</span>
              {selectedRitual === "bright" && <span className="ritual-selected-badge">SELECTED</span>}
            </div>

            <h3>
              Start Bright
            </h3>

            <p>
              Fresh green teas for focused
              mornings and clean beginnings.
            </p>

            <div className="ritual-recommendation">
              <span className="ritual-rec-label">Recommended:</span>
              <div className="ritual-rec-tags">
                <span className="ritual-tag">Green Tea</span>
                <span className="ritual-tag">White Tea</span>
              </div>
            </div>

            <button
              type="button"
              className="ritual-cta-btn"
              onClick={(e) => {
                e.stopPropagation();
                navigate("/shop");
              }}
            >
              EXPLORE THIS RITUAL →
            </button>
          </article>

          <article
            className={`ritual-interactive-card ${selectedRitual === "slow" ? "selected" : ""}`}
            onClick={() => setSelectedRitual("slow")}
            tabIndex={0}
            role="button"
            aria-pressed={selectedRitual === "slow"}
          >
            <div className="ritual-card-header">
              <span>02</span>
              {selectedRitual === "slow" && <span className="ritual-selected-badge">SELECTED</span>}
            </div>

            <h3>
              Slow Down
            </h3>

            <p>
              Silken white and oolong teas
              for quieter afternoons.
            </p>

            <div className="ritual-recommendation">
              <span className="ritual-rec-label">Recommended:</span>
              <div className="ritual-rec-tags">
                <span className="ritual-tag">White Tea</span>
                <span className="ritual-tag">Oolong</span>
              </div>
            </div>

            <button
              type="button"
              className="ritual-cta-btn"
              onClick={(e) => {
                e.stopPropagation();
                navigate("/shop");
              }}
            >
              EXPLORE THIS RITUAL →
            </button>
          </article>

          <article
            className={`ritual-interactive-card ${selectedRitual === "deep" ? "selected" : ""}`}
            onClick={() => setSelectedRitual("deep")}
            tabIndex={0}
            role="button"
            aria-pressed={selectedRitual === "deep"}
          >
            <div className="ritual-card-header">
              <span>03</span>
              {selectedRitual === "deep" && <span className="ritual-selected-badge">SELECTED</span>}
            </div>

            <h3>
              Go Deep
            </h3>

            <p>
              Bold black teas and mature
              pu-erh for slower evenings.
            </p>

            <div className="ritual-recommendation">
              <span className="ritual-rec-label">Recommended:</span>
              <div className="ritual-rec-tags">
                <span className="ritual-tag">Black Tea</span>
                <span className="ritual-tag">Pu-erh</span>
              </div>
            </div>

            <button
              type="button"
              className="ritual-cta-btn"
              onClick={(e) => {
                e.stopPropagation();
                navigate("/shop");
              }}
            >
              EXPLORE THIS RITUAL →
            </button>
          </article>

        </div>

      </section>


      {/* =====================================================
          FEATURED TEAS
      ===================================================== */}

      <section className="collections-products">

        <div className="collections-products-header">

          <div>
            <p className="collections-section-label">
              FROM THE COLLECTION
            </p>

            <h2>
              A few worth knowing.
            </h2>
          </div>

          <button
            type="button"
            onClick={() =>
              navigate("/shop")
            }
          >
            VIEW ALL TEAS
            <span>✦</span>
          </button>

        </div>


        <div className="collections-product-grid">

          {featuredProducts.map(
            (product) => {

              const isAdded =
                addedId === product.id;

              return (
                <article
                  className="collections-product-card"
                  key={product.id}
                >

                  <div className="collections-product-image">

                    <img
                      src={product.image}
                      alt={product.name}
                      loading="lazy"
                    />

                    <span>
                      {product.category}
                    </span>

                  </div>


                  <div className="collections-product-content">

                    <p>
                      {product.origin} ·{" "}
                      {product.weight}
                    </p>

                    <h3>
                      {product.name}
                    </h3>

                    <div className="collections-product-bottom">

                      <strong>
                        ₹
                        {product.price.toLocaleString(
                          "en-IN"
                        )}
                      </strong>

                      <button
                        type="button"
                        className={
                          isAdded
                            ? "collection-add-button added"
                            : "collection-add-button"
                        }
                        onClick={() =>
                          handleAddToCart(
                            product
                          )
                        }
                      >
                        {isAdded
                          ? "ADDED ✓"
                          : "ADD TO CART"}
                      </button>

                    </div>

                  </div>

                </article>
              );
            }
          )}

        </div>

      </section>


      {/* =====================================================
          SHOP CTA
      ===================================================== */}

      <section className="collections-cta">

        <div>

          <p>
            THE FULL LEAFLY SHOP
          </p>

          <h2>
            Your next ritual
            <br />
            starts with a leaf.
          </h2>

          <button
            type="button"
            onClick={() =>
              navigate("/shop")
            }
          >
            EXPLORE ALL TEAS
            <span>✦</span>
          </button>

        </div>

      </section>


      {/* =====================================================
          PROMISES
      ===================================================== */}

      <section className="collections-promises">

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

      <Footer />


      {/* =====================================================
          BACK TO TOP
      ===================================================== */}

      <button
        type="button"
        className="collections-back-top"
        onClick={() =>
          window.scrollTo({
            top: 0,
            behavior: "smooth",
          })
        }
        aria-label="Back to top"
      >
        <span>❧</span>
        <small>TOP</small>
      </button>

    </main>
  );
}