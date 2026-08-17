import { useEffect, useState } from "react";
import "./Journal.css";

import teaTastingImage from "../assets/tea-tasting-journal.webp";
import quietImage from "../assets/The-quite.webp";
import morningImage from "../assets/The-morning.webp";
import eveningImage from "../assets/The-evening.webp";
import brokenLeafImage from "../assets/Broken-leaf.webp";
import assamImage from "../assets/Inside-assam.webp";
import fiveSmallImage from "../assets/Five-small.webp";
import caseImage from "../assets/The-case.webp";

type Story = {
  id: number;
  category: string;
  title: string;
  description: string;
  readTime: string;
  image: string;
  content: string[];
};

const stories: Story[] = [
  {
    id: 1,
    category: "BREWING",
    title: "The Quiet Art of Brewing Green Tea",
    description:
      "A simple guide to temperature, timing and the little details that make green tea shine.",
    readTime: "4 MIN READ",
    image: quietImage,
    content: [
      "Green tea rewards patience. The goal is not to extract everything from the leaf, but to reveal the qualities that make each tea distinctive.",
      "Start with water that is comfortably below boiling. For most green teas, a gentler temperature helps preserve delicate aromas and prevents excessive bitterness.",
      "Watch the colour, smell the steam and taste slowly. A well-brewed green tea should feel balanced rather than aggressive.",
    ],
  },
  {
    id: 2,
    category: "ORIGINS",
    title: "A Morning in the Darjeeling Hills",
    description:
      "Why altitude, mist and soil give Darjeeling tea its unmistakable character.",
    readTime: "7 MIN READ",
    image: morningImage,
    content: [
      "Darjeeling is shaped by altitude, cool mountain air and changing weather. These conditions give its teas a character that can be surprisingly bright and delicate.",
      "The same landscape can produce notes ranging from floral and fruity to muscatel and lightly woody.",
      "Understanding the place behind the cup changes the way you taste it. Origin is not just a label; it is part of the flavour.",
    ],
  },
  {
    id: 3,
    category: "RITUAL",
    title: "Why Your Evening Cup Matters",
    description:
      "Tea can be more than a drink. Sometimes the ritual is the point.",
    readTime: "5 MIN READ",
    image: eveningImage,
    content: [
      "An evening cup creates a small boundary between the pace of the day and the quiet that follows.",
      "The ritual can be simple: warm the cup, measure the leaves, pour the water and give yourself a few uninterrupted minutes.",
      "Good tea does not demand your attention. It gives you permission to slow down.",
    ],
  },
  {
    id: 4,
    category: "TEA KNOWLEDGE",
    title: "Whole Leaf vs. Broken Leaf Tea",
    description:
      "What changes when the leaf stays intact, and why it can matter in your cup.",
    readTime: "5 MIN READ",
    image: brokenLeafImage,
    content: [
      "Leaf size affects how quickly water interacts with the tea. Larger leaves generally release their character more gradually.",
      "Broken leaves expose more surface area and can extract more quickly, which is useful in some styles of tea.",
      "Neither approach is automatically better. The important thing is matching the leaf style to the tea and the way you want to brew it.",
    ],
  },
  {
    id: 5,
    category: "ORIGINS",
    title: "Inside Assam's Tea Country",
    description:
      "Discover the warm, bold character behind one of India's most recognisable tea regions.",
    readTime: "6 MIN READ",
    image: assamImage,
    content: [
      "Assam's warm, humid climate creates ideal conditions for producing teas with depth and strength.",
      "The region is particularly known for rich black teas with malty, rounded character.",
      "When tasting Assam tea, look for body first, then notice the sweetness and subtle spice that develop as the cup cools.",
    ],
  },
  {
    id: 6,
    category: "BREWING",
    title: "Five Small Changes to a Better Cup",
    description:
      "You don't need complicated equipment. Start with better water, timing and attention.",
    readTime: "4 MIN READ",
    image: fiveSmallImage,
    content: [
      "Use fresh water whenever possible. Water quality can influence the final cup more than many people expect.",
      "Measure your leaves rather than guessing. Small changes in quantity can dramatically alter strength.",
      "Pay attention to temperature and steeping time. These two variables are among the easiest ways to improve consistency.",
      "Warm your teaware before brewing and give the leaves enough room to open.",
      "Most importantly, taste your tea while it is still changing. The first sip and the final sip can tell very different stories.",
    ],
  },
  {
    id: 7,
    category: "RITUAL",
    title: "The Case for Slowing Down",
    description:
      "A cup of tea gives us a wonderfully simple reason to stop doing everything else.",
    readTime: "5 MIN READ",
    image: caseImage,
    content: [
      "Tea has always had a relationship with time. Leaves need time to grow, time to process and time to release their flavour.",
      "The same principle applies to the person drinking it.",
      "Put the phone down, let the kettle finish and give the cup your full attention. A few quiet minutes can change the entire experience.",
    ],
  },
];

export default function Journal() {
  const [loading, setLoading] = useState(true);
  const [selectedStory, setSelectedStory] = useState<Story | null>(null);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setLoading(false);
    }, 2200);

    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!selectedStory) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setSelectedStory(null);
      }
    };

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [selectedStory]);

  return (
    <main className={`journal-page ${loading ? "journal-loading" : "journal-ready"}`}>
      {/* =====================================================
          JOURNAL LOADER
      ===================================================== */}

      {loading && (
        <div className="journal-loader" aria-label="Opening the Leafly journal">
          <div className="journal-loader-content">

            <div className="journal-book">
              <div className="journal-book-shadow" />

              <div className="journal-page-left">
                <span>LEAFLY</span>
              </div>

              <div className="journal-page-right">
                <strong>THE</strong>
                <em>Leafly</em>
                <small>JOURNAL</small>
              </div>

              <div className="journal-book-spine" />
            </div>

            <p className="journal-loader-label">
              OPENING THE LEAFLY JOURNAL
            </p>

            <div className="journal-loader-line">
              <span />
            </div>
          </div>
        </div>
      )}

      {/* =====================================================
          HEADER
      ===================================================== */}

      <section className="journal-intro">
        <div>
          <p className="journal-eyebrow">
            FROM THE LEAFLY TABLE
          </p>

          <h1>
            Pour over
            <br />
            <em>the tea table.</em>
          </h1>
        </div>

        <div className="journal-intro-meta">
          <span>JOURNAL</span>
          <strong>7 STORIES</strong>
        </div>
      </section>

      {/* =====================================================
          FEATURED STORY
      ===================================================== */}

      <section className="journal-featured">
        <div className="journal-featured-image">
          <img
            src={teaTastingImage}
            alt="Tea tasting table with different teas"
            loading="lazy"
          />

          <span className="journal-image-mark">
            LEAFLY
          </span>
        </div>

        <div className="journal-featured-content">
          <p className="journal-card-category">
            TEA KNOWLEDGE
          </p>

          <h2>
            How to Taste
            <br />
            Tea Like a
            <br />
            Tea Maker
          </h2>

          <p className="journal-featured-description">
            A simple guide to noticing aroma, texture,
            sweetness and finish the way experienced
            tea makers do.
          </p>

          <div className="journal-card-footer">
            <span>8 MIN READ</span>

            <button
              type="button"
              onClick={() =>
                setSelectedStory({
                  id: 0,
                  category: "TEA KNOWLEDGE",
                  title: "How to Taste Tea Like a Tea Maker",
                  description:
                    "A simple guide to noticing aroma, texture, sweetness and finish the way experienced tea makers do.",
                  readTime: "8 MIN READ",
                  image: teaTastingImage,
                  content: [
                    "Professional tea tasting starts with observation. Before taking a sip, look at the dry leaves, notice their shape and colour, and pay attention to their aroma.",
                    "Once the tea is brewed, smell it again. The relationship between the dry leaf and the brewed leaf can reveal how the tea changes through preparation.",
                    "Take a small sip and let the tea move across your palate. Notice sweetness, bitterness, acidity, texture and the length of the finish.",
                    "Do not rush to name every flavour. Start with simple observations: bright or deep, light or full, floral or earthy, short or lingering.",
                    "Taste the tea again as it cools. Temperature changes can reveal flavours that were hidden in the first few sips.",
                    "The most useful tasting skill is attention. The more carefully you taste, the more clearly the tea begins to tell you what it is.",
                  ],
                })
              }
            >
              READ STORY <span>✦</span>
            </button>
          </div>
        </div>
      </section>

      {/* =====================================================
          STORY GRID
      ===================================================== */}

      <section className="journal-stories">
        <div className="journal-stories-header">
          <div>
            <p className="journal-eyebrow">
              FROM THE LEAFLY TABLE
            </p>

            <h2>
              More stories to
              <br className="journal-mobile-break" />
              steep in.
            </h2>
          </div>

          <p>
            Explore our notes on tea,
            <br />
            taste, origins and ritual.
          </p>
        </div>

        <div className="journal-grid">
          {stories.map((story) => (
            <article
              className="journal-card"
              key={story.id}
            >
              <div className="journal-card-image">
                <img
                  src={story.image}
                  alt={story.title}
                  loading="lazy"
                />

                <span className="journal-image-mark">
                  LEAFLY
                </span>
              </div>

              <div className="journal-card-content">
                <p className="journal-card-category">
                  {story.category}
                </p>

                <h3>
                  {story.title}
                </h3>

                <p className="journal-card-description">
                  {story.description}
                </p>

                <div className="journal-card-footer">
                  <span>{story.readTime}</span>

                  <button
                    type="button"
                    onClick={() => setSelectedStory(story)}
                  >
                    READ <span>✦</span>
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* =====================================================
          STORY MODAL
      ===================================================== */}

      {selectedStory && (
        <div
          className="journal-story-overlay"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              setSelectedStory(null);
            }
          }}
        >
          <article className="journal-story-modal">

            <button
              type="button"
              className="journal-story-close"
              aria-label="Close story"
              onClick={() => setSelectedStory(null)}
            >
              ×
            </button>

            <div className="journal-story-modal-image">
              <img
                src={selectedStory.image}
                alt={selectedStory.title}
              />
            </div>

            <div className="journal-story-modal-content">
              <p className="journal-card-category">
                {selectedStory.category}
              </p>

              <h2>
                {selectedStory.title}
              </h2>

              <p className="journal-story-modal-lead">
                {selectedStory.description}
              </p>

              <div className="journal-story-divider" />

              <div className="journal-story-body">
                {selectedStory.content.map((paragraph, index) => (
                  <p key={index}>
                    {paragraph}
                  </p>
                ))}
              </div>

              <div className="journal-story-modal-footer">
                <span>
                  {selectedStory.readTime}
                </span>

                <span>
                  LEAFLY JOURNAL
                </span>
              </div>
            </div>
          </article>
        </div>
      )}

      {/* =====================================================
          BACK TO TOP
      ===================================================== */}

      <button
        type="button"
        className="journal-back-top"
        aria-label="Back to top"
        onClick={() =>
          window.scrollTo({
            top: 0,
            behavior: "smooth",
          })
        }
      >
        <span>⌃</span>
        <small>TOP</small>
      </button>
    </main>
  );
}