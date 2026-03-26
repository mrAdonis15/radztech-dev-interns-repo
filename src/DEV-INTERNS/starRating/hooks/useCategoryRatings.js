import { useEffect, useMemo, useState } from "react";
import categoryGroups, { defaultGroupId } from "../data/categories";

const STORAGE_KEY = "dev-interns-star-rating-groups";
const ACTIVE_GROUP_STORAGE_KEY = "dev-interns-star-rating-active-group";

const createUniqueId = (prefix) =>
  `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

const createEmptyCategory = () => ({
  id: createUniqueId("rating-item"),
  name: "",
  averageRating: 0,
  totalRatings: 0,
  currentUserRating: 0,
  questionRatings: {},
});

const normalizeCategory = (category) => ({
  id: typeof category?.id === "string" ? category.id : createUniqueId("rating-item"),
  name: typeof category?.name === "string" ? category.name : "",
  averageRating:
    typeof category?.averageRating === "number" && Number.isFinite(category.averageRating)
      ? category.averageRating
      : 0,
  totalRatings:
    typeof category?.totalRatings === "number" && Number.isFinite(category.totalRatings)
      ? category.totalRatings
      : 0,
  currentUserRating:
    typeof category?.currentUserRating === "number" && Number.isFinite(category.currentUserRating)
      ? category.currentUserRating
      : 0,
  questionRatings:
    category?.questionRatings && typeof category.questionRatings === "object"
      ? { ...category.questionRatings }
      : {},
});

const normalizeGroup = (group, fallbackId) => ({
  id: typeof group?.id === "string" ? group.id : fallbackId,
  label: typeof group?.label === "string" ? group.label : "",
  description: typeof group?.description === "string" ? group.description : "",
  itemLabelSingular:
    typeof group?.itemLabelSingular === "string" && group.itemLabelSingular.trim()
      ? group.itemLabelSingular
      : "Item",
  itemLabelPlural:
    typeof group?.itemLabelPlural === "string" && group.itemLabelPlural.trim()
      ? group.itemLabelPlural
      : "Items",
  categories: Array.isArray(group?.categories)
    ? group.categories.map(normalizeCategory)
    : [],
});

const cloneCategoryGroups = (groups) =>
  Object.keys(groups).reduce((accumulator, groupKey) => {
    accumulator[groupKey] = normalizeGroup(groups[groupKey], groupKey);
    return accumulator;
  }, {});

const defaultCategoryGroups = cloneCategoryGroups(categoryGroups);

const isValidStoredGroups = (storedGroups) =>
  storedGroups &&
  typeof storedGroups === "object" &&
  !Array.isArray(storedGroups) &&
  Object.keys(storedGroups).length > 0 &&
  Object.values(storedGroups).every(
    (group) =>
      group &&
      typeof group === "object" &&
      typeof group.id === "string" &&
      Array.isArray(group.categories)
  );

const getStoredCategoryGroups = () => {
  if (typeof window === "undefined") {
    return cloneCategoryGroups(defaultCategoryGroups);
  }

  try {
    const storedValue = window.localStorage.getItem(STORAGE_KEY);

    if (!storedValue) {
      return cloneCategoryGroups(defaultCategoryGroups);
    }

    const parsedValue = JSON.parse(storedValue);
    return isValidStoredGroups(parsedValue)
      ? cloneCategoryGroups(parsedValue)
      : cloneCategoryGroups(defaultCategoryGroups);
  } catch (error) {
    return cloneCategoryGroups(defaultCategoryGroups);
  }
};

const getStoredActiveGroupId = () => {
  if (typeof window === "undefined") {
    return defaultGroupId;
  }

  const storedGroupId = window.localStorage.getItem(ACTIVE_GROUP_STORAGE_KEY);
  return storedGroupId || defaultGroupId;
};

const getWeightedAverage = (totalScore, totalReviews) =>
  totalReviews > 0 ? Number((totalScore / totalReviews).toFixed(1)) : 0;

const getSummary = (categories, activeGroup) => {
  const totalCategories = categories.length;
  const ratedCategories = categories.filter((category) => category.currentUserRating > 0);
  const totalUserScore = ratedCategories.reduce(
    (sum, category) => sum + category.currentUserRating,
    0
  );

  return {
    totalCategories,
    ratedCategories: ratedCategories.length,
    averageUserRating:
      ratedCategories.length > 0
        ? Number((totalUserScore / ratedCategories.length).toFixed(1))
        : 0,
    itemLabelPlural: activeGroup?.itemLabelPlural || "Items",
    itemLabelSingular: activeGroup?.itemLabelSingular || "Item",
  };
};

const getDisplayMode = (group) => {
  const itemPlural = group?.itemLabelPlural?.trim() || "Items";

  return {
    heading: "Ulap Ratings",
    subheading: `Rate ${itemPlural.toLowerCase()}`,
  };
};

const clampRating = (rating) => Math.min(5, Math.max(1, rating));

export default function useCategoryRatings() {
  const [activeGroupId, setActiveGroupId] = useState(getStoredActiveGroupId);
  const [categoryState, setCategoryState] = useState(getStoredCategoryGroups);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(categoryState));
  }, [categoryState]);

  useEffect(() => {
    const groupIds = Object.keys(categoryState);
    if (!groupIds.length) {
      return;
    }

    if (!categoryState[activeGroupId]) {
      setActiveGroupId(groupIds[0]);
    }
  }, [activeGroupId, categoryState]);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    window.localStorage.setItem(ACTIVE_GROUP_STORAGE_KEY, activeGroupId);
  }, [activeGroupId]);

  const handleSaveEvaluation = (categoryId, questionRatings) => {
    const sanitizedQuestionRatings = Object.keys(questionRatings).reduce(
      (accumulator, key) => {
        const rating = questionRatings[key];

        if (rating > 0) {
          accumulator[key] = clampRating(rating);
        }

        return accumulator;
      },
      {}
    );

    setCategoryState((currentGroups) => {
      const currentGroup = currentGroups[activeGroupId];
      if (!currentGroup) {
        return currentGroups;
      }

      const nextCategories = currentGroup.categories.map((category) => {
        if (category.id !== categoryId) {
          return category;
        }

        const answeredRatings = Object.values(sanitizedQuestionRatings);
        const nextUserRating =
          answeredRatings.length > 0
            ? answeredRatings.reduce((sum, rating) => sum + rating, 0) / answeredRatings.length
            : 0;
        const previousUserRating = category.currentUserRating || 0;
        const hadPreviousReview = previousUserRating > 0 && category.totalRatings > 0;
        const currentTotalScore = (category.averageRating || 0) * (category.totalRatings || 0);
        const adjustedTotalScore = hadPreviousReview
          ? currentTotalScore - previousUserRating
          : currentTotalScore;
        const adjustedTotalRatings = hadPreviousReview
          ? category.totalRatings - 1
          : category.totalRatings;
        const nextTotalScore =
          nextUserRating > 0 ? adjustedTotalScore + nextUserRating : adjustedTotalScore;
        const nextTotalRatings =
          nextUserRating > 0 ? adjustedTotalRatings + 1 : adjustedTotalRatings;

        return {
          ...category,
          questionRatings: sanitizedQuestionRatings,
          currentUserRating: Number(nextUserRating.toFixed(1)),
          totalRatings: nextTotalRatings,
          averageRating: getWeightedAverage(nextTotalScore, nextTotalRatings),
        };
      });

      return {
        ...currentGroups,
        [currentGroup.id]: {
          ...currentGroup,
          categories: nextCategories,
        },
      };
    });
  };

  const resetRatings = () => {
    setCategoryState((currentGroups) => {
      const currentGroup = currentGroups[activeGroupId];
      if (!currentGroup) {
        return currentGroups;
      }

      return {
        ...currentGroups,
        [activeGroupId]: {
          ...currentGroup,
          categories: currentGroup.categories.map((category) => ({
            ...category,
            averageRating: 0,
            totalRatings: 0,
            currentUserRating: 0,
            questionRatings: {},
          })),
        },
      };
    });
  };

  const handleSelectGroup = (event) => {
    setActiveGroupId(event.target.value);
  };

  const addGroup = () => {
    const nextId = createUniqueId("rating-set");

    setCategoryState((currentGroups) => ({
      ...currentGroups,
      [nextId]: {
        id: nextId,
        label: "New Rating Set",
        description: "Describe what should be rated in this setup.",
        itemLabelSingular: "Item",
        itemLabelPlural: "Items",
        categories: [createEmptyCategory()],
      },
    }));

    setActiveGroupId(nextId);
  };

  const updateGroup = (groupId, field, value) => {
    setCategoryState((currentGroups) => {
      const group = currentGroups[groupId];
      if (!group) {
        return currentGroups;
      }

      return {
        ...currentGroups,
        [groupId]: {
          ...group,
          [field]: value,
        },
      };
    });
  };

  const removeGroup = (groupId) => {
    setCategoryState((currentGroups) => {
      const nextGroups = { ...currentGroups };
      delete nextGroups[groupId];

      if (Object.keys(nextGroups).length === 0) {
        setActiveGroupId(defaultGroupId);
        return cloneCategoryGroups(defaultCategoryGroups);
      }

      if (activeGroupId === groupId) {
        setActiveGroupId(Object.keys(nextGroups)[0]);
      }

      return nextGroups;
    });
  };

  const addCategory = (groupId) => {
    setCategoryState((currentGroups) => {
      const group = currentGroups[groupId];
      if (!group) {
        return currentGroups;
      }

      return {
        ...currentGroups,
        [groupId]: {
          ...group,
          categories: [...group.categories, createEmptyCategory()],
        },
      };
    });
  };

  const updateCategory = (groupId, categoryId, value) => {
    setCategoryState((currentGroups) => {
      const group = currentGroups[groupId];
      if (!group) {
        return currentGroups;
      }

      return {
        ...currentGroups,
        [groupId]: {
          ...group,
          categories: group.categories.map((category) =>
            category.id === categoryId
              ? {
                  ...category,
                  name: value,
                }
              : category
          ),
        },
      };
    });
  };

  const removeCategory = (groupId, categoryId) => {
    setCategoryState((currentGroups) => {
      const group = currentGroups[groupId];
      if (!group) {
        return currentGroups;
      }

      return {
        ...currentGroups,
        [groupId]: {
          ...group,
          categories: group.categories.filter((category) => category.id !== categoryId),
        },
      };
    });
  };

  const resetGroups = () => {
    setCategoryState(cloneCategoryGroups(defaultCategoryGroups));
    setActiveGroupId(defaultGroupId);
  };

  const activeGroup = categoryState[activeGroupId] || categoryState[Object.keys(categoryState)[0]];
  const categories = activeGroup ? activeGroup.categories : [];
  const categoryGroupList = Object.values(categoryState);
  const summary = useMemo(() => getSummary(categories, activeGroup), [categories, activeGroup]);
  const displayMode = getDisplayMode(activeGroup);

  return {
    activeGroupId,
    activeGroup,
    categoryGroupList,
    categories,
    handleSaveEvaluation,
    resetRatings,
    handleSelectGroup,
    summary,
    displayMode,
    addGroup,
    updateGroup,
    removeGroup,
    addCategory,
    updateCategory,
    removeCategory,
    resetGroups,
  };
}
