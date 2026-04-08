import React from "react";
import ReactPlayer from "react-player";

export default function TutorialPlayer({ onClose, url }) {
  return (
    <div className="tutorial-player-overlay" onClick={onClose}>
      <div className="tutorial-player" onClick={(e) => e.stopPropagation()}>
        <ReactPlayer url={url} controls />
      </div>
    </div>
  );
}
