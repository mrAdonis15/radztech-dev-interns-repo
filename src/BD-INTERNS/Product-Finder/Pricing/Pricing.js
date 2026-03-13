import React, { useState } from "react";
import { Link as RouterLink, useNavigate } from "react-router-dom";
import {
  Container,
  Typography,
  Box,
  Button,
  makeStyles,
} from "@material-ui/core";
import ArrowBackIcon from "@material-ui/icons/ArrowBack";
import ArrowForwardIcon from "@material-ui/icons/ArrowForward";
import PhoneIcon from "@material-ui/icons/Phone";
import ChatBubbleOutlineIcon from "@material-ui/icons/ChatBubbleOutline";
import { PricingCardGrid, PLANS } from "./PricingCardGrid";

const useStyles = makeStyles((theme) => ({
  wrapper: {
    fontFamily: theme.typography.body1.fontFamily,
    minHeight: "100vh",
    background: "#f7f9fc",
    paddingTop: theme.spacing(6),
    paddingBottom: 0,
    paddingLeft: theme.spacing(3),
    paddingRight: theme.spacing(3),
    animation: "$pageEnter 0.4s ease-out forwards",
    [theme.breakpoints.down("xs")]: {
      paddingLeft: theme.spacing(2),
      paddingRight: theme.spacing(2),
    },
    [theme.breakpoints.down("sm")]: {
      paddingTop: theme.spacing(4),
    },
  },
  "@keyframes pageEnter": {
    "0%": { opacity: 0 },
    "100%": { opacity: 1 },
  },
  inner: {
    maxWidth: 1100,
    margin: "0 auto",
  },
  topBar: {
    display: "flex",
    alignItems: "center",
    justifyContent: "flex-start",
    marginBottom: theme.spacing(3),
  },
  backBtn: {
    fontFamily: theme.typography.body1.fontFamily,
    textTransform: "none",
    fontSize: "0.9rem",
    transition: "color 0.2s ease, background-color 0.2s ease",
  },
  header: {
    textAlign: "center",
    marginBottom: theme.spacing(4),
  },
  title: {
    fontFamily: theme.typography.fontFamily,
    fontSize: "1.75rem",
    fontWeight: 700,
    color: "#0f172a",
    letterSpacing: "-0.02em",
    marginBottom: theme.spacing(1),
    maxWidth: 560,
    marginLeft: "auto",
    marginRight: "auto",
    lineHeight: 1.3,
  },
  subtitle: {
    fontSize: "0.9rem",
    color: "#64748b",
    maxWidth: 480,
    margin: "0 auto",
    lineHeight: 1.5,
  },
  linkWrap: {
    marginTop: theme.spacing(4),
    textAlign: "center",
    marginBottom: theme.spacing(2),
  },
  quizButton: {
    textTransform: "none",
    padding: theme.spacing(1.25, 2.5),
    fontSize: "0.8125rem",
    fontWeight: 500,
    color: "#64748b",
    backgroundColor: "transparent",
    "&:hover": {
      backgroundColor: "transparent",
      color: "#FF7704",
    },
    "& .MuiButton-endIcon": {
      marginLeft: theme.spacing(0.5),
    },
  },
  quizLinkWrap: {
    textAlign: "center",
    paddingTop: theme.spacing(3),
    paddingBottom: theme.spacing(5),
  },
  stillNotSure: {
    border: "1px solid #e2e8f0",
    borderRadius: 12,
    padding: theme.spacing(4, 3),
    textAlign: "center",
    marginTop: theme.spacing(7),
  },
  stillNotSureTitle: {
    fontSize: "1.375rem",
    fontWeight: 700,
    color: "#0f172a",
    marginBottom: theme.spacing(1),
  },
  stillNotSureText: {
    fontSize: "0.875rem",
    color: "#475569",
    maxWidth: 460,
    margin: "0 auto",
    marginBottom: theme.spacing(2.5),
    lineHeight: 1.5,
  },
  stillNotSureBtns: {
    display: "flex",
    flexWrap: "wrap",
    gap: theme.spacing(1.5),
    justifyContent: "center",
  },
  stillNotSureBtn: {
    textTransform: "none",
    fontWeight: 600,
    fontSize: "0.875rem",
    borderRadius: 8,
    border: "1px solid #334155",
    color: "#0f172a",
    backgroundColor: "#fff",
    padding: theme.spacing(1, 1.75),
    "&:hover": {
      backgroundColor: "#f8fafc",
      borderColor: "#475569",
    },
  },
}));

export default function Pricing() {
  const classes = useStyles();
  const navigate = useNavigate();
  const [billingPeriod, setBillingPeriod] = useState("monthly"); // 'monthly' | 'annual'

  return (
    <div className={classes.wrapper}>
      <Container maxWidth="lg" disableGutters>
        <Box className={classes.inner}>
          <Box className={classes.topBar}>
            <Button
              component="button"
              onClick={() => navigate(-1)}
              startIcon={<ArrowBackIcon />}
              className={classes.backBtn}
              color="primary"
            >
              Back
            </Button>
          </Box>
          <header className={classes.header}>
            <Typography component="h1" className={classes.title}>
              Choose the right plan for your business
            </Typography>
            <Typography className={classes.subtitle}>
              All plans include secure payroll processing and expert support.
            </Typography>
          </header>

          <PricingCardGrid
            plans={PLANS}
            billingPeriod={billingPeriod}
            onBillingPeriodChange={setBillingPeriod}
            showToggle
          />

          <Box className={classes.stillNotSure}>
            <Typography component="h2" className={classes.stillNotSureTitle}>
              Still not sure which plan is right for you?
            </Typography>
            <Typography className={classes.stillNotSureText}>
              Our payroll experts can help you understand your options and find
              the perfect fit for your business.
            </Typography>
            <Box className={classes.stillNotSureBtns}>
              <Button
                component={RouterLink}
                to="/ProductFinder/ContactUs"
                variant="outlined"
                className={classes.stillNotSureBtn}
                startIcon={<PhoneIcon />}
              >
                Schedule a Call
              </Button>
              <Button
                component={RouterLink}
                to="/ProductFinder/ContactUs"
                variant="outlined"
                className={classes.stillNotSureBtn}
                startIcon={<ChatBubbleOutlineIcon />}
              >
                Chat with Sales
              </Button>
            </Box>
          </Box>

          <Box className={classes.quizLinkWrap}>
            <Button
              component={RouterLink}
              to="/questionnaire"
              className={classes.quizButton}
              endIcon={<ArrowForwardIcon style={{ fontSize: 18 }} />}
            >
              Not sure? Take the plan recommendation quiz
            </Button>
          </Box>
        </Box>
      </Container>
    </div>
  );
}
