import "./Gifting.css";

export default function Gifting() {
  return (
    <section className="gifting-section" id="gifting">
      <div className="gifting-container">

        {/* IMAGE */}
        <div className="gifting-image-wrap">
          <img
            src="/public/leafly-gifting.png"
            alt="Leafly premium tea gifting collection"
            className="gifting-image"
          />
        </div>

        {/* CONTENT */}
        <div className="gifting-content">

          <p className="gifting-eyebrow">
            <span className="gifting-gift-icon">♧</span>
            GIFTS WITH MEANING
          </p>

          <h2 className="gifting-title">
            Thoughtful tea,
            <br />
            <em>beautifully</em> shared.
          </h2>

          <div className="gifting-divider">
            <span />
            <b>◈</b>
            <span />
          </div>

          <p className="gifting-description">
            Curated tea hampers for clients, teams, celebrations and
            moments worth remembering. Handcrafted with single-origin
            teas, artisan teaware, and bespoke personalized packaging.
          </p>

          {/* FEATURES */}
          <div className="gifting-features">

            <div className="gifting-feature">
              <div className="gifting-feature-icon">
                ♧
              </div>

              <div>
                <h3>Corporate &amp; Client Gifts</h3>
                <p>
                  Custom company branding &amp; bulk pricing
                </p>
              </div>
            </div>

            <div className="gifting-feature">
              <div className="gifting-feature-icon">
                ✧
              </div>

              <div>
                <h3>Festive &amp; Wedding Hampers</h3>
                <p>
                  Artisanal boxes, brass spoons &amp; tea blends
                </p>
              </div>
            </div>

          </div>

          {/* BUTTONS */}
          <div className="gifting-actions">

            <a
              href="/gifting"
              className="gifting-primary-button"
            >
              <span>EXPLORE GIFTING</span>
              <strong>→</strong>
            </a>

            <a
              href="/contact"
              className="gifting-secondary-button"
            >
              ENQUIRE FOR BULK ORDERS
            </a>

          </div>

        </div>
      </div>
    </section>
  );
}