import React, { useState } from "react";
import { useNavigate, Link as RouterLink } from "react-router-dom";
import {
  Box,
  Container,
  Radio,
  Button,
  Typography,
  makeStyles,
} from "@material-ui/core";
import ArrowForwardIcon from "@material-ui/icons/ArrowForward";
import ArrowBackIcon from "@material-ui/icons/ArrowBack";
import ChevronLeftIcon from "@material-ui/icons/ChevronLeft";
import CheckIcon from "@material-ui/icons/Check";
// --- Data Configuration ---
const questions = [
  {
    id: 1,
    title: "How many employees do you have?",
    description:
      "Your team size helps us match you with the right plan limits and pricing.",
    type: "single-select",
    options: [
      {
        label: "Startup (1-20 Employees)",
        sublabel: "Small, agile team.",
        score: 1,
      },
      {
        label: "Growing (21-49 Employees)",
        sublabel: "Expanding team with emerging structure.",
        score: 2,
      },
      {
        label: "Mid-Sized (51-150 Employees)",
        sublabel: "Established company with organized workflows.",
        score: 3,
      },
      {
        label: "Enterprise (151+ Employees)",
        sublabel: "Large organization.",
        score: 4,
      },
    ],
  },
  {
    id: 2,
    title: "What types of workers do you pay? (Select all that apply)",
    description:
      "Different worker types affect payroll complexity and the features you need.",
    type: "multi-select",
    options: [
      { label: "Fixed Monthly Employees", score: 1 },
      { label: "Daily Wage Employees", score: 2 },
      { label: "Project-Based Employees", score: 2 },
      { label: "Field / Remote Employees", score: 3 },
    ],
  },
  {
    id: 3,
    title: "What do you want from your payroll and HR solution?",
    description:
      "We’ll recommend features that match your goals—from basics to full suite.",
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
    description:
      "Reporting needs vary from standard outputs to compliance and analytics.",
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
    description:
      "Choose the support level that fits how you want to run payroll.",
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
    background: "#FAFBFD",
    fontFamily: theme.typography.body1.fontFamily,
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
  pageHeading: {
    fontFamily: theme.typography.h1.fontFamily,
    fontSize: "1.75rem",
    fontWeight: 700,
    color: "#0f172a",
    marginBottom: theme.spacing(2),
    lineHeight: 1.3,
    textAlign: "center",
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
    fontFamily: theme.typography.h2.fontFamily,
    fontSize: "2.5rem",
    fontWeight: 600,
    color: "#0f172a",
  },
  topBannerSub: {
    fontFamily: theme.typography.body1.fontFamily,
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
    width: "42%",
    maxWidth: 480,
    flexShrink: 0,
    padding: theme.spacing(13, 4, 4, 5),
    display: "flex",
    flexDirection: "column",
    justifyContent: "flex-start",
    [theme.breakpoints.down("sm")]: {
      width: "100%",
      maxWidth: "none",
      padding: theme.spacing(3, 2.5),
    },
  },
  progressSegments: {
    display: "flex",
    gap: 8,
    marginBottom: theme.spacing(3),
  },
  progressSegment: {
    flex: 1,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#e2e8f0",
    transition: "background-color 0.3s ease",
  },
  progressSegmentFilled: {
    backgroundColor: "#DB6700",
  },
  leftTitle: {
    fontFamily: theme.typography.h2.fontFamily,
    fontSize: "1.75rem",
    fontWeight: 700,
    color: "#0f172a",
    marginBottom: theme.spacing(1.5),
    lineHeight: 1.3,
  },
  leftSubtitle: {
    fontFamily: theme.typography.body1.fontFamily,
    fontSize: "0.9375rem",
    color: "#64748b",
    lineHeight: 1.5,
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
    padding: theme.spacing(4, 4),
    minWidth: 0,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    [theme.breakpoints.down("sm")]: {
      padding: theme.spacing(2, 2.5),
      alignItems: "flex-start",
    },
  },
  optionsCardWrapper: {
    position: "relative",
    width: "100%",
    maxWidth: 520,
  },
  optionsCardBack: {
    position: "absolute",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    borderRadius: 16,
    background: "#B85A00",
    transform: "translate(10px, 10px)",
    zIndex: 0,
    boxShadow: "0 4px 14px rgba(0,0,0,0.15), 0 10px 30px rgba(0,0,0,0.2)",
  },
  optionsCard: {
    width: "100%",
    maxWidth: 520,
    background: "linear-gradient(135deg, #F2B272 0%, #DB6700 100%)",
    borderRadius: 16,
    padding: theme.spacing(3, 3),
    position: "relative",
    zIndex: 1,
    boxShadow:
      "0 4px 6px rgba(0,0,0,0.07), 0 12px 28px rgba(0,0,0,0.12), 0 24px 48px rgba(219, 103, 0, 0.22), 2px 2px 0 0 rgba(0,0,0,0.06)",
  },
  chooseAllLabel: {
    fontSize: "0.9375rem",
    color: "rgba(255,255,255,0.95)",
    marginBottom: theme.spacing(2),
    display: "block",
    fontWeight: 500,
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
    backgroundColor: "#DB6700",
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
    gap: theme.spacing(1.5),
    marginBottom: theme.spacing(3),
  },
  optionCard: {
    display: "flex",
    alignItems: "center",
    gap: theme.spacing(1.5),
    padding: theme.spacing(1.5, 2),
    border: "1px solid rgba(255,255,255,0.7)",
    borderRadius: 12,
    cursor: "pointer",
    backgroundColor: "rgba(255,255,255,0.97)",
    transition:
      "border-color 0.2s ease, background-color 0.2s ease, box-shadow 0.2s ease, transform 0.2s ease",
    boxShadow: "0 2px 8px rgba(0,0,0,0.06), 0 4px 16px rgba(0,0,0,0.1)",
    "&:hover": {
      borderColor: "rgba(255,255,255,0.95)",
      boxShadow: "0 4px 12px rgba(0,0,0,0.1), 0 8px 24px rgba(0,0,0,0.14)",
      transform: "translateY(-1px)",
    },
  },
  optionLabel: {
    fontFamily: theme.typography.body1.fontFamily,
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
  optionSublabel: {
    fontFamily: theme.typography.body1.fontFamily,
    display: "block",
    fontSize: "0.8125rem",
    color: "#64748b",
    marginTop: 2,
    lineHeight: 1.4,
    fontWeight: 400,
  },
  radioRoot: {
    padding: 6,
    color: "#94a3b8",
    "&$radioChecked": {
      color: "#DB6700",
    },
  },
  radioChecked: {},
  optionCardSelected: {
    borderColor: "rgba(255,255,255,0.95)",
    boxShadow: "0 4px 12px rgba(0,0,0,0.1), 0 8px 24px rgba(0,0,0,0.15)",
    backgroundColor: "#fff",
  },
  buttonRow: {
    marginTop: theme.spacing(1),
  },
  backBtn: {
    textTransform: "none",
    fontSize: "0.9rem",
    color: "#DB6700",
    "&:hover": {
      backgroundColor: "transparent",
      color: theme.palette.primary.main,
    },
  },
  navRow: {
    display: "flex",
    alignItems: "center",
    justifyContent: "flex-end",
    flexWrap: "wrap",
    gap: theme.spacing(1.5),
    marginTop: theme.spacing(2),
  },
  navBtn: {
    textTransform: "none",
    fontSize: "0.875rem",
    fontWeight: 600,
    color: "#fff",
    backgroundColor: "#DB6700",
    padding: theme.spacing(1, 2),
    borderRadius: 8,
    "&:hover": {
      backgroundColor: "#C45D00",
      color: "#fff",
    },
  },
  navBtnOnGradient: {
    color: "rgba(255,255,255,0.95)",
    border: "1.5px solid rgba(255,255,255,0.9)",
    backgroundColor: "transparent",
    "&:hover": {
      backgroundColor: "rgba(255,255,255,0.15)",
      borderColor: "#fff",
      color: "#fff",
    },
  },
  primaryBtn: {
    borderRadius: 8,
    padding: theme.spacing(1.25, 2.5),
    fontWeight: 600,
    textTransform: "none",
    fontSize: "0.9375rem",
    backgroundColor: "#DB6700",
    color: "#fff",
    "&:hover": {
      backgroundColor: "#C45D00",
      boxShadow: "0 4px 12px rgba(219, 103, 0, 0.3)",
    },
  },
  primaryBtnOnGradient: {
    backgroundColor: "#fff",
    color: "#DB6700",
    "&:hover": {
      backgroundColor: "rgba(255,255,255,0.9)",
      color: "#C45D00",
      boxShadow: "0 4px 16px rgba(0,0,0,0.15)",
    },
    "&.Mui-disabled": {
      backgroundColor: "rgba(255,255,255,0.6)",
      color: "rgba(219, 103, 0, 0.5)",
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
  coverCard: {
    maxWidth: 480,
    margin: "0 auto",
    padding: theme.spacing(4, 3),
    backgroundColor: "#fff",
    borderRadius: 12,
    border: "1px solid #e2e8f0",
    boxShadow: "0 4px 20px rgba(0,0,0,0.06)",
    textAlign: "center",
    [theme.breakpoints.down("xs")]: {
      padding: theme.spacing(3, 2),
    },
  },
  coverTitle: {
    fontFamily: theme.typography.h2.fontFamily,
    fontSize: "1.75rem",
    fontWeight: 700,
    color: "#0f172a",
    marginBottom: theme.spacing(1),
    lineHeight: 1.3,
  },
  coverSubtitle: {
    fontFamily: theme.typography.body1.fontFamily,
    fontSize: "1rem",
    color: "#64748b",
    lineHeight: 1.5,
    marginBottom: theme.spacing(2.5),
    textAlign: "center",
  },
  coverBullets: {
    listStyle: "none",
    padding: 0,
    margin: "0 0 " + theme.spacing(3) + "px",
    textAlign: "left",
  },
  coverBullet: {
    fontFamily: theme.typography.body1.fontFamily,
    display: "flex",
    alignItems: "flex-start",
    gap: theme.spacing(1.5),
    fontSize: "0.9375rem",
    color: "#475569",
    marginBottom: theme.spacing(1.5),
    lineHeight: 1.45,
  },
  startBtn: {
    padding: theme.spacing(1.5, 3),
    fontSize: "1rem",
    fontWeight: 600,
    textTransform: "none",
    borderRadius: 8,
    backgroundColor: "#DB6700",
    color: "#fff",
    "&:hover": {
      backgroundColor: "#C45D00",
      boxShadow: "0 4px 12px rgba(255, 119, 4, 0.3)",
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
  const [hasStarted, setHasStarted] = useState(false);
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

  const submitQuiz = () => {
    let score = 0;
    questions.forEach((q) => {
      if (q.type === "multi-select") {
        const selection = answers[q.id] || [];
        score += selection.reduce((sum, opt) => sum + (opt.score || 0), 0);
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
        <Typography component="h1" className={classes.pageHeading}>
          Find your plan
        </Typography>
        {/* Banner: only on cover */}
        {!hasStarted && (
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
        )}

        {!hasStarted ? (
          <Box className={classes.coverCard}>
            <Typography component="h2" className={classes.coverTitle}>
              Why take this quiz?
            </Typography>
            <Typography className={classes.coverSubtitle}>
              We use your answers to match you with the best plan and features
              for your team size and needs.
            </Typography>
            <ul className={classes.coverBullets}>
              <li className={classes.coverBullet}>
                <span className={classes.leftBulletIcon}>
                  <CheckIcon style={{ fontSize: 12 }} />
                </span>
                Get a personalized plan recommendation in under a minute.
              </li>
              <li className={classes.coverBullet}>
                <span className={classes.leftBulletIcon}>
                  <CheckIcon style={{ fontSize: 12 }} />
                </span>
                Compare features and pricing that fit your business.
              </li>
              <li className={classes.coverBullet}>
                <span className={classes.leftBulletIcon}>
                  <CheckIcon style={{ fontSize: 12 }} />
                </span>
                No commitment—see your result and decide next steps.
              </li>
            </ul>
            <Button
              variant="contained"
              className={classes.startBtn}
              onClick={() => setHasStarted(true)}
              endIcon={<ArrowForwardIcon style={{ fontSize: 20 }} />}
            >
              Start questionnaire
            </Button>
          </Box>
        ) : currentStep < questions.length ? (
          <div className={classes.mainRow}>
            {/* Left: progress segments + question title + subtitle */}
            <aside className={classes.leftPanel}>
              <div className={classes.progressSegments}>
                {questions.map((_, idx) => (
                  <div
                    key={idx}
                    className={`${classes.progressSegment} ${idx <= currentStep ? classes.progressSegmentFilled : ""}`}
                  />
                ))}
              </div>
              <Typography component="h2" className={classes.leftTitle}>
                {questions[currentStep].title.replace(/\s*\([^)]*\)\s*$/, "")}
              </Typography>
              <Typography className={classes.leftSubtitle}>
                {questions[currentStep].description ||
                  "This helps us recommend the right plan for you."}
              </Typography>
            </aside>

            {/* Right: options card */}
            <main className={classes.rightPanel}>
              <Box className={classes.optionsCardWrapper}>
                <Box className={classes.optionsCardBack} aria-hidden />
                <Box className={classes.optionsCard}>
                  <Typography
                    component="span"
                    className={classes.chooseAllLabel}
                  >
                    {questions[currentStep].type === "multi-select"
                      ? "Select all that apply"
                      : "Select One"}
                  </Typography>
                  <div
                    key={currentStep}
                    style={{
                      animation:
                        "questionIn 0.4s cubic-bezier(0.4, 0, 0.2, 1) forwards",
                    }}
                  >
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
                            className={`${classes.optionCard} ${isSelected ? classes.optionCardSelected : ""}`}
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
                            <Radio
                              checked={isSelected}
                              onChange={() =>
                                isMulti
                                  ? handleMultiSelect(option)
                                  : handleSingleSelect(option)
                              }
                              onClick={(e) => e.stopPropagation()}
                              color="primary"
                              classes={{
                                root: classes.radioRoot,
                                checked: classes.radioChecked,
                              }}
                              size="small"
                            />
                            <span
                              className={`${classes.optionLabel} ${isSelected ? classes.optionLabelSelected : ""}`}
                            >
                              {questions[currentStep].id === 1
                                ? (() => {
                                    const firstWord =
                                      option.label.split(/\s+/)[0];
                                    const rest = option.label
                                      .slice(firstWord.length)
                                      .trim();
                                    return (
                                      <span style={{ display: "block" }}>
                                        <strong>
                                          {firstWord}
                                          {rest ? ` ${rest}` : ""}
                                        </strong>
                                        {option.sublabel && (
                                          <span
                                            className={classes.optionSublabel}
                                          >
                                            {option.sublabel}
                                          </span>
                                        )}
                                      </span>
                                    );
                                  })()
                                : questions[currentStep].id === 2
                                  ? (() => {
                                      const boldPart = option.label.replace(
                                        /\s+Employees$/,
                                        "",
                                      );
                                      const rest = option.label.slice(
                                        boldPart.length,
                                      );
                                      return (
                                        <>
                                          <strong>{boldPart}</strong>
                                          {rest}
                                        </>
                                      );
                                    })()
                                  : option.label}
                            </span>
                          </div>
                        );
                      })}
                    </div>

                    <div className={classes.navRow}>
                      {currentStep > 0 && (
                        <Button
                          startIcon={<ChevronLeftIcon />}
                          className={`${classes.navBtn} ${classes.navBtnOnGradient}`}
                          onClick={() => setCurrentStep(currentStep - 1)}
                        >
                          Back
                        </Button>
                      )}
                      <Box
                        style={{
                          display: "flex",
                          gap: 8,
                          alignItems: "center",
                          marginLeft: "auto",
                        }}
                      >
                        {currentStep < questions.length - 1 ? (
                          <Button
                            className={`${classes.primaryBtn} ${classes.primaryBtnOnGradient}`}
                            onClick={() => setCurrentStep(currentStep + 1)}
                            disabled={
                              questions[currentStep].type === "multi-select"
                                ? (answers[questions[currentStep].id] || [])
                                    .length === 0
                                : !answers[questions[currentStep].id]
                            }
                            endIcon={
                              <ArrowForwardIcon style={{ fontSize: 18 }} />
                            }
                          >
                            Next
                          </Button>
                        ) : (
                          <Button
                            variant="contained"
                            className={`${classes.primaryBtn} ${classes.primaryBtnOnGradient}`}
                            disabled={
                              questions[currentStep].type === "multi-select"
                                ? (answers[questions[currentStep].id] || [])
                                    .length === 0
                                : !answers[questions[currentStep].id]
                            }
                            onClick={submitQuiz}
                            endIcon={
                              <ArrowForwardIcon style={{ fontSize: 18 }} />
                            }
                          >
                            Submit
                          </Button>
                        )}
                      </Box>
                    </div>
                  </div>
                </Box>
              </Box>
            </main>
          </div>
        ) : null}
      </Container>
    </div>
  );
}

export default Quiz;
