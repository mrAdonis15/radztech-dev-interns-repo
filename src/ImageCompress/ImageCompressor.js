import React, { useState, useCallback } from "react";
import {
  Button,
  Slider,
  Typography,
  CircularProgress,
} from "@material-ui/core";
import CloudUploadIcon from "@material-ui/icons/CloudUpload";
import GetAppIcon from "@material-ui/icons/GetApp";
import RefreshIcon from "@material-ui/icons/Refresh";
import {
  compressImage,
  formatFileSize,
  downloadBlob,
} from "./compressorUtils";
import "src/ImageCompress/ImageCompressor.css";

const ACCEPT_TYPES = "image/jpeg,image/png,image/webp";

export default function ImageCompressor() {
  const [file, setFile] = useState(null);
  const [originalUrl, setOriginalUrl] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [quality, setQuality] = useState(0.8);
  const [maxWidth, setMaxWidth] = useState(1920);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = React.useRef(null);

  const reset = useCallback(() => {
    if (originalUrl) URL.revokeObjectURL(originalUrl);
    if (result?.url) URL.revokeObjectURL(result.url);
    setFile(null);
    setOriginalUrl(null);
    setResult(null);
    setQuality(0.8);
    setMaxWidth(1920);
  }, [originalUrl, result?.url]);

  const handleFileSelect = useCallback(
    (selectedFile) => {
      if (!selectedFile?.type.startsWith("image/")) return;
      reset();
      setFile(selectedFile);
      setOriginalUrl(URL.createObjectURL(selectedFile));
      setResult(null);
    },
    [reset]
  );

  const handleDrop = useCallback(
    (e) => {
      e.preventDefault();
      setDragActive(false);
      const f = e.dataTransfer?.files?.[0];
      if (f) handleFileSelect(f);
    },
    [handleFileSelect]
  );

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    setDragActive(true);
  }, []);

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    setDragActive(false);
  }, []);

  const handleCompress = useCallback(async () => {
    if (!file) return;
    setLoading(true);
    try {
      const res = await compressImage(file, {
        quality,
        maxWidth: maxWidth || undefined,
      });
      setResult(res);
    } catch (err) {
      console.error("Compress error:", err);
    } finally {
      setLoading(false);
    }
  }, [file, quality, maxWidth]);

  const handleDownload = useCallback(() => {
    if (!result?.blob || !file) return;
    const ext = file.name.split(".").pop();
    const base = file.name.replace(/\.[^.]+$/, "");
    const name = `${base}-compressed.${ext}`;
    downloadBlob(result.blob, name);
  }, [result, file]);

  const savingsPercent =
    result && file
      ? Math.round((1 - result.compressedSize / file.size) * 100)
      : null;

  return (
    <div className="image-compress-root">
      <div className="image-compress-container">
        <header className="image-compress-header">
          <h1>Image Compressor</h1>
          <p>Reduce file size while keeping good quality. Supports JPEG & PNG.</p>
        </header>

        <div
          className={`image-compress-dropzone ${dragActive ? "active" : ""} ${
            file ? "has-file" : ""
          }`}
          onClick={() => fileInputRef.current?.click()}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept={ACCEPT_TYPES}
            onChange={(e) => handleFileSelect(e.target.files?.[0])}
            style={{ display: "none" }}
          />
          <div className="image-compress-dropzone-icon">
            <CloudUploadIcon style={{ fontSize: 48, color: "#ff7504" }} />
          </div>
          <div className="image-compress-dropzone-text">
            {file ? file.name : "Drop an image or click to browse"}
          </div>
          <div className="image-compress-dropzone-hint">
            {file ? "Click to change file" : "JPEG, PNG, WebP"}
          </div>
        </div>

        {file && (
          <>
            <div className="image-compress-controls">
              <div className="image-compress-controls-title">
                Compression settings
              </div>

              <div className="image-compress-slider-row">
                <div className="image-compress-slider-label">
                  <span>Quality</span>
                  <span>{Math.round(quality * 100)}%</span>
                </div>
                <Slider
                  value={quality}
                  min={0.1}
                  max={1}
                  step={0.05}
                  onChange={(_, v) => setQuality(v)}
                  valueLabelDisplay="auto"
                  valueLabelFormat={(v) => `${Math.round(v * 100)}%`}
                />
              </div>

              <div className="image-compress-slider-row">
                <div className="image-compress-slider-label">
                  <span>Max width (px)</span>
                  <span>{maxWidth || "Original"}</span>
                </div>
                <Slider
                  value={maxWidth}
                  min={320}
                  max={3840}
                  step={160}
                  onChange={(_, v) => setMaxWidth(v)}
                  valueLabelDisplay="auto"
                />
              </div>

              <div className="image-compress-actions">
                <Button
                  className="image-compress-btn image-compress-btn-primary"
                  onClick={handleCompress}
                  disabled={loading}
                  startIcon={
                    loading ? (
                      <CircularProgress size={18} color="inherit" />
                    ) : (
                      <RefreshIcon />
                    )
                  }
                >
                  {loading ? "Compressing…" : "Compress"}
                </Button>
                <Button
                  className="image-compress-btn image-compress-btn-outline"
                  onClick={reset}
                >
                  Choose another
                </Button>
              </div>
            </div>

            <div className="image-compress-preview">
              <div className="image-compress-preview-card original">
                <div className="image-compress-preview-card-header">
                  Original
                </div>
                <div className="image-compress-preview-image-wrap">
                  <img
                    src={originalUrl}
                    alt="Original"
                    className="image-compress-preview-image"
                  />
                </div>
                <div className="image-compress-preview-meta">
                  {formatFileSize(file.size)}
                </div>
              </div>

              <div className="image-compress-preview-card compressed">
                <div className="image-compress-preview-card-header">
                  Compressed
                </div>
                <div className="image-compress-preview-image-wrap">
                  {result ? (
                    <img
                      src={result.url}
                      alt="Compressed"
                      className="image-compress-preview-image"
                    />
                  ) : (
                    <Typography variant="body2" color="textSecondary">
                      Click Compress to see result
                    </Typography>
                  )}
                </div>
                <div className="image-compress-preview-meta">
                  {result ? (
                    <>
                      <div>
                        {formatFileSize(result.compressedSize)} • {result.width} × {result.height}
                      </div>
                      {savingsPercent !== null && (
                        <span
                          className={`image-compress-savings ${
                            savingsPercent < 0 ? "larger" : ""
                          }`}
                        >
                          {savingsPercent >= 0
                            ? `↓ ${savingsPercent}% smaller`
                            : `↑ ${-savingsPercent}% larger`}
                        </span>
                      )}
                    </>
                  ) : (
                    "—"
                  )}
                </div>
                {result && (
                  <div style={{ padding: "0 16px 16px" }}>
                    <Button
                      className="image-compress-btn image-compress-btn-primary"
                      fullWidth
                      startIcon={<GetAppIcon />}
                      onClick={handleDownload}
                    >
                      Download
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
