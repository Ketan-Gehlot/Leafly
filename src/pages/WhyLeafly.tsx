import { useNavigate } from "react-router-dom";
import Footer from "../components/Footer";
import "./WhyLeafly.css";

export default function WhyLeafly() {
  const navigate = useNavigate();

  return (
    <main className="why-leafly-page">


      {/* =====================================================
          PAGE CONTENT
      ===================================================== */}

      <section className="why-hero">

        <div className="why-hero-content">

          <p className="why-eyebrow">
            WHY LEAFLY
          </p>

          <h1>
            Tea should be
            <br />
            <em>worth the ritual.</em>
          </h1>

          <p className="why-hero-description">
            We believe exceptional tea isn't about
            rushing through a cup. It's about knowing
            where it came from, how it was made, and
            giving yourself a moment to enjoy it.
          </p>

        </div>

      </section>


      {/* =====================================================
          PHILOSOPHY
      ===================================================== */}

      <section className="why-philosophy">

        <div className="why-section-label">
          <span />
          OUR PHILOSOPHY
          <span />
        </div>

        <div className="why-philosophy-grid">

          <div className="why-philosophy-copy">

            <h2>
              Less noise.
              <br />
              <em>Better tea.</em>
            </h2>

            <p>
              Leafly was created around a simple idea:
              tea becomes more meaningful when you
              understand what is inside the cup.
            </p>

            <p>
              That's why we focus on whole leaves,
              distinct origins, careful sourcing and
              freshness instead of endless choices.
            </p>

          </div>


          <div className="why-philosophy-mark">
            <span>✦</span>

            <strong>
              THE LEAFLY
              <br />
              STANDARD
            </strong>

            <small>
              ORIGIN · CRAFT · FRESHNESS
            </small>
          </div>

        </div>

      </section>


      {/* =====================================================
          VALUES
      ===================================================== */}

      <section className="why-values">

        <div className="why-value">

          <span className="why-value-number">
            01
          </span>

          <h3>
            Whole Leaf
          </h3>

          <p>
            Real leaves with character,
            aroma and texture intact.
          </p>

        </div>


        <div className="why-value">

          <span className="why-value-number">
            02
          </span>

          <h3>
            Single Origin
          </h3>

          <p>
            We celebrate the places,
            climates and people behind every tea.
          </p>

        </div>


        <div className="why-value">

          <span className="why-value-number">
            03
          </span>

          <h3>
            Freshly Packed
          </h3>

          <p>
            Small batches designed to
            preserve freshness and flavour.
          </p>

        </div>


        <div className="why-value">

          <span className="why-value-number">
            04
          </span>

          <h3>
            Slow Ritual
          </h3>

          <p>
            Because a good cup deserves
            more than a few distracted minutes.
          </p>

        </div>

      </section>


      {/* =====================================================
          CTA
      ===================================================== */}

      <section className="why-cta">

        <div>

          <p className="why-eyebrow">
            READY WHEN YOU ARE
          </p>

          <h2>
            Find your
            <br />
            <em>next ritual.</em>
          </h2>

          <button
            type="button"
            onClick={() => navigate("/shop")}
          >
            EXPLORE THE TEA COLLECTION
            <span>✦</span>
          </button>

        </div>

      </section>


      {/* =====================================================
          BACK TO TOP
      ===================================================== */}

      <button
        type="button"
        className="why-back-top"
        aria-label="Back to top"
        onClick={() =>
          window.scrollTo({
            top: 0,
            behavior: "smooth",
          })
        }
      >
        <span>⌁</span>
        <small>TOP</small>
      </button>

      <Footer />
    </main>
  );
}