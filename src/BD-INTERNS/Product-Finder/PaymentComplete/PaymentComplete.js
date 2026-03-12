import React, { useEffect, useState } from "react";
import {
  useNavigate,
  useSearchParams,
  Link as RouterLink,
} from "react-router-dom";
import {
  Box,
  Button,
  Container,
  Typography,
  Link,
  makeStyles,
} from "@material-ui/core";
import { CheckCircle, Receipt } from "@material-ui/icons";

const PENDING_KEY = "ulap_pending_receipt_";

const useStyles = makeStyles((theme) => ({
  root: {
    minHeight: "100vh",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#f5f7fa",
    padding: theme.spacing(3),
    fontFamily: theme.typography.body1.fontFamily,
  },
  invalidBox: {
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#f5f7fa",
    padding: theme.spacing(3),
    fontFamily: theme.typography.body1.fontFamily,
  },
  loadingBox: {
    minHeight: "100vh",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#f5f7fa",
    padding: theme.spacing(3),
    fontFamily: theme.typography.body1.fontFamily,
  },
  heading: {
    fontFamily: theme.typography.fontFamily,
  },
  link: {
    fontSize: "0.875rem",
    fontFamily: theme.typography.body1.fontFamily,
  },
}));

export default function PaymentComplete() {
  const classes = useStyles();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const ref = searchParams.get("ref");
  const [status, setStatus] = useState("loading"); // 'loading' | 'success' | 'invalid'
  const [receiptState, setReceiptState] = useState(null);

  useEffect(() => {
    if (!ref) {
      setStatus("invalid");
      return;
    }
    const key = PENDING_KEY + ref;
    const raw =
      typeof window !== "undefined" ? sessionStorage.getItem(key) : null;
    const state = raw
      ? (() => {
          try {
            return JSON.parse(raw);
          } catch {
            return null;
          }
        })()
      : null;

    if (!state) {
      setStatus("invalid");
      return;
    }

    setReceiptState(state);
    setStatus("success");
  }, [ref]);

  const handleViewReceipt = () => {
    if (!receiptState) return;
    try {
      sessionStorage.removeItem(PENDING_KEY + ref);
    } catch (_) {}
    navigate("/ProductFinder/Receipt", { state: receiptState, replace: true });
  };

  if (status === "invalid") {
    return (
      <Box className={classes.invalidBox}>
        <Container maxWidth="xs">
          <Typography
            variant="h6"
            align="center"
            gutterBottom
            className={classes.heading}
          >
            Invalid or expired payment link
          </Typography>
          <Typography variant="body2" align="center" color="textSecondary">
            Please complete checkout again from the checkout page.
          </Typography>
          <Box mt={2} display="flex" justifyContent="center">
            <Link
              component={RouterLink}
              to="/ProductFinder/Checkout"
              color="primary"
              className={classes.link}
            >
              Back to Checkout
            </Link>
          </Box>
        </Container>
      </Box>
    );
  }

  if (status === "loading") {
    return (
      <Box className={classes.loadingBox}>
        <Typography variant="body2" color="textSecondary" align="center">
          Loading…
        </Typography>
      </Box>
    );
  }

  return (
    <Box className={classes.root}>
      <Container maxWidth="sm">
        <Box textAlign="center" mb={3}>
          <CheckCircle
            style={{ fontSize: 64, color: "#22c55e", marginBottom: 16 }}
          />
          <Typography variant="h5" gutterBottom className={classes.heading}>
            Payment complete
          </Typography>
          <Typography
            variant="body2"
            color="textSecondary"
            style={{ marginBottom: 24 }}
          >
            Thank you for your purchase. Your subscription is being set up.
          </Typography>
          <Button
            variant="contained"
            color="primary"
            size="large"
            startIcon={<Receipt />}
            onClick={handleViewReceipt}
          >
            View receipt
          </Button>
        </Box>
        <Box display="flex" justifyContent="center" mt={2}>
          <Link
            component={RouterLink}
            to="/ProductFinder/Pricing"
            className={classes.link}
          >
            Back to pricing
          </Link>
        </Box>
      </Container>
    </Box>
  );
}
