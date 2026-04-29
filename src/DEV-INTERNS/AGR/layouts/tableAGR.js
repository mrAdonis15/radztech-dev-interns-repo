import {
  Table,
  Paper,
  TableContainer,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  TablePagination,
  Chip,
  Menu,
  MenuItem,
  Button,
  IconButton,
  CircularProgress,
  Typography,
} from "@material-ui/core";
import React, { useState, useRef, useCallback } from "react";
import { executeAGR, saveAGR } from "../services/agrService";
import simDataFile from "../data.json";
import { makeStyles } from "@material-ui/core/styles";
import JsonDataModal, { isJsonData } from "./modalTable";
import ErrorIcon from "@material-ui/icons/Error";
import SuccessIcon from "@material-ui/icons/CheckCircle";
import ArrowDropDownIcon from "@material-ui/icons/ArrowDropDown";
import TableIcon from "@material-ui/icons/Toc";
import SaveIcon from "@material-ui/icons/Save";
import AddIcon from "@material-ui/icons/Add";

const useStyles = makeStyles({
  table: {
    tableLayout: "auto",
    width: "100%",
    "& .MuiTableCell-root": {
      borderBottom: "1px solid #e0e0e0",
      overflow: "hidden",
      textOverflow: "ellipsis",
      minWidth: 56,
    },
    "& .MuiTableHead-root": {
      position: "sticky",
      top: 0,
      zIndex: 20,
    },
    "& .MuiTableHead-root .MuiTableRow-root": {
      backgroundColor: "#e8e8e8",
    },
    "& .MuiTableHead-root .MuiTableCell-root": {
      backgroundColor: "#e8e8e8",
      boxShadow: "inset 0 -1px 0 rgba(0,0,0,0.1)",
    },
    "& tbody tr:nth-of-type(odd)": {
      backgroundColor: "#fafafa",
    },
    "& tbody tr:nth-of-type(even)": {
      backgroundColor: "#fff",
    },
  },
  stickyCol0: {
    position: "sticky",
    left: 0,
    zIndex: 21,
    backgroundColor: "#fff !important",
  },
  stickyCol1: {
    position: "sticky",
    left: 52,
    zIndex: 21,
    backgroundColor: "#fff !important",
  },
  stickyCol0Body: {
    position: "sticky",
    left: 0,
  },
  stickyCol1Body: {
    position: "sticky",
    left: 52,
  },
});

const headerCellStyle = {
  fontWeight: 600,
  backgroundColor: "white",
  fontSize: "10px",
  textTransform: "Capitalize",
  letterSpacing: "0.02em",
  textAlign: "center",
  padding: "20px  ",
  whiteSpace: "nowrap",
  lineHeight: 1.3,
  overflow: "hidden",
  textOverflow: "ellipsis",
};

const getBodyCellStyle = (align) => ({
  fontSize: "10px",
  textAlign: align,
  padding: "10px",
  whiteSpace: "nowrap",
  lineHeight: 1.3,
  overflow: "hidden",
  textOverflow: "ellipsis",
});

const formatNumber = (value) => {
  if (value === null || value === undefined || value === "") return "--";
  const num = parseFloat(value);
  if (isNaN(num)) return value;
  return num.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
};

const isNumeric = (value) => {
  if (value === null || value === undefined || value === "") return "--";
  if (typeof value === "boolean") return false;
  const num = parseFloat(value);
  return !isNaN(num) && isFinite(num);
};

//FORMATTINGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGG
const DATE_COLUMN_KEYS = ["dueDate", "jDate", "sked_date"];
const STRING_COLUMN_KEYS = ["sked_desc", "simDescription"];
const PLAIN_NUMBER_COLUMN_KEYS = ["profile_contactNo"];
const PERCENT_COLUMN_KEYS = [
  "sked_percent_4267",
  "sked_percent_4268",
  "sked_percent_4266",
];

// Header = column key as-is (kung ano sa JSON, ganun sa header)
const getHeaderFromKey = (key) => (key ? String(key) : "");

// Infer alignment based on sampled values (numeric => right, otherwise left)
const inferAlignForKey = (key, rows) => {
  if (!key) return "left";
  for (let i = 0; i < rows.length; i += 1) {
    const value = rows[i] && rows[i][key];
    if (value === null || value === undefined || value === "") continue;
    return isNumeric(value) ? "right" : "left";
  }
  return "left";
};

// Build column definitions from data: No. + all keys in order as they appear in JSON.
const buildColumnsFromRows = (rows) => {
  const baseColumns = [{ header: "No.", key: null, align: "right" }];
  if (!Array.isArray(rows) || !rows.length) {
    return baseColumns;
  }
  const seen = new Set();
  const keyOrder = [];
  rows.forEach((row) => {
    if (!row || typeof row !== "object") return;
    Object.keys(row).forEach((key) => {
      if (!seen.has(key)) {
        seen.add(key);
        keyOrder.push(key);
      }
    });
  });
  return [
    ...baseColumns,
    ...keyOrder.map((key) => ({
      header: getHeaderFromKey(key),
      key,
      align: inferAlignForKey(key, rows),
    })),
  ];
};

// Get cell value from row; derive sked_desc / sked_date from skedValues when missing
const getCellValue = (row, key) => {
  if (!key) return undefined;
  const raw = row[key];
  if (raw !== undefined && raw !== null && raw !== "") return raw;
  if (key === "sked_desc" && row.skedValues) {
    const parts = String(row.skedValues).split("|");
    return parts[2] !== undefined ? parts[2].trim() : raw;
  }
  if (key === "sked_date" && row.skedValues) {
    const parts = String(row.skedValues).split("|");
    return parts[0] !== undefined ? parts[0].trim() : raw;
  }
  return raw;
};

const formatDate = (value) => {
  if (value === null || value === undefined || value === "") return "--";
  const d = new Date(value);
  if (isNaN(d.getTime())) return value;
  const hasTime = /T\d{1,2}:/.test(String(value));
  return hasTime
    ? d.toLocaleString(undefined, { dateStyle: "short", timeStyle: "short" })
    : d.toLocaleDateString(undefined, { dateStyle: "short" });
};

const formatCell = (value, colKey) => {
  if (value === null || value === undefined || value === "") return "--";

  // Special handling for pipe-delimited schedule strings like:
  // "2026-02-01|3855.0000|Installment 13 - Feb"
  if (typeof value === "string" && value.includes("|")) {
    const parts = value.split("|").map((p) => p.trim());
    // For skedValues: date | amount | description
    if (colKey === "skedValues") {
      const [date, amount, desc] = parts;
      return [date, amount, desc].filter(Boolean).join(" – ");
    }
    // For skedCurrent: amount | rebate
    if (colKey === "skedCurrent") {
      const [amount, rebate] = parts;
      return [amount, rebate && `Rebate: ${rebate}`]
        .filter(Boolean)
        .join(" – ");
    }
  }

  if (typeof value === "object") return JSON.stringify(value);
  if (typeof value === "boolean") return String(value);
  if (DATE_COLUMN_KEYS.includes(colKey)) return formatDate(value);
  if (STRING_COLUMN_KEYS.includes(colKey)) return String(value);
  if (colKey === "termsDays" && isNumeric(value))
    return String(Number(value)) + " day/s";
  if (PLAIN_NUMBER_COLUMN_KEYS.includes(colKey) && isNumeric(value))
    return String(Number(value));
  if (PERCENT_COLUMN_KEYS.includes(colKey) && isNumeric(value))
    return String(Number(value)) + "%";
  return isNumeric(value) ? formatNumber(value) : value;
};

const PIPE_VALUE_LABELS = {
  skedValues: ["Date", "Amount", "Description"],
  skedCurrent: ["Amount", "Rebate"],
  skedValues_4266: ["Amount", "Rebate", "Balance"],
};

const getPipeValueObject = (value, colKey) => {
  if (typeof value !== "string" || !value.includes("|")) return null;

  const parts = value.split("|").map((part) => part.trim());
  const labels = PIPE_VALUE_LABELS[colKey] || parts.map((_, index) => `Value ${index + 1}`);

  return parts.reduce((acc, part, index) => {
    acc[labels[index] || `Value ${index + 1}`] = part || "--";
    return acc;
  }, {});
};

const ROWS_PER_PAGE = 20;

/**
 * From the JSON row data, get all locations where an error occurs.
 * Each row may have an `errors` object with keys like "not-equal", "gt", "lt", "startswith", etc.
 * Each of those has an object of fieldKey -> detail (e.g. [actual, expected]).
 * Returns array of { rowIndex, fieldKey, errorType, detail }.
 */
function getErrorLocations(rows) {
  if (!Array.isArray(rows)) return [];
  const locations = [];
  rows.forEach((row, rowIndex) => {
    const errors = row && row.errors;
    if (!errors || typeof errors !== "object") return;
    const errorTypes = ["not-equal", "gt", "gte", "lt", "lte", "startswith"];
    errorTypes.forEach((errorType) => {
      const fields = errors[errorType];
      if (!fields || typeof fields !== "object") return;
      Object.entries(fields).forEach(([fieldKey, detail]) => {
        if (detail !== undefined && detail !== null) {
          locations.push({
            rowIndex,
            fieldKey,
            errorType,
            detail: Array.isArray(detail) ? detail : [detail],
          });
        }
      });
    });
  });
  return locations;
}

function valueMatchesExpected(currentVal, expectedVal) {
  if (expectedVal === undefined || expectedVal === null) return false;
  if (currentVal === expectedVal) return true;
  if (typeof expectedVal === "number" && Number.isFinite(expectedVal)) {
    const n = Number(currentVal);
    return !Number.isNaN(n) && n === expectedVal;
  }
  return String(currentVal).trim() === String(expectedVal).trim();
}

// Coerce string numbers to numbers so backend comparison (e.g. expected_output) matches; some errors stay because of strict ===.
function coerceNumericStrings(obj) {
  if (obj === null || obj === undefined) return obj;
  if (Array.isArray(obj)) return obj.map((item) => coerceNumericStrings(item));
  if (typeof obj === "object") {
    const out = {};
    for (const key of Object.keys(obj)) {
      out[key] = coerceNumericStrings(obj[key]);
    }
    return out;
  }
  if (typeof obj === "string") {
    const trimmed = obj.trim();
    if (trimmed === "") return obj;
    const num = Number(trimmed);
    if (!Number.isNaN(num) && Number.isFinite(num)) return num;
    return obj;
  }
  return obj;
}

// Normalize execute API response: { items: [{ data, dt1, dt2 }], count } -> { rows, dt1, dt2, count }
function normalizeReportPayload(raw) {
  if (!raw || typeof raw !== "object") return { rows: [], dt1: null, dt2: null, count: null };
  const data = raw;
  const firstItem = Array.isArray(data.items) && data.items[0] ? data.items[0] : null;
  const rows = firstItem && Array.isArray(firstItem.data)
    ? firstItem.data
    : Array.isArray(data.data)
      ? data.data
      : [];
  return {
    rows,
    dt1: firstItem?.dt1 ?? data.dt1 ?? "2025-1-01T00:00:00+08:00",
    dt2: firstItem?.dt2 ?? data.dt2 ?? "2025-1-31T23:59:59+08:00",
    count: data.count ?? null,
  };
}

const DEFAULT_DT1 = "2025-1-01T00:00:00+08:00";
const DEFAULT_DT2 = "2025-1-31T23:59:59+08:00";

export function TableAGR() {
  const classes = useStyles();

  const fileSimData = simDataFile?.values?.kvs?.sim_data;
  // ——— Execute section: read-only table (result after clicking Run) ———
  const [executeLoading, setExecuteLoading] = useState(false);
  const [executeError, setExecuteError] = useState(null);
  const [reportMeta, setReportMeta] = useState({
    dt1: fileSimData?.dt1 ?? DEFAULT_DT1,
    dt2: fileSimData?.dt2 ?? DEFAULT_DT2,
  });
  const [executeRows, setExecuteRows] = useState([]);
  const [executePage, setExecutePage] = useState(0);
  const [hasExecutedOnce, setHasExecutedOnce] = useState(false);

  const loadExecute = useCallback(async () => {
    setHasExecutedOnce(true);
    setExecuteLoading(true);
    setExecuteError(null);
    setErrorFocusSave(null);
    setErrorFocusExecute(null);
    try {
      const { status, data: resData } = await executeAGR({
        dt1: reportMeta.dt1,
        dt2: reportMeta.dt2,
      });
      if (status >= 200 && status < 300) {
        // API returns { items: [{ data, dt1, dt2 }], count }; some servers wrap in .data
        const payload = resData && typeof resData === "object" && resData.data != null ? resData.data : resData;
        const normalized = normalizeReportPayload(payload);
        setExecuteRows(Array.isArray(normalized.rows) ? normalized.rows : []);
        setReportMeta((m) => ({
          ...m,
          dt1: normalized.dt1 ?? m.dt1,
          dt2: normalized.dt2 ?? m.dt2,
          count: normalized.count ?? m.count,
        }));
      } else {
        const msg = resData?.message || resData?.error || (typeof resData === "string" ? resData : null) || `Request failed (${status})`;
        setExecuteError(msg);
        setExecuteRows([]);
      }
    } catch (err) {
      setExecuteError(err.message || "Failed to load AGR data");
      setExecuteRows([]);
    } finally {
      setExecuteLoading(false);
    }
  }, [reportMeta.dt1, reportMeta.dt2]);

  const executePaginated = executeRows.slice(
    executePage * ROWS_PER_PAGE,
    executePage * ROWS_PER_PAGE + ROWS_PER_PAGE,
  );

  // ——— Save section: initial data from static file; load from endpoint via "Load saved" ———
  const [saveTableData, setSaveTableData] = useState(() =>
    Array.isArray(fileSimData?.data) ? JSON.parse(JSON.stringify(fileSimData.data)) : []
  );
  const saveOriginalRef = useRef(null);
  if (saveOriginalRef.current === null && saveTableData.length > 0) {
    saveOriginalRef.current = JSON.parse(JSON.stringify(saveTableData));
  }
  const [savePage, setSavePage] = useState(0);
  const [editingCell, setEditingCell] = useState(null);
  const [saveStatus, setSaveStatus] = useState(null);
  const [saving, setSaving] = useState(false);

  const savePaginated = saveTableData.slice(
    savePage * ROWS_PER_PAGE,
    savePage * ROWS_PER_PAGE + ROWS_PER_PAGE,
  );

  const [errorFocusExecute, setErrorFocusExecute] = useState(null);
  const [errorFocusSave, setErrorFocusSave] = useState(null);
  const executeRowRefs = useRef({});
  const saveRowRefs = useRef({});
  const saveTableSectionRef = useRef(null);
  const executeTableSectionRef = useRef(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedData, setSelectedData] = useState(null);
  const [selectedColumnName, setSelectedColumnName] = useState("");
  const [errorMenuAnchorExecute, setErrorMenuAnchorExecute] = useState(null);

  const saveData = {
    dt1: reportMeta.dt1,
    dt2: reportMeta.dt2,
    count: reportMeta.count ?? {},
  };
  const errorLocationsExecute = getErrorLocations(executeRows);
  const errorCountExecute = reportMeta.count?.error ?? errorLocationsExecute.length;
  const okCountExecute = reportMeta.count?.ok ?? Math.max(executeRows.length - errorCountExecute, 0);

  const handleExecutePageChange = (event, newPage) => setExecutePage(newPage);
  const handleSavePageChange = (event, newPage) => setSavePage(newPage);

  const handleCellClick = (value, columnName) => {
    const parsedPipeValue = getPipeValueObject(value, columnName);
    const modalData = isJsonData(value) ? value : parsedPipeValue;
    if (modalData) {
      setSelectedData(modalData);
      setSelectedColumnName(columnName);
      setModalOpen(true);
    }
  };

  const handleModalClose = () => {
    setModalOpen(false);
    setSelectedData(null);
    setSelectedColumnName("");
  };

  const openErrorMenuExecute = (e) => {
    if (errorLocationsExecute.length) setErrorMenuAnchorExecute(e.currentTarget);
  };
  const closeErrorMenuExecute = () => setErrorMenuAnchorExecute(null);

  const goToErrorInResultTable = (location) => {
    closeErrorMenuExecute();
    setErrorFocusExecute({
      rowIndex: location.rowIndex,
      fieldKey: location.fieldKey,
      errorType: location.errorType,
      detail: location.detail,
    });
    const targetExecutePage = Math.floor(location.rowIndex / ROWS_PER_PAGE);
    setExecutePage(targetExecutePage);
    requestAnimationFrame(() => {
      setTimeout(() => {
        executeTableSectionRef.current?.scrollIntoView({ block: "start", behavior: "smooth" });
        setTimeout(() => {
          executeRowRefs.current[location.rowIndex]?.scrollIntoView({ block: "nearest", behavior: "smooth" });
        }, 300);
      }, 0);
    });
  };

  const getColumnHeader = (fieldKey) => {
    return getHeaderFromKey(fieldKey);
  };

  const handleCellDoubleClick = (rowIndex, colKey) => {
    if (colKey != null) setEditingCell({ rowIndex, colKey });
  };
  const handleCellEditChange = (rowIndex, colKey, newValue) => {
    setSaveTableData((prev) =>
      prev.map((row, i) =>
        i === rowIndex ? { ...row, [colKey]: newValue } : row,
      ),
    );
  };
  const handleCellEditBlur = () => setEditingCell(null);

  const handleAddSaveRow = () => {
    const keys = buildColumnsFromRows(saveTableData)
      .map((col) => col.key)
      .filter((key) => key != null);
    const nextRow = keys.reduce((row, key) => ({ ...row, [key]: "" }), {});
    const nextIndex = saveTableData.length;

    setSaveTableData((prev) => [...prev, nextRow]);
    setSavePage(Math.floor(nextIndex / ROWS_PER_PAGE));
    setEditingCell(keys.length ? { rowIndex: nextIndex, colKey: keys[0] } : null);
    setSaveStatus(null);
  };

  const handleSaveSubmit = async () => {
    const dataCoerced = coerceNumericStrings(JSON.parse(JSON.stringify(saveTableData)));
    const payload = {
      data: dataCoerced,
      dt1: saveData.dt1 ?? "2025-1-01T00:00:00+08:00",
      dt2: saveData.dt2 ?? "2025-1-31T23:59:59+08:00",
    };
    setSaveStatus(null);
    setSaving(true);
    try {
      const { status, data: saveRes, text } = await saveAGR(payload);
      if (status >= 200 && status < 300) {
        setSaveStatus({ ok: true, message: "Saved successfully." });
        saveOriginalRef.current = JSON.parse(JSON.stringify(saveTableData));
        setErrorFocusSave(null);
      } else {
        const msg = (saveRes && (saveRes.message || saveRes.error)) || text || `Save failed (${status})`;
        setSaveStatus({ ok: false, message: msg });
      }
    } catch (err) {
      setSaveStatus({ ok: false, message: err.message || "Failed to save." });
    } finally {
      setSaving(false);
    }
  };

  const renderExecuteRow = (agr, index) => {
    const rowIndex = executePage * ROWS_PER_PAGE + index;
    const isOddRow = rowIndex % 2 === 0;
    const isErrorRow = errorFocusExecute && errorFocusExecute.rowIndex === rowIndex;
    return (
      <TableRow
        key={rowIndex}
        ref={(el) => { executeRowRefs.current[rowIndex] = el; }}
        style={{ backgroundColor: isErrorRow ? "#ffcdd2" : undefined }}
      >
        {buildColumnsFromRows(executeRows).map((col, i) => {
          const value = col.key === null ? rowIndex + 1 : getCellValue(agr, col.key);
          const display = col.key === null ? String(rowIndex + 1) : formatCell(value, col.key);
          const parsedPipeValue = getPipeValueObject(value, col.key);
          const clickable = isJsonData(value) || Boolean(parsedPipeValue);
          const isErrorCell = isErrorRow && errorFocusExecute && col.key === errorFocusExecute.fieldKey;
          const expectedVal = isErrorCell && errorFocusExecute.detail && errorFocusExecute.detail.length >= 2
            ? errorFocusExecute.detail[1]
            : isErrorCell && errorFocusExecute.detail && errorFocusExecute.detail.length === 1
              ? errorFocusExecute.detail[0]
              : null;
          const expectedDisplay = expectedVal !== null && expectedVal !== undefined
            ? (typeof expectedVal === "object" ? JSON.stringify(expectedVal) : String(expectedVal))
            : "";
          const openModalFromIcon = (e) => {
            e.stopPropagation();
            handleCellClick(value, col.header);
          };
          return (
            <TableCell
              key={i}
              className={i === 0 ? classes.stickyCol0Body : i === 1 ? classes.stickyCol1Body : undefined}
              style={{
                ...getBodyCellStyle(col.align),
                backgroundColor: isErrorCell ? "#ef9a9a" : isOddRow ? "#fafafa" : "#fff",
                verticalAlign: isErrorCell && expectedDisplay ? "top" : undefined,
              }}
              title={isErrorCell && expectedDisplay ? `Expected: ${expectedDisplay}` : (typeof display === "string" ? display : String(display))}
            >
              {clickable ? (
                <span style={{ display: "flex", justifyContent: "center", alignItems: "center", width: "100%" }}>
                  <TableIcon fontSize="small" color="primary" style={{ cursor: "pointer" }} onClick={openModalFromIcon} titleAccess="Expand" />
                  Expand
                </span>
              ) : (
                <>
                  {display}
                  {isErrorCell && expectedDisplay && (
                    <div style={{ fontSize: "9px", color: "#c62828", marginTop: 4, fontWeight: 600 }}>
                      Expected: {expectedDisplay.length > 40 ? expectedDisplay.slice(0, 40) + "…" : expectedDisplay}
                    </div>
                  )}
                </>
              )}
            </TableCell>
          );
        })}
      </TableRow>
    );
  };

  const renderSaveRow = (agr, index) => {
    const rowIndex = savePage * ROWS_PER_PAGE + index;
    const isOddRow = rowIndex % 2 === 0;
    const isErrorRow = errorFocusSave && errorFocusSave.rowIndex === rowIndex;
    const expectedForRow = isErrorRow && errorFocusSave?.detail?.length >= 2 ? errorFocusSave.detail[1] : null;
    const rowIsCorrect = isErrorRow && expectedForRow != null && valueMatchesExpected(getCellValue(agr, errorFocusSave?.fieldKey), expectedForRow);
    const rowBg = rowIsCorrect ? "#c8e6c9" : isErrorRow ? "#ffcdd2" : isOddRow ? "#fafafa" : "#fff";
    return (
      <TableRow
        key={rowIndex}
        ref={(el) => { saveRowRefs.current[rowIndex] = el; }}
        style={{ backgroundColor: rowBg }}
      >
        {buildColumnsFromRows(saveTableData).map((col, i) => {
          const value = col.key === null ? rowIndex + 1 : getCellValue(agr, col.key);
          const display = col.key === null ? String(rowIndex + 1) : formatCell(value, col.key);
          const parsedPipeValue = getPipeValueObject(value, col.key);
          const clickable = isJsonData(value) || Boolean(parsedPipeValue);
          const isEditing = editingCell && editingCell.rowIndex === rowIndex && editingCell.colKey === col.key;
          const canEdit = col.key != null;
          const cellIsError = isErrorRow && errorFocusSave && col.key === errorFocusSave.fieldKey;
          const expectedVal = cellIsError && errorFocusSave.detail && errorFocusSave.detail.length >= 2
            ? errorFocusSave.detail[1]
            : cellIsError && errorFocusSave.detail && errorFocusSave.detail.length === 1
              ? errorFocusSave.detail[0]
              : null;
          const expectedDisplay = expectedVal !== null && expectedVal !== undefined
            ? (typeof expectedVal === "object" ? JSON.stringify(expectedVal) : String(expectedVal))
            : "";
          const cellIsCorrect = cellIsError && expectedVal != null && valueMatchesExpected(value, expectedVal);
          const openModalFromIcon = (e) => { e.stopPropagation(); handleCellClick(value, col.header); };
          const cellBg = rowIsCorrect
            ? "#a5d6a7"
            : cellIsCorrect
              ? "#a5d6a7"
              : cellIsError
                ? "#ef9a9a"
                : isErrorRow
                  ? "#ffcdd2"
                  : isOddRow
                    ? "#fafafa"
                    : "#fff";
          return (
            <TableCell
              key={i}
              className={i === 0 ? classes.stickyCol0Body : i === 1 ? classes.stickyCol1Body : undefined}
              style={{
                ...getBodyCellStyle(col.align),
                backgroundColor: cellBg,
                cursor: canEdit ? "text" : "default",
                padding: isEditing ? "4px" : "10px",
                verticalAlign: "top",
              }}
              onDoubleClick={() => handleCellDoubleClick(rowIndex, col.key)}
              title={cellIsError && expectedDisplay ? `Expected: ${expectedDisplay}` : (typeof display === "string" ? display : String(display))}
            >
              {isEditing ? (
                <>
                  <input
                    autoFocus
                    value={saveTableData[rowIndex][col.key] ?? ""}
                    onChange={(e) => handleCellEditChange(rowIndex, col.key, e.target.value)}
                    onBlur={handleCellEditBlur}
                    onKeyDown={(e) => { if (e.key === "Enter") e.target.blur(); }}
                    style={{ width: "100%", border: "1px solid #1976d2", borderRadius: 4, padding: "4px 8px", fontSize: "10px", textAlign: col.align, boxSizing: "border-box" }}
                  />
                  {(cellIsError || cellIsCorrect) && expectedDisplay && (
                    <div style={{ fontSize: "9px", color: cellIsCorrect ? "#2e7d32" : "#c62828", marginTop: 4, fontWeight: 600 }}>
                      Expected: {expectedDisplay.length > 50 ? expectedDisplay.slice(0, 50) + "…" : expectedDisplay}
                    </div>
                  )}
                </>
              ) : clickable ? (
                <span style={{ display: "flex", justifyContent: "center", alignItems: "center", width: "100%" }}>
                  <TableIcon fontSize="small" color="primary" style={{ cursor: "pointer" }} onClick={openModalFromIcon} titleAccess="Expand" />
                  Expand
                </span>
              ) : (
                <>
                  {display}
                  {(cellIsError || cellIsCorrect) && expectedDisplay && (
                    <div style={{ fontSize: "9px", color: cellIsCorrect ? "#2e7d32" : "#c62828", marginTop: 4, fontWeight: 600 }}>
                      Expected: {expectedDisplay.length > 40 ? expectedDisplay.slice(0, 40) + "…" : expectedDisplay}
                    </div>
                  )}
                </>
              )}
            </TableCell>
          );
        })}
      </TableRow>
    );
  };

  return (
    <div style={{ padding: "12px 16px", flex: 1, minHeight: 0, display: "flex", flexDirection: "column", boxSizing: "border-box", alignItems: "center", overflow: "hidden" }}>
      <Typography variant="h2" style={{ marginTop: 10, padding: "10px", fontWeight: 600, marginBottom: 12, flexShrink: 0, fontFamily: "Poppins", width: "100%", maxWidth: 1600, fontSize: "1.5rem" }}>AGR Simulator</Typography>
      <div style={{ display: "flex", flexDirection: "row", gap: 16, width: "100%", maxWidth: 1600, margin: "0 auto", flex: 1, minHeight: 0, overflow: "hidden" }}>
      {/* ——— 1. Save table ——— */}
      <Paper ref={saveTableSectionRef} elevation={3} style={{ borderRadius: 8, overflow: "hidden", flex: 1, minWidth: 0, minHeight: 0, height: "100%", display: "flex", flexDirection: "column", position: "relative" }}>
        <div style={{ display: "flex", alignItems: "center", padding: "8px 16px", borderBottom: "1px solid #e0e0e0", flexShrink: 0 }}>
          <Typography variant="subtitle1" style={{ fontWeight: 600, fontSize: "0.95rem" }}>Save</Typography>
          {saveStatus && (
            <Typography variant="body2" style={{ marginLeft: 16, color: saveStatus.ok ? "#2e7d32" : "#c62828" }}>
              {saveStatus.ok ? "✓ " : "✗ "}{saveStatus.message}
            </Typography>
          )}
          <div style={{ marginLeft: "auto", display: "flex", gap: 8, alignItems: "center" }}>
            <IconButton color="primary" onClick={handleAddSaveRow} title="Add row" aria-label="Add row">
              <AddIcon />
            </IconButton>
            <IconButton color="primary" onClick={handleSaveSubmit} disabled={saving || saveTableData.length === 0} title={saving ? "Saving…" : "Save"}>
              {saving ? <CircularProgress size={24} color="inherit" /> : <SaveIcon />}
            </IconButton>
            <Button variant="contained" color="primary" size="small" onClick={loadExecute} disabled={executeLoading}>
              {executeLoading ? "Executing…" : "Execute"}
            </Button>
          </div>
        </div>
        <TableContainer style={{ flex: 1, minHeight: 0, overflow: "auto", backgroundColor: "#fff", borderTop: "1px solid #e0e0e0" }}>
          <Table stickyHeader size="small" className={classes.table}>
            <TableHead>
              <TableRow>
                {buildColumnsFromRows(saveTableData).map((col, i) => (
                  <TableCell key={i} style={headerCellStyle} title={col.header} className={i === 0 ? classes.stickyCol0 : i === 1 ? classes.stickyCol1 : undefined}>
                    {col.header}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>{savePaginated.map((agr, index) => renderSaveRow(agr, index))}</TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          component="div"
          count={saveTableData.length}
          page={savePage}
          onPageChange={handleSavePageChange}
          rowsPerPage={ROWS_PER_PAGE}
          rowsPerPageOptions={[ROWS_PER_PAGE]}
          labelDisplayedRows={({ page, count }) => `Page ${page + 1} of ${Math.max(1, Math.ceil(count / ROWS_PER_PAGE))}`}
        />
      </Paper>

      {/* ——— 2. Execute (result) ——— */}
      <Paper ref={executeTableSectionRef} elevation={3} style={{ borderRadius: 8, overflow: "hidden", flex: 1, minWidth: 0, minHeight: 0, height: "100%", display: "flex", flexDirection: "column", position: "relative" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "19px 16px", borderBottom: "1px solid #e0e0e0", flexShrink: 0 }}>
          <Typography variant="subtitle1" style={{ fontWeight: 600, fontSize: "0.95rem" }}>Result</Typography>
          <Chip
            icon={<ErrorIcon style={{ fontSize: 20, color: "#f44336" }} />}
            label={`${errorCountExecute} Error${errorCountExecute !== 1 ? "s" : ""}`}
            onClick={openErrorMenuExecute}
            onDelete={errorLocationsExecute.length ? openErrorMenuExecute : undefined}
            deleteIcon={errorLocationsExecute.length ? <ArrowDropDownIcon /> : undefined}
            disabled={!errorCountExecute}
            size="small"
            variant="outlined"
            color="secondary"
            style={{ borderColor: "rgba(244, 67, 54, 0.5)", color: "#c62828" }}
          />
          <Menu anchorEl={errorMenuAnchorExecute} open={Boolean(errorMenuAnchorExecute)} onClose={closeErrorMenuExecute} anchorOrigin={{ vertical: "bottom", horizontal: "left" }} transformOrigin={{ vertical: "top", horizontal: "left" }} getContentAnchorEl={null} PaperProps={{ style: { maxHeight: 320 } }}>
            {errorLocationsExecute.map((loc, idx) => (
              <MenuItem key={`${loc.rowIndex}-${loc.fieldKey}-${idx}`} onClick={() => goToErrorInResultTable(loc)}>
                Row {loc.rowIndex + 1} · {getColumnHeader(loc.fieldKey)} · {loc.errorType}
                {loc.detail && loc.detail.length ? ` (${loc.detail.join(" vs ")})` : ""}
              </MenuItem>
            ))}
          </Menu>
          <Chip icon={<SuccessIcon style={{ fontSize: 20, color: "#4caf50" }} />} label={`${okCountExecute} OK`} size="small" variant="outlined" style={{ borderColor: "rgba(76, 175, 80, 0.5)", color: "#2e7d32" }} />
        </div>
        {executeError && (
          <div style={{ padding: "8px 24px", background: "#ffebee", color: "#c62828", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
            <Typography variant="body2">{executeError}</Typography>
            <Button size="small" color="primary" onClick={loadExecute}>Retry</Button>
          </div>
        )}
        {executeLoading && (
          <div style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(255,255,255,0.7)", zIndex: 10 }}>
            <CircularProgress />
          </div>
        )}
        {!hasExecutedOnce ? (
          <div style={{ flex: 1, minHeight: 0, display: "flex", alignItems: "center", justifyContent: "center", backgroundColor: "white", color: "#757575" }}>
            <Typography variant="body2">Click Execute to see results</Typography>
          </div>
        ) : (
          <>
            <TableContainer style={{ flex: 1, minHeight: 0, overflow: "auto", backgroundColor: "#fff", borderTop: "1px solid #e0e0e0" }}>
              <Table stickyHeader size="small" className={classes.table}>
                <TableHead>
                  <TableRow>
                    {buildColumnsFromRows(executeRows).map((col, i) => (
                      <TableCell key={i} style={headerCellStyle} title={col.header} className={i === 0 ? classes.stickyCol0 : i === 1 ? classes.stickyCol1 : undefined}>
                        {col.header}
                      </TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>{executePaginated.map((agr, index) => renderExecuteRow(agr, index))}</TableBody>
              </Table>
            </TableContainer>
            <TablePagination
              component="div"
              count={executeRows.length}
              page={executePage}
              onPageChange={handleExecutePageChange}
              rowsPerPage={ROWS_PER_PAGE}
              rowsPerPageOptions={[ROWS_PER_PAGE]}
              labelDisplayedRows={({ page, count }) => `Page ${page + 1} of ${Math.max(1, Math.ceil(count / ROWS_PER_PAGE))}`}
            />
          </>
        )}
      </Paper>
      </div>

      <JsonDataModal
        key={
          modalOpen && selectedData ? JSON.stringify(selectedData) : "closed"
        }
        open={modalOpen}
        onClose={handleModalClose}
        data={selectedData}
        columnName={selectedColumnName}
      />
    </div>
  );
}

export default TableAGR;
