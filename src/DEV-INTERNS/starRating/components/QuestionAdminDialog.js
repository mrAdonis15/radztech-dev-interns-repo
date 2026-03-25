import React from "react";
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  TextField,
  makeStyles,
  Typography,
} from "@material-ui/core";
import AddIcon from "@material-ui/icons/Add";
import DeleteOutlineIcon from "@material-ui/icons/DeleteOutline";
import ReplayIcon from "@material-ui/icons/Replay";

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
  questionCard: {
    padding: theme.spacing(2),
    borderRadius: 16,
    border: "1px solid rgba(148, 163, 184, 0.22)",
    backgroundColor: "#f8fafc",
    marginBottom: theme.spacing(2),
  },
  questionHeader: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: theme.spacing(1.5),
  },
  questionTitle: {
    fontWeight: 600,
    color: "#0f172a",
  },
  field: {
    marginBottom: theme.spacing(1.5),
  },
  emptyState: {
    padding: theme.spacing(2),
    borderRadius: 16,
    border: "1px dashed rgba(148, 163, 184, 0.4)",
    backgroundColor: "#f8fafc",
    color: "#64748b",
    textAlign: "center",
  },
  toolbar: {
    display: "flex",
    justifyContent: "space-between",
    gap: theme.spacing(2),
    marginBottom: theme.spacing(2),
    [theme.breakpoints.down("xs")]: {
      flexDirection: "column",
    },
  },
  actionButton: {
    borderRadius: 999,
    textTransform: "none",
    fontWeight: 600,
  },
  footer: {
    padding: theme.spacing(2, 3, 3),
  },
}));

function QuestionAdminDialog({
  open,
  questions,
  onClose,
  onAddQuestion,
  onUpdateQuestion,
  onRemoveQuestion,
  onResetQuestions,
}) {
  const classes = useStyles();

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="md"
      classes={{ paper: classes.paper }}
    >
      <DialogTitle>Question Admin Panel</DialogTitle>
      <DialogContent className={classes.content}>
        <Typography variant="body2" className={classes.intro}>
          Edit the rating questions used in the evaluator popup. Changes are stored in
          localStorage and applied immediately.
        </Typography>

        <Box className={classes.toolbar}>
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={onAddQuestion}
            className={classes.actionButton}
          >
            Add question
          </Button>
          <Button
            variant="outlined"
            color="default"
            startIcon={<ReplayIcon />}
            onClick={onResetQuestions}
            className={classes.actionButton}
          >
            Reset default questions
          </Button>
        </Box>

        {questions.length === 0 ? (
          <Box className={classes.emptyState}>
            <Typography variant="body2">
              No questions yet. Click `Add question` to create one.
            </Typography>
          </Box>
        ) : (
          questions.map((question, index) => (
            <Box key={question.id} className={classes.questionCard}>
              <Box className={classes.questionHeader}>
                <Typography variant="subtitle1" className={classes.questionTitle}>
                  Question {index + 1}
                </Typography>
                <IconButton
                  onClick={() => onRemoveQuestion(question.id)}
                  aria-label={`Delete question ${index + 1}`}
                >
                  <DeleteOutlineIcon />
                </IconButton>
              </Box>

              <TextField
                label="Question title"
                variant="outlined"
                fullWidth
                className={classes.field}
                value={question.label}
                placeholder="Enter the question title"
                onChange={(event) =>
                  onUpdateQuestion(question.id, "label", event.target.value)
                }
              />
              <TextField
                label="Helper text"
                variant="outlined"
                fullWidth
                multiline
                rows={2}
                value={question.helperText}
                placeholder="Add guidance for how this question should be rated"
                onChange={(event) =>
                  onUpdateQuestion(question.id, "helperText", event.target.value)
                }
              />
            </Box>
          ))
        )}
      </DialogContent>
      <DialogActions className={classes.footer}>
        <Button onClick={onClose} color="primary">
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default QuestionAdminDialog;
