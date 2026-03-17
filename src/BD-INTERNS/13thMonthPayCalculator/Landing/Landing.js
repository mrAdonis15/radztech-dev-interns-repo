import React, { useState } from "react";
import { Link as RouterLink } from "react-router-dom";
import {
  Box,
  Typography,
  Button,
  TextField,
  makeStyles,
} from "@material-ui/core";
import ArrowForwardIcon from "@material-ui/icons/ArrowForward";
import DescriptionIcon from "@material-ui/icons/Description";
import PeopleIcon from "@material-ui/icons/People";
import FunctionsIcon from "@material-ui/icons/Functions";
import ContactMailIcon from "@material-ui/icons/ContactMail";

const useStyles = makeStyles((theme) => ({
  root: {
    paddingBottom: theme.spacing(6),
    fontFamily: '"Roboto", sans-serif',
  },
  hero: {
    textAlign: "center",
    padding: theme.spacing(6, 2),
    marginBottom: theme.spacing(4),
    [theme.breakpoints.down("sm")]: { padding: theme.spacing(4, 2) },
  },
  heroTitle: {
    fontFamily: '"Fira Sans", sans-serif',
    fontSize: "2.5rem",
    fontWeight: 800,
    color: "#DB6700",
    marginBottom: theme.spacing(1.5),
    lineHeight: 1.2,
    [theme.breakpoints.down("sm")]: { fontSize: "1.875rem" },
  },
  heroSubtitle: {
    fontFamily: '"Roboto", sans-serif',
    fontSize: "1.125rem",
    color: "#555",
    maxWidth: 560,
    margin: "0 auto",
    lineHeight: 1.6,
    marginBottom: theme.spacing(3),
  },
  cta: {
    fontFamily: '"Roboto", sans-serif',
    backgroundColor: "#DB6700",
    color: "#fff",
    padding: theme.spacing(1.5, 3),
    borderRadius: 8,
    fontWeight: 600,
    textTransform: "none",
    fontSize: "1rem",
    "&:hover": { backgroundColor: "#C45D00" },
  },
  section: {
    marginBottom: theme.spacing(4),
  },
  sectionTitle: {
    fontFamily: '"Fira Sans", sans-serif',
    fontSize: "1.25rem",
    fontWeight: 700,
    color: "#1a1a1a",
    marginBottom: theme.spacing(1.5),
    display: "flex",
    alignItems: "center",
    gap: theme.spacing(1),
  },
  sectionBody: {
    fontFamily: '"Roboto", sans-serif',
    fontSize: "0.9375rem",
    color: "#444",
    lineHeight: 1.65,
  },
  card: {
    background: "#fff",
    borderRadius: 12,
    padding: theme.spacing(2, 2.5),
    marginBottom: theme.spacing(2),
    border: "1px solid #eee",
    boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
  },
  list: {
    margin: 0,
    paddingLeft: theme.spacing(2.5),
    fontFamily: '"Roboto", sans-serif',
    "& li": {
      marginBottom: theme.spacing(0.5),
      fontFamily: '"Roboto", sans-serif',
    },
  },
  contactSection: {
    marginTop: theme.spacing(5),
    padding: theme.spacing(2.5, 2),
    borderRadius: 12,
    border: "1px solid #eee",
    background: "#fafafa",
    maxWidth: 640,
    marginLeft: "auto",
    marginRight: "auto",
  },
  contactTitle: {
    fontFamily: '"Fira Sans", sans-serif',
    fontSize: "1.25rem",
    fontWeight: 700,
    color: "#1a1a1a",
    marginBottom: theme.spacing(1.5),
    display: "flex",
    alignItems: "center",
    gap: theme.spacing(1),
  },
  contactBody: {
    fontFamily: '"Roboto", sans-serif',
    fontSize: "0.9rem",
    color: "#444",
    lineHeight: 1.6,
    marginBottom: theme.spacing(2),
  },
  contactForm: {
    display: "flex",
    flexDirection: "column",
    gap: theme.spacing(2),
  },
  contactField: {
    "& .MuiOutlinedInput-root": {
      backgroundColor: "#fff",
      borderRadius: 8,
      fontFamily: '"Roboto", sans-serif',
    },
    "& .MuiInputLabel-outlined": {
      fontFamily: '"Roboto", sans-serif',
    },
  },
}));

const SUPPORT_EMAIL = "support@radztech.ph";

export default function Landing() {
  const classes = useStyles();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  const handleContactSubmit = (e) => {
    e.preventDefault();
    const subject = encodeURIComponent("13th Month Pay – Need help");
    const body = encodeURIComponent(
      `Hi,\n\n${message || "(No message provided)"}\n\n---\nName: ${name || "(not provided)"}\nEmail: ${email || "(not provided)"}`,
    );
    window.location.href = `mailto:${SUPPORT_EMAIL}?subject=${subject}&body=${body}`;
  };

  return (
    <Box className={classes.root}>
      <Box className={classes.hero}>
        <Typography component="h1" className={classes.heroTitle}>
          Understand Your 13th Month Pay
        </Typography>
        <Typography className={classes.heroSubtitle}>
          Get a clear, compliant estimate of your 13th month pay. Use our free
          calculator and learn how the computation works under Philippine law.
        </Typography>
        <Button
          component={RouterLink}
          to="/BDCalculator/calculator"
          variant="contained"
          className={classes.cta}
          endIcon={<ArrowForwardIcon />}
        >
          Try the free 13th month calculator
        </Button>
      </Box>

      <Box className={classes.section}>
        <Typography component="h2" className={classes.sectionTitle}>
          <DescriptionIcon style={{ color: "#DB6700" }} />
          What is 13th month pay?
        </Typography>
        <Box className={classes.card}>
          <Typography className={classes.sectionBody}>
            Under Presidential Decree No. 851, eligible employees in the private
            sector are entitled to 13th month pay—a benefit equal to one-twelfth
            (1/12) of their total basic salary earned within the calendar year.
            It must be paid not later than December 24 each year. Many employers
            pay it in one lump sum; others split it (e.g., mid-year and
            year-end). Our calculator helps you estimate your entitlement based
            on your salary and employment period.
          </Typography>
        </Box>
      </Box>

      <Box className={classes.section}>
        <Typography component="h2" className={classes.sectionTitle}>
          <PeopleIcon style={{ color: "#DB6700" }} />
          Who is entitled?
        </Typography>
        <Box className={classes.card}>
          <Typography className={classes.sectionBody} component="div">
            <strong>Eligible:</strong> Rank-and-file employees who worked at
            least one (1) month during the calendar year (regular, probationary,
            or casual). Proration applies if you worked less than 12 months.
            <br />
            <br />
            <strong>Excluded</strong> (unless voluntarily given): government
            employees; household helpers; persons in the personal service of
            another; managerial employees as defined by law. Check with your HR
            or DOLE for your situation.
          </Typography>
        </Box>
      </Box>

      <Box className={classes.section}>
        <Typography component="h2" className={classes.sectionTitle}>
          <FunctionsIcon style={{ color: "#DB6700" }} />
          How is it computed?
        </Typography>
        <Box className={classes.card}>
          <Typography className={classes.sectionBody} component="div">
            Only <strong>basic salary</strong> counts—fixed or variable pay for
            work performed, cash value of vacation/sick/maternity leave within
            the legal minimum, and other regular compensation. Excluded:
            cost-of-living allowance, profit-sharing, overtime, premium pay, and
            similar items unless your employer treats them as basic. Unpaid
            absences may be deducted from total basic.
          </Typography>
          <ul className={classes.list}>
            <li>Enter your monthly salary (or variable amounts per month).</li>
            <li>Set your employment period (start and end dates).</li>
            <li>Add any allowances your employer includes in 13th month.</li>
            <li>
              Optionally enter unpaid days to get a more accurate estimate.
            </li>
          </ul>
        </Box>
      </Box>

      <Box textAlign="center" marginTop={4}>
        <Button
          component={RouterLink}
          to="/BDCalculator/calculator"
          variant="contained"
          className={classes.cta}
          endIcon={<ArrowForwardIcon />}
        >
          Use the free calculator
        </Button>
      </Box>

      <Box className={classes.contactSection}>
        <Typography className={classes.contactTitle} component="h2">
          <ContactMailIcon style={{ color: "#DB6700" }} />
          Contact Us
        </Typography>
        <Typography className={classes.contactBody} component="div">
          <strong>Need help with your 13th month pay?</strong>
          <br />
          <br />
          If you&apos;re not sure how 13th month pay applies to your company or
          role, our team can help you review your situation. Send us a message
          and we&apos;ll walk you through the rules and common edge cases.
        </Typography>
        <form
          className={classes.contactForm}
          onSubmit={handleContactSubmit}
          noValidate
        >
          <TextField
            className={classes.contactField}
            variant="outlined"
            fullWidth
            size="small"
            label="Your name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter your name"
          />
          <TextField
            className={classes.contactField}
            variant="outlined"
            fullWidth
            size="small"
            type="email"
            label="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="your@email.com"
            required
          />
          <TextField
            className={classes.contactField}
            variant="outlined"
            fullWidth
            multiline
            minRows={4}
            size="small"
            label="Message"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Tell us about your situation or question regarding 13th month pay..."
            required
          />
          <Button
            type="submit"
            variant="contained"
            className={classes.cta}
            fullWidth
          >
            Send message
          </Button>
        </form>
      </Box>
    </Box>
  );
}
