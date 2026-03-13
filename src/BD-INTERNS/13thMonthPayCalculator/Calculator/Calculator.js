import React, { useState, useCallback, useEffect } from "react";
import Barcode from "react-barcode";
import {
  Box,
  Typography,
  Paper,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  FormControlLabel,
  Checkbox,
  makeStyles,
} from "@material-ui/core";
import {
  computeTotalBasicEarned,
  compute13thMonthPay,
  countWeekdaysInRange,
  computeEarningsPerMonth,
  computeTotalBasicEarnedFromMonthlyAmounts,
} from "../utils/thirteenthMonthCalc";
import "../Calculator/Calculator.css";

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

function getApplicableMonths(start, end) {
  const s = new Date(start.getFullYear(), start.getMonth(), start.getDate());
  const e = new Date(end.getFullYear(), end.getMonth(), end.getDate());
  if (e < s) return [];
  const list = [];
  const current = new Date(s.getFullYear(), s.getMonth(), 1);
  const endMonth = new Date(e.getFullYear(), e.getMonth(), 1);
  while (current <= endMonth) {
    const year = current.getFullYear();
    const monthIndex = current.getMonth();
    list.push({ year, monthIndex, label: `${MONTH_NAMES[monthIndex]} ${year}` });
    current.setMonth(current.getMonth() + 1);
  }
  return list;
}

const getYearStart = () => {
  const d = new Date();
  return new Date(d.getFullYear(), 0, 1);
};
const getYearEnd = () => {
  const d = new Date();
  return new Date(d.getFullYear(), 11, 31);
};

function formatDate(d) {
  return d.toISOString().slice(0, 10);
}

function formatCurrency(n) {
  return `P${new Intl.NumberFormat("en-PH", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n)}`;
}

const MAX_AMOUNT = 1e12;

function clampAmount(value) {
  if (value === "" || value === null || value === undefined) return value;
  const num = parseFloat(String(value).replace(/,/g, ""));
  if (Number.isNaN(num) || num < 0) return value;
  if (num > MAX_AMOUNT) return String(MAX_AMOUNT);
  return value;
}

const initialMonthlyAmounts = () => Array.from({ length: 12 }, () => "");

function getYearsInRange(start, end) {
  const arr = [];
  for (let y = start.getFullYear(); y <= end.getFullYear(); y++) arr.push(y);
  return arr;
}

const useStyles = makeStyles((theme) => ({
  root: {
    animation: "$fadeIn 0.4s ease",
  },
  "@keyframes fadeIn": {
    from: { opacity: 0, transform: "translateY(10px)" },
    to: { opacity: 1, transform: "translateY(0)" },
  },
  title: {
    fontSize: "1.5rem",
    fontWeight: 600,
    marginBottom: theme.spacing(2.25),
    letterSpacing: "0.01em",
    lineHeight: 1.3,
    textAlign: "center",
    color: "#1a1a1a",
    [theme.breakpoints.down("sm")]: {
      fontSize: "1.375rem",
      marginBottom: theme.spacing(1.5),
    },
  },
  layout: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: theme.spacing(2.75),
    alignContent: "start",
    maxWidth: 960,
    margin: "0 auto",
    [theme.breakpoints.down("md")]: {
      gridTemplateColumns: "1fr",
    },
  },
  formPaper: {
    padding: theme.spacing(2.25),
    borderRadius: 16,
    boxShadow: "0 2px 12px rgba(0, 0, 0, 0.06)",
    border: "1px solid rgba(0, 0, 0, 0.06)",
    backgroundColor: "rgba(255, 255, 255, 0.95)",
  },
  formSection: {
    marginBottom: theme.spacing(2.25),
    "&:last-child": { marginBottom: 0 },
  },
  formSectionTitle: {
    fontSize: "0.75rem",
    fontWeight: 600,
    textTransform: "uppercase",
    letterSpacing: "0.06em",
    color: "#6b7280",
    marginBottom: theme.spacing(1),
    paddingBottom: theme.spacing(0.5),
    borderBottom: "1px solid rgba(0, 0, 0, 0.06)",
  },
  formGroup: {
    marginBottom: theme.spacing(1.5),
    "&:last-of-type": { marginBottom: 0 },
  },
  formRow: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: theme.spacing(2),
    [theme.breakpoints.down("xs")]: {
      gridTemplateColumns: "1fr",
    },
  },
  monthlyList: {
    display: "flex",
    flexDirection: "column",
    maxHeight: 280,
    overflowY: "auto",
    overflowX: "hidden",
    padding: theme.spacing(0.5, 0),
    border: "1px solid rgba(0, 0, 0, 0.08)",
    borderRadius: 10,
    backgroundColor: "rgba(0, 0, 0, 0.02)",
  },
  monthlyRow: {
    display: "grid",
    gridTemplateColumns: "1fr auto",
    gap: theme.spacing(2),
    alignItems: "center",
    padding: theme.spacing(0.75, 1),
    minHeight: 40,
    borderBottom: "1px solid rgba(0, 0, 0, 0.05)",
    "&:last-child": { borderBottom: "none" },
    [theme.breakpoints.down("xs")]: {
      gridTemplateColumns: "1fr",
    },
  },
  monthlyRowLabel: {
    fontSize: "0.8125rem",
    fontWeight: 500,
    color: "#374151",
  },
  monthlyRowInput: {
    width: 120,
    [theme.breakpoints.down("xs")]: { width: "100%" },
  },
  formHint: {
    fontSize: "0.75rem",
    color: "#6b7280",
    marginTop: theme.spacing(0.5),
  },
  formHintStandalone: {
    marginTop: 0,
    padding: theme.spacing(1, 0),
  },
  btnReset: {
    marginTop: theme.spacing(1.5),
    textTransform: "none",
    color: "#6b7280",
    "&:hover": {
      backgroundColor: "rgba(0, 0, 0, 0.04)",
      color: "#374151",
    },
  },
  receiptWrap: {
    background: "transparent",
    boxShadow: "none",
    padding: 0,
  },
}));

function Calculator() {
  const classes = useStyles();
  const [salaryMode, setSalaryMode] = useState("single");
  const [monthlySalary, setMonthlySalary] = useState("");
  const [monthlyAmountsByYear, setMonthlyAmountsByYear] = useState({});
  const [startDate, setStartDate] = useState(formatDate(getYearStart()));
  const [endDate, setEndDate] = useState(formatDate(getYearEnd()));
  const [unpaidDays, setUnpaidDays] = useState("0");
  const [allowances, setAllowances] = useState("0");
  const [copied, setCopied] = useState(false);
  const [showPerMonth, setShowPerMonth] = useState(false);

  const monthlyNum = parseFloat(monthlySalary) || 0;
  const isPerMonthMode = salaryMode === "perMonth";
  const start = new Date(startDate);
  const end = new Date(endDate);
  const unpaid = Math.max(0, parseInt(unpaidDays, 10) || 0);
  const allowancesNum = parseFloat(allowances) || 0;
  const yearsInRange = getYearsInRange(start, end);
  const applicableMonths = getApplicableMonths(start, end);
  const maxWeekdays = countWeekdaysInRange(start, end);

  useEffect(() => {
    if (unpaidDays === "") return;
    const n = parseInt(unpaidDays, 10);
    if (!Number.isNaN(n) && maxWeekdays >= 0 && n > maxWeekdays) {
      setUnpaidDays(String(maxWeekdays));
    }
  }, [maxWeekdays, unpaidDays]);

  const getAmountsForYear = useCallback(
    (year) => monthlyAmountsByYear[year] || initialMonthlyAmounts(),
    [monthlyAmountsByYear],
  );
  const amountsByYearForCalc =
    yearsInRange.length > 0
      ? yearsInRange.reduce((acc, year) => {
          acc[year] = getAmountsForYear(year).map(
            (v) => parseFloat(String(v).replace(/,/g, "")) || 0,
          );
          return acc;
        }, {})
      : {};

  const singleResult = computeTotalBasicEarned(monthlyNum, start, end, unpaid);
  const perMonthResult = computeTotalBasicEarnedFromMonthlyAmounts(
    amountsByYearForCalc,
    start,
    end,
    unpaid,
  );

  const { totalBasicEarned, dailyRate, unpaidDeduction } = isPerMonthMode
    ? perMonthResult
    : singleResult;
  const totalFor13th = totalBasicEarned + allowancesNum;
  const thirteenthMonth = compute13thMonthPay(totalFor13th);
  const earningsPerMonth = isPerMonthMode
    ? perMonthResult.earningsPerMonth || []
    : computeEarningsPerMonth(monthlyNum, start, end);
  const hasAnySalary = isPerMonthMode
    ? applicableMonths.some(
        ({ year, monthIndex }) =>
          (parseFloat(String(getAmountsForYear(year)[monthIndex]).replace(/,/g, "")) || 0) > 0,
      )
    : monthlyNum > 0;

  const receiptBarcodeValue =
    hasAnySalary && totalFor13th > 0
      ? `13M${formatDate(new Date()).replace(/-/g, "")}${Math.round(thirteenthMonth)}`
      : "";

  const handlePrint = useCallback(() => window.print(), []);
  const handleCopy = useCallback(() => {
    const text = formatCurrency(thirteenthMonth);
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text).then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
      });
    }
  }, [thirteenthMonth]);

  const handleReset = useCallback(() => {
    setSalaryMode("single");
    setMonthlySalary("");
    setMonthlyAmountsByYear({});
    setStartDate(formatDate(getYearStart()));
    setEndDate(formatDate(getYearEnd()));
    setUnpaidDays("0");
    setAllowances("0");
  }, []);

  const setMonthlyAmount = useCallback((year, index, value) => {
    setMonthlyAmountsByYear((prev) => {
      const arr = prev[year] || initialMonthlyAmounts();
      const next = [...arr];
      next[index] = clampAmount(value);
      return { ...prev, [year]: next };
    });
  }, []);

  return (
    <Box className={`${classes.root} calculator`}>
      <Typography variant="h1" className={classes.title}>
        13th Month Pay Calculator
      </Typography>

      <Box className={classes.layout}>
        <Paper className={classes.formPaper} elevation={0}>
          <Box className={classes.formSection}>
            <Typography className={classes.formSectionTitle}>Salary</Typography>
            <Box className={classes.formGroup}>
              <FormControl variant="outlined" fullWidth size="small">
                <InputLabel id="salary-type-label">Type</InputLabel>
                <Select
                  labelId="salary-type-label"
                  value={salaryMode === "single" ? "fixed" : "variable"}
                  onChange={(e) =>
                    setSalaryMode(e.target.value === "fixed" ? "single" : "perMonth")
                  }
                  label="Type"
                >
                  <MenuItem value="fixed">Fixed Monthly Salary</MenuItem>
                  <MenuItem value="variable">Variable Monthly Salary</MenuItem>
                </Select>
              </FormControl>
            </Box>
            {salaryMode === "single" && (
              <Box className={classes.formGroup}>
                <TextField
                  label="Monthly amount (PHP)"
                  type="number"
                  inputProps={{ min: 0, max: MAX_AMOUNT, step: "0.01" }}
                  placeholder="e.g. 25000"
                  value={monthlySalary}
                  onChange={(e) => setMonthlySalary(clampAmount(e.target.value))}
                  variant="outlined"
                  fullWidth
                  size="small"
                />
              </Box>
            )}
          </Box>

          <Box className={classes.formSection}>
            <Typography className={classes.formSectionTitle}>Period</Typography>
            <Box className={classes.formRow}>
              <TextField
                label="Start date"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                variant="outlined"
                fullWidth
                size="small"
                InputLabelProps={{ shrink: true }}
              />
              <TextField
                label="Calculation date"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                variant="outlined"
                fullWidth
                size="small"
                InputLabelProps={{ shrink: true }}
              />
            </Box>
          </Box>

          {salaryMode === "perMonth" && (
            <Box className={classes.formSection}>
              <Typography className={classes.formSectionTitle}>
                Amount per month (PHP)
              </Typography>
              {applicableMonths.length === 0 ? (
                <Typography className={`${classes.formHint} ${classes.formHintStandalone}`}>
                  Set dates above to see applicable months.
                </Typography>
              ) : (
                <Box className={classes.monthlyList}>
                  {applicableMonths.map(({ year, monthIndex, label }) => (
                    <Box key={`${year}-${monthIndex}`} className={classes.monthlyRow}>
                      <Typography className={classes.monthlyRowLabel}>{label}</Typography>
                      <TextField
                        type="number"
                        inputProps={{ min: 0, max: MAX_AMOUNT, step: "0.01" }}
                        placeholder="0"
                        value={getAmountsForYear(year)[monthIndex]}
                        onChange={(e) => setMonthlyAmount(year, monthIndex, e.target.value)}
                        variant="outlined"
                        size="small"
                        className={classes.monthlyRowInput}
                      />
                    </Box>
                  ))}
                </Box>
              )}
            </Box>
          )}

          <Box className={classes.formSection}>
            <Typography className={classes.formSectionTitle}>Other</Typography>
            <Box className={classes.formRow}>
              <TextField
                label="Allowances (PHP)"
                type="number"
                inputProps={{ min: 0, max: MAX_AMOUNT, step: "0.01" }}
                placeholder="0"
                value={allowances}
                onChange={(e) => setAllowances(clampAmount(e.target.value))}
                variant="outlined"
                fullWidth
                size="small"
              />
              <TextField
                label="Unpaid days"
                type="number"
                inputProps={{ min: 0, max: maxWeekdays, step: 1 }}
                placeholder="0"
                value={unpaidDays}
                onChange={(e) => {
                  const v = e.target.value;
                  if (v === "") {
                    setUnpaidDays(v);
                    return;
                  }
                  const n = parseInt(v, 10);
                  if (Number.isNaN(n) || n < 0) return;
                  setUnpaidDays(n > maxWeekdays ? String(maxWeekdays) : v);
                }}
                variant="outlined"
                fullWidth
                size="small"
              />
            </Box>
            {maxWeekdays > 0 && (
              <Typography className={classes.formHint}>
                Up to {maxWeekdays} workdays in period
              </Typography>
            )}
            {salaryMode === "single" && (
              <Box className={classes.formGroup} style={{ marginTop: 8 }}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={showPerMonth}
                      onChange={(e) => setShowPerMonth(e.target.checked)}
                      color="primary"
                    />
                  }
                  label="Show salary per month"
                />
              </Box>
            )}
            <Button type="button" className={classes.btnReset} onClick={handleReset}>
              Reset
            </Button>
          </Box>
        </Paper>

        <section className={`calculator-results receipt ${classes.receiptWrap}`}>
          <div className="receipt-paper">
            <div className="receipt-print-header" aria-hidden="true">
              <span className="receipt-print-title">13th Month Pay Calculator</span>
              <span className="receipt-print-date">
                {new Date().toLocaleString("en-PH", { dateStyle: "medium", timeStyle: "short" })}
              </span>
            </div>
            <div className="receipt-header">
              <h2 className="receipt-title">13TH MONTH PAY</h2>
              <div className="receipt-sub">Estimate</div>
            </div>
            <div className="receipt-body">
              <div className="receipt-line">
                <span>Basic salary earned</span>
                <span>{formatCurrency(totalBasicEarned)}</span>
              </div>
              {allowancesNum > 0 && (
                <div className="receipt-line">
                  <span>Allowances</span>
                  <span>+{formatCurrency(allowancesNum)}</span>
                </div>
              )}
              {unpaid > 0 && (
                <div className="receipt-line receipt-line-deduct">
                  <span>Unpaid absence</span>
                  <span>-{formatCurrency(unpaidDeduction)}</span>
                </div>
              )}
              {(showPerMonth || isPerMonthMode) && earningsPerMonth.length > 0 && (
                <div className="receipt-per-month">
                  <div className="receipt-per-month-title">Salary per month</div>
                  <ul className="receipt-per-month-list">
                    {earningsPerMonth.map((m) => (
                      <li key={`${m.year}-${m.month}`} className="receipt-per-month-item">
                        <span className="receipt-per-month-label">
                          {m.label}
                          {m.daysWorked != null &&
                            m.daysInMonth != null &&
                            m.daysWorked < m.daysInMonth && (
                              <span className="receipt-per-month-days">
                                {" "}({m.daysWorked}/{m.daysInMonth} days)
                              </span>
                            )}
                        </span>
                        <span className="receipt-per-month-amount">
                          {formatCurrency(m.earned)}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              <div className="receipt-divider" aria-hidden="true" />
              {hasAnySalary && totalFor13th > 0 && (
                <div className="receipt-calculation">
                  <div className="receipt-calculation-formula">
                    {formatCurrency(totalFor13th)} ÷ 12 = {formatCurrency(thirteenthMonth)}
                  </div>
                  <div className="receipt-calculation-label">
                    13th Month Pay = Total earned in period ÷ 12
                  </div>
                </div>
              )}
              <div className="receipt-line receipt-total">
                <span>13TH MONTH PAY</span>
                <span>{formatCurrency(thirteenthMonth)}</span>
              </div>
              {receiptBarcodeValue && (
                <div className="receipt-barcode">
                  <Barcode
                    value={receiptBarcodeValue}
                    format="CODE128"
                    width={1.2}
                    height={36}
                    displayValue={true}
                    fontSize={10}
                    margin={4}
                  />
                </div>
              )}
              {hasAnySalary && (
                <div className="receipt-actions">
                  <button
                    type="button"
                    className={`btn-copy ${copied ? "copied" : ""}`}
                    onClick={handleCopy}
                    title="Copy amount"
                  >
                    {copied ? "Copied!" : "Copy"}
                  </button>
                  <button
                    type="button"
                    className="btn-print"
                    onClick={handlePrint}
                    title="Print receipt"
                  >
                    Print
                  </button>
                </div>
              )}
            </div>
            {hasAnySalary && (
              <div className="receipt-footer">
                {salaryMode === "single"
                  ? `Daily rate (÷22): ${formatCurrency(dailyRate)}/day`
                  : `Effective daily rate (period): ${formatCurrency(dailyRate)}/day`}
              </div>
            )}
          </div>
        </section>
      </Box>
    </Box>
  );
}

export default Calculator;
