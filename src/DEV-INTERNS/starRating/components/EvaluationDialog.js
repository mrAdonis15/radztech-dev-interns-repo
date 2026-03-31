import React, { useEffect, useMemo, useState } from "react";
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  makeStyles,
  Typography,
} from "@material-ui/core";
import StarRating from "./StarRating";

const useStyles = makeStyles((theme) => ({
  paper: {
    borderRadius: 20,
  },
  content: {
    paddingTop: theme.spacing(1),
  },
  intro: {
    marginBottom: theme.spacing(2),
    color: "#475569",
  },
  questionBlock: {
    padding: theme.spacing(2, 0),
  },
  subQuestionBlock: {
    marginTop: theme.spacing(1.5),
    marginLeft: theme.spacing(2),
    paddingLeft: theme.spacing(2),
    borderLeft: "2px solid rgba(148, 163, 184, 0.24)",
  },
  questionTitle: {
    fontWeight: 600,
    color: "#0f172a",
  },
  helperText: {
    marginTop: theme.spacing(0.5),
    marginBottom: theme.spacing(1.25),
    color: "#64748b",
  },
  summary: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: theme.spacing(2),
    paddingTop: theme.spacing(2),
  },
  summaryValue: {
    fontWeight: 700,
    color: "#0f172a",
  },
  emptyState: {
    padding: theme.spacing(2, 0),
    color: "#64748b",
  },
  actions: {
    padding: theme.spacing(2, 3, 3),
  },
  saveButton: {
    borderRadius: 999,
    textTransform: "none",
    fontWeight: 600,
    padding: theme.spacing(1, 2.5),
  },
}));

function EvaluationDialog({ open, category, questions, onClose, onSave }) {
  const classes = useStyles();
  const [draftRatings, setDraftRatings] = useState({});
  const totalQuestionCount = questions.reduce(
    (count, question) => count + 1 + (question.subQuestions || []).length,
    0
  );

  const getDraftRatingsFromEvaluation = (evaluationResult) => {
    if (!evaluationResult || !Array.isArray(evaluationResult.ratings)) {
      return {};
    }

    return evaluationResult.ratings.reduce((accumulator, entry) => {
      if (entry?.questionId && entry?.rating > 0) {
        accumulator[entry.questionId] = entry.rating;
      }

      return accumulator;
    }, {});
  };

  useEffect(() => {
    if (!category) {
      setDraftRatings({});
      return;
    }

    setDraftRatings(getDraftRatingsFromEvaluation(category.evaluationResult));
  }, [category]);

  const answeredRatings = useMemo(
    () => Object.values(draftRatings).filter((value) => value > 0),
    [draftRatings]
  );
  const draftAverage = answeredRatings.length
    ? (answeredRatings.reduce((sum, value) => sum + value, 0) / answeredRatings.length).toFixed(1)
    : null;

  const handleRateQuestion = (questionId, rating) => {
    setDraftRatings((currentRatings) => ({
      ...currentRatings,
      [questionId]: rating,
    }));
  };

  const handleSave = () => {
    if (!category) {
      return;
    }

    const ratings = questions.reduce((entries, question) => {
      const questionRating = draftRatings[question.id];

      if (questionRating > 0) {
        entries.push({
          questionId: question.id,
          parentQuestionId: null,
          label: question.label,
          helperText: question.helperText,
          type: "question",
          rating: questionRating,
        });
      }

      (question.subQuestions || []).forEach((subQuestion) => {
        const subQuestionRating = draftRatings[subQuestion.id];

        if (subQuestionRating > 0) {
          entries.push({
            questionId: subQuestion.id,
            parentQuestionId: question.id,
            label: subQuestion.label,
            helperText: subQuestion.helperText,
            type: "subQuestion",
            rating: subQuestionRating,
          });
        }
      });

      return entries;
    }, []);

    const evaluationResult = {
      categoryId: category.id,
      categoryName: category.name,
      submittedAt: new Date().toISOString(),
      answeredQuestions: ratings.length,
      totalQuestions: totalQuestionCount,
      overallRating: ratings.length
        ? Number(
            (ratings.reduce((sum, entry) => sum + entry.rating, 0) / ratings.length).toFixed(1)
          )
        : 0,
      ratings,
    };

    return onSave(category.id, evaluationResult);
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="sm"
      classes={{ paper: classes.paper }}
    >
      <DialogTitle>{category ? `Evaluate ${category.name}` : "Evaluate"}</DialogTitle>
      <DialogContent className={classes.content}>
        <Typography variant="body2" className={classes.intro}>
          Answer each question with a star rating. The 5-star score is calculated using
          the weighted mean: total star points divided by total reviews.
        </Typography>

        {questions.length === 0 ? (
          <Typography variant="body2" className={classes.emptyState}>
            No evaluation questions are configured. Use the question admin panel to add
            at least one question.
          </Typography>
        ) : (
          questions.map((question, index) => (
            <React.Fragment key={question.id}>
              <Box className={classes.questionBlock}>
                <Typography variant="subtitle1" className={classes.questionTitle}>
                  {question.label}
                </Typography>
                <Typography variant="body2" className={classes.helperText}>
                  {question.helperText}
                </Typography>
                <StarRating
                  value={draftRatings[question.id] || 0}
                  onChange={(rating) => handleRateQuestion(question.id, rating)}
                  showValue
                />
                {(question.subQuestions || []).map((subQuestion) => (
                  <Box key={subQuestion.id} className={classes.subQuestionBlock}>
                    <Typography variant="subtitle2" className={classes.questionTitle}>
                      {subQuestion.label || "Untitled sub-question"}
                    </Typography>
                    <Typography variant="body2" className={classes.helperText}>
                      {subQuestion.helperText}
                    </Typography>
                    <StarRating
                      value={draftRatings[subQuestion.id] || 0}
                      onChange={(rating) => handleRateQuestion(subQuestion.id, rating)}
                      showValue
                    />
                  </Box>
                ))}
              </Box>
              {index < questions.length - 1 ? <Divider /> : null}
            </React.Fragment>
          ))
        )}

        <Box className={classes.summary}>
          <Typography variant="body2" color="textSecondary">
            Answered questions: {answeredRatings.length}/{totalQuestionCount}
          </Typography>
          <Typography variant="body1" className={classes.summaryValue}>
            {draftAverage ? `Current weighted average: ${draftAverage}/5` : "No answers yet"}
          </Typography>
        </Box>
      </DialogContent>
      <DialogActions className={classes.actions}>
        <Button onClick={onClose} color="default">
          Cancel
        </Button>
        <Button
          onClick={handleSave}
          variant="contained"
          color="primary"
          className={classes.saveButton}
          disabled={questions.length === 0}
        >
          Save evaluation
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default EvaluationDialog;
