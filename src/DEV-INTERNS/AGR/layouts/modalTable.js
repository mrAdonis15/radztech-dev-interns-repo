import React, { useState } from "react";
import { makeStyles, useTheme } from "@material-ui/core/styles";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Switch,
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

const useStyles = makeStyles((theme) => ({
  toggleSwitchBase: {
    color: theme.palette.primary.main,
    "&$toggleChecked": {
      color: theme.palette.primary.main,
    },
    "&$toggleChecked + $toggleTrack": {
      backgroundColor: theme.palette.primary.main,
      opacity: 0.35,
    },
  },
  toggleChecked: {},
  toggleTrack: {
    backgroundColor: theme.palette.primary.main,
    opacity: 0.35,
  },
}));

const JsonDataModal = ({ open, onClose, data, columnName, label }) => {
  const classes = useStyles();
  const theme = useTheme();
  const isData = isJsonData(data);
  const isArrayData = Array.isArray(data);

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
  const [showKeyValueColumns, setShowKeyValueColumns] = useState(false);

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
  // Helper: for known pipe-delimited fields, return array of key-value pairs
  const parsePipeDelimited = (key, value) => {
    if (typeof value !== 'string' || !value.includes('|')) return null;
    // Define default keys for known fields
    const pipeKeyMap = {
      skedValues: ['Date', 'Amount', 'Description'],
      skedCurrent: ['Amount', 'Rebate'],
      skedValues_4266: ['Amount1', 'Amount2', 'Amount3'],
      skedValues_4267: ['Amount1', 'Amount2', 'Amount3'],
      skedValues_4268: ['Amount1', 'Amount2', 'Amount3'],
    };
    const keys = pipeKeyMap[key] || Array(value.split('|').length).fill('').map((_, i) => `Value ${i+1}`);
    const parts = value.split('|').map((v) => v.trim());
    return keys.map((k, i) => [k, parts[i] !== undefined ? parts[i] : '']);
  };

  const renderPipeTable = (key, value) => {
    const pairs = parsePipeDelimited(key, value);
    if (!pairs) return null;
    return (
      <Table size="small" style={{ margin: '8px 0', width: '100%' }}>
        <TableBody>
          {pairs.map(([k, v], idx) => (
            <TableRow key={idx}>
              <TableCell style={headerCellStyle}>{k}</TableCell>
              <TableCell style={getBodyCellStyle('left')}>{v}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    );
  };

  // Formatted display when not editing (retain number/date formatting).
  const renderFormattedValue = (value, key) => {
    if (value === null || value === undefined) return "--";
    if (typeof value === "object") return JSON.stringify(value);
    if (typeof value === "boolean") return String(value);
    if (isNumeric(value)) return formatNumber(value);
    // If pipe-delimited, show as key-value table
    if (typeof value === 'string' && value.includes('|')) {
      return renderPipeTable(key, value) || String(value);
    }
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
      PaperProps={{
        style: {
          width: 900,
          height: 600,
          maxWidth: 900,
          maxHeight: 600,
        },
      }}
    >
      <DialogTitle>
        {columnName ? columnName : "JSON Data"}
      </DialogTitle>

      <DialogContent style={{ padding: 30, height: "100%", boxSizing: "border-box" }}>
        {!isArrayData && (
          <div style={{ display: "flex", justifyContent: "flex-end", alignItems: "center", gap: 10, marginBottom: 12 }}>
            <span style={{ fontSize: "13px", fontWeight: 600, color: theme.palette.primary.main, fontFamily: "Poppins" }}>
              Key | Value
            </span>
            <Switch
              color="primary"
              checked={showKeyValueColumns}
              onChange={(e) => setShowKeyValueColumns(e.target.checked)}
              classes={{
                switchBase: classes.toggleSwitchBase,
                checked: classes.toggleChecked,
                track: classes.toggleTrack,
              }}
            />
            <span style={{ fontSize: "13px", fontWeight: 600, color: theme.palette.primary.main, fontFamily: "Poppins" }}>
              Key / Value
            </span>
          </div>
        )}
        <TableContainer style={{ height: "calc(100% - 52px)" }}>
          <Table size="small" stickyHeader style={{ tableLayout: "fixed", width: "100%", borderRadius: 4, border: "1px solid #ddd" }}>
            {isArrayData || showKeyValueColumns ? (
              <>
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
                                {renderFormattedValue(item, index)}
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
                                {renderFormattedValue(value, key)}
                              </span>
                            )}
                          </TableCell>
                        );
                      })}
                    </TableRow>
                  )}
                </TableBody>
              </>
            ) : (
              <>
                <TableHead>
                  <TableRow>
                    <TableCell style={headerCellStyle}>Key</TableCell>
                    <TableCell style={headerCellStyle}>Value</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {Object.entries(editedData).map(([key, value]) => {
                    const editing = isEditing(key, false);
                    return (
                      <TableRow key={key}>
                        <TableCell style={getBodyCellStyle("center")}>
                          {getLabel(key)}
                        </TableCell>
                        <TableCell
                          style={getBodyCellStyle("center")}
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
                                textAlign: "center",
                                boxSizing: "border-box",
                              }}
                            />
                          ) : (
                            <span style={{ padding: "6px 8px", display: "block", minHeight: 28, boxSizing: "border-box" }}>
                              {renderFormattedValue(value, key)}
                            </span>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </>
            )}
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
