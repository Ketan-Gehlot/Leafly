import "./About.css";
import Footer from "../components/Footer";
import mainImage from "../assets/main.webp";
import image2 from "../assets/image2.webp";
import image3 from "../assets/image3.webp";
import image4 from "../assets/image4.webp";
import image5 from "../assets/image5.webp";

const values = [
  {
    number: "01",
    title: "Thoughtful sourcing",
    text: "We work with tea growers who care about quality, biodiversity, and growing methods that preserve character in every leaf.",
  },
  {
    number: "02",
    title: "Freshly packed",
    text: "Every batch is selected for aroma, texture, and clarity so you taste the tea the way it was meant to be enjoyed.",
  },
  {
    number: "03",
    title: "Built for ritual",
    text: "We create tea experiences that slow people down and invite a more intentional routine at home or in the studio.",
  },
];

const INSTAGRAM_VIDEO_REVIEWS = [
  {
    id: "ig-1",
    creatorName: "Ananya Sharma",
    handle: "@ananya.teatales",
    location: "Bengaluru",
    caption: "The Darjeeling First Flush aroma fills the morning room. Pure single-estate bliss 🍃☕",
    posterImage: image3,
    tag: "Morning Ritual",
    likes: "1.8k",
  },
  {
    id: "ig-2",
    creatorName: "Kabir Mehta",
    handle: "@kabir.mindful",
    location: "Mumbai",
    caption: "Whole leaf integrity you can see unfurling in real time. Craft tea at its best.",
    posterImage: image2,
    tag: "Whole Leaf Craft",
    likes: "1.2k",
  },
  {
    id: "ig-3",
    creatorName: "Meera Sen",
    handle: "@meera_slowliving",
    location: "Kolkata",
    caption: "The unboxing, the aroma canister, the slow mindful steep. My daily pause ✨",
    posterImage: image4,
    tag: "Evening Calm",
    likes: "2.4k",
  },
  {
    id: "ig-4",
    creatorName: "Dev Varma",
    handle: "@dev_wellness",
    location: "New Delhi",
    caption: "Smoked Pu-erh & Roasted Oolong that genuinely slow down a fast-paced work week.",
    posterImage: image5,
    tag: "Artisan Brew",
    likes: "1.9k",
  },
];

const TOP_CUSTOMER_REVIEWS = [
  {
    id: "rev-1",
    name: "Priya Sundaram",
    location: "Bengaluru, India",
    rating: 5,
    reviewTitle: "An exceptional mindful ritual",
    reviewText:
      "The Silver Needle White Tea has an exquisite honeysuckle clarity. The whole leaf integrity and aroma retention is the finest I have encountered in Indian specialty tea.",
    verified: true,
    date: "February 2026",
    teaVariant: "Darjeeling Silver Needle",
  },
  {
    id: "rev-2",
    name: "Arjun Nambiar",
    location: "Mumbai, India",
    rating: 5,
    reviewTitle: "Rich malt depth with genuine terroir",
    reviewText:
      "The Vintage Assam Reserve has a magnificent amber body without harsh astringency. It elevates our morning routine into something deeply grounded and deliberate.",
    verified: true,
    date: "January 2026",
    teaVariant: "Vintage Assam Reserve",
  },
  {
    id: "rev-3",
    name: "Dr. Shalini Rao",
    location: "New Delhi, India",
    rating: 5,
    reviewTitle: "Purity and calming aroma in every steep",
    reviewText:
      "The Himalayan Emerald Green Tea steeps clean and sweet with floral orchid notes. The Tea Maker interactive guide also makes temperature and timing effortless.",
    verified: true,
    date: "February 2026",
    teaVariant: "Himalayan Emerald Green",
  },
  {
    id: "rev-4",
    name: "Rohan Varma",
    location: "Pune, India",
    rating: 5,
    reviewTitle: "Impeccable packaging and fresh harvest quality",
    reviewText:
      "From the aesthetic canisters to the unblemished whole leaves, Leafly delivers pure luxury. The roasted peach notes of the High Mountain Oolong are stunning across multiple infusions.",
    verified: true,
    date: "January 2026",
    teaVariant: "High Mountain Roasted Oolong",
  },
  {
    id: "rev-5",
    name: "Sunita Sen",
    location: "Kolkata, India",
    rating: 5,
    reviewTitle: "Authentic aged depth with petrichor notes",
    reviewText:
      "As a longtime Pu-erh enthusiast, the Restorative Slow-Aged Pu-erh exceeded expectations. Earthy cocoa aroma, velvety texture, and wonderfully restorative.",
    verified: true,
    date: "December 2025",
    teaVariant: "Restorative Aged Pu-erh",
  },
];

export default function About() {
  return (
    <main className="about-page">
      <section className="about-hero">
        <div className="about-hero-copy">
          <p className="about-eyebrow">OUR STORY</p>
          <h1>
            Tea with a sense of
            <span> place, craft, and calm.</span>
          </h1>
          <p className="about-hero-text">
            Leafly began with a simple question: what if tea felt as considered as the people who drink it? We set out to bring a slower, more grounded perspective to everyday rituals.
          </p>
        </div>

        <div className="about-hero-visual">
          <img src={mainImage} alt="Tea leaves and a teacup in a bright studio setting" loading="eager" fetchPriority="high" />
          <div className="about-badge">
            <span>EST. 2024</span>
            <strong>Slow tea, beautifully made.</strong>
          </div>
        </div>
      </section>

      <section className="about-story">
        <div className="about-story-header">
          <p className="about-eyebrow">WHY WE EXIST</p>
          <h2>We believe tea should feel personal, not rushed.</h2>
        </div>

        <div className="about-story-grid">
          <div className="about-story-copy">
            <p>
              In a world that moves quickly, tea remains one of the few rituals that asks us to pause. We wanted to make that pause feel generous — rooted in quality and shaped by intention.
            </p>
            <p>
              From the earliest blends we sourced to the way we package and present them, every decision at Leafly is guided by one idea: exceptional tea should be easy to understand and deeply rewarding to enjoy.
            </p>
          </div>

          <div className="about-story-cards">
            <div className="mini-card">
              <span>Whole leaf</span>
              <strong>Carefully selected</strong>
            </div>
            <div className="mini-card muted">
              <span>Single origin</span>
              <strong>Harvested with purpose</strong>
            </div>
          </div>
        </div>
      </section>

      <section className="about-gallery">
        <div className="about-gallery-row">
          <img src={image2} alt="Close-up tea leaves in a jar" loading="lazy" />
          <img src={image3} alt="Tea preparation and pouring ritual" loading="lazy" />
        </div>
        <div className="about-gallery-feature">
          <img src={image4} alt="Premium tea packaging and accessories" loading="lazy" />
        </div>
      </section>

      <section className="about-values">
        <div className="about-values-header">
          <p className="about-eyebrow">OUR APPROACH</p>
          <h2>Crafted to be simple, considered, and alive.</h2>
        </div>

        <div className="about-values-grid">
          {values.map((value) => (
            <article key={value.number} className="about-value-card">
              <span>{value.number}</span>
              <h3>{value.title}</h3>
              <p>{value.text}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="about-ritual">
        <div className="about-ritual-image">
          <img src={image5} alt="Tea ritual with a warm cup and natural elements" loading="lazy" />
        </div>

        <div className="about-ritual-copy">
          <p className="about-eyebrow">THE RITUAL</p>
          <h2>Every cup is a small invitation to slow down.</h2>
          <p>
            We design our tea around atmosphere as much as flavor. The notes should feel bright and clear, the aroma should linger, and the moment should reward presence.
          </p>
          <p>
            Leafly is a home for people who want their routine to feel a little more joyful, a little more intentional, and a little more rooted in the natural world.
          </p>
        </div>
      </section>

      {/* =========================================================
          1. INSTAGRAM VIDEO REVIEWS
          ========================================================= */}
      <section className="about-video-reviews" aria-label="Customer Video Reviews">
        <div className="about-section-head">
          <p className="about-eyebrow">COMMUNITY MOMENTS</p>
          <h2>Rituals in Motion</h2>
          <p className="about-section-sub">
            Watch how our community brews, pauses, and finds calm with Leafly in their daily life.
          </p>
        </div>

        <div className="about-video-grid">
          {INSTAGRAM_VIDEO_REVIEWS.map((review) => (
            <article key={review.id} className="about-video-card">
              <div className="about-video-poster-wrap">
                <img
                  src={review.posterImage}
                  alt={`Tea review by ${review.creatorName}`}
                  className="about-video-poster"
                  loading="lazy"
                />
                <div className="about-video-overlay">
                  <span className="about-video-tag">{review.tag}</span>
                  <div className="about-video-play-btn" aria-label="Play video review">
                    <svg viewBox="0 0 24 24" fill="currentColor" width="22" height="22">
                      <path d="M8 5v14l11-7z" />
                    </svg>
                  </div>
                  <span className="about-video-likes">♥ {review.likes}</span>
                </div>
              </div>

              <div className="about-video-info">
                <div className="about-video-creator">
                  <strong>{review.creatorName}</strong>
                  <span>{review.handle} · {review.location}</span>
                </div>
                <p className="about-video-caption">"{review.caption}"</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* =========================================================
          2. TOP 5 CUSTOMER REVIEWS
          ========================================================= */}
      <section className="about-top-reviews" aria-label="Top Customer Reviews">
        <div className="about-section-head">
          <p className="about-eyebrow">VERIFIED EXPERIENCES</p>
          <h2>Voices from the Leafly Ritual</h2>
          <p className="about-section-sub">
            Reflections from tea lovers, sommeliers, and everyday practitioners across India.
          </p>
        </div>

        <div className="about-reviews-grid">
          {TOP_CUSTOMER_REVIEWS.map((rev, idx) => (
            <article key={rev.id} className="about-review-card">
              <div className="about-review-header">
                <div className="about-review-author">
                  <div className="about-review-avatar">
                    {rev.name.split(" ").map((n) => n[0]).join("")}
                  </div>
                  <div>
                    <div className="about-review-name-row">
                      <h4>{rev.name}</h4>
                      {rev.verified && <span className="about-verified-badge">✓ Verified Buyer</span>}
                    </div>
                    <span className="about-review-location">{rev.location} · {rev.date}</span>
                  </div>
                </div>

                <div className="about-review-stars" aria-label={`${rev.rating} out of 5 stars`}>
                  {"★".repeat(rev.rating)}
                </div>
              </div>

              <div className="about-review-tea-badge">
                <span>✦ Steeped: {rev.teaVariant}</span>
              </div>

              <h3 className="about-review-title">"{rev.reviewTitle}"</h3>
              <p className="about-review-body">{rev.reviewText}</p>

              <div className="about-review-footer">
                <span className="about-review-rank">Rank #{idx + 1} Featured Review</span>
              </div>
            </article>
          ))}
        </div>
      </section>

      <Footer />
    </main>
  );
}
