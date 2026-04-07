import React, { useEffect, useMemo, useRef, useState } from "react";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import {
  Document,
  Packer,
  Paragraph,
  Table,
  TableCell,
  TableRow,
  WidthType,
} from "docx";

import {
  makeStyles,
  createMuiTheme,
  ThemeProvider,
} from "@material-ui/core/styles";
import {
  Box,
  Typography,
  Button,
  Paper,
  Chip,
  Tooltip,
  LinearProgress,
  TextField,
} from "@material-ui/core";
import GetAppIcon from "@material-ui/icons/GetApp";
import DescriptionOutlinedIcon from "@material-ui/icons/DescriptionOutlined";
import EditOutlinedIcon from "@material-ui/icons/EditOutlined";
import TableChartOutlinedIcon from "@material-ui/icons/TableChartOutlined";

const Quill = ReactQuill.Quill;
const BlockEmbed = Quill.import("blots/block/embed");

const ORANGE = "#FF7704";
const ORANGE_DARK = "#E06500";
const ORANGE_LIGHT = "#FFF4EC";
const ORANGE_MID = "#FFE2C8";

const createTableId = () =>
  `table-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

const clampTableSize = (value, fallback) => {
  const parsed = Number.parseInt(value, 10);

  if (Number.isNaN(parsed)) {
    return fallback;
  }

  return Math.min(20, Math.max(1, parsed));
};

const createTableData = (rows = 3, cols = 3, id = createTableId()) => ({
  id,
  rows: Array.from({ length: rows }, () =>
    Array.from({ length: cols }, () => ""),
  ),
});

const addTableRow = (tableData) => {
  const colCount = tableData?.rows?.[0]?.length || 1;

  return {
    id: tableData?.id || createTableId(),
    rows: [
      ...(tableData?.rows || []),
      Array.from({ length: colCount }, () => ""),
    ],
  };
};

const addTableColumn = (tableData) => ({
  id: tableData?.id || createTableId(),
  rows: (tableData?.rows || [[""]]).map((row) => [...row, ""]),
});

const removeTableRow = (tableData) => {
  const rows = tableData?.rows || [[""]];

  if (rows.length <= 1) {
    return { id: tableData?.id || createTableId(), rows };
  }

  return {
    id: tableData?.id || createTableId(),
    rows: rows.slice(0, -1),
  };
};

const removeTableColumn = (tableData) => {
  const rows = tableData?.rows || [[""]];
  const colCount = rows[0]?.length || 1;

  if (colCount <= 1) {
    return { id: tableData?.id || createTableId(), rows };
  }

  return {
    id: tableData?.id || createTableId(),
    rows: rows.map((row) => row.slice(0, -1)),
  };
};

const renderTableMarkup = (value) => {
  const rows = value?.rows || [];

  return `
    <div class="doc-table-actions">
      <button type="button" class="doc-table-action" data-action="add-row">+ Row</button>
      <button type="button" class="doc-table-action" data-action="add-col">+ Column</button>
      <button type="button" class="doc-table-action doc-table-action-danger" data-action="remove-row">- Row</button>
      <button type="button" class="doc-table-action doc-table-action-danger" data-action="remove-col">- Column</button>
    </div>
    <table class="doc-table">
      <tbody>
        ${rows
          .map(
            (row, rowIndex) => `
              <tr>
                ${row
                  .map(
                    (cell, colIndex) =>
                      `<${
                        rowIndex === 0 ? "th" : "td"
                      } class="doc-table-cell" contenteditable="true" data-row="${rowIndex}" data-col="${colIndex}">${
                        cell || ""
                      }</${rowIndex === 0 ? "th" : "td"}>`,
                  )
                  .join("")}
              </tr>
            `,
          )
          .join("")}
      </tbody>
    </table>
  `;
};

const readTableDataFromNode = (node) => {
  const tableId = node.getAttribute("data-table-id") || createTableId();
  const rows = Array.from(node.querySelectorAll("tr")).map((row) =>
    Array.from(row.children).map((cell) => cell.textContent || ""),
  );

  return rows.length > 0
    ? { id: tableId, rows }
    : createTableData(3, 3, tableId);
};

const updateTableNode = (node, tableData) => {
  node.setAttribute("data-table", JSON.stringify(tableData));
  node.setAttribute("data-table-id", tableData.id || createTableId());
  node.innerHTML = renderTableMarkup(tableData);
};

class DocTableBlot extends BlockEmbed {
  static create(value) {
    const node = super.create();
    const tableValue = value?.rows?.length ? value : createTableData();

    node.setAttribute("contenteditable", "false");
    updateTableNode(node, tableValue);
    node.addEventListener("input", () => {
      node.setAttribute(
        "data-table",
        JSON.stringify(readTableDataFromNode(node)),
      );
    });
    node.addEventListener("click", (event) => {
      const actionButton = event.target.closest(".doc-table-action");
      if (!actionButton) {
        return;
      }

      event.preventDefault();
      event.stopPropagation();

      const currentTableData = readTableDataFromNode(node);
      const action = actionButton.getAttribute("data-action");
      let nextTableData = currentTableData;

      if (action === "add-row") {
        nextTableData = addTableRow(currentTableData);
      } else if (action === "add-col") {
        nextTableData = addTableColumn(currentTableData);
      } else if (action === "remove-row") {
        nextTableData = removeTableRow(currentTableData);
      } else if (action === "remove-col") {
        nextTableData = removeTableColumn(currentTableData);
      }

      updateTableNode(node, nextTableData);
    });

    return node;
  }

  static value(node) {
    try {
      return (
        JSON.parse(node.getAttribute("data-table")) ||
        readTableDataFromNode(node)
      );
    } catch (error) {
      return readTableDataFromNode(node);
    }
  }
}

DocTableBlot.blotName = "doc-table";
DocTableBlot.tagName = "div";
DocTableBlot.className = "doc-table-wrapper";

if (!Quill.imports["formats/doc-table"]) {
  Quill.register(DocTableBlot);
}

const theme = createMuiTheme({
  palette: {
    type: "light",
    primary: {
      main: ORANGE,
      dark: ORANGE_DARK,
      light: ORANGE_LIGHT,
      contrastText: "#fff",
    },
    background: { default: "#FAF8F5", paper: "#FFFFFF" },
    text: { primary: "#1A1108", secondary: "#7A6A55" },
    divider: "#EDE8E1",
  },
  typography: {
    fontFamily: "'Poppins', sans-serif",
  },
  shape: { borderRadius: 6 },
  overrides: {
    MuiButton: { root: { textTransform: "none", fontWeight: 600 } },
  },
});

const useStyles = makeStyles((t) => ({
  root: {
    minHeight: "100vh",
    backgroundColor: "#FFFFFF",
    backgroundImage: "none",
    display: "flex",
    justifyContent: "center",
    alignItems: "flex-start",
    padding: t.spacing(5, 2, 8),
  },

  container: {
    width: "100%",
    maxWidth: 880,
  },

  // ── Header ──
  header: {
    display: "flex",
    alignItems: "flex-start",
    justifyContent: "space-between",
    marginBottom: t.spacing(4),
    gap: t.spacing(2),
  },
  headerLeft: {
    display: "flex",
    flexDirection: "column",
    gap: 6,
  },
  eyebrow: {
    display: "flex",
    alignItems: "center",
    gap: 6,
    fontFamily: "'Poppins', sans-serif",
    fontSize: "0.72rem",
    fontWeight: 700,
    letterSpacing: "1.8px",
    textTransform: "uppercase",
    color: ORANGE,
  },
  eyebrowDot: {
    width: 6,
    height: 6,
    borderRadius: "50%",
    backgroundColor: ORANGE,
    animation: "$blink 2s ease-in-out infinite",
  },
  title: {
    fontFamily: "'Fraunces', Georgia, serif",
    fontWeight: 900,
    fontSize: "2rem",
    color: "#1A1108",
    lineHeight: 1.15,
    letterSpacing: "-1px",
  },
  titleAccent: {
    color: ORANGE,
  },
  subtitle: {
    fontFamily: "'Poppins', sans-serif",
    fontSize: "0.85rem",
    color: "#7A6A55",
    marginTop: 2,
  },

  exportBtn: {
    flexShrink: 0,
    marginTop: 30,
    background: ORANGE,
    color: "#fff",
    fontFamily: "'Poppins', sans-serif",
    fontWeight: 600,
    fontSize: "0.85rem",
    padding: "10px 24px",
    borderRadius: 8,
    boxShadow: `0 4px 20px rgba(255,119,4,0.30)`,
    transition: "all 0.2s ease",
    "&:hover": {
      background: ORANGE_DARK,
      boxShadow: `0 6px 28px rgba(255,119,4,0.45)`,
      transform: "translateY(-1px)",
    },
    "&:active": { transform: "translateY(0)" },
    "&.Mui-disabled": {
      background: "#EDE8E1",
      color: "#B8AA99",
      boxShadow: "none",
    },
  },
  statsBar: {
    display: "flex",
    alignItems: "center",
    gap: t.spacing(3),
    marginBottom: t.spacing(2),
    padding: t.spacing(1.5, 2.5),
    backgroundColor: ORANGE_LIGHT,
    borderRadius: 8,
    border: `1px solid ${ORANGE_MID}`,
  },
  statItem: {
    display: "flex",
    alignItems: "baseline",
    gap: 5,
  },
  statNumber: {
    fontFamily: "'Fraunces', Georgia, serif",
    fontWeight: 700,
    fontSize: "1.15rem",
    color: ORANGE_DARK,
  },
  statLabel: {
    fontFamily: "'DM Sans', sans-serif",
    fontSize: "0.72rem",
    fontWeight: 500,
    color: "#7A6A55",
    textTransform: "uppercase",
    letterSpacing: "0.8px",
  },
  statDivider: {
    width: 1,
    height: 22,
    backgroundColor: ORANGE_MID,
  },
  statusChip: {
    marginLeft: "auto",
    backgroundColor: "#fff",
    border: `1px solid ${ORANGE_MID}`,
    color: "#7A6A55",
    fontFamily: "'Poppins', sans-serif",
    fontSize: "0.72rem",
    height: 26,
    "& .MuiChip-icon": { color: ORANGE, fontSize: 14 },
  },

  editorCard: {
    borderRadius: 12,
    border: "1px solid #EDE8E1",
    overflow: "hidden",
    boxShadow: "0 2px 24px rgba(26,17,8,0.06), 0 1px 4px rgba(26,17,8,0.04)",

    // Quill overrides — light theme with orange accents
    "& .ql-toolbar.ql-snow": {
      border: "none !important",
      borderBottom: "1px solid #EDE8E1 !important",
      backgroundColor: "#FDFCFA",
      padding: "10px 16px",
    },
    "& .ql-toolbar .ql-stroke": { stroke: "#7A6A55" },
    "& .ql-toolbar .ql-fill": { fill: "#7A6A55" },
    "& .ql-toolbar .ql-picker-label": { color: "#7A6A55" },
    "& .ql-toolbar button:hover .ql-stroke": { stroke: `${ORANGE} !important` },
    "& .ql-toolbar button:hover .ql-fill": { fill: `${ORANGE} !important` },
    "& .ql-toolbar button.ql-active .ql-stroke": {
      stroke: `${ORANGE} !important`,
    },
    "& .ql-toolbar button.ql-active .ql-fill": { fill: `${ORANGE} !important` },
    "& .ql-toolbar .ql-picker-label:hover": { color: `${ORANGE} !important` },
    "& .ql-toolbar .ql-picker-options": {
      border: "1px solid #EDE8E1",
      borderRadius: 6,
      boxShadow: "0 4px 16px rgba(0,0,0,0.08)",
    },
    "& .ql-toolbar .ql-insertTable": {
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
    },
    "& .ql-container.ql-snow": {
      border: "none !important",
    },
    "& .ql-editor": {
      minHeight: 400,
      padding: "28px 32px",
      fontSize: "1rem",
      lineHeight: 1.85,
      color: "#1A1108",
      caretColor: ORANGE,
      fontFamily: "'Poppins', sans-serif",
    },
    "& .ql-editor.ql-blank::before": {
      color: "#C5BAB0",
      fontStyle: "normal",
      fontFamily: "'Fraunces', Georgia, serif",
      fontSize: "1rem",
    },
    "& .ql-editor h1": {
      fontFamily: "'Fraunces', Georgia, serif",
      fontWeight: 900,
      color: "#1A1108",
      borderBottom: `3px solid ${ORANGE}`,
      paddingBottom: 6,
    },
    "& .ql-editor h2, & .ql-editor h3": {
      fontFamily: "'Fraunces', Georgia, serif",
      fontWeight: 700,
      color: "#1A1108",
    },
    "& .ql-editor a": { color: ORANGE },
    "& .ql-editor .doc-table-wrapper": {
      margin: "16px 0",
      overflowX: "auto",
    },
    "& .ql-editor .doc-table-actions": {
      display: "flex",
      gap: 8,
      marginBottom: 8,
    },
    "& .ql-editor .doc-table-action": {
      border: `1px solid ${ORANGE_MID}`,
      backgroundColor: "#FFFFFF",
      color: ORANGE,
      borderRadius: 999,
      padding: "4px 10px",
      fontSize: "0.75rem",
      fontWeight: 600,
      cursor: "pointer",
    },
    "& .ql-editor .doc-table-wrapper.doc-table-dragging": {
      opacity: 0.6,
    },
    "& .ql-editor .doc-table-action:hover": {
      backgroundColor: ORANGE_LIGHT,
    },
    "& .ql-editor .doc-table-action-danger": {
      color: "#B54708",
      borderColor: "#F3C79E",
    },
    "& .ql-editor .doc-table-action-danger:hover": {
      backgroundColor: "#FFF1E7",
    },
    "& .ql-editor .doc-table": {
      width: "100%",
      borderCollapse: "collapse",
      tableLayout: "fixed",
      backgroundColor: "#FFFFFF",
    },
    "& .ql-editor .doc-table th, & .ql-editor .doc-table td": {
      border: "1px solid #DCCFC1",
      padding: "10px 12px",
      textAlign: "left",
      verticalAlign: "top",
    },
    "& .ql-editor .doc-table-cell": {
      outline: "none",
      cursor: "text",
    },
    "& .ql-editor .doc-table-cell:focus": {
      boxShadow: "inset 0 0 0 2px rgba(255,119,4,0.18)",
    },
    "& .ql-editor .doc-table th": {
      backgroundColor: "#FFF4EC",
      color: "#1A1108",
      fontWeight: 700,
    },
  },

  progressBar: {
    height: 3,
    backgroundColor: ORANGE_MID,
    "& .MuiLinearProgress-bar": { backgroundColor: ORANGE },
  },
  tableSetupBar: {
    display: "flex",
    alignItems: "flex-end",
    gap: t.spacing(1.5),
    padding: t.spacing(1.5, 2),
    backgroundColor: "#FDFCFA",
    borderBottom: "1px solid #EDE8E1",
    flexWrap: "wrap",
  },
  tableField: {
    minWidth: 110,
    "& .MuiInputLabel-root.Mui-focused": {
      color: ORANGE,
    },
    "& .MuiOutlinedInput-root": {
      backgroundColor: "#FFFFFF",
      "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
        borderColor: ORANGE,
      },
    },
  },
  tableInsertBtn: {
    height: 40,
    backgroundColor: ORANGE,
    color: "#fff",
    fontWeight: 600,
    "&:hover": {
      backgroundColor: ORANGE_DARK,
    },
  },
  tableCancelBtn: {
    height: 40,
    color: "#7A6A55",
    borderColor: ORANGE_MID,
  },

  footer: {
    marginTop: t.spacing(2),
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
  },
  footerNote: {
    display: "flex",
    alignItems: "center",
    gap: 6,
    fontFamily: "'Poppins', sans-serif",
    fontSize: "0.75rem",
    color: "#B8AA99",
  },
  footerDot: {
    width: 3,
    height: 3,
    borderRadius: "50%",
    backgroundColor: "#C5BAB0",
  },

  "@keyframes blink": {
    "0%, 100%": { opacity: 1 },
    "50%": { opacity: 0.2 },
  },
}));

const stripHtml = (html) => html.replace(/<[^>]+>/g, "").trim();
const hasMeaningfulContent = (html) => stripHtml(html).length > 0;
const wordCount = (html) => {
  const t = stripHtml(html);
  return t ? t.split(/\s+/).filter(Boolean).length : 0;
};
const charCount = (html) => stripHtml(html).length;
const readingTime = (wc) => Math.max(1, Math.ceil(wc / 200));

const buildDocChildren = (html) => {
  const parser = new DOMParser();
  const parsed = parser.parseFromString(html, "text/html");
  const children = [];

  parsed.body.childNodes.forEach((node) => {
    if (node.nodeType !== Node.ELEMENT_NODE) {
      const text = node.textContent?.trim();
      if (text) {
        children.push(new Paragraph(text));
      }
      return;
    }

    if (
      node.nodeName === "TABLE" ||
      node.classList?.contains("doc-table-wrapper")
    ) {
      const tableNode =
        node.nodeName === "TABLE" ? node : node.querySelector("table");
      const rows = Array.from(tableNode?.querySelectorAll("tr") || []).map(
        (row) =>
          new TableRow({
            children: Array.from(row.children).map(
              (cell) =>
                new TableCell({
                  children: [new Paragraph(cell.textContent?.trim() || "")],
                }),
            ),
          }),
      );

      if (rows.length > 0) {
        children.push(
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            rows,
          }),
        );
        children.push(new Paragraph(""));
      }
      return;
    }

    const text = node.textContent?.trim();
    if (text) {
      children.push(new Paragraph(text));
    }
  });

  return children.length > 0 ? children : [new Paragraph("")];
};

function EditorToolbar() {
  return (
    <div id="docs-toolbar">
      <span className="ql-formats">
        <select className="ql-header" defaultValue="">
          <option value="1" />
          <option value="2" />
          <option value="3" />
          <option value="" />
        </select>
      </span>
      <span className="ql-formats">
        <button className="ql-bold" type="button" />
        <button className="ql-italic" type="button" />
        <button className="ql-underline" type="button" />
        <button className="ql-strike" type="button" />
      </span>
      <span className="ql-formats">
        <button className="ql-list" value="ordered" type="button" />
        <button className="ql-list" value="bullet" type="button" />
      </span>
      <span className="ql-formats">
        <select className="ql-align" />
      </span>
      <span className="ql-formats">
        <button className="ql-link" type="button" />
        <button
          className="ql-insertTable"
          type="button"
          title="Insert table"
          onMouseDown={(event) => event.preventDefault()}
        >
          <TableChartOutlinedIcon fontSize="small" />
        </button>
        <button className="ql-clean" type="button" />
      </span>
    </div>
  );
}

export default function Docs() {
  const classes = useStyles();
  const [text, setText] = useState("");
  const [exporting, setExporting] = useState(false);
  const [tableRows, setTableRows] = useState("3");
  const [tableCols, setTableCols] = useState("3");
  const [showTableSetup, setShowTableSetup] = useState(false);
  const quillRef = useRef(null);
  const selectionRef = useRef(null);
  const draggedTableRef = useRef(null);

  const wc = wordCount(text);
  const cc = charCount(text);
  const rt = readingTime(wc);
  const hasContent = hasMeaningfulContent(text);

  useEffect(() => {
    const editor = quillRef.current?.getEditor();
    const root = editor?.root;

    if (!editor || !root) {
      return undefined;
    }

    const clearDraggingState = () => {
      root
        .querySelectorAll(".doc-table-wrapper.doc-table-dragging")
        .forEach((node) => {
          node.classList.remove("doc-table-dragging");
        });
      draggedTableRef.current = null;
    };

    const handleDragStart = (event) => {
      const dragHandle = event.target.closest(".doc-table-drag");
      const tableNode = dragHandle?.closest(".doc-table-wrapper");

      if (!dragHandle || !tableNode) {
        return;
      }

      const blot = Quill.find(tableNode);
      if (!blot) {
        return;
      }

      const tableData = DocTableBlot.value(tableNode);
      draggedTableRef.current = {
        data: tableData,
        sourceIndex: editor.getIndex(blot),
      };

      tableNode.classList.add("doc-table-dragging");
      if (event.dataTransfer) {
        event.dataTransfer.effectAllowed = "move";
        event.dataTransfer.setData("text/plain", tableData.id || "");
      }
    };

    const handleDragOver = (event) => {
      if (!draggedTableRef.current) {
        return;
      }

      event.preventDefault();
      if (event.dataTransfer) {
        event.dataTransfer.dropEffect = "move";
      }
    };

    const handleDrop = (event) => {
      if (!draggedTableRef.current) {
        return;
      }

      event.preventDefault();

      const targetTableNode = event.target.closest(".doc-table-wrapper");
      const targetBlot = targetTableNode ? Quill.find(targetTableNode) : null;
      const sourceIndex = draggedTableRef.current.sourceIndex;
      const sourceDeleteLength =
        editor.getText(sourceIndex + 1, 1) === "\n" ? 2 : 1;

      let targetIndex = Math.max(0, editor.getLength() - 1);

      if (targetBlot) {
        const blotIndex = editor.getIndex(targetBlot);
        const blotLength =
          typeof targetBlot.length === "function" ? targetBlot.length() : 1;
        const targetRect = targetTableNode.getBoundingClientRect();

        targetIndex =
          event.clientY > targetRect.top + targetRect.height / 2
            ? blotIndex + blotLength + 1
            : blotIndex;
      }

      if (sourceIndex < targetIndex) {
        targetIndex -= sourceDeleteLength;
      }

      editor.deleteText(sourceIndex, sourceDeleteLength, "api");
      editor.insertEmbed(
        targetIndex,
        "doc-table",
        draggedTableRef.current.data,
        "api",
      );
      editor.insertText(targetIndex + 1, "\n", "api");
      editor.setSelection(targetIndex + 2, 0, "silent");
      selectionRef.current = { index: targetIndex + 2, length: 0 };
      setText(editor.root.innerHTML);
      clearDraggingState();
    };

    root.addEventListener("dragstart", handleDragStart);
    root.addEventListener("dragover", handleDragOver);
    root.addEventListener("drop", handleDrop);
    root.addEventListener("dragend", clearDraggingState);

    return () => {
      root.removeEventListener("dragstart", handleDragStart);
      root.removeEventListener("dragover", handleDragOver);
      root.removeEventListener("drop", handleDrop);
      root.removeEventListener("dragend", clearDraggingState);
    };
  }, [text]);

  const handleExport = async () => {
    if (!hasContent) {
      return;
    }

    setExporting(true);
    try {
      const doc = new Document({
        sections: [{ properties: {}, children: buildDocChildren(text) }],
      });
      const blob = await Packer.toBlob(doc);
      const url = window.URL.createObjectURL(blob);
      const a = Object.assign(document.createElement("a"), {
        href: url,
        download: "document.docx",
      });
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } finally {
      setExporting(false);
    }
  };

  const insertTable = () => {
    const editor = quillRef.current?.getEditor();
    if (!editor) {
      return;
    }

    const rowCount = clampTableSize(tableRows, 3);
    const colCount = clampTableSize(tableCols, 3);

    setTableRows(String(rowCount));
    setTableCols(String(colCount));

    editor.focus();

    const currentRange = editor.getSelection() || selectionRef.current;
    const insertAt = currentRange
      ? currentRange.index
      : Math.max(0, editor.getLength() - 1);

    editor.insertEmbed(
      insertAt,
      "doc-table",
      createTableData(rowCount, colCount),
      "api",
    );
    editor.insertText(insertAt + 1, "\n", "api");
    editor.setSelection(insertAt + 2, 0, "silent");
    selectionRef.current = { index: insertAt + 2, length: 0 };
    setText(editor.root.innerHTML);
    setShowTableSetup(false);
  };

  const modules = useMemo(
    () => ({
      toolbar: {
        container: "#docs-toolbar",
        handlers: {
          insertTable() {
            setShowTableSetup((prev) => !prev);
          },
        },
      },
    }),
    [],
  );

  return (
    <ThemeProvider theme={theme}>
      <Box className={classes.root}>
        <Box className={classes.container}>
          {/* ── Header ── */}
          <Box className={classes.header}>
            <Box className={classes.headerLeft}>
              <Typography className={classes.eyebrow}>
                <span className={classes.eyebrowDot} />
                Word Editor
              </Typography>
              <Typography className={classes.title}>
                Write with <span className={classes.titleAccent}>purpose.</span>
              </Typography>
              <Typography className={classes.subtitle}>
                Craft, format, and export your document in one click.
              </Typography>
            </Box>

            <Tooltip
              title={!hasContent ? "Start writing first" : "Download as .docx"}
              arrow
            >
              <span>
                <Button
                  className={classes.exportBtn}
                  onClick={handleExport}
                  disabled={!hasContent || exporting}
                  startIcon={<GetAppIcon />}
                  disableElevation
                >
                  {exporting ? "Exporting…" : "Export to Word"}
                </Button>
              </span>
            </Tooltip>
          </Box>

          {/* ── Stats bar ── */}
          <Box className={classes.statsBar}>
            <Box className={classes.statItem}>
              <Typography className={classes.statNumber}>{wc}</Typography>
              <Typography className={classes.statLabel}>Words</Typography>
            </Box>
            <Box className={classes.statDivider} />
            <Box className={classes.statItem}>
              <Typography className={classes.statNumber}>{cc}</Typography>
              <Typography className={classes.statLabel}>Characters</Typography>
            </Box>
            <Box className={classes.statDivider} />
            <Box className={classes.statItem}>
              <Typography className={classes.statNumber}>{rt}</Typography>
              <Typography className={classes.statLabel}>Min read</Typography>
            </Box>

            <Chip
              icon={<EditOutlinedIcon />}
              label={hasContent ? "Editing" : "Ready"}
              size="small"
              className={classes.statusChip}
            />
          </Box>

          {/* ── Editor ── */}
          <Paper className={classes.editorCard} elevation={0}>
            {exporting && <LinearProgress className={classes.progressBar} />}
            <EditorToolbar />
            {showTableSetup && (
              <Box className={classes.tableSetupBar}>
                <TextField
                  label="Rows"
                  variant="outlined"
                  size="small"
                  type="number"
                  value={tableRows}
                  onChange={(event) => setTableRows(event.target.value)}
                  className={classes.tableField}
                  inputProps={{ min: 1, max: 20 }}
                />
                <TextField
                  label="Columns"
                  variant="outlined"
                  size="small"
                  type="number"
                  value={tableCols}
                  onChange={(event) => setTableCols(event.target.value)}
                  className={classes.tableField}
                  inputProps={{ min: 1, max: 20 }}
                />
                <Button
                  className={classes.tableInsertBtn}
                  variant="contained"
                  disableElevation
                  onClick={insertTable}
                >
                  Insert Table
                </Button>
                <Button
                  className={classes.tableCancelBtn}
                  variant="outlined"
                  onClick={() => setShowTableSetup(false)}
                >
                  Cancel
                </Button>
              </Box>
            )}
            <ReactQuill
              ref={quillRef}
              theme="snow"
              value={text}
              onChange={setText}
              onChangeSelection={(range) => {
                selectionRef.current = range;
              }}
              modules={modules}
              placeholder="Begin your document here…"
            />
          </Paper>

          {/* ── Footer ── */}
        </Box>
      </Box>
    </ThemeProvider>
  );
}
