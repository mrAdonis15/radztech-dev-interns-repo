import { SelectTemplate } from "./endpoints";

const templateRequestCache = new Map();

const createUniqueId = (prefix) =>
  `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

const sanitizeId = (value, fallbackPrefix) => {
  const normalizedValue = String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  return normalizedValue || createUniqueId(fallbackPrefix);
};

const createRequestHeaders = (token) => {
  const headers = {
    "Content-Type": "application/json",
  };

  if (token) {
    headers["x-access-tokens"] = token;
  }

  return headers;
};

const normalizeTemplateQuestion = (question, index) => {
  const label =
    typeof question?.question === "string"
      ? question.question.trim()
      : typeof question?.label === "string"
        ? question.label.trim()
        : "";

  if (!label) {
    return null;
  }

  return {
    id: String(question?.id ?? `${index + 1}`),
    label,
    helperText: "",
    type: "rating",
  };
};

export const normalizeTemplateQuestions = (template) => {
  const values = template?.settings?.kvs?.evaluation?.value;
  if (!Array.isArray(values)) {
    return [];
  }

  const groupedQuestions = new Map();

  values.forEach((entry, index) => {
    const normalizedQuestion = normalizeTemplateQuestion(entry, index);
    if (!normalizedQuestion) {
      return;
    }

    const area =
      typeof entry?.area === "string" && entry.area.trim() ? entry.area.trim() : "General";
    const groupId = sanitizeId(area, `template-group-${index + 1}`);

    if (!groupedQuestions.has(groupId)) {
      groupedQuestions.set(groupId, {
        id: groupId,
        label: area,
        helperText: "",
        subQuestions: [],
      });
    }

    groupedQuestions.get(groupId).subQuestions.push(normalizedQuestion);
  });

  return Array.from(groupedQuestions.values());
};

const normalizeTemplate = (template, index) => ({
  id: String(template?.id ?? `${index + 1}`),
  name:
    typeof template?.name === "string" && template.name.trim()
      ? template.name.trim()
      : `Template ${index + 1}`,
  active: template?.active !== false,
  sort: typeof template?.sort === "string" ? template.sort : "",
  rawTemplate: template,
  questions: normalizeTemplateQuestions(template),
});

const extractTemplateItems = (payload) => {
  if (Array.isArray(payload)) {
    return payload;
  }

  if (!payload || typeof payload !== "object") {
    return [];
  }

  return Array.isArray(payload.items) ? payload.items : [];
};

export const requestEvaluationTemplates = (token) => {
  const cacheKey = token || "__anonymous__";

  if (!templateRequestCache.has(cacheKey)) {
    templateRequestCache.set(
      cacheKey,
      fetch(SelectTemplate, {
        method: "GET",
        headers: createRequestHeaders(token),
      })
        .then((response) => (response.ok ? response.json() : null))
        .then((payload) => extractTemplateItems(payload).map(normalizeTemplate))
        .catch(() => [])
    );
  }

  return templateRequestCache.get(cacheKey);
};
