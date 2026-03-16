import React, { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  TableContainer,
} from "@material-ui/core";

const headerCellStyle = {
  fontWeight: 600,
  backgroundColor: "#e8e8e8",
  fontSize: "11px",
  textTransform: "capitalized",
  letterSpacing: "0.02em",
  textAlign: "center",
  padding: "8px 6px",
  whiteSpace: "nowrap",
  lineHeight: 1.3,
  overflow: "hidden",
  textOverflow: "ellipsis",
};

const getBodyCellStyle = (align) => ({
  fontSize: "12px",
  textAlign: align,
  padding: "6px 8px",
  whiteSpace: "nowrap",
  lineHeight: 1.3,
  overflow: "hidden",
  textOverflow: "ellipsis",
  minWidth: 56,
  verticalAlign: "middle",
});

const isJsonData = (value) => {
  return typeof value === "object" && value !== null;
};

const isNumeric = (value) => {
  if (typeof value === "number") return true;
  if (typeof value === "string" && value.trim() !== "") {
    return !isNaN(value);
  }
  return false;
};

const formatNumber = (value) => {
  const number = Number(value);
  return number.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
};

const JsonDataModal = ({ open, onClose, data, columnName, label }) => {
  const isData = isJsonData(data);

  // Editable values: copy of data. Parent should pass key so modal remounts when open/data changes.
  const [editedData, setEditedData] = useState(() =>
    isData
      ? Array.isArray(data)
        ? [...data]
        : { ...data }
      : Array.isArray(data)
        ? []
        : {}
  );

  // Which value cell is being edited: { keyOrIndex, isArray } or null.
  const [editingCell, setEditingCell] = useState(null);

  const getAlignment = (value) => {
    return isNumeric(value) ? "right" : "left";
  };

  const COLUMNS = {
    _balDP: "Bal DP",
    ar_total: "AR Total",
    collCurrent: "Coll Current",
    dueCurrent: "Due Current",
    eff_denominator: "Eff Denominator",
    eff_numerator: "Eff Numerator",
    sked_rebate: "Sked Rebate",
    dueTotalOrig: "Due Total Orig",
    dueTotal: "Due Total",
    pastDue: "Past Due",
    collRebate: "Coll Rebate",
    sked_desc: "Sked Desc",
    collPastDue: "Coll Past Due",
    dueCurrentSked: "Due Current Sked",
    collAdvance: "Coll Advance",
  };

  const getLabel = (key) => {
    if (label) return label(key);
    return COLUMNS[key] || key;
  };

  const handleValueChange = (keyOrIndex, newVal) => {
    setEditedData((prev) => {
      if (Array.isArray(prev)) {
        const next = [...prev];
        const parsed = parseValue(newVal);
        next[keyOrIndex] = parsed;
        return next;
      }
      const next = { ...prev };
      const parsed = parseValue(newVal);
      next[keyOrIndex] = parsed;
      return next;
    });
  };

  const parseValue = (str) => {
    if (str.trim() === "") return str;
    if (!isNaN(str) && str.trim() !== "") return Number(str);
    if (str === "true") return true;
    if (str === "false") return false;
    try {
      return JSON.parse(str);
    } catch {
      return str;
    }
  };

  const getEditableValue = (value) => {
    if (typeof value === "object" && value !== null) return JSON.stringify(value);
    return String(value);
  };

  // Formatted display when not editing (retain number/date formatting).
  const renderFormattedValue = (value) => {
    if (value === null || value === undefined) return "--";
    if (typeof value === "object") return JSON.stringify(value);
    if (typeof value === "boolean") return String(value);
    if (isNumeric(value)) return formatNumber(value);
    return String(value);
  };

  const isEditing = (keyOrIndex, isArray) => {
    if (!editingCell) return false;
    return editingCell.isArray === isArray && editingCell.keyOrIndex === keyOrIndex;
  };

  const handleEditBlur = () => setEditingCell(null);

  if (!isData) return null;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        style: { maxHeight: "80vh" },
      }}
    >
      <DialogTitle>
        {columnName ? columnName : "JSON Data"}
      </DialogTitle>

      <DialogContent style={{ padding: 30 }}>
        <TableContainer style={{ maxHeight: "60vh" }}>
          <Table size="small" stickyHeader style={{ tableLayout: "fixed", width: "100%", borderRadius: 4, border: "1px solid #ddd" }}>
            <TableHead>
              <TableRow>
                {Array.isArray(editedData)
                  ? editedData.map((_, index) => (
                      <TableCell key={index} style={headerCellStyle}>
                        {index}
                      </TableCell>
                    ))
                  : Object.keys(editedData).map((key) => (
                      <TableCell key={key} style={headerCellStyle}>
                        {getLabel(key)}
                      </TableCell>
                    ))}
              </TableRow>
            </TableHead>

            <TableBody>
              {Array.isArray(editedData) ? (
                <TableRow>
                  {editedData.map((item, index) => {
                    const editing = isEditing(index, true);
                    return (
                      <TableCell
                        key={index}
                        style={getBodyCellStyle(getAlignment(item))}
                        padding="none"
                        onDoubleClick={() => setEditingCell({ keyOrIndex: index, isArray: true })}
                      >
                        {editing ? (
                          <input
                            autoFocus
                            value={getEditableValue(item)}
                            onChange={(e) =>
                              handleValueChange(index, e.target.value)
                            }
                            onBlur={handleEditBlur}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") e.target.blur();
                            }}
                            style={{
                              width: "100%",
                              minWidth: 0,
                              outline: "1px solid #1976d2",
                              outlineOffset: -1,
                              border: "none",
                              borderRadius: 4,
                              padding: "6px 8px",
                              fontSize: "12px",
                              lineHeight: 1.3,
                              minHeight: 28,
                              textAlign: getAlignment(item),
                              boxSizing: "border-box",
                            }}
                          />
                        ) : (
                          <span style={{ padding: "6px 8px", display: "block", minHeight: 28, boxSizing: "border-box" }}>
                            {renderFormattedValue(item)}
                          </span>
                        )}
                      </TableCell>
                    );
                  })}
                </TableRow>
              ) : (
                <TableRow>
                  {Object.entries(editedData).map(([key, value]) => {
                    const editing = isEditing(key, false);
                    return (
                      <TableCell
                        key={key}
                        style={getBodyCellStyle(getAlignment(value))}
                        padding="none"
                        onDoubleClick={() => setEditingCell({ keyOrIndex: key, isArray: false })}
                      >
                        {editing ? (
                          <input
                            autoFocus
                            value={getEditableValue(value)}
                            onChange={(e) =>
                              handleValueChange(key, e.target.value)
                            }
                            onBlur={handleEditBlur}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") e.target.blur();
                            }}
                            style={{
                              width: "100%",
                              minWidth: 0,
                              outline: "1px solid #1976d2",
                              outlineOffset: -1,
                              border: "none",
                              borderRadius: 4,
                              padding: "6px 8px",
                              fontSize: "12px",
                              lineHeight: 1.3,
                              minHeight: 28,
                              textAlign: getAlignment(value),
                              boxSizing: "border-box",
                            }}
                          />
                        ) : (
                          <span style={{ padding: "6px 8px", display: "block", minHeight: 28, boxSizing: "border-box" }}>
                            {renderFormattedValue(value)}
                          </span>
                        )}
                      </TableCell>
                    );
                  })}
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose} color="primary">
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default JsonDataModal;
export { isJsonData };