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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@material-ui/core";
import data from "./data.json";
import React, { useState, useRef } from "react";
import { useForm } from "react-hook-form";
import { makeStyles } from "@material-ui/core/styles";
import JsonDataModal, { isJsonData } from "./modalTable";
import ErrorIcon from "@material-ui/icons/Error";
import SuccessIcon from "@material-ui/icons/CheckCircle";
import ArrowDropDownIcon from "@material-ui/icons/ArrowDropDown";
import TableIcon from "@material-ui/icons/Toc";

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

// Fixed AGR column order: header label → JSON key (same order as required display)
const AGR_COLUMN_ORDER = [
  { header: "Customer", key: "Name" },
  { header: "Address", key: "Address" },
  { header: "Contact Number", key: "profile_contactNo" },
  { header: "Collector", key: "sAccSub2" },
  { header: "Salesman", key: "sAccSub3" },
  { header: "Agent", key: "sAccSub4" },
  { header: "DP", key: "ar_4266" },
  { header: "P", key: "ar_4267" },
  { header: "FC", key: "ar_4268" },
  { header: "Total", key: "ar_total" },
  { header: "OR", key: "sumOR" },
  { header: "OR FC", key: "sumOR_FC" },
  { header: "CM", key: "sumCM" },
  { header: "JV", key: "sumJV" },
  { header: "REPO", key: "sumREPO" },
  { header: "Balance DP", key: "balDetailed_4266" },
  { header: "Balance P", key: "balDetailed_4267" },
  { header: "Balance FC", key: "balDetailed_4268" },
  { header: "Balance Total", key: "balDetailed" },
  { header: "Sked Current", key: "skedCurrent" },
  { header: "Sked Values", key: "skedValues" },
  { header: "Schedule Desc", key: "sked_desc" },
  { header: "Schedule Due Date", key: "sked_date" },
  { header: "Current Due", key: "dueTotal" },
  { header: "Past Due", key: "pastDue" },
  { header: "1 - 30", key: "pastDue30" },
  { header: "31 - 60", key: "pastDue60" },
  { header: "61 - 90", key: "pastDue90" },
  { header: "91 - 120", key: "pastDue120" },
  { header: "121+", key: "pastDueElse" },
  { header: "Collection for the Period", key: "collPeriod" },
  { header: "Current Collection", key: "collCurrent" },
  { header: "Advanced Collection", key: "collAdvance" },
  { header: "Past Due Collection", key: "collPastDue" },
  { header: "Current Collection - Rebate", key: "collRebateCurrent" },
  { header: "Advanced Collection - Rebate", key: "collRebateAdvance" },
  { header: "Pretermination", key: "preterm" },
  { header: "Preterm Past Due", key: "pretermPastDue" },
  { header: "Preterm Rebate", key: "pretermRebate" },
  { header: "End Receivable DP", key: "balEndDetailed_4266" },
  { header: "End Receivable P", key: "balEndDetailed_4267" },
  { header: "End Receivable FC", key: "balEndDetailed_4268" },
  { header: "Total End Receivable", key: "balEndDetailed" },
  { header: "Collected", key: "totalCollection" },
  { header: "Target", key: "target" },
  { header: "Efficiency", key: "efficiency" },
  { header: "Efficiency Notes", key: "eff_notes" },
];

// Map of known column keys to header labels (for getHeaderFromKey / error menu)
const COLUMN_HEADER_LABELS = Object.fromEntries(
  AGR_COLUMN_ORDER.map(({ header, key }) => [key, header])
);

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

// Derive a readable header from a column key
const getHeaderFromKey = (key) => {
  if (!key) return "";
  if (COLUMN_HEADER_LABELS[key]) return COLUMN_HEADER_LABELS[key];
  // Fallback: turn snake_case / camelCase into spaced and capitalized words
  const withSpaces = String(key)
    .replace(/_/g, " ")
    .replace(/([a-z0-9])([A-Z])/g, "$1 $2");
  return withSpaces.replace(/\b\w/g, (c) => c.toUpperCase());
};

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

// Build column definitions: fixed AGR order first, then any extra keys from data.
const buildColumnsFromRows = (rows) => {
  const baseColumns = [
    { header: "No.", key: null, align: "right" },
    ...AGR_COLUMN_ORDER.map(({ header, key }) => ({
      header,
      key,
      align: key ? inferAlignForKey(key, rows || []) : "left",
    })),
  ];

  if (!Array.isArray(rows) || !rows.length) {
    return baseColumns;
  }

  const orderedKeys = new Set(AGR_COLUMN_ORDER.map((c) => c.key).filter(Boolean));
  const extraKeys = [];
  rows.forEach((row) => {
    if (!row || typeof row !== "object") return;
    Object.keys(row).forEach((key) => {
      if (!orderedKeys.has(key) && !extraKeys.includes(key)) {
        extraKeys.push(key);
      }
    });
  });

  return [
    ...baseColumns,
    ...extraKeys.map((key) => ({
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

function getChanges(original, current, getHeaderFromKeyFn) {
  const changes = [];
  const len = Math.max(original?.length ?? 0, current?.length ?? 0);
  for (let i = 0; i < len; i += 1) {
    const o = original?.[i] ?? {};
    const c = current?.[i] ?? {};
    const allKeys = new Set([...Object.keys(o), ...Object.keys(c)]);
    for (const key of allKeys) {
      const ov = o[key];
      const cv = c[key];
      if (JSON.stringify(ov) !== JSON.stringify(cv)) {
        changes.push({
          rowIndex: i,
          rowNumber: i + 1,
          key,
          header: getHeaderFromKeyFn(key),
          oldVal: ov,
          newVal: cv,
        });
      }
    }
  }
  return changes;
}

export function TableAGR() {
  const classes = useStyles();
  // Support both the old API shape (data.items[0].data) and the new JSON shape (data.data)
  const rows =
    (data.items && data.items[0] && data.items[0].data) ||
    (Array.isArray(data.data) ? data.data : []) ||
    [];

  const { setValue, watch } = useForm({
    defaultValues: { errorFocus: null },
  });
  const errorFocus = watch("errorFocus");
  const rowRefs = useRef({});
  const originalRowsRef = useRef(null);
  if (originalRowsRef.current === null && rows.length > 0) {
    originalRowsRef.current = JSON.parse(JSON.stringify(rows));
  }

  //for editable cells po ito
  const [tableData, setTableData] = useState(rows);
  const [editingCell, setEditingCell] = useState(null);

  const [page, setPage] = useState(0);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedData, setSelectedData] = useState(null);
  const [selectedColumnName, setSelectedColumnName] = useState("");
  const [resultModalOpen, setResultModalOpen] = useState(false);
  const [resultJson, setResultJson] = useState("");
  const [resultChanges, setResultChanges] = useState([]);

  const paginatedRows = tableData.slice(
    page * ROWS_PER_PAGE,
    page * ROWS_PER_PAGE + ROWS_PER_PAGE,
  );

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleCellClick = (value, columnName) => {
    if (isJsonData(value)) {
      setSelectedData(value);
      setSelectedColumnName(columnName);
      setModalOpen(true);
    }
  };

  const handleModalClose = () => {
    setModalOpen(false);
    setSelectedData(null);
    setSelectedColumnName("");
  };

  const errorLocations = getErrorLocations(tableData);

  const errorCount = data.count?.error ?? errorLocations.length;
  const okCount = data.count?.ok ?? Math.max(rows.length - errorCount, 0);

  const [errorMenuAnchor, setErrorMenuAnchor] = useState(null);

  const openErrorMenu = (e) => {
    if (errorLocations.length) setErrorMenuAnchor(e.currentTarget);
  };
  const closeErrorMenu = () => setErrorMenuAnchor(null);

  const goToError = (location) => {
    closeErrorMenu();
    const targetPage = Math.floor(location.rowIndex / ROWS_PER_PAGE);
    setPage(targetPage);
    setValue("errorFocus", location);
    requestAnimationFrame(() => {
      setTimeout(() => {
        rowRefs.current[location.rowIndex]?.scrollIntoView({
          block: "nearest",
          behavior: "smooth",
        });
      }, 0);
    });
  };

  const getColumnHeader = (fieldKey) => {
    return getHeaderFromKey(fieldKey);
  };

  //double click function po ito
  const handleCellDoubleClick = (rowIndex, colKey) => {
    if (colKey != null) setEditingCell({ rowIndex, colKey });
  };
  const handleCellEditChange = (rowIndex, colKey, newValue) => {
    setTableData((prev) =>
      prev.map((row, i) =>
        i === rowIndex ? { ...row, [colKey]: newValue } : row,
      ),
    );
  };
  const handleCellEditBlur = () => setEditingCell(null);

  const handleSubmit = () => {
    const original = originalRowsRef.current ?? [];
    const changes = getChanges(original, tableData, getHeaderFromKey);
    setResultChanges(changes);
    const payload = {
      data: tableData,
      dt1: data.dt1 ?? "2025-1-01T00:00:00+08:00",
      dt2: data.dt2 ?? "2025-1-31T23:59:59+08:00",
    };
    setResultJson(JSON.stringify(payload, null, 2));
    setResultModalOpen(true);
  };

  const handleCopyResult = () => {
    navigator.clipboard.writeText(resultJson);
  };

  const handleDownloadResult = () => {
    const blob = new Blob([resultJson], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "data.json";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div
      style={{
        padding: 32,
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        boxSizing: "border-box",
      }}
    >
      <Paper
        elevation={3}
        style={{
          borderRadius: 8,
          overflow: "hidden",
          margin: 0,
          flex: 1,
          minHeight: 0,
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* design ng badge */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            padding: "12px 24px",
            borderBottom: "1px solid #e0e0e0",
            flexShrink: 0,
          }}
        >
          <Chip
            icon={<ErrorIcon style={{ fontSize: 20, color: "#f44336" }} />}
            label={`${errorCount} Error${errorCount !== 1 ? "s" : ""}`}
            onClick={openErrorMenu}
            onDelete={errorLocations.length ? openErrorMenu : undefined}
            deleteIcon={errorLocations.length ? <ArrowDropDownIcon /> : undefined}
            disabled={!errorCount}
            size="small"
            variant="outlined"
            color="secondary"
            style={{
              borderColor: "rgba(244, 67, 54, 0.5)",
              color: "#c62828",
            }}
          />
          <Menu
            anchorEl={errorMenuAnchor}
            open={Boolean(errorMenuAnchor)}
            onClose={closeErrorMenu}
            anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
            transformOrigin={{ vertical: "top", horizontal: "left" }}
            getContentAnchorEl={null}
            PaperProps={{ style: { maxHeight: 320 } }}
          >
            {errorLocations.map((loc, idx) => (
              <MenuItem
                key={`${loc.rowIndex}-${loc.fieldKey}-${idx}`}
                onClick={() => goToError(loc)}
              >
                Row {loc.rowIndex + 1} · {getColumnHeader(loc.fieldKey)} ·{" "}
                {loc.errorType}
                {loc.detail && loc.detail.length
                  ? ` (${loc.detail.join(" vs ")})`
                  : ""}
              </MenuItem>
            ))}
          </Menu>
          <Chip
            icon={<SuccessIcon style={{ fontSize: 20, color: "#4caf50" }} />}
            label={`${okCount} OK`}
            size="small"
            variant="outlined"
            style={{
              borderColor: "rgba(76, 175, 80, 0.5)",
              color: "#2e7d32",
            }}
          />
          <div style={{ marginLeft: "auto" }}>
            <Button
              variant="contained"
              color="primary"
              size="small"
              onClick={handleSubmit}
            >
              Submit
            </Button>
          </div>
        </div>

        <TableContainer
          style={{
            flex: 1,
            minHeight: 0,
            overflow: "auto",
            position: "relative",
            display: "flex",
            flexDirection: "column",
            backgroundColor: "#fff",
            borderTop: "1px solid #e0e0e0",
          }}
        >
          {/* Table na ito */}
          <Table stickyHeader size="small" className={classes.table}>
            <TableHead>
              <TableRow>
                {buildColumnsFromRows(tableData).map((col, i) => (
                  <TableCell
                    key={i}
                    style={headerCellStyle}
                    title={col.header}
                    className={
                      i === 0
                        ? classes.stickyCol0
                        : i === 1
                          ? classes.stickyCol1
                          : undefined
                    }
                  >
                    {col.header}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>

            <TableBody>
              {paginatedRows.map((agr, index) => {
                const rowIndex = page * ROWS_PER_PAGE + index;
                const isOddRow = rowIndex % 2 === 0;

                const isErrorRow =
                  errorFocus && errorFocus.rowIndex === rowIndex;

                return (
                  <TableRow
                    key={rowIndex}
                    ref={(el) => {
                      rowRefs.current[rowIndex] = el;
                    }}
                    style={{
                      backgroundColor: isErrorRow
                        ? "rgba(244, 67, 54, 0.08)"
                        : undefined,
                    }}
                  >
                    {buildColumnsFromRows(tableData).map((col, i) => {
                      const value =
                        col.key === null ? rowIndex + 1 : getCellValue(agr, col.key);

                      const display =
                        col.key === null
                          ? String(rowIndex + 1)
                          : formatCell(value, col.key);

                      const clickable = isJsonData(value);

                      const isEditing =
                        editingCell &&
                        editingCell.rowIndex === rowIndex &&
                        editingCell.colKey === col.key;
                      const canEdit = col.key != null;

                      const isErrorCell =
                        isErrorRow &&
                        errorFocus &&
                        col.key === errorFocus.fieldKey;

                      const openModalFromIcon = (e) => {
                        e.stopPropagation();
                        handleCellClick(value, col.header);
                      };

                      return (
                        <TableCell
                          key={i}
                          className={
                            i === 0
                              ? classes.stickyCol0Body
                              : i === 1
                                ? classes.stickyCol1Body
                                : undefined
                          }
                          style={{
                            ...getBodyCellStyle(col.align),

                            backgroundColor: isErrorCell
                              ? "rgba(244, 67, 54, 0.2)"
                              : isOddRow
                                ? "#fafafa"
                                : "#fff",

                            cursor: canEdit ? "text" : "default",
                            padding: isEditing ? "4px" : "10px",
                          }}
                          onDoubleClick={() =>
                            handleCellDoubleClick(rowIndex, col.key)
                          }
                          title={
                            typeof display === "string"
                              ? display
                              : String(display)
                          }
                        >
                          {isEditing ? (
                            <input
                              autoFocus
                              value={tableData[rowIndex][col.key] ?? ""}
                              onChange={(e) =>
                                handleCellEditChange(
                                  rowIndex,
                                  col.key,
                                  e.target.value,
                                )
                              }
                              onBlur={handleCellEditBlur}
                              onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                  e.target.blur();
                                }
                              }}
                              style={{
                                width: "100%",
                                border: "1px solid #1976d2",
                                borderRadius: 4,
                                padding: "4px 8px",
                                fontSize: "10px",
                                textAlign: col.align,
                                boxSizing: "border-box",
                              }}
                            />
                          ) : clickable ? (
                            <span
                              style={{
                                display: "flex",
                                justifyContent: "center",
                                alignItems: "center",
                                width: "100%",
                              }}
                            >
                              <TableIcon
                                fontSize="small"
                                color="primary"
                                style={{
                                  cursor: "pointer",
                                }}
                                onClick={openModalFromIcon}
                                titleAccess="Expand"
                              />
                              Expand
                            </span>
                          ) : (
                            display
                          )}
                        </TableCell>
                      );
                    })}
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          component="div"
          count={rows.length}
          page={page}
          onPageChange={handleChangePage}
          rowsPerPage={ROWS_PER_PAGE}
          rowsPerPageOptions={[ROWS_PER_PAGE]}
          labelDisplayedRows={({ page, count }) => {
            const totalPages = Math.max(1, Math.ceil(count / ROWS_PER_PAGE));
            return `Page ${page + 1} of ${totalPages}`;
          }}
        />
      </Paper>
      <JsonDataModal
        key={
          modalOpen && selectedData ? JSON.stringify(selectedData) : "closed"
        }
        open={modalOpen}
        onClose={handleModalClose}
        data={selectedData}
        columnName={selectedColumnName}
      />
      <Dialog
        open={resultModalOpen}
        onClose={() => setResultModalOpen(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{ style: { maxHeight: "80vh" } }}
      >
        <DialogTitle>Result – Updated JSON</DialogTitle>
        <DialogContent>
          {resultChanges.length > 0 ? (
            <>
              <div style={{ marginBottom: 16 }}>
                <strong>Napalitan ({resultChanges.length} change{resultChanges.length !== 1 ? "s" : ""})</strong>
              </div>
              <div
                style={{
                  fontSize: 12,
                  background: "#fff8e1",
                  border: "1px solid #ffc107",
                  borderRadius: 8,
                  padding: 12,
                  marginBottom: 16,
                  maxHeight: 200,
                  overflow: "auto",
                }}
              >
                <ul style={{ margin: 0, paddingLeft: 20 }}>
                  {resultChanges.map((ch, idx) => (
                    <li key={`${ch.rowIndex}-${ch.key}-${idx}`} style={{ marginBottom: 6 }}>
                      <strong>Row {ch.rowNumber}</strong> · <strong>{ch.header}</strong>:{" "}
                      <span style={{ color: "#c62828" }}>
                        {ch.oldVal === undefined || ch.oldVal === null || ch.oldVal === ""
                          ? "(empty)"
                          : typeof ch.oldVal === "object"
                            ? JSON.stringify(ch.oldVal)
                            : String(ch.oldVal)}
                      </span>
                      {" → "}
                      <span style={{ color: "#2e7d32" }}>
                        {ch.newVal === undefined || ch.newVal === null || ch.newVal === ""
                          ? "(empty)"
                          : typeof ch.newVal === "object"
                            ? JSON.stringify(ch.newVal)
                            : String(ch.newVal)}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </>
          ) : (
            <div style={{ marginBottom: 16, color: "#666" }}>
              Walang napalitan – same pa rin ang data kumpara sa original.
            </div>
          )}
          <div style={{ marginBottom: 8 }}>
            <strong>Updated JSON</strong>
          </div>
          <pre
            style={{
              fontSize: 12,
              overflow: "auto",
              background: "#f5f5f5",
              padding: 16,
              borderRadius: 8,
              whiteSpace: "pre-wrap",
              wordBreak: "break-all",
            }}
          >
            {resultJson}
          </pre>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCopyResult} color="primary">
            Copy
          </Button>
          <Button onClick={handleDownloadResult} color="primary" variant="contained">
            Download data.json
          </Button>
          <Button onClick={() => setResultModalOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}

export default TableAGR;
