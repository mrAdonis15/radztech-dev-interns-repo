import React from "react";
import { Link as RouterLink } from "react-router-dom";
import {
  Container,
  Typography,
  Box,
  Button,
  Grid,
  makeStyles,
} from "@material-ui/core";
import AssignmentIcon from "@material-ui/icons/Assignment";
import VerifiedUserIcon from "@material-ui/icons/VerifiedUser";
import FlashOnIcon from "@material-ui/icons/FlashOn";
import heroManImg from "../Images/ai.png";

const useStyles = makeStyles((theme) => ({
  root: {
    overflow: "hidden",
    backgroundColor: "#FAFBFD",
    height: "calc(100vh - 60px)",
    minHeight: "calc(100vh - 60px)",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    animation: "$rootFadeIn 0.4s ease-out",
    [theme.breakpoints.down("md")]: {
      overflow: "auto",
      height: "auto",
      minHeight: "calc(100vh - 60px)",
      justifyContent: "flex-start",
    },
  },
  "@keyframes rootFadeIn": {
    "0%": { opacity: 0 },
    "100%": { opacity: 1 },
  },
  hero: {
    position: "relative",
    padding: 0,
    [theme.breakpoints.down("md")]: {
      padding: theme.spacing(3, 0, 4),
      textAlign: "center",
    },
    [theme.breakpoints.down("xs")]: {
      padding: theme.spacing(2, 2, 3),
    },
  },
  heroInner: {
    width: "100%",
    margin: "0 auto",
    paddingLeft: theme.spacing(3),
    paddingRight: theme.spacing(3),
    [theme.breakpoints.down("xs")]: {
      paddingLeft: theme.spacing(2),
      paddingRight: theme.spacing(2),
    },
  },
  heroLeft: {
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    [theme.breakpoints.down("md")]: {
      alignItems: "center",
      marginBottom: theme.spacing(2),
      order: 1,
    },
  },
  heroRight: {
    position: "relative",
    display: "flex",
    alignItems: "flex-end",
    justifyContent: "center",
    minHeight: "calc(100vh - 80px)",
    width: "100%",
    [theme.breakpoints.down("md")]: { order: 2, minHeight: "min(78vh, 620px)" },
    [theme.breakpoints.down("xs")]: { minHeight: "min(70vh, 520px)" },
    [theme.breakpoints.only("md")]: { minHeight: "min(52vh, 420px)" },
  },
  heroImageWrap: {
    position: "relative",
    display: "flex",
    alignItems: "flex-end",
    justifyContent: "center",
    width: "100%",
    maxWidth: "100%",
    height: "calc(100vh - 60px)",
    minHeight: 480,
    animation: "$heroFadeIn 0.8s cubic-bezier(0.4, 0, 0.2, 1) 0.35s both",
    [theme.breakpoints.down("md")]: {
      height: "min(78vh, 620px)",
      minHeight: 480,
    },
    [theme.breakpoints.down("xs")]: {
      height: "min(70vh, 520px)",
      minHeight: 420,
    },
    [theme.breakpoints.only("md")]: {
      height: "min(52vh, 420px)",
      minHeight: 360,
    },
  },
  heroImage: {
    width: "auto",
    height: "95%",
    maxHeight: "calc(100vh - 60px)",
    objectFit: "contain",
    objectPosition: "center bottom",
    display: "block",
    verticalAlign: "bottom",
    [theme.breakpoints.down("md")]: { maxHeight: "min(78vh, 620px)" },
    [theme.breakpoints.down("xs")]: { maxHeight: "min(70vh, 520px)" },
    [theme.breakpoints.only("md")]: { maxHeight: "min(52vh, 420px)" },
  },
  "@keyframes heroFadeIn": {
    "0%": { opacity: 0, transform: "translateX(24px)" },
    "100%": { opacity: 1, transform: "translateX(0)" },
  },
  "@keyframes miniCardFloat": {
    "0%": { transform: "translateY(0)" },
    "50%": { transform: "translateY(-6px)" },
    "100%": { transform: "translateY(0)" },
  },
  miniCard: {
    position: "absolute",
    fontFamily: theme.typography.body1.fontFamily,
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: theme.spacing(2.1, 2.1),
    boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
    maxWidth: 172,
    border: "1px solid rgba(0,0,0,0.06)",
    transition:
      "transform 0.35s cubic-bezier(0.4, 0, 0.2, 1), box-shadow 0.35s cubic-bezier(0.4, 0, 0.2, 1)",
    animation: "$miniCardFloat 5s ease-in-out 1s infinite",
    "&:hover": {
      transform: "translateY(-4px) scale(1.02)",
      boxShadow: "0 12px 28px rgba(0,0,0,0.12)",
    },
    "& strong": {
      fontFamily: theme.typography.h6.fontFamily,
      color: "#DB6700",
      fontSize: "0.9rem",
      fontWeight: 600,
      display: "flex",
      alignItems: "center",
      gap: theme.spacing(1),
      marginBottom: 4,
    },
    "& span": {
      fontFamily: theme.typography.body1.fontFamily,
      color: "#333",
      fontSize: "0.85rem",
      fontWeight: 500,
      display: "block",
      lineHeight: 1.4,
    },
    "& .miniCardIcon": {
      color: "#DB6700",
      fontSize: 20,
    },
  },
  miniCard1: {
    top: "23%",
    right: "12%",
    [theme.breakpoints.down("md")]: {
      right: "5%",
      top: "18%",
      padding: theme.spacing(1.5, 1.75),
      maxWidth: 150,
    },
    [theme.breakpoints.down("xs")]: {
      right: "4%",
      top: "14%",
      padding: theme.spacing(1.25, 1.5),
      maxWidth: 130,
    },
  },
  miniCard2: {
    bottom: "32%",
    left: "8%",
    [theme.breakpoints.down("md")]: {
      left: "6%",
      bottom: "30%",
      padding: theme.spacing(1.5, 1.75),
      maxWidth: 150,
    },
    [theme.breakpoints.down("xs")]: {
      left: "4%",
      bottom: "26%",
      padding: theme.spacing(1.25, 1.5),
      maxWidth: 130,
    },
  },
  miniCard3: {
    bottom: "16%",
    right: "6%",
    [theme.breakpoints.down("md")]: {
      right: "6%",
      bottom: "12%",
      padding: theme.spacing(1.5, 1.75),
      maxWidth: 150,
    },
    [theme.breakpoints.down("xs")]: {
      right: "5%",
      bottom: "10%",
      padding: theme.spacing(1.25, 1.5),
      maxWidth: 130,
    },
  },
  "@keyframes cardFadeIn": {
    "0%": { opacity: 0, transform: "translateY(12px)" },
    "100%": { opacity: 1, transform: "translateY(0)" },
  },
  heroTitle: {
    fontFamily: theme.typography.h1.fontFamily,
    fontWeight: 600,
    fontSize: "3.5rem",
    lineHeight: 1.2,
    color: "#DB6700",
    marginBottom: theme.spacing(2),
    animation: "$heroFadeInLeft 0.7s cubic-bezier(0.4, 0, 0.2, 1) 0.1s both",
    [theme.breakpoints.down("md")]: {
      fontSize: "2.75rem",
      textAlign: "center",
    },
    [theme.breakpoints.down("sm")]: { fontSize: "2.25rem" },
    [theme.breakpoints.down("xs")]: { fontSize: "1.75rem", lineHeight: 1.3 },
  },
  heroSubtitle: {
    fontFamily: theme.typography.body1.fontFamily,
    fontSize: "1.25rem",
    color: "#333",
    maxWidth: 500,
    marginBottom: theme.spacing(4),
    lineHeight: 1.6,
    fontWeight: 400,
    animation: "$heroFadeInLeft 0.7s cubic-bezier(0.4, 0, 0.2, 1) 0.25s both",
    [theme.breakpoints.down("md")]: {
      marginLeft: "auto",
      marginRight: "auto",
      textAlign: "center",
    },
    [theme.breakpoints.down("sm")]: { fontSize: "1.2rem" },
    [theme.breakpoints.down("xs")]: {
      fontSize: "1.05rem",
      marginBottom: theme.spacing(3),
    },
  },
  heroCtaBtn: {
    backgroundColor: "#DB6700",
    color: "#fff",
    padding: theme.spacing(1.5, 2),
    borderRadius: 4,
    textTransform: "none",
    fontWeight: 550,
    fontSize: "1rem",
    boxShadow: "none",
    alignSelf: "flex-start",
    animation: "$heroFadeInLeft 0.7s cubic-bezier(0.4, 0, 0.2, 1) 0.4s both",
    transition: "background-color 0.25s ease, transform 0.2s ease",
    [theme.breakpoints.down("md")]: { alignSelf: "center" },
    "&:hover": { backgroundColor: "#C45D00", transform: "translateY(-1px)" },
  },
  heroCtaBtnOutlined: {
    padding: theme.spacing(1.5, 2),
    borderRadius: 4,
    textTransform: "none",
    fontWeight: 550,
    fontSize: "1rem",
    borderColor: "#DB6700",
    color: "#DB6700",
    alignSelf: "flex-start",
    animation: "$heroFadeInLeft 0.7s cubic-bezier(0.4, 0, 0.2, 1) 0.45s both",
    transition:
      "border-color 0.25s ease, color 0.25s ease, background-color 0.25s ease, transform 0.2s ease",
    [theme.breakpoints.down("md")]: { alignSelf: "center" },
    "&:hover": {
      borderColor: "#C45D00",
      color: "#C45D00",
      backgroundColor: "rgba(219, 103, 0, 0.08)",
      transform: "translateY(-1px)",
    },
  },
  heroCtaGroup: {
    display: "flex",
    flexWrap: "wrap",
    gap: theme.spacing(2),
    alignSelf: "flex-start",
    [theme.breakpoints.down("md")]: { alignSelf: "center" },
  },
  "@keyframes heroFadeInLeft": {
    "0%": { opacity: 0, transform: "translateX(-24px)" },
    "100%": { opacity: 1, transform: "translateX(0)" },
  },
}));

const Home = () => {
  const classes = useStyles();

  return (
    <Box className={classes.root}>
      <Box id="hero" className={classes.hero}>
        <Container maxWidth="lg" className={classes.heroInner}>
          <Grid container spacing={4} alignItems="center" wrap="wrap">
            <Grid item xs={12} md={6} className={classes.heroLeft}>
              <Typography variant="h1" className={classes.heroTitle}>
                Find the right payroll plan for your business
              </Typography>
              <Typography className={classes.heroSubtitle}>
                UlapPayroll helps you manage workforce compensation with clear
                calculations and compliance. Get a plan recommendation in
                minutes.
              </Typography>
              <Box className={classes.heroCtaGroup}>
                <Button
                  component={RouterLink}
                  to="/ProductFinder/Questionnaire"
                  variant="contained"
                  className={classes.heroCtaBtn}
                >
                  Find me a plan
                </Button>
              </Box>
            </Grid>
            <Grid item xs={12} md={6} className={classes.heroRight}>
              <Box className={classes.heroImageWrap}>
                <img
                  src={heroManImg}
                  alt="Person checking payroll on phone"
                  className={classes.heroImage}
                />
                <Box className={`${classes.miniCard} ${classes.miniCard1}`}>
                  <strong>
                    <AssignmentIcon className="miniCardIcon" />
                    Plan match
                  </strong>
                  <span>Get a plan that fits your size & needs</span>
                </Box>
                <Box className={`${classes.miniCard} ${classes.miniCard2}`}>
                  <strong>
                    <VerifiedUserIcon className="miniCardIcon" />
                    Compliant
                  </strong>
                  <span>Payroll that stays compliant</span>
                </Box>
                <Box className={`${classes.miniCard} ${classes.miniCard3}`}>
                  <strong>
                    <FlashOnIcon className="miniCardIcon" />
                    Quick setup
                  </strong>
                  <span>Start in minutes, not days</span>
                </Box>
              </Box>
            </Grid>
          </Grid>
        </Container>
      </Box>
    </Box>
  );
};

export default Home;
