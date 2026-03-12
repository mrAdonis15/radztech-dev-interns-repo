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
import { PricingCardGrid } from "../Pricing/PricingCardGrid";

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
    background: "#f7f9fc",
    paddingTop: theme.spacing(4),
    paddingBottom: theme.spacing(6),
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
    borderRadius: 12,
    border: "1px solid #e2e8f0",
    padding: theme.spacing(4, 3),
    marginBottom: theme.spacing(5),
    animation: "resultCardIn 0.5s cubic-bezier(0.4, 0, 0.2, 1) forwards",
    position: "relative",
    [theme.breakpoints.down("xs")]: {
      padding: theme.spacing(3, 2),
    },
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
    fontSize: "1.25rem",
    fontWeight: 700,
    color: "#0f172a",
    letterSpacing: "-0.02em",
  },
  planPriceBig: {
    fontSize: "3rem",
    fontWeight: 800,
    letterSpacing: "-0.02em",
    lineHeight: 1.2,
    marginBottom: theme.spacing(0.5),
  },
  planPriceSub: {
    fontSize: "0.75rem",
    color: "#64748b",
    marginBottom: theme.spacing(2),
  },
  planPriceSmall: {
    fontSize: "1rem",
    fontWeight: 600,
    opacity: 0.95,
  },
  planDescription: {
    fontSize: "0.875rem",
    fontweight: 400,
    color: "#64748b",
    lineHeight: 1.5,
  },
  planPrice: {
    fontSize: "1.375rem",
    fontWeight: 700,
    color: "#0f172a",
    textAlign: "right",
    whiteSpace: "nowrap",
    flexShrink: 0,
  },
  sectionLabel: {
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
    fontSize: "1.5rem",
    fontWeight: 700,
    color: "#0f172a",
    marginBottom: theme.spacing(1.5),
    lineHeight: 1.4,
  },
  whyParagraph: {
    fontSize: "0.875rem",
    color: "#475569",
    lineHeight: 1.65,
    fontweight: 400,
    marginBottom: theme.spacing(3),
  },
  benefitsList: {
    listStyle: "none",
    padding: 0,
    margin: 0,
  },
  benefitItem: {
    display: "flex",
    alignItems: "flex-start",
    gap: theme.spacing(1.5),
    fontSize: "0.8125rem",
    color: "#475569",
    marginBottom: theme.spacing(1.5),
    lineHeight: 1.4,
  },
  ctaRow: {
    marginTop: theme.spacing(4),
    display: "flex",
    flexDirection: "column",
    gap: theme.spacing(1.5),
  },
  primaryBtn: {
    padding: theme.spacing(1.25, 2),
    fontWeight: 600,
    fontSize: "0.9375rem",
    textTransform: "none",
    borderRadius: 8,
    backgroundColor: "#FF7704",
    color: "#fff",
    boxShadow: "none",
    "&:hover": {
      backgroundColor: "#FF7704",
      boxShadow: "none",
    },
  },
  retakeLink: {
    display: "block",
    textAlign: "center",
    fontSize: "0.875rem",
    color: "#64748b",
    textDecoration: "none",
    "&:hover": { color: "#0f172a" },
  },
  compareTitle: {
    fontSize: "3rem",
    fontWeight: 700,
    color: "#0f172a",
    marginBottom: theme.spacing(3),
    textAlign: "center",
  },
}));

function Result() {
  const classes = useStyles();
  const location = useLocation();
  const navigate = useNavigate();
  const totalScore = location.state?.totalScore ?? null;
  const answeredCount = location.state?.answeredCount;
  const totalQuestions = location.state?.totalQuestions ?? 5;
  const answers = location.state?.answers ?? {};
  const questionsSummary = location.state?.questionsSummary ?? [];
  const isPartial =
    answeredCount != null &&
    totalQuestions != null &&
    answeredCount < totalQuestions;
  const hasAnswers =
    questionsSummary.length > 0 && Object.keys(answers).length > 0;

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

  const getAnswerLabels = (q) => {
    const val = answers[q.id];
    if (val == null) return null;
    if (Array.isArray(val)) return val.map((o) => o.label).join(", ");
    return val.label || val;
  };

  const answersParagraph = hasAnswers
    ? questionsSummary
        .filter((q) => getAnswerLabels(q))
        .map((q) => {
          const labels = getAnswerLabels(q);
          const t = q.title.replace(/\?$/, "").trim();
          if (/how many employees/i.test(t))
            return `You have ${labels} employees.`;
          if (/types of workers/i.test(t)) return `You pay ${labels}.`;
          if (/want from your payroll/i.test(t)) return `You want ${labels}.`;
          if (/kind of payroll reports/i.test(t)) return `You need ${labels}.`;
          if (/level of payroll support/i.test(t))
            return `You prefer ${labels}.`;
          return `${t}: ${labels}.`;
        })
        .join(" ")
    : "";

  return (
    <div className={classes.wrapper}>
      <style>{KEYFRAMES}</style>
      <Container maxWidth="lg" className={classes.container} disableGutters>
        <Box className={classes.card}>
          {isPartial && (
            <Typography className={classes.partialNote}>
              Answer more questions for a more accurate recommendation.
            </Typography>
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
              {recommended.price != null && (
                <>
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
                </>
              )}
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
              {(hasAnswers || recommended.benefits?.length) > 0 && (
                <>
                  {hasAnswers && (
                    <>
                      <Typography component="h3" className={classes.whyHeading}>
                        Why this is for you?
                      </Typography>
                      <Typography className={classes.whyParagraph}>
                        {answersParagraph}
                      </Typography>
                    </>
                  )}
                  {recommended.benefits && recommended.benefits.length > 0 && (
                    <>
                      <Typography className={classes.sectionLabel}>
                        Benefits for you
                      </Typography>
                      <ul className={classes.benefitsList}>
                        {recommended.benefits.map((benefit, i) => (
                          <li key={i} className={classes.benefitItem}>
                            <span className={classes.checkIconWrap}>
                              <CheckIcon style={{ fontSize: 9 }} />
                            </span>
                            {benefit}
                          </li>
                        ))}
                      </ul>
                    </>
                  )}
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
                Talk to Sales
              </Button>
            ) : (
              <Button
                variant="contained"
                className={classes.primaryBtn}
                onClick={handleCheckout}
              >
                Proceed to checkout
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
        </Box>

        <Typography component="h2" className={classes.compareTitle}>
          Compare with other plans
        </Typography>
        <PricingCardGrid
          billingPeriod="monthly"
          showToggle={false}
          recommendedPlanKey={recommended.key}
          recommendedPlanColor={recommended.color}
        />
      </Container>
    </div>
  );
}

export default Result;
