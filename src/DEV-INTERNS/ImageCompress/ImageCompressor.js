import React, { useState, useCallback } from "react";
import {
  Button,
  Slider,
  Typography,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  IconButton,
} from "@material-ui/core";
import CloudUploadIcon from "@material-ui/icons/CloudUpload";
import GetAppIcon from "@material-ui/icons/GetApp";
import RefreshIcon from "@material-ui/icons/Refresh";
import DeleteIcon from "@material-ui/icons/Delete";
import {
  compressImage,
  formatFileSize,
  downloadBlob,
} from "./compressorUtils";
import "./ImageCompressor.css";

const ACCEPT_TYPES = "image/jpeg,image/png,image/webp";

export default function ImageCompressor() {
  const [files, setFiles] = useState([]);
  const [results, setResults] = useState({});
  const [loading, setLoading] = useState(false);
  const [quality, setQuality] = useState(0.8);
  const [maxWidth, setMaxWidth] = useState(1920);
  const [dragActive, setDragActive] = useState(false);
  const [outputFormat, setOutputFormat] = useState("original");
  const [loadingFileId, setLoadingFileId] = useState(null);
  const fileInputRef = React.useRef(null);

  const reset = useCallback(() => {
    files.forEach((file) => {
      if (results[file.id]?.url) {
        URL.revokeObjectURL(results[file.id].url);
      }
    });
    setFiles([]);
    setResults({});
    setQuality(0.8);
    setMaxWidth(1920);
    setOutputFormat("original");
  }, [files, results]);

  const handleFileSelect = useCallback(
    (selectedFiles) => {
      if (!selectedFiles || selectedFiles.length === 0) return;
      
      const newFiles = [];
      for (let i = 0; i < selectedFiles.length; i++) {
        const file = selectedFiles[i];
        if (file?.type.startsWith("image/")) {
          const fileId = `${file.name}-${Date.now()}-${i}`;
          newFiles.push({
            id: fileId,
            file,
            originalUrl: URL.createObjectURL(file),
          });
        }
      }
      setFiles((prev) => [...prev, ...newFiles]);
    },
    []
  );

  const handleDrop = useCallback(
    (e) => {
      e.preventDefault();
      setDragActive(false);
      const selectedFiles = e.dataTransfer?.files;
      if (selectedFiles) handleFileSelect(selectedFiles);
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

  const removeFile = useCallback((fileId) => {
    setFiles((prev) => prev.filter((f) => f.id !== fileId));
    setResults((prev) => {
      const newResults = { ...prev };
      if (newResults[fileId]?.url) {
        URL.revokeObjectURL(newResults[fileId].url);
      }
      delete newResults[fileId];
      return newResults;
    });
  }, []);

  const handleCompress = useCallback(async (fileId) => {
    const fileItem = files.find((f) => f.id === fileId);
    if (!fileItem) return;

    setLoadingFileId(fileId);
    try {
      const res = await compressImage(fileItem.file, {
        quality,
        maxWidth: maxWidth || undefined,
        outputFormat,
      });
      setResults((prev) => ({
        ...prev,
        [fileId]: res,
      }));
    } catch (err) {
      console.error("Compress error:", err);
    } finally {
      setLoadingFileId(null);
    }
  }, [files, quality, maxWidth, outputFormat]);

  const compressAll = useCallback(async () => {
    setLoading(true);
    try {
      for (const fileItem of files) {
        await handleCompress(fileItem.id);
      }
    } finally {
      setLoading(false);
    }
  }, [files, handleCompress]);

  const handleDownload = useCallback((fileId) => {
    const result = results[fileId];
    const fileItem = files.find((f) => f.id === fileId);
    if (!result?.blob || !fileItem) return;

    const originalName = fileItem.file.name;
    const baseName = originalName.replace(/\.[^.]+$/, "");
    
    // Get extension based on output format
    let finalName = originalName;
    if (outputFormat === "png") {
      finalName = `${baseName}.png`;
    } else if (outputFormat === "jpeg") {
      finalName = `${baseName}.jpg`;
    }

    // Download with the final name
    downloadBlob(result.blob, finalName);
  }, [results, files, outputFormat]);

  return (
    <div className="image-compress-root">
      <div className="image-compress-container">
        <header className="image-compress-header">
          <h1>Image Compressor & Converter</h1>
          <p>Reduce file size while keeping good quality. Supports JPEG, PNG & WebP. Upload multiple images!</p>
        </header>

        <div
          className={`image-compress-dropzone ${dragActive ? "active" : ""} ${
            files.length > 0 ? "has-file" : ""
          }`}
          onClick={() => fileInputRef.current?.click()}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
        >
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept={ACCEPT_TYPES}
            onChange={(e) => handleFileSelect(e.target.files)}
            style={{ display: "none" }}
          />
          <div className="image-compress-dropzone-icon">
            <CloudUploadIcon style={{ fontSize: 48, color: "#ff7504" }} />
          </div>
          <div className="image-compress-dropzone-text">
            {files.length > 0 
              ? `${files.length} file(s) selected` 
              : "Drop images or click to browse"}
          </div>
          <div className="image-compress-dropzone-hint">
            {files.length > 0 ? "Click to add more files" : "JPEG, PNG, WebP"}
          </div>
        </div>

        {files.length > 0 && (
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

              <div className="image-compress-slider-row">
                <FormControl style={{ minWidth: "200px" }}>
                  <InputLabel id="format-select-label">Output Format</InputLabel>
                  <Select
                    labelId="format-select-label"
                    id="format-select"
                    value={outputFormat}
                    onChange={(e) => setOutputFormat(e.target.value)}
                  >
                    <MenuItem value="original">Keep Original Format</MenuItem>
                    <MenuItem value="jpeg">Convert to JPEG</MenuItem>
                    <MenuItem value="png">Convert to PNG</MenuItem>
                  </Select>
                </FormControl>
              </div>

              <div className="image-compress-actions">
                <Button
                  className="image-compress-btn image-compress-btn-primary"
                  onClick={compressAll}
                  disabled={loading || loadingFileId !== null}
                  startIcon={
                    loading ? (
                      <CircularProgress size={18} color="inherit" />
                    ) : (
                      <RefreshIcon />
                    )
                  }
                >
                  {loading ? "Compressing…" : "Compress All"}
                </Button>
                <Button
                  className="image-compress-btn image-compress-btn-outline"
                  onClick={reset}
                >
                  Clear All
                </Button>
              </div>
            </div>

            <div className="image-compress-files-list">
              {files.map((fileItem) => {
                const result = results[fileItem.id];
                const savingsPercent =
                  result && fileItem
                    ? Math.round(
                        (1 - result.compressedSize / fileItem.file.size) * 100
                      )
                    : null;

                return (
                  <div key={fileItem.id} className="image-compress-file-item">
                    <div className="image-compress-file-header">
                      <div className="image-compress-file-name">
                        {fileItem.file.name}
                      </div>
                      <IconButton
                        size="small"
                        onClick={() => removeFile(fileItem.id)}
                        className="image-compress-file-delete"
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </div>

                    <div className="image-compress-preview">
                      <div className="image-compress-preview-card original">
                        <div className="image-compress-preview-card-header">
                          Original
                        </div>
                        <div className="image-compress-preview-image-wrap">
                          <img
                            src={fileItem.originalUrl}
                            alt="Original"
                            className="image-compress-preview-image"
                          />
                        </div>
                        <div className="image-compress-preview-meta">
                          {formatFileSize(fileItem.file.size)}
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
                              Click Compress or Compress All
                            </Typography>
                          )}
                        </div>
                        <div className="image-compress-preview-meta">
                          {result ? (
                            <>
                              <div>
                                {formatFileSize(result.compressedSize)} •{" "}
                                {result.width} × {result.height}
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
                      </div>
                    </div>

                    <div className="image-compress-file-actions">
                      <Button
                        className="image-compress-btn image-compress-btn-primary"
                        onClick={() => handleCompress(fileItem.id)}
                        disabled={loadingFileId === fileItem.id}
                        startIcon={
                          loadingFileId === fileItem.id ? (
                            <CircularProgress size={18} color="inherit" />
                          ) : (
                            <RefreshIcon />
                          )
                        }
                      >
                        {loadingFileId === fileItem.id
                          ? "Compressing…"
                          : "Compress"}
                      </Button>
                      {result && (
                        <Button
                          className="image-compress-btn image-compress-btn-primary"
                          startIcon={<GetAppIcon />}
                          onClick={() => handleDownload(fileItem.id)}
                        >
                          Download
                        </Button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
