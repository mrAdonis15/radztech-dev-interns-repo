import React, { useState, useCallback, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
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
  Collapse,
  makeStyles,
} from "@material-ui/core";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";
import ExpandLessIcon from "@material-ui/icons/ExpandLess";
import {
  computeTotalBasicEarned,
  compute13thMonthPay,
  countWeekdaysInRange,
  computeEarningsPerMonth,
  computeTotalBasicEarnedFromMonthlyAmounts,
} from "../utils/thirteenthMonthCalc";
import "../Calculator/Calculator.css";

function formatCurrency(n) {
  return `P${new Intl.NumberFormat("en-PH", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Number(n))}`;
}

const MONTH_NAMES = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];
const MONTH_SHORT = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

const FAQ_ITEMS = [
  {
    question: "Who is eligible for 13th month pay?",
    answer:
      "Rank-and-file employees in the private sector who worked at least one (1) month during the calendar year are entitled to 13th month pay. This includes regular, probationary, and casual employees. Excluded under Presidential Decree No. 851 (as amended) are: government employees and those of government-owned and -controlled corporations; employers’ household helpers and persons in the personal service of another; and managerial employees as defined under the law. Some employers voluntarily extend the benefit to excluded groups.",
  },
  {
    question: "When must 13th month pay be paid?",
    answer:
      "The full amount must be paid not later than December 24 of each year. An employer may give the full amount in one go or split it (e.g., mid-year and year-end), but the total must be settled by December 24. Failure to pay on time can result in penalties under labor laws.",
  },
  {
    question: "What counts as basic salary for 13th month pay?",
    answer:
      "Basic salary includes: (1) All remuneration for work performed, whether fixed or variable; (2) Cash value of vacation, sick, and maternity leave; (3) Other payments that are considered part of the regular compensation. Excluded from the computation are: cost-of-living allowances; profit-sharing and other bonuses (unless treated as part of basic salary); cash equivalent of unused leave credits beyond the legal minimum; overtime pay; premium for night/shift work; and other fringe benefits. If your employment contract or company policy treats certain allowances as part of basic salary, they may be included.",
  },
  {
    question: "How is 13th month pay computed?",
    answer:
      "For employees who worked less than 12 months, only the basic salary actually earned from January 1 (or date of hiring) to December 31 (or date of separation) is used. Unpaid absences may be deducted on a per-day basis using the applicable daily rate.",
  },
  {
    question: 'What are "allowances" in this calculator?',
    answer:
      'The "Type of allowance" and "Amount" fields let you add payments that your employer includes in the 13th month computation. Common examples: rice allowance, transportation allowance, or similar benefits that are considered part of your taxable compensation. Not all companies include these—check your company policy or HR. Only add allowances that your employer actually counts toward 13th month pay.',
  },
  {
    question: "What if I have unpaid absences?",
    answer:
      "Unpaid absences (e.g., undertime, unpaid leave, absences without leave) may be deducted from your total basic salary earned before dividing by 12. The calculator uses your effective daily rate (monthly basic ÷ 22, or prorated from variable monthly amounts) and multiplies by the number of unpaid days you enter. The result is an estimate; your employer may use a different divisor or policy.",
  },
  {
    question: "Is 13th month pay taxable?",
    answer:
      "Yes. 13th month pay and other benefits (e.g., productivity bonus, Christmas bonus) totaling more than P90,000 in a year are subject to withholding tax on the excess. The first P90,000 of these benefits is tax-exempt. The calculator shows gross 13th month pay; net pay after tax depends on your total income and withholding rules.",
  },
  {
    question: "Where is the law on 13th month pay?",
    answer:
      "13th month pay is mandated by Presidential Decree No. 851 (December 16, 1975), as amended by Memorandum Order No. 28 (August 13, 1986) and clarified by the Department of Labor and Employment (DOLE). For official rules and updates, refer to DOLE and the Labor Code of the Philippines.",
  },
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
    list.push({ year, monthIndex, label: MONTH_NAMES[monthIndex] });
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
    fontFamily: '"Roboto", sans-serif',
    animation: "$fadeIn 0.35s ease",
  },
  "@keyframes fadeIn": {
    from: { opacity: 0 },
    to: { opacity: 1 },
  },
  title: {
    fontFamily: '"Fira Sans", sans-serif',
    fontSize: "1.5rem",
    fontWeight: 800,
    marginBottom: theme.spacing(2),
    textAlign: "center",
    color: "#DB6700",
    letterSpacing: "0.02em",
    [theme.breakpoints.down("sm")]: {
      fontSize: "1.35rem",
    },
  },
  layout: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: theme.spacing(2),
    alignContent: "start",
    maxWidth: 880,
    margin: "0 auto",
    [theme.breakpoints.down("md")]: {
      gridTemplateColumns: "1fr",
    },
  },
  formPaper: {
    padding: 0,
    borderRadius: 12,
    overflow: "hidden",
  },
  sectionCard: {
    background: "linear-gradient(135deg, #DB6700 0%, #F7B272 100%)",
    padding: 1,
    borderRadius: 12,
    overflow: "hidden",
    boxShadow:
      "0 4px 20px rgba(0, 0, 0, 0.12), 0 2px 8px rgba(219, 103, 0, 0.15)",
  },
  sectionCardInner: {
    background: "#fff",
    borderRadius: 10,
    padding: theme.spacing(2),
    minHeight: "100%",
    fontFamily: '"Roboto", sans-serif',
    boxShadow: "inset 0 1px 0 rgba(255, 255, 255, 0.9)",
  },
  formSection: {
    marginBottom: theme.spacing(2),
    "&:last-child": { marginBottom: 0 },
  },
  formSectionTitle: {
    fontFamily: '"Fira Sans", sans-serif',
    fontSize: "0.6875rem",
    fontWeight: 600,
    textTransform: "uppercase",
    letterSpacing: "0.05em",
    color: "#888",
    marginBottom: theme.spacing(1),
  },
  formGroup: {
    marginBottom: theme.spacing(1.25),
    "&:last-of-type": { marginBottom: 0 },
  },
  formRow: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: theme.spacing(1.5),
    [theme.breakpoints.down("xs")]: {
      gridTemplateColumns: "1fr",
    },
  },
  allowanceRow: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr auto",
    gap: theme.spacing(1.5),
    alignItems: "center",
    [theme.breakpoints.down("xs")]: {
      gridTemplateColumns: "1fr auto",
    },
  },
  /* Variable monthly: compact grid Jan–Dec */
  monthlyGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(4, 1fr)",
    gap: theme.spacing(1),
    [theme.breakpoints.down("xs")]: {
      gridTemplateColumns: "repeat(3, 1fr)",
    },
  },
  monthlyCell: {
    display: "flex",
    flexDirection: "column",
    gap: theme.spacing(0.5),
  },
  monthlyCellLabel: {
    fontFamily: '"Roboto", sans-serif',
    fontSize: "0.6875rem",
    fontWeight: 500,
    color: "#888",
    textTransform: "uppercase",
    letterSpacing: "0.03em",
  },
  monthlyCellInput: {
    "& .MuiOutlinedInput-root": {
      fontSize: "0.8125rem",
      "& input": { padding: "6px 8px" },
    },
  },
  formHint: {
    fontFamily: '"Roboto", sans-serif',
    fontSize: "0.75rem",
    color: "#888",
    marginTop: theme.spacing(0.5),
  },
  formHintStandalone: {
    fontFamily: '"Roboto", sans-serif',
    marginTop: 0,
    padding: theme.spacing(0.5, 0),
    fontSize: "0.8125rem",
    color: "#666",
  },
  btnReset: {
    fontFamily: '"Roboto", sans-serif',
    marginTop: theme.spacing(1.25),
    textTransform: "none",
    fontSize: "0.8125rem",
    color: "#888",
    "&:hover": {
      backgroundColor: "transparent",
      color: "#111",
    },
  },
  btnAddAllowance: {
    fontFamily: '"Roboto", sans-serif',
    textTransform: "none",
    fontSize: "0.8125rem",
    color: "#DB6700",
    marginTop: theme.spacing(0.5),
    "&:hover": {
      backgroundColor: "rgba(219, 103, 0, 0.08)",
      color: "#DB6700",
    },
  },
  btnRemoveAllowance: {
    fontFamily: '"Roboto", sans-serif',
    textTransform: "none",
    fontSize: "0.75rem",
    color: "#888",
    minWidth: 64,
    "&:hover": {
      backgroundColor: "rgba(0, 0, 0, 0.04)",
      color: "#111",
    },
  },
  receiptWrap: {
    background: "transparent",
    boxShadow: "none",
    padding: 0,
  },
  sectionBelow: {
    marginTop: theme.spacing(3),
    paddingTop: theme.spacing(2),
    borderTop: "1px solid #eee",
    maxWidth: 880,
    marginLeft: "auto",
    marginRight: "auto",
    width: "100%",
  },
  sectionTitle: {
    fontFamily: '"Fira Sans", sans-serif',
    fontSize: "1rem",
    fontWeight: 600,
    color: "#111",
    marginBottom: theme.spacing(1.5),
  },
  faqIntro: {
    fontFamily: '"Roboto", sans-serif',
    fontSize: "0.8125rem",
    color: "#666",
    marginBottom: theme.spacing(1.5),
    lineHeight: 1.5,
  },
  faqItem: {
    marginBottom: theme.spacing(0.5),
    borderBottom: "1px solid #eee",
    "&:last-child": { marginBottom: 0, borderBottom: "none" },
  },
  faqButton: {
    width: "100%",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: theme.spacing(1.25, 0),
    textAlign: "left",
    background: "none",
    border: "none",
    cursor: "pointer",
    font: "inherit",
    color: "inherit",
    "&:hover": {
      opacity: 0.85,
    },
  },
  faqQuestion: {
    fontFamily: '"Fira Sans", sans-serif',
    fontSize: "0.9375rem",
    fontWeight: 600,
    color: "#111",
    flex: 1,
    paddingRight: theme.spacing(1),
  },
  faqIcon: {
    flexShrink: 0,
    color: "#DB6700",
  },
  faqAnswer: {
    fontFamily: '"Roboto", sans-serif',
    fontSize: "0.8125rem",
    color: "#555",
    lineHeight: 1.65,
    paddingBottom: theme.spacing(1.5),
    paddingLeft: 0,
  },
  contactCard: {
    marginTop: theme.spacing(2.5),
    paddingTop: theme.spacing(1.75),
    borderTop: "1px solid #eee",
  },
  contactTitle: {
    fontFamily: '"Fira Sans", sans-serif',
    fontSize: "0.9375rem",
    fontWeight: 600,
    marginBottom: theme.spacing(1),
  },
  contactBody: {
    fontFamily: '"Roboto", sans-serif',
    fontSize: "0.8125rem",
    color: "#444",
    lineHeight: 1.6,
  },
}));

function Calculator() {
  const classes = useStyles();
  const navigate = useNavigate();
  const [salaryMode, setSalaryMode] = useState("single");
  const [monthlySalary, setMonthlySalary] = useState("");
  const [monthlyAmountsByYear, setMonthlyAmountsByYear] = useState({});
  const [startDate, setStartDate] = useState(formatDate(getYearStart()));
  const [endDate, setEndDate] = useState(formatDate(getYearEnd()));
  const [unpaidDays, setUnpaidDays] = useState("0");
  const [allowanceEntries, setAllowanceEntries] = useState([
    { id: 0, type: "", amount: "0" },
  ]);
  const [expandedFaq, setExpandedFaq] = useState(null);
  const [showPerMonth, setShowPerMonth] = useState(false);

  const monthlyNum = parseFloat(monthlySalary) || 0;
  const isPerMonthMode = salaryMode === "perMonth";
  const start = useMemo(
    () => (isPerMonthMode ? getYearStart() : new Date(startDate)),
    [isPerMonthMode, startDate],
  );
  const end = useMemo(
    () => (isPerMonthMode ? getYearEnd() : new Date(endDate)),
    [isPerMonthMode, endDate],
  );
  const unpaid = Math.max(0, parseInt(unpaidDays, 10) || 0);
  const allowancesNum = allowanceEntries.reduce(
    (sum, e) => sum + (parseFloat(String(e.amount).replace(/,/g, "")) || 0),
    0,
  );
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
  const earningsPerMonth = useMemo(
    () =>
      isPerMonthMode
        ? perMonthResult.earningsPerMonth || []
        : computeEarningsPerMonth(monthlyNum, start, end),
    [isPerMonthMode, perMonthResult.earningsPerMonth, monthlyNum, start, end],
  );
  const hasAnySalary = isPerMonthMode
    ? applicableMonths.some(
        ({ year, monthIndex }) =>
          (parseFloat(
            String(getAmountsForYear(year)[monthIndex]).replace(/,/g, ""),
          ) || 0) > 0,
      )
    : monthlyNum > 0;

  const handleViewFullResult = useCallback(() => {
    const startStr =
      salaryMode === "single" ? startDate : formatDate(getYearStart());
    const endStr = salaryMode === "single" ? endDate : formatDate(getYearEnd());
    navigate("/BDCalculator/result", {
      state: {
        thirteenthMonth,
        totalBasicEarned,
        totalFor13th,
        dailyRate,
        unpaidDeduction,
        allowanceEntries: allowanceEntries.map((e) => ({
          type: e.type,
          amount: e.amount,
        })),
        earningsPerMonth: earningsPerMonth.map((m) => ({
          label: m.label,
          earned: m.earned,
        })),
        salaryMode,
        startDate: startStr,
        endDate: endStr,
        unpaidDays,
      },
    });
  }, [
    navigate,
    thirteenthMonth,
    totalBasicEarned,
    totalFor13th,
    dailyRate,
    unpaidDeduction,
    allowanceEntries,
    earningsPerMonth,
    salaryMode,
    startDate,
    endDate,
    unpaidDays,
  ]);

  const handleReset = useCallback(() => {
    setSalaryMode("single");
    setMonthlySalary("");
    setMonthlyAmountsByYear({});
    setStartDate(formatDate(getYearStart()));
    setEndDate(formatDate(getYearEnd()));
    setUnpaidDays("0");
    setAllowanceEntries([{ id: 0, type: "", amount: "0" }]);
  }, []);

  const setMonthlyAmount = useCallback((year, index, value) => {
    setMonthlyAmountsByYear((prev) => {
      const arr = prev[year] || initialMonthlyAmounts();
      const next = [...arr];
      next[index] = clampAmount(value);
      return { ...prev, [year]: next };
    });
  }, []);

  const addAllowanceEntry = useCallback(() => {
    setAllowanceEntries((prev) => [
      ...prev,
      {
        id: prev.length > 0 ? Math.max(...prev.map((e) => e.id)) + 1 : 0,
        type: "",
        amount: "0",
      },
    ]);
  }, []);

  const removeAllowanceEntry = useCallback((id) => {
    setAllowanceEntries((prev) => {
      const next = prev.filter((e) => e.id !== id);
      return next.length > 0 ? next : [{ id: 0, type: "", amount: "0" }];
    });
  }, []);

  const updateAllowanceEntry = useCallback((id, field, value) => {
    setAllowanceEntries((prev) =>
      prev.map((e) =>
        e.id === id
          ? { ...e, [field]: field === "amount" ? clampAmount(value) : value }
          : e,
      ),
    );
  }, []);

  return (
    <Box className={`${classes.root} calculator`}>
      <Typography variant="h1" className={classes.title}>
        13th Month Pay Calculator
      </Typography>

      <Box className={classes.layout}>
        <Paper
          className={`${classes.formPaper} ${classes.sectionCard}`}
          elevation={0}
        >
          <div className={classes.sectionCardInner}>
            <Box className={classes.formSection}>
              <Typography className={classes.formSectionTitle}>
                Salary
              </Typography>
              <Box className={classes.formGroup}>
                <FormControl variant="outlined" fullWidth size="small">
                  <InputLabel id="salary-type-label">Type</InputLabel>
                  <Select
                    labelId="salary-type-label"
                    value={salaryMode === "single" ? "fixed" : "variable"}
                    onChange={(e) =>
                      setSalaryMode(
                        e.target.value === "fixed" ? "single" : "perMonth",
                      )
                    }
                    label="Type"
                  >
                    <MenuItem value="fixed">Fixed Monthly Salary</MenuItem>
                    <MenuItem value="variable">
                      Variable Monthly Salary
                    </MenuItem>
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
                    onChange={(e) =>
                      setMonthlySalary(clampAmount(e.target.value))
                    }
                    variant="outlined"
                    fullWidth
                    size="small"
                  />
                </Box>
              )}
            </Box>

            <Box className={classes.formSection}>
              <Typography className={classes.formSectionTitle}>
                Employment Period
              </Typography>
              {salaryMode === "single" ? (
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
              ) : (
                <Typography
                  className={`${classes.formHint} ${classes.formHintStandalone}`}
                >
                  January – December (full calendar year)
                </Typography>
              )}
            </Box>

            {salaryMode === "perMonth" && (
              <Box className={classes.formSection}>
                <Typography className={classes.formSectionTitle}>
                  Amount per month (PHP)
                </Typography>
                <Box className={classes.monthlyGrid}>
                  {applicableMonths.map(({ year, monthIndex }) => (
                    <Box
                      key={`${year}-${monthIndex}`}
                      className={classes.monthlyCell}
                    >
                      <Typography className={classes.monthlyCellLabel}>
                        {MONTH_SHORT[monthIndex]}
                      </Typography>
                      <TextField
                        type="number"
                        inputProps={{ min: 0, max: MAX_AMOUNT, step: "0.01" }}
                        placeholder="0"
                        value={getAmountsForYear(year)[monthIndex]}
                        onChange={(e) =>
                          setMonthlyAmount(year, monthIndex, e.target.value)
                        }
                        variant="outlined"
                        size="small"
                        className={classes.monthlyCellInput}
                        fullWidth
                      />
                    </Box>
                  ))}
                </Box>
              </Box>
            )}

            <Box className={classes.formSection}>
              <Typography className={classes.formSectionTitle}>
                Allowances
              </Typography>
              {allowanceEntries.map((entry) => (
                <Box
                  key={entry.id}
                  className={
                    allowanceEntries.length > 1
                      ? classes.allowanceRow
                      : classes.formRow
                  }
                  style={{ marginBottom: 8 }}
                >
                  <TextField
                    label="Type of allowance"
                    placeholder="e.g. rice, transportation"
                    value={entry.type}
                    onChange={(e) =>
                      updateAllowanceEntry(entry.id, "type", e.target.value)
                    }
                    variant="outlined"
                    fullWidth
                    size="small"
                  />
                  <TextField
                    label="Amount"
                    type="number"
                    inputProps={{ min: 0, max: MAX_AMOUNT, step: "0.01" }}
                    placeholder="0"
                    value={entry.amount}
                    onChange={(e) =>
                      updateAllowanceEntry(entry.id, "amount", e.target.value)
                    }
                    variant="outlined"
                    fullWidth
                    size="small"
                  />
                  {allowanceEntries.length > 1 && (
                    <Button
                      type="button"
                      size="small"
                      onClick={() => removeAllowanceEntry(entry.id)}
                      className={classes.btnRemoveAllowance}
                    >
                      Remove
                    </Button>
                  )}
                </Box>
              ))}
              <Button
                type="button"
                size="small"
                onClick={addAllowanceEntry}
                className={classes.btnAddAllowance}
              >
                + Add allowance
              </Button>
            </Box>

            <Box className={classes.formSection}>
              <Typography className={classes.formSectionTitle}>
                Other
              </Typography>
              <Box className={classes.formRow}>
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
              <Button
                type="button"
                className={classes.btnReset}
                onClick={handleReset}
              >
                Reset
              </Button>
            </Box>
          </div>
        </Paper>

        <section
          className={`calculator-results receipt ${classes.receiptWrap}`}
        >
          <div className={`receipt-paper ${classes.sectionCard}`}>
            <div className="receipt-paper-inner">
              <div className="receipt-header">
                <h2 className="receipt-title">13TH MONTH PAY</h2>
                <div className="receipt-sub">Estimate</div>
              </div>
              <div className="receipt-body">
                {!hasAnySalary || totalFor13th <= 0 ? (
                  <p
                    style={{
                      fontSize: "0.875rem",
                      color: "#555",
                      marginBottom: 0,
                    }}
                  >
                    Fill in your salary details on the left to see your 13th
                    month pay estimate.
                  </p>
                ) : (
                  <>
                    <div className="receipt-line">
                      <span>Basic salary earned</span>
                      <span>{formatCurrency(totalBasicEarned)}</span>
                    </div>
                    {allowanceEntries
                      .filter(
                        (e) =>
                          (parseFloat(String(e.amount).replace(/,/g, "")) ||
                            0) > 0,
                      )
                      .map((e, i) => (
                        <div key={i} className="receipt-line">
                          <span>{e.type || "Allowance"}</span>
                          <span>
                            +
                            {formatCurrency(
                              parseFloat(String(e.amount).replace(/,/g, "")) ||
                                0,
                            )}
                          </span>
                        </div>
                      ))}
                    {Number(unpaidDeduction) > 0 && (
                      <div className="receipt-line receipt-line-deduct">
                        <span>Unpaid absence deduction</span>
                        <span>-{formatCurrency(unpaidDeduction)}</span>
                      </div>
                    )}
                    <div className="receipt-line">
                      <span>Total for 13th month</span>
                      <span>{formatCurrency(totalFor13th)}</span>
                    </div>
                    <hr className="receipt-divider" />
                    <div className="receipt-total">
                      <span>13TH MONTH PAY</span>
                      <span>{formatCurrency(thirteenthMonth)}</span>
                    </div>
                    {dailyRate > 0 && (
                      <p
                        style={{
                          fontFamily: '"Roboto", sans-serif',
                          fontSize: "0.75rem",
                          color: "#888",
                          marginTop: 8,
                          marginBottom: 0,
                        }}
                      >
                        Daily rate: {formatCurrency(dailyRate)}/day
                      </p>
                    )}
                    <p
                      style={{
                        fontFamily: '"Roboto", sans-serif',
                        fontSize: "0.8125rem",
                        marginTop: 12,
                        marginBottom: 0,
                      }}
                    >
                      <button
                        type="button"
                        onClick={handleViewFullResult}
                        style={{
                          background: "none",
                          border: "none",
                          padding: 0,
                          font: "inherit",
                          color: "#DB6700",
                          fontWeight: 600,
                          cursor: "pointer",
                          textDecoration: "underline",
                        }}
                      >
                        View full breakdown
                      </button>
                    </p>
                  </>
                )}
              </div>
            </div>
          </div>
        </section>
      </Box>

      <Box className={`${classes.sectionBelow} ${classes.sectionCard}`}>
        <div className={classes.sectionCardInner}>
          <Typography component="h2" className={classes.sectionTitle}>
            Frequently Asked Questions
          </Typography>
          <Typography className={classes.faqIntro}>
            Click a question to expand. Information is for general reference;
            refer to DOLE and your employer for official rules.
          </Typography>
          {FAQ_ITEMS.map((faq, index) => (
            <Box key={index} className={classes.faqItem}>
              <button
                type="button"
                className={classes.faqButton}
                onClick={() =>
                  setExpandedFaq((prev) => (prev === index ? null : index))
                }
                aria-expanded={expandedFaq === index}
                aria-controls={`faq-panel-${index}`}
                id={`faq-heading-${index}`}
              >
                <Typography component="span" className={classes.faqQuestion}>
                  {faq.question}
                </Typography>
                {expandedFaq === index ? (
                  <ExpandLessIcon
                    className={classes.faqIcon}
                    fontSize="small"
                  />
                ) : (
                  <ExpandMoreIcon
                    className={classes.faqIcon}
                    fontSize="small"
                  />
                )}
              </button>
              <Collapse in={expandedFaq === index} timeout="auto" unmountOnExit>
                <div
                  id={`faq-panel-${index}`}
                  role="region"
                  aria-labelledby={`faq-heading-${index}`}
                  className={classes.faqAnswer}
                >
                  {faq.answer}
                </div>
              </Collapse>
            </Box>
          ))}

          <Box className={classes.contactCard}>
            <Typography className={classes.contactTitle}>
              Still have questions about your 13th month pay?
            </Typography>
            <Typography className={classes.contactBody}>
              For edge cases (irregular schedules, multiple employers, complex
              allowances), you can email our team at{" "}
              <a href="mailto:support@radztech.ph">support@radztech.ph</a>. We
              can help you interpret this estimate and understand how DOLE rules
              apply to you.
            </Typography>
          </Box>
        </div>
      </Box>
    </Box>
  );
}

export default Calculator;
