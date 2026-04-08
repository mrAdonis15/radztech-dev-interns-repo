import React from "react";
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  makeStyles,
  Typography,
} from "@material-ui/core";

const useStyles = makeStyles((theme) => ({
  paper: {
    borderRadius: 20,
    fontFamily: '"Poppins", sans-serif',
  },
  intro: {
    marginBottom: theme.spacing(2),
    color: "#64748b",
  },
  metaRow: {
    display: "grid",
    gap: theme.spacing(1),
    marginBottom: theme.spacing(2),
    [theme.breakpoints.up("sm")]: {
      gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
    },
  },
  metaCard: {
    padding: theme.spacing(1.5),
    borderRadius: 14,
    border: "1px solid rgba(148, 163, 184, 0.2)",
    backgroundColor: "#f8fafc",
  },
  metaLabel: {
    fontSize: 12,
    fontWeight: 700,
    letterSpacing: "0.08em",
    textTransform: "uppercase",
    color: "#64748b",
    marginBottom: theme.spacing(0.5),
  },
  metaValue: {
    fontWeight: 600,
    color: "#0f172a",
  },
  codeBlock: {
    margin: 0,
    padding: theme.spacing(2),
    borderRadius: 16,
    overflowX: "auto",
    backgroundColor: "#ffffff",
    color: "#111827",
    fontSize: 13,
    lineHeight: 1.6,
    border: "1px solid #d7dce1",
    fontFamily: '"Poppins", sans-serif',
  },
  actions: {
    padding: theme.spacing(2, 3, 3),
    fontFamily: '"Poppins", sans-serif',
  },
}));

function ResultDialog({ open, category, onClose }) {
  const classes = useStyles();
  const evaluationResult = category?.evaluationResult || null;
  const jsonValue = evaluationResult ? JSON.stringify(evaluationResult, null, 2) : "";

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="md"
      classes={{ paper: classes.paper }}
    >
      <DialogTitle>{category ? `${category.name} ` : "JSON Result"}</DialogTitle>
      <DialogContent>
        {evaluationResult ? (
          <>

            <Box className={classes.metaRow}>
              <Box className={classes.metaCard}>
                <Typography className={classes.metaLabel}>Overall Rating</Typography>
                <Typography className={classes.metaValue}>
                  {evaluationResult.overallRating || 0} / 5
                </Typography>
              </Box>
              <Box className={classes.metaCard}>
                <Typography className={classes.metaLabel}>Answered</Typography>
                <Typography className={classes.metaValue}>
                  {evaluationResult.answeredQuestions || 0} /{" "}
                  {evaluationResult.totalQuestions || 0}
                </Typography>
              </Box>
              <Box className={classes.metaCard}>
                <Typography className={classes.metaLabel}>Submitted</Typography>
                <Typography className={classes.metaValue}>
                  {evaluationResult.submittedAt || "N/A"}
                </Typography>
              </Box>
            </Box>

            <pre className={classes.codeBlock}>{jsonValue}</pre>
          </>
        ) : (
          <Typography variant="body2" className={classes.intro}>
            No evaluation JSON is stored for this item yet.
          </Typography>
        )}
      </DialogContent>
      <DialogActions className={classes.actions}>
        <Button onClick={onClose} color="primary">
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default ResultDialog;
