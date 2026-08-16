import logo from "../assets/leafly-logo.png";
import "./Footer.css";

const shopLinks = [
  { label: "All Teas", href: "/shop" },
  { label: "Green Tea", href: "/tea-collections" },
  { label: "White Tea", href: "/tea-collections" },
  { label: "Black Tea", href: "/tea-collections" },
  { label: "Oolong Tea", href: "/tea-collections" },
  { label: "Pu-erh Tea", href: "/tea-collections" },
];

const exploreLinks = [
  { label: "Tea Collections", href: "/tea-collections" },
  { label: "Artisanal Teaware", href: "/teaware" },
  { label: "Gifting", href: "/gifting" },
  { label: "Why Leafly", href: "/why-leafly" },
  { label: "Journal", href: "/journal" },
];

const careLinks = [
  { label: "My Account", href: "/account" },
  { label: "Shipping Policy", href: "/shipping" },
  { label: "Freshness Guarantee", href: "/freshness" },
  { label: "FAQs", href: "/faq" },
  { label: "Contact Us", href: "/contact" },
];

export default function Footer() {
  return (
    <footer className="leafly-footer">

      <div className="leafly-footer-inner">

        {/* =====================================================
            TOP FOOTER
            ===================================================== */}

        <div className="leafly-footer-top">

          {/* BRAND */}

          <div className="leafly-footer-brand">

            <img
              src={logo}
              alt="Leafly"
              className="leafly-footer-logo"
            />

            <p className="leafly-footer-brand-text">
              Curating India's finest teas with care,
              intention and respect for every leaf.
              Pure, small-batch and crafted for
              better moments.
            </p>

            <div className="leafly-footer-ornament">
              <span />
              <b>✦</b>
              <span />
            </div>

          </div>


          {/* NEWSLETTER */}

          <div className="leafly-footer-newsletter">

            <p className="leafly-footer-eyebrow">
              <span>✦</span>
              JOIN THE RITUAL
            </p>

            <h2>
              First Flushes &
              <br />
              Mountain Stories
            </h2>

            <p className="leafly-footer-newsletter-text">
              Subscribe to receive tea stories,
              new collections and thoughtful
              moments from Leafly.
            </p>

            <form
              className="leafly-footer-form"
              onSubmit={(event) => event.preventDefault()}
            >

              <input
                type="email"
                placeholder="Enter your email address"
                aria-label="Email address"
              />

              <button type="submit">
                SUBSCRIBE
                <span>→</span>
              </button>

            </form>

          </div>

        </div>


        {/* =====================================================
            GOLD DIVIDER
            ===================================================== */}

        <div className="leafly-footer-divider">
          <span />
          <b>✦</b>
          <span />
        </div>


        {/* =====================================================
            LINK COLUMNS
            ===================================================== */}

        <div className="leafly-footer-links">

          {/* SHOP */}

          <div className="leafly-footer-column">

            <p className="leafly-footer-column-title">
              SHOP TEAS
            </p>

            {shopLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
              >
                {link.label}
              </a>
            ))}

          </div>


          {/* EXPLORE */}

          <div className="leafly-footer-column">

            <p className="leafly-footer-column-title">
              EXPLORE LEAFLY
            </p>

            {exploreLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
              >
                {link.label}
              </a>
            ))}

          </div>


          {/* CUSTOMER CARE */}

          <div className="leafly-footer-column">

            <p className="leafly-footer-column-title">
              CUSTOMER CARE
            </p>

            {careLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
              >
                {link.label}
              </a>
            ))}

          </div>


          {/* =================================================
              CONNECT WITH US
              ================================================= */}

          <div className="leafly-footer-column">

            <p className="leafly-footer-column-title">
              CONNECT WITH US
            </p>


            {/* Instagram */}

            <a
              href="#instagram"
              className="leafly-footer-social-link"
              aria-label="Instagram"
            >

              <svg
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <rect
                  x="3"
                  y="3"
                  width="18"
                  height="18"
                  rx="5"
                />

                <circle
                  cx="12"
                  cy="12"
                  r="4"
                />

                <circle
                  cx="17.5"
                  cy="6.5"
                  r="1"
                  className="leafly-social-fill"
                />
              </svg>

              <span>
                Instagram
              </span>

            </a>


            {/* Facebook */}

            <a
              href="#facebook"
              className="leafly-footer-social-link"
              aria-label="Facebook"
            >

              <svg
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  d="
                    M14 8h3V4h-3
                    c-3.3 0-5 1.9-5 5v3H6v4h3v5h4v-5h3.5l.5-4H13V9
                    c0-.7.3-1 1-1Z
                  "
                />
              </svg>

              <span>
                Facebook
              </span>

            </a>


            {/* Email */}

            <a
              href="mailto:hello@leaflytea.in"
              className="leafly-footer-social-link"
              aria-label="Email Leafly"
            >

              <svg
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <rect
                  x="3"
                  y="5"
                  width="18"
                  height="14"
                  rx="2"
                />

                <path
                  d="m4 7 8 6 8-6"
                />
              </svg>

              <span>
                hello@leaflytea.in
              </span>

            </a>


            {/* Origin */}

            <p className="leafly-footer-origin">

              <span>◇</span>

              100% Single Origin
              <br />

              Authentic Indian Teas

            </p>

          </div>

        </div>

      </div>


      {/* =====================================================
          BOTTOM GOLD BAR
          ===================================================== */}

      <div className="leafly-footer-bottom">

        <div className="leafly-footer-bottom-inner">

          <p>
            © {new Date().getFullYear()} Leafly.
            All rights reserved.
          </p>

          <p className="leafly-footer-motto">
            REAL TEA. BETTER MOMENTS.
          </p>

          <div className="leafly-footer-legal">

            <a href="/privacy">
              Privacy Policy
            </a>

            <span>•</span>

            <a href="/terms">
              Terms & Conditions
            </a>

          </div>

        </div>

      </div>

    </footer>
  );
}