import { useEffect, useState } from "react";
import questionData from "../data/questions.json";

const STORAGE_KEY = "dev-interns-star-rating-questions";
const defaultQuestions = Array.isArray(questionData?.questions) ? questionData.questions : [];

const createQuestionPayload = (questions) => ({
  questions: cloneQuestions(questions),
});

const cloneQuestions = (questions) =>
  questions.map((question) => ({
    ...question,
    subQuestions: Array.isArray(question.subQuestions)
      ? question.subQuestions.map((subQuestion) => ({ ...subQuestion }))
      : [],
  }));
const createUniqueQuestionId = () =>
  `question-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

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
          typeof subQuestion.helperText === "string"
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
    const storedValue = window.localStorage.getItem(STORAGE_KEY);

    if (!storedValue) {
      return cloneQuestions(defaultQuestions);
    }

    const parsedValue = JSON.parse(storedValue);
    if (isValidStoredQuestionPayload(parsedValue)) {
      return cloneQuestions(parsedValue.questions);
    }

    return isValidQuestionSet(parsedValue)
      ? cloneQuestions(parsedValue)
      : cloneQuestions(defaultQuestions);
  } catch (error) {
    return cloneQuestions(defaultQuestions);
  }
};

export default function useEvaluationQuestions() {
  const [questions, setQuestions] = useState(getStoredQuestions);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(createQuestionPayload(questions)));
  }, [questions]);

  const addQuestion = () => {
    setQuestions((currentQuestions) => [
      ...currentQuestions,
      {
        id: createUniqueQuestionId(),
        label: "",
        helperText: "",
        subQuestions: [],
      },
    ]);
  };

  const updateQuestion = (questionId, field, value) => {
    setQuestions((currentQuestions) =>
      currentQuestions.map((question) =>
        question.id === questionId
          ? {
              ...question,
              [field]: value,
            }
          : question
      )
    );
  };

  const removeQuestion = (questionId) => {
    setQuestions((currentQuestions) =>
      currentQuestions.filter((question) => question.id !== questionId)
    );
  };

  const addSubQuestion = (questionId) => {
    setQuestions((currentQuestions) =>
      currentQuestions.map((question) =>
        question.id === questionId
          ? {
              ...question,
              subQuestions: [
                ...(question.subQuestions || []),
                {
                  id: createUniqueQuestionId(),
                  label: "",
                  helperText: "",
                },
              ],
            }
          : question
      )
    );
  };

  const updateSubQuestion = (questionId, subQuestionId, field, value) => {
    setQuestions((currentQuestions) =>
      currentQuestions.map((question) =>
        question.id === questionId
          ? {
              ...question,
              subQuestions: (question.subQuestions || []).map((subQuestion) =>
                subQuestion.id === subQuestionId
                  ? {
                      ...subQuestion,
                      [field]: value,
                    }
                  : subQuestion
              ),
            }
          : question
      )
    );
  };

  const removeSubQuestion = (questionId, subQuestionId) => {
    setQuestions((currentQuestions) =>
      currentQuestions.map((question) =>
        question.id === questionId
          ? {
              ...question,
              subQuestions: (question.subQuestions || []).filter(
                (subQuestion) => subQuestion.id !== subQuestionId
              ),
            }
          : question
      )
    );
  };

  const resetQuestions = () => {
    setQuestions(cloneQuestions(defaultQuestions));
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
