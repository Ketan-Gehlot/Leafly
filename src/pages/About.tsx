import "./About.css";
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
    </main>
  );
}
