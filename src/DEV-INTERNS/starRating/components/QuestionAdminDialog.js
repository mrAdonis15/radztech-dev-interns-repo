import React, { useMemo, useState } from "react";
import {
  Box,
  Button,
  ClickAwayListener,
  IconButton,
  TextField,
  Tooltip,
  makeStyles,
  Typography,
} from "@material-ui/core";
import AddCircleOutlineIcon from "@material-ui/icons/AddCircleOutline";
import DeleteOutlineIcon from "@material-ui/icons/DeleteOutline";
import PlaylistAddIcon from "@material-ui/icons/PlaylistAdd";
import ReplayIcon from "@material-ui/icons/Replay";

const isParagraphType = (type) => type !== "rating";

const useStyles = makeStyles((theme) => ({
  paper: {
    borderRadius: 20,
    overflow: "hidden",
    backgroundColor: "#f8fafc",
    fontFamily: '"Poppins", sans-serif',
  },
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
    padding: theme.spacing(2, 2, 0),
  },
  title: {
    fontWeight: 700,
    color: "#0f172a",
    marginBottom: theme.spacing(1),
    fontFamily: '"Poppins", sans-serif',
  },
  intro: {
    marginBottom: theme.spacing(2.5),
    color: "#64748b",
    lineHeight: 1.6,
  },
  panelBody: {
    padding: theme.spacing(0, 2, 2),
    backgroundColor: "#ffffff",
  },
  toolbar: {
    display: "flex",
    justifyContent: "flex-start",
    alignItems: "center",
    flexWrap: "wrap",
    gap: theme.spacing(2),
  },
  actionButton: {
    borderRadius: 999,
    textTransform: "none",
    fontWeight: 600,
    boxShadow: "none",
  },
  canvas: {
    marginTop: theme.spacing(2.5),
  },
  categoryRow: {
    position: "relative",
    marginBottom: theme.spacing(2),
    paddingRight: 88,
    [theme.breakpoints.down("xs")]: {
      paddingRight: 0,
      paddingBottom: 56,
    },
  },
  itemCard: {
    padding: theme.spacing(2),
    borderRadius: 4,
    border: "1px solid #d7dce1",
    backgroundColor: "#ffffff",
    boxShadow: "0 1px 2px rgba(15, 23, 42, 0.04)",
    width: "100%",
    boxSizing: "border-box",
  },
  itemHeader: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: theme.spacing(1),
    marginBottom: theme.spacing(1),
  },
  categoryHeaderButton: {
    flex: 1,
    minHeight: 56,
    boxSizing: "border-box",
    borderRadius: 14,
    border: "1px solid rgba(148, 163, 184, 0.18)",
    backgroundColor: "#ffffff",
    display: "flex",
    alignItems: "center",
    padding: theme.spacing(0, 2),
    color: "#0f172a",
    fontSize: 18,
    fontWeight: 700,
    cursor: "pointer",
    transition: "border-color 0.18s ease, box-shadow 0.18s ease",
    "&:hover": {
      borderColor: "rgba(249, 115, 22, 0.45)",
      boxShadow: "0 8px 24px rgba(15, 23, 42, 0.06)",
    },
  },
  categoryHeaderField: {
    flex: 1,
    "& .MuiOutlinedInput-root": {
      minHeight: 56,
      backgroundColor: "#ffffff",
      borderRadius: 14,
      fontWeight: 700,
      alignItems: "center",
    },
    "& .MuiOutlinedInput-input": {
      fontSize: 18,
      fontWeight: 700,
      color: "#0f172a",
      paddingTop: 16,
      paddingBottom: 16,
      boxSizing: "border-box",
    },
  },
  stack: {
    display: "grid",
    gap: theme.spacing(2),
  },
  subQuestionStack: {
    display: "grid",
    gap: theme.spacing(1.5),
    marginTop: theme.spacing(1),
  },
  subQuestionCard: {
    padding: theme.spacing(1.5, 1.75),
    borderRadius: 14,
    border: "1px solid rgba(148, 163, 184, 0.18)",
    backgroundColor: "#ffffff",
    cursor: "pointer",
    transition: "border-color 0.18s ease, box-shadow 0.18s ease, transform 0.18s ease",
    "&:hover": {
      borderColor: "rgba(249, 115, 22, 0.45)",
      boxShadow: "0 8px 24px rgba(15, 23, 42, 0.08)",
      transform: "translateY(-1px)",
    },
  },
  subQuestionEditingCard: {
    borderColor: "rgba(249, 115, 22, 0.45)",
    boxShadow: "0 8px 24px rgba(15, 23, 42, 0.08)",
  },
  questionCardHeader: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: theme.spacing(1),
    marginBottom: theme.spacing(1),
  },
  questionLabel: {
    fontWeight: 600,
    color: "#0f172a",
  },
  questionType: {
    color: "#64748b",
    fontSize: 13,
  },
  questionMeta: {
    display: "flex",
    alignItems: "center",
    gap: theme.spacing(1),
    color: "#64748b",
    fontSize: 13,
  },
  questionEditorRow: {
    display: "grid",
    gridTemplateColumns: "minmax(0, 1fr) 180px auto",
    gap: theme.spacing(1.5),
    alignItems: "start",
    [theme.breakpoints.down("xs")]: {
      gridTemplateColumns: "1fr",
    },
  },
  questionEditorField: {
    "& .MuiOutlinedInput-root": {
      borderRadius: 12,
      backgroundColor: "#ffffff",
    },
  },
  questionTypeField: {
    "& .MuiOutlinedInput-root": {
      borderRadius: 12,
      backgroundColor: "#ffffff",
    },
  },
  iconButtonRow: {
    display: "flex",
    alignItems: "center",
    gap: theme.spacing(0.5),
  },
  railSlot: {
    position: "absolute",
    top: 0,
    right: 0,
    display: "flex",
    justifyContent: "center",
    [theme.breakpoints.down("xs")]: {
      top: "auto",
      right: 0,
      bottom: 0,
    },
  },
  sideRail: {
    width: 64,
    minWidth: 64,
    flex: "0 0 64px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    gap: theme.spacing(1),
    padding: 0,
    boxSizing: "border-box",
    alignSelf: "start",
  },
  sideRailButton: {
    width: 42,
    minWidth: 42,
    height: 42,
    minHeight: 42,
    flex: "0 0 42px",
    borderRadius: 12,
    border: "1px solid rgba(148, 163, 184, 0.18)",
    color: "#475569",
    backgroundColor: "#ffffff",
    "&:hover": {
      backgroundColor: "#fff7ed",
      color: "#ea580c",
    },
  },
  emptyState: {
    padding: theme.spacing(2.5),
    borderRadius: 16,
    border: "1px dashed rgba(148, 163, 184, 0.4)",
    backgroundColor: "#f8fafc",
    color: "#64748b",
    textAlign: "center",
  },
}));

function QuestionAdminDialog({
  questions,
  onSaveJson,
  onAddQuestion,
  onUpdateQuestion,
  onRemoveQuestion,
  onResetQuestions,
  onAddSubQuestion,
  onUpdateSubQuestion,
  onRemoveSubQuestion,
}) {
  const classes = useStyles();
  const [editingCategoryId, setEditingCategoryId] = useState("");
  const [editingSubQuestion, setEditingSubQuestion] = useState({
    categoryId: "",
    questionId: "",
  });
  const [activeRailCategoryId, setActiveRailCategoryId] = useState("");
  const resolvedActiveRailCategoryId = useMemo(() => {
    if (!questions.length) {
      return "";
    }

    return questions.some((question) => question.id === activeRailCategoryId)
      ? activeRailCategoryId
      : questions[questions.length - 1].id;
  }, [questions, activeRailCategoryId]);

  const handleStartQuestionEdit = (categoryId, questionId) => {
    setEditingSubQuestion({
      categoryId,
      questionId,
    });
  };

  const handleStopQuestionEdit = () => {
    setEditingSubQuestion({
      categoryId: "",
      questionId: "",
    });
  };

  const handleStartCategoryEdit = (categoryId) => {
    setEditingCategoryId(categoryId);
  };

  const handleStopCategoryEdit = () => {
    setEditingCategoryId("");
  };

  const handleAddQuestion = (categoryId) => {
    const newQuestionId = onAddSubQuestion(categoryId);
    if (newQuestionId) {
      handleStartQuestionEdit(categoryId, newQuestionId);
    }
  };

  return (
    <>
      <Box className={classes.canvas}>
        {questions.length === 0 ? (
          <Box className={classes.emptyState}>
            <Typography variant="body2">
              No categories yet. Click the add category button to create one.
            </Typography>
          </Box>
        ) : (
          <>
            {questions.map((question, index) => {
              const isActiveRailCategory = resolvedActiveRailCategoryId === question.id;

              return (
                <Box key={question.id} className={classes.categoryRow}>
                  <Box
                    className={classes.itemCard}
                    onClick={() => setActiveRailCategoryId(question.id)}
                  >
                    <Box className={classes.itemHeader}>
                      {editingCategoryId === question.id ? (
                        <TextField
                          variant="outlined"
                          fullWidth
                          autoFocus
                          className={classes.categoryHeaderField}
                          value={question.label}
                          placeholder="Category"
                          onChange={(event) =>
                            onUpdateQuestion(question.id, "label", event.target.value)
                          }
                          onBlur={handleStopCategoryEdit}
                          onKeyDown={(event) => {
                            if (event.key === "Enter" || event.key === "Escape") {
                              handleStopCategoryEdit();
                            }
                          }}
                        />
                      ) : (
                        <Box
                          className={classes.categoryHeaderButton}
                          onDoubleClick={() => handleStartCategoryEdit(question.id)}
                          role="button"
                          tabIndex={0}
                          onKeyDown={(event) => {
                            if (event.key === "Enter" || event.key === " ") {
                              handleStartCategoryEdit(question.id);
                            }
                          }}
                          aria-label="Edit category"
                        >
                          {question.label || "Category"}
                        </Box>
                      )}
                      <IconButton
                        onClick={() => onRemoveQuestion(question.id)}
                        aria-label="Delete category"
                      >
                        <DeleteOutlineIcon />
                      </IconButton>
                    </Box>

                    <Box className={classes.stack}>
                        {(question.subQuestions || []).length > 0 ? (
                          <Box className={classes.subQuestionStack}>
                            {question.subQuestions.map((subQuestion) => (
                              <Box
                                key={subQuestion.id}
                                className={`${classes.subQuestionCard} ${
                                  editingSubQuestion.categoryId === question.id &&
                                  editingSubQuestion.questionId === subQuestion.id
                                    ? classes.subQuestionEditingCard
                                    : ""
                                }`}
                                onDoubleClick={() =>
                                  handleStartQuestionEdit(question.id, subQuestion.id)
                                }
                                role="button"
                                tabIndex={0}
                                onKeyDown={(event) => {
                                  if (event.key === "Enter" || event.key === " ") {
                                    handleStartQuestionEdit(question.id, subQuestion.id);
                                  }
                                }}
                              >
                                {editingSubQuestion.categoryId === question.id &&
                                editingSubQuestion.questionId === subQuestion.id ? (
                                  <ClickAwayListener onClickAway={handleStopQuestionEdit}>
                                    <Box className={classes.questionEditorRow}>
                                      <TextField
                                        variant="outlined"
                                        fullWidth
                                        autoFocus
                                        placeholder="Question"
                                        value={subQuestion.label || ""}
                                        className={classes.questionEditorField}
                                        onChange={(event) =>
                                          onUpdateSubQuestion(
                                            question.id,
                                            subQuestion.id,
                                            "label",
                                            event.target.value
                                          )
                                        }
                                        onKeyDown={(event) => {
                                          if (event.key === "Enter" || event.key === "Escape") {
                                            handleStopQuestionEdit();
                                          }
                                        }}
                                      />
                                      <TextField
                                        select
                                        variant="outlined"
                                        value={subQuestion.type || "rating"}
                                        className={classes.questionTypeField}
                                        SelectProps={{
                                          native: true,
                                        }}
                                        onChange={(event) =>
                                          onUpdateSubQuestion(
                                            question.id,
                                            subQuestion.id,
                                            "type",
                                            event.target.value
                                          )
                                        }
                                      >
                                        <option value="rating">Rate</option>
                                        <option value="paragraph">Paragraph</option>
                                      </TextField>
                                      <Box className={classes.iconButtonRow}>
                                        <IconButton
                                          onMouseDown={(event) => event.preventDefault()}
                                          onClick={() =>
                                            onRemoveSubQuestion(question.id, subQuestion.id)
                                          }
                                          aria-label="Delete question"
                                        >
                                          <DeleteOutlineIcon />
                                        </IconButton>
                                      </Box>
                                    </Box>
                                  </ClickAwayListener>
                                ) : (
                                  <>
                                    <Box className={classes.questionCardHeader}>
                                      <Box>
                                        <Typography className={classes.questionLabel}>
                                          {subQuestion.label || "Question"}
                                        </Typography>
                                        <Typography className={classes.questionType}>
                                          {isParagraphType(subQuestion.type) ? "Paragraph" : "Rate"}
                                        </Typography>
                                      </Box>
                                      <Box className={classes.iconButtonRow}>
                                        <IconButton
                                          onClick={(event) => {
                                            event.stopPropagation();
                                            onRemoveSubQuestion(question.id, subQuestion.id);
                                          }}
                                          aria-label="Delete question"
                                        >
                                          <DeleteOutlineIcon />
                                        </IconButton>
                                      </Box>
                                    </Box>

                                    <Box className={classes.questionMeta}></Box>
                                  </>
                                )}
                              </Box>
                            ))}
                          </Box>
                        ) : null}
                    </Box>
                  </Box>

                  <Box className={classes.railSlot}>
                    {isActiveRailCategory ? (
                      <Box className={classes.sideRail}>
                        <Tooltip title="Add category" placement="left" arrow>
                          <IconButton
                            className={classes.sideRailButton}
                            onClick={onAddQuestion}
                            aria-label="Add category"
                          >
                            <AddCircleOutlineIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Add question" placement="left" arrow>
                          <IconButton
                            className={classes.sideRailButton}
                            onClick={() => handleAddQuestion(question.id)}
                            aria-label="Add question"
                          >
                            <PlaylistAddIcon />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    ) : null}
                  </Box>
                </Box>
              );
            })}
          </>
        )}
      </Box>

    </>
  );
}

export default QuestionAdminDialog;
