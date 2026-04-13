import React, { useEffect, useMemo, useState } from "react";
import {
  Box,
  Button,
  Container,
  Dialog,
  DialogContent,
  FormControl,
  IconButton,
  InputAdornment,
  MenuItem,
  Paper,
  Select,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tabs,
  TextField,
  makeStyles,
  Typography,
} from "@material-ui/core";
import ArrowForwardIcon from "@material-ui/icons/ArrowForward";
import CloseIcon from "@material-ui/icons/Close";
import DescriptionOutlinedIcon from "@material-ui/icons/DescriptionOutlined";
import ReplayIcon from "@material-ui/icons/Replay";
import SearchIcon from "@material-ui/icons/Search";
import LoginToolbar from "../../../Auth/Login/LoginToolbar";
import { SUB_LIST_KEYS } from "../api/endpoints";
import { requestSubListItems } from "../api/subLists";
import { requestEvaluationTemplates } from "../api/templates";
import RatingDialog from "../components/RatingDialog";
import ResultDialog from "../components/ResultDialog";
import TemplateQuestions from "../components/TemplateQuestions";
import useRatings from "../tools/useRatings";

const SHOW_JSON_BUTTON = false;
const GROUPS_STORAGE_KEY = "dev-interns-star-rating-groups";
const ACTIVE_GROUP_STORAGE_KEY = "dev-interns-star-rating-active-group";
const SETUP_JSON_STORAGE_KEY = "dev-interns-star-rating-setup-json";
const SELECTED_EVALUATOR_STORAGE_KEY = "dev-interns-star-rating-selected-evaluator";
const SELECTED_TEMPLATE_STORAGE_KEY = "dev-interns-star-rating-selected-template";

const useStyles = makeStyles((theme) => ({
  page: {
    minHeight: "100vh",
    paddingTop: theme.spacing(10),
    paddingBottom: theme.spacing(8),
    fontFamily: '"Poppins", sans-serif',
    background:
      "linear-gradient(180deg, #f5f6f8 0%, #f1f3f5 100%)",
  },
  hero: {
    padding: 0,
    backgroundColor: "transparent",
    color: "#1f2937",
    marginBottom: theme.spacing(2),
  },
  sectionLabel: {
    fontSize: 14,
    color: "#6b7280",
    marginBottom: theme.spacing(1),
  },
  heroTitle: {
    fontWeight: 700,
    letterSpacing: "-0.03em",
    color: "#f97316",
  },
  heroSubtitle: {
    color: "#6b7280",
    marginTop: theme.spacing(1),
    marginBottom: theme.spacing(2),
  },
  tabsRoot: {
    minHeight: 0,
  },
  tabRoot: {
    minHeight: 0,
    padding: theme.spacing(1.25, 0),
    marginRight: theme.spacing(3),
    textTransform: "none",
    fontSize: 15,
    fontWeight: 700,
    color: "#64748b",
    fontFamily: '"Poppins", sans-serif',
    "&.Mui-selected": {
      color: "#ea580c",
    },
  },
  tabsIndicator: {
    backgroundColor: "#ea580c",
    height: 3,
  },
  filterPanel: {
    borderRadius: 4,
    border: "1px solid #d7dce1",
    boxShadow: "0 1px 2px rgba(15, 23, 42, 0.04)",
    overflow: "hidden",
    backgroundColor: "#ffffff",
    marginTop: theme.spacing(3),
  },
  filterBody: {
    padding: theme.spacing(2),
  },
  filtersGrid: {
    display: "flex",
    alignItems: "flex-end",
    flexWrap: "wrap",
    gap: theme.spacing(2),
    [theme.breakpoints.down("sm")]: {
      flexDirection: "column",
      alignItems: "stretch",
    },
  },
  fieldBlock: {
    minWidth: 0,
    flex: "1 1 320px",
  },
  searchFieldBlock: {
    minWidth: 0,
    flex: "1.6 1 360px",
  },
  fieldLabel: {
    fontSize: 11,
    color: "#6b7280",
    marginBottom: theme.spacing(0.5),
    minHeight: 16,
  },
  evaluatorFieldBlock: {
    minWidth: 0,
    flex: "1.6 1 360px",
  },
  evaluatorSelector: {
    display: "flex",
    alignItems: "center",
    minHeight: 48,
    borderRadius: 4,
    border: "1px solid #cfd6dd",
    backgroundColor: "#ffffff",
    overflow: "hidden",
    transition: "border-color 0.16s ease, box-shadow 0.16s ease",
    "&:hover": {
      borderColor: "#b8c1cc",
    },
  },
  evaluatorSelectorButton: {
    width: 48,
    height: 48,
    borderRadius: 0,
    color: "#757575",
    flexShrink: 0,
  },
  evaluatorSelectorValue: {
    flex: 1,
    minWidth: 0,
    padding: theme.spacing(0, 0.25),
    cursor: "pointer",
  },
  evaluatorSelectorText: {
    color: "#111827",
    fontSize: 14,
    fontWeight: 500,
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
  },
  evaluatorSelectorPlaceholder: {
    color: "#a3a3a3",
    fontSize: 14,
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
  },
  evaluatorSelectorClear: {
    width: 48,
    height: 48,
    borderRadius: 0,
    color: "#ef4444",
    flexShrink: 0,
  },
  selectControl: {
    width: "100%",
  },
  selectField: {
    width: "100%",
  },
  selectInput: {
    color: "#111827",
    fontWeight: 600,
    "& .MuiOutlinedInput-notchedOutline": {
      borderColor: "#cfd6dd",
    },
    "&:hover .MuiOutlinedInput-notchedOutline": {
      borderColor: "#b8c1cc",
    },
  },
  summaryRow: {
    display: "flex",
    alignItems: "center",
    gap: theme.spacing(4),
    marginTop: theme.spacing(2),
    paddingTop: theme.spacing(1),
    [theme.breakpoints.down("sm")]: {
      flexWrap: "wrap",
      gap: theme.spacing(2.5),
    },
  },
  metricBlock: {
    minWidth: 120,
  },
  summaryLabel: {
    color: "#6b7280",
    fontSize: 12,
    textTransform: "uppercase",
    letterSpacing: "0.08em",
    fontWeight: 700,
    marginBottom: theme.spacing(0.5),
  },
  summaryValue: {
    fontWeight: 700,
    color: "#111827",
  },
  progressText: {
    color: "#6b7280",
    fontWeight: 500,
    marginLeft: "auto",
    [theme.breakpoints.down("sm")]: {
      marginLeft: 0,
      width: "100%",
    },
  },
  actions: {
    display: "flex",
    alignItems: "center",
    gap: theme.spacing(2),
    padding: theme.spacing(1.5, 2),
    borderTop: "1px solid #e5e7eb",
    backgroundColor: "#ffffff",
    [theme.breakpoints.down("sm")]: {
      flexWrap: "wrap",
    },
  },
  tabsActionWrap: {
    minWidth: 0,
    flex: "1 1 auto",
  },
  resetActionWrap: {
    marginLeft: "auto",
    display: "flex",
    alignItems: "center",
    gap: theme.spacing(1.25),
  },
  newEvaluationButton: {
    borderRadius: 3,
    padding: theme.spacing(0.9, 1.8),
    textTransform: "none",
    fontWeight: 700,
    color: "#1f2937",
    borderColor: "#d1d5db",
    backgroundColor: "#ffffff",
    "&:hover": {
      borderColor: "#f97316",
      color: "#ea580c",
      backgroundColor: "#fff7ed",
    },
  },
  resetButton: {
    borderRadius: 3,
    padding: theme.spacing(0.9, 1.8),
    textTransform: "none",
    fontWeight: 700,
    boxShadow: "none",
  },
  manageButton: {
    borderColor: "#f97316",
    color: "#f97316",
    "&:hover": {
      borderColor: "#ea580c",
      backgroundColor: "#fff7ed",
    },
  },
  resetPrimaryButton: {
    backgroundColor: "#ea580c",
    color: "#ffffff",
    "&:hover": {
      backgroundColor: "#f97316",
      boxShadow: "none",
    },
  },
  emptyState: {
    padding: theme.spacing(4),
    borderRadius: 4,
    textAlign: "center",
    color: "#475569",
    backgroundColor: "#ffffff",
    border: "1px solid #d7dce1",
  },
  tableShell: {
    borderRadius: 4,
    border: "1px solid #d7dce1",
    boxShadow: "0 1px 2px rgba(15, 23, 42, 0.04)",
    overflowX: "auto",
    overflowY: "visible",
    backgroundColor: "#ffffff",
    marginTop: theme.spacing(2.5),
  },
  tableTitleBar: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: theme.spacing(1.5, 2),
    borderBottom: "1px solid #e5e7eb",
    backgroundColor: "#ffffff",
    [theme.breakpoints.down("xs")]: {
      flexDirection: "column",
      alignItems: "flex-start",
      gap: theme.spacing(1),
    },
  },
  tableTitle: {
    fontWeight: 700,
    color: "#0f172a",
  },
  tableSubtitle: {
    color: "#64748b",
  },
  tableHeaderCell: {
    backgroundColor: "#ffffff",
    color: "#111827",
    fontWeight: 700,
    fontSize: 12,
    borderBottom: "1px solid #dfe4ea",
    position: "sticky",
    top: 0,
    zIndex: 2,
  },
  tableRow: {
    transition: "background-color 0.16s ease, box-shadow 0.16s ease",
    "&:hover": {
      backgroundColor: "#fff7ed",
      boxShadow: "inset 3px 0 0 #f97316",
    },
  },
  tableRowRated: {
    backgroundColor: "#fffdf8",
  },
  nameCell: {
    fontWeight: 600,
    color: "#0f172a",
    minWidth: 220,
    borderBottom: "1px solid #edf1f5",
  },
  metricCell: {
    color: "#334155",
    borderBottom: "1px solid #edf1f5",
  },
  statusWrap: {
    display: "inline-flex",
    alignItems: "center",
    gap: theme.spacing(1),
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: "50%",
  },
  statusText: {
    fontSize: 14,
    fontWeight: 500,
    color: "#4b5563",
  },
  statusReady: {
    backgroundColor: "#22c55e",
  },
  statusPending: {
    backgroundColor: "#ef4444",
  },
  statusBadge: {
    display: "inline-flex",
    alignItems: "center",
    gap: theme.spacing(0.75),
    padding: theme.spacing(0.55, 1.1),
    borderRadius: 999,
    fontSize: 12,
    fontWeight: 700,
    letterSpacing: "0.01em",
    border: "1px solid transparent",
  },
  statusBadgeReady: {
    color: "#166534",
    backgroundColor: "#f0fdf4",
    borderColor: "#bbf7d0",
  },
  statusBadgePending: {
    color: "#b91c1c",
    backgroundColor: "#fef2f2",
    borderColor: "#fecaca",
  },
  ratingPreviewWrap: {
    display: "inline-flex",
    alignItems: "center",
    gap: theme.spacing(1),
    whiteSpace: "nowrap",
  },
  ratingStars: {
    color: "#f59e0b",
    letterSpacing: "0.08em",
    fontSize: 14,
    lineHeight: 1,
  },
  ratingValue: {
    color: "#475569",
    fontSize: 13,
    fontWeight: 600,
  },
  actionCell: {
    whiteSpace: "nowrap",
    borderBottom: "1px solid #edf1f5",
  },
  actionStack: {
    display: "inline-flex",
    alignItems: "center",
    gap: theme.spacing(1),
    flexWrap: "wrap",
    justifyContent: "flex-end",
  },
  evaluateButton: {
    borderRadius: 3,
    textTransform: "none",
    fontWeight: 700,
    backgroundColor: "#ea580c",
    color: "#ffffff",
    padding: theme.spacing(0.75, 1.8),
    "&:hover": {
      backgroundColor: "#f97316",
    },
  },
  jsonButton: {
    borderRadius: 3,
    textTransform: "none",
    fontWeight: 700,
    borderColor: "#cbd5e1",
    color: "#1e293b",
    padding: theme.spacing(0.75, 1.6),
    "&:hover": {
      borderColor: "#94a3b8",
      backgroundColor: "#f8fafc",
    },
  },
  tableTools: {
    display: "flex",
    alignItems: "center",
    gap: theme.spacing(1.5),
    [theme.breakpoints.down("sm")]: {
      width: "100%",
      flexDirection: "column",
      alignItems: "stretch",
    },
  },
  filterControl: {
    minWidth: 180,
    [theme.breakpoints.down("sm")]: {
      width: "100%",
    },
  },
  searchDialogPaper: {
    borderRadius: 0,
    maxWidth: 760,
    width: "100%",
    height: "min(720px, calc(100vh - 48px))",
  },
  searchDialogContent: {
    padding: 0,
    display: "flex",
    flexDirection: "column",
    height: "100%",
  },
  searchDialogHeader: {
    minHeight: 96,
    borderBottom: "1px solid #e5e7eb",
    padding: theme.spacing(1.5, 1.75),
    flexShrink: 0,
  },
  searchDialogInput: {
    width: "100%",
    "& .MuiOutlinedInput-root": {
      minHeight: 68,
      backgroundColor: "#ffffff",
      "& fieldset": {
        borderColor: "#c7cdd4",
      },
      "&:hover fieldset": {
        borderColor: "#b7bec7",
      },
      "&.Mui-focused fieldset": {
        borderColor: "#c7cdd4",
        borderWidth: 1,
      },
    },
    "& .MuiOutlinedInput-input": {
      fontSize: 18,
      padding: theme.spacing(2.25, 0, 2.25, 0.5),
      color: "#111827",
    },
    "& .MuiInputLabel-outlined": {
      color: "#757575",
      transform: "translate(14px, -6px) scale(0.75)",
      backgroundColor: "#ffffff",
      padding: "0 6px",
    },
    "& .MuiInputLabel-outlined.Mui-focused": {
      color: "#757575",
    },
  },
  searchDialogIcon: {
    color: "#757575",
    flexShrink: 0,
  },
  searchDialogAction: {
    color: "#ef4444",
  },
  searchDialogClose: {
    color: "#6b7280",
  },
  searchList: {
    overflowY: "auto",
    flex: 1,
  },
  searchListRow: {
    display: "grid",
    gridTemplateColumns: "88px minmax(0, 1fr) 48px",
    alignItems: "center",
    minHeight: 96,
    padding: theme.spacing(0, 2),
    borderBottom: "1px solid #eceff3",
    cursor: "pointer",
    transition: "background-color 0.16s ease",
    "&:hover": {
      backgroundColor: "#fafafa",
    },
  },
  searchListCode: {
    color: "#2f343b",
    fontSize: 14,
    letterSpacing: "0.02em",
  },
  searchListName: {
    color: "#202124",
    fontSize: 18,
    fontWeight: 500,
  },
  searchListArrow: {
    color: "#6b7280",
    justifySelf: "end",
  },
  evaluatorListRow: {
    display: "grid",
    gridTemplateColumns: "minmax(0, 1fr) 48px",
    alignItems: "center",
    minHeight: 72,
    padding: theme.spacing(0, 2),
    borderBottom: "1px solid #eceff3",
    cursor: "pointer",
    transition: "background-color 0.16s ease",
    "&:hover": {
      backgroundColor: "#fafafa",
    },
  },
  evaluatorListIdentity: {
    minWidth: 0,
  },
  evaluatorListName: {
    color: "#202124",
    fontSize: 16,
    fontWeight: 500,
  },
  searchEmptyState: {
    padding: theme.spacing(4),
    textAlign: "center",
    color: "#6b7280",
  },
  setupJsonCodeBlock: {
    margin: 0,
    padding: theme.spacing(2),
    borderRadius: 16,
    overflowX: "auto",
    backgroundColor: "#ffffff",
    color: "#111827",
    fontSize: 13,
    lineHeight: 1.6,
    border: "1px solid #d7dce1",
  },
  templateSelectionWrap: {
    maxWidth: 1140,
    margin: "0 auto",
    paddingTop: theme.spacing(2),
  },
  templateSelectionHeader: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: theme.spacing(2),
    marginBottom: theme.spacing(3),
    [theme.breakpoints.down("sm")]: {
      flexDirection: "column",
      alignItems: "stretch",
    },
  },
  templateSelectionTitle: {
    fontWeight: 500,
    color: "#4b5563",
    fontSize: 34,
    letterSpacing: "-0.02em",
  },
  templateCancelButton: {
    borderRadius: 999,
    padding: theme.spacing(1.1, 2.25),
    textTransform: "none",
    fontWeight: 700,
    backgroundColor: "#ff7a00",
    color: "#ffffff",
    alignSelf: "flex-start",
    "&:hover": {
      backgroundColor: "#f97316",
    },
  },
  templateSelectionPanel: {
    borderRadius: 0,
    border: "1px solid #dfe4ea",
    boxShadow: "none",
    overflow: "hidden",
    backgroundColor: "#ffffff",
  },
  templateSelectionRow: {
    display: "grid",
    gridTemplateColumns: "56px minmax(0, 1fr) auto",
    alignItems: "center",
    gap: theme.spacing(2),
    minHeight: 106,
    padding: theme.spacing(0, 4),
    borderBottom: "1px solid #e5e7eb",
    cursor: "pointer",
    transition: "background-color 0.16s ease",
    "&:hover": {
      backgroundColor: "#fffaf5",
    },
    [theme.breakpoints.down("sm")]: {
      gridTemplateColumns: "40px minmax(0, 1fr)",
      padding: theme.spacing(0, 2),
      gap: theme.spacing(1.5),
    },
  },
  templateSelectionRowLast: {
    borderBottom: "none",
  },
  templateSelectionIcon: {
    color: "#2f343b",
    fontSize: 30,
  },
  templateSelectionName: {
    color: "#111827",
    fontSize: 18,
    fontWeight: 500,
  },
  templateSelectAction: {
    display: "inline-flex",
    alignItems: "center",
    gap: theme.spacing(1),
    color: "#ff7a00",
    fontWeight: 700,
    fontSize: 16,
    textTransform: "uppercase",
    [theme.breakpoints.down("sm")]: {
      gridColumn: "2 / 3",
      justifySelf: "start",
      paddingBottom: theme.spacing(2),
    },
  },
}));

const getStoredSelectedEvaluator = () => {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    const storedValue = window.localStorage.getItem(SELECTED_EVALUATOR_STORAGE_KEY);
    if (!storedValue) {
      return null;
    }

    const parsedValue = JSON.parse(storedValue);
    return parsedValue && typeof parsedValue === "object" ? parsedValue : null;
  } catch (error) {
    return null;
  }
};

const serializeEvaluator = (evaluator) =>
  evaluator
    ? {
        id: evaluator.id,
        name: evaluator.name || "",
        code: evaluator.code || "",
        subtitle: evaluator.subtitle || "",
        location: evaluator.location || "",
      }
    : null;

const renderStarPreview = (value) => {
  const filledStars = Math.round(value);
  return `${"★".repeat(filledStars)}${"☆".repeat(Math.max(0, 5 - filledStars))}`;
};

function RatePage() {
  const classes = useStyles();
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [jsonPreviewCategory, setJsonPreviewCategory] = useState(null);
  const [setupJsonOutput, setSetupJsonOutput] = useState("");
  const [setupJsonOpen, setSetupJsonOpen] = useState(false);
  const [setupSaveVersion, setSetupSaveVersion] = useState(0);
  const [activeTab, setActiveTab] = useState("manage");
  const [searchTerm, setSearchTerm] = useState("");
  const [searchDialogOpen, setSearchDialogOpen] = useState(false);
  const [searchDraft, setSearchDraft] = useState("");
  const [selectedEvaluator, setSelectedEvaluator] = useState(getStoredSelectedEvaluator);
  const [evaluatorDialogOpen, setEvaluatorDialogOpen] = useState(false);
  const [evaluatorDraft, setEvaluatorDraft] = useState("");
  const [evaluators, setEvaluators] = useState([]);
  const [evaluatorsLoading, setEvaluatorsLoading] = useState(false);
  const [templates, setTemplates] = useState([]);
  const [templatesLoading, setTemplatesLoading] = useState(false);
  const [selectedTemplateId, setSelectedTemplateId] = useState("");
  const [showTemplateSelectionPage, setShowTemplateSelectionPage] = useState(false);
  const [statusFilter, setStatusFilter] = useState("all");
  const {
    activeGroupId,
    activeGroup,
    categoryGroupList,
    categories,
    handleSaveEvaluation,
    resetRatings,
    summary,
    displayMode,
  } = useRatings();
  const selectedTemplate = useMemo(
    () => templates.find((template) => template.id === selectedTemplateId) || null,
    [templates, selectedTemplateId]
  );
  const questions = selectedTemplate?.questions || [];

  useEffect(() => {
    if (typeof window === "undefined") {
      return undefined;
    }

    const authToken = window.localStorage.getItem("authToken");
    let isMounted = true;

    setEvaluatorsLoading(true);
    requestSubListItems(authToken, SUB_LIST_KEYS.evaluators)
      .then((items) => {
        if (!isMounted) {
          return;
        }

        setEvaluators(items);
        setSelectedEvaluator((currentEvaluator) => {
          if (!currentEvaluator?.id) {
            return currentEvaluator;
          }

          const matchedEvaluator = items.find((item) => item.id === currentEvaluator.id);
          return matchedEvaluator ? serializeEvaluator(matchedEvaluator) : currentEvaluator;
        });
      })
      .finally(() => {
        if (isMounted) {
          setEvaluatorsLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") {
      return undefined;
    }

    const authToken = window.localStorage.getItem("authToken");
    let isMounted = true;

    setTemplatesLoading(true);
    requestEvaluationTemplates(authToken)
      .then((items) => {
        if (!isMounted) {
          return;
        }

        setTemplates(items);
      })
      .finally(() => {
        if (isMounted) {
          setTemplatesLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    if (selectedTemplateId) {
      window.localStorage.setItem(SELECTED_TEMPLATE_STORAGE_KEY, selectedTemplateId);
      return;
    }

    window.localStorage.removeItem(SELECTED_TEMPLATE_STORAGE_KEY);
  }, [selectedTemplateId]);

  const handleSaveSetupJson = () => {
    const groupPayload = categoryGroupList.reduce((accumulator, group) => {
      accumulator[group.id] = group;
      return accumulator;
    }, {});

    const payload = {
      setup: {
        id: activeGroup?.id || activeGroupId,
        label: activeGroup?.label || "",
        description: activeGroup?.description || "",
        itemLabelSingular: activeGroup?.itemLabelSingular || "Item",
        itemLabelPlural: activeGroup?.itemLabelPlural || "Items",
        categories: categories.map((category) => ({
          id: category.id,
          name: category.name,
          averageRating: category.averageRating,
          totalRatings: category.totalRatings,
          currentUserRating: category.currentUserRating,
          evaluationResult: category.evaluationResult,
        })),
      },
      template: selectedTemplate
        ? {
            id: selectedTemplate.id,
            name: selectedTemplate.name,
          }
        : null,
      questions,
    };
    const formattedJson = JSON.stringify(payload, null, 2);

    if (typeof window !== "undefined") {
      window.localStorage.setItem(GROUPS_STORAGE_KEY, JSON.stringify(groupPayload));
      window.localStorage.setItem(ACTIVE_GROUP_STORAGE_KEY, activeGroupId);
      window.localStorage.setItem(SETUP_JSON_STORAGE_KEY, formattedJson);
    }

    setSetupJsonOutput(formattedJson);
    setSetupJsonOpen(true);
    setSetupSaveVersion((currentValue) => currentValue + 1);
  };

  const handleOpenTemplateSelectionPage = () => {
    setSelectedTemplateId("");
    setShowTemplateSelectionPage(true);
    setSelectedCategory(null);
    setJsonPreviewCategory(null);
  };

  const handleCloseTemplateSelectionPage = () => {
    setShowTemplateSelectionPage(false);
  };

  const handleSelectTemplateFromPage = (templateId) => {
    setSelectedTemplateId(templateId);
    setSelectedCategory(null);
    setJsonPreviewCategory(null);
    setShowTemplateSelectionPage(false);
    setActiveTab("manage");
  };

  const handleOpenEvaluation = (category) => {
    setSelectedCategory(category);
  };

  const handleCloseEvaluation = () => {
    setSelectedCategory(null);
  };

  const handleOpenJsonPreview = (category) => {
    setJsonPreviewCategory(category);
  };

  const handleCloseJsonPreview = () => {
    setJsonPreviewCategory(null);
  };

  const handleSaveCategoryEvaluation = (categoryId, evaluationResult) => {
    const savedEvaluation = handleSaveEvaluation(categoryId, {
      ...evaluationResult,
      templateId: selectedTemplate?.id || "",
      templateName: selectedTemplate?.name || "",
      evaluator: serializeEvaluator(selectedEvaluator),
    });
    setSelectedCategory(null);
    return savedEvaluation;
  };

  const handleCloseSetupJson = () => {
    setSetupJsonOpen(false);
  };

  const persistSelectedEvaluator = (evaluator) => {
    if (typeof window === "undefined") {
      return;
    }

    if (evaluator) {
      window.localStorage.setItem(
        SELECTED_EVALUATOR_STORAGE_KEY,
        JSON.stringify(serializeEvaluator(evaluator))
      );
      return;
    }

    window.localStorage.removeItem(SELECTED_EVALUATOR_STORAGE_KEY);
  };

  const handleOpenEvaluatorDialog = () => {
    setEvaluatorDraft(selectedEvaluator?.name || "");
    setEvaluatorDialogOpen(true);
  };

  const handleCloseEvaluatorDialog = () => {
    setEvaluatorDialogOpen(false);
  };

  const handleSelectEvaluator = (evaluator) => {
    setSelectedEvaluator(serializeEvaluator(evaluator));
    persistSelectedEvaluator(evaluator);
    setEvaluatorDraft(evaluator?.name || "");
    setEvaluatorDialogOpen(false);
  };

  const handleClearEvaluator = () => {
    setSelectedEvaluator(null);
    persistSelectedEvaluator(null);
    setEvaluatorDraft("");
    setEvaluatorDialogOpen(false);
  };

  const handleOpenSearchDialog = () => {
    setSearchDraft(searchTerm);
    setSearchDialogOpen(true);
  };

  const handleCloseSearchDialog = () => {
    setSearchDialogOpen(false);
  };

  const handleSelectSearchCategory = (categoryName) => {
    setSearchTerm(categoryName);
    setSearchDraft(categoryName);
    setSearchDialogOpen(false);
  };

  const handleClearSearch = () => {
    setSearchTerm("");
    setSearchDraft("");
    setSearchDialogOpen(false);
  };

  const handleClearSearchSelection = () => {
    setSearchTerm("");
    setSearchDraft("");
  };

  const filteredCategories = categories.filter((category) => {
    const matchesSearch = category.name
      .toLowerCase()
      .includes(searchTerm.trim().toLowerCase());
    const hasRating = category.currentUserRating > 0;
    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "rated" && hasRating) ||
      (statusFilter === "pending" && !hasRating);

    return matchesSearch && matchesStatus;
  });
  const canStartEvaluation = Boolean(selectedTemplate);
  const templateSelectionItems = [
    ...templates
      .filter((template) => template.active)
      .map((template) => ({
        id: template.id,
        name: template.name,
      })),
    {
      id: "",
      name: "I don't want to use template",
    },
  ];

  const searchResults = categories.filter((category) =>
    category.name.toLowerCase().includes(searchDraft.trim().toLowerCase())
  );
  const evaluatorResults = evaluators.filter((evaluator) => {
    const searchValue = evaluatorDraft.trim().toLowerCase();

    if (!searchValue) {
      return true;
    }

    return [evaluator.name, evaluator.code, evaluator.subtitle, evaluator.location]
      .filter(Boolean)
      .some((value) => value.toLowerCase().includes(searchValue));
  });
  const evaluationDialogKey = `${activeGroupId}-${selectedCategory?.id || "none"}-${setupSaveVersion}-${JSON.stringify(questions)}`;

  return (
    <>
      <LoginToolbar />
      <Box className={classes.page}>
        <Container maxWidth="lg">
          {showTemplateSelectionPage ? (
            <Box className={classes.templateSelectionWrap}>
              <Box className={classes.templateSelectionHeader}>
                <Typography className={classes.templateSelectionTitle}>
                  Performance Evaluation
                </Typography>
                <Button
                  variant="contained"
                  endIcon={<CloseIcon />}
                  onClick={handleCloseTemplateSelectionPage}
                  className={classes.templateCancelButton}
                >
                  CANCEL
                </Button>
              </Box>

              <Paper elevation={0} className={classes.templateSelectionPanel}>
                {templatesLoading ? (
                  <Box className={`${classes.templateSelectionRow} ${classes.templateSelectionRowLast}`}>
                    <DescriptionOutlinedIcon className={classes.templateSelectionIcon} />
                    <Typography className={classes.templateSelectionName}>
                      Loading templates...
                    </Typography>
                    <Box />
                  </Box>
                ) : (
                  templateSelectionItems.map((template, index) => (
                    <Box
                      key={template.id || "no-template"}
                      className={`${classes.templateSelectionRow} ${
                        index === templateSelectionItems.length - 1
                          ? classes.templateSelectionRowLast
                          : ""
                      }`}
                      onClick={() => handleSelectTemplateFromPage(template.id)}
                    >
                      <DescriptionOutlinedIcon className={classes.templateSelectionIcon} />
                      <Typography className={classes.templateSelectionName}>
                        {template.name}
                      </Typography>
                      <Box className={classes.templateSelectAction}>
                        <span>SELECT</span>
                        <ArrowForwardIcon />
                      </Box>
                    </Box>
                  ))
                )}
              </Paper>
            </Box>
          ) : (
          <Paper elevation={0} className={classes.hero}>
            <Typography className={classes.sectionLabel}>Evaluation</Typography>
            <Typography variant="h3" className={classes.heroTitle}>
              {activeGroup?.label || displayMode.heading}
            </Typography>
            {activeGroup?.description ? (
              <Typography variant="body1" className={classes.heroSubtitle}>
                {activeGroup.description}
              </Typography>
            ) : null}

            <Paper elevation={0} className={classes.filterPanel}>
              <Box className={classes.filterBody}>
                <Box className={classes.filtersGrid}>
                  <Box className={classes.searchFieldBlock}>
                    <Typography className={classes.fieldLabel}>Interns</Typography>
                    <Box className={classes.evaluatorSelector}>
                      <IconButton
                        className={classes.evaluatorSelectorButton}
                        onClick={handleOpenSearchDialog}
                        aria-label={`Search ${summary.itemLabelPlural.toLowerCase()}`}
                      >
                        <SearchIcon />
                      </IconButton>
                      <Box
                        className={classes.evaluatorSelectorValue}
                        onClick={handleOpenSearchDialog}
                      >
                        <Typography
                          className={
                            searchTerm
                              ? classes.evaluatorSelectorText
                              : classes.evaluatorSelectorPlaceholder
                          }
                        >
                          {searchTerm || `Please select ${summary.itemLabelSingular.toLowerCase()}...`}
                        </Typography>
                      </Box>
                      <IconButton
                        className={classes.evaluatorSelectorClear}
                        onClick={handleClearSearchSelection}
                        aria-label="Clear selected intern search"
                      >
                        <CloseIcon />
                      </IconButton>
                    </Box>
                  </Box>
                  <Box className={classes.evaluatorFieldBlock}>
                    <Typography className={classes.fieldLabel}>Evaluator</Typography>
                    <Box className={classes.evaluatorSelector}>
                      <IconButton
                        className={classes.evaluatorSelectorButton}
                        onClick={handleOpenEvaluatorDialog}
                        aria-label="Search evaluators"
                      >
                        <SearchIcon />
                      </IconButton>
                      <Box
                        className={classes.evaluatorSelectorValue}
                        onClick={handleOpenEvaluatorDialog}
                      >
                        <Typography
                          className={
                            selectedEvaluator
                              ? classes.evaluatorSelectorText
                              : classes.evaluatorSelectorPlaceholder
                          }
                        >
                          {selectedEvaluator?.name || "Please select an Evaluator"}
                        </Typography>
                      </Box>
                      <IconButton
                        className={classes.evaluatorSelectorClear}
                        onClick={handleClearEvaluator}
                        aria-label="Clear evaluator"
                      >
                        <CloseIcon />
                      </IconButton>
                    </Box>
                  </Box>
                  <Box className={classes.fieldBlock}>
                    <Typography className={classes.fieldLabel}>Status</Typography>
                    <FormControl
                      variant="outlined"
                      size="small"
                      className={classes.filterControl}
                    >
                      <Select
                        value={statusFilter}
                        onChange={(event) => setStatusFilter(event.target.value)}
                        className={classes.selectField}
                      >
                        <MenuItem value="all">All Status</MenuItem>
                        <MenuItem value="rated">Rated</MenuItem>
                        <MenuItem value="pending">Not rated</MenuItem>
                      </Select>
                    </FormControl>
                  </Box>
                </Box>

                <Box className={classes.summaryRow}>
                  <Box className={classes.metricBlock}>
                    <Typography className={classes.summaryLabel}>
                      {summary.itemLabelPlural}
                    </Typography>
                    <Typography variant="h5" className={classes.summaryValue}>
                      {summary.totalCategories}
                    </Typography>
                  </Box>
                  <Box className={classes.metricBlock}>
                    <Typography className={classes.summaryLabel}>Rated</Typography>
                    <Typography variant="h5" className={classes.summaryValue}>
                      {summary.ratedCategories}
                    </Typography>
                  </Box>
                  <Box className={classes.metricBlock}>
                    <Typography className={classes.summaryLabel}>Average</Typography>
                    <Typography variant="h5" className={classes.summaryValue}>
                      {summary.averageUserRating.toFixed(1)}
                    </Typography>
                  </Box>
                  <Typography variant="body2" className={classes.progressText}>
                    {summary.ratedCategories} of {summary.totalCategories}{" "}
                    {summary.itemLabelPlural.toLowerCase()} rated
                  </Typography>
                </Box>
              </Box>

              <Box className={classes.actions}>
                <Box className={classes.tabsActionWrap}>
                  <Tabs
                    value={activeTab}
                    onChange={(_, nextValue) => setActiveTab(nextValue)}
                    className={classes.tabsRoot}
                    classes={{ indicator: classes.tabsIndicator }}
                  >
                    <Tab
                      value="manage"
                      label="Questions"
                      disableRipple
                      className={classes.tabRoot}
                    />
                    <Tab
                      value="evaluation"
                      label="Evaluation"
                      disableRipple
                      className={classes.tabRoot}
                    />
                  </Tabs>
                </Box>
                <Box className={classes.resetActionWrap}>
                  <Button
                    variant="outlined"
                    onClick={handleOpenTemplateSelectionPage}
                    className={classes.newEvaluationButton}
                  >
                    NEW PERFORMANCE EVALUATION
                  </Button>
                  <Button
                    variant="text"
                    startIcon={<ReplayIcon />}
                    onClick={activeTab === "manage" ? handleSaveSetupJson : resetRatings}
                    className={`${classes.resetButton} ${classes.manageButton}`}
                  >
                    {activeTab === "manage" ? "SAVE" : "RESET RATINGS"}
                  </Button>
                </Box>
              </Box>
            </Paper>
          </Paper>
          )}

          {!showTemplateSelectionPage && activeTab === "manage" && canStartEvaluation ? (
            <TemplateQuestions
              questions={questions}
              selectedTemplateName={selectedTemplate?.name || ""}
            />
          ) : !showTemplateSelectionPage && !canStartEvaluation ? null : !showTemplateSelectionPage &&
            canStartEvaluation && categories.length > 0 ? (
            <TableContainer component={Paper} elevation={0} className={classes.tableShell}>
              <Box className={classes.tableTitleBar}>
                <Box>
                  <Typography variant="h6" className={classes.tableTitle}>
                    {activeGroup?.label || "Ratings List"}
                  </Typography>
                  <Typography variant="body2" className={classes.tableSubtitle}>
                    Review and evaluate each {summary.itemLabelSingular.toLowerCase()} from the
                    current setup.
                  </Typography>
                </Box>
                <Typography variant="body2" className={classes.tableSubtitle}>
                  {filteredCategories.length} shown
                </Typography>
              </Box>
              <Table stickyHeader>
                <TableHead>
                  <TableRow>
                    <TableCell className={classes.tableHeaderCell}>
                      {summary.itemLabelSingular}
                    </TableCell>
                    <TableCell className={classes.tableHeaderCell}>Status</TableCell>
                    <TableCell className={classes.tableHeaderCell}>Your Rating</TableCell>
                    <TableCell className={classes.tableHeaderCell}>Notes</TableCell>
                    <TableCell align="right" className={classes.tableHeaderCell}>
                      Action
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredCategories.map((category) => {
                    const hasRating = category.currentUserRating > 0;

                    return (
                      <TableRow
                        key={category.id}
                        className={`${classes.tableRow} ${
                          hasRating ? classes.tableRowRated : ""
                        }`}
                        hover
                      >
                        <TableCell className={classes.nameCell}>{category.name}</TableCell>
                        <TableCell className={classes.metricCell}>
                          <Box
                            className={`${classes.statusBadge} ${
                              hasRating
                                ? classes.statusBadgeReady
                                : classes.statusBadgePending
                            }`}
                          >
                            <Box
                              className={`${classes.statusDot} ${
                                hasRating ? classes.statusReady : classes.statusPending
                              }`}
                            />
                            <Typography className={classes.statusText} component="span">
                              {hasRating ? "Completed" : "Not Rated"}
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell className={classes.metricCell}>
                          {hasRating ? (
                            <Box className={classes.ratingPreviewWrap}>
                              <Typography className={classes.ratingStars} component="span">
                                {renderStarPreview(category.currentUserRating)}
                              </Typography>
                              <Typography className={classes.ratingValue} component="span">
                                {category.currentUserRating.toFixed(1)} / 5
                              </Typography>
                            </Box>
                          ) : (
                            "-"
                          )}
                        </TableCell>
                        <TableCell className={classes.metricCell}>
                          {category.totalRatings > 0
                            ? `Average ${category.averageRating.toFixed(1)} from ${category.totalRatings} review${
                                category.totalRatings > 1 ? "s" : ""
                              }`
                            : "No ratings submitted yet"}
                        </TableCell>
                        <TableCell align="right" className={classes.actionCell}>
                          <Box className={classes.actionStack}>
                            {SHOW_JSON_BUTTON ? (
                              <Button
                                variant="outlined"
                                className={classes.jsonButton}
                                onClick={() => handleOpenJsonPreview(category)}
                                disabled={!category.evaluationResult}
                              >
                                View
                              </Button>
                            ) : null}
                            <Button
                              variant="contained"
                              className={classes.evaluateButton}
                              onClick={() => handleOpenEvaluation(category)}
                              disabled={hasRating || !canStartEvaluation}
                            >
                              {hasRating ? "Evaluated" : "Evaluate"}
                            </Button>
                          </Box>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                  {filteredCategories.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} align="center" className={classes.metricCell}>
                        No matching results found.
                      </TableCell>
                    </TableRow>
                  ) : null}
                </TableBody>
              </Table>
            </TableContainer>
          ) : !showTemplateSelectionPage && canStartEvaluation ? (
            <Paper elevation={0} className={classes.emptyState}>
              <Typography variant="h6">No items in this setup yet</Typography>
              <Typography variant="body2">
                Open `Manage setup` and add the people, products, or other items you want
                to rate.
              </Typography>
            </Paper>
          ) : null}

          <RatingDialog
            key={evaluationDialogKey}
            open={Boolean(selectedCategory)}
            category={selectedCategory}
            questions={questions}
            templateName={selectedTemplate?.name || ""}
            onClose={handleCloseEvaluation}
            onSave={handleSaveCategoryEvaluation}
          />

          <ResultDialog
            open={Boolean(jsonPreviewCategory)}
            category={jsonPreviewCategory}
            onClose={handleCloseJsonPreview}
          />

          <Dialog
            open={evaluatorDialogOpen}
            onClose={handleCloseEvaluatorDialog}
            fullWidth
            maxWidth="md"
            classes={{ paper: classes.searchDialogPaper }}
          >
            <DialogContent className={classes.searchDialogContent}>
                <TextField
                  autoFocus
                  variant="outlined"
                  placeholder="Search Evaluator"
                  value={evaluatorDraft}
                  onChange={(event) => setEvaluatorDraft(event.target.value)}
                  className={classes.searchDialogInput}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon className={classes.searchDialogIcon} />
                      </InputAdornment>
                    ),
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          className={classes.searchDialogClose}
                          aria-label="Close evaluator picker"
                          onClick={handleCloseEvaluatorDialog}
                          edge="end"
                        >
                          <CloseIcon />
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />

              <Box className={classes.searchList}>
                {evaluatorsLoading ? (
                  <Typography variant="body2" className={classes.searchEmptyState}>
                    Loading evaluators...
                  </Typography>
                ) : evaluatorResults.length > 0 ? (
                  evaluatorResults.map((evaluator) => (
                    <Box
                      key={evaluator.id}
                      className={classes.evaluatorListRow}
                      onClick={() => handleSelectEvaluator(evaluator)}
                    >
                      <Box className={classes.evaluatorListIdentity}>
                        <Typography className={classes.evaluatorListName}>
                          {evaluator.name}
                        </Typography>
                      </Box>
                      <ArrowForwardIcon className={classes.searchListArrow} />
                    </Box>
                  ))
                ) : (
                  <Typography variant="body2" className={classes.searchEmptyState}>
                    No matching evaluators found.
                  </Typography>
                )}
              </Box>
            </DialogContent>
          </Dialog>

          <Dialog
            open={searchDialogOpen}
            onClose={handleCloseSearchDialog}
            fullWidth
            maxWidth="md"
            classes={{ paper: classes.searchDialogPaper }}
          >
            <DialogContent className={classes.searchDialogContent}>
                <TextField
                  autoFocus
                  variant="outlined"
                  placeholder={`Search ${summary.itemLabelPlural}`}
                  value={searchDraft}
                  onChange={(event) => setSearchDraft(event.target.value)}
                  className={classes.searchDialogInput}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon className={classes.searchDialogIcon} />
                      </InputAdornment>
                    ),
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          className={classes.searchDialogAction}
                          aria-label="Clear selected search"
                          onClick={handleClearSearch}
                          edge="end"
                        >
                          <CloseIcon />
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />

              <Box className={classes.searchList}>
                {searchResults.length > 0 ? (
                  searchResults.map((category, index) => (
                    <Box
                      key={category.id}
                      className={classes.searchListRow}
                      onClick={() => handleSelectSearchCategory(category.name)}
                    >
                      <Typography className={classes.searchListCode}>
                        {String(index + 1).padStart(3, "0")}
                      </Typography>
                      <Typography className={classes.searchListName}>{category.name}</Typography>
                      <ArrowForwardIcon className={classes.searchListArrow} />
                    </Box>
                  ))
                ) : (
                  <Typography variant="body2" className={classes.searchEmptyState}>
                    No matching {summary.itemLabelPlural.toLowerCase()} found.
                  </Typography>
                )}
              </Box>
            </DialogContent>
          </Dialog>

          <Dialog
            open={setupJsonOpen}
            onClose={handleCloseSetupJson}
            fullWidth
            maxWidth="md"
          >
            <DialogContent>
              <pre className={classes.setupJsonCodeBlock}>{setupJsonOutput}</pre>
            </DialogContent>
            <Box display="flex" justifyContent="flex-end" padding="0 24px 24px">
              <Button onClick={handleCloseSetupJson} color="primary">
                Close
              </Button>
            </Box>
          </Dialog>
        </Container>
      </Box>
    </>
  );
}

export default RatePage;

