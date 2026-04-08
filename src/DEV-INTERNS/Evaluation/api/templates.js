import { SelectTemplate as SELECT_TEMPLATE_ENDPOINT } from "./endpoints";

const templateRequestCache = new Map();

const createRequestHeaders = (token) => {
  const headers = {
    "Content-Type": "application/json",
  };

  if (token) {
    headers["x-access-tokens"] = token;
  }

  return headers;
};

const createTemplateQuestionId = (templateId, question, index) => {
  const keyCandidate =
    typeof question?.storeValueTo?.key === "string" && question.storeValueTo.key.trim()
      ? question.storeValueTo.key.trim()
      : typeof question?.id === "number" || typeof question?.id === "string"
        ? String(question.id)
        : `${index + 1}`;

  return `template-${templateId}-${keyCandidate}`;
};

const extractTemplates = (payload) => {
  if (Array.isArray(payload)) {
    return payload;
  }

  if (!payload || typeof payload !== "object") {
    return [];
  }

  const candidateKeys = ["data", "result", "results", "payload", "items", "templates"];

  for (const key of candidateKeys) {
    const nestedValue = payload[key];
    const extractedValue = extractTemplates(nestedValue);

    if (extractedValue.length > 0) {
      return extractedValue;
    }
  }

  return [];
};

const normalizeTemplateQuestions = (templateId, questions) => {
  if (!Array.isArray(questions)) {
    return [];
  }

  const groupedQuestions = questions.reduce((accumulator, question, index) => {
    const label =
      typeof question?.question === "string" ? question.question.trim() : "";

    if (!label) {
      return accumulator;
    }

    const area =
      typeof question?.area === "string" && question.area.trim()
        ? question.area.trim()
        : "General";

    if (!accumulator.has(area)) {
      accumulator.set(area, []);
    }

    accumulator.get(area).push({
      id: createTemplateQuestionId(templateId, question, index),
      label,
      helperText: "",
      type: "rating",
      sourceQuestionId:
        typeof question?.id === "number" || typeof question?.id === "string"
          ? String(question.id)
          : "",
      storeValueTo:
        question?.storeValueTo && typeof question.storeValueTo === "object"
          ? question.storeValueTo
          : null,
    });

    return accumulator;
  }, new Map());

  return Array.from(groupedQuestions.entries()).map(([area, areaQuestions], index) => ({
    id: `template-group-${templateId}-${index + 1}`,
    label: area,
    helperText: "",
    subQuestions: areaQuestions,
  }));
};

const normalizeTemplate = (template, index) => {
  const templateId =
    typeof template?.id === "string" || typeof template?.id === "number"
      ? String(template.id)
      : `template-${index + 1}`;
  const name = typeof template?.name === "string" ? template.name.trim() : "";
  const templateQuestions = normalizeTemplateQuestions(
    templateId,
    template?.settings?.kvs?.evaluation?.value
  );

  return {
    id: templateId,
    name: name || `Template ${index + 1}`,
    active: template?.active !== false,
    sort: typeof template?.sort === "string" ? template.sort : "",
    questions: templateQuestions,
    rawTemplate: template,
  };
};

export const requestTemplates = (token) => {
  const cacheKey = token || "__anonymous__";

  if (!templateRequestCache.has(cacheKey)) {
    templateRequestCache.set(
      cacheKey,
      fetch(SELECT_TEMPLATE_ENDPOINT, {
        method: "GET",
        headers: createRequestHeaders(token),
      })
        .then((response) => (response.ok ? response.json() : []))
        .then((payload) =>
          extractTemplates(payload)
            .map(normalizeTemplate)
            .filter((template) => template.active)
            .sort((leftTemplate, rightTemplate) =>
              leftTemplate.name.localeCompare(rightTemplate.name)
            )
        )
        .catch(() => [])
    );
  }

  return templateRequestCache.get(cacheKey);
};

export const createEmptyTemplateSelection = () => ({
  id: "no-template",
  name: "I don't want to use template",
  questions: [],
  rawTemplate: null,
});
