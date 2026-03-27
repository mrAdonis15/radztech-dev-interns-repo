import React, { useState, useCallback, useRef } from "react";
import colorCodedBibleVerses from "./bibleColors.js";
import "./bible.css";

function shuffleArray(arr) {
  const shuffled = [...arr];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

export default function BibleVerseApp() {
  const [selectedKey, setSelectedKey] = useState(null);
  const [verseIndex, setVerseIndex] = useState(0);
  const [animKey, setAnimKey] = useState(0);

  const shuffledQueue = useRef([]);
  const queuePos = useRef(0);

  const handleSelect = useCallback((key) => {
    const verses = colorCodedBibleVerses[key].verses;
    const queue = shuffleArray(verses.map((_, i) => i));
    shuffledQueue.current = queue;
    queuePos.current = 0;
    setSelectedKey(key);
    setVerseIndex(queue[0]);
    setAnimKey((prev) => prev + 1);
  }, []);

  const handleNext = useCallback(() => {
    if (!selectedKey) return;
    const verses = colorCodedBibleVerses[selectedKey].verses;

    queuePos.current += 1;

    if (queuePos.current >= shuffledQueue.current.length) {
      const newQueue = shuffleArray(verses.map((_, i) => i));
      shuffledQueue.current = newQueue;
      queuePos.current = 0;
    }

    setVerseIndex(shuffledQueue.current[queuePos.current]);
    setAnimKey((prev) => prev + 1);
  }, [selectedKey]);

  const handleReset = useCallback(() => {
    setSelectedKey(null);
    setVerseIndex(0);
    setAnimKey(0);
    shuffledQueue.current = [];
    queuePos.current = 0;
  }, []);

  const selected = selectedKey ? colorCodedBibleVerses[selectedKey] : null;
  const verse = selected ? selected.verses[verseIndex] : null;

  return (
    <div className="bva-root">
      <div className="bva-container">
        {!selected ? (
          <div className="bva-question-screen">
            <header className="bva-q-header">
              <p className="bva-subtitle">Question</p>
              <h1 className="bva-title">
                <span className="bva-title--black">How are you</span>{" "}
                <span className="bva-title--orange">feeling today?</span>
              </h1>
              <p className="bva-tagline">
                Choose the feeling that matches your heart, and receive a word
                from God.
              </p>
            </header>

            <div className="bva-divider" />

            <div className="bva-right">
              <div className="bva-grid">
                {Object.entries(colorCodedBibleVerses).map(([key, val]) => (
                  <button
                    key={key}
                    className="bva-btn"
                    style={{ "--accent": val.color }}
                    onClick={() => handleSelect(key)}
                    aria-label={val.feeling}
                  >
                    <span className="bva-dot" style={{ background: val.color }} />
                    <span className="bva-emoji">{val.emoji}</span>
                    <span className="bva-label">{val.feeling}</span>
                    <span className="bva-ring" />
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="bva-verse-screen">
            <div className="bva-v-left">
              <button className="bva-back-btn" onClick={handleReset}>
                Choose Again
              </button>
              <header className="bva-v-header">
                <p className="bva-subtitle">Your Answer</p>
                <h1 className="bva-title">
                  <span className="bva-title--black">You are feeling</span>{" "}
                  <span
                    className="bva-title--orange"
                    style={{ color: selected.color }}
                  >
                    {selected.feeling}
                  </span>
                </h1>
                <p className="bva-tagline">
                  You selected "{selected.feeling}". Here is a verse for you.
                </p>
              </header>
            </div>

            <div className="bva-divider" />

            <div className="bva-right">
              <div
                key={animKey}
                className="bva-card"
                style={{ "--accent": selected.color }}
              >
                <div
                  className="bva-card__bar"
                  style={{ background: selected.color }}
                />
                <span className="bva-card__quote">"</span>

                <p className="bva-card__feeling">
                  For when you're feeling{" "}
                  <span style={{ color: selected.color }}>
                    {selected.feeling.toLowerCase()}
                  </span>
                </p>

                <p className="bva-card__text">{verse.text}</p>

                <div className="bva-card__ref-row">
                  <span className="bva-card__reference">{verse.reference}</span>
                  <span className="bva-card__translation">
                    {verse.translation}
                  </span>
                </div>

                <div className="bva-card__footer">
                  <span className="bva-card__counter">
                    {queuePos.current + 1} of {selected.verses.length}
                  </span>
                  <button
                    className="bva-card__next"
                    style={{ background: selected.color }}
                    onClick={handleNext}
                  >
                    More Verse
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}