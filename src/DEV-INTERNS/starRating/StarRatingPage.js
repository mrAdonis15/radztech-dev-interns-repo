import React, { useEffect, useState } from "react";
import {
  Box,
  Button,
  Container,
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  makeStyles,
  Typography,
} from "@material-ui/core";
import SettingsIcon from "@material-ui/icons/Settings";
import ReplayIcon from "@material-ui/icons/Replay";
import CategoryRatingCard from "./components/CategoryRatingCard";
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
      "radial-gradient(circle at top left, rgba(255, 117, 4, 0.18), transparent 32%), linear-gradient(180deg, #fffaf5 0%, #f8fafc 55%, #eef2ff 100%)",
  },
  hero: {
    padding: theme.spacing(4),
    borderRadius: 24,
    background: "linear-gradient(135deg, #0f172a 0%, #1e293b 52%, #334155 100%)",
    color: "#ffffff",
    boxShadow: "0 24px 60px rgba(15, 23, 42, 0.24)",
    marginBottom: theme.spacing(4),
  },
  overline: {
    color: "rgba(255,255,255,0.72)",
    letterSpacing: "0.16em",
    fontWeight: 600,
    marginBottom: theme.spacing(1),
  },
  heroTitle: {
    fontWeight: 700,
    marginBottom: theme.spacing(1.5),
  },
  heroSubtitle: {
    maxWidth: 680,
    color: "rgba(255,255,255,0.82)",
  },
  switchRow: {
    marginTop: theme.spacing(3),
    marginBottom: theme.spacing(1),
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: theme.spacing(2),
    [theme.breakpoints.down("sm")]: {
      flexDirection: "column",
      alignItems: "flex-start",
    },
  },
  switchShell: {
    minWidth: 240,
    borderRadius: 16,
    padding: theme.spacing(0.25, 1.25, 0.5),
    backgroundColor: "rgba(255,255,255,0.08)",
    border: "1px solid rgba(255,255,255,0.12)",
  },
  selectLabel: {
    color: "#ffffff",
    "&.Mui-focused": {
      color: "#ffffff",
    },
  },
  selectControl: {
    minWidth: 220,
  },
  selectInput: {
    color: "#ffffff",
    fontWeight: 600,
    "& .MuiSelect-icon": {
      color: "#ffffff",
    },
    "&:before": {
      borderBottomColor: "rgba(255,255,255,0.35)",
    },
    "&:after": {
      borderBottomColor: "#ff7504",
    },
    "&:hover:not(.Mui-disabled):before": {
      borderBottomColor: "#ffffff",
    },
  },
  summaryCard: {
    height: "100%",
    borderRadius: 18,
    padding: theme.spacing(2.5),
    backgroundColor: "rgba(255,255,255,0.08)",
    border: "1px solid rgba(255,255,255,0.12)",
    backdropFilter: "blur(8px)",
  },
  summaryLabel: {
    color: "rgba(255,255,255,0.72)",
    fontSize: 12,
    textTransform: "uppercase",
    letterSpacing: "0.08em",
    marginBottom: theme.spacing(0.75),
  },
  summaryValue: {
    fontWeight: 700,
  },
  actions: {
    marginTop: theme.spacing(3),
  },
  resetButton: {
    borderRadius: 999,
    padding: theme.spacing(1, 2.5),
    textTransform: "none",
    fontWeight: 600,
  },
}));

function StarRatingPage() {
  const classes = useStyles();
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [adminOpen, setAdminOpen] = useState(false);
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

  return (
    <Box className={classes.page}>
      <Container maxWidth="lg">
        <Paper elevation={0} className={classes.hero}>
          <Typography variant="h2" className={classes.heroTitle}>
            {displayMode.heading}
          </Typography>
          <Typography variant="body1" className={classes.heroSubtitle}>
            {activeGroup.description}
          </Typography>
          <Box className={classes.switchRow}>
            <Typography variant="h6">{displayMode.subheading}</Typography>
            <Box className={classes.switchShell}>
              <FormControl className={classes.selectControl}>
                <InputLabel className={classes.selectLabel} id="rating-group-select-label">
                  Select category
                </InputLabel>
                <Select
                  labelId="rating-group-select-label"
                  value={activeGroupId}
                  onChange={handleSelectGroup}
                  className={classes.selectInput}
                >
                  {categoryGroupList.map((group) => (
                    <MenuItem key={group.id} value={group.id}>
                      {group.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>
          </Box>

          <Grid container spacing={2} style={{ marginTop: 8 }}>
            <Grid item xs={12} sm={4}>
              <Box className={classes.summaryCard}>
                <Typography className={classes.summaryLabel}>Categories</Typography>
                <Typography variant="h4" className={classes.summaryValue}>
                  {summary.totalCategories}
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} sm={4}>
              <Box className={classes.summaryCard}>
                <Typography className={classes.summaryLabel}>Rated by you</Typography>
                <Typography variant="h4" className={classes.summaryValue}>
                  {summary.ratedCategories}
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} sm={4}>
              <Box className={classes.summaryCard}>
                <Typography className={classes.summaryLabel}>Your average</Typography>
                <Typography variant="h4" className={classes.summaryValue}>
                  {summary.averageUserRating.toFixed(1)}
                </Typography>
              </Box>
            </Grid>
          </Grid>

          <Box className={classes.actions}>
            <Button
              variant="outlined"
              color="inherit"
              startIcon={<SettingsIcon />}
              onClick={handleOpenAdmin}
              className={classes.resetButton}
              style={{ marginRight: 12 }}
            >
              Manage questions
            </Button>
            <Button
              variant="contained"
              color="primary"
              startIcon={<ReplayIcon />}
              onClick={resetRatings}
              className={classes.resetButton}
            >
              Reset demo ratings
            </Button>
          </Box>
        </Paper>

        <Grid container spacing={3}>
          {categories.map((category) => (
            <Grid item xs={12} md={6} key={category.id}>
              <CategoryRatingCard category={category} onSelect={handleOpenEvaluation} />
            </Grid>
          ))}
        </Grid>

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
          onClose={handleCloseAdmin}
          onAddQuestion={addQuestion}
          onUpdateQuestion={updateQuestion}
          onRemoveQuestion={removeQuestion}
          onResetQuestions={resetQuestions}
        />
      </Container>
    </Box>
  );
}

export default StarRatingPage;
