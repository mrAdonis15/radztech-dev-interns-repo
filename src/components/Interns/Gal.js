import { useState, useEffect } from "react";

const orientationBase = `${process.env.PUBLIC_URL || ""}/ORIENTATION`;
const devsBase = `${process.env.PUBLIC_URL || ""}/Devs`;
const bizBase = `${process.env.PUBLIC_URL || ""}/BD`;
const opsBase = `${process.env.PUBLIC_URL || ""}/OPs`;

const orientationPhotos = [
  "IMG_5896",
  "IMG_5918",
  "IMG_5925",
  "IMG_5930",
  "IMG_5933",
  "IMG_5939",
  "IMG_5944",
  "IMG_5956",
  "IMG_5961",
  "IMG_5966",
  "IMG_5975",
  "IMG_5982",
  "IMG_5986",
  "IMG_5993",
  "IMG_6001",
  "IMG_6006",
  "IMG_6010",
  "IMG_6029",
  "IMG_6054",
  "IMG_6062",
  "IMG_6063",
].map((n) => ({ name: n, ext: "jpg" }));

const devTeamPhotos = [
  "1",
  "IMG_20260209_090254_811",
  "IMG_20260209_095644_130",
  "IMG_20260210_142445_235",
  "IMG_20260213_140752_266",
  "IMG_20260213_150923_504",
  "IMG_20260218_160108_306",
  "IMG_20260220_095330_499",
  "IMG_20260223_093122_244",
  "IMG_20260224_150211_484",
  "IMG_20260226_112323_166",
  "IMG_20260303_082545_700",
  "IMG_20260306_131246_248",
].map((n) => ({ name: n, ext: "jpg" }));

const businessDevPhotos = [
  { name: "12", ext: "jpg" },
  { name: "1234", ext: "jpg" },
  { name: "fed16e6638ab3c183e1a76aed2df4ff4", ext: "jpeg" },
  { name: "c2029a0b8225e0327e530668a5ddb554", ext: "jpeg" },
];

const OpsDevPhotos = [
  "193f5315aeab9aa1eb2573391da8d449",
  "3205406c28afe6a80ab0321d1cdb41c3",
  "549d0072feb421fd4f00fde36e22a903",
  "7d06d347bcef2b10c5c699e04d1ad434",
  "IMG_5597",
  "IMG_5603",
  "IMG_5604",
  "IMG_5605",
  "IMG_5606",
  "IMG_5607",
  "IMG_5609",
  "IMG_5610",
  "IMG_5611",
  "IMG_5612",
  "IMG_5613",
  "IMG_5617",
  "aafb6aa3fa21287bd823e4566de6a404",
  "cd30f53e17f06f067d330c17f234c20a",
  "f17fd3c95ca69cc92852bd041467a132",
].map((n) => ({ name: n, ext: "png" }));

const src = (base, photo) => `${base}/${photo.name}.${photo.ext}`;

const SECTIONS = [
  {
    key: "orientation",
    title: "Radztech Intern Orientation Batch 11",
    sub: "Relive the moments from our intern orientation day.",
    accent: "#e66a03",
    photos: orientationPhotos,
    base: orientationBase,
  },
  {
    key: "devteam",
    title: "Development Team",
    sub: "Behind the code — the developers building our future.",
    accent: "#0EA5E9",
    photos: devTeamPhotos,
    base: devsBase,
  },
  {
    key: "bizdev",
    title: "Business Dev",
    sub: "The team driving growth and partnerships.",
    accent: "#10B981",
    photos: businessDevPhotos,
    base: bizBase,
  },
  {
    key: "opsdev",
    title: "Ops Dev",
    sub: "Keeping everything running smoothly behind the scenes.",
    accent: "#F59E0B",
    photos: OpsDevPhotos,
    base: opsBase,
  },
];

const css = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700&family=DM+Sans:wght@300;400;500;600&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  body { margin: 0; background: #fff; }

  .root {
    background: #fff;
    min-height: 100vh;
    font-family: 'DM Sans', sans-serif;
    padding-bottom: 80px;
  }

  /* HERO */
  .hero-wrapper {
    padding: 40px 36px 0;
    max-width: 1400px;
    margin: 0 auto;
  }
  .hero {
    position: relative;
    width: 100%;
    height: clamp(320px, 52vw, 580px);
    overflow: hidden;
    border-radius: 14px;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .hero-bg {
    position: absolute;
    border-radius: 20px;
    inset: 0;
    width: 100%;
    height: 100%;
    object-fit: cover;
    object-position: center top;
    filter: brightness(0.62);
    border: 2px solid #ffffff;
  }
  .hero-content {
    position: relative;
    z-index: 2;
    text-align: center;
    padding: 0 24px;
  }
  .hero h1 {
    font-family: 'Playfair Display', serif;
    font-size: clamp(32px, 5vw, 60px);
    font-weight: 700;
    color: #fff;
    letter-spacing: -.02em;
    margin-bottom: 12px;
    text-shadow: 0 2px 24px rgba(0,0,0,.35);
  }
  .hero-quote {
    font-size: 15px;
    color: rgba(255,255,255,.88);
    line-height: 1.8;
    letter-spacing: .01em;
  }

  /* CAROUSEL */
  .carousel-section {
    max-width: 1100px;
    margin: 0 auto;
    padding: 52px 52px 0;
    position: relative;
  }

  .carousel-outer { overflow: hidden; }

  /* 4 slides, show 2 at a time */
  .carousel-track {
    display: flex;
    gap: 20px;
    transition: transform .45s cubic-bezier(.4,0,.2,1);
    will-change: transform;
  }

  .slide {
    flex: 0 0 calc(50% - 10px);
    position: relative;
    border-radius: 6px;
    overflow: hidden;
    cursor: pointer;
    aspect-ratio: 16/10;
    background: #e5e7eb;
  }
  .slide img {
    width: 100%; height: 100%;
    object-fit: cover; display: block;
    transition: transform .5s cubic-bezier(.4,0,.2,1);
  }
  .slide:hover img { transform: scale(1.05); }

  /* Hover overlay */
  .slide-overlay {
    position: absolute; inset: 0;
    background: linear-gradient(to top, rgba(0,0,0,.76) 0%, rgba(0,0,0,.08) 55%, transparent 100%);
    display: flex; flex-direction: column; justify-content: flex-end;
    padding: 28px 26px;
    opacity: 0;
    transition: opacity .3s ease;
  }
  .slide:hover .slide-overlay { opacity: 1; }
  .ov-accent { width: 28px; height: 3px; border-radius: 2px; margin-bottom: 10px; }
  .ov-title {
    font-family: 'Playfair Display', serif;
    font-size: clamp(14px, 1.8vw, 21px);
    font-weight: 700; color: #fff; line-height: 1.2; margin-bottom: 6px;
  }
  .ov-sub { font-size: 13px; color: rgba(255,255,255,.82); line-height: 1.5; }

  /* empty */
  .slide-empty {
    flex: 0 0 calc(50% - 10px);
    border-radius: 6px; border: 2px dashed #E5E7EB;
    aspect-ratio: 16/10;
    display: flex; flex-direction: column;
    align-items: center; justify-content: center;
    gap: 8px; background: #FAFAFA;
  }
  .empty-icon { font-size: 28px; opacity: .3; }
  .empty-txt { font-size: 13px; color: #C4C9D4; font-weight: 500; }

  /* Arrows */
  .carousel-btn {
    position: absolute;
    top: 50%; transform: translateY(-50%);
    z-index: 10;
    width: 46px; height: 46px; border-radius: 50%;
    background: #fff; border: 1px solid #e5e7eb;
    box-shadow: 0 4px 16px rgba(0,0,0,.13);
    display: flex; align-items: center; justify-content: center;
    cursor: pointer; font-size: 22px; color: #111;
    transition: box-shadow .2s, transform .2s;
    line-height: 1;
  }
  .carousel-btn:hover {
    box-shadow: 0 8px 24px rgba(0,0,0,.17);
    transform: translateY(-50%) scale(1.07);
  }
  .carousel-btn:disabled { opacity: .3; cursor: default; transform: translateY(-50%); }
  .carousel-btn-prev { left: 0; }
  .carousel-btn-next { right: 0; }

  /* Dots */
  .carousel-dots {
    display: flex; gap: 7px; justify-content: center; margin-top: 20px;
  }
  .dot {
    width: 7px; height: 7px; border-radius: 50%;
    background: #D1D5DB; border: none; cursor: pointer;
    transition: background .25s, width .25s;
  }
  .dot.active { width: 22px; border-radius: 4px; }

  /* MODAL */
  .modal-bg {
    position: fixed; inset: 0; background: #fff;
    z-index: 9000; display: flex; flex-direction: column;
    animation: bgIn .2s ease; overflow: hidden;
  }
  @keyframes bgIn { from { opacity: 0; } to { opacity: 1; } }
  .modal-bar {
    width: 100%; padding: 14px 28px;
    display: flex; align-items: center; justify-content: space-between;
    border-bottom: 1px solid #F3F4F6; flex-shrink: 0;
  }
  .modal-bar-title {
    font-family: 'Playfair Display', serif;
    font-size: 16px; font-weight: 600; color: #0F0A1E;
  }
  .modal-bar-sub { font-size: 12px; color: #9CA3AF; margin-top: 2px; }
  .modal-close {
    width: 36px; height: 36px; border-radius: 50%;
    background: #F5F3FF; border: 1px solid #DDD6FE;
    color: #4F46E5; font-size: 15px; cursor: pointer;
    display: flex; align-items: center; justify-content: center;
    transition: background .2s, transform .2s;
  }
  .modal-close:hover { background: #EEF2FF; transform: scale(1.1); }
  .modal-scroll {
    overflow-y: auto; padding: 24px 28px 48px;
    flex: 1; max-width: 1100px; width: 100%; align-self: center;
  }
  .modal-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    gap: 14px;
  }
  .mtile {
    border-radius: 12px; overflow: hidden;
    border: 1px solid #F0F0F4;
    box-shadow: 0 2px 8px rgba(0,0,0,.05);
    animation: tileIn .35s ease both;
    transition: transform .24s, box-shadow .24s;
    background: #F9FAFB;
  }
  .mtile:hover { transform: translateY(-4px); box-shadow: 0 12px 28px rgba(0,0,0,.1); }
  @keyframes tileIn { from { opacity:0; transform:scale(.93); } to { opacity:1; transform:scale(1); } }
  .mtile img { width:100%; aspect-ratio:4/3; object-fit:cover; display:block; cursor: zoom-in; }

  /* IMAGE VIEWER (lightbox) */
  .img-viewer-bg {
    position: fixed;
    inset: 0;
    background: rgba(10, 6, 25, .82);
    z-index: 9500;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 28px;
    animation: bgIn .15s ease;
  }
  .img-viewer-card {
    position: relative;
    width: min(1200px, 96vw);
    max-height: 92vh;
    border-radius: 14px;
    overflow: hidden;
    background: rgba(255,255,255,.04);
    border: 1px solid rgba(255,255,255,.12);
    box-shadow: 0 18px 70px rgba(0,0,0,.35);
  }
  .img-viewer-card img {
    display: block;
    width: 100%;
    height: auto;
    max-height: 92vh;
    object-fit: contain;
    cursor: zoom-out;
    background: rgba(0,0,0,.18);
  }
  .img-viewer-close {
    position: absolute;
    top: 10px;
    right: 10px;
    width: 36px;
    height: 36px;
    border-radius: 50%;
    background: rgba(255,255,255,.12);
    border: 1px solid rgba(255,255,255,.22);
    color: #fff;
    font-size: 16px;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    backdrop-filter: blur(8px);
  }
  .img-viewer-close:hover { background: rgba(255,255,255,.18); }

  @media(max-width:640px) {
    .carousel-section { padding: 36px 40px 0; }
    .slide, .slide-empty { flex: 0 0 calc(85% - 10px); }
    .modal-scroll { padding: 16px 14px 36px; }
    .modal-grid { grid-template-columns: repeat(auto-fill,minmax(130px,1fr)); gap:10px; }
  }
`;

export default function Gallery() {
  const total = SECTIONS.length; // 4
  const visible = 2;
  const maxOffset = total - visible; // 2  → offsets: 0, 1, 2

  const [offset, setOffset] = useState(0);
  const [modal, setModal] = useState(null);
  const [activePhoto, setActivePhoto] = useState(null);
  const [paused, setPaused] = useState(false);

  const prev = () => setOffset((o) => Math.max(0, o - 1));
  const next = () => setOffset((o) => Math.min(maxOffset, o + 1));

  useEffect(() => {
    if (paused || modal) return;
    const id = setInterval(() => {
      setOffset((o) => (o >= maxOffset ? 0 : o + 1));
    }, 10000);
    return () => clearInterval(id);
  }, [paused, modal, maxOffset]);

  useEffect(() => {
    const onKeyDown = (e) => {
      if (e.key === "Escape") setActivePhoto(null);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  // Each slide is exactly 50% of the track width + half the gap
  const translateX = `calc(-${offset * 50}% - ${offset * 10}px)`;

  return (
    <>
      <style>{css}</style>
      <div className="root">
        {/* HERO */}
        <div className="hero-wrapper">
          <div className="hero">
            <img
              className="hero-bg"
              src={`${orientationBase}/IMG_5896.jpg`}
              alt="Interns group photo"
            />
            <div className="hero-content">
              <h1>Interns Gallery</h1>
              <div className="hero-quote">
                Explore the journey of our interns
              </div>
            </div>
          </div>
        </div>

        {/* ONE CAROUSEL — 4 sections, 2 visible at a time */}
        <div
          className="carousel-section"
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
        >
          <button
            className="carousel-btn carousel-btn-prev"
            onClick={prev}
            disabled={offset === 0}
            aria-label="Previous"
          >
            ‹
          </button>

          <div className="carousel-outer">
            <div
              className="carousel-track"
              style={{ transform: `translateX(${translateX})` }}
            >
              {SECTIONS.map((sec) =>
                sec.photos.length > 0 ? (
                  <div
                    key={sec.key}
                    className="slide"
                    onClick={() => setModal(sec)}
                  >
                    <img
                      src={src(sec.base, sec.photos[0])}
                      alt={sec.title}
                      loading="lazy"
                    />
                    <div className="slide-overlay">
                      <div
                        className="ov-accent"
                        style={{ background: sec.accent }}
                      />
                      <div className="ov-title">{sec.title}</div>
                      <div className="ov-sub">{sec.sub}</div>
                    </div>
                  </div>
                ) : (
                  <div key={sec.key} className="slide-empty">
                    <span className="empty-icon">🖼️</span>
                    <span className="empty-txt">Photos coming soon</span>
                  </div>
                ),
              )}
            </div>
          </div>

          <button
            className="carousel-btn carousel-btn-next"
            onClick={next}
            disabled={offset >= maxOffset}
            aria-label="Next"
          >
            ›
          </button>

          {/* Dots — 3 positions (0,1,2) */}
          <div className="carousel-dots">
            {Array.from({ length: maxOffset + 1 }).map((_, i) => (
              <button
                key={i}
                className={`dot${offset === i ? " active" : ""}`}
                style={
                  offset === i
                    ? { background: SECTIONS[i * visible]?.accent || "#6366F1" }
                    : {}
                }
                onClick={() => setOffset(i)}
                aria-label={`Position ${i + 1}`}
              />
            ))}
          </div>
        </div>

        {/* MODAL */}
        {modal && (
          <div className="modal-bg">
            <div className="modal-bar">
              <div>
                <div className="modal-bar-title">{modal.title}</div>
                <div className="modal-bar-sub">
                  {modal.photos.length} photo
                  {modal.photos.length !== 1 ? "s" : ""}
                </div>
              </div>
              <button className="modal-close" onClick={() => setModal(null)}>
                ✕
              </button>
            </div>
            <div className="modal-scroll">
              <div className="modal-grid">
                {modal.photos.map((photo, i) => (
                  <div
                    key={photo.name}
                    className="mtile"
                    style={{ animationDelay: `${i * 22}ms` }}
                  >
                    <img
                      src={src(modal.base, photo)}
                      alt={photo.name}
                      loading="lazy"
                      onClick={() => setActivePhoto(src(modal.base, photo))}
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* IMAGE VIEWER */}
        {activePhoto && (
          <div className="img-viewer-bg" onClick={() => setActivePhoto(null)}>
            <div
              className="img-viewer-card"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                className="img-viewer-close"
                onClick={() => setActivePhoto(null)}
                aria-label="Close image"
              >
                ✕
              </button>
              <img
                src={activePhoto}
                alt="Selected"
                onClick={() => setActivePhoto(null)}
              />
            </div>
          </div>
        )}
      </div>
    </>
  );
}
