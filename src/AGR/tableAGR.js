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

const COLUMNS = [
  { header: "No.", key: null, align: "right" },
  { header: "Name", key: "Name", align: "left" },
  { header: "AR 4266", key: "ar_4266", align: "right" },
  { header: "AR 4267", key: "ar_4267", align: "right" },
  { header: "AR 4268", key: "ar_4268", align: "right" },
  { header: "AR TOTAL", key: "ar_total", align: "right" },
  { header: "Bal Detailed", key: "balDetailed", align: "right" },
  { header: "Bal Detailed 4266", key: "balDetailed_4266", align: "right" },
  { header: "Bal Detailed 4267", key: "balDetailed_4267", align: "right" },
  { header: "Bal Detailed 4268", key: "balDetailed_4268", align: "right" },
  { header: "Coll Current", key: "collCurrent", align: "right" },
  { header: "Due Date", key: "dueDate", align: "left" },
  { header: "Due Total", key: "dueTotal", align: "right" },
  { header: "Date", key: "jDate", align: "left" },
  { header: "Sim Description", key: "simDescription", align: "left" },
  { header: "Terms Days", key: "termsDays", align: "right" },
  { header: "Sked Current 4266", key: "sked_current_4266", align: "right" },
  { header: "Sked Percent 4266", key: "sked_percent_4266", align: "right" },
  { header: "Sked Total 4266", key: "sked_total_4266", align: "right" },
  { header: "Sked Current 4268", key: "sked_current_4268", align: "right" },
  { header: "Sked Percent 4268", key: "sked_percent_4268", align: "right" },
  { header: "Sked Total 4268", key: "sked_total_4268", align: "right" },
  { header: "Sked Current 4267", key: "sked_current_4267", align: "right" },
  { header: "Sked Percent 4267", key: "sked_percent_4267", align: "right" },
  { header: "Sked Total 4267", key: "sked_total_4267", align: "right" },
  { header: "Sked Desc", key: "sked_desc", align: "left" },
  { header: "Sked Date", key: "sked_date", align: "left" },
  { header: "Sked Total", key: "sked_total", align: "right" },
  { header: "Due Current Sked", key: "dueCurrentSked", align: "right" },
  { header: "Coll Period", key: "collPeriod", align: "right" },
  { header: "Sked Rebate", key: "sked_rebate", align: "right" },
  { header: "Due Current", key: "dueCurrent", align: "right" },
  { header: "GAC", key: "gac", align: "left" },
  { header: "Bal DP", key: "_balDP", align: "right" },
  { header: "Past Due", key: "pastDue", align: "right" },
  { header: "Coll Past Due", key: "collPastDue", align: "right" },
  { header: "Coll Advance", key: "collAdvance", align: "right" },
  { header: "Coll Rebate Current", key: "collRebateCurrent", align: "right" },
  { header: "Coll Rebate Advance", key: "collRebateAdvance", align: "right" },
  { header: "Bal Ending", key: "balEnding", align: "right" },
  { header: "Orig Coll Values", key: "origCollValues", align: "left" },
  { header: "Past Due 30", key: "pastDue30", align: "right" },
  { header: "Past Due 60", key: "pastDue60", align: "right" },
  { header: "Past Due 90", key: "pastDue90", align: "right" },
  { header: "Past Due 120", key: "pastDue120", align: "right" },
  { header: "Past Due Else", key: "pastDueElse", align: "right" },
  { header: "Total Collection", key: "totalCollection", align: "right" },
  { header: "Eff Numerator", key: "eff_numerator", align: "right" },
  { header: "Eff Denominator", key: "eff_denominator", align: "right" },
  { header: "Expected Output", key: "expected_output", align: "left" },
  { header: "Expected Output GT", key: "expected_output_gt", align: "left" },
  { header: "Expected Output LT", key: "expected_output_lt", align: "left" },
  {
    header: "Expected Output Starts With",
    key: "expected_output_startswith",
    align: "left",
  },
  { header: "Eff Notes", key: "eff_notes", align: "left" },
  { header: "Errors", key: "errors", align: "left" },
  { header: "Warnings", key: "warnings", align: "left" },
  { header: "Result", key: "result", align: "left" },
];

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
const PLAIN_NUMBER_COLUMN_KEYS = [];
const PERCENT_COLUMN_KEYS = [
  "sked_percent_4267",
  "sked_percent_4268",
  "sked_percent_4266",
];

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

export function TableAGR() {
  const classes = useStyles();
  const rows =
    data.items && data.items[0] && data.items[0].data ? data.items[0].data : [];

  const { setValue, watch } = useForm({
    defaultValues: { errorFocus: null },
  });
  const errorFocus = watch("errorFocus");
  const rowRefs = useRef({});

  //for editable cells po ito
  const [tableData, setTableData] = useState(rows);
  const [editingCell, setEditingCell] = useState(null);

  const [page, setPage] = useState(0);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedData, setSelectedData] = useState(null);
  const [selectedColumnName, setSelectedColumnName] = useState("");

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
    const col = COLUMNS.find((c) => c.key === fieldKey);
    return col ? col.header : fieldKey;
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
            label={`${data.count.error} Error${data.count.error !== 1 ? "s" : ""}`}
            onClick={openErrorMenu}
            onDelete={errorLocations.length ? openErrorMenu : undefined}
            deleteIcon={
              errorLocations.length ? <ArrowDropDownIcon /> : undefined
            }
            disabled={!data.count.error}
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
            label={`${data.count.ok} OK`}
            size="small"
            variant="outlined"
            style={{
              borderColor: "rgba(76, 175, 80, 0.5)",
              color: "#2e7d32",
            }}
          />
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
                {COLUMNS.map((col, i) => (
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
                    {COLUMNS.map((col, i) => {
                      const value =
                        col.key === null ? rowIndex + 1 : agr[col.key];

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
    </div>
  );
}

export default TableAGR;
