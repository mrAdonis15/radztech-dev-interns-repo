import { useState } from "react";

const orientationBase = `${process.env.PUBLIC_URL || ""}/ORIENTATION`;
const devsBase = `${process.env.PUBLIC_URL || ""}/Devs`;
const bizBase = `${process.env.PUBLIC_URL || ""}/BD`;
const opsBase = `${process.env.PUBLIC_URL || ""}/OPs`;

// each photo: { name, ext }
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

// helper — builds full src url
const src = (base, photo) => `${base}/${photo.name}.${photo.ext}`;

const SECTIONS = [
  {
    key: "orientation",
    eyebrow: "Orientation",
    title: "Radztech Intern Orientation Batch 11",
    sub: "Relive the moments from our intern orientation day.",
    accent: "#e66a03",
    aBg: "#EEF2FF",
    aBorder: "#DDD6FE",
    aText: "#e66a03",
    photos: orientationPhotos,
    base: orientationBase,
  },
  {
    key: "devteam",
    eyebrow: "Dev Team",
    title: "Development Team",
    sub: "Behind the code — the developers building our future.",
    accent: "#0EA5E9",
    aBg: "#E0F2FE",
    aBorder: "#BAE6FD",
    aText: "#0369A1",
    photos: devTeamPhotos,
    base: devsBase,
  },
  {
    key: "bizdev",
    eyebrow: "Business",
    title: "Business Development",
    sub: "The team driving growth and partnerships.",
    accent: "#10B981",
    aBg: "#D1FAE5",
    aBorder: "#6EE7B7",
    aText: "#065F46",
    photos: businessDevPhotos,
    base: bizBase,
  },
  {
    key: "opsdev",
    eyebrow: "Ops",
    title: "Ops Development",
    sub: "Keeping everything running smoothly behind the scenes.",
    accent: "#F59E0B",
    aBg: "#FEF3C7",
    aBorder: "#FDE68A",
    aText: "#92400E",
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
    max-width: 1200px;
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
    inset: 0;
    width: 100%;
    height: 100%;
    object-fit: cover;
    object-position: center top;
    filter: brightness(0.62);
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
    font-size: 16px;
    color: rgba(255,255,255,.88);
    line-height: 1.8;
    letter-spacing: .01em;
  }

  /* SECTIONS WRAPPER */
  .sections {
    max-width: 1100px;
    margin: 0 auto;
    padding: 48px 28px 0;
    display: flex;
    flex-direction: column;
    gap: 52px;
  }

  /* SINGLE SECTION ROW */
  .sec-row {
    display: grid;
    grid-template-columns: 1fr 1.8fr;
    gap: 32px;
    align-items: center;
  }
  .sec-row:nth-child(even) {
    grid-template-columns: 1.8fr 1fr;
  }
  .sec-row:nth-child(even) .sec-info { order: 2; }
  .sec-row:nth-child(even) .sec-card-wrap { order: 1; }

  /* INFO SIDE */
  .sec-info { display: flex; flex-direction: column; gap: 12px; }
  .eyebrow {
    display: inline-flex; align-items: center; gap: 6px;
    font-size: 11px; font-weight: 700; letter-spacing: .13em;
    text-transform: uppercase; padding: 5px 14px; border-radius: 100px;
    width: fit-content;
  }
  .edot { width: 5px; height: 5px; border-radius: 50%; animation: blink 2s infinite; }
  @keyframes blink { 0%,100%{opacity:1;transform:scale(1);} 50%{opacity:.3;transform:scale(.7);} }
  .sec-title {
    font-family: 'Playfair Display', serif;
    font-size: clamp(24px, 3.5vw, 36px); font-weight: 700; color: #0F0A1E;
    letter-spacing: -.02em; line-height: 1.1;
  }
  .sec-sub { font-size: 14px; color: #6B7280; line-height: 1.6; max-width: 320px; }
  .sec-meta { display: flex; align-items: center; gap: 10px; margin-top: 4px; }
  .sec-count { font-size: 13px; font-weight: 600; color: #374151; }
  .sec-dot-sep { width: 3px; height: 3px; border-radius: 50%; background: #D1D5DB; }
  .sec-click-hint { font-size: 12.5px; color: #9CA3AF; }
  .sec-empty-badge {
    display: inline-flex; align-items: center; gap: 6px;
    background: #F9FAFB; border: 1px solid #E5E7EB;
    color: #9CA3AF; font-size: 12px; font-weight: 600;
    padding: 6px 14px; border-radius: 100px; width: fit-content; margin-top: 4px;
  }

  /* PHOTO CARD */
  .sec-card-wrap { position: relative; }
  .sec-card {
    position: relative; border-radius: 24px; overflow: hidden;
    cursor: pointer; aspect-ratio: 4/3;
    box-shadow: 0 4px 24px rgba(0,0,0,.09);
    border: 1px solid #F0F0F4;
    transition: transform .32s cubic-bezier(.4,0,.2,1), box-shadow .32s;
    animation: riseUp .5s ease both;
    background: #F3F4F6;
    display: block;
  }
  .sec-card:hover {
    transform: translateY(-6px) scale(1.01);
    box-shadow: 0 24px 56px rgba(0,0,0,.13);
  }
  .sec-card img {
    width: 100%; height: 100%; object-fit: cover; display: block;
    transition: transform .5s cubic-bezier(.4,0,.2,1);
  }
  .sec-card:hover img { transform: scale(1.06); }
  @keyframes riseUp { from{opacity:0;transform:translateY(24px);} to{opacity:1;transform:translateY(0);} }

  .card-overlay {
    position: absolute; inset: 0;
    background: linear-gradient(to top,rgba(10,6,25,.55) 0%,rgba(10,6,25,.05) 55%,transparent 100%);
    display: flex; align-items: center; justify-content: center;
    opacity: 0; transition: opacity .28s;
  }
  .sec-card:hover .card-overlay { opacity: 1; }
  .view-pill {
    display: flex; align-items: center; gap: 8px;
    background: rgba(255,255,255,.18);
    border: 1.5px solid rgba(255,255,255,.55);
    backdrop-filter: blur(8px);
    border-radius: 100px; padding: 10px 22px;
    color: #fff; font-size: 13.5px; font-weight: 600;
    letter-spacing: .02em;
    transition: background .2s, transform .2s;
  }
  .sec-card:hover .view-pill { background: rgba(255,255,255,.26); transform: scale(1.04); }

  .count-badge {
    position: absolute; bottom: 16px; right: 16px;
    background: rgba(10,6,25,.55);
    backdrop-filter: blur(6px);
    border: 1px solid rgba(255,255,255,.2);
    border-radius: 100px; padding: 5px 14px;
    color: #fff; font-size: 12px; font-weight: 600;
    letter-spacing: .03em;
  }

  /* empty card */
  .sec-card-empty {
    border-radius: 24px; border: 2px dashed #E5E7EB;
    aspect-ratio: 4/3;
    display: flex; flex-direction: column; align-items: center; justify-content: center;
    gap: 10px; background: #FAFAFA;
  }
  .empty-icon { font-size: 32px; opacity: .35; }
  .empty-txt { font-size: 13px; color: #C4C9D4; font-weight: 500; }

  /* separator */
  .sep { border: none; border-top: 1px solid #F3F4F6; margin: 0; }

  /* MODAL */
  .modal-bg {
    position: fixed; inset: 0; background: #fff;
    z-index: 9000; display: flex; flex-direction: column;
    align-items: center; animation: bgIn .2s ease; overflow: hidden;
  }
  @keyframes bgIn { from{opacity:0;} to{opacity:1;} }

  .modal-bar {
    width: 100%; padding: 14px 28px;
    display: flex; align-items: center; justify-content: space-between;
    border-bottom: 1px solid #F3F4F6; background: #fff;
    flex-shrink: 0; z-index: 10;
  }
  .modal-bar-left { display: flex; align-items: center; gap: 12px; }
  .modal-thumb {
    width: 42px; height: 42px; border-radius: 10px; overflow: hidden;
    border: 2px solid #E0E7FF; flex-shrink: 0;
  }
  .modal-thumb img { width: 100%; height: 100%; object-fit: cover; display: block; }
  .modal-bar-title {
    font-family: 'Playfair Display', serif;
    font-size: 16px; font-weight: 600; color: #0F0A1E;
  }
  .modal-bar-sub { font-size: 12px; color: #9CA3AF; margin-top: 1px; }
  .modal-close {
    width: 36px; height: 36px; border-radius: 50%;
    background: #F5F3FF; border: 1px solid #DDD6FE;
    color: #4F46E5; font-size: 15px; cursor: pointer;
    display: flex; align-items: center; justify-content: center;
    transition: background .2s, transform .2s; flex-shrink: 0;
  }
  .modal-close:hover { background: #EEF2FF; transform: scale(1.1); }

  .modal-scroll {
    width: 100%; max-width: 1100px; overflow-y: auto;
    padding: 24px 28px 48px; flex: 1; align-self: center;
    scrollbar-width: thin; scrollbar-color: #E5E7EB transparent;
  }
  .modal-scroll::-webkit-scrollbar { width: 5px; }
  .modal-scroll::-webkit-scrollbar-thumb { background: #E5E7EB; border-radius: 3px; }

  .modal-label {
    font-size: 11.5px; color: #9CA3AF; font-weight: 700;
    letter-spacing: .1em; text-transform: uppercase; margin-bottom: 18px;
  }
  .modal-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    gap: 14px;
  }
  .mtile {
    border-radius: 14px; overflow: hidden;
    border: 1px solid #F0F0F4;
    box-shadow: 0 2px 8px rgba(0,0,0,.05);
    animation: tileIn .35s ease both;
    transition: transform .24s cubic-bezier(.4,0,.2,1), box-shadow .24s, border-color .2s;
    background: #F9FAFB;
  }
  .mtile:hover { transform: translateY(-4px); box-shadow: 0 12px 28px rgba(0,0,0,.1); border-color: #DDD6FE; }
  @keyframes tileIn { from{opacity:0;transform:scale(.93);} to{opacity:1;transform:scale(1);} }
  .mtile img { width: 100%; aspect-ratio: 4/3; object-fit: cover; display: block; transition: transform .35s; }
  .mtile:hover img { transform: scale(1.05); }
  .mtile img { cursor: zoom-in; }

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

  @media(max-width:700px){
    .hero-wrapper { padding: 20px 16px 0; }
    .sections { padding: 32px 16px 0; gap: 40px; }
    .sec-row,
    .sec-row:nth-child(even) { grid-template-columns: 1fr; }
    .sec-row:nth-child(even) .sec-info { order: 1; }
    .sec-row:nth-child(even) .sec-card-wrap { order: 2; }
    .modal-scroll { padding: 16px 14px 36px; }
    .modal-grid { grid-template-columns: repeat(auto-fill,minmax(140px,1fr)); gap: 10px; }
  }
`;

export default function Gallery() {
  const [modal, setModal] = useState(null);
  const [activePhoto, setActivePhoto] = useState(null);

  const openModal = (section) => setModal({ section });
  const closeModal = () => setModal(null);

  const modalPhotos = modal ? modal.section.photos.slice(1) : [];

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

        {/* SECTIONS */}
        <div className="sections">
          {SECTIONS.map((sec, si) => (
            <div key={sec.key}>
              {si > 0 && <hr className="sep" style={{ marginBottom: 52 }} />}
              <div className="sec-row">
                {/* INFO */}
                <div className="sec-info">
                  <div
                    className="eyebrow"
                    style={{
                      background: sec.aBg,
                      border: `1px solid ${sec.aBorder}`,
                      color: sec.aText,
                    }}
                  >
                    <span className="edot" style={{ background: sec.accent }} />
                    {sec.eyebrow}
                  </div>
                  <div className="sec-title">{sec.title}</div>
                  <div className="sec-sub">{sec.sub}</div>
                  {sec.photos.length > 0 ? (
                    <div className="sec-meta">
                      <span className="sec-count">
                        {sec.photos.length} photos
                      </span>
                      <span className="sec-dot-sep" />
                      <span className="sec-click-hint">
                        Click the image to see all →
                      </span>
                    </div>
                  ) : (
                    <div className="sec-empty-badge">
                      🗂️ No photos yet — coming soon
                    </div>
                  )}
                </div>

                {/* PHOTO CARD */}
                <div className="sec-card-wrap">
                  {sec.photos.length > 0 ? (
                    <div
                      className="sec-card"
                      style={{ animationDelay: `${si * 80}ms` }}
                      onClick={() => openModal(sec)}
                    >
                      <img src={src(sec.base, sec.photos[0])} alt="cover" />
                      <div className="card-overlay">
                        <div className="view-pill">
                          <svg
                            width="16"
                            height="16"
                            viewBox="0 0 24 24"
                            fill="none"
                          >
                            <circle
                              cx="11"
                              cy="11"
                              r="7"
                              stroke="white"
                              strokeWidth="2"
                            />
                            <path
                              d="M16.5 16.5L21 21"
                              stroke="white"
                              strokeWidth="2"
                              strokeLinecap="round"
                            />
                          </svg>
                          View all photos
                        </div>
                      </div>
                      {sec.photos.length > 1 && (
                        <div className="count-badge">
                          +{sec.photos.length - 1} more
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="sec-card-empty">
                      <span className="empty-icon">🖼️</span>
                      <span className="empty-txt">Photos coming soon</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* MODAL */}
        {modal && (
          <div className="modal-bg">
            <div className="modal-bar">
              <div className="modal-bar-left">
                <div className="modal-thumb">
                  <img
                    src={src(modal.section.base, modal.section.photos[0])}
                    alt="thumb"
                  />
                </div>
                <div>
                  <div className="modal-bar-title">{modal.section.title}</div>
                  <div className="modal-bar-sub">
                    {modalPhotos.length} photo
                    {modalPhotos.length !== 1 ? "s" : ""}
                  </div>
                </div>
              </div>
              <button className="modal-close" onClick={closeModal}>
                ✕
              </button>
            </div>

            <div className="modal-scroll">
              <div className="modal-label">{modalPhotos.length} photos</div>
              <div className="modal-grid">
                {modalPhotos.map((photo, i) => (
                  <div
                    key={photo.name}
                    className="mtile"
                    style={{ animationDelay: `${i * 25}ms` }}
                  >
                    <img
                      src={src(modal.section.base, photo)}
                      alt={photo.name}
                      onClick={() =>
                        setActivePhoto(src(modal.section.base, photo))
                      }
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
