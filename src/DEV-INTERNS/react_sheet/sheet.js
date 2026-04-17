import React, { useState } from "react";
import Spreadsheet from "react-spreadsheet";
import {
  makeStyles,
  createMuiTheme,
  ThemeProvider,
} from "@material-ui/core/styles";
import Box from "@material-ui/core/Box";
import Typography from "@material-ui/core/Typography";
import Button from "@material-ui/core/Button";
import Paper from "@material-ui/core/Paper";
import Divider from "@material-ui/core/Divider";
import CircularProgress from "@material-ui/core/CircularProgress";
import FlashOnIcon from "@material-ui/icons/FlashOn";

const theme = createMuiTheme({
  palette: {
    primary: { main: "#FF7704" },
    secondary: { main: "#FF7704" },
    background: { default: "#ffffff" },
  },
  typography: {
    fontFamily: "'Poppins', sans-serif",
  },
  overrides: {
    MuiButton: {
      containedPrimary: {
        background: "linear-gradient(135deg, #FF7704 0%, #FF9A00 100%)",
        color: "#fff",
        boxShadow: "0 4px 16px rgba(255, 119, 4, 0.35)",
        "&:hover": {
          background: "linear-gradient(135deg, #e06900 0%, #e08800 100%)",
          boxShadow: "0 8px 24px rgba(255, 119, 4, 0.45)",
        },
      },
    },
  },
});

const useStyles = makeStyles(() => ({
  root: {
    minHeight: "100vh",
    background: "#ffffff",
    padding: "32px",
  },
  header: {
    display: "flex",
    alignItems: "flex-start",
    justifyContent: "space-between",
    flexWrap: "wrap",
    gap: "16px",
    marginBottom: "28px",
  },
  badge: {
    fontSize: "10px",
    fontWeight: 600,
    letterSpacing: "0.18em",
    textTransform: "uppercase",
    color: "#FF7704",
    marginBottom: "4px",
  },
  title: {
    fontWeight: 700,
    color: "#FF7704",
    letterSpacing: "-0.5px",
    lineHeight: 1,
    paddingTop: "24px",
  },
  subtitle: {
    color: "#90a4ae",
    marginTop: "4px",
  },
  toolbar: {
    display: "flex",
    alignItems: "flex-end",
    paddingTop: "60px",
  },
  computeBtn: {
    borderRadius: "8px",
    padding: "10px 24px",
    fontWeight: 700,
    letterSpacing: "0.04em",
    textTransform: "none",
    fontSize: "13px",
  },
  statsPaper: {
    display: "flex",
    borderRadius: "10px",
    overflow: "hidden",
    marginBottom: "16px",
    animation: "$slideDown 0.3s ease",
    boxShadow: "0 2px 12px rgba(255, 119, 4, 0.1)",
  },
  "@keyframes slideDown": {
    from: { opacity: 0, transform: "translateY(-8px)" },
    to: { opacity: 1, transform: "translateY(0)" },
  },
  statItem: {
    flex: 1,
    padding: "16px 24px",
    display: "flex",
    flexDirection: "column",
    gap: "4px",
  },
  statLabel: {
    fontSize: "9px",
    fontWeight: 600,
    letterSpacing: "0.18em",
    textTransform: "uppercase",
    color: "#90a4ae",
  },
  statValueBlue: {
    fontSize: "22px",
    fontWeight: 700,
    color: "#FF7704",
    letterSpacing: "-0.5px",
    lineHeight: 1.1,
  },
  statValueCyan: {
    fontSize: "22px",
    fontWeight: 700,
    color: "#FF7704",
    letterSpacing: "-0.5px",
    lineHeight: 1.1,
  },
  spreadsheetPaper: {
    borderRadius: "12px",
    overflow: "hidden",
    boxShadow: "0 4px 24px rgba(255, 119, 4, 0.1)",
  },
  spreadsheetInner: {
    overflow: "auto",
    maxHeight: "72vh",
    "& .Spreadsheet": {
      fontFamily: "'Poppins', sans-serif",
      fontSize: "12px",
    },
    "& .Spreadsheet__table": {
      borderCollapse: "collapse",
    },
    "& th, & .Spreadsheet__header": {
      background: "#fff8f2 !important",
      color: "#FF7704 !important",
      fontSize: "10px !important",
      fontWeight: "700 !important",
      letterSpacing: "0.08em !important",
      border: "1px solid #ffe0c2 !important",
      padding: "8px 12px !important",
      textTransform: "uppercase",
      position: "sticky",
      top: 0,
      zIndex: 2,
    },
    "& td, & .Spreadsheet__cell": {
      border: "1px solid #fff3e6 !important",
      background: "#ffffff !important",
      color: "#37474f !important",
      padding: "6px 12px !important",
      transition: "background 0.1s",
    },
    "& .Spreadsheet__cell:hover": {
      background: "#fff8f2 !important",
    },
    "& .Spreadsheet__cell--selected": {
      background: "rgba(255, 119, 4, 0.08) !important",
      outline: "1px solid #FF7704 !important",
      outlineOffset: "-1px",
    },
    "& .Spreadsheet__cell--readonly": {
      color: "#b0bec5 !important",
    },
    "& input": {
      background: "#fff3e6 !important",
      color: "#FF7704 !important",
      fontFamily: "'Poppins', sans-serif !important",
      fontSize: "12px !important",
      border: "none !important",
      outline: "none !important",
      padding: "4px !important",
      width: "100%",
    },
  },
  footer: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "10px 20px",
    background: "#fff8f2",
    borderTop: "1px solid #ffe0c2",
  },
  footerText: {
    fontSize: "11px",
    color: "#b0bec5",
    display: "flex",
    alignItems: "center",
    gap: "6px",
  },
  readyDot: {
    fontSize: "12px",
    color: "#66bb6a",
  },
}));

function formatNumber(n) {
  return n.toLocaleString();
}

function Sheets() {
  const classes = useStyles();

  const initialData = [
    [
      { value: "ID" },
      { value: "Name" },
      { value: "Address" },
      { value: "Age" },
      { value: "Work" },
      { value: "Email" },
      { value: "Phone" },
      { value: "Company" },
      { value: "Position" },
      { value: "Department" },
      { value: "Notes" },
      { value: "Status" },
    ],
    ...Array.from({ length: 10000 }, (_, index) => [
      { value: index + 1 },
      { value: `User ${index + 1}` },
      { value: `Address ${index + 1}` },
      { value: 18 + (index % 43) },
      { value: `Work ${index + 1}` },
      { value: `Email ${index + 1}` },
      { value: `Phone ${index + 1}` },
      { value: `Company ${index + 1}` },
      { value: `Position ${index + 1}` },
      { value: `Department ${index + 1}` },
      { value: `Notes for user ${index + 1}` },
      { value: index % 2 === 0 ? "Active" : "Inactive" },
    ]),
  ];

  const [data, setData] = useState(initialData);
  const [computedResult, setComputedResult] = useState(null);
  const [isComputing, setIsComputing] = useState(false);

  const handleComputeCells = () => {
    setIsComputing(true);
    setTimeout(() => {
      let numericTotal = 0;
      let filledCells = 0;

      data.forEach((row) => {
        row.forEach((cell) => {
          const cellValue = cell?.value;
          if (
            cellValue !== undefined &&
            cellValue !== null &&
            cellValue !== ""
          ) {
            filledCells += 1;
          }
          if (typeof cellValue === "number") {
            numericTotal += cellValue;
            return;
          }
          const parsedValue = Number(cellValue);
          if (!Number.isNaN(parsedValue) && cellValue !== "") {
            numericTotal += parsedValue;
          }
        });
      });

      setComputedResult({ filledCells, numericTotal });
      setIsComputing(false);
    }, 0);
  };

  return (
    <ThemeProvider theme={theme}>
      <Box className={classes.root}>
        {/* Header */}
        <Box className={classes.header}>
          <Box>
            <Typography className={classes.badge}>Data Grid v1.0</Typography>
            <Typography variant="h4" className={classes.title}>
              My Spreadsheet
            </Typography>
            <Typography variant="body2" className={classes.subtitle}>
              10,001 rows · 4 columns · editable
            </Typography>
          </Box>

          <Box className={classes.toolbar}>
            <Button
              variant="contained"
              color="primary"
              className={classes.computeBtn}
              onClick={handleComputeCells}
              disabled={isComputing}
              startIcon={
                isComputing ? (
                  <CircularProgress size={16} color="inherit" />
                ) : (
                  <FlashOnIcon />
                )
              }
            >
              {isComputing ? "Computing..." : "Compute Cells"}
            </Button>
          </Box>
        </Box>

        {/* Stats Bar */}
        {computedResult && (
          <Paper className={classes.statsPaper} elevation={0}>
            <Box className={classes.statItem}>
              <Typography className={classes.statLabel}>
                Filled Cells
              </Typography>
              <Typography className={classes.statValueBlue}>
                {formatNumber(computedResult.filledCells)}
              </Typography>
            </Box>
            <Divider orientation="vertical" flexItem />
            <Box className={classes.statItem}>
              <Typography className={classes.statLabel}>
                Numeric Total
              </Typography>
              <Typography className={classes.statValueCyan}>
                {formatNumber(computedResult.numericTotal)}
              </Typography>
            </Box>
          </Paper>
        )}

        {/* Spreadsheet */}
        <Paper className={classes.spreadsheetPaper} elevation={0}>
          <Box className={classes.spreadsheetInner}>
            <Spreadsheet data={data} onChange={setData} />
          </Box>
          <Box className={classes.footer}> </Box>
        </Paper>
      </Box>
    </ThemeProvider>
  );
}

export default Sheets;
