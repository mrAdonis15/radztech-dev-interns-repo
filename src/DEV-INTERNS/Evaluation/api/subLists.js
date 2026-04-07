import { ENDPOINT, SUB_LIST_KEYS } from "../api/endpoints";

const SUB_LIST_RESPONSE_KEY = "sub_list";

const REMOTE_GROUP_META = {
  [SUB_LIST_KEYS.interns]: {
    label: "Interns",
    description: "",
    itemLabelSingular: "Intern",
    itemLabelPlural: "Interns",
  },
  [SUB_LIST_KEYS.evaluators]: {
    label: "Evaluators",
    description: "",
    itemLabelSingular: "Evaluator",
    itemLabelPlural: "Evaluators",
  },
};

const SUB_LIST_REQUESTS = {
  [SUB_LIST_KEYS.interns]: {
    ixSubType: 206,
    q: "h",
    showInactive: false,
  },
  [SUB_LIST_KEYS.evaluators]: {
    ixSubType: 206,
    q: "h",
    showInactive: false,
  },
};

const subListRequestCache = new Map();

const createUniqueId = (prefix) =>
  `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

const createRatingItem = (id, name, details = {}) => ({
  id,
  name,
  averageRating: 0,
  totalRatings: 0,
  currentUserRating: 0,
  evaluationResult: null,
  code: details.code || "",
  subtitle: details.subtitle || "",
  location: details.location || "",
  rawItem: details.rawItem || null,
});

const sanitizeItemId = (value, fallbackPrefix) => {
  const normalizedValue = String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  return normalizedValue || createUniqueId(fallbackPrefix);
};

const getStringFromCandidateKeys = (item, candidateKeys) => {
  if (!item || typeof item !== "object") {
    return "";
  }

  for (const key of candidateKeys) {
    const candidateValue = item[key];
    if (typeof candidateValue === "string" && candidateValue.trim()) {
      return candidateValue.trim();
    }

    if (typeof candidateValue === "number" && Number.isFinite(candidateValue)) {
      return String(candidateValue);
    }
  }

  return "";
};

const getDisplayName = (item) => {
  if (typeof item === "string") {
    return item.trim();
  }

  return getStringFromCandidateKeys(item, [
    "sub_title",
    "sSub",
    "name",
    "label",
    "title",
    "fullName",
    "fullname",
    "displayName",
    "description",
    "value",
    "text",
  ]);
};

const getItemCode = (item) =>
  getStringFromCandidateKeys(item, [
    "sub_code",
    "code",
    "sCode",
    "employeeNo",
    "employeeNumber",
    "empNo",
    "idNo",
    "id",
    "ixSub",
  ]);

const getItemSubtitle = (item, groupId) =>
  getStringFromCandidateKeys(item, [
    "sub_type",
    "type",
    "designation",
    "position",
    "jobTitle",
    "title2",
    "role",
  ]) || (groupId === SUB_LIST_KEYS.evaluators ? "Employee" : "");

const getItemLocation = (item) =>
  getStringFromCandidateKeys(item, [
    "branch",
    "sBrch",
    "sBranch",
    "location",
    "branchName",
    "office",
    "address",
  ]);

const normalizeRemoteList = (groupId, values) => {
  if (!Array.isArray(values)) {
    return [];
  }

  const seenIds = new Set();
  const flattenedValues = values.flatMap((item) => (Array.isArray(item) ? item : [item]));

  return flattenedValues.reduce((items, item, index) => {
    const name = getDisplayName(item);

    if (!name) {
      return items;
    }

    const code = getItemCode(item);
    const id = sanitizeItemId(code || name, `${groupId}-${index + 1}`);

    if (seenIds.has(id)) {
      return items;
    }

    seenIds.add(id);
    items.push(
      createRatingItem(id, name, {
        code,
        subtitle: getItemSubtitle(item, groupId),
        location: getItemLocation(item),
        rawItem: item && typeof item === "object" ? item : null,
      })
    );
    return items;
  }, []).slice(0, 10);
};

const extractRemoteList = (payload) => {
  if (Array.isArray(payload)) {
    const nestedLists = payload
      .map((item) =>
        item && typeof item === "object" && Array.isArray(item[SUB_LIST_RESPONSE_KEY])
          ? item[SUB_LIST_RESPONSE_KEY]
          : null
      )
      .filter(Boolean);

    return nestedLists.length > 0 ? nestedLists.flat() : payload;
  }

  if (!payload || typeof payload !== "object") {
    return [];
  }

  if (Array.isArray(payload[SUB_LIST_RESPONSE_KEY])) {
    return payload[SUB_LIST_RESPONSE_KEY];
  }

  const nestedKeys = ["data", "result", "results", "payload", "items"];

  for (const key of nestedKeys) {
    const nestedValue = payload[key];
    const extractedNestedValue = extractRemoteList(nestedValue);

    if (extractedNestedValue.length > 0) {
      return extractedNestedValue;
    }
  }

  return [];
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

const createRequestCacheKey = (groupId, requestBody) => JSON.stringify({ groupId, requestBody });

export const requestSubListItems = (token, groupId) => {
  const requestBody = SUB_LIST_REQUESTS[groupId];
  if (!requestBody) {
    return Promise.resolve([]);
  }

  const cacheKey = createRequestCacheKey(groupId, requestBody);
  if (!subListRequestCache.has(cacheKey)) {
    subListRequestCache.set(
      cacheKey,
      fetch(ENDPOINT, {
        method: "POST",
        headers: createRequestHeaders(token),
        body: JSON.stringify(requestBody),
      })
        .then((response) => (response.ok ? response.json() : null))
        .then((payload) => normalizeRemoteList(groupId, extractRemoteList(payload)))
        .catch(() => [])
    );
  }

  return subListRequestCache.get(cacheKey);
};

export const requestSubGroups = (token) =>
  requestSubListItems(token, SUB_LIST_KEYS.interns).then((categories) =>
    categories.length > 0
      ? {
          [SUB_LIST_KEYS.interns]: {
            id: SUB_LIST_KEYS.interns,
            ...REMOTE_GROUP_META[SUB_LIST_KEYS.interns],
            categories,
          },
        }
      : {}
  );
