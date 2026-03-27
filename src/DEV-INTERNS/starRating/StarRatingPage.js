import React, { useEffect, useState } from "react";
import {
  Box,
  Button,
  Container,
  Dialog,
  DialogContent,
  FormControl,
  Grid,
  IconButton,
  InputAdornment,
  MenuItem,
  Paper,
  Select,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  makeStyles,
  Typography,
} from "@material-ui/core";
import ArrowForwardIcon from "@material-ui/icons/ArrowForward";
import CloseIcon from "@material-ui/icons/Close";
import ReplayIcon from "@material-ui/icons/Replay";
import SearchIcon from "@material-ui/icons/Search";
import LoginToolbar from "../../Auth/Login/LoginToolbar";
import EvaluationDialog from "./components/EvaluationDialog";
import EvaluationResultDialog from "./components/EvaluationResultDialog";
import QuestionAdminDialog from "./components/QuestionAdminDialog";
import useCategoryRatings from "./hooks/useCategoryRatings";
import useEvaluationQuestions from "./hooks/useEvaluationQuestions";

const SHOW_JSON_BUTTON = false;

const useStyles = makeStyles((theme) => ({
  page: {
    minHeight: "100vh",
    paddingTop: theme.spacing(14),
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
    marginBottom: theme.spacing(3),
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
  fieldLabel: {
    fontSize: 11,
    color: "#6b7280",
    marginBottom: theme.spacing(0.5),
    minHeight: 16,
  },
  searchButtonWrap: {
    display: "flex",
    alignItems: "center",
    minHeight: 40,
    gap: theme.spacing(1.5),
  },
  searchButton: {
    minWidth: 48,
    width: 48,
    height: 40,
    borderRadius: 4,
    border: "1px solid #cfd6dd",
    color: "#6b7280",
    backgroundColor: "#ffffff",
    "&:hover": {
      backgroundColor: "#f8fafc",
      borderColor: "#b8c1cc",
    },
  },
  searchSpacer: {
    minHeight: 16,
    marginBottom: theme.spacing(0.5),
  },
  searchSelectedLabel: {
    color: "#1f3b64",
    fontSize: 16,
    fontWeight: 500,
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
    cursor: "pointer",
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
    gap: theme.spacing(2),
    padding: theme.spacing(1.5, 2),
    borderTop: "1px solid #e5e7eb",
    backgroundColor: "#ffffff",
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
    overflow: "hidden",
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
  },
  tableRow: {
    transition: "background-color 0.16s ease",
    "&:hover": {
      backgroundColor: "#f8fafc",
    },
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
    gap: theme.spacing(0.75),
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
    backgroundColor: "#f59e0b",
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
      borderRadius: 4,
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
  searchEmptyState: {
    padding: theme.spacing(4),
    textAlign: "center",
    color: "#6b7280",
  },
}));

function StarRatingPage() {
  const classes = useStyles();
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [jsonPreviewCategory, setJsonPreviewCategory] = useState(null);
  const [adminOpen, setAdminOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchDialogOpen, setSearchDialogOpen] = useState(false);
  const [searchDraft, setSearchDraft] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const {
    activeGroupId,
    activeGroup,
    categoryGroupList,
    categories,
    handleSaveEvaluation,
    resetRatings,
    handleSelectGroup,
    summary,
    displayMode,
    addGroup,
    updateGroup,
    removeGroup,
    addCategory,
    updateCategory,
    removeCategory,
    resetGroups,
  } = useCategoryRatings();
  const {
    questions,
    addQuestion,
    updateQuestion,
    removeQuestion,
    addSubQuestion,
    updateSubQuestion,
    removeSubQuestion,
    resetQuestions,
  } = useEvaluationQuestions();

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
    const savedEvaluation = handleSaveEvaluation(categoryId, evaluationResult);
    setSelectedCategory(null);
    return savedEvaluation;
  };

  const handleOpenAdmin = () => {
    setAdminOpen(true);
  };

  const handleCloseAdmin = () => {
    setAdminOpen(false);
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

  useEffect(() => {
    setSelectedCategory(null);
    setJsonPreviewCategory(null);
  }, [activeGroupId]);

  useEffect(() => {
    setSearchTerm("");
    setSearchDraft("");
    setSearchDialogOpen(false);
  }, [activeGroupId]);

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

  const searchResults = categories.filter((category) =>
    category.name.toLowerCase().includes(searchDraft.trim().toLowerCase())
  );

  return (
    <>
      <LoginToolbar />
      <Box className={classes.page}>
        <Container maxWidth="lg">
          <Paper elevation={0} className={classes.hero}>
            <Typography className={classes.sectionLabel}>Evaluation</Typography>
            <Typography variant="h3" className={classes.heroTitle}>
              {activeGroup?.label || displayMode.heading}
            </Typography>
            <Typography variant="body1" className={classes.heroSubtitle}>
              {activeGroup?.description}
            </Typography>

            <Paper elevation={0} className={classes.filterPanel}>
              <Box className={classes.filterBody}>
                <Box className={classes.filtersGrid}>
                  <Box className={classes.fieldBlock}>
                    <Box className={classes.searchSpacer} />
                    <Box className={classes.searchButtonWrap}>
                      <IconButton
                        className={classes.searchButton}
                        onClick={handleOpenSearchDialog}
                        aria-label={`Search ${summary.itemLabelPlural.toLowerCase()}`}
                      >
                        <SearchIcon fontSize="small" />
                      </IconButton>
                      <Typography
                        variant="body2"
                        className={classes.searchSelectedLabel}
                        onClick={handleOpenSearchDialog}
                      >
                        Search {summary.itemLabelPlural.toLowerCase()}
                      </Typography>
                    </Box>
                  </Box>
                  <Box className={classes.fieldBlock}>
                    <Typography className={classes.fieldLabel}>Rating Setup</Typography>
                    <FormControl variant="outlined" size="small" className={classes.selectControl}>
                      <Select
                        value={activeGroupId}
                        onChange={handleSelectGroup}
                        className={classes.selectInput}
                      >
                        {categoryGroupList.map((group) => (
                          <MenuItem key={group.id} value={group.id}>
                            {group.label || "Untitled setup"}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Box>
                  <Box className={classes.fieldBlock}>
                    <Typography className={classes.fieldLabel}>Status</Typography>
                    <FormControl variant="outlined" size="small" className={classes.filterControl}>
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
                <Button
                  variant="text"
                  onClick={handleOpenAdmin}
                  className={`${classes.resetButton} ${classes.manageButton}`}
                >
                  MANAGE SETUP
                </Button>
                <Button
                  variant="text"
                  startIcon={<ReplayIcon />}
                  onClick={resetRatings}
                  className={`${classes.resetButton} ${classes.manageButton}`}
                >
                  RESET RATINGS
                </Button>
              </Box>
            </Paper>
          </Paper>

          {categories.length > 0 ? (
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
              <Table>
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
                      <TableRow key={category.id} className={classes.tableRow} hover>
                        <TableCell className={classes.nameCell}>{category.name}</TableCell>
                        <TableCell className={classes.metricCell}>
                          <Box className={classes.statusWrap}>
                            <Box
                              className={`${classes.statusDot} ${
                                hasRating ? classes.statusReady : classes.statusPending
                              }`}
                            />
                            <Typography className={classes.statusText}>
                              {hasRating ? "Rated" : "Not rated"}
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell className={classes.metricCell}>
                          {hasRating ? `${category.currentUserRating.toFixed(1)} / 5` : "-"}
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
                                View JSON
                              </Button>
                            ) : null}
                            <Button
                              variant="contained"
                              className={classes.evaluateButton}
                              onClick={() => handleOpenEvaluation(category)}
                              disabled={hasRating}
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
          ) : (
            <Paper elevation={0} className={classes.emptyState}>
              <Typography variant="h6">No items in this setup yet</Typography>
              <Typography variant="body2">
                Open `Manage setup` and add the people, products, or other items you want
                to rate.
              </Typography>
            </Paper>
          )}

          <EvaluationDialog
            open={Boolean(selectedCategory)}
            category={selectedCategory}
            questions={questions}
            onClose={handleCloseEvaluation}
            onSave={handleSaveCategoryEvaluation}
          />

          <EvaluationResultDialog
            open={Boolean(jsonPreviewCategory)}
            category={jsonPreviewCategory}
            onClose={handleCloseJsonPreview}
          />

          <Dialog
            open={searchDialogOpen}
            onClose={handleCloseSearchDialog}
            fullWidth
            maxWidth="md"
            classes={{ paper: classes.searchDialogPaper }}
          >
            <DialogContent className={classes.searchDialogContent}>
              <Box className={classes.searchDialogHeader}>
                <TextField
                  autoFocus
                  variant="outlined"
                  label={summary.itemLabelPlural}
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
              </Box>

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

          <QuestionAdminDialog
            open={adminOpen}
            questions={questions}
            activeGroup={activeGroup}
            onClose={handleCloseAdmin}
            onAddQuestion={addQuestion}
            onUpdateQuestion={updateQuestion}
            onRemoveQuestion={removeQuestion}
            onAddSubQuestion={addSubQuestion}
            onUpdateSubQuestion={updateSubQuestion}
            onRemoveSubQuestion={removeSubQuestion}
            onResetQuestions={resetQuestions}
            onAddGroup={addGroup}
            onUpdateGroup={updateGroup}
            onRemoveGroup={removeGroup}
            onResetGroups={resetGroups}
            onAddCategory={addCategory}
            onUpdateCategory={updateCategory}
            onRemoveCategory={removeCategory}
          />
        </Container>
      </Box>
    </>
  );
}

export default StarRatingPage;
