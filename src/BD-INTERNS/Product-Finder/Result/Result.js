import React from "react";
import { useLocation, useNavigate, Link as RouterLink } from "react-router-dom";
import {
  Container,
  Box,
  Typography,
  Button,
  makeStyles,
} from "@material-ui/core";
import CheckIcon from "@material-ui/icons/Check";

// --- Data Configuration (Same as Quiz) — key matches Checkout ?plan= ---
const plans = [
  {
    key: "starter",
    name: "Starter",
    price: "2,999 PHP + 79/employee/month",
    minScore: 5,
    maxScore: 9,
    color: "#22c55e",
    lightBg: "rgba(34, 197, 94, 0.08)",
    description: "Perfect for small teams getting started with payroll.",
    scoreRangeLabel: "5–9",
    features: [
      "Up to 20 employees",
      "Standard payroll processing",
      "Basic payroll reports",
      "Email support",
      "Monthly billing",
    ],
    benefits: [
      "Essential payroll without extra cost",
      "Quick setup for small teams",
    ],
  },
  {
    key: "professional",
    name: "Professional",
    price: "4,999 PHP + 109/employee/month",
    minScore: 10,
    maxScore: 13,
    color: "#3b82f6",
    lightBg: "rgba(59, 130, 246, 0.08)",
    description:
      "Ideal for growing companies with multiple branches and moderate complexity.",
    scoreRangeLabel: "10–13",
    features: [
      "Up to 150 employees",
      "Advanced payroll & HR tools",
      "Compliance & tax reports",
      "Priority support",
      "Monthly or annual billing",
    ],
    benefits: [
      "All Starter benefits",
      "Streamlined HR workflows across branches",
      "More power and compliance without going enterprise",
    ],
  },
  {
    key: "enterprise",
    name: "Enterprise",
    price: "10,000 PHP + 179/employee/month",
    minScore: 14,
    maxScore: 17,
    color: "#8b5cf6",
    lightBg: "rgba(139, 92, 246, 0.08)",
    description: "For large organizations that need full support.",
    scoreRangeLabel: "14–17",
    features: [
      "Unlimited employees",
      "Full UlapPayroll suite",
      "Management & analytics reports",
      "Dedicated Product Expert",
      "Custom reporting & integrations",
    ],
    benefits: [
      "All Professional benefits",
      "Dedicated account support",
      "Built for complex, large-scale demand",
    ],
  },
  {
    key: "talk-to-sales",
    name: "Talk to Sales",
    price: null,
    minScore: 18,
    maxScore: 21,
    color: "#64748b",
    lightBg: "rgba(100, 116, 139, 0.08)",
    description:
      "Custom solutions for large or complex needs. Our team will reach out to discuss the best fit.",
    scoreRangeLabel: "18–21",
    talkToSales: true,
    features: [],
    benefits: [
      "Custom pricing and terms",
      "Dedicated account team",
      "Tailored implementation",
    ],
  },
];

const KEYFRAMES = `
  @keyframes resultCardIn {
    from { opacity: 0; transform: translateY(20px); }
    to { opacity: 1; transform: translateY(0); }
  }
`;

const useStyles = makeStyles((theme) => ({
  wrapper: {
    fontFamily: theme.typography.body1.fontFamily,
    minHeight: "100vh",
    background: "#FAFBFD",
    paddingTop: theme.spacing(3),
    paddingBottom: theme.spacing(4),
    paddingLeft: theme.spacing(3),
    paddingRight: theme.spacing(3),
    boxSizing: "border-box",
    animation: "$pageEnter 0.4s ease-out forwards",
    [theme.breakpoints.down("xs")]: {
      paddingLeft: theme.spacing(2),
      paddingRight: theme.spacing(2),
    },
  },
  "@keyframes pageEnter": {
    "0%": { opacity: 0 },
    "100%": { opacity: 1 },
  },
  container: {
    width: "100%",
    maxWidth: 1100,
    margin: "0 auto",
  },
  card: {
    background: "#fff",
    borderRadius: 10,
    border: "1px solid #e2e8f0",
    padding: theme.spacing(2.5, 2.5),
    marginBottom: theme.spacing(2),
    animation: "resultCardIn 0.5s cubic-bezier(0.4, 0, 0.2, 1) forwards",
    position: "relative",
    maxWidth: 640,
    marginLeft: "auto",
    marginRight: "auto",
    [theme.breakpoints.down("xs")]: {
      padding: theme.spacing(2, 2),
    },
  },
  pageHeading: {
    fontFamily: theme.typography.h1.fontFamily,
    fontSize: "1.75rem",
    fontWeight: 700,
    color: "#0f172a",
    marginBottom: theme.spacing(2),
    lineHeight: 1.3,
    textAlign: "center",
  },
  partialNote: {
    fontSize: "0.8125rem",
    color: "#94a3b8",
    marginBottom: theme.spacing(2),
  },
  planPill: {
    display: "inline-block",
    fontSize: "0.8125rem",
    fontWeight: 700,
    color: "#fff",
    padding: theme.spacing(0.75, 2),
    borderRadius: 4,
    marginBottom: theme.spacing(2),
  },
  mainRow: {
    display: "flex",
    alignItems: "stretch",
    gap: theme.spacing(4),
    marginBottom: theme.spacing(3),
    [theme.breakpoints.down("sm")]: {
      flexDirection: "column",
      gap: theme.spacing(3),
    },
  },
  leftCol: {
    flex: "0 0 58%",
    minWidth: 0,
    [theme.breakpoints.down("sm")]: { flex: "1 1 auto" },
  },
  rightCol: {
    flex: "1 1 auto",
    minWidth: 0,
    borderLeft: "1px solid #e2e8f0",
    paddingLeft: theme.spacing(3),
    [theme.breakpoints.down("sm")]: {
      borderLeft: "none",
      paddingLeft: 0,
      borderTop: "1px solid #e2e8f0",
      paddingTop: theme.spacing(3),
    },
  },
  planTitleRow: {
    display: "flex",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: theme.spacing(2),
    marginBottom: theme.spacing(0.5),
    flexWrap: "wrap",
  },
  planTitleLeft: {
    flex: "1 1 auto",
    minWidth: 0,
  },
  planTitle: {
    fontFamily: theme.typography.h2.fontFamily,
    fontSize: "1rem",
    fontWeight: 700,
    color: "#0f172a",
    letterSpacing: "-0.02em",
  },
  planPriceBig: {
    fontFamily: theme.typography.h2.fontFamily,
    fontSize: "1.5rem",
    fontWeight: 800,
    letterSpacing: "-0.02em",
    lineHeight: 1.2,
    marginBottom: theme.spacing(0.25),
  },
  planPriceSub: {
    fontSize: "0.7rem",
    color: "#64748b",
    marginBottom: theme.spacing(1),
  },
  planPriceSmall: {
    fontSize: "0.875rem",
    fontWeight: 600,
    opacity: 0.95,
  },
  planDescription: {
    fontFamily: theme.typography.body1.fontFamily,
    fontSize: "0.8125rem",
    fontweight: 400,
    color: "#64748b",
    lineHeight: 1.5,
  },
  planPrice: {
    fontSize: "1.125rem",
    fontWeight: 700,
    color: "#0f172a",
    textAlign: "right",
    whiteSpace: "nowrap",
    flexShrink: 0,
  },
  sectionLabel: {
    fontFamily: theme.typography.body1.fontFamily,
    fontSize: "0.6875rem",
    fontWeight: 700,
    color: "#475569",
    textTransform: "uppercase",
    letterSpacing: "0.06em",
    marginBottom: theme.spacing(1.5),
  },
  featuresList: {
    listStyle: "none",
    padding: 0,
    margin: "0 0 0 0",
  },
  featureItem: {
    display: "flex",
    alignItems: "flex-start",
    gap: theme.spacing(1.5),
    fontSize: "0.8125rem",
    color: "#475569",
    marginBottom: theme.spacing(1.5),
    lineHeight: 1.4,
  },
  checkIconWrap: {
    width: 14,
    height: 14,
    borderRadius: "50%",
    border: "1.5px solid #22c55e",
    color: "#22c55e",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
    marginTop: 2,
  },
  divider: {
    marginTop: theme.spacing(4),
    marginBottom: theme.spacing(4),
    borderTop: "1px solid #e2e8f0",
  },
  whyHeading: {
    fontFamily: theme.typography.h3.fontFamily,
    fontSize: "0.875rem",
    fontWeight: 700,
    color: "#0f172a",
    marginBottom: theme.spacing(1),
    lineHeight: 1.4,
    textTransform: "uppercase",
    letterSpacing: "0.04em",
  },
  whyParagraph: {
    fontFamily: theme.typography.body1.fontFamily,
    fontSize: "0.8125rem",
    color: "#475569",
    lineHeight: 1.6,
    fontweight: 400,
    marginBottom: theme.spacing(2),
  },
  ctaRow: {
    marginTop: theme.spacing(4),
    display: "flex",
    flexDirection: "column",
    gap: theme.spacing(1.5),
  },
  primaryBtn: {
    padding: theme.spacing(0.875, 1.5),
    fontWeight: 600,
    fontSize: "0.8125rem",
    textTransform: "none",
    borderRadius: 6,
    backgroundColor: "#DB6700",
    color: "#fff",
    boxShadow: "none",
    "&:hover": {
      backgroundColor: "#C45D00",
      boxShadow: "none",
    },
  },
  retakeLink: {
    display: "block",
    textAlign: "center",
    fontSize: "0.75rem",
    color: "#64748b",
    textDecoration: "none",
    marginTop: theme.spacing(1),
    "&:hover": { color: "#0f172a" },
  },
  persuasionBox: {
    marginTop: theme.spacing(4),
    padding: theme.spacing(2.5, 2.5),
    borderRadius: 12,
    background: "linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)",
    border: "1px solid #e2e8f0",
  },
  persuasionTitle: {
    fontFamily: theme.typography.h3.fontFamily,
    fontSize: "1rem",
    fontWeight: 700,
    color: "#0f172a",
    marginBottom: theme.spacing(1.5),
    lineHeight: 1.3,
  },
  persuasionList: {
    listStyle: "none",
    padding: 0,
    margin: 0,
  },
  persuasionItem: {
    display: "flex",
    alignItems: "flex-start",
    gap: theme.spacing(1.25),
    fontFamily: theme.typography.body1.fontFamily,
    fontSize: "0.875rem",
    color: "#334155",
    lineHeight: 1.5,
    marginBottom: theme.spacing(1.25),
    "&:last-child": { marginBottom: 0 },
  },
  persuasionIcon: {
    flexShrink: 0,
    color: "#22c55e",
    marginTop: 2,
  },
}));

function Result() {
  const classes = useStyles();
  const location = useLocation();
  const navigate = useNavigate();
  const totalScore = location.state?.totalScore ?? null;
  const answeredCount = location.state?.answeredCount;
  const totalQuestions = location.state?.totalQuestions ?? 5;
  const isPartial =
    answeredCount != null &&
    totalQuestions != null &&
    answeredCount < totalQuestions;

  const getRecommendedPlan = () => {
    const score = totalScore != null ? totalScore : 0;
    return (
      plans.find((plan) => score >= plan.minScore && plan.maxScore >= score) ||
      plans[0]
    );
  };

  const recommended = getRecommendedPlan();

  const handleCheckout = () => {
    navigate(`/ProductFinder/Checkout?plan=${recommended.key}`);
  };

  // 4 fixed recommendation reasons — benefit-focused, never "what you chose"
  const getRecommendationReasons = () => {
    const planName = recommended.name;
    const key = recommended.key;
    const reasons = [];
    // Type 1: Fit for your size / capacity
    if (key === "starter") {
      reasons.push(
        "It gives you the right capacity and pricing for small teams, with room to grow without overpaying.",
      );
    } else if (key === "professional") {
      reasons.push(
        "It’s built for growing teams and multiple locations—right size, right features, without enterprise complexity.",
      );
    } else if (key === "enterprise") {
      reasons.push(
        "It scales with your organization’s size and complexity so you’re covered as you grow.",
      );
    } else {
      reasons.push(
        "A custom solution will match your scale and complexity so you get exactly what you need.",
      );
    }
    // Type 2: Fit for how you work (features & reports)
    if (key === "starter") {
      reasons.push(
        "You get the core payroll and reporting you need to run payroll confidently from day one.",
      );
    } else if (key === "professional") {
      reasons.push(
        "You get stronger features and compliance reporting that fit how growing companies run payroll.",
      );
    } else if (key === "enterprise") {
      reasons.push(
        "You get the full suite plus management and analytics so payroll and HR stay in control.",
      );
    } else {
      reasons.push(
        "Our team will align features and reporting to the way you actually work.",
      );
    }
    // Type 3: Fit for support
    if (key === "starter") {
      reasons.push(
        "Expert product support is included so you’re never stuck when you need help.",
      );
    } else if (key === "professional") {
      reasons.push(
        "Priority support and setup help are included so you can focus on running the business.",
      );
    } else if (key === "enterprise") {
      reasons.push(
        "Dedicated support and a Product Expert are there when you need them.",
      );
    } else {
      reasons.push(
        "You’ll have a dedicated team to guide setup and ongoing use.",
      );
    }
    // Type 4: Why we recommend (confidence / next step)
    reasons.push(`We think the ${planName} plan is the best fit for you`);
    return reasons;
  };

  const recommendationReasons = getRecommendationReasons();

  return (
    <div className={classes.wrapper}>
      <style>{KEYFRAMES}</style>
      <Container maxWidth="lg" className={classes.container} disableGutters>
        <Box className={classes.card}>
          <Typography component="h1" className={classes.pageHeading}>
            Results
          </Typography>
          {isPartial && (
            <Typography className={classes.partialNote}>
              Answer more questions for a more accurate recommendation.
            </Typography>
          )}

          {/* Pricing at top */}
          {recommended.price != null && (
            <Box marginBottom={2}>
              <Typography
                className={classes.planPriceBig}
                style={{ color: recommended.color }}
                component="span"
              >
                {recommended.price.replace(/\/employee\/month/i, "")}
                <span
                  className={classes.planPriceSmall}
                  style={{ color: recommended.color }}
                >
                  /employee/month
                </span>
              </Typography>
              <Typography className={classes.planPriceSub}>
                Base + per employee / month
              </Typography>
            </Box>
          )}

          <Box className={classes.mainRow}>
            <div className={classes.leftCol}>
              <span
                className={classes.planPill}
                style={{ backgroundColor: recommended.color }}
              >
                {recommended.name}
              </span>
              <Typography component="h2" className={classes.planTitle}>
                {recommended.talkToSales
                  ? recommended.name
                  : `${recommended.name} Plan`}
              </Typography>
              <Typography className={classes.planDescription}>
                {recommended.description}
              </Typography>
              {recommended.features && recommended.features.length > 0 && (
                <>
                  <Typography
                    className={classes.sectionLabel}
                    style={{ marginTop: 16 }}
                  >
                    What’s included
                  </Typography>
                  <ul className={classes.featuresList}>
                    {recommended.features.map((feature, i) => (
                      <li key={i} className={classes.featureItem}>
                        <span className={classes.checkIconWrap}>
                          <CheckIcon style={{ fontSize: 9 }} />
                        </span>
                        {feature}
                      </li>
                    ))}
                  </ul>
                </>
              )}
            </div>
            <div className={classes.rightCol}>
              {recommendationReasons.length > 0 && (
                <>
                  <Typography component="h3" className={classes.whyHeading}>
                    Why we recommend this plan for you
                  </Typography>
                  {recommendationReasons.map((reason, i) => (
                    <Typography
                      key={i}
                      className={classes.whyParagraph}
                      style={{
                        marginBottom:
                          i < recommendationReasons.length - 1 ? 12 : 0,
                      }}
                    >
                      {reason}
                    </Typography>
                  ))}
                </>
              )}
            </div>
          </Box>

          <div className={classes.ctaRow}>
            {recommended.talkToSales ? (
              <Button
                component={RouterLink}
                to="/ProductFinder/ContactUs"
                variant="contained"
                className={classes.primaryBtn}
                style={{ backgroundColor: recommended.color }}
              >
                Contact Sales
              </Button>
            ) : (
              <Button
                variant="contained"
                className={classes.primaryBtn}
                onClick={handleCheckout}
              >
                {recommended.key === "starter"
                  ? "Get Starter Plan"
                  : recommended.key === "professional"
                    ? "Get Professional Plan"
                    : "Get Enterprise Plan"}
              </Button>
            )}
            <Typography
              component={RouterLink}
              to="/ProductFinder/Questionnaire"
              className={classes.retakeLink}
            >
              Retake questionnaire
            </Typography>
          </div>

          <Box className={classes.persuasionBox}>
            <Typography component="h3" className={classes.persuasionTitle}>
              We recommend this plan because it’s the best for you
            </Typography>
            <ul className={classes.persuasionList}>
              <li className={classes.persuasionItem}>
                <CheckIcon className={classes.persuasionIcon} style={{ fontSize: 18 }} />
                <span>
                  <strong>Right fit, not guesswork.</strong> This plan gives you what you actually need—the right capacity, features, and support—so you’re never overpaying or left short. We’re pointing you here because it’s the better choice for your situation.
                </span>
              </li>
              <li className={classes.persuasionItem}>
                <CheckIcon className={classes.persuasionIcon} style={{ fontSize: 18 }} />
                <span>
                  <strong>Built for success.</strong> Thousands of businesses like yours run payroll on this plan every month. You get the right balance so you can start with confidence and grow when you’re ready—this is the plan we recommend when we want the best outcome for you.
                </span>
              </li>
              <li className={classes.persuasionItem}>
                <CheckIcon className={classes.persuasionIcon} style={{ fontSize: 18 }} />
                <span>
                  <strong>No pressure, full support.</strong> We stand behind this recommendation. There’s no long-term lock-in—start when you’re ready and we’ll be here to help. Choosing this plan is the move that’s better for you.
                </span>
              </li>
            </ul>
          </Box>
        </Box>
      </Container>
    </div>
  );
}

export default Result;
