import React, { useEffect, useMemo, useRef, useState } from "react";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import "./docs.css";
import {
  Document,
  ImageRun,
  Packer,
  Paragraph,
  Table,
  TableCell,
  TableRow,
  TextRun,
  WidthType,
} from "docx";

import { createMuiTheme, ThemeProvider } from "@material-ui/core/styles";
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
import EditOutlinedIcon from "@material-ui/icons/EditOutlined";
import TableChartOutlinedIcon from "@material-ui/icons/TableChartOutlined";
import ImageOutlinedIcon from "@material-ui/icons/ImageOutlined";

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
      const actionTarget = event.target.closest("[data-action]");
      if (!actionTarget) {
        return;
      }

      event.preventDefault();
      event.stopPropagation();

      const currentTableData = readTableDataFromNode(node);
      const action = actionTarget.getAttribute("data-action");
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

const extractDocumentText = (html) => {
  if (!html) {
    return "";
  }

  const parser = new DOMParser();
  const parsed = parser.parseFromString(html, "text/html");
  const blocks = [];

  parsed.body.childNodes.forEach((node) => {
    if (node.nodeType === Node.TEXT_NODE) {
      const text = node.textContent?.trim();
      if (text) {
        blocks.push(text);
      }
      return;
    }

    if (node.nodeType !== Node.ELEMENT_NODE) {
      return;
    }

    if (
      node.nodeName === "TABLE" ||
      node.classList?.contains("doc-table-wrapper")
    ) {
      const tableNode =
        node.nodeName === "TABLE" ? node : node.querySelector("table");

      Array.from(tableNode?.querySelectorAll("tr") || []).forEach((row) => {
        const rowText = Array.from(row.children)
          .map((cell) => cell.textContent?.trim() || "")
          .filter(Boolean)
          .join(" ");

        if (rowText) {
          blocks.push(rowText);
        }
      });

      return;
    }

    const text = node.textContent?.trim();
    if (text) {
      blocks.push(text);
    }
  });

  return blocks.join(" ").replace(/\s+/g, " ").trim();
};

const hasMeaningfulContent = (html) => {
  if (!html) {
    return false;
  }

  const parser = new DOMParser();
  const parsed = parser.parseFromString(html, "text/html");
  if (parsed.body.querySelector("img")) {
    return true;
  }

  return extractDocumentText(html).length > 0;
};

const wordCount = (html) => {
  const t = extractDocumentText(html);
  return t ? t.split(/\s+/).filter(Boolean).length : 0;
};

const parseDataUrl = (dataUrl) => {
  const match = dataUrl.match(/^data:(image\/[^;]+)(?:;[^,]+)*;base64,(.*)$/);
  if (!match) {
    return null;
  }

  const base64 = match[2];
  const binary = atob(base64);
  const buffer = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) {
    buffer[i] = binary.charCodeAt(i);
  }
  return buffer;
};

const buildInlineContent = (node) => {
  if (node.nodeType === Node.TEXT_NODE) {
    const text = node.textContent || "";
    return text ? [new TextRun(text)] : [];
  }

  if (node.nodeType !== Node.ELEMENT_NODE) {
    return [];
  }

  if (node.nodeName === "IMG") {
    const src = node.getAttribute("src") || "";
    const imageData = parseDataUrl(src);
    if (!imageData) {
      return [];
    }

    const width = parseInt(node.getAttribute("width") || "320", 10);
    const height = parseInt(node.getAttribute("height") || "240", 10);

    return [
      new ImageRun({
        data: imageData,
        transformation: { width, height },
      }),
    ];
  }

  return Array.from(node.childNodes).flatMap(buildInlineContent);
};

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

    const inlineContent = buildInlineContent(node);
    if (inlineContent.length > 0) {
      children.push(new Paragraph({ children: inlineContent }));
    }
  });

  return children.length > 0 ? children : [new Paragraph("")];
};

function EditorToolbar({ onInsertImage }) {
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
          className="ql-insertImage"
          type="button"
          title="Insert image"
          onMouseDown={(event) => {
            event.preventDefault();
            onInsertImage?.();
          }}
        >
          <ImageOutlinedIcon fontSize="small" />
        </button>
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
  const [text, setText] = useState("");
  const [exporting, setExporting] = useState(false);
  const [tableRows, setTableRows] = useState("3");
  const [tableCols, setTableCols] = useState("3");
  const [showTableSetup, setShowTableSetup] = useState(false);
  const quillRef = useRef(null);
  const selectionRef = useRef(null);
  const draggedTableRef = useRef(null);
  const imageInputRef = useRef(null);

  const wc = wordCount(text);
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

  const openImagePicker = () => {
    imageInputRef.current?.click();
  };

  const handleImageFileChange = async (event) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const url = reader.result;
      const editor = quillRef.current?.getEditor();
      if (!editor || !url) {
        return;
      }

      const range = editor.getSelection(true);
      const insertAt = range ? range.index : editor.getLength();
      editor.insertEmbed(insertAt, "image", url, "user");
      editor.setSelection(insertAt + 1, 0, "silent");
      setText(editor.root.innerHTML);
    };
    reader.readAsDataURL(file);
    event.target.value = "";
  };

  const modules = useMemo(
    () => ({
      toolbar: {
        container: "#docs-toolbar",
        handlers: {
          insertImage() {
            openImagePicker();
          },
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
      <Box className="docs-root">
        <Box className="docs-container">
          {/* ── Header ── */}
          <Box className="docs-header">
            <Box className="docs-header-left">
              <Typography className="docs-eyebrow">
                <span className="docs-eyebrow-dot" />
                Word Editor
              </Typography>
              <Typography className="docs-title">
                Write with <span className="docs-title-accent">purpose.</span>
              </Typography>
              <Typography className="docs-subtitle">
                Craft, format, and export your document in one click.
              </Typography>
            </Box>

            <Tooltip
              title={!hasContent ? "Start writing first" : "Download as .docx"}
              arrow
            >
              <span>
                <Button
                  className="docs-export-btn"
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
          <Box className="docs-stats-bar">
            <Box className="docs-stat-item">
              <Typography className="docs-stat-number">{wc}</Typography>
              <Typography className="docs-stat-label">Words</Typography>
            </Box>

            <Chip
              icon={<EditOutlinedIcon />}
              label={hasContent ? "Editing" : "Ready"}
              size="small"
              className="docs-status-chip"
            />
          </Box>

          {/* ── Editor ── */}
          <Paper className="docs-editor-card" elevation={0}>
            {exporting && <LinearProgress className="docs-progress-bar" />}
            <EditorToolbar onInsertImage={openImagePicker} />
            {showTableSetup && (
              <Box className="docs-table-setup-bar">
                <TextField
                  label="Rows"
                  variant="outlined"
                  size="small"
                  type="number"
                  value={tableRows}
                  onChange={(event) => setTableRows(event.target.value)}
                  className="docs-table-field"
                  inputProps={{ min: 1, max: 20 }}
                />
                <TextField
                  label="Columns"
                  variant="outlined"
                  size="small"
                  type="number"
                  value={tableCols}
                  onChange={(event) => setTableCols(event.target.value)}
                  className="docs-table-field"
                  inputProps={{ min: 1, max: 20 }}
                />
                <Button
                  className="docs-table-insert-btn"
                  variant="contained"
                  disableElevation
                  onClick={insertTable}
                >
                  Insert Table
                </Button>
                <Button
                  className="docs-table-cancel-btn"
                  variant="outlined"
                  onClick={() => setShowTableSetup(false)}
                >
                  Cancel
                </Button>
              </Box>
            )}
            <input
              ref={imageInputRef}
              type="file"
              accept="image/*"
              style={{ display: "none" }}
              onChange={handleImageFileChange}
            />
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
