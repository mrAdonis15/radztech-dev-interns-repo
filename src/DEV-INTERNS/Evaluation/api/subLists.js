import { ENDPOINT, SUB_LIST_KEYS } from "../api/endpoints";

const REMOTE_GROUP_META = {
  [SUB_LIST_KEYS.interns]: {
    label: "Interns",
    description: "Loaded from sub1.",
    itemLabelSingular: "Intern",
    itemLabelPlural: "Interns",
  },
  [SUB_LIST_KEYS.evaluators]: {
    label: "Evaluators",
    description: "Loaded from sub2.",
    itemLabelSingular: "Evaluator",
    itemLabelPlural: "Evaluators",
  },
};

let remoteGroupsRequest = null;
let remoteGroupsResolved = false;

const createUniqueId = (prefix) =>
  `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

const createRatingItem = (id, name) => ({
  id,
  name,
  averageRating: 0,
  totalRatings: 0,
  currentUserRating: 0,
  evaluationResult: null,
});

const sanitizeItemId = (value, fallbackPrefix) => {
  const normalizedValue = String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  return normalizedValue || createUniqueId(fallbackPrefix);
};

const getDisplayName = (item) => {
  if (typeof item === "string") {
    return item.trim();
  }

  if (!item || typeof item !== "object") {
    return "";
  }

  const candidateKeys = [
    "name",
    "label",
    "title",
    "fullName",
    "fullname",
    "displayName",
    "description",
    "value",
    "text",
  ];

  for (const key of candidateKeys) {
    const candidateValue = item[key];
    if (typeof candidateValue === "string" && candidateValue.trim()) {
      return candidateValue.trim();
    }
  }

  return "";
};

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

    const id = sanitizeItemId(name, `${groupId}-${index + 1}`);

    if (seenIds.has(id)) {
      return items;
    }

    seenIds.add(id);
    items.push(createRatingItem(id, name));
    return items;
  }, []);
};

const extractRemotePayload = (payload) => {
  if (Array.isArray(payload)) {
    const sub1 = payload
      .map((item) => (item && typeof item === "object" ? item[SUB_LIST_KEYS.interns] : null))
      .filter(Boolean);
    const sub2 = payload
      .map((item) => (item && typeof item === "object" ? item[SUB_LIST_KEYS.evaluators] : null))
      .filter(Boolean);

    if (sub1.length || sub2.length) {
      return {
        [SUB_LIST_KEYS.interns]: sub1,
        [SUB_LIST_KEYS.evaluators]: sub2,
      };
    }

    return null;
  }

  if (!payload || typeof payload !== "object") {
    return null;
  }

  if (
    Array.isArray(payload[SUB_LIST_KEYS.interns]) ||
    Array.isArray(payload[SUB_LIST_KEYS.evaluators])
  ) {
    return payload;
  }

  const nestedKeys = ["data", "result", "results", "payload", "items"];

  for (const key of nestedKeys) {
    const nestedValue = payload[key];
    if (nestedValue && typeof nestedValue === "object") {
      const extractedNestedValue = extractRemotePayload(nestedValue);
      if (extractedNestedValue) {
        return extractedNestedValue;
      }
    }
  }

  return null;
};

const buildRemoteGroups = (payload) => {
  const extractedPayload = extractRemotePayload(payload);

  if (!extractedPayload) {
    return {};
  }

  return Object.keys(REMOTE_GROUP_META).reduce((groups, groupId) => {
    const categories = normalizeRemoteList(groupId, extractedPayload[groupId]);

    if (!categories.length) {
      return groups;
    }

    groups[groupId] = {
      id: groupId,
      ...REMOTE_GROUP_META[groupId],
      categories,
    };

    return groups;
  }, {});
};

export const requestSubGroups = (token) => {
  if (remoteGroupsResolved) {
    return Promise.resolve({});
  }

  if (!remoteGroupsRequest) {
    const headers = {
      "Content-Type": "application/json",
    };

    if (token) {
      headers["x-access-tokens"] = token;
    }

    remoteGroupsRequest = fetch(ENDPOINT, {
      method: "POST",
      headers,
      body: JSON.stringify({
        ixSubType: 206,
        q: "h",
        showInactive: false,
      }),
    })
      .then((response) => (response.ok ? response.json() : null))
      .then((payload) => buildRemoteGroups(payload))
      .catch(() => ({}))
      .finally(() => {
        remoteGroupsResolved = true;
      });
  }

  return remoteGroupsRequest;
};
