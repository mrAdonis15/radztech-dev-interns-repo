import React, { useMemo, useState } from "react";
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  TextField,
  makeStyles,
  Typography,
} from "@material-ui/core";
import Stars from "./Stars";

const isParagraphType = (type) => type !== "rating";

const useStyles = makeStyles((theme) => ({
  paper: {
    borderRadius: 20,
    fontFamily: '"Poppins", sans-serif',
  },
  content: {
    paddingTop: theme.spacing(1),
    fontFamily: '"Poppins", sans-serif',
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
    fontFamily: '"Poppins", sans-serif',
  },
}));

function RatingDialog({ open, category, questions, onClose, onSave }) {
  const classes = useStyles();
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

  const getDraftEssaysFromEvaluation = (evaluationResult) => {
    if (!evaluationResult || !Array.isArray(evaluationResult.essayResponses)) {
      return {};
    }

    return evaluationResult.essayResponses.reduce((accumulator, entry) => {
      if (entry?.questionId && typeof entry.responseText === "string") {
        accumulator[entry.questionId] = entry.responseText;
      }

      return accumulator;
    }, {});
  };

  const [draftRatings, setDraftRatings] = useState(() =>
    category ? getDraftRatingsFromEvaluation(category.evaluationResult) : {}
  );
  const [draftEssays, setDraftEssays] = useState(() =>
    category ? getDraftEssaysFromEvaluation(category.evaluationResult) : {}
  );
  const totalQuestionCount = questions.reduce(
    (count, questionCategory) => count + (questionCategory.subQuestions || []).length,
    0
  );

  const answeredRatings = useMemo(
    () => Object.values(draftRatings).filter((value) => value > 0),
    [draftRatings]
  );
  const answeredEssays = useMemo(
    () => Object.values(draftEssays).filter((value) => typeof value === "string" && value.trim()),
    [draftEssays]
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

  const handleEssayChange = (questionId, value) => {
    setDraftEssays((currentEssays) => ({
      ...currentEssays,
      [questionId]: value,
    }));
  };

  const handleSave = () => {
    if (!category) {
      return;
    }

    const ratings = questions.reduce((entries, questionCategory) => {
      (questionCategory.subQuestions || []).forEach((subQuestion) => {
        const subQuestionRating = draftRatings[subQuestion.id];

        if (!isParagraphType(subQuestion.type) && subQuestionRating > 0) {
          entries.push({
            questionId: subQuestion.id,
            parentQuestionId: questionCategory.id,
            label: subQuestion.label,
            helperText: subQuestion.helperText,
            type: "question",
            rating: subQuestionRating,
          });
        }
      });

      return entries;
    }, []);

    const essayResponses = questions.reduce((entries, questionCategory) => {
      (questionCategory.subQuestions || []).forEach((subQuestion) => {
        const subQuestionEssay = draftEssays[subQuestion.id];

        if (
          isParagraphType(subQuestion.type) &&
          typeof subQuestionEssay === "string" &&
          subQuestionEssay.trim()
        ) {
          entries.push({
            questionId: subQuestion.id,
            parentQuestionId: questionCategory.id,
            label: subQuestion.label,
            helperText: subQuestion.helperText,
            type: "question",
            responseText: subQuestionEssay.trim(),
          });
        }
      });

      return entries;
    }, []);

    const evaluationResult = {
      categoryId: category.id,
      categoryName: category.name,
      submittedAt: new Date().toISOString(),
      answeredQuestions: ratings.length + essayResponses.length,
      totalQuestions: totalQuestionCount,
      overallRating: ratings.length
        ? Number(
            (ratings.reduce((sum, entry) => sum + entry.rating, 0) / ratings.length).toFixed(1)
          )
        : 0,
      ratings,
      essayResponses,
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
          Answer each question using the configured type. Rate questions use stars,
          while paragraph questions use a text box.
        </Typography>

        {questions.length === 0 ? (
          <Typography variant="body2" className={classes.emptyState}>
            No evaluation questions are configured. Use the question admin panel to add
            at least one question.
          </Typography>
        ) : (
          questions.map((questionCategory, index) => (
            <React.Fragment key={questionCategory.id}>
              <Box className={classes.questionBlock}>
                <Typography variant="subtitle1" className={classes.questionTitle}>
                  {questionCategory.label || `Category ${index + 1}`}
                </Typography>
                <Typography variant="body2" className={classes.helperText}>
                  {questionCategory.helperText}
                </Typography>
                {(questionCategory.subQuestions || []).map((subQuestion) => (
                  <Box key={subQuestion.id} className={classes.subQuestionBlock}>
                    <Typography variant="subtitle2" className={classes.questionTitle}>
                      {subQuestion.label || "Untitled question"}
                    </Typography>
                    <Typography variant="body2" className={classes.helperText}>
                      {subQuestion.helperText}
                    </Typography>
                    {isParagraphType(subQuestion.type) ? (
                      <TextField
                        variant="outlined"
                        fullWidth
                        multiline
                        rows={4}
                        placeholder="Write your answer here"
                        value={draftEssays[subQuestion.id] || ""}
                        onChange={(event) =>
                          handleEssayChange(subQuestion.id, event.target.value)
                        }
                      />
                    ) : (
                      <Stars
                        value={draftRatings[subQuestion.id] || 0}
                        onChange={(rating) => handleRateQuestion(subQuestion.id, rating)}
                        showValue
                      />
                    )}
                  </Box>
                ))}
                {(questionCategory.subQuestions || []).length === 0 ? (
                  <Typography variant="body2" className={classes.emptyState}>
                    No questions in this category yet.
                  </Typography>
                ) : null}
              </Box>
              {index < questions.length - 1 ? <Divider /> : null}
            </React.Fragment>
          ))
        )}

        <Box className={classes.summary}>
          <Typography variant="body2" color="textSecondary">
            Answered questions: {answeredRatings.length + answeredEssays.length}/{totalQuestionCount}
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

export default RatingDialog;
