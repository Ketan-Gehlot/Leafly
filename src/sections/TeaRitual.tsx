import "./TeaRitual.css";

const ritualSteps = [
  {
    number: "01",
    title: "Scoop",
    description:
      "Choose your leaves with intention. Let the character of the tea guide the moment.",
    icon: "✦",
  },
  {
    number: "02",
    title: "Steep",
    description:
      "Give the leaves time to open. Watch the colour deepen as aroma begins to rise.",
    icon: "◌",
  },
  {
    number: "03",
    title: "Sip",
    description:
      "Take a slower moment. Notice the texture, fragrance and subtle layers in every cup.",
    icon: "⌁",
  },
  {
    number: "04",
    title: "Repeat",
    description:
      "Make it a ritual. Return to the cup whenever you need a little more calm in your day.",
    icon: "↻",
  },
];

export default function TeaRitual() {
  return (
    <section className="tea-ritual-section">
      <div className="tea-ritual-container">

        {/* INTRO */}

        <div className="tea-ritual-header">

          <div className="tea-ritual-heading">

            <div className="tea-ritual-eyebrow">
              <span />
              <p>THE LEAFLY RITUAL</p>
              <span />
            </div>

            <h2>
              A moment of calm,
              <br />
              <em>in every cup.</em>
            </h2>

          </div>

          <p className="tea-ritual-intro">
            Great tea doesn't need to be complicated. Give the leaves
            your attention, give yourself a little time, and let the
            ritual become part of your day.
          </p>

        </div>


        {/* RITUAL STEPS */}

        <div className="tea-ritual-grid">

          {ritualSteps.map((step) => (
            <article
              className="tea-ritual-card"
              key={step.number}
            >

              <div className="tea-ritual-card-top">

                <span className="tea-ritual-number">
                  {step.number}
                </span>

                <span className="tea-ritual-icon">
                  {step.icon}
                </span>

              </div>

              <div className="tea-ritual-card-line" />

              <h3>
                {step.title}
              </h3>

              <p>
                {step.description}
              </p>

            </article>
          ))}

        </div>


        {/* FOOTER STATEMENT */}

        <div className="tea-ritual-footer">

          <span />
          
          <p>
            SLOW DOWN · STEEP DEEPLY · LIVE FULLY
          </p>

          <span />

        </div>

      </div>
    </section>
  );
}