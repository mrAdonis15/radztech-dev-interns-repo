import React, { useRef, useState } from "react";
import { useLocation, Link as RouterLink } from "react-router-dom";
import {
  Box,
  Button,
  Container,
  makeStyles,
  Typography,
} from "@material-ui/core";
import { toPng } from "html-to-image";
import { ArrowBack, Print, Image } from "@material-ui/icons";

const useStyles = makeStyles((theme) => ({
  root: {
    minHeight: "100vh",
    backgroundColor: "#f5f7fa",
    paddingTop: theme.spacing(4),
    paddingBottom: theme.spacing(6),
    fontFamily: theme.typography.body1.fontFamily,
    "@media print": {
      minHeight: "auto",
      backgroundColor: "#fff",
      paddingTop: 0,
      paddingBottom: 0,
    },
  },
  actions: {
    display: "flex",
    gap: theme.spacing(2),
    marginBottom: theme.spacing(3),
    flexWrap: "wrap",
    "@media print": { display: "none !important" },
  },
  backLink: {
    display: "inline-flex",
    alignItems: "center",
    gap: theme.spacing(0.75),
    color: theme.palette.text.secondary,
    textDecoration: "none",
    fontSize: "0.9rem",
    fontWeight: 500,
    fontFamily: theme.typography.body1.fontFamily,
    "&:hover": { color: theme.palette.primary.main },
  },
  receiptPaper: {
    maxWidth: 480,
    margin: "0 auto",
    backgroundColor: "#fff",
    borderRadius: 12,
    boxShadow: "0 4px 24px rgba(0,0,0,0.08)",
    overflow: "hidden",
    padding: theme.spacing(4),
    fontFamily: theme.typography.body1.fontFamily,
    "@media print": {
      boxShadow: "none",
      pageBreakInside: "avoid",
    },
  },
  logo: {
    fontFamily: theme.typography.fontFamily,
    fontSize: "1.5rem",
    fontWeight: 700,
    color: theme.palette.primary.main,
    marginBottom: theme.spacing(1),
  },
  title: {
    fontFamily: theme.typography.fontFamily,
    fontSize: "1.25rem",
    fontWeight: 600,
    marginBottom: theme.spacing(3),
    paddingBottom: theme.spacing(2),
    borderBottom: `2px solid ${theme.palette.primary.main}`,
  },
  row: {
    display: "flex",
    justifyContent: "space-between",
    marginBottom: theme.spacing(1.5),
    fontSize: "0.9rem",
    fontFamily: theme.typography.body1.fontFamily,
  },
  label: { color: theme.palette.text.secondary, marginRight: theme.spacing(2) },
  value: { fontWeight: 500 },
  sectionTitle: {
    fontFamily: theme.typography.body2.fontFamily,
    fontSize: "0.75rem",
    fontWeight: 700,
    textTransform: "uppercase",
    letterSpacing: "0.05em",
    color: theme.palette.text.secondary,
    marginTop: theme.spacing(2),
    marginBottom: theme.spacing(1),
  },
  totalRow: {
    marginTop: theme.spacing(2),
    paddingTop: theme.spacing(2),
    borderTop: "2px solid #eee",
    fontSize: "1.1rem",
    fontWeight: 700,
    color: theme.palette.primary.main,
    fontFamily: theme.typography.body1.fontFamily,
  },
  footer: {
    marginTop: theme.spacing(3),
    paddingTop: theme.spacing(2),
    borderTop: "1px solid #eee",
    fontSize: "0.75rem",
    color: theme.palette.text.secondary,
    textAlign: "center",
    fontFamily: theme.typography.body2.fontFamily,
  },
  noDataTitle: {
    fontFamily: theme.typography.fontFamily,
  },
}));

function formatPaymentLabel(value) {
  const map = {
    card: "Credit / Debit Card",
    gcash: "GCash",
    paymaya: "PayMaya",
    qrph: "QrPH",
  };
  return map[value] || value;
}

export default function Reciept() {
  const classes = useStyles();
  const location = useLocation();
  const receiptRef = useRef(null);
  const [downloading, setDownloading] = useState(false);

  const data = location.state || {};
  // planKey is passed from Checkout but not displayed on receipt
  const { form = {}, plan = {}, paymentMethod = "", receiptId, date } = data;

  const receiptNumber =
    receiptId || `UPR-${Date.now().toString(36).toUpperCase()}`;
  const receiptDate =
    date ||
    new Date().toLocaleString("en-PH", {
      dateStyle: "medium",
      timeStyle: "short",
    });

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadImage = () => {
    if (!receiptRef.current) return;
    setDownloading(true);
    toPng(receiptRef.current, { backgroundColor: "#ffffff", pixelRatio: 2 })
      .then((dataUrl) => {
        const link = document.createElement("a");
        link.download = `UlapPayroll-Receipt-${receiptNumber}.png`;
        link.href = dataUrl;
        link.click();
      })
      .catch(() => {})
      .finally(() => setDownloading(false));
  };

  const hasData =
    form.recipientName || form.fullName || form.workEmail || plan.label;

  if (!hasData) {
    return (
      <Box className={classes.root}>
        <Container maxWidth="sm">
          <Typography
            variant="h6"
            className={classes.noDataTitle}
            style={{ marginBottom: 16 }}
          >
            No receipt data found.
          </Typography>
          <Button
            component={RouterLink}
            to="/ProductFinder/Pricing"
            color="primary"
            variant="contained"
          >
            Back to Checkout
          </Button>
        </Container>
      </Box>
    );
  }

  return (
    <Box className={classes.root}>
      <Container maxWidth="sm">
        <Box className={classes.actions}>
          <RouterLink to="/ProductFinder/Pricing" className={classes.backLink}>
            <ArrowBack fontSize="small" /> Back
          </RouterLink>
          <Button
            startIcon={<Print />}
            onClick={handlePrint}
            variant="outlined"
            color="primary"
            size="small"
          >
            Print
          </Button>
          <Button
            startIcon={<Image />}
            onClick={handleDownloadImage}
            variant="outlined"
            color="primary"
            size="small"
            disabled={downloading}
          >
            {downloading ? "Downloading…" : "Download as image"}
          </Button>
        </Box>

        <Box ref={receiptRef} className={classes.receiptPaper}>
          <div className={classes.logo}>UlapPayroll</div>
          <Typography component="div" className={classes.title}>
            Payment Receipt
          </Typography>

          <div className={classes.row}>
            <span className={classes.label}>Receipt #</span>
            <span className={classes.value}>{receiptNumber}</span>
          </div>
          <div className={classes.row}>
            <span className={classes.label}>Date</span>
            <span className={classes.value}>{receiptDate}</span>
          </div>

          <div className={classes.sectionTitle}>Billing information</div>
          {(form.recipientName || form.fullName) && (
            <div className={classes.row}>
              <span className={classes.label}>Recipient name</span>
              <span className={classes.value}>
                {form.recipientName || form.fullName}
              </span>
            </div>
          )}
          {form.workEmail && (
            <div className={classes.row}>
              <span className={classes.label}>Email</span>
              <span className={classes.value}>{form.workEmail}</span>
            </div>
          )}
          {form.companyName && (
            <div className={classes.row}>
              <span className={classes.label}>Company</span>
              <span className={classes.value}>{form.companyName}</span>
            </div>
          )}
          {form.phone && (
            <div className={classes.row}>
              <span className={classes.label}>Phone</span>
              <span className={classes.value}>
                {form.phoneCountryCode ? `${form.phoneCountryCode} ` : ""}
                {form.phone}
              </span>
            </div>
          )}
          {form.billingAddress && (
            <div className={classes.row}>
              <span className={classes.label}>Address</span>
              <span className={classes.value} style={{ textAlign: "right" }}>
                {form.billingAddress}
              </span>
            </div>
          )}

          <div className={classes.sectionTitle}>Purchase details</div>
          {plan.label && (
            <div className={classes.row}>
              <span className={classes.label}>Plan</span>
              <span className={classes.value}>{plan.label}</span>
            </div>
          )}
          {paymentMethod && (
            <div className={classes.row}>
              <span className={classes.label}>Payment method</span>
              <span className={classes.value}>
                {formatPaymentLabel(paymentMethod)}
              </span>
            </div>
          )}
          <div className={`${classes.row} ${classes.totalRow}`}>
            <span>Total paid</span>
            <span>
              ₱
              {plan.basePrice != null
                ? Number(plan.basePrice).toLocaleString("en-PH")
                : plan.price != null
                  ? Number(plan.price).toLocaleString("en-PH")
                  : "—"}
              {plan.perEmployee != null
                ? ` + ₱${plan.perEmployee}/employee/month`
                : "/month"}
            </span>
          </div>

          <div className={classes.footer}>
            Thank you for subscribing to UlapPayroll. This receipt has been sent
            to your email.
          </div>
        </Box>
      </Container>
    </Box>
  );
}
