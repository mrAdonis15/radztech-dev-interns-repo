import React, { useState } from "react";
import {
  Box,
  Button,
  TextField,
  Typography,
  Paper,
} from "@material-ui/core";
import CodeIcon from "@material-ui/icons/Code";
import GetAppIcon from "@material-ui/icons/GetApp";
import ClearIcon from "@material-ui/icons/Clear";
import { formatSql } from "./sqlFormatterUtils";
import "./SqlFormatter.css";

const PLACEHOLDER = ``;

export default function SqlFormatter() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");

  const handleFormat = () => {
    const sql = input.trim() || PLACEHOLDER;
    setOutput(formatSql(sql));  
  };

  const handleClear = () => {
    setInput("");
    setOutput("");
  };

  const handleCopy = () => {
    const text = output || input;
    if (text && navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text);
    }
  };

  return (
    <Box className="sql-formatter-root">
      <Paper className="sql-formatter-panel" elevation={0}>
        <div className="sql-formatter-header">
          <CodeIcon style={{ color: "#f57c00", fontSize: 28 }} />
          <Typography className="sql-formatter-title" variant="h6">
            SQL Formatter
          </Typography>
        </div>

        <div className="sql-formatter-body">
          <div className="sql-formatter-section">
            <Typography className="sql-formatter-label">Input SQL</Typography>
            <TextField
              className="sql-formatter-textarea"
              multiline
              rows={6}
              fullWidth
              variant="outlined"
              placeholder={PLACEHOLDER}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              InputProps={{
                style: { fontFamily: "Poppins, sans-serif" },
              }}
            />
          </div>

          <div className="sql-formatter-actions">
            <Button
              className="sql-formatter-button"
              variant="contained"
              onClick={handleFormat}
            >
              Format
            </Button>
            <Button
              variant="outlined"
              className="sql-formatter-button-outline"
              onClick={handleCopy}
              startIcon={<GetAppIcon />}
            >
              Copy
            </Button>
            <Button
              variant="outlined"
              className="sql-formatter-button-outline"
              onClick={handleClear}
              startIcon={<ClearIcon />}
            >
              Clear
            </Button>
          </div>

          <div className="sql-formatter-section">
            <Typography className="sql-formatter-label">Formatted SQL</Typography>
            <TextField
              className="sql-formatter-textarea"
              multiline
              rows={8}
              fullWidth
              variant="outlined"
              placeholder="Formatted output will appear here..."
              value={output}
              onChange={(e) => setOutput(e.target.value)}
              InputProps={{
                readOnly: false,
                style: { fontFamily: "Poppins, sans-serif" },
              }}
            />
          </div>
        </div>
      </Paper>
    </Box>
  );
}
