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

  useEffect(() => {
    if (!category) {
      setDraftRatings({});
      return;
    }

    setDraftRatings(category.questionRatings || {});
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

    onSave(category.id, draftRatings);
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
          Answer each question with a star rating. The card score will be based on the
          average of your answers.
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
              </Box>
              {index < questions.length - 1 ? <Divider /> : null}
            </React.Fragment>
          ))
        )}

        <Box className={classes.summary}>
          <Typography variant="body2" color="textSecondary">
            Answered questions: {answeredRatings.length}/{questions.length}
          </Typography>
          <Typography variant="body1" className={classes.summaryValue}>
            {draftAverage ? `Current average: ${draftAverage}/5` : "No answers yet"}
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
