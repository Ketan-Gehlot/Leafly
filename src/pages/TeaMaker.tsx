import { useState, useEffect, useRef } from "react";
import TeaRitualSoundscape from "../components/TeaRitualSoundscape";
import Footer from "../components/Footer";
import "./TeaMaker.css";

type TeaType = "Green" | "White" | "Black" | "Oolong" | "Pu-erh";
type TeaStrength = "Light" | "Balanced" | "Strong";

type TeaPreset = {
  name: string;
  category: TeaType;
  temp: number;
  timeSec: number;
  notes: string;
  tagline: string;
  cupColor: string;
  leafColor: string;
};

const TEA_PRESETS: Record<TeaType, TeaPreset> = {
  Green: {
    name: "Himalayan Spring Green",
    category: "Green",
    temp: 80,
    timeSec: 150, // 2.5 min
    notes: "Sweet Grass · Jasmine · Dewy Mist",
    tagline: "A gentle cup for a slower, mindful morning.",
    cupColor: "rgba(185, 198, 126, 0.85)",
    leafColor: "#4f7743",
  },
  White: {
    name: "Silver Needle Spring White",
    category: "White",
    temp: 75,
    timeSec: 180, // 3 min
    notes: "Wild Honeysuckle · Melon · Silk",
    tagline: "Delicate and airy, harvested at high dawn.",
    cupColor: "rgba(224, 212, 170, 0.75)",
    leafColor: "#8f967a",
  },
  Black: {
    name: "Darjeeling First Flush Black",
    category: "Black",
    temp: 95,
    timeSec: 210, // 3.5 min
    notes: "Muscatel Grape · Amber Malt · Forest Oak",
    tagline: "Bold, grounded, and richly layered.",
    cupColor: "rgba(180, 84, 30, 0.9)",
    leafColor: "#3a2012",
  },
  Oolong: {
    name: "High Mountain Artisan Oolong",
    category: "Oolong",
    temp: 90,
    timeSec: 240, // 4 min
    notes: "Roasted Orchid · Peach Blossom · Honey",
    tagline: "Complex transformation through curling whole leaves.",
    cupColor: "rgba(209, 138, 56, 0.85)",
    leafColor: "#574828",
  },
  "Pu-erh": {
    name: "Ancient Tree Aged Pu-erh",
    category: "Pu-erh",
    temp: 98,
    timeSec: 300, // 5 min
    notes: "Petrichor · Dark Cocoa · Earthy Moss",
    tagline: "Deeply restorative fermented vintage character.",
    cupColor: "rgba(95, 34, 16, 0.95)",
    leafColor: "#22130c",
  },
};

export default function TeaMaker() {
  // Config state
  const [teaType, setTeaType] = useState<TeaType>("Green");
  const [quantity, setQuantity] = useState<"100g" | "250g">("100g");
  const [temperature, setTemperature] = useState<number>(80);
  const [steepingTimeSec, setSteepingTimeSec] = useState<number>(150);
  const [strength, setStrength] = useState<TeaStrength>("Balanced");
  const [isAmbient, setIsAmbient] = useState(false);

  // Brewing lifecycle:
  // 0: "idle" (config panel)
  // 1: "heating" (01 Heating Water)
  // 2: "pouring" (02 Pouring Water)
  // 3: "blooming" (03 Leaves Bloom)
  // 4: "steeping" (04 Steeping with Countdown)
  // 5: "ready" (05 Tea is Ready + Result)
  const [ritualStage, setRitualStage] = useState<
    "idle" | "heating" | "pouring" | "blooming" | "steeping" | "ready"
  >("idle");

  // Timer state
  const [timeLeft, setTimeLeft] = useState<number>(150);
  const [isTimerPaused, setIsTimerPaused] = useState(false);

  const timerRef = useRef<number | null>(null);

  // Sync defaults when tea type changes
  const handleTeaTypeChange = (type: TeaType) => {
    setTeaType(type);
    const preset = TEA_PRESETS[type];
    setTemperature(preset.temp);
    setSteepingTimeSec(preset.timeSec);
    setTimeLeft(preset.timeSec);
  };

  // Start Brewing trigger
  const handleStartBrewing = () => {
    setRitualStage("heating");
    setTimeLeft(steepingTimeSec);
    setIsTimerPaused(false);

    // Sequence stages:
    // 0s - 2s: Heating Water
    // 2s - 4.5s: Pouring Water
    // 4.5s - 6.5s: Leaves Bloom
    // 6.5s onwards: Steeping countdown
    window.setTimeout(() => setRitualStage("pouring"), 2000);
    window.setTimeout(() => setRitualStage("blooming"), 4500);
    window.setTimeout(() => setRitualStage("steeping"), 6500);
  };

  // Countdown timer logic for Steeping stage
  useEffect(() => {
    if (ritualStage === "steeping" && !isTimerPaused) {
      timerRef.current = window.setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current!);
            setRitualStage("ready");
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [ritualStage, isTimerPaused]);

  const handlePauseResume = () => {
    setIsTimerPaused((prev) => !prev);
  };

  const handleReset = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    setRitualStage("idle");
    setTimeLeft(steepingTimeSec);
    setIsTimerPaused(false);
  };

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins < 10 ? "0" : ""}${mins}:${secs < 10 ? "0" : ""}${secs}`;
  };

  const currentPreset = TEA_PRESETS[teaType];

  return (
    <main className={`tea-maker-page ${isAmbient ? "ambient-mode-active" : ""}`}>
      {/* =======================================================
          1. HERO SECTION
          ======================================================= */}
      <section className="tm-hero" id="tea-maker-hero">
        <div className="tm-hero-bg-glow" aria-hidden="true" />
        
        {/* Floating atmospheric leaf particles for ambient mode */}
        <div className="tm-ambient-particles" aria-hidden="true">
          <span className="tm-ambient-leaf al-1">🍃</span>
          <span className="tm-ambient-leaf al-2">🍂</span>
          <span className="tm-ambient-leaf al-3">🍃</span>
          <span className="tm-ambient-leaf al-4">🍂</span>
          <span className="tm-ambient-leaf al-5">🍃</span>
        </div>

        <div className="tm-hero-content">
          <div className="tm-eyebrow">
            <span className="tm-eyebrow-line" />
            <p>INDIAN ARTISAN BREWING</p>
            <span className="tm-eyebrow-line" />
          </div>

          <h1 className="tm-title">TEA MAKER</h1>
          <p className="tm-subtitle">
            Create your perfect cup.
            <br />
            <em>Your ritual. Your moment.</em>
          </p>

          <a href="#build-ritual" className="tm-hero-cta">
            <span>START YOUR TEA RITUAL</span>
            <span className="tm-cta-arrow">↓</span>
          </a>
        </div>
      </section>

      {/* =======================================================
          2. BUILD YOUR RITUAL (CONFIGURATION PANEL)
          ======================================================= */}
      <section className="tm-config-section" id="build-ritual">
        <div className="tm-container">
          <div className="tm-section-header">
            <span className="tm-step-badge">STAGE 01</span>
            <h2>BUILD YOUR RITUAL</h2>
            <p>Tailor origin, temperature, time, and leaf strength.</p>
          </div>

          <div className="tm-config-grid">
            {/* TEA TYPE SELECTOR */}
            <div className="tm-config-card">
              <label className="tm-config-label">SELECT TEA TYPE</label>
              <div className="tm-pill-group">
                {(["Green", "White", "Black", "Oolong", "Pu-erh"] as TeaType[]).map((type) => (
                  <button
                    key={type}
                    type="button"
                    className={`tm-pill-btn ${teaType === type ? "active" : ""}`}
                    onClick={() => handleTeaTypeChange(type)}
                  >
                    {type} Tea
                  </button>
                ))}
              </div>
            </div>

            {/* QUANTITY / WEIGHT */}
            <div className="tm-config-card">
              <label className="tm-config-label">RITUAL QUANTITY</label>
              <div className="tm-pill-group">
                {(["100g", "250g"] as const).map((wt) => (
                  <button
                    key={wt}
                    type="button"
                    className={`tm-pill-btn ${quantity === wt ? "active" : ""}`}
                    onClick={() => setQuantity(wt)}
                  >
                    {wt} Tin
                  </button>
                ))}
              </div>
            </div>

            {/* WATER TEMPERATURE */}
            <div className="tm-config-card">
              <label className="tm-config-label">WATER TEMPERATURE</label>
              <div className="tm-pill-group">
                {[70, 75, 80, 90, 95, 98].map((temp) => (
                  <button
                    key={temp}
                    type="button"
                    className={`tm-pill-btn ${temperature === temp ? "active" : ""}`}
                    onClick={() => setTemperature(temp)}
                  >
                    {temp}°C
                  </button>
                ))}
              </div>
            </div>

            {/* STEEPING TIME */}
            <div className="tm-config-card">
              <label className="tm-config-label">STEEPING TIME</label>
              <div className="tm-pill-group">
                {[
                  { label: "2 min", sec: 120 },
                  { label: "2.5 min", sec: 150 },
                  { label: "3 min", sec: 180 },
                  { label: "4 min", sec: 240 },
                  { label: "5 min", sec: 300 },
                ].map((item) => (
                  <button
                    key={item.sec}
                    type="button"
                    className={`tm-pill-btn ${steepingTimeSec === item.sec ? "active" : ""}`}
                    onClick={() => {
                      setSteepingTimeSec(item.sec);
                      setTimeLeft(item.sec);
                    }}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            {/* STRENGTH */}
            <div className="tm-config-card">
              <label className="tm-config-label">INFUSION STRENGTH</label>
              <div className="tm-pill-group">
                {(["Light", "Balanced", "Strong"] as TeaStrength[]).map((str) => (
                  <button
                    key={str}
                    type="button"
                    className={`tm-pill-btn ${strength === str ? "active" : ""}`}
                    onClick={() => setStrength(str)}
                  >
                    {str}
                  </button>
                ))}
              </div>
            </div>

            {/* AMBIENT MODE TOGGLE */}
            <div className="tm-config-card tm-ambient-card">
              <div className="tm-ambient-header">
                <div>
                  <label className="tm-config-label">AMBIENT MODE</label>
                  <p className="tm-ambient-desc">Immersive visual atmosphere & floating botanical accents</p>
                </div>
                <button
                  type="button"
                  className={`tm-ambient-toggle-btn ${isAmbient ? "enabled" : ""}`}
                  onClick={() => setIsAmbient(!isAmbient)}
                  aria-label="Toggle ambient mode"
                >
                  <span className="toggle-indicator" />
                  {isAmbient ? "ON" : "OFF"}
                </button>
              </div>
            </div>
          </div>

          {ritualStage === "idle" && (
            <div className="tm-start-action">
              <button
                type="button"
                className="tm-brew-master-btn"
                onClick={handleStartBrewing}
              >
                BEGIN BREWING RITUAL ✦
              </button>
            </div>
          )}
        </div>
      </section>

      {/* =======================================================
          3. BREWING STAGES & ANIMATED TEAPOT SCENE
          ======================================================= */}
      {ritualStage !== "idle" && (
        <section className="tm-ritual-stage-section" id="brewing-ritual">
          <div className="tm-container">
            {/* STAGES PROGRESS BAR */}
            <div className="tm-stages-nav" role="tablist" aria-label="Brewing Ritual Stages">
              {[
                { id: "heating", label: "01 HEATING WATER" },
                { id: "pouring", label: "02 POURING WATER" },
                { id: "blooming", label: "03 LEAVES BLOOM" },
                { id: "steeping", label: "04 STEEPING" },
                { id: "ready", label: "05 TEA IS READY" },
              ].map((stageItem) => {
                const isActive = ritualStage === stageItem.id;
                return (
                  <div
                    key={stageItem.id}
                    className={`tm-stage-step ${isActive ? "active" : ""}`}
                  >
                    <span className="stage-dot" />
                    <span className="stage-label">{stageItem.label}</span>
                  </div>
                );
              })}
            </div>

            {/* VISUAL TEAPOT & CUP INTERACTIVE SCENE */}
            <div className="tm-brewing-scene">
              <div className="tm-scene-table">
                {/* ANIMATED TEAPOT */}
                <div
                  className={`tm-teapot-wrap ${
                    ritualStage === "pouring" ? "tilting" : ritualStage === "heating" ? "heating" : "resting"
                  }`}
                >
                  <svg className="tm-teapot-svg" viewBox="0 0 200 160" aria-label="Artisan Teapot">
                    {/* Teapot Lid */}
                    <path d="M70 40 Q100 25 130 40 Z" fill="#0b2b1e" stroke="#c9a24b" strokeWidth="2" />
                    <circle cx="100" cy="24" r="6" fill="#c9a24b" />

                    {/* Teapot Body */}
                    <path
                      d="M50 48 Q30 90 60 130 Q100 145 140 130 Q170 90 150 48 Z"
                      fill="linear-gradient(135deg, #0b2b1e 0%, #153b2b 100%)"
                      stroke="#c9a24b"
                      strokeWidth="2"
                    />
                    <path d="M60 48 L140 48" stroke="#c9a24b" strokeWidth="2" />

                    {/* Handle */}
                    <path
                      d="M48 60 Q15 80 46 115"
                      fill="none"
                      stroke="#c9a24b"
                      strokeWidth="5"
                      strokeLinecap="round"
                    />

                    {/* Spout */}
                    <path
                      d="M148 70 Q185 60 180 40 Q175 40 142 85"
                      fill="#0b2b1e"
                      stroke="#c9a24b"
                      strokeWidth="2"
                      strokeLinejoin="round"
                    />
                  </svg>

                  {/* Water Stream when pouring */}
                  {ritualStage === "pouring" && (
                    <div className="tm-water-stream" aria-hidden="true" />
                  )}
                </div>

                {/* ANIMATED CUP */}
                <div className="tm-teacup-wrap">
                  {/* Subtle rising steam */}
                  {(ritualStage === "pouring" ||
                    ritualStage === "blooming" ||
                    ritualStage === "steeping" ||
                    ritualStage === "ready") && (
                    <div className="tm-steam-container" aria-hidden="true">
                      <span className="tm-steam-particle s1" />
                      <span className="tm-steam-particle s2" />
                      <span className="tm-steam-particle s3" />
                    </div>
                  )}

                  <div className="tm-teacup-body">
                    {/* Liquid fill */}
                    <div
                      className={`tm-cup-liquid ${
                        ritualStage === "pouring"
                          ? "filling"
                          : ritualStage === "blooming" || ritualStage === "steeping" || ritualStage === "ready"
                          ? "filled"
                          : "empty"
                      }`}
                      style={{ backgroundColor: currentPreset.cupColor }}
                    >
                      {/* Blooming leaves inside the cup */}
                      {(ritualStage === "blooming" ||
                        ritualStage === "steeping" ||
                        ritualStage === "ready") && (
                        <div className="tm-leaves-bloom" aria-hidden="true">
                          <span
                            className="tm-leaf l1"
                            style={{ backgroundColor: currentPreset.leafColor }}
                          />
                          <span
                            className="tm-leaf l2"
                            style={{ backgroundColor: currentPreset.leafColor }}
                          />
                          <span
                            className="tm-leaf l3"
                            style={{ backgroundColor: currentPreset.leafColor }}
                          />
                          <span
                            className="tm-leaf l4"
                            style={{ backgroundColor: currentPreset.leafColor }}
                          />
                        </div>
                      )}
                    </div>
                  </div>
                  {/* Cup Saucer */}
                  <div className="tm-teacup-saucer" />
                </div>
              </div>

              {/* STEEPING COUNTDOWN TIMER */}
              {ritualStage === "steeping" && (
                <div className="tm-timer-panel">
                  <span className="tm-timer-label">STEEPING YOUR TEA</span>
                  <div className="tm-timer-digits" aria-live="polite">
                    {formatTimer(timeLeft)}
                  </div>
                  <div className="tm-timer-controls">
                    <button
                      type="button"
                      className="tm-timer-btn"
                      onClick={handlePauseResume}
                    >
                      {isTimerPaused ? "RESUME ▶" : "PAUSE ⏸"}
                    </button>
                    <button
                      type="button"
                      className="tm-timer-btn secondary"
                      onClick={handleReset}
                    >
                      RESET ↺
                    </button>
                  </div>
                </div>
              )}

              {/* COMPLETION & PERSONALIZED RESULT */}
              {ritualStage === "ready" && (
                <div className="tm-result-card">
                  <div className="tm-result-header">
                    <span className="tm-result-check">✓</span>
                    <p className="tm-result-eyebrow">YOUR TEA IS READY</p>
                    <h3 className="tm-result-title">{currentPreset.name}</h3>
                  </div>

                  <div className="tm-result-meta-chips">
                    <span>{teaType} Tea</span>
                    <span>{temperature}°C</span>
                    <span>{strength} Infusion</span>
                    <span>{Math.round(steepingTimeSec / 60)} Min Steep</span>
                  </div>

                  <div className="tm-result-notes-box">
                    <strong>TASTING PROFILE</strong>
                    <p className="tm-result-notes">{currentPreset.notes}</p>
                    <p className="tm-result-tagline">“{currentPreset.tagline}”</p>
                  </div>

                  <div className="tm-result-actions">
                    <button
                      type="button"
                      className="tm-brew-again-btn"
                      onClick={handleReset}
                    >
                      BREW ANOTHER CUP ↺
                    </button>
                    <a href="/shop" className="tm-shop-tea-btn">
                      SHOP THIS TEA →
                    </a>
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>
      )}

      {/* =======================================================
          4. TEA RITUAL SOUNDSCAPE (NATIVE MUSIC PLAYER)
          ======================================================= */}
      <TeaRitualSoundscape />

      {/* =======================================================
          5. EXISTING GLOBAL FOOTER
          ======================================================= */}
      <Footer />
    </main>
  );
}
