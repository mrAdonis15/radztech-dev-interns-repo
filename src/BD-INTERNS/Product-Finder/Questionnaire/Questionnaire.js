import React, { useState } from "react";
import { useNavigate, Link as RouterLink } from "react-router-dom";
import {
  Box,
  Container,
  Radio,
  Checkbox,
  Button,
  Typography,
  makeStyles,
} from "@material-ui/core";
import ArrowForwardIcon from "@material-ui/icons/ArrowForward";
import ArrowBackIcon from "@material-ui/icons/ArrowBack";
import ChevronLeftIcon from "@material-ui/icons/ChevronLeft";
import ChevronRightIcon from "@material-ui/icons/ChevronRight";
import CheckIcon from "@material-ui/icons/Check";
// --- Data Configuration ---
const questions = [
  {
    id: 1,
    title: "How many employees do you have?",
    type: "single-select",
    options: [
      { label: "Startup (1-20 Employees) — Small, agile team.", score: 1 },
      {
        label:
          "Growing (21-49 Employees) — Expanding team with emerging structure.",
        score: 2,
      },
      {
        label:
          "Mid-Sized (51-150 Employees) — Established company with organized workflows",
        score: 3,
      },
      { label: "Enterprise (151+ Employees) — Large Organization", score: 4 },
    ],
  },
  {
    id: 2,
    title: "What types of workers do you pay? (Select all that apply)",
    type: "multi-select",
    hint: "Complexity Bonus: If 3 or more complex types are selected (Daily, Project-Based, Field, Mixed) → Add +5 points",
    options: [
      {
        label: "Fixed Monthly Employees — Salaried staff",
        score: 1,
        isComplex: false,
      },
      {
        label: "Daily Wage Employees — Paid by day",
        score: 2,
        isComplex: true,
      },
      {
        label: "Project-Based Employees — Paid per project",
        score: 2,
        isComplex: true,
      },
      {
        label: "Field / Remote Employees — Offsite Staff",
        score: 3,
        isComplex: true,
      },
    ],
  },
  {
    id: 3,
    title: "What do you want from your payroll and HR solution?",
    type: "single-select",
    options: [
      { label: "Standard features only.", score: 1 },
      { label: "Standard features with additional tools.", score: 2 },
      { label: "Everything available in UlapPayroll.", score: 3 },
    ],
  },
  {
    id: 4,
    title: "What kind of payroll reports do you need?",
    type: "single-select",
    options: [
      { label: "Standard reports only.", score: 1 },
      { label: "Advanced compliance reports.", score: 2 },
      { label: "Management & analytics reports.", score: 3 },
    ],
  },
  {
    id: 5,
    title: "What level of payroll support would you like?",
    type: "single-select",
    options: [
      { label: "Expert Product Support", score: 1 },
      { label: "Expert Product Support & Expert Setup", score: 3 },
    ],
  },
];

const useStyles = makeStyles((theme) => ({
  wrapper: {
    width: "100%",
    minHeight: "calc(100vh - 60px)",
    background: "#f7f9fc",
    fontFamily: theme.typography.fontFamily,
    boxSizing: "border-box",
    display: "flex",
    flexDirection: "column",
    paddingTop: theme.spacing(2),
    [theme.breakpoints.down("xs")]: {
      paddingTop: theme.spacing(2),
    },
  },
  container: {
    width: "100%",
    flex: 1,
    display: "flex",
    flexDirection: "column",
  },
  topBanner: {
    padding: theme.spacing(2, 3, 4),
    minHeight: 100,
    background: "linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)",
    borderBottom: "1px solid #e2e8f0",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    [theme.breakpoints.down("xs")]: {
      padding: theme.spacing(2, 2, 3),
      minHeight: 80,
    },
  },
  topBar: {
    display: "flex",
    alignItems: "center",
    justifyContent: "flex-start",
    padding: theme.spacing(2, 0, 0),
    [theme.breakpoints.down("xs")]: {
      padding: theme.spacing(1.5, 0, 0),
    },
    marginBottom: theme.spacing(2),
  },
  topBannerContent: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    textAlign: "center",
    gap: theme.spacing(0.5),
  },
  topBannerText: {
    fontSize: "2.5rem",
    fontWeight: 600,
    color: "#0f172a",
  },
  topBannerSub: {
    fontSize: "1rem",
    color: "#64748b",
    lineHeight: 1.4,
  },
  mainRow: {
    display: "flex",
    flex: 1,
    minHeight: "calc(100vh - 60px - 140px)",
    [theme.breakpoints.down("sm")]: {
      flexDirection: "column",
      minHeight: 0,
    },
  },
  leftPanel: {
    width: 320,
    flexShrink: 0,
    padding: theme.spacing(3, 3),
    borderRight: "1px solid #e2e8f0",
    backgroundColor: "#fff",
    [theme.breakpoints.down("sm")]: {
      width: "100%",
      borderRight: "none",
      borderBottom: "1px solid #e2e8f0",
      padding: theme.spacing(2, 2.5),
    },
  },
  leftTitle: {
    fontSize: "2rem",
    fontWeight: 700,
    color: "#0f172a",
    marginBottom: theme.spacing(0.75),
    lineHeight: 1.3,
  },
  leftSubtitle: {
    fontSize: "1rem",
    color: "#64748b",
    lineHeight: 1.5,
    marginBottom: theme.spacing(2),
  },
  leftBullets: {
    listStyle: "none",
    padding: 0,
    margin: 0,
  },
  leftBullet: {
    display: "flex",
    alignItems: "flex-start",
    gap: theme.spacing(2),
    fontSize: "0.875rem",
    color: "#475569",
    marginBottom: theme.spacing(1),
    lineHeight: 1.45,
  },
  leftBulletIcon: {
    width: 20,
    height: 20,
    borderRadius: "50%",
    border: "1.5px solid #22c55e",
    color: "#22c55e",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
    marginTop: 2,
  },
  rightPanel: {
    flex: 1,
    padding: theme.spacing(3, 3),
    minWidth: 0,
    backgroundColor: "#fff",
    [theme.breakpoints.down("sm")]: {
      padding: theme.spacing(2, 2.5),
    },
  },
  progressWrap: {
    marginBottom: theme.spacing(2),
  },
  progressBar: {
    height: 6,
    borderRadius: 0,
    backgroundColor: "#e2e8f0",
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: 0,
    backgroundColor: "#FF7704",
    transition: "width 0.4s ease",
  },
  stepLabel: {
    fontSize: "0.8125rem",
    color: "#64748b",
    marginTop: theme.spacing(1),
    fontWeight: 500,
  },
  title: {
    fontSize: "1.125rem",
    fontWeight: 700,
    color: "#0f172a",
    marginBottom: theme.spacing(1.5),
    lineHeight: 1.4,
  },
  hint: {
    fontSize: "0.8125rem",
    color: "#64748b",
    marginBottom: theme.spacing(2),
    lineHeight: 1.5,
    padding: theme.spacing(1.25, 1.5),
    backgroundColor: "#f8fafc",
    borderRadius: 8,
    border: "1px solid #e2e8f0",
  },
  optionsGrid: {
    display: "flex",
    flexDirection: "column",
    gap: theme.spacing(1.25),
    marginBottom: theme.spacing(2),
  },
  optionCard: {
    display: "flex",
    alignItems: "center",
    gap: theme.spacing(1.5),
    padding: theme.spacing(1.5, 2),
    border: "1px solid #e2e8f0",
    borderRadius: 10,
    cursor: "pointer",
    backgroundColor: "#fff",
    transition: "border-color 0.2s ease, background-color 0.2s ease",
    "&:hover": {
      borderColor: "#cbd5e1",
      backgroundColor: "#f8fafc",
    },
  },
  optionLabel: {
    flex: 1,
    fontSize: "0.9375rem",
    color: "#334155",
    lineHeight: 1.45,
    textAlign: "left",
  },
  optionLabelSelected: {
    fontWeight: 600,
    color: "#0f172a",
  },
  radioRoot: {
    padding: 6,
    color: "#cbd5e1",
    "&$radioChecked": {
      color: "#FF7704",
    },
  },
  radioChecked: {},
  checkboxRoot: {
    padding: 6,
    color: "#cbd5e1",
    "&$checkboxChecked": {
      color: "#FF7704",
    },
  },
  checkboxChecked: {},
  buttonRow: {
    marginTop: theme.spacing(1),
  },
  backBtn: {
    textTransform: "none",
    fontSize: "0.9rem",
    color: "#FF7704",
    "&:hover": {
      backgroundColor: "transparent",
      color: theme.palette.primary.main,
    },
  },
  navRow: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    flexWrap: "wrap",
    gap: theme.spacing(1.5),
    marginTop: theme.spacing(2),
  },
  navBtn: {
    textTransform: "none",
    fontSize: "0.875rem",
    fontWeight: 600,
    color: "#64748b",
    "&:hover": {
      backgroundColor: "rgba(0,0,0,0.04)",
      color: "#e66d04",
    },
  },
  primaryBtn: {
    borderRadius: 4,
    padding: theme.spacing(1.25, 2),
    fontWeight: 500,
    textTransform: "none",
    backgroundColor: "#FF7704",
    color: "#fff",
    "&:hover": {
      backgroundColor: "#e66d04",
      boxShadow: "0 4px 12px rgba(255, 119, 4, 0.3)",
    },
  },
  backLink: {
    display: "inline-flex",
    alignItems: "center",
    gap: theme.spacing(0.5),
    fontSize: "0.875rem",
    color: "#64748b",
    textDecoration: "none",
    "&:hover": {
      color: "#0f172a",
    },
  },
}));

const KEYFRAMES = `
  @keyframes questionIn {
    from { opacity: 0; transform: translateY(12px); }
    to { opacity: 1; transform: translateY(0); }
  }
  @keyframes optionIn {
    from { opacity: 0; transform: translateY(6px); }
    to { opacity: 1; transform: translateY(0); }
  }
`;

function Quiz() {
  const classes = useStyles();
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState({});
  const navigate = useNavigate();

  const handleMultiSelect = (option) => {
    const qId = questions[currentStep].id;
    const currentSelection = answers[qId] || [];
    let newSelection;
    if (currentSelection.includes(option)) {
      newSelection = currentSelection.filter((item) => item !== option);
    } else {
      newSelection = [...currentSelection, option];
    }
    setAnswers({ ...answers, [qId]: newSelection });
  };

  const handleSingleSelect = (option) => {
    const qId = questions[currentStep].id;
    const nextAnswers = { ...answers, [qId]: option };
    setAnswers(nextAnswers);

    const isLastStep = currentStep === questions.length - 1;
    if (!isLastStep) {
      setTimeout(() => {
        setCurrentStep(currentStep + 1);
      }, 250);
    }
  };

  const progressPercent =
    questions.length > 0 ? ((currentStep + 1) / questions.length) * 100 : 0;

  const submitQuiz = () => {
    let score = 0;
    questions.forEach((q) => {
      if (q.type === "multi-select") {
        const selection = answers[q.id] || [];
        let qScore = 0,
          complexCount = 0;
        selection.forEach((opt) => {
          qScore += opt.score;
          if (opt.isComplex) complexCount++;
        });
        if (complexCount >= 3) qScore += 5;
        score += qScore;
      } else if (answers[q.id]) {
        score += answers[q.id].score;
      }
    });
    navigate("/ProductFinder/Results", {
      state: {
        totalScore: score,
        answeredCount: questions.length,
        totalQuestions: questions.length,
        answers,
        questionsSummary: questions.map((q) => ({
          id: q.id,
          title: q.title,
          type: q.type,
          options: q.options.map((o) => ({ label: o.label })),
        })),
      },
    });
  };

  const renderProgress = () => (
    <div className={classes.progressWrap}>
      <div className={classes.progressBar}>
        <div
          className={classes.progressFill}
          style={{ width: `${progressPercent}%` }}
        />
      </div>
      <Typography className={classes.stepLabel}>
        Question {currentStep + 1} of {questions.length}
      </Typography>
    </div>
  );

  return (
    <div className={classes.wrapper}>
      <style>{KEYFRAMES}</style>
      <Container maxWidth="lg" className={classes.container}>
        {/* Back button left, like Contact Us */}
        <Box className={classes.topBar}>
          <Button
            component={RouterLink}
            to="/ProductFinder"
            startIcon={<ArrowBackIcon />}
            className={classes.backBtn}
            color="primary"
          >
            Back
          </Button>
        </Box>
        {/* Banner: Find your plan */}
        <div className={classes.topBanner}>
          <Box className={classes.topBannerContent}>
            <Typography className={classes.topBannerText}>
              Find your plan and compare options
            </Typography>
            <Typography className={classes.topBannerSub}>
              A few quick questions to recommend the right payroll solution.
            </Typography>
          </Box>
        </div>

        {currentStep < questions.length ? (
          <div className={classes.mainRow}>
            {/* Left panel: engaging content */}
            <aside className={classes.leftPanel}>
              <Typography component="h2" className={classes.leftTitle}>
                Why take this quiz?
              </Typography>
              <Typography className={classes.leftSubtitle}>
                We use your answers to match you with the best plan and features
                for your team size and needs.
              </Typography>
              <ul className={classes.leftBullets}>
                <li className={classes.leftBullet}>
                  <span className={classes.leftBulletIcon}>
                    <CheckIcon style={{ fontSize: 12 }} />
                  </span>
                  Get a personalized plan recommendation in under a minute.
                </li>
                <li className={classes.leftBullet}>
                  <span className={classes.leftBulletIcon}>
                    <CheckIcon style={{ fontSize: 12 }} />
                  </span>
                  Compare features and pricing that fit your business.
                </li>
                <li className={classes.leftBullet}>
                  <span className={classes.leftBulletIcon}>
                    <CheckIcon style={{ fontSize: 12 }} />
                  </span>
                  No commitment—see your result and decide next steps.
                </li>
              </ul>
            </aside>

            {/* Right panel: questionnaire */}
            <main className={classes.rightPanel}>
              {renderProgress()}
              <div
                key={currentStep}
                style={{
                  animation:
                    "questionIn 0.4s cubic-bezier(0.4, 0, 0.2, 1) forwards",
                }}
              >
                <Typography component="h2" className={classes.title}>
                  {questions[currentStep].title}
                </Typography>
                {questions[currentStep].hint && (
                  <Typography className={classes.hint}>
                    {questions[currentStep].hint}
                  </Typography>
                )}

                <div className={classes.optionsGrid}>
                  {questions[currentStep].options.map((option, index) => {
                    const qId = questions[currentStep].id;
                    const isMulti =
                      questions[currentStep].type === "multi-select";
                    const isSelected = isMulti
                      ? (answers[qId] || []).includes(option)
                      : answers[qId] === option;

                    return (
                      <div
                        key={index}
                        role="button"
                        tabIndex={0}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" || e.key === " ") {
                            e.preventDefault();
                            isMulti
                              ? handleMultiSelect(option)
                              : handleSingleSelect(option);
                          }
                        }}
                        className={classes.optionCard}
                        style={{
                          animation: "optionIn 0.3s ease-out forwards",
                          animationDelay: `${index * 0.04}s`,
                          opacity: 0,
                        }}
                        onClick={() =>
                          isMulti
                            ? handleMultiSelect(option)
                            : handleSingleSelect(option)
                        }
                      >
                        {isMulti ? (
                          <Checkbox
                            checked={isSelected}
                            onChange={() => handleMultiSelect(option)}
                            onClick={(e) => e.stopPropagation()}
                            color="primary"
                            classes={{
                              root: classes.checkboxRoot,
                              checked: classes.checkboxChecked,
                            }}
                            size="small"
                          />
                        ) : (
                          <Radio
                            checked={isSelected}
                            onChange={() => handleSingleSelect(option)}
                            onClick={(e) => e.stopPropagation()}
                            color="primary"
                            classes={{
                              root: classes.radioRoot,
                              checked: classes.radioChecked,
                            }}
                            size="small"
                          />
                        )}
                        <span
                          className={`${classes.optionLabel} ${isSelected ? classes.optionLabelSelected : ""}`}
                        >
                          {option.label}
                        </span>
                      </div>
                    );
                  })}
                </div>

                <div className={classes.navRow}>
                  <Button
                    startIcon={<ChevronLeftIcon />}
                    className={classes.navBtn}
                    disabled={currentStep === 0}
                    onClick={() =>
                      currentStep > 0 && setCurrentStep(currentStep - 1)
                    }
                  >
                    Preview
                  </Button>
                  <Box
                    style={{ display: "flex", gap: 8, alignItems: "center" }}
                  >
                    {currentStep < questions.length - 1 ? (
                      <Button
                        endIcon={<ChevronRightIcon />}
                        className={classes.navBtn}
                        onClick={() => setCurrentStep(currentStep + 1)}
                        disabled={
                          questions[currentStep].type === "multi-select" &&
                          (answers[questions[currentStep].id] || []).length ===
                            0
                        }
                      >
                        Next
                      </Button>
                    ) : (
                      <Button
                        variant="contained"
                        className={classes.primaryBtn}
                        disabled={
                          questions[currentStep].type === "multi-select"
                            ? (answers[questions[currentStep].id] || [])
                                .length === 0
                            : !answers[questions[currentStep].id]
                        }
                        onClick={submitQuiz}
                        endIcon={<ArrowForwardIcon style={{ fontSize: 18 }} />}
                      >
                        Submit
                      </Button>
                    )}
                  </Box>
                </div>
              </div>
            </main>
          </div>
        ) : null}
      </Container>
    </div>
  );
}

export default Quiz;
