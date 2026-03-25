import { useEffect, useState } from "react";
import defaultQuestions from "../data/questions";

const STORAGE_KEY = "dev-interns-star-rating-questions";

const cloneQuestions = (questions) => questions.map((question) => ({ ...question }));
const createUniqueQuestionId = () =>
  `question-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

const isValidQuestionSet = (questions) =>
  Array.isArray(questions) &&
  questions.every(
    (question) =>
      question &&
      typeof question.id === "string" &&
      typeof question.label === "string" &&
      typeof question.helperText === "string"
  );

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

    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(questions));
  }, [questions]);

  const addQuestion = () => {
    setQuestions((currentQuestions) => [
      ...currentQuestions,
      {
        id: createUniqueQuestionId(),
        label: "",
        helperText: "",
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

  const resetQuestions = () => {
    setQuestions(cloneQuestions(defaultQuestions));
  };

  return {
    questions,
    addQuestion,
    updateQuestion,
    removeQuestion,
    resetQuestions,
  };
}
