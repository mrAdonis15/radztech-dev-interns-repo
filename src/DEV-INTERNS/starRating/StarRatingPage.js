import React, { useEffect, useState } from "react";
import {
  Box,
  Button,
  Container,
  FormControl,
  Grid,
  InputLabel,
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
import SettingsIcon from "@material-ui/icons/Settings";
import ReplayIcon from "@material-ui/icons/Replay";
import SearchIcon from "@material-ui/icons/Search";
import LoginToolbar from "../../Auth/Login/LoginToolbar";
import EvaluationDialog from "./components/EvaluationDialog";
import QuestionAdminDialog from "./components/QuestionAdminDialog";
import useCategoryRatings from "./hooks/useCategoryRatings";
import useEvaluationQuestions from "./hooks/useEvaluationQuestions";

const useStyles = makeStyles((theme) => ({
  page: {
    minHeight: "100vh",
    paddingTop: theme.spacing(14),
    paddingBottom: theme.spacing(8),
    background:
      "linear-gradient(180deg, #fcfcfd 0%, #f8fafc 55%, #f3f4f6 100%)",
  },
  hero: {
    padding: theme.spacing(0, 0, 3),
    backgroundColor: "transparent",
    color: "#1f2937",
    marginBottom: theme.spacing(2),
  },
  heroTitle: {
    fontWeight: 700,
    letterSpacing: "-0.03em",
    color: "#111827",
  },
  heroSubtitle: {
    color: "#6b7280",
    marginTop: theme.spacing(1),
  },
  topBar: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: theme.spacing(2),
    marginTop: theme.spacing(3),
    [theme.breakpoints.down("md")]: {
      flexDirection: "column",
      alignItems: "stretch",
    },
  },
  topBarLeft: {
    display: "flex",
    alignItems: "center",
    gap: theme.spacing(2),
    [theme.breakpoints.down("sm")]: {
      flexDirection: "column",
      alignItems: "stretch",
    },
  },
  switchTitle: {
    fontWeight: 600,
    color: "#374151",
  },
  selectLabel: {
    color: "#6b7280",
    "&.Mui-focused": {
      color: "#6b7280",
    },
  },
  selectControl: {
    minWidth: 260,
  },
  selectInput: {
    color: "#111827",
    fontWeight: 600,
    "& .MuiSelect-icon": {
      color: "#6b7280",
    },
    "&:before": {
      borderBottomColor: "rgba(107, 114, 128, 0.3)",
    },
    "&:after": {
      borderBottomColor: "#f97316",
    },
    "&:hover:not(.Mui-disabled):before": {
      borderBottomColor: "#9ca3af",
    },
  },
  summaryRow: {
    display: "flex",
    alignItems: "center",
    gap: theme.spacing(4),
    marginTop: theme.spacing(4),
    paddingTop: theme.spacing(2),
    borderTop: "1px solid rgba(229, 231, 235, 0.9)",
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
  },
  resetButton: {
    borderRadius: 999,
    padding: theme.spacing(1, 2.25),
    textTransform: "none",
    fontWeight: 600,
    boxShadow: "none",
  },
  manageButton: {
    borderColor: "#e5e7eb",
    color: "#374151",
    "&:hover": {
      borderColor: "#d1d5db",
      backgroundColor: "#f9fafb",
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
    borderRadius: 18,
    textAlign: "center",
    color: "#475569",
    backgroundColor: "rgba(255,255,255,0.8)",
    border: "1px dashed rgba(148, 163, 184, 0.35)",
  },
  tableShell: {
    borderRadius: 18,
    border: "1px solid rgba(229, 231, 235, 1)",
    boxShadow: "0 10px 30px rgba(15, 23, 42, 0.04)",
    overflow: "hidden",
    backgroundColor: "#ffffff",
  },
  tableTitleBar: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: theme.spacing(2.5, 3, 2),
    borderBottom: "1px solid rgba(243, 244, 246, 1)",
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
    color: "#6b7280",
    fontWeight: 700,
    fontSize: 12,
    textTransform: "uppercase",
    letterSpacing: "0.06em",
    borderBottom: "1px solid rgba(243, 244, 246, 1)",
  },
  tableRow: {
    transition: "background-color 0.16s ease",
    "&:hover": {
      backgroundColor: "#fafafa",
    },
  },
  nameCell: {
    fontWeight: 600,
    color: "#0f172a",
    minWidth: 220,
    borderBottom: "1px solid rgba(243, 244, 246, 1)",
  },
  metricCell: {
    color: "#334155",
    whiteSpace: "nowrap",
    borderBottom: "1px solid rgba(243, 244, 246, 1)",
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
    backgroundColor: "#f59e0b",
  },
  actionCell: {
    whiteSpace: "nowrap",
    borderBottom: "1px solid rgba(243, 244, 246, 1)",
  },
  evaluateButton: {
    borderRadius: 999,
    textTransform: "none",
    fontWeight: 600,
    backgroundColor: "#ea580c",
    color: "#ffffff",
    padding: theme.spacing(0.85, 2),
    "&:hover": {
      backgroundColor: "#f97316",
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
  searchField: {
    minWidth: 260,
    "& .MuiOutlinedInput-root": {
      backgroundColor: "#ffffff",
    },
    [theme.breakpoints.down("sm")]: {
      minWidth: 0,
      width: "100%",
    },
  },
  filterControl: {
    minWidth: 150,
    [theme.breakpoints.down("sm")]: {
      width: "100%",
    },
  },
}));

function StarRatingPage() {
  const classes = useStyles();
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [adminOpen, setAdminOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
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
    resetQuestions,
  } = useEvaluationQuestions();

  const handleOpenEvaluation = (category) => {
    setSelectedCategory(category);
  };

  const handleCloseEvaluation = () => {
    setSelectedCategory(null);
  };

  const handleSaveCategoryEvaluation = (categoryId, questionRatings) => {
    handleSaveEvaluation(categoryId, questionRatings);
    setSelectedCategory(null);
  };

  const handleOpenAdmin = () => {
    setAdminOpen(true);
  };

  const handleCloseAdmin = () => {
    setAdminOpen(false);
  };

  useEffect(() => {
    setSelectedCategory(null);
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

  return (
    <>
      <LoginToolbar />
      <Box className={classes.page}>
        <Container maxWidth="lg">
          <Paper elevation={0} className={classes.hero}>
            <Typography variant="h3" className={classes.heroTitle}>
              {displayMode.heading}
            </Typography>
            <Typography variant="body1" className={classes.heroSubtitle}>
              {activeGroup?.description}
            </Typography>

            <Box className={classes.topBar}>
              <Box className={classes.topBarLeft}>
                <Typography variant="body1" className={classes.switchTitle}>
                  {displayMode.subheading}
                </Typography>
                <FormControl className={classes.selectControl}>
                  <InputLabel className={classes.selectLabel} id="rating-group-select-label">
                    Rating setup
                  </InputLabel>
                  <Select
                    labelId="rating-group-select-label"
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

              <Box className={classes.actions}>
                <Button
                  variant="outlined"
                  startIcon={<SettingsIcon />}
                  onClick={handleOpenAdmin}
                  className={`${classes.resetButton} ${classes.manageButton}`}
                >
                  Manage
                </Button>
                <Button
                  variant="contained"
                  startIcon={<ReplayIcon />}
                  onClick={resetRatings}
                  className={`${classes.resetButton} ${classes.resetPrimaryButton}`}
                >
                  Reset
                </Button>
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
                  {summary.totalCategories} total {summary.itemLabelPlural.toLowerCase()}
                </Typography>
              </Box>
              <Box className={classes.tableTitleBar} style={{ paddingTop: 0 }}>
                <Box className={classes.tableTools}>
                  <TextField
                    variant="outlined"
                    size="small"
                    placeholder={`Search ${summary.itemLabelPlural.toLowerCase()}`}
                    value={searchTerm}
                    onChange={(event) => setSearchTerm(event.target.value)}
                    className={classes.searchField}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <SearchIcon fontSize="small" style={{ color: "#9ca3af" }} />
                        </InputAdornment>
                      ),
                    }}
                  />
                  <FormControl variant="outlined" size="small" className={classes.filterControl}>
                    <InputLabel id="status-filter-label">Status</InputLabel>
                    <Select
                      labelId="status-filter-label"
                      value={statusFilter}
                      onChange={(event) => setStatusFilter(event.target.value)}
                      label="Status"
                    >
                      <MenuItem value="all">All</MenuItem>
                      <MenuItem value="rated">Rated</MenuItem>
                      <MenuItem value="pending">Pending</MenuItem>
                    </Select>
                  </FormControl>
                </Box>
              </Box>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell className={classes.tableHeaderCell}>
                      {summary.itemLabelSingular}
                    </TableCell>
                    <TableCell className={classes.tableHeaderCell}>Status</TableCell>
                    <TableCell className={classes.tableHeaderCell}>Your Rating</TableCell>
                    <TableCell className={classes.tableHeaderCell}>Average Rating</TableCell>
                    <TableCell className={classes.tableHeaderCell}>Total Reviews</TableCell>
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
                            ? `${category.averageRating.toFixed(1)} / 5`
                            : "No ratings yet"}
                        </TableCell>
                        <TableCell className={classes.metricCell}>
                          {category.totalRatings}
                        </TableCell>
                        <TableCell align="right" className={classes.actionCell}>
                          <Button
                            variant="contained"
                            className={classes.evaluateButton}
                            onClick={() => handleOpenEvaluation(category)}
                          >
                            Evaluate
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                  {filteredCategories.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} align="center" className={classes.metricCell}>
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

          <QuestionAdminDialog
            open={adminOpen}
            questions={questions}
            activeGroup={activeGroup}
            onClose={handleCloseAdmin}
            onAddQuestion={addQuestion}
            onUpdateQuestion={updateQuestion}
            onRemoveQuestion={removeQuestion}
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
