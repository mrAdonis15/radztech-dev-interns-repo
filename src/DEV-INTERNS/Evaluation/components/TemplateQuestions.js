import React from "react";
import { Box, Divider, Paper, Typography, makeStyles } from "@material-ui/core";

const useStyles = makeStyles((theme) => ({
  panel: {
    borderRadius: 4,
    border: "1px solid #d7dce1",
    backgroundColor: "#ffffff",
    boxShadow: "0 1px 2px rgba(15, 23, 42, 0.04)",
    overflow: "hidden",
    marginTop: theme.spacing(2.5),
    fontFamily: '"Poppins", sans-serif',
  },
  panelHeader: {
    padding: theme.spacing(2, 2, 1.5),
    borderBottom: "1px solid #e5e7eb",
  },
  title: {
    fontWeight: 700,
    color: "#0f172a",
  },
  intro: {
    marginTop: theme.spacing(0.75),
    color: "#64748b",
    lineHeight: 1.6,
  },
  block: {
    padding: theme.spacing(2),
  },
  categoryTitle: {
    fontWeight: 700,
    color: "#111827",
    marginBottom: theme.spacing(1.25),
  },
  questionRow: {
    padding: theme.spacing(1.5),
    borderRadius: 4,
    border: "1px solid #e5e7eb",
    backgroundColor: "#f8fafc",
    "& + &": {
      marginTop: theme.spacing(1),
    },
  },
  questionLabel: {
    color: "#0f172a",
    fontWeight: 600,
  },
  questionMeta: {
    color: "#64748b",
    marginTop: theme.spacing(0.5),
  },
  emptyState: {
    padding: theme.spacing(4),
    textAlign: "center",
    color: "#64748b",
  },
}));

function TemplateQuestions({ questions, selectedTemplateName }) {
  const classes = useStyles();

  return (
    <Paper elevation={0} className={classes.panel}>
      <Box className={classes.panelHeader}>
        <Typography variant="h6" className={classes.title}>
          {selectedTemplateName ? `${selectedTemplateName} Questions` : "Questions"}
        </Typography>
        <Typography variant="body2" className={classes.intro}>
          The questions below are loaded from the selected evaluation template.
        </Typography>
      </Box>

      {questions.length === 0 ? (
        <Typography variant="body2" className={classes.emptyState}>
          Select a template to view its evaluation questions.
        </Typography>
      ) : (
        questions.map((questionCategory, index) => (
          <React.Fragment key={questionCategory.id}>
            <Box className={classes.block}>
              <Typography variant="subtitle1" className={classes.categoryTitle}>
                {questionCategory.label || `Category ${index + 1}`}
              </Typography>

              {(questionCategory.subQuestions || []).map((subQuestion, subIndex) => (
                <Box key={subQuestion.id} className={classes.questionRow}>
                  <Typography variant="body1" className={classes.questionLabel}>
                    {subIndex + 1}. {subQuestion.label || "Untitled question"}
                  </Typography>
                  <Typography variant="body2" className={classes.questionMeta}>
                    Rating question
                  </Typography>
                </Box>
              ))}
            </Box>
            {index < questions.length - 1 ? <Divider /> : null}
          </React.Fragment>
        ))
      )}
    </Paper>
  );
}

export default TemplateQuestions;
