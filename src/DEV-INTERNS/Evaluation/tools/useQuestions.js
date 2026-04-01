import { useState } from "react";
import questionData from "../data/questions.json";

const QUESTIONS_STORAGE_KEY = "dev-interns-star-rating-questions";
const defaultQuestions = Array.isArray(questionData?.questions) ? questionData.questions : [];
const createUniqueQuestionId = () =>
  `question-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
const normalizeQuestionType = (type) =>
  type === "essay" || type === "paragraph" ? "paragraph" : "rating";

const normalizeSourceQuestionEntry = (question) => ({
  id: typeof question?.id === "string" ? question.id : createUniqueQuestionId(),
  label:
    typeof question?.question === "string"
      ? question.question
      : typeof question?.label === "string"
        ? question.label
        : "",
  helperText: typeof question?.helperText === "string" ? question.helperText : "",
  type: normalizeQuestionType(question?.type),
});

const normalizeQuestionEntry = (question) => ({
  id: typeof question?.id === "string" ? question.id : createUniqueQuestionId(),
  label: typeof question?.label === "string" ? question.label : "",
  helperText: typeof question?.helperText === "string" ? question.helperText : "",
  type: normalizeQuestionType(question?.type),
});

const cloneQuestions = (questions) =>
  questions.map((question) => ({
    id: typeof question?.id === "string" ? question.id : createUniqueQuestionId(),
    label:
      typeof question?.parent === "string"
        ? question.parent
        : typeof question?.label === "string"
          ? question.label
          : "",
    helperText: typeof question?.helperText === "string" ? question.helperText : "",
    subQuestions:
      Array.isArray(question?.questions) && question.questions.length > 0
        ? question.questions.map(normalizeSourceQuestionEntry)
        : Array.isArray(question?.subQuestions) && question.subQuestions.length > 0
          ? question.subQuestions.map(normalizeQuestionEntry)
        : [
            normalizeQuestionEntry({
              id:
                typeof question?.id === "string"
                  ? `${question.id}-item`
                  : createUniqueQuestionId(),
              label: question?.label,
              helperText: question?.helperText,
              type: question?.type,
            }),
          ],
  }));

const createQuestionPayload = (questions) => ({
  questions: questions.map((question) => ({
    id: question.id,
    parent: question.label,
    questions: (question.subQuestions || []).map((subQuestion) => ({
      id: subQuestion.id,
      question: subQuestion.label,
      type: normalizeQuestionType(subQuestion.type),
    })),
  })),
});

const isValidQuestionSet = (questions) =>
  Array.isArray(questions) &&
  questions.every(
    (question) =>
      question &&
      typeof question.id === "string" &&
      typeof question.label === "string" &&
      typeof question.helperText === "string" &&
      Array.isArray(question.subQuestions) &&
      question.subQuestions.every(
        (subQuestion) =>
          subQuestion &&
          typeof subQuestion.id === "string" &&
          typeof subQuestion.label === "string" &&
          typeof subQuestion.helperText === "string" &&
          (subQuestion.type === "essay" ||
            subQuestion.type === "paragraph" ||
            subQuestion.type === "rating" ||
            typeof subQuestion.type === "undefined")
      )
  );

const isValidStoredQuestionPayload = (payload) =>
  payload &&
  typeof payload === "object" &&
  isValidQuestionSet(payload.questions);

const getStoredQuestions = () => {
  if (typeof window === "undefined") {
    return cloneQuestions(defaultQuestions);
  }

  try {
    const storedValue = window.localStorage.getItem(QUESTIONS_STORAGE_KEY);

    if (!storedValue) {
      return cloneQuestions(defaultQuestions);
    }

    const parsedValue = JSON.parse(storedValue);
    if (isValidStoredQuestionPayload(parsedValue)) {
      return parsedValue.questions.length > 0
        ? cloneQuestions(parsedValue.questions)
        : cloneQuestions(defaultQuestions);
    }

    return isValidQuestionSet(parsedValue)
      ? parsedValue.length > 0
        ? cloneQuestions(parsedValue)
        : cloneQuestions(defaultQuestions)
      : cloneQuestions(defaultQuestions);
  } catch (error) {
    return cloneQuestions(defaultQuestions);
  }
};

export default function useQuestions() {
  const [questions, setQuestions] = useState(getStoredQuestions);

  const persistQuestions = (nextQuestions) => {
    if (typeof window === "undefined") {
      return;
    }

    window.localStorage.setItem(
      QUESTIONS_STORAGE_KEY,
      JSON.stringify(createQuestionPayload(nextQuestions))
    );
  };

  const addQuestion = () => {
    setQuestions((currentQuestions) => {
      const nextQuestions = [
        ...currentQuestions,
        {
          id: createUniqueQuestionId(),
          label: "",
          helperText: "Group related questions in this category.",
          subQuestions: [],
        },
      ];
      persistQuestions(nextQuestions);
      return nextQuestions;
    });
  };

  const updateQuestion = (questionId, field, value) => {
    setQuestions((currentQuestions) => {
      const nextQuestions = currentQuestions.map((question) =>
        question.id === questionId
          ? {
              ...question,
              [field]: value,
            }
          : question
      );
      persistQuestions(nextQuestions);
      return nextQuestions;
    });
  };

  const removeQuestion = (questionId) => {
    setQuestions((currentQuestions) => {
      const nextQuestions = currentQuestions.filter((question) => question.id !== questionId);
      persistQuestions(nextQuestions);
      return nextQuestions;
    });
  };

  const addSubQuestion = (questionId) => {
    const nextSubQuestionId = createUniqueQuestionId();

    setQuestions((currentQuestions) => {
      const nextQuestions = currentQuestions.map((question) =>
        question.id === questionId
          ? {
              ...question,
              subQuestions: [
                ...(question.subQuestions || []),
                {
                  id: nextSubQuestionId,
                  label: "",
                  helperText: "",
                  type: "rating",
                },
              ],
            }
          : question
      );
      persistQuestions(nextQuestions);
      return nextQuestions;
    });

    return nextSubQuestionId;
  };

  const updateSubQuestion = (questionId, subQuestionId, field, value) => {
    setQuestions((currentQuestions) => {
      const nextQuestions = currentQuestions.map((question) =>
        question.id === questionId
          ? {
              ...question,
              subQuestions: (question.subQuestions || []).map((subQuestion) =>
                subQuestion.id === subQuestionId
                  ? {
                      ...subQuestion,
                      [field]:
                        field === "type" ? normalizeQuestionType(value) : value,
                    }
                  : subQuestion
              ),
            }
          : question
      );
      persistQuestions(nextQuestions);
      return nextQuestions;
    });
  };

  const removeSubQuestion = (questionId, subQuestionId) => {
    setQuestions((currentQuestions) => {
      const nextQuestions = currentQuestions.map((question) =>
        question.id === questionId
          ? {
              ...question,
              subQuestions: (question.subQuestions || []).filter(
                (subQuestion) => subQuestion.id !== subQuestionId
                ),
            }
          : question
      );
      persistQuestions(nextQuestions);
      return nextQuestions;
    });
  };

  const resetQuestions = () => {
    const nextQuestions = cloneQuestions(defaultQuestions);
    persistQuestions(nextQuestions);
    setQuestions(nextQuestions);
  };

  return {
    questions,
    addQuestion,
    updateQuestion,
    removeQuestion,
    addSubQuestion,
    updateSubQuestion,
    removeSubQuestion,
    resetQuestions,
  };
}
