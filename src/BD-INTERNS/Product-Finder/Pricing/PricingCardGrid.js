import React from "react";
import { Link as RouterLink } from "react-router-dom";
import { Typography, Box, Button, Grid, makeStyles } from "@material-ui/core";
import CheckIcon from "@material-ui/icons/Check";
import PhoneIcon from "@material-ui/icons/Phone";

export const ANNUAL_SAVE_PERCENT = 35;
export const BONUS_MONTHS = 3;

export const PLANS = [
  {
    key: "starter",
    name: "Starter",
    scoreRange: "5-9",
    tagline: "Perfect for small teams",
    priceOriginal: 3999,
    priceBase: 2999,
    pricePerEmployee: 79,
    discountPercent: 25,
    badge: null,
    features: [
      "Up to 20 employees",
      "Standard payroll processing",
      "Basic payroll reports",
      "Email support",
      "Monthly billing",
    ],
  },
  {
    key: "professional",
    name: "Professional",
    scoreRange: "10-13",
    tagline: "Best for growing businesses",
    priceOriginal: 6499,
    priceBase: 4999,
    pricePerEmployee: 109,
    discountPercent: 23,
    badge: "Most Popular",
    features: [
      "Up to 150 employees",
      "Advanced payroll & HR tools",
      "Compliance & tax reports",
      "Priority support",
      "Monthly or annual billing",
    ],
  },
  {
    key: "enterprise",
    name: "Enterprise",
    scoreRange: "14-17",
    tagline: "For large organizations",
    priceOriginal: 13999,
    priceBase: 10000,
    pricePerEmployee: 179,
    discountPercent: 29,
    badge: null,
    features: [
      "Unlimited employees",
      "Full UlapPayroll suite",
      "Management & analytics reports",
      "Dedicated Product Expert",
      "Custom reporting & integrations",
    ],
  },
  {
    key: "talk-to-sales",
    name: "Custom",
    cardTitle: "Custom Solution",
    tagline: "Tailored for unique needs",
    talkToSales: true,
    contactPricing: true,
    features: [
      "Everything in Enterprise",
      "Fully customizable workflows",
      "White-label options",
      "Dedicated implementation team",
      "SLA guarantees",
      "Ongoing strategic consulting",
    ],
  },
];

export function formatPhp(n) {
  return "₱" + Number(n).toLocaleString("en-PH");
}

const useStyles = makeStyles((theme) => ({
  toggleSection: {
    textAlign: "center",
    marginBottom: theme.spacing(4),
  },
  toggleText: {
    fontFamily: theme.typography.body1.fontFamily,
    fontSize: "0.8125rem",
    color: "#64748b",
    marginBottom: theme.spacing(1.5),
    maxWidth: 380,
    marginLeft: "auto",
    marginRight: "auto",
    lineHeight: 1.5,
  },
  toggleWrap: {
    display: "inline-flex",
    alignItems: "stretch",
    background: "#fff",
    borderRadius: 6,
    border: "1px solid #e2e8f0",
    padding: 3,
    boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
  },
  toggleOption: {
    fontFamily: theme.typography.body1.fontFamily,
    padding: theme.spacing(0.6, 1.5),
    fontSize: "0.8rem",
    fontWeight: 600,
    textTransform: "none",
    borderRadius: 4,
    minWidth: 72,
    color: "#64748b",
    backgroundColor: "transparent",
    "&:hover": { backgroundColor: "rgba(0,0,0,0.04)" },
    "&$toggleActive": { backgroundColor: "#DB6700", color: "#fff" },
  },
  toggleActive: {},
  toggleAnnualLabel: {
    fontFamily: theme.typography.body1.fontFamily,
    fontSize: "0.7rem",
    fontWeight: 500,
    marginLeft: 4,
  },
  grid: { marginBottom: theme.spacing(2) },
  card: {
    height: "100%",
    display: "flex",
    flexDirection: "column",
    background: "#fff",
    borderRadius: 12,
    border: "1px solid #e2e8f0",
    padding: theme.spacing(2.5),
    transition: "box-shadow 0.2s ease",
    position: "relative",
    overflow: "visible",
    "&:hover": { boxShadow: "0 10px 40px rgba(0,0,0,0.08)" },
  },
  cardWithTopBadge: {
    paddingTop: 44,
  },
  badge: {
    fontFamily: theme.typography.body1.fontFamily,
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    padding: "8px 12px",
    fontSize: "0.7rem",
    fontWeight: 700,
    letterSpacing: "0.04em",
    color: "#fff",
    backgroundColor: "#DB6700",
    textAlign: "center",
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  cardName: {
    fontFamily: theme.typography.h2.fontFamily,
    fontSize: "1.125rem",
    fontWeight: 700,
    color: "#0f172a",
    marginBottom: theme.spacing(0.5),
    marginTop: theme.spacing(0.5),
  },
  cardNameWithBadge: { marginTop: theme.spacing(3) },
  cardTagline: {
    fontFamily: theme.typography.body1.fontFamily,
    fontSize: "0.8125rem",
    color: "#64748b",
    marginBottom: theme.spacing(2),
    lineHeight: 1.4,
    minHeight: 36,
  },
  priceRow: { marginBottom: theme.spacing(1) },
  priceCurrentWrap: {
    display: "flex",
    alignItems: "baseline",
    flexWrap: "wrap",
    gap: 4,
  },
  priceCurrent: {
    fontFamily: theme.typography.h2.fontFamily,
    fontSize: "1.5rem",
    fontWeight: 800,
    color: "#0f172a",
    letterSpacing: "-0.02em",
  },
  priceMoLabel: {
    fontFamily: theme.typography.body1.fontFamily,
    fontSize: "0.875rem",
    fontWeight: 500,
    color: "#64748b",
  },
  savePromo: {
    fontFamily: theme.typography.body1.fontFamily,
    fontSize: "0.8125rem",
    color: "#22c55e",
    fontWeight: 600,
    width: "100%",
    marginTop: 4,
  },
  bonusMonths: {
    fontFamily: theme.typography.body1.fontFamily,
    fontSize: "0.8125rem",
    color: "#22c55e",
    fontWeight: 600,
    width: "100%",
    marginTop: 2,
  },
  featureList: { listStyle: "none", padding: 0, margin: 0, flex: 1 },
  featureItem: {
    fontFamily: theme.typography.body1.fontFamily,
    display: "flex",
    alignItems: "flex-start",
    gap: theme.spacing(2),
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
    backgroundColor: "transparent",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
    marginTop: 3,
  },
  checkIcon: { fontSize: 9, color: "#22c55e" },
  ctaWrap: { marginTop: "auto", paddingTop: theme.spacing(2) },
  getPlanBtn: {
    fontFamily: theme.typography.body1.fontFamily,
    width: "100%",
    padding: theme.spacing(1.25, 2),
    fontWeight: 600,
    fontSize: "0.875rem",
    textTransform: "none",
    borderRadius: 8,
    backgroundColor: "#DB6700",
    color: "#fff",
    "&:hover": { backgroundColor: "#C45D00" },
  },
  talkToSalesBtn: {
    fontFamily: theme.typography.body1.fontFamily,
    width: "100%",
    padding: theme.spacing(1.25, 2),
    fontWeight: 600,
    fontSize: "0.875rem",
    textTransform: "none",
    borderRadius: 8,
    backgroundColor: "#1e293b",
    color: "#fff",
    "&:hover": { backgroundColor: "#0f172a" },
  },
  cardCustomTitle: {
    fontSize: "1rem",
    fontWeight: 700,
    color: "#0f172a",
    marginTop: 0,
    marginBottom: theme.spacing(0.25),
  },
  cardCustomName: {
    fontSize: "1.75rem",
    fontWeight: 800,
    color: "#0f172a",
    letterSpacing: "-0.02em",
    marginBottom: theme.spacing(0.5),
  },
  contactForPricing: {
    fontSize: "0.875rem",
    color: "#64748b",
    marginBottom: theme.spacing(2),
  },
  recommendedBadge: {
    display: "inline-block",
    marginTop: theme.spacing(1),
    marginBottom: theme.spacing(0.5),
    padding: theme.spacing(0.5, 1.25),
    fontSize: "0.6875rem",
    fontWeight: 700,
    letterSpacing: "0.03em",
    color: "#fff",
    backgroundColor: "#DB6700",
    borderRadius: 999,
  },
  topMatchBadge: {
    position: "absolute",
    top: -12,
    left: "50%",
    transform: "translateX(-50%)",
    padding: theme.spacing(0.75, 2),
    fontSize: "0.6875rem",
    fontWeight: 700,
    letterSpacing: "0.08em",
    color: "#fff",
    borderRadius: 4,
    zIndex: 1,
    whiteSpace: "nowrap",
    boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
  },
}));

function getDisplayPrice(plan, billingPeriod) {
  if (plan.talkToSales) return null;
  if (billingPeriod === "monthly") {
    return {
      original: plan.priceOriginal,
      current: plan.priceBase,
      perEmployee: plan.pricePerEmployee,
      discountPercent: plan.discountPercent,
      bonusMonths: null,
    };
  }
  const annualMultiplier = 1 - ANNUAL_SAVE_PERCENT / 100;
  const monthlyEquivalent = Math.round(
    (plan.priceBase * 12 * annualMultiplier) / (12 + BONUS_MONTHS),
  );
  return {
    original: plan.priceOriginal,
    current: monthlyEquivalent,
    perEmployee: Math.round(plan.pricePerEmployee * annualMultiplier),
    discountPercent: plan.discountPercent,
    bonusMonths: BONUS_MONTHS,
  };
}

export function PricingCardGrid({
  plans = PLANS,
  billingPeriod = "monthly",
  onBillingPeriodChange,
  showToggle = true,
  recommendedPlanKey = null,
  recommendedPlanColor = "#1e404e",
}) {
  const classes = useStyles();

  return (
    <>
      {showToggle && onBillingPeriodChange && (
        <Box className={classes.toggleSection}>
          <Typography className={classes.toggleText}>
            Save when you pay yearly—get more for your plan at a lower rate.
          </Typography>
          <Box className={classes.toggleWrap}>
            <Button
              className={`${classes.toggleOption} ${billingPeriod === "monthly" ? classes.toggleActive : ""}`}
              onClick={() => onBillingPeriodChange("monthly")}
            >
              Monthly
            </Button>
            <Button
              className={`${classes.toggleOption} ${billingPeriod === "annual" ? classes.toggleActive : ""}`}
              onClick={() => onBillingPeriodChange("annual")}
            >
              Annual
              <span className={classes.toggleAnnualLabel}>
                Save {ANNUAL_SAVE_PERCENT}%
              </span>
            </Button>
          </Box>
        </Box>
      )}
      <Grid container spacing={3} className={classes.grid}>
        {plans.map((plan) => {
          const priceDisplay = getDisplayPrice(plan, billingPeriod);
          const isRecommended =
            recommendedPlanKey != null && plan.key === recommendedPlanKey;
          return (
            <Grid item xs={12} sm={6} md={3} key={plan.key}>
              <Box
                className={`${classes.card} ${isRecommended || plan.badge ? classes.cardWithTopBadge : ""}`}
              >
                {isRecommended && (
                  <div
                    className={classes.topMatchBadge}
                    style={{ backgroundColor: recommendedPlanColor }}
                  >
                    TOP MATCH
                  </div>
                )}
                {plan.badge && !isRecommended && (
                  <div className={classes.badge}>
                    {plan.badge.toUpperCase()}
                  </div>
                )}
                {priceDisplay && (
                  <Box className={classes.priceRow} style={{ marginBottom: 16 }}>
                    <Box className={classes.priceCurrentWrap}>
                      <Typography
                        component="span"
                        className={classes.priceCurrent}
                      >
                        {formatPhp(priceDisplay.current)}
                      </Typography>
                      <Typography
                        component="span"
                        className={classes.priceMoLabel}
                      >
                        /mo
                        {priceDisplay.perEmployee > 0 &&
                          ` + ${priceDisplay.perEmployee}/employee`}
                      </Typography>
                    </Box>
                    {billingPeriod === "monthly" && (
                      <Typography className={classes.savePromo}>
                        Save 30% for 3 months
                      </Typography>
                    )}
                    {priceDisplay.bonusMonths && (
                      <Typography className={classes.bonusMonths}>
                        +{priceDisplay.bonusMonths} mo. free
                      </Typography>
                    )}
                  </Box>
                )}
                {plan.contactPricing && (
                  <Typography className={classes.contactForPricing} style={{ marginBottom: 8 }}>
                    Contact for pricing
                  </Typography>
                )}
                <Typography
                  component="h3"
                  className={`${classes.cardName} ${plan.badge ? classes.cardNameWithBadge : ""} ${plan.talkToSales && plan.cardTitle ? classes.cardCustomTitle : ""}`}
                >
                  {plan.cardTitle || plan.name}
                </Typography>
                {plan.talkToSales && plan.cardTitle && (
                  <Typography className={classes.cardCustomName}>
                    {plan.name}
                  </Typography>
                )}
                <Typography className={classes.cardTagline}>
                  {plan.tagline}
                </Typography>
                <ul className={classes.featureList}>
                  {plan.features.map((feature, i) => (
                    <li key={i} className={classes.featureItem}>
                      <span className={classes.checkIconWrap}>
                        <CheckIcon className={classes.checkIcon} />
                      </span>
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
                <Box className={classes.ctaWrap}>
                  {plan.talkToSales ? (
                    <Button
                      component={RouterLink}
                      to="/ProductFinder/ContactUs"
                      variant="contained"
                      className={classes.talkToSalesBtn}
                      startIcon={<PhoneIcon style={{ fontSize: 18 }} />}
                    >
                      Contact Sales
                    </Button>
                  ) : (
                    <Button
                      component={RouterLink}
                      to={`/ProductFinder/Checkout?plan=${plan.key}&billing=${billingPeriod}`}
                      variant="contained"
                      className={classes.getPlanBtn}
                    >
                      Get {plan.name} Plan
                    </Button>
                  )}
                </Box>
              </Box>
            </Grid>
          );
        })}
      </Grid>
    </>
  );
}
