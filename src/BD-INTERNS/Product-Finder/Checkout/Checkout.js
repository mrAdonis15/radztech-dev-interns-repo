import React, { useState, useRef, useEffect } from "react";
import { useLocation, useNavigate, Link as RouterLink } from "react-router-dom";
import {
  Box,
  Button,
  CircularProgress,
  Container,
  // eslint-disable-next-line
  IconButton,
  makeStyles,
  Paper,
  TextField,
  Typography,
} from "@material-ui/core";
import {
  Lock,
  ArrowBack,
  Person,
  MyLocation,
  CheckCircleOutline,
  ShoppingCart,
  CreditCard,
  Payment,
  ArrowDropDown,
  Search as SearchIcon,
} from "@material-ui/icons";

import gcashLogo from "../Images/gcash-logo-brandlogos.net_2zwyjdb1l.svg";
import mayaLogo from "../Images/Maya_logo.svg.png";
import qrphLogo from "../Images/QR_Ph_Logo.svg";
import visaLogo from "../Images/Visa_Inc.-Logo.wine.png";
import mastercardLogo from "../Images/Mastercard-Logo.wine.png";

const PLANS = {
  starter: {
    name: "Starter",
    label: "Starter Plan",
    price: 2999,
    basePrice: 2999,
    perEmployee: 79,
    maxEmployees: 25,
    priceDisplay: "2,999 PHP + 79/employee/month",
    color: "#22c55e",
    lightColor: "rgba(34, 197, 94, 0.15)",
    bgColor: "rgba(34, 197, 94, 0.12)",
    description: "Perfect for small teams",
    features: [
      "Up to 25 employees",
      "Basic payroll processing",
      "SSS, PhilHealth, Pag-IBIG",
      "Payslip generation",
      "Monthly reports",
    ],
    benefits: [
      "Instant access after payment",
      "Cancel anytime",
      "Email support",
    ],
  },
  professional: {
    name: "Professional",
    label: "Professional Plan",
    price: 4999,
    basePrice: 4999,
    perEmployee: 109,
    maxEmployees: 100,
    priceDisplay: "4,999 PHP + 109/employee/month",
    color: "#3b82f6",
    lightColor: "rgba(59, 130, 246, 0.15)",
    bgColor: "rgba(59, 130, 246, 0.12)",
    description: "Best for growing businesses",
    features: [
      "Up to 100 employees",
      "Full payroll + tax compliance",
      "Leave & attendance",
      "Custom reports & export",
      "13th month & year-end",
      "Priority support",
    ],
    benefits: [
      "Instant access after payment",
      "Cancel anytime",
      "Dedicated support",
    ],
  },
  enterprise: {
    name: "Enterprise",
    label: "Enterprise Plan",
    price: 10000,
    basePrice: 10000,
    perEmployee: 179,
    maxEmployees: null,
    priceDisplay: "10,000 PHP + 179/employee/month",
    color: "#8b5cf6",
    lightColor: "rgba(139, 92, 246, 0.15)",
    bgColor: "rgba(139, 92, 246, 0.12)",
    description: "For large organizations",
    features: [
      "Unlimited employees",
      "Everything in Professional",
      "API & integrations",
      "Dedicated account manager",
      "Custom workflows",
      "SLA guarantee",
    ],
    benefits: [
      "Instant access after payment",
      "Cancel anytime",
      "Dedicated support",
      "Onboarding assistance",
    ],
  },
};

const PAYMENT_METHODS = [
  { value: "card", label: "Card", icon: "card", logo: null },
  { value: "gcash", label: "GCash", icon: "wallet", logo: gcashLogo },
  { value: "paymaya", label: "Maya", icon: "wallet", logo: mayaLogo },
  { value: "qrph", label: "QrPH", icon: "wallet", logo: qrphLogo },
];

const PLAN_OPTIONS = [
  { key: "starter", label: "Starter — ₱2,999 + ₱79/employee/mo" },
  { key: "professional", label: "Professional — ₱4,999 + ₱109/employee/mo" },
  { key: "enterprise", label: "Enterprise — ₱10,000 + ₱179/employee/mo" },
];

const QR_CODE_BASE = "https://api.qrserver.com/v1/create-qr-code/";
const PENDING_RECEIPT_KEY = "ulap_pending_receipt_";

const COUNTRY_CODES = [
  { code: "+63", iso: "ph", country: "Philippines", maxLength: 11 },
  { code: "+1", iso: "us", country: "US/Canada", maxLength: 10 },
  { code: "+44", iso: "gb", country: "UK", maxLength: 10 },
  { code: "+61", iso: "au", country: "Australia", maxLength: 9 },
  { code: "+65", iso: "sg", country: "Singapore", maxLength: 8 },
  { code: "+81", iso: "jp", country: "Japan", maxLength: 10 },
  { code: "+82", iso: "kr", country: "South Korea", maxLength: 9 },
  { code: "+971", iso: "ae", country: "UAE", maxLength: 9 },
  { code: "+91", iso: "in", country: "India", maxLength: 10 },
  { code: "+31", iso: "nl", country: "Netherlands", maxLength: 9 },
  { code: "+977", iso: "np", country: "Nepal", maxLength: 10 },
  { code: "+687", iso: "nc", country: "New Caledonia", maxLength: 6 },
  { code: "+64", iso: "nz", country: "New Zealand", maxLength: 9 },
  { code: "+49", iso: "de", country: "Germany", maxLength: 11 },
  { code: "+33", iso: "fr", country: "France", maxLength: 9 },
  { code: "+34", iso: "es", country: "Spain", maxLength: 9 },
  { code: "+39", iso: "it", country: "Italy", maxLength: 10 },
  { code: "+86", iso: "cn", country: "China", maxLength: 11 },
  { code: "+60", iso: "my", country: "Malaysia", maxLength: 9 },
  { code: "+66", iso: "th", country: "Thailand", maxLength: 9 },
];

const FLAG_CDN = "https://flagcdn.com/w40";

const useStyles = makeStyles((theme) => ({
  root: {
    minHeight: "100vh",
    overflow: "auto",
    background: "#FAFBFD",
    paddingTop: theme.spacing(1.5),
    paddingBottom: theme.spacing(1.5),
    paddingLeft: theme.spacing(2),
    paddingRight: theme.spacing(2),
    position: "relative",
    boxSizing: "border-box",
  },
  container: {
    position: "relative",
    zIndex: 1,
    maxWidth: "100%",
    margin: "0 auto",
    [theme.breakpoints.up("lg")]: { maxWidth: 1280 },
  },
  topBar: {
    display: "flex",
    alignItems: "center",
    justifyContent: "flex-start",
    marginBottom: theme.spacing(2),
  },
  backLink: {
    display: "inline-flex",
    alignItems: "center",
    gap: theme.spacing(0.5),
    color: theme.palette.primary.main,
    textDecoration: "none",
    margin: theme.spacing(1, 0, 1, 0),
    fontSize: "0.8rem",
    fontWeight: 500,
    fontFamily: theme.typography.body1.fontFamily,
    padding: theme.spacing(0.25, 0),
    borderRadius: 4,
  },
  header: {
    marginTop: theme.spacing(2),
    marginBottom: theme.spacing(1),
    animation: "$fadeSlide 0.5s ease-out",
    textAlign: "center",
  },
  pageTitle: {
    fontFamily: theme.typography.h1.fontFamily,
    fontWeight: 700,
    marginBottom: 0,
    color: theme.palette.text.primary,
    letterSpacing: "-0.02em",
    fontSize: "3rem",
  },
  pageSubtitle: {
    fontFamily: theme.typography.body1.fontFamily,
    color: theme.palette.text.secondary,
    fontSize: "1rem",
    lineHeight: 1.4,
    marginBottom: theme.spacing(2),
  },
  steps: {
    display: "flex",
    alignItems: "center",
    gap: theme.spacing(1),
    marginBottom: theme.spacing(1),
    flexWrap: "wrap",
  },
  step: {
    fontFamily: theme.typography.body1.fontFamily,
    display: "flex",
    alignItems: "center",
    gap: theme.spacing(0.5),
    fontSize: "0.7rem",
    color: theme.palette.text.secondary,
  },
  stepDot: {
    width: 4,
    height: 4,
    borderRadius: "50%",
    backgroundColor: theme.palette.primary.main,
    opacity: 0.6,
  },
  stepDotActive: {
    opacity: 1,
    transform: "scale(1.2)",
    boxShadow: `0 0 0 2px ${theme.palette.primary.main}20`,
  },
  "@keyframes fadeSlide": {
    from: { opacity: 0, transform: "translateY(-8px)" },
    to: { opacity: 1, transform: "translateY(0)" },
  },
  "@keyframes cardIn": {
    from: { opacity: 0, transform: "translateY(8px)" },
    to: { opacity: 1, transform: "translateY(0)" },
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "1fr 280px",
    gap: theme.spacing(1.5),
    alignItems: "start",
    [theme.breakpoints.down("md")]: { gridTemplateColumns: "1fr" },
  },
  unifiedCard: {
    borderRadius: 4,
    overflow: "hidden",
    border: "1px solid rgba(0,0,0,0.12)",
    backgroundColor: "#fff",
    transition: "border-color 0.2s ease",
    animation: "$cardIn 0.5s ease-out 0.1s both",
  },
  unifiedCardInner: {
    display: "grid",
    gridTemplateColumns: "1fr 380px",
    gap: theme.spacing(2.5),
    alignItems: "start",
    [theme.breakpoints.down("md")]: { gridTemplateColumns: "1fr" },
  },
  unifiedBilling: {
    padding: theme.spacing(1.5),
    borderRight: "none",
    minWidth: 0,
    [theme.breakpoints.down("md")]: {
      borderRight: "none",
      borderBottom: "1px solid rgba(0,0,0,0.06)",
    },
  },
  unifiedSummary: {
    padding: theme.spacing(1.5),
    backgroundColor: "rgba(0,0,0,0.02)",
    minWidth: 0,
    [theme.breakpoints.down("md")]: {
      order: -1,
    },
  },
  billingCard: {
    borderRadius: 4,
    overflow: "hidden",
    boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
    border: "1px solid rgba(0,0,0,0.06)",
    transition: "box-shadow 0.3s ease",
    animation: "$cardIn 0.5s ease-out 0.1s both",
    "&:hover": { boxShadow: "0 4px 20px rgba(0,0,0,0.08)" },
  },
  billingCardTop: {
    height: 3,
    background: `linear-gradient(90deg, ${theme.palette.primary.main}, #ff9f43)`,
  },
  billingCardContent: { padding: theme.spacing(1, 1.25) },
  sectionTitle: {
    display: "flex",
    alignItems: "center",
    gap: theme.spacing(0.5),
    fontFamily: theme.typography.h2.fontFamily,
    fontWeight: 600,
    marginBottom: theme.spacing(0.75),
    fontSize: "0.75rem",
    textTransform: "uppercase",
    letterSpacing: "0.04em",
    color: theme.palette.text.primary,
  },
  sectionIcon: {
    width: 30,
    height: 30,
    borderRadius: 4,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255, 117, 4, 0.12)",
    color: theme.palette.primary.main,
  },
  fieldRow: {
    display: "grid",
    gridTemplateColumns: "minmax(0, 1fr) minmax(0, 1fr)",
    gap: theme.spacing(1),
    marginBottom: theme.spacing(0.75),
    [theme.breakpoints.down("sm")]: { gridTemplateColumns: "1fr" },
  },
  fieldWrap: {
    display: "flex",
    flexDirection: "column",
    gap: theme.spacing(0.25),
    marginBottom: theme.spacing(0.75),
    minWidth: 0,
  },
  fieldLabel: {
    fontFamily: theme.typography.body1.fontFamily,
    fontSize: "0.75rem",
    fontWeight: 500,
    color: "rgba(0,0,0,0.72)",
  },
  field: {
    marginBottom: 0,
    minWidth: 0,
    "& .MuiOutlinedInput-root": {
      borderRadius: 4,
      backgroundColor: "#fff",
      border: "1.5px solid rgba(0,0,0,0.15)",
      transition: "border-color 0.2s ease, box-shadow 0.2s ease",
      "& .MuiOutlinedInput-notchedOutline": {
        border: "none",
      },
      "& .MuiOutlinedInput-input": {
        fontFamily: theme.typography.body1.fontFamily,
        padding: theme.spacing(0.75, 1),
        fontSize: "0.8125rem",
      },
      "&.Mui-focused": {
        borderColor: theme.palette.primary.main,
        borderWidth: 2,
        boxShadow: `0 0 0 1px ${theme.palette.primary.main}`,
      },
      "&.Mui-error": {
        borderColor: theme.palette.error.main,
        "&.Mui-focused": {
          boxShadow: `0 0 0 1px ${theme.palette.error.main}`,
        },
      },
    },
    "& .MuiFormHelperText-root": {
      fontFamily: theme.typography.body1.fontFamily,
      fontSize: "0.7rem",
      marginTop: 2,
    },
  },
  fieldHelper: {
    marginTop: 2,
    marginBottom: theme.spacing(0.75),
    marginLeft: 0,
    fontSize: "0.75rem",
    fontFamily: theme.typography.body1.fontFamily,
    color: theme.palette.text.secondary,
    lineHeight: 1.3,
    display: "block",
  },
  fieldHelperSecure: {
    display: "flex",
    alignItems: "center",
    gap: theme.spacing(0.5),
    "& svg": {
      fontSize: 12,
      color: theme.palette.text.secondary,
      flexShrink: 0,
    },
  },
  paymentMethodLabel: {
    fontFamily: theme.typography.body1.fontFamily,
    fontSize: "0.8rem",
    fontWeight: 500,
    color: "rgba(0,0,0,0.72)",
    marginBottom: theme.spacing(0.75),
    display: "block",
  },
  paymentMethodRow: {
    display: "flex",
    flexWrap: "wrap",
    gap: theme.spacing(0.75),
    marginBottom: theme.spacing(1),
  },
  paymentMethodBtn: {
    flex: "1 1 0",
    minWidth: 80,
    padding: theme.spacing(0.75, 1),
    borderRadius: 4,
    border: "2px solid #e2e8f0",
    backgroundColor: "#fff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: theme.spacing(0.5),
    cursor: "pointer",
    transition: "all 0.2s ease",
    fontFamily: theme.typography.body1.fontFamily,
    fontSize: "0.8rem",
    fontWeight: 500,
    color: "#64748b",
    "&:hover": { borderColor: "#cbd5e1", backgroundColor: "#f8fafc" },
    "&$paymentMethodBtnActive": {
      borderColor: theme.palette.primary.main,
      backgroundColor: "rgba(255, 117, 4, 0.08)",
      color: theme.palette.primary.main,
    },
  },
  paymentMethodBtnActive: {},
  paymentMethodIcon: { fontSize: 18, flexShrink: 0 },
  paymentMethodLogo: {
    width: 24,
    height: 24,
    objectFit: "contain",
    flexShrink: 0,
  },
  paymentMethodDetails: {
    marginTop: theme.spacing(1),
    padding: theme.spacing(1.25),
    borderRadius: 4,
    backgroundColor: "rgba(0,0,0,0.02)",
    border: "1px solid rgba(0,0,0,0.08)",
  },
  paymentMethodDetailsLogo: {
    width: 32,
    height: 32,
    objectFit: "contain",
    marginBottom: theme.spacing(0.75),
  },
  locationButtonWrap: {
    marginTop: 2,
    marginBottom: 2,
    display: "flex",
    alignItems: "center",
    gap: theme.spacing(1),
  },
  locationError: { fontSize: "0.65rem", color: theme.palette.error.main },
  paymentNote: {
    display: "flex",
    alignItems: "flex-start",
    gap: theme.spacing(0.5),
    marginTop: theme.spacing(1),
    padding: theme.spacing(1, 1.25),
    borderRadius: 4,
    backgroundColor: "rgba(99, 102, 241, 0.08)",
    border: "1px solid rgba(99, 102, 241, 0.2)",
    fontFamily: theme.typography.body1.fontFamily,
    fontSize: "0.75rem",
    color: "rgba(0,0,0,0.7)",
    lineHeight: 1.4,
  },
  paymentNoteIcon: {
    color: "#22c55e",
    fontSize: 20,
    flexShrink: 0,
    marginTop: 2,
  },
  summaryCard: {
    borderRadius: 4,
    overflow: "hidden",
    boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
    border: "1px solid rgba(0,0,0,0.06)",
    position: "sticky",
    top: theme.spacing(1.5),
    transition: "box-shadow 0.3s ease",
    animation: "$cardIn 0.5s ease-out 0.2s both",
    "&:hover": { boxShadow: "0 4px 20px rgba(0,0,0,0.08)" },
    [theme.breakpoints.down("md")]: { position: "static" },
  },
  summaryCardTop: {
    height: 3,
    background: "linear-gradient(90deg, #64748b, #94a3b8)",
  },
  summaryContent: { padding: theme.spacing(1.25) },
  summaryTitle: {
    display: "flex",
    alignItems: "center",
    gap: theme.spacing(0.5),
    fontFamily: theme.typography.h2.fontFamily,
    fontWeight: 600,
    marginBottom: theme.spacing(1),
    fontSize: "0.8rem",
    textTransform: "uppercase",
    letterSpacing: "0.04em",
  },
  planSwitcherLabel: {
    fontFamily: theme.typography.body1.fontFamily,
    fontSize: "0.75rem",
    color: theme.palette.text.secondary,
    marginBottom: theme.spacing(0.25),
    fontWeight: 500,
  },
  nativeSelectWrap: { marginBottom: theme.spacing(1) },
  phoneRow: {
    display: "flex",
    gap: 0,
    marginBottom: theme.spacing(1),
  },
  phoneNumberWrapper: {
    position: "relative",
    width: "100%",
    minWidth: 0,
  },
  phoneNumberRoot: {
    display: "flex",
    alignItems: "stretch",
    width: "100%",
    minWidth: 0,
    minHeight: 40,
    borderRadius: 4,
    border: "2px solid rgba(0,0,0,0.15)",
    backgroundColor: "#fff",
    fontFamily: theme.typography.body1.fontFamily,
    transition: "border-color 0.2s ease, box-shadow 0.2s ease",
    boxSizing: "border-box",
    "&:focus-within": {
      borderColor: theme.palette.primary.main,
      borderWidth: 2,
      boxShadow: `0 0 0 1px ${theme.palette.primary.main}`,
    },
    "&$phoneNumberError": {
      borderColor: theme.palette.error.main,
      "&:focus-within": {
        borderColor: theme.palette.error.main,
        boxShadow: `0 0 0 1px ${theme.palette.error.main}`,
      },
    },
    "&$phoneNumberRootOpen": {
      borderColor: theme.palette.primary.main,
      borderWidth: 2,
      boxShadow: `0 0 0 1px ${theme.palette.primary.main}`,
    },
  },
  phoneNumberError: {},
  phoneNumberRootOpen: {},
  phoneCountryTrigger: {
    display: "flex",
    alignItems: "center",
    gap: theme.spacing(0.5),
    padding: theme.spacing(0, 0.75),
    border: "none",
    borderRight: "1px solid rgba(0,0,0,0.12)",
    borderRadius: "4px 0 0 4px",
    background: "transparent",
    cursor: "pointer",
    fontFamily: theme.typography.body1.fontFamily,
    fontSize: "0.875rem",
    color: theme.palette.text.primary,
    minWidth: 72,
    flexShrink: 0,
    "&:hover": { backgroundColor: "rgba(0,0,0,0.04)" },
  },
  phoneDropdown: {
    position: "absolute",
    top: "100%",
    left: 0,
    marginTop: 4,
    minWidth: 260,
    maxHeight: 280,
    backgroundColor: "#fff",
    borderRadius: 4,
    boxShadow: "0 4px 20px rgba(0,0,0,0.15)",
    border: "1px solid rgba(0,0,0,0.08)",
    zIndex: 1300,
    overflow: "hidden",
    display: "flex",
    flexDirection: "column",
  },
  phoneDropdownSearchWrap: {
    padding: theme.spacing(0.75),
    borderBottom: "1px solid rgba(0,0,0,0.08)",
    display: "flex",
    alignItems: "center",
    position: "relative",
    backgroundColor: "#fafafa",
  },
  phoneDropdownSearch: {
    flex: 1,
    border: "1px solid rgba(0,0,0,0.15)",
    borderRadius: 4,
    padding: "8px 10px 8px 36px",
    fontSize: "0.875rem",
    fontFamily: theme.typography.body1.fontFamily,
    outline: "none",
    "&:focus": { borderColor: theme.palette.primary.main },
  },
  phoneDropdownSearchIcon: {
    position: "absolute",
    left: theme.spacing(1.5),
    top: "50%",
    transform: "translateY(-50%)",
    color: theme.palette.text.secondary,
    fontSize: 18,
    pointerEvents: "none",
  },
  phoneDropdownList: {
    overflow: "auto",
    maxHeight: 220,
    padding: theme.spacing(0.5),
  },
  phoneDropdownItem: {
    display: "flex",
    alignItems: "center",
    gap: theme.spacing(1),
    padding: theme.spacing(0.75, 1),
    borderRadius: 4,
    cursor: "pointer",
    fontFamily: theme.typography.body1.fontFamily,
    fontSize: "0.875rem",
    color: theme.palette.text.primary,
    "&:hover": { backgroundColor: "rgba(0,0,0,0.06)" },
  },
  phoneNumberInputWrap: {
    flex: 1,
    minWidth: 0,
  },
  phoneNumberInput: {
    width: "100%",
    height: "100%",
    minHeight: 36,
    border: "none",
    padding: theme.spacing(0, 1.25),
    borderRadius: "0 4px 4px 0",
    fontSize: "0.9rem",
    fontFamily: theme.typography.body1.fontFamily,
    outline: "none",
    boxSizing: "border-box",
    "&::placeholder": { color: "rgba(0,0,0,0.4)" },
  },
  phoneCountryWrap: {
    display: "flex",
    alignItems: "center",
    borderRadius: 4,
    backgroundColor: "#fff",
    border: "1px solid rgba(0,0,0,0.15)",
    paddingLeft: theme.spacing(0.75),
    paddingRight: theme.spacing(0.5),
    gap: theme.spacing(0.5),
    flexShrink: 0,
    minHeight: 40,
    transition: "border-color 0.2s ease",
    "&:focus-within": {
      borderColor: theme.palette.primary.main,
      borderWidth: 2,
    },
  },
  phoneCountrySelect: {
    border: "none",
    background: "transparent",
    padding: "6px 2px 6px 0",
    fontSize: "0.8rem",
    fontFamily: theme.typography.body1.fontFamily,
    color: theme.palette.text.primary,
    cursor: "pointer",
    outline: "none",
    minWidth: 48,
  },
  phoneFlag: {
    width: 24,
    height: 18,
    objectFit: "cover",
    borderRadius: 2,
    flexShrink: 0,
    border: "1px solid rgba(0,0,0,0.1)",
  },
  phoneInput: { flex: 1, minWidth: 0 },
  nativeSelect: {
    width: "100%",
    padding: "8px 10px",
    borderRadius: 4,
    backgroundColor: "#fafbfc",
    border: "1px solid rgba(0,0,0,0.15)",
    fontSize: "0.85rem",
    fontFamily: theme.typography.body1.fontFamily,
    color: theme.palette.text.primary,
    cursor: "pointer",
    transition: "border-color 0.2s ease, background-color 0.2s ease",
    "&:focus": {
      outline: "none",
      borderColor: theme.palette.primary.main,
      borderWidth: 2,
      padding: "7px 9px",
    },
  },
  nativeSelectSmall: {
    padding: "6px 10px",
    fontSize: "0.8rem",
    fontFamily: theme.typography.body1.fontFamily,
    borderRadius: 4,
    backgroundColor: "#fafbfc",
    border: "1px solid rgba(0,0,0,0.15)",
    "&:focus": { padding: "5px 9px" },
  },
  planSwitcher: { marginBottom: theme.spacing(1) },
  planSwitcherWrapper: {
    position: "relative",
    width: "100%",
    minWidth: 0,
    marginBottom: theme.spacing(1),
  },
  planSwitcherRoot: {
    display: "flex",
    alignItems: "stretch",
    width: "100%",
    minWidth: 0,
    minHeight: 40,
    borderRadius: 4,
    border: "2px solid rgba(0,0,0,0.15)",
    backgroundColor: "#fff",
    fontFamily: theme.typography.body1.fontFamily,
    transition: "border-color 0.2s ease, box-shadow 0.2s ease",
    boxSizing: "border-box",
    "&:focus-within": {
      borderColor: theme.palette.primary.main,
      borderWidth: 2,
      boxShadow: `0 0 0 1px ${theme.palette.primary.main}`,
    },
    "&$planSwitcherRootOpen": {
      borderColor: theme.palette.primary.main,
      borderWidth: 2,
      boxShadow: `0 0 0 1px ${theme.palette.primary.main}`,
    },
  },
  planSwitcherRootOpen: {},
  planSwitcherTrigger: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    width: "100%",
    padding: theme.spacing(0, 1, 0, 1.25),
    border: "none",
    borderRadius: 4,
    background: "transparent",
    cursor: "pointer",
    fontFamily: theme.typography.body1.fontFamily,
    fontSize: "0.875rem",
    color: theme.palette.text.primary,
    textAlign: "left",
    "&:hover": { backgroundColor: "rgba(0,0,0,0.04)" },
  },
  planDropdown: {
    position: "absolute",
    top: "100%",
    left: 0,
    right: 0,
    marginTop: 4,
    maxHeight: 280,
    backgroundColor: "#fff",
    borderRadius: 4,
    boxShadow: "0 4px 20px rgba(0,0,0,0.15)",
    border: "1px solid rgba(0,0,0,0.08)",
    zIndex: 1300,
    overflow: "hidden",
    display: "flex",
    flexDirection: "column",
  },
  planDropdownSearchWrap: {
    padding: theme.spacing(0.75),
    borderBottom: "1px solid rgba(0,0,0,0.08)",
    display: "flex",
    alignItems: "center",
    position: "relative",
    backgroundColor: "#fafafa",
  },
  planDropdownSearch: {
    flex: 1,
    border: "1px solid rgba(0,0,0,0.15)",
    borderRadius: 4,
    padding: "8px 10px 8px 36px",
    fontSize: "0.875rem",
    fontFamily: theme.typography.body1.fontFamily,
    outline: "none",
    "&:focus": { borderColor: theme.palette.primary.main },
  },
  planDropdownSearchIcon: {
    position: "absolute",
    left: theme.spacing(1.5),
    top: "50%",
    transform: "translateY(-50%)",
    color: theme.palette.text.secondary,
    fontSize: 18,
    pointerEvents: "none",
  },
  planDropdownList: {
    overflow: "auto",
    maxHeight: 220,
    padding: theme.spacing(0.5),
  },
  planDropdownItem: {
    display: "block",
    width: "100%",
    padding: theme.spacing(0.75, 1),
    borderRadius: 4,
    cursor: "pointer",
    fontFamily: theme.typography.body1.fontFamily,
    fontSize: "0.875rem",
    color: theme.palette.text.primary,
    textAlign: "left",
    border: "none",
    background: "none",
    "&:hover": { backgroundColor: "rgba(0,0,0,0.06)" },
  },
  planSummaryBox: {
    padding: theme.spacing(1),
    borderRadius: 4,
    marginBottom: theme.spacing(1),
    border: "2px solid transparent",
    transition: "all 0.2s ease",
    backgroundColor: "rgba(0,0,0,0.02)",
  },
  planBadge: {
    display: "inline-flex",
    alignItems: "center",
    padding: "3px 8px",
    borderRadius: 4,
    color: "#fff",
    fontWeight: 600,
    fontSize: "0.7rem",
    marginBottom: theme.spacing(0.5),
    boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
  },
  planName: {
    fontFamily: theme.typography.h2.fontFamily,
    fontWeight: 600,
    fontSize: "0.9rem",
    marginBottom: 2,
  },
  planDescription: {
    fontFamily: theme.typography.body1.fontFamily,
    fontSize: "0.75rem",
    color: theme.palette.text.secondary,
    marginBottom: theme.spacing(0.5),
  },
  planPrice: {
    fontFamily: theme.typography.h2.fontFamily,
    fontWeight: 600,
    fontSize: "0.95rem",
    color: theme.palette.text.primary,
  },
  totalRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: theme.spacing(1),
    paddingBottom: theme.spacing(1),
    borderTop: "1px solid rgba(0,0,0,0.08)",
    marginBottom: theme.spacing(0.5),
  },
  totalLabel: {
    fontFamily: theme.typography.body1.fontFamily,
    fontWeight: 600,
    fontSize: "0.85rem",
  },
  totalAmount: {
    fontFamily: theme.typography.h2.fontFamily,
    fontWeight: 700,
    fontSize: "1rem",
    color: theme.palette.primary.main,
    letterSpacing: "-0.02em",
  },
  amountHero: {
    textAlign: "center",
    padding: theme.spacing(2.5, 2),
    marginBottom: theme.spacing(2),
    borderRadius: 8,
    backgroundColor: "rgba(255, 119, 4, 0.08)",
    border: "2px solid rgba(255, 119, 4, 0.25)",
  },
  amountHeroLabel: {
    fontFamily: theme.typography.body1.fontFamily,
    fontSize: "0.75rem",
    fontWeight: 600,
    textTransform: "uppercase",
    letterSpacing: "0.06em",
    color: theme.palette.text.secondary,
    marginBottom: theme.spacing(0.5),
  },
  amountHeroValue: {
    fontFamily: theme.typography.h2.fontFamily,
    fontWeight: 800,
    fontSize: "2rem",
    letterSpacing: "-0.03em",
    color: theme.palette.primary.main,
    lineHeight: 1.2,
  },
  amountHeroSub: {
    fontFamily: theme.typography.body1.fontFamily,
    fontSize: "0.8125rem",
    color: theme.palette.text.secondary,
    marginTop: theme.spacing(0.5),
  },
  editablePriceRow: {
    display: "flex",
    alignItems: "center",
    gap: theme.spacing(1),
    marginBottom: theme.spacing(0.75),
  },
  editablePriceInput: {
    width: 80,
    "& .MuiOutlinedInput-input": {
      padding: theme.spacing(0.75, 1),
      fontSize: "0.875rem",
    },
    "& .MuiOutlinedInput-root": { borderRadius: 4 },
  },
  receiptBox: {
    border: "1px solid rgba(0,0,0,0.12)",
    borderRadius: 4,
    backgroundColor: "#fff",
    overflow: "hidden",
  },
  receiptHeader: {
    padding: theme.spacing(1.25, 1.5),
    borderBottom: "1px dashed rgba(0,0,0,0.15)",
    textAlign: "center",
  },
  receiptTitle: {
    fontFamily: theme.typography.h2.fontFamily,
    fontWeight: 700,
    fontSize: "0.95rem",
    marginBottom: 2,
  },
  receiptSubtitle: {
    fontFamily: theme.typography.body1.fontFamily,
    fontSize: "0.7rem",
    color: theme.palette.text.secondary,
  },
  receiptBody: { padding: theme.spacing(1, 1.5) },
  receiptRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: theme.spacing(1),
    padding: "4px 0",
    fontFamily: theme.typography.body1.fontFamily,
    fontSize: "0.8rem",
  },
  receiptRowLabel: { color: theme.palette.text.secondary },
  receiptRowValue: { fontWeight: 600, textAlign: "right" },
  receiptDivider: {
    borderTop: "1px dashed rgba(0,0,0,0.15)",
    margin: theme.spacing(0.75, 0),
  },
  receiptSectionTitle: {
    fontFamily: theme.typography.h2.fontFamily,
    fontWeight: 600,
    fontSize: "0.7rem",
    textTransform: "uppercase",
    letterSpacing: "0.04em",
    color: theme.palette.text.secondary,
    marginBottom: theme.spacing(0.5),
    marginTop: theme.spacing(0.5),
  },
  confirmBtn: {
    width: "100%",
    marginTop: theme.spacing(2),
    padding: theme.spacing(1.25, 2),
    borderRadius: 4,
    fontFamily: theme.typography.h2.fontFamily,
    fontWeight: 600,
    textTransform: "none",
    fontSize: "0.9rem",
    transition: "all 0.2s ease",
    "&:hover:not(:disabled)": {
      transform: "translateY(-1px)",
    },
    "&:active:not(:disabled)": { transform: "translateY(0)" },
  },
  secureBadge: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: theme.spacing(0.5),
    marginTop: theme.spacing(0.75),
    padding: theme.spacing(0.75),
    fontFamily: theme.typography.body1.fontFamily,
    fontSize: "0.75rem",
    color: theme.palette.text.secondary,
    backgroundColor: "rgba(0,0,0,0.02)",
    borderRadius: 4,
  },
  paymentDetailsBox: {
    marginTop: theme.spacing(1),
    padding: theme.spacing(1.25),
    borderRadius: 4,
    backgroundColor: "rgba(0,0,0,0.02)",
    border: "1px solid rgba(0,0,0,0.08)",
  },
  paymentDetailsTitle: {
    fontFamily: theme.typography.h2.fontFamily,
    fontSize: "0.8rem",
    fontWeight: 600,
    textTransform: "uppercase",
    letterSpacing: "0.04em",
    marginBottom: theme.spacing(0.75),
    color: theme.palette.text.primary,
  },
  qrBox: {
    marginTop: theme.spacing(1.5),
    padding: theme.spacing(2),
    borderRadius: 4,
    backgroundColor: "#fff",
    border: "1px solid rgba(0,0,0,0.08)",
    textAlign: "center",
  },
  qrImage: {
    width: 200,
    height: 200,
    display: "block",
    margin: "0 auto",
    marginBottom: theme.spacing(1.5),
  },
  qrLabel: {
    fontFamily: theme.typography.body1.fontFamily,
    fontSize: "0.85rem",
    fontWeight: 600,
    marginBottom: theme.spacing(0.25),
  },
  qrHint: {
    fontFamily: theme.typography.body1.fontFamily,
    fontSize: "0.75rem",
    color: theme.palette.text.secondary,
  },
  qrOverlay: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.5)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1300,
    padding: theme.spacing(2),
  },
  qrModal: {
    backgroundColor: "#fff",
    borderRadius: 4,
    padding: theme.spacing(3),
    maxWidth: 360,
    width: "100%",
    textAlign: "center",
    boxShadow: "0 24px 48px rgba(0,0,0,0.2)",
  },
  qrModalTitle: {
    fontFamily: theme.typography.h2.fontFamily,
    fontSize: "1rem",
    fontWeight: 600,
    marginBottom: theme.spacing(1.5),
  },
  qrModalAmount: {
    fontFamily: theme.typography.h2.fontFamily,
    fontSize: "1.25rem",
    fontWeight: 700,
    color: theme.palette.primary.main,
    marginBottom: theme.spacing(2),
  },
}));

function getPlanFromSearch(search) {
  const params = new URLSearchParams(search);
  const plan = (params.get("plan") || "professional").toLowerCase();
  return PLANS[plan] ? plan : "professional";
}

export default function Checkout() {
  const classes = useStyles();
  const location = useLocation();
  const navigate = useNavigate();
  const planKey = getPlanFromSearch(location.search);
  const plan = PLANS[planKey];

  const [form, setForm] = useState({
    recipientName: "",
    workEmail: "",
    fullName: "",
    companyName: "",
    phone: "",
    phoneCountryCode: "+63",
    billingAddress: "",
    paymentMethod: "card",
  });
  const [paymentDetails, setPaymentDetails] = useState({
    cardNumber: "",
    cardExpiry: "",
    cardCvv: "",
    nameOnCard: "",
    gcashNumber: "",
    mayaContact: "",
  });
  const [errors, setErrors] = useState({});
  // eslint-disable-next-line
  const [touched, setTouched] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [showQrStep, setShowQrStep] = useState(false);
  const [qrStepReceiptState, setQrStepReceiptState] = useState(null);
  const [locationLoading, setLocationLoading] = useState(false);
  const [locationError, setLocationError] = useState(null);
  const [phoneDropdownOpen, setPhoneDropdownOpen] = useState(false);
  const [phoneCountrySearch, setPhoneCountrySearch] = useState("");
  const phoneRef = useRef(null);
  const [planDropdownOpen, setPlanDropdownOpen] = useState(false);
  const [planDropdownSearch, setPlanDropdownSearch] = useState("");
  const planDropdownRef = useRef(null);
  const [employeeCount, setEmployeeCount] = useState(10);

  const rawEmployees = Math.max(0, Math.floor(Number(employeeCount) || 0));
  const displayEmployees =
    plan.maxEmployees != null
      ? Math.min(plan.maxEmployees, rawEmployees)
      : rawEmployees;
  const computedTotal = plan.basePrice + plan.perEmployee * displayEmployees;

  useEffect(() => {
    if (!phoneDropdownOpen) return;
    const handleClickOutside = (e) => {
      if (phoneRef.current && !phoneRef.current.contains(e.target)) {
        setPhoneDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [phoneDropdownOpen]);

  useEffect(() => {
    if (!planDropdownOpen) return;
    const handleClickOutside = (e) => {
      if (
        planDropdownRef.current &&
        !planDropdownRef.current.contains(e.target)
      )
        setPlanDropdownOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [planDropdownOpen]);

  useEffect(() => {
    const max = plan.maxEmployees;
    if (max == null) return;
    setEmployeeCount((prev) => {
      const n = Math.max(0, Math.floor(Number(prev) || 0));
      return n > max ? max : prev;
    });
  }, [planKey, plan.maxEmployees]);

  const handleChange = (field) => (e) => {
    const value = e?.target?.value;
    if (value === undefined) return;
    setForm((prev) => {
      const next = { ...prev, [field]: value };
      if (field === "phoneCountryCode") {
        const maxLen =
          COUNTRY_CODES.find((c) => c.code === value)?.maxLength ?? 11;
        next.phone = (prev.phone || "").replace(/\D/g, "").slice(0, maxLen);
      }
      return next;
    });
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: "" }));
  };

  const handlePhoneChange = (e) => {
    const raw = e?.target?.value ?? "";
    const digits = raw.replace(/\D/g, "");
    const maxLen =
      COUNTRY_CODES.find((c) => c.code === form.phoneCountryCode)?.maxLength ??
      11;
    setForm((prev) => ({ ...prev, phone: digits.slice(0, maxLen) }));
    if (errors.phone) setErrors((prev) => ({ ...prev, phone: "" }));
  };

  const handlePaymentDetailsChange = (field) => (e) => {
    const value = e?.target?.value;
    if (value === undefined) return;
    setPaymentDetails((prev) => ({ ...prev, [field]: value }));
    const errKey = `payment_${field}`;
    if (errors[errKey]) setErrors((prev) => ({ ...prev, [errKey]: "" }));
  };

  const handleBlur = (field) => () =>
    setTouched((prev) => ({ ...prev, [field]: true }));

  const getBillingAddressFromGPS = () => {
    setLocationError(null);
    setLocationLoading(true);
    if (!navigator.geolocation) {
      setLocationError("Geolocation is not supported by your browser.");
      setLocationLoading(false);
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        fetch(
          `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`,
          {
            headers: {
              "Accept-Language": "en",
              "User-Agent": "Batch11Checkout/1.0",
            },
          },
        )
          .then((res) => res.json())
          .then((data) => {
            const a = data.address || {};
            const parts = [
              a.road,
              a.suburb || a.village || a.town,
              a.city || a.municipality,
              a.state || a.province,
              a.postcode,
              a.country,
            ].filter(Boolean);
            const address = parts.join(", ");
            setForm((prev) => ({ ...prev, billingAddress: address }));
            setLocationError(null);
          })
          .catch(() =>
            setLocationError("Could not resolve address from location."),
          )
          .finally(() => setLocationLoading(false));
      },
      () => {
        setLocationError("Location access denied or unavailable.");
        setLocationLoading(false);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 },
    );
  };

  const validate = () => {
    const next = {};
    if (!form.recipientName.trim())
      next.recipientName = "Please enter recipient name";
    if (!form.workEmail.trim()) next.workEmail = "Please enter email";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.workEmail.trim()))
      next.workEmail = "Please enter a valid email address";
    if (!form.companyName.trim())
      next.companyName = "Please enter your company name";
    if (form.paymentMethod === "card") {
      if (!paymentDetails.cardNumber?.trim())
        next.payment_cardNumber = "Card number is required";
      if (!paymentDetails.cardExpiry?.trim())
        next.payment_cardExpiry = "Expiry (MM/YY) is required";
      if (!paymentDetails.cardCvv?.trim())
        next.payment_cardCvv = "CVV is required";
      if (!paymentDetails.nameOnCard?.trim())
        next.payment_nameOnCard = "Name on card is required";
    }
    if (form.paymentMethod === "gcash") {
      if (!paymentDetails.gcashNumber?.trim())
        next.payment_gcashNumber = "GCash mobile number is required";
      else if (!/^09\d{9}$/.test(paymentDetails.gcashNumber.replace(/\s/g, "")))
        next.payment_gcashNumber =
          "Enter a valid 11-digit mobile number (09XX XXX XXXX)";
    }
    if (form.paymentMethod === "paymaya") {
      if (!paymentDetails.mayaContact?.trim())
        next.payment_mayaContact = "Maya mobile number is required";
      else if (!/^09\d{9}$/.test(String(paymentDetails.mayaContact).replace(/\s/g, "")))
        next.payment_mayaContact =
          "Enter a valid 11-digit mobile number (09XX XXX XXXX)";
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;
    setSubmitting(true);
    const receiptId = `UPR-${Date.now().toString(36).toUpperCase()}`;
    const date = new Date().toLocaleString("en-PH", {
      dateStyle: "medium",
      timeStyle: "short",
    });
    const receiptState = {
      form: { ...form },
      planKey,
      plan: { ...plan },
      employeeCount: displayEmployees,
      totalAmount: computedTotal,
      paymentMethod: form.paymentMethod,
      receiptId,
      date,
    };

    const isEwallet =
      form.paymentMethod === "gcash" ||
      form.paymentMethod === "paymaya" ||
      form.paymentMethod === "qrph";
    if (isEwallet) {
      try {
        sessionStorage.setItem(
          PENDING_RECEIPT_KEY + receiptId,
          JSON.stringify(receiptState),
        );
      } catch (_) {}
      setTimeout(() => {
        setSubmitting(false);
        setQrStepReceiptState(receiptState);
        setShowQrStep(true);
      }, 800);
    } else {
      try {
        sessionStorage.setItem(
          PENDING_RECEIPT_KEY + receiptId,
          JSON.stringify(receiptState),
        );
      } catch (_) {}
      setTimeout(() => {
        setSubmitting(false);
        navigate(`/ProductFinder/PaymentComplete?ref=${receiptId}`, {
          replace: true,
        });
      }, 1800);
    }
  };

  const handleQrDone = () => {
    if (qrStepReceiptState) {
      navigate(
        `/ProductFinder/PaymentComplete?ref=${qrStepReceiptState.receiptId}`,
        {
          replace: true,
        },
      );
      setShowQrStep(false);
      setQrStepReceiptState(null);
    }
  };
  // eslint-disable-next-line
  const handlePlanChange = (e) => {
    const newPlan = e?.target?.value;
    if (newPlan)
      navigate({
        pathname: "/ProductFinder/Checkout",
        search: `?plan=${newPlan}`,
      });
  };

  const formatPrice = (amount) => `₱${amount.toLocaleString("en-PH")}/month`;

  return (
    <Box className={classes.root}>
      <Container maxWidth="lg" className={classes.container}>
        <Box className={classes.topBar}>
          <RouterLink to="/ProductFinder/Pricing" className={classes.backLink}>
            <ArrowBack fontSize="small" style={{ flexShrink: 0 }} />
            <span>Back </span>
          </RouterLink>
        </Box>

        <Box className={classes.header}>
          <Typography variant="h1" className={classes.pageTitle}>
            Complete Your Purchase
          </Typography>
          <Typography variant="body1" className={classes.pageSubtitle}>
            Enter your billing details to subscribe to UlapPayroll. We’ll send
            your receipt and next steps to your email.
          </Typography>
        </Box>

        <form onSubmit={handleSubmit}>
          <Paper className={classes.unifiedCard} elevation={0}>
            <Box className={classes.unifiedCardInner}>
              <Box className={classes.unifiedBilling}>
                <Typography component="div" className={classes.sectionTitle}>
                  <Box className={classes.sectionIcon}>
                    <Person fontSize="small" />
                  </Box>
                  Billing Information
                </Typography>
                <Box className={classes.fieldRow}>
                  <Box className={classes.fieldWrap}>
                    <Typography className={classes.fieldLabel}>
                      Recipient name
                    </Typography>
                    <TextField
                      className={classes.field}
                      fullWidth
                      variant="outlined"
                      size="small"
                      placeholder="e.g. Juan Dela Cruz"
                      value={form.recipientName}
                      onChange={handleChange("recipientName")}
                      onBlur={handleBlur("recipientName")}
                      error={!!errors.recipientName}
                      helperText={errors.recipientName}
                      required
                    />
                  </Box>
                  <Box className={classes.fieldWrap}>
                    <Typography className={classes.fieldLabel}>
                      Email
                    </Typography>
                    <TextField
                      className={classes.field}
                      fullWidth
                      variant="outlined"
                      size="small"
                      type="email"
                      placeholder="e.g. you@company.com"
                      value={form.workEmail}
                      onChange={handleChange("workEmail")}
                      onBlur={handleBlur("workEmail")}
                      error={!!errors.workEmail}
                      helperText={errors.workEmail}
                      required
                    />
                  </Box>
                </Box>
                <Box className={classes.fieldRow}>
                  <Box className={classes.fieldWrap}>
                    <Typography className={classes.fieldLabel}>
                      Company Name
                    </Typography>
                    <TextField
                      className={classes.field}
                      fullWidth
                      variant="outlined"
                      size="small"
                      placeholder="e.g. Acme Inc."
                      value={form.companyName}
                      onChange={handleChange("companyName")}
                      onBlur={handleBlur("companyName")}
                      error={!!errors.companyName}
                      helperText={errors.companyName}
                      required
                    />
                  </Box>
                  <Box className={classes.fieldWrap}>
                    <Typography className={classes.fieldLabel}>
                      Phone number
                    </Typography>
                    <Box ref={phoneRef} className={classes.phoneNumberWrapper}>
                      <Box
                        className={`${classes.phoneNumberRoot} ${errors.phone ? classes.phoneNumberError : ""} ${phoneDropdownOpen ? classes.phoneNumberRootOpen : ""}`}
                      >
                        <button
                          type="button"
                          className={classes.phoneCountryTrigger}
                          onClick={() => setPhoneDropdownOpen((o) => !o)}
                          aria-expanded={phoneDropdownOpen}
                          aria-haspopup="listbox"
                          aria-label="Country code"
                        >
                          {(() => {
                            const current = COUNTRY_CODES.find(
                              (c) => c.code === form.phoneCountryCode,
                            );
                            return (
                              <>
                                <img
                                  src={`${FLAG_CDN}/${current ? current.iso : "ph"}.png`}
                                  alt=""
                                  className={classes.phoneFlag}
                                  aria-hidden
                                />
                                <span>{current ? current.code : "+63"}</span>
                                <ArrowDropDown
                                  style={{ fontSize: 20, marginLeft: "auto" }}
                                />
                              </>
                            );
                          })()}
                        </button>
                        <Box className={classes.phoneNumberInputWrap}>
                          <input
                            type="tel"
                            className={classes.phoneNumberInput}
                            placeholder={
                              form.phoneCountryCode === "+63"
                                ? "912 345 6789"
                                : "Enter number"
                            }
                            value={form.phone}
                            onChange={handlePhoneChange}
                            onBlur={handleBlur("phone")}
                            maxLength={
                              COUNTRY_CODES.find(
                                (c) => c.code === form.phoneCountryCode,
                              )?.maxLength ?? 11
                            }
                            inputMode="numeric"
                            aria-label="Phone number"
                          />
                        </Box>
                      </Box>
                      {phoneDropdownOpen && (
                        <Box className={classes.phoneDropdown}>
                          <Box className={classes.phoneDropdownSearchWrap}>
                            <SearchIcon
                              className={classes.phoneDropdownSearchIcon}
                            />
                            <input
                              type="text"
                              className={classes.phoneDropdownSearch}
                              placeholder="Search country"
                              value={phoneCountrySearch}
                              onChange={(e) =>
                                setPhoneCountrySearch(e.target.value)
                              }
                              autoFocus
                            />
                          </Box>
                          <Box
                            className={classes.phoneDropdownList}
                            role="listbox"
                          >
                            {COUNTRY_CODES.filter(
                              (c) =>
                                !phoneCountrySearch ||
                                c.country
                                  .toLowerCase()
                                  .includes(phoneCountrySearch.toLowerCase()) ||
                                c.code.includes(phoneCountrySearch),
                            ).map((c) => (
                              <div
                                key={c.code}
                                role="option"
                                aria-selected={form.phoneCountryCode === c.code}
                                className={classes.phoneDropdownItem}
                                onClick={() => {
                                  setForm((prev) => {
                                    const next = {
                                      ...prev,
                                      phoneCountryCode: c.code,
                                    };
                                    const maxLen = c.maxLength ?? 11;
                                    next.phone = (prev.phone || "")
                                      .replace(/\D/g, "")
                                      .slice(0, maxLen);
                                    return next;
                                  });
                                  setPhoneDropdownOpen(false);
                                  setPhoneCountrySearch("");
                                }}
                              >
                                <img
                                  src={`${FLAG_CDN}/${c.iso}.png`}
                                  alt=""
                                  className={classes.phoneFlag}
                                  aria-hidden
                                />
                                <span>
                                  {c.country} ({c.code})
                                </span>
                              </div>
                            ))}
                          </Box>
                        </Box>
                      )}
                      {errors.phone && (
                        <Typography
                          style={{
                            fontFamily: "inherit",
                            fontSize: "0.7rem",
                            color: "#d32f2f",
                            marginTop: 4,
                          }}
                        >
                          {errors.phone}
                        </Typography>
                      )}
                    </Box>
                  </Box>
                </Box>

                <Box className={classes.fieldWrap}>
                  <Typography className={classes.fieldLabel}>
                    Billing Address
                  </Typography>
                  <TextField
                    className={classes.field}
                    fullWidth
                    variant="outlined"
                    size="small"
                    placeholder="Street, Barangay, City, Province, ZIP Code"
                    multiline
                    minRows={1}
                    maxRows={3}
                    value={form.billingAddress}
                    onChange={handleChange("billingAddress")}
                    onBlur={handleBlur("billingAddress")}
                    inputProps={{
                      maxLength: 500,
                      autoComplete: "billing street-address",
                      "aria-describedby": "billing-address-helper",
                    }}
                  />
                </Box>
                <Box className={classes.locationButtonWrap}>
                  <Button
                    size="small"
                    color="primary"
                    startIcon={
                      locationLoading ? (
                        <CircularProgress size={14} color="inherit" />
                      ) : (
                        <MyLocation fontSize="small" />
                      )
                    }
                    onClick={getBillingAddressFromGPS}
                    disabled={locationLoading}
                    aria-label="Use my current location for billing address"
                    style={{
                      minWidth: 0,
                      padding: "4px 8px",
                      fontSize: "0.75rem",
                    }}
                  >
                    Use my location
                  </Button>
                  {locationError && (
                    <Typography
                      className={classes.locationError}
                      component="span"
                    >
                      {locationError}
                    </Typography>
                  )}
                </Box>
                <Typography
                  id="billing-address-helper"
                  className={`${classes.fieldHelper} ${classes.fieldHelperSecure}`}
                >
                  <Lock fontSize="inherit" />
                  Optional. For invoices and tax records. (
                  {form.billingAddress.length}/500)
                </Typography>

                <label
                  id="payment-method-label"
                  className={classes.paymentMethodLabel}
                >
                  Payment Method
                </label>
                <Box
                  className={classes.paymentMethodRow}
                  role="group"
                  aria-labelledby="payment-method-label"
                >
                  {PAYMENT_METHODS.map((pm) => (
                    <button
                      key={pm.value}
                      type="button"
                      className={`${classes.paymentMethodBtn} ${form.paymentMethod === pm.value ? classes.paymentMethodBtnActive : ""}`}
                      onClick={() => {
                        setForm((prev) => ({
                          ...prev,
                          paymentMethod: pm.value,
                        }));
                        if (errors.paymentMethod)
                          setErrors((prev) => ({ ...prev, paymentMethod: "" }));
                      }}
                      aria-pressed={form.paymentMethod === pm.value}
                      aria-label={pm.label}
                    >
                      {pm.logo ? (
                        <img
                          src={pm.logo}
                          alt=""
                          className={classes.paymentMethodLogo}
                        />
                      ) : pm.icon === "card" ? (
                        <CreditCard className={classes.paymentMethodIcon} />
                      ) : (
                        <Payment className={classes.paymentMethodIcon} />
                      )}
                      {pm.label}
                    </button>
                  ))}
                </Box>

                {form.paymentMethod === "card" && (
                  <Box className={classes.paymentDetailsBox}>
                    <Typography className={classes.paymentDetailsTitle}>
                      Card information
                    </Typography>
                    <Box
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                        marginBottom: 8,
                      }}
                    >
                      <img
                        src={visaLogo}
                        alt="Visa"
                        style={{ height: 20, objectFit: "contain" }}
                      />
                      <img
                        src={mastercardLogo}
                        alt="Mastercard"
                        style={{ height: 20, objectFit: "contain" }}
                      />
                    </Box>
                    <Box className={classes.fieldWrap}>
                      <Typography className={classes.fieldLabel}>
                        Card number
                      </Typography>
                      <TextField
                        className={classes.field}
                        fullWidth
                        variant="outlined"
                        size="small"
                        placeholder="1234 5678 9012 3456"
                        value={paymentDetails.cardNumber}
                        onChange={handlePaymentDetailsChange("cardNumber")}
                        error={!!errors.payment_cardNumber}
                        helperText={errors.payment_cardNumber}
                      />
                    </Box>
                    <Box style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                      <Box
                        className={classes.fieldWrap}
                        style={{ flex: "1 1 90px" }}
                      >
                        <Typography className={classes.fieldLabel}>
                          Expiry (MM/YY)
                        </Typography>
                        <TextField
                          className={classes.field}
                          fullWidth
                          variant="outlined"
                          size="small"
                          placeholder="MM/YY"
                          value={paymentDetails.cardExpiry}
                          onChange={handlePaymentDetailsChange("cardExpiry")}
                          error={!!errors.payment_cardExpiry}
                          helperText={errors.payment_cardExpiry}
                        />
                      </Box>
                      <Box
                        className={classes.fieldWrap}
                        style={{ flex: "1 1 80px" }}
                      >
                        <Typography className={classes.fieldLabel}>
                          CVV
                        </Typography>
                        <TextField
                          className={classes.field}
                          fullWidth
                          variant="outlined"
                          size="small"
                          placeholder="123"
                          value={paymentDetails.cardCvv}
                          onChange={handlePaymentDetailsChange("cardCvv")}
                          error={!!errors.payment_cardCvv}
                          helperText={errors.payment_cardCvv}
                        />
                      </Box>
                    </Box>
                    <Box className={classes.fieldWrap}>
                      <Typography className={classes.fieldLabel}>
                        Name on card
                      </Typography>
                      <TextField
                        className={classes.field}
                        fullWidth
                        variant="outlined"
                        size="small"
                        placeholder="As shown on card"
                        value={paymentDetails.nameOnCard}
                        onChange={handlePaymentDetailsChange("nameOnCard")}
                        error={!!errors.payment_nameOnCard}
                        helperText={errors.payment_nameOnCard}
                      />
                    </Box>
                  </Box>
                )}

                {form.paymentMethod === "gcash" && (
                  <Box className={classes.paymentDetailsBox}>
                    <Box className={classes.paymentMethodDetails}>
                      <img
                        src={
                          PAYMENT_METHODS.find((p) => p.value === "gcash").logo
                        }
                        alt=""
                        className={classes.paymentMethodDetailsLogo}
                      />
                      <Typography className={classes.paymentDetailsTitle}>
                        Pay with GCash
                      </Typography>
                    </Box>
                    <Typography
                      variant="body2"
                      color="textSecondary"
                      style={{ marginBottom: 12 }}
                    >
                      Enter the mobile number registered with your GCash
                      account. We'll send a payment link to complete the
                      transaction.
                    </Typography>
                    <Box className={classes.fieldWrap}>
                      <Typography className={classes.fieldLabel}>
                        GCash-registered mobile number
                      </Typography>
                      <TextField
                        className={classes.field}
                        fullWidth
                        variant="outlined"
                        size="small"
                        placeholder="09XX XXX XXXX"
                        value={paymentDetails.gcashNumber || ""}
                        onChange={handlePaymentDetailsChange("gcashNumber")}
                        error={!!errors.payment_gcashNumber}
                        helperText={errors.payment_gcashNumber}
                        inputProps={{ maxLength: 11, inputMode: "numeric" }}
                      />
                    </Box>
                  </Box>
                )}

                {form.paymentMethod === "paymaya" && (
                  <Box className={classes.paymentDetailsBox}>
                    <Box className={classes.paymentMethodDetails}>
                      <img
                        src={
                          PAYMENT_METHODS.find((p) => p.value === "paymaya")
                            .logo
                        }
                        alt=""
                        className={classes.paymentMethodDetailsLogo}
                      />
                      <Typography className={classes.paymentDetailsTitle}>
                        Pay with Maya
                      </Typography>
                    </Box>
                    <Typography
                      variant="body2"
                      color="textSecondary"
                      style={{ marginBottom: 12 }}
                    >
                      Enter the mobile number linked to your Maya account.
                      You'll receive instructions to complete the payment.
                    </Typography>
                    <Box className={classes.fieldWrap}>
                      <Typography className={classes.fieldLabel}>
                        Maya mobile number
                      </Typography>
                      <TextField
                        className={classes.field}
                        fullWidth
                        variant="outlined"
                        size="small"
                        placeholder="09XX XXX XXXX"
                        value={paymentDetails.mayaContact || ""}
                        onChange={handlePaymentDetailsChange("mayaContact")}
                        error={!!errors.payment_mayaContact}
                        helperText={errors.payment_mayaContact}
                        inputProps={{ maxLength: 11, inputMode: "numeric" }}
                      />
                    </Box>
                  </Box>
                )}

                {form.paymentMethod === "qrph" && (
                  <Box className={classes.paymentDetailsBox}>
                    <Box className={classes.paymentMethodDetails}>
                      <img
                        src={
                          PAYMENT_METHODS.find((p) => p.value === "qrph").logo
                        }
                        alt=""
                        className={classes.paymentMethodDetailsLogo}
                      />
                      <Typography className={classes.paymentDetailsTitle}>
                        Pay via InstaPay / QR PH
                      </Typography>
                    </Box>
                    <Typography
                      variant="body2"
                      color="textSecondary"
                      style={{ marginBottom: 12 }}
                    >
                      After you confirm, we'll show a QR code and bank details.
                      Scan with your bank app or e-wallet (GCash, Maya, or any
                      InstaPay/QR PH–enabled app) to complete payment.
                    </Typography>
                    <Box className={classes.fieldWrap}>
                      <Typography className={classes.fieldLabel}>
                        Mobile for payment instructions (optional)
                      </Typography>
                      <TextField
                        className={classes.field}
                        fullWidth
                        variant="outlined"
                        size="small"
                        placeholder="09XX XXX XXXX"
                        value={paymentDetails.qrphContact || ""}
                        onChange={handlePaymentDetailsChange("qrphContact")}
                        error={!!errors.payment_qrphContact}
                        helperText={errors.payment_qrphContact}
                        inputProps={{ maxLength: 11, inputMode: "numeric" }}
                      />
                    </Box>
                  </Box>
                )}

                <Box className={classes.paymentNote}>
                  <CheckCircleOutline className={classes.paymentNoteIcon} />
                  <span>
                    Payment instructions will be sent to your email after you
                    confirm. You can pay via e-wallet or card depending on your
                    selection.
                  </span>
                </Box>
              </Box>

              {/* Order Summary - Amount emphasized at top */}
              <Box className={classes.unifiedSummary}>
                <Box className={classes.amountHero}>
                  <Typography className={classes.amountHeroLabel}>
                    Amount due this month
                  </Typography>
                  <Typography className={classes.amountHeroValue}>
                    ₱{computedTotal.toLocaleString("en-PH")}
                  </Typography>
                  <Typography className={classes.amountHeroSub}>
                    ₱{plan.basePrice.toLocaleString("en-PH")} base + ₱{plan.perEmployee} × {displayEmployees} employees
                  </Typography>
                </Box>

                <Typography component="div" className={classes.sectionTitle}>
                  <Box
                    className={classes.sectionIcon}
                    style={{
                      backgroundColor: "rgba(100, 116, 139, 0.12)",
                      color: "#64748b",
                    }}
                  >
                    <ShoppingCart fontSize="small" />
                  </Box>
                  Order Summary
                </Typography>

                <Typography className={classes.planSwitcherLabel}>
                  Selected plan — change anytime below
                </Typography>
                <Box
                  ref={planDropdownRef}
                  className={classes.planSwitcherWrapper}
                >
                  <Box
                    className={`${classes.planSwitcherRoot} ${planDropdownOpen ? classes.planSwitcherRootOpen : ""}`}
                  >
                    <button
                      type="button"
                      id="change-plan"
                      className={classes.planSwitcherTrigger}
                      onClick={() => setPlanDropdownOpen((o) => !o)}
                      aria-expanded={planDropdownOpen}
                      aria-haspopup="listbox"
                      aria-label="Change plan"
                    >
                      <span>
                        {PLAN_OPTIONS.find((o) => o.key === planKey)?.label ??
                          "Starter — ₱2,999 + ₱79/employee/mo"}
                      </span>
                      <ArrowDropDown style={{ fontSize: 20, flexShrink: 0 }} />
                    </button>
                  </Box>
                  {planDropdownOpen && (
                    <Box
                      className={classes.planDropdown}
                      role="listbox"
                      aria-labelledby="change-plan"
                    >
                      <Box className={classes.planDropdownSearchWrap}>
                        <SearchIcon
                          className={classes.planDropdownSearchIcon}
                        />
                        <input
                          type="text"
                          className={classes.planDropdownSearch}
                          placeholder="Search plan"
                          value={planDropdownSearch}
                          onChange={(e) =>
                            setPlanDropdownSearch(e.target.value)
                          }
                          autoFocus
                        />
                      </Box>
                      <Box className={classes.planDropdownList}>
                        {PLAN_OPTIONS.filter(
                          (p) =>
                            !planDropdownSearch ||
                            p.label
                              .toLowerCase()
                              .includes(planDropdownSearch.toLowerCase()) ||
                            p.key
                              .toLowerCase()
                              .includes(planDropdownSearch.toLowerCase()),
                        ).map((p) => (
                          <button
                            key={p.key}
                            type="button"
                            role="option"
                            aria-selected={planKey === p.key}
                            className={classes.planDropdownItem}
                            onClick={() => {
                              navigate({
                                pathname: "/ProductFinder/Checkout",
                                search: `?plan=${p.key}`,
                              });
                              setPlanDropdownOpen(false);
                              setPlanDropdownSearch("");
                            }}
                          >
                            {p.label}
                          </button>
                        ))}
                      </Box>
                    </Box>
                  )}
                </Box>

                <Box className={classes.receiptBox}>
                  <Box className={classes.receiptHeader}>
                    <Typography className={classes.receiptTitle}>
                      UlapPayroll
                    </Typography>
                    <Typography className={classes.receiptSubtitle}>
                      Subscription summary
                    </Typography>
                  </Box>
                  <Box className={classes.receiptBody}>
                    <Box className={classes.receiptRow}>
                      <span className={classes.receiptRowLabel}>Plan</span>
                      <span className={classes.receiptRowValue}>
                        {plan.label}
                      </span>
                    </Box>
                    <Box className={classes.receiptRow}>
                      <span className={classes.receiptRowLabel}>
                        Base (monthly)
                      </span>
                      <span className={classes.receiptRowValue}>
                        ₱{plan.basePrice.toLocaleString("en-PH")}
                      </span>
                    </Box>
                    <Box className={classes.receiptRow}>
                      <span className={classes.receiptRowLabel}>
                        Per employee / mo
                      </span>
                      <span className={classes.receiptRowValue}>
                        ₱{plan.perEmployee}
                      </span>
                    </Box>
                    <Box className={classes.receiptRow}>
                      <span className={classes.receiptRowLabel}>
                        Number of employees
                      </span>
                      <Box className={classes.editablePriceRow}>
                        <TextField
                          type="number"
                          size="small"
                          variant="outlined"
                          className={classes.editablePriceInput}
                          value={employeeCount}
                          onChange={(e) => {
                            const raw = e.target.value === ""
                              ? ""
                              : Math.max(0, parseInt(e.target.value, 10) || 0);
                            if (raw === "") {
                              setEmployeeCount("");
                              return;
                            }
                            const max = plan.maxEmployees;
                            setEmployeeCount(max != null && raw > max ? max : raw);
                          }}
                          inputProps={{
                            min: 0,
                            max: plan.maxEmployees ?? undefined,
                            step: 1,
                          }}
                          helperText={
                            plan.maxEmployees != null
                              ? `Max ${plan.maxEmployees} employees for this plan`
                              : null
                          }
                        />
                      </Box>
                    </Box>
                    <Box className={classes.receiptDivider} />
                    <Box className={classes.receiptRow}>
                      <span className={classes.totalLabel}>
                        Total this month
                      </span>
                      <span className={classes.totalAmount}>
                        ₱{computedTotal.toLocaleString("en-PH")}
                      </span>
                    </Box>
                  </Box>
                </Box>

                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  className={classes.confirmBtn}
                  disabled={submitting}
                  startIcon={
                    submitting ? (
                      <CircularProgress size={20} color="inherit" />
                    ) : null
                  }
                >
                  {submitting ? "Processing…" : "Confirm Purchase"}
                </Button>

                <Box className={classes.secureBadge}>
                  <Lock fontSize="small" />
                  Secure checkout · Your data is protected
                </Box>
              </Box>
            </Box>
          </Paper>
        </form>

        {showQrStep && qrStepReceiptState && (
          <Box
            className={classes.qrOverlay}
            onClick={(e) =>
              e.target === e.currentTarget && setShowQrStep(false)
            }
          >
            <Box
              className={classes.qrModal}
              onClick={(e) => e.stopPropagation()}
            >
              <Typography className={classes.qrModalTitle}>
                Scan to pay with{" "}
                {form.paymentMethod === "gcash"
                  ? "GCash"
                  : form.paymentMethod === "qrph"
                    ? "QrPH"
                    : "Maya"}
              </Typography>
              <Typography className={classes.qrModalAmount}>
                ₱{computedTotal.toLocaleString("en-PH")} ({formatPrice(plan.basePrice)} + ₱{plan.perEmployee}/employee × {displayEmployees})
              </Typography>
              <Typography
                className={classes.qrHint}
                style={{ marginBottom: 16 }}
              >
                Open your app, scan to pay, then click below when done.
              </Typography>
              <img
                className={classes.qrImage}
                src={`${QR_CODE_BASE}?size=200x200&data=${encodeURIComponent(
                  typeof window !== "undefined"
                    ? `${window.location.origin}/payment-complete?ref=${qrStepReceiptState.receiptId}`
                    : `UlapPayroll-${plan.label}-${plan.basePrice}-${qrStepReceiptState.receiptId}`,
                )}`}
                alt="Payment QR Code"
              />
              <Button
                variant="contained"
                color="primary"
                fullWidth
                onClick={handleQrDone}
                className={classes.confirmBtn}
                style={{ marginTop: 8 }}
              >
                I've completed payment
              </Button>
            </Box>
          </Box>
        )}
      </Container>
    </Box>
  );
}
