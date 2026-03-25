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
  section: {
    marginBottom: theme.spacing(3),
    padding: theme.spacing(2),
    borderRadius: 18,
    border: "1px solid rgba(148, 163, 184, 0.22)",
    backgroundColor: "#ffffff",
  },
  sectionTitle: {
    fontWeight: 700,
    color: "#0f172a",
    marginBottom: theme.spacing(0.75),
  },
  sectionText: {
    color: "#64748b",
    marginBottom: theme.spacing(2),
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
  stack: {
    display: "grid",
    gap: theme.spacing(2),
  },
  row: {
    display: "grid",
    gap: theme.spacing(2),
    gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
    [theme.breakpoints.down("xs")]: {
      gridTemplateColumns: "1fr",
    },
  },
  itemCard: {
    padding: theme.spacing(2),
    borderRadius: 16,
    border: "1px solid rgba(148, 163, 184, 0.22)",
    backgroundColor: "#f8fafc",
  },
  subQuestionCard: {
    padding: theme.spacing(1.5),
    borderRadius: 14,
    border: "1px solid rgba(148, 163, 184, 0.18)",
    backgroundColor: "#ffffff",
  },
  subQuestionStack: {
    display: "grid",
    gap: theme.spacing(1.5),
    marginTop: theme.spacing(1.5),
  },
  itemHeader: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: theme.spacing(1.5),
  },
  itemTitle: {
    fontWeight: 600,
    color: "#0f172a",
  },
  emptyState: {
    padding: theme.spacing(2),
    borderRadius: 16,
    border: "1px dashed rgba(148, 163, 184, 0.4)",
    backgroundColor: "#f8fafc",
    color: "#64748b",
    textAlign: "center",
  },
  footer: {
    padding: theme.spacing(2, 3, 3),
  },
}));

function QuestionAdminDialog({
  open,
  questions,
  activeGroup,
  onClose,
  onAddQuestion,
  onUpdateQuestion,
  onRemoveQuestion,
  onResetQuestions,
  onAddSubQuestion,
  onUpdateSubQuestion,
  onRemoveSubQuestion,
  onAddGroup,
  onUpdateGroup,
  onRemoveGroup,
  onResetGroups,
  onAddCategory,
  onUpdateCategory,
  onRemoveCategory,
}) {
  const classes = useStyles();
  const itemLabelSingular = activeGroup?.itemLabelSingular || "Item";
  const itemLabelPlural = activeGroup?.itemLabelPlural || "Items";

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="md"
      classes={{ paper: classes.paper }}
    >
      <DialogTitle>Setup Panel</DialogTitle>
      <DialogContent className={classes.content}>
        <Typography variant="body2" className={classes.intro}>
          Create a rating setup.
        </Typography>

        <Box className={classes.section}>
          <Typography variant="h6" className={classes.sectionTitle}>
            Rating setup
          </Typography>
          <Typography variant="body2" className={classes.sectionText}>
            Define the current rating set, what kind of thing is being rated, and the
            entries that should appear on the page.
          </Typography>

          <Box className={classes.toolbar}>
            <Button
              variant="contained"
              color="primary"
              startIcon={<AddIcon />}
              onClick={onAddGroup}
              className={classes.actionButton}
            >
              Add rating setup
            </Button>
            <Button
              variant="outlined"
              color="default"
              startIcon={<ReplayIcon />}
              onClick={onResetGroups}
              className={classes.actionButton}
            >
              Reset default setups
            </Button>
          </Box>

          {activeGroup ? (
            <Box className={classes.stack}>
              <TextField
                label="Setup title"
                variant="outlined"
                fullWidth
                value={activeGroup.label}
                onChange={(event) =>
                  onUpdateGroup(activeGroup.id, "label", event.target.value)
                }
              />
              <TextField
                label="Setup description"
                variant="outlined"
                fullWidth
                multiline
                rows={2}
                value={activeGroup.description}
                onChange={(event) =>
                  onUpdateGroup(activeGroup.id, "description", event.target.value)
                }
              />
              <Box className={classes.row}>
                <TextField
                  label="Single item label"
                  variant="outlined"
                  value={activeGroup.itemLabelSingular}
                  placeholder="Product"
                  onChange={(event) =>
                    onUpdateGroup(activeGroup.id, "itemLabelSingular", event.target.value)
                  }
                />
                <TextField
                  label="Plural item label"
                  variant="outlined"
                  value={activeGroup.itemLabelPlural}
                  placeholder="Products"
                  onChange={(event) =>
                    onUpdateGroup(activeGroup.id, "itemLabelPlural", event.target.value)
                  }
                />
              </Box>

              <Box className={classes.toolbar}>
                <Button
                  variant="contained"
                  color="primary"
                  startIcon={<AddIcon />}
                  onClick={() => onAddCategory(activeGroup.id)}
                  className={classes.actionButton}
                >
                  Add {itemLabelSingular.toLowerCase()}
                </Button>
                <Button
                  variant="outlined"
                  color="secondary"
                  startIcon={<DeleteOutlineIcon />}
                  onClick={() => onRemoveGroup(activeGroup.id)}
                  className={classes.actionButton}
                >
                  Delete this setup
                </Button>
              </Box>

              {activeGroup.categories.length === 0 ? (
                <Box className={classes.emptyState}>
                  <Typography variant="body2">
                    No {itemLabelPlural.toLowerCase()} yet. Add one to make this setup ready.
                  </Typography>
                </Box>
              ) : (
                activeGroup.categories.map((category, index) => (
                  <Box key={category.id} className={classes.itemCard}>
                    <Box className={classes.itemHeader}>
                      <Typography variant="subtitle1" className={classes.itemTitle}>
                        {itemLabelSingular} {index + 1}
                      </Typography>
                      <IconButton
                        onClick={() => onRemoveCategory(activeGroup.id, category.id)}
                        aria-label={`Delete ${itemLabelSingular.toLowerCase()} ${index + 1}`}
                      >
                        <DeleteOutlineIcon />
                      </IconButton>
                    </Box>
                    <TextField
                      label={`${itemLabelSingular} name`}
                      variant="outlined"
                      fullWidth
                      value={category.name}
                      placeholder={`Enter the ${itemLabelSingular.toLowerCase()} name`}
                      onChange={(event) =>
                        onUpdateCategory(activeGroup.id, category.id, event.target.value)
                      }
                    />
                  </Box>
                ))
              )}
            </Box>
          ) : (
            <Box className={classes.emptyState}>
              <Typography variant="body2">
                No rating setup is available. Add one to begin configuring ratings.
              </Typography>
            </Box>
          )}
        </Box>

        <Box className={classes.section}>
          <Typography variant="h6" className={classes.sectionTitle}>
            Rating questions
          </Typography>
          <Typography variant="body2" className={classes.sectionText}>
            These questions are reused whenever someone evaluates an item in the current
            system.
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
              <Box key={question.id} className={classes.itemCard}>
                <Box className={classes.itemHeader}>
                  <Typography variant="subtitle1" className={classes.itemTitle}>
                    Question {index + 1}
                  </Typography>
                  <IconButton
                    onClick={() => onRemoveQuestion(question.id)}
                    aria-label={`Delete question ${index + 1}`}
                  >
                    <DeleteOutlineIcon />
                  </IconButton>
                </Box>

                <Box className={classes.stack}>
                  <TextField
                    label="Question title"
                    variant="outlined"
                    fullWidth
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

                  <Box className={classes.toolbar}>
                    <Button
                      variant="outlined"
                      color="primary"
                      startIcon={<AddIcon />}
                      onClick={() => onAddSubQuestion(question.id)}
                      className={classes.actionButton}
                    >
                      Add sub-question
                    </Button>
                  </Box>

                  {(question.subQuestions || []).length > 0 ? (
                    <Box className={classes.subQuestionStack}>
                      {question.subQuestions.map((subQuestion, subIndex) => (
                        <Box key={subQuestion.id} className={classes.subQuestionCard}>
                          <Box className={classes.itemHeader}>
                            <Typography variant="body1" className={classes.itemTitle}>
                              Sub-question {index + 1}.{subIndex + 1}
                            </Typography>
                            <IconButton
                              onClick={() =>
                                onRemoveSubQuestion(question.id, subQuestion.id)
                              }
                              aria-label={`Delete sub-question ${subIndex + 1}`}
                            >
                              <DeleteOutlineIcon />
                            </IconButton>
                          </Box>

                          <Box className={classes.stack}>
                            <TextField
                              label="Sub-question title"
                              variant="outlined"
                              fullWidth
                              value={subQuestion.label}
                              placeholder="Enter the sub-question title"
                              onChange={(event) =>
                                onUpdateSubQuestion(
                                  question.id,
                                  subQuestion.id,
                                  "label",
                                  event.target.value
                                )
                              }
                            />
                            <TextField
                              label="Sub-question helper text"
                              variant="outlined"
                              fullWidth
                              multiline
                              rows={2}
                              value={subQuestion.helperText}
                              placeholder="Add guidance for how this sub-question should be rated"
                              onChange={(event) =>
                                onUpdateSubQuestion(
                                  question.id,
                                  subQuestion.id,
                                  "helperText",
                                  event.target.value
                                )
                              }
                            />
                          </Box>
                        </Box>
                      ))}
                    </Box>
                  ) : null}
                </Box>
              </Box>
            ))
          )}
        </Box>
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
