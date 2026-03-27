import React, { useState, useEffect } from "react";

/* ─────────────────────────────────────────────
   GLOBAL STYLES  (inject once)
───────────────────────────────────────────── */
const GLOBAL_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:ital,wght@0,300;0,400;0,500;0,600;1,300&display=swap');

  :root {
    --bg:      #f7f6f4;
    --surface: #ffffff;
    --border:  #e4e2de;
    --accent:  #ff7504;
    --accent2: #ff9a3c;
    --text-hi: #18181a;
    --text-lo: #a8a5a0;
    --text-mid:#6b6866;
    --radius:  14px;
  }

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  body { background: var(--bg); }

  .interns-root {
    font-family: 'DM Sans', sans-serif;
    background: var(--bg);
    min-height: 100vh;
    padding: 72px 24px 100px;
    position: relative;
    overflow: hidden;
  }

  /* subtle warm dot pattern */
  .interns-root::before {
    content: '';
    position: fixed;
    inset: 0;
    background-image: radial-gradient(circle, rgba(0,0,0,0.06) 1px, transparent 1px);
    background-size: 28px 28px;
    opacity: 0.5;
    pointer-events: none;
    z-index: 0;
  }

  /* ambient glow */
  .interns-root::after {
    content: '';
    position: fixed;
    width: 700px; height: 700px;
    background: radial-gradient(circle, rgba(255,117,4,0.06) 0%, transparent 70%);
    top: -200px; right: -200px;
    border-radius: 50%;
    pointer-events: none;
    z-index: 0;
  }

  .interns-inner {
    max-width: 1160px;
    margin: 0 auto;
    position: relative;
    z-index: 1;
  }

  /* ── HEADER ── */
  .interns-eyebrow {
    font-family: 'DM Sans', sans-serif;
    font-size: 0.72rem;
    font-weight: 600;
    letter-spacing: 0.18em;
    text-transform: uppercase;
    color: var(--accent);
    margin-bottom: 14px;
    opacity: 0;
    animation: fadeUp 0.6s 0.05s cubic-bezier(0.22,1,0.36,1) forwards;
  }

  .interns-title {
    font-family: 'Bebas Neue', sans-serif;
    font-size: clamp(3rem, 8vw, 6.5rem);
    line-height: 0.92;
    letter-spacing: 0.01em;
    color: var(--text-hi);
    margin-bottom: 20px;
    opacity: 0;
    animation: fadeUp 0.7s 0.12s cubic-bezier(0.22,1,0.36,1) forwards;
  }

  .interns-title span {
    color: var(--accent);
    -webkit-text-stroke: 0px;
  }

  .interns-sub {
    font-size: 0.92rem;
    font-weight: 300;
    color: var(--text-mid);
    letter-spacing: 0.01em;
    max-width: 380px;
    line-height: 1.6;
    opacity: 0;
    animation: fadeUp 0.7s 0.2s cubic-bezier(0.22,1,0.36,1) forwards;
  }

  .interns-header-row {
    display: flex;
    align-items: flex-end;
    justify-content: space-between;
    flex-wrap: wrap;
    gap: 32px;
    margin-bottom: 52px;
  }

  /* ── TABS ── */
  .interns-tabs {
    display: flex;
    align-items: center;
    gap: 4px;
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: 999px;
    padding: 5px;
    opacity: 0;
    animation: fadeUp 0.6s 0.28s cubic-bezier(0.22,1,0.36,1) forwards;
  }

  .interns-tab {
    all: unset;
    cursor: pointer;
    font-family: 'DM Sans', sans-serif;
    font-size: 0.78rem;
    font-weight: 600;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: var(--text-lo);
    padding: 9px 20px;
    border-radius: 999px;
    transition: color 0.25s ease, background 0.25s ease;
    white-space: nowrap;
  }

  .interns-tab:hover:not(.active) {
    color: var(--text-mid);
  }

  .interns-tab.active {
    background: var(--accent);
    color: #fff;
  }

  /* ── DIVIDER ── */
  .interns-divider {
    display: flex;
    align-items: center;
    gap: 16px;
    margin-bottom: 44px;
    opacity: 0;
    animation: fadeIn 0.5s 0.35s ease forwards;
  }

  .interns-divider-label {
    font-size: 0.7rem;
    font-weight: 600;
    letter-spacing: 0.14em;
    text-transform: uppercase;
    color: var(--text-lo);
    white-space: nowrap;
  }

  .interns-divider-count {
    font-family: 'Bebas Neue', sans-serif;
    font-size: 1.1rem;
    color: var(--accent);
    margin-left: 6px;
  }

  .interns-divider-line {
    flex: 1;
    height: 1px;
    background: var(--border);
  }

  /* ── GRID ── */
  .interns-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(210px, 1fr));
    gap: 20px;
  }

  /* ── CARD ── */
  .intern-card {
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: var(--radius);
    overflow: hidden;
    cursor: default;
    transition: transform 0.4s cubic-bezier(0.22,1,0.36,1),
                border-color 0.3s ease,
                box-shadow 0.4s ease;
    opacity: 0;
    animation: cardRise 0.55s cubic-bezier(0.22,1,0.36,1) forwards;
    position: relative;
  }

  .intern-card::after {
    content: '';
    position: absolute;
    inset: 0;
    border-radius: var(--radius);
    border: 1px solid transparent;
    background: linear-gradient(135deg, rgba(255,117,4,0.2), transparent 60%) border-box;
    -webkit-mask: linear-gradient(#fff 0 0) padding-box, linear-gradient(#fff 0 0);
    -webkit-mask-composite: destination-out;
    mask-composite: exclude;
    opacity: 0;
    transition: opacity 0.3s ease;
    pointer-events: none;
  }

  .intern-card:hover {
    transform: translateY(-6px);
    border-color: rgba(255,117,4,0.35);
    box-shadow: 0 20px 40px rgba(0,0,0,0.10), 0 0 0 1px rgba(255,117,4,0.12);
  }

  .intern-card:hover::after {
    opacity: 1;
  }

  /* image area */
  .intern-img-wrap {
    width: 100%;
    aspect-ratio: 3/4;
    overflow: hidden;
    background: #e8e6e2;
    position: relative;
  }

  .intern-img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    object-position: top center;
    display: block;
    transition: transform 0.6s cubic-bezier(0.22,1,0.36,1);
    filter: grayscale(15%);
  }

  .intern-card:hover .intern-img {
    transform: scale(1.06);
    filter: grayscale(0%);
  }

  /* placeholder */
  .intern-placeholder {
    width: 100%;
    aspect-ratio: 3/4;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 8px;
    background: #f0ede8;
    position: relative;
    overflow: hidden;
  }

  .intern-placeholder::before {
    content: '';
    position: absolute;
    width: 180px; height: 180px;
    background: radial-gradient(circle, rgba(255,117,4,0.12), transparent 70%);
    border-radius: 50%;
    top: 50%; left: 50%;
    transform: translate(-50%, -50%);
    transition: opacity 0.3s;
  }

  .intern-card:hover .intern-placeholder::before {
    opacity: 1.6;
  }

  .intern-initial {
    font-family: 'Bebas Neue', sans-serif;
    font-size: 4.5rem;
    color: rgba(255,117,4,0.5);
    line-height: 1;
    transition: color 0.3s ease, transform 0.4s ease;
    position: relative;
    z-index: 1;
  }

  .intern-card:hover .intern-initial {
    color: var(--accent);
    transform: scale(1.06);
  }

  /* card footer */
  .intern-info {
    padding: 14px 16px 16px;
    border-top: 1px solid var(--border);
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  .intern-name {
    font-size: 0.88rem;
    font-weight: 600;
    color: var(--text-hi);
    letter-spacing: -0.01em;
  }

  .intern-number {
    font-family: 'Bebas Neue', sans-serif;
    font-size: 0.95rem;
    color: var(--text-lo);
    letter-spacing: 0.05em;
    transition: color 0.3s;
  }

  .intern-card:hover .intern-number {
    color: var(--accent);
  }

  /* ── ANIMATIONS ── */
  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(20px); }
    to   { opacity: 1; transform: translateY(0); }
  }

  @keyframes fadeIn {
    from { opacity: 0; }
    to   { opacity: 1; }
  }

  @keyframes cardRise {
    from { opacity: 0; transform: translateY(28px) scale(0.97); }
    to   { opacity: 1; transform: translateY(0)    scale(1); }
  }

  /* ── IMAGE OVERLAY ── */
  .intern-img-wrap { cursor: pointer; }

  .intern-img-overlay {
    position: absolute;
    inset: 0;
    background: rgba(0,0,0,0);
    display: flex;
    align-items: center;
    justify-content: center;
    transition: background 0.3s ease;
  }

  .intern-card:hover .intern-img-overlay { background: rgba(0,0,0,0.32); }

  .intern-zoom-icon {
    font-size: 1.6rem;
    color: rgba(255,255,255,0);
    transition: color 0.3s ease, transform 0.3s ease;
    line-height: 1;
  }

  .intern-card:hover .intern-zoom-icon {
    color: rgba(255,255,255,0.9);
    transform: scale(1.1);
  }

  /* ── LIGHTBOX ── */
  .lb-backdrop {
    position: fixed;
    inset: 0;
    background: rgba(8,8,10,0.95);
    z-index: 9999;
    display: flex;
    align-items: center;
    justify-content: center;
    animation: fadeIn 0.2s ease;
    backdrop-filter: blur(12px);
  }

  .lb-img-wrap {
    position: relative;
    max-width: min(90vw, 900px);
    max-height: 90vh;
    display: flex;
    flex-direction: column;
    align-items: center;
  }

  .lb-img {
    max-width: 100%;
    max-height: 85vh;
    object-fit: contain;
    border-radius: 10px;
    box-shadow: 0 40px 80px rgba(0,0,0,0.7);
    animation: cardRise 0.3s cubic-bezier(0.22,1,0.36,1);
  }

  .lb-counter {
    margin-top: 14px;
    font-size: 0.75rem;
    font-weight: 600;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: var(--text-lo);
  }

  .lb-close {
    all: unset;
    position: fixed;
    top: 24px; right: 28px;
    font-size: 1.1rem;
    color: var(--text-mid);
    cursor: pointer;
    width: 38px; height: 38px;
    border-radius: 50%;
    border: 1px solid var(--border);
    background: var(--surface);
    display: flex;
    align-items: center;
    justify-content: center;
    transition: color 0.2s, border-color 0.2s;
    z-index: 10000;
  }

  .lb-close:hover { color: var(--text-hi); border-color: var(--accent); }

  .lb-arrow {
    all: unset;
    position: fixed;
    top: 50%; transform: translateY(-50%);
    font-size: 2.5rem;
    line-height: 1;
    color: var(--text-mid);
    cursor: pointer;
    padding: 12px 18px;
    border-radius: 8px;
    transition: color 0.2s, background 0.2s;
    z-index: 10000;
    user-select: none;
  }

  .lb-arrow:hover { color: var(--text-hi); background: rgba(255,255,255,0.05); }
  .lb-prev { left: 16px; }
  .lb-next { right: 16px; }

  /* responsive */
  @media (max-width: 600px) {
    .interns-header-row { flex-direction: column; align-items: flex-start; }
    .interns-grid { grid-template-columns: repeat(2, 1fr); gap: 14px; }
    .interns-tab { padding: 8px 14px; font-size: 0.72rem; }
    .lb-arrow { font-size: 2rem; padding: 8px 12px; }
  }
`;

/* ─────────────────────────────────────────────
   DATA
───────────────────────────────────────────── */
const CATEGORIES = [
  { id: "DEVELOPMENT", label: "Dev" },
  { id: "BUSINESS", label: "Buissness Dev" },
  { id: "OPERATIONS", label: "Ops" },
];

const TEAM_LABELS = {
  DEVELOPMENT: "Development Team",
  BUSINESS: "Business Development Team",
  OPERATIONS: "Operations Team",
};

const noBgBase = `${process.env.PUBLIC_URL || ""}/RADZTECH_INTERNS_NoBG`;

const ALL_INTERNS = [
  // Development
  { id: "kurt", name: "Kurt", team: "DEVELOPMENT" },

  { id: "adam", name: "Adam", team: "DEVELOPMENT" },
  { id: "brayan", name: "Brayan", team: "DEVELOPMENT" },
  { id: "marth", name: "Marth", team: "DEVELOPMENT" },
  { id: "merlvin", name: "Merlvin", team: "DEVELOPMENT" },
  // Business Development
  { id: "adrian", name: "Adrian", team: "BUSINESS" },
  { id: "dean", name: "Dean", team: "BUSINESS" },
  { id: "diane", name: "Diane", team: "BUSINESS" },
  { id: "jerick", name: "Jerick", team: "BUSINESS" },
  { id: "justine", name: "Justine", team: "BUSINESS" },
  { id: "vince", name: "Vince", team: "BUSINESS" },
  // Operations
  { id: "claire", name: "Claire", team: "OPERATIONS" },
  { id: "john", name: "John", team: "OPERATIONS" },

  { id: "charimaine", name: "Charimaine", team: "OPERATIONS" },
  { id: "hyacinth", name: "Hyacinth", team: "OPERATIONS" },
  { id: "jannie", name: "Jannie", team: "OPERATIONS" },
  { id: "kail", name: "Kail", team: "OPERATIONS" },
].map((intern) => ({
  ...intern,
  src: `${noBgBase}/${intern.name.toUpperCase()}.png`,
}));

const PHOTOS = {
  DEVELOPMENT: ALL_INTERNS.filter((i) => i.team === "DEVELOPMENT"),
  BUSINESS: ALL_INTERNS.filter((i) => i.team === "BUSINESS"),
  OPERATIONS: ALL_INTERNS.filter((i) => i.team === "OPERATIONS"),
};

const Lightbox = ({ photos, index, onClose, onPrev, onNext }) => {
  useEffect(() => {
    const handler = (e) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") onNext();
      if (e.key === "ArrowLeft") onPrev();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose, onNext, onPrev]);

  const photo = photos[index];
  if (!photo) return null;

  return (
    <div className="lb-backdrop" onClick={onClose}>
      <button className="lb-close" onClick={onClose} aria-label="Close">
        ✕
      </button>
      <button
        className="lb-arrow lb-prev"
        onClick={(e) => {
          e.stopPropagation();
          onPrev();
        }}
        aria-label="Previous"
      >
        ‹
      </button>
      <div className="lb-img-wrap" onClick={(e) => e.stopPropagation()}>
        <img src={photo.src} alt={`Photo ${index + 1}`} className="lb-img" />
        <div className="lb-counter">
          {index + 1} / {photos.length}
        </div>
      </div>
      <button
        className="lb-arrow lb-next"
        onClick={(e) => {
          e.stopPropagation();
          onNext();
        }}
        aria-label="Next"
      >
        ›
      </button>
    </div>
  );
};

const Interns = () => {
  const [selected, setSelected] = useState("DEVELOPMENT");
  const [imgErrors, setImgErrors] = useState({});
  const [gridKey, setGridKey] = useState(0);
  const [lightboxIdx, setLightboxIdx] = useState(null);

  // inject CSS once
  useEffect(() => {
    const id = "interns-style";
    if (!document.getElementById(id)) {
      const tag = document.createElement("style");
      tag.id = id;
      tag.textContent = GLOBAL_CSS;
      document.head.appendChild(tag);
    }
  }, []);

  const handleTab = (id) => {
    if (id === selected) return;
    setSelected(id);
    setGridKey((k) => k + 1);
    setLightboxIdx(null);
  };

  const handleImgError = (id) =>
    setImgErrors((prev) => ({ ...prev, [id]: true }));

  const photos = PHOTOS[selected] || [];
  const visible = photos.filter((p) => !imgErrors[p.id]);
  const team = TEAM_LABELS[selected] || "";

  const openLightbox = (i) => setLightboxIdx(i);
  const closeLightbox = () => setLightboxIdx(null);
  const prevPhoto = () =>
    setLightboxIdx((i) => (i - 1 + visible.length) % visible.length);
  const nextPhoto = () => setLightboxIdx((i) => (i + 1) % visible.length);

  return (
    <div className="interns-root">
      {lightboxIdx !== null && (
        <Lightbox
          photos={visible}
          index={lightboxIdx}
          onClose={closeLightbox}
          onPrev={prevPhoto}
          onNext={nextPhoto}
        />
      )}

      <div className="interns-inner">
        <div className="interns-header-row">
          <div>
            <p className="interns-eyebrow">Radztech · Batch 11</p>
            <h1 className="interns-title">
              Meet the
              <br />
              <span>Interns</span>
            </h1>
            <p className="interns-sub">
              Bright minds across development, business, and operations —
              shaping the future of Radztech.
            </p>
          </div>

          <nav className="interns-tabs" role="tablist">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                role="tab"
                aria-selected={selected === cat.id}
                className={`interns-tab${selected === cat.id ? " active" : ""}`}
                onClick={() => handleTab(cat.id)}
              >
                {cat.label}
              </button>
            ))}
          </nav>
        </div>

        {/* ── SECTION DIVIDER ── */}
        <div className="interns-divider">
          <span className="interns-divider-label">
            {team}
            <span className="interns-divider-count">&nbsp;{photos.length}</span>
          </span>
          <div className="interns-divider-line" />
        </div>

        {/* ── PHOTO GRID ── */}
        <div className="interns-grid" key={gridKey}>
          {photos.map((photo, i) => {
            const errored = imgErrors[photo.id];
            const visIdx = visible.findIndex((p) => p.id === photo.id);
            const num = String(i + 1).padStart(2, "0");
            return (
              <div
                className="intern-card"
                key={photo.id}
                style={{ animationDelay: `${i * 0.055}s` }}
                onClick={() =>
                  !errored && visIdx !== -1 && openLightbox(visIdx)
                }
                role={!errored ? "button" : undefined}
                tabIndex={!errored ? 0 : undefined}
                onKeyDown={(e) =>
                  e.key === "Enter" &&
                  !errored &&
                  visIdx !== -1 &&
                  openLightbox(visIdx)
                }
              >
                {!errored ? (
                  <div className="intern-img-wrap">
                    <img
                      src={photo.src}
                      alt={`Photo ${i + 1}`}
                      className="intern-img"
                      onError={() => handleImgError(photo.id)}
                    />
                    <div className="intern-img-overlay">
                      <span className="intern-zoom-icon">⤢</span>
                    </div>
                  </div>
                ) : (
                  <div className="intern-placeholder">
                    <span className="intern-initial">📷</span>
                  </div>
                )}
                <div className="intern-info">
                  <span className="intern-name">{photo.name}</span>
                  <span className="intern-number">{num}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Interns;
