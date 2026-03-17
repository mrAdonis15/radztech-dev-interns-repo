import React, { useState } from "react";
import { Link as RouterLink, useLocation } from "react-router-dom";
import {
  Box,
  Typography,
  TextField,
  Button,
  FormControlLabel,
  Checkbox,
  makeStyles,
} from "@material-ui/core";
import EmailIcon from "@material-ui/icons/Email";

function formatCurrency(n) {
  return `P${new Intl.NumberFormat("en-PH", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Number(n))}`;
}

const useStyles = makeStyles((theme) => ({
  root: {
    maxWidth: 560,
    margin: "0 auto",
    fontFamily: '"Roboto", sans-serif',
  },
  title: {
    fontFamily: '"Fira Sans", sans-serif',
    fontSize: "1.5rem",
    fontWeight: 700,
    color: "#1a1a1a",
    marginBottom: theme.spacing(2),
    textAlign: "center",
  },
  noState: {
    textAlign: "center",
    padding: theme.spacing(4, 2),
  },
  noStateText: {
    marginBottom: theme.spacing(2),
    color: "#555",
  },
  link: {
    color: "#DB6700",
    fontWeight: 600,
    textDecoration: "none",
    "&:hover": { textDecoration: "underline" },
  },
  summaryCard: {
    background: "linear-gradient(135deg, #DB6700 0%, #F7B272 100%)",
    padding: 2,
    borderRadius: 12,
    marginBottom: theme.spacing(3),
    boxShadow: "0 4px 20px rgba(0, 0, 0, 0.12)",
  },
  summaryCardInner: {
    background: "#fff",
    borderRadius: 10,
    padding: theme.spacing(2.5),
    textAlign: "center",
  },
  estimateLabel: {
    fontFamily: '"Roboto", sans-serif',
    fontSize: "0.875rem",
    color: "#666",
    marginBottom: theme.spacing(0.5),
  },
  estimateAmount: {
    fontFamily: '"Fira Sans", sans-serif',
    fontSize: "1.75rem",
    fontWeight: 800,
    color: "#DB6700",
  },
  emailSection: {
    marginTop: theme.spacing(3),
    padding: theme.spacing(2.5),
    border: "1px solid #eee",
    borderRadius: 12,
    marginBottom: theme.spacing(3),
  },
  emailSectionTitle: {
    fontFamily: '"Fira Sans", sans-serif',
    fontSize: "1rem",
    fontWeight: 600,
    marginBottom: theme.spacing(1.5),
  },
  emailField: {
    marginBottom: theme.spacing(1.5),
  },
  submitBtn: {
    backgroundColor: "#DB6700",
    color: "#fff",
    textTransform: "none",
    marginTop: theme.spacing(1),
    "&:hover": { backgroundColor: "#C45D00" },
  },
  breakdownCard: {
    background: "#fff",
    border: "1px solid #eee",
    borderRadius: 12,
    padding: theme.spacing(2),
    marginBottom: theme.spacing(2),
  },
  breakdownTitle: {
    fontFamily: '"Fira Sans", sans-serif',
    fontSize: "0.9375rem",
    fontWeight: 600,
    marginBottom: theme.spacing(1.5),
  },
  breakdownLine: {
    display: "flex",
    justifyContent: "space-between",
    fontSize: "0.875rem",
    marginBottom: theme.spacing(0.5),
  },
  breakdownTotal: {
    marginTop: theme.spacing(1),
    paddingTop: theme.spacing(1),
    borderTop: "1px solid #eee",
    fontWeight: 600,
    fontSize: "1rem",
  },
  contactCard: {
    marginTop: theme.spacing(3),
    padding: theme.spacing(2),
    borderRadius: 12,
    border: "1px solid #eee",
    background: "#fafafa",
  },
  contactTitle: {
    fontFamily: '"Fira Sans", sans-serif',
    fontSize: "0.9375rem",
    fontWeight: 600,
    marginBottom: theme.spacing(1),
  },
  contactBody: {
    fontSize: "0.875rem",
    color: "#444",
    lineHeight: 1.6,
  },
}));

export default function Result() {
  const classes = useStyles();
  const location = useLocation();
  const state = location.state || null;

  const [email, setEmail] = useState("");
  const [tipsChecked, setTipsChecked] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [emailError, setEmailError] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    const trimmed = (email || "").trim();
    if (!trimmed) {
      setEmailError("Enter your email address.");
      return;
    }
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!re.test(trimmed)) {
      setEmailError("Enter a valid email address.");
      return;
    }
    setEmailError("");
    setSubmitted(true);
  };

  if (!state) {
    return (
      <Box className={classes.root}>
        <Typography component="h1" className={classes.title}>
          Your 13th Month Result
        </Typography>
        <Box className={classes.noState}>
          <Typography className={classes.noStateText}>
            Run the calculator first to see your estimate and get the full
            result by email.
          </Typography>
          <Typography
            component={RouterLink}
            to="/BDCalculator/calculator"
            className={classes.link}
          >
            Go to 13th month calculator
          </Typography>
        </Box>
      </Box>
    );
  }

  const {
    thirteenthMonth = 0,
    totalBasicEarned = 0,
    totalFor13th = 0,
    dailyRate = 0,
    unpaidDeduction = 0,
    allowanceEntries = [],
    earningsPerMonth = [],
    salaryMode = "single",
    startDate,
    endDate,
  } = state;

  return (
    <Box className={classes.root}>
      <Typography component="h1" className={classes.title}>
        Your 13th Month Result
      </Typography>

      {!submitted ? (
        <Box className={classes.emailSection}>
          <Typography className={classes.emailSectionTitle}>
            Enter your email to see your full computation
          </Typography>
          <form onSubmit={handleSubmit}>
            <TextField
              fullWidth
              type="email"
              label="Email address"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setEmailError("");
              }}
              error={!!emailError}
              helperText={emailError}
              variant="outlined"
              size="small"
              className={classes.emailField}
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={tipsChecked}
                  onChange={(e) => setTipsChecked(e.target.checked)}
                  color="primary"
                />
              }
              label="Send me 13th month tips and updates"
            />
            <div>
              <Button
                type="submit"
                variant="contained"
                className={classes.submitBtn}
                startIcon={<EmailIcon />}
              >
                Email me the full result
              </Button>
            </div>
          </form>
        </Box>
      ) : (
        <>
          <Box className={classes.summaryCard}>
            <Box className={classes.summaryCardInner}>
              <Typography className={classes.estimateLabel}>
                Your 13th month pay estimate
              </Typography>
              <Typography className={classes.estimateAmount}>
                {formatCurrency(thirteenthMonth)}
              </Typography>
            </Box>
          </Box>

          <Box className={classes.breakdownCard}>
            <Typography className={classes.breakdownTitle}>
              Full computation
            </Typography>
            <div className={classes.breakdownLine}>
              <span>Basic salary earned</span>
              <span>{formatCurrency(totalBasicEarned)}</span>
            </div>
            {allowanceEntries
              .filter(
                (e) =>
                  (parseFloat(String(e.amount).replace(/,/g, "")) || 0) > 0,
              )
              .map((e, i) => (
                <div key={i} className={classes.breakdownLine}>
                  <span>{e.type || "Allowance"}</span>
                  <span>
                    +
                    {formatCurrency(
                      parseFloat(String(e.amount).replace(/,/g, "")) || 0,
                    )}
                  </span>
                </div>
              ))}
            {Number(unpaidDeduction) > 0 && (
              <div className={classes.breakdownLine}>
                <span>Unpaid absence deduction</span>
                <span>-{formatCurrency(unpaidDeduction)}</span>
              </div>
            )}
            <div
              className={`${classes.breakdownLine} ${classes.breakdownTotal}`}
            >
              <span>Total for 13th month ÷ 12</span>
              <span>{formatCurrency(totalFor13th)}</span>
            </div>
            <div
              className={`${classes.breakdownLine} ${classes.breakdownTotal}`}
            >
              <span>13th month pay</span>
              <span>{formatCurrency(thirteenthMonth)}</span>
            </div>
            {dailyRate > 0 && (
              <Typography
                style={{ fontSize: "0.75rem", color: "#888", marginTop: 8 }}
              >
                Daily rate: {formatCurrency(dailyRate)}/day
              </Typography>
            )}
          </Box>

          {Array.isArray(earningsPerMonth) && earningsPerMonth.length > 0 && (
            <Box className={classes.breakdownCard}>
              <Typography className={classes.breakdownTitle}>
                Salary per month
              </Typography>
              {earningsPerMonth.map((m, i) => (
                <div key={i} className={classes.breakdownLine}>
                  <span>{m.label}</span>
                  <span>{formatCurrency(m.earned)}</span>
                </div>
              ))}
            </Box>
          )}

          <Box className={classes.breakdownCard}>
            <Typography className={classes.breakdownTitle}>
              How this was computed
            </Typography>
            {salaryMode === "single" ? (
              <Typography style={{ fontSize: "0.8125rem", color: "#444" }}>
                You selected <strong>Fixed Monthly Salary</strong>. We prorated
                your monthly basic salary from {startDate || "your start date"}{" "}
                to {endDate || "your calculation date"}, subtracted any unpaid
                days using your daily rate, and then applied the standard
                formula: 13th Month Pay = Total Basic Salary Earned ÷ 12.
              </Typography>
            ) : (
              <Typography style={{ fontSize: "0.8125rem", color: "#444" }}>
                You selected <strong>Variable Monthly Salary</strong>. We used
                the monthly amounts you entered for each month in the year,
                prorated for your employment period, deducted unpaid days based
                on your effective daily rate, and then applied the standard
                formula: 13th Month Pay = Total Basic Salary Earned ÷ 12.
              </Typography>
            )}
          </Box>

          <Box className={classes.contactCard}>
            <Typography className={classes.contactTitle}>
              Need help with your 13th month pay?
            </Typography>
            <Typography className={classes.contactBody}>
              If you have questions about how your 13th month pay is computed, or you
              want help interpreting this estimate for your company, you can reach our
              team at{" "}
              <a href="mailto:support@radztech.ph">support@radztech.ph</a>. We&apos;ll
              help you review your numbers and understand your options.
            </Typography>
          </Box>
        </>
      )}
    </Box>
  );
}
