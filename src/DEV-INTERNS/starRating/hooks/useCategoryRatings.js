import { useEffect, useMemo, useState } from "react";
import categoryGroups, { categoryGroupList, defaultGroupId } from "../data/categories";

const STORAGE_KEY = "dev-interns-star-rating-groups";
const ACTIVE_GROUP_STORAGE_KEY = "dev-interns-star-rating-active-group";
const cloneCategories = (categories) => categories.map((category) => ({ ...category }));
const cloneCategoryGroups = (groups) =>
  Object.keys(groups).reduce((accumulator, groupKey) => {
    accumulator[groupKey] = {
      ...groups[groupKey],
      categories: cloneCategories(groups[groupKey].categories),
    };

    return accumulator;
  }, {});

const defaultCategoryGroups = cloneCategoryGroups(categoryGroups);

const hasMatchingCategoryShape = (storedGroups) => {
  if (!storedGroups || typeof storedGroups !== "object") {
    return false;
  }

  return Object.keys(defaultCategoryGroups).every((groupKey) => {
    const defaultGroup = defaultCategoryGroups[groupKey];
    const storedGroup = storedGroups[groupKey];

    if (!storedGroup || !Array.isArray(storedGroup.categories)) {
      return false;
    }

    if (storedGroup.categories.length !== defaultGroup.categories.length) {
      return false;
    }

    const defaultCategoryIds = defaultGroup.categories.map((category) => category.id).sort();
    const storedCategoryIds = storedGroup.categories.map((category) => category.id).sort();

    const matchingIds = storedCategoryIds.every((id, index) => id === defaultCategoryIds[index]);
    const hasQuestionRatings = storedGroup.categories.every(
      (category) => typeof category.questionRatings === "object"
    );

    return matchingIds && hasQuestionRatings;
  });
};

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

    return hasMatchingCategoryShape(parsedValue)
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
  return categoryGroups[storedGroupId] ? storedGroupId : defaultGroupId;
};

const getSummary = (categories) => {
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
  };
};

const getDisplayMode = (groupId) => {
  if (groupId === "businessDevInterns") {
    return {
      heading: "Business Dev Interns ratings",
      subheading: "Business Dev Interns",
    };
  }

  if (groupId === "devOpsInterns") {
    return {
      heading: "Dev Ops ratings",
      subheading: "Dev Ops",
    };
  }

  return {
    heading: "DEV Interns ratings",
    subheading: "DEV Interns",
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
      const currentGroup = currentGroups[activeGroupId] || currentGroups[defaultGroupId];
      const nextCategories = currentGroup.categories.map((category) => {
        if (category.id !== categoryId) {
          return category;
        }

        const answeredRatings = Object.values(sanitizedQuestionRatings);
        const nextAverage =
          answeredRatings.length > 0
            ? answeredRatings.reduce((sum, rating) => sum + rating, 0) / answeredRatings.length
            : 0;

        return {
          ...category,
          questionRatings: sanitizedQuestionRatings,
          currentUserRating: Number(nextAverage.toFixed(1)),
          totalRatings: answeredRatings.length > 0 ? 1 : 0,
          averageRating: Number(nextAverage.toFixed(1)),
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
    setCategoryState((currentGroups) => ({
      ...currentGroups,
      [activeGroupId]: {
        ...defaultCategoryGroups[activeGroupId],
        categories: cloneCategories(defaultCategoryGroups[activeGroupId].categories),
      },
    }));
  };

  const handleSelectGroup = (event) => {
    setActiveGroupId(event.target.value);
  };

  const activeGroup = categoryState[activeGroupId] || categoryState[defaultGroupId];
  const categories = activeGroup ? activeGroup.categories : [];
  const summary = useMemo(() => getSummary(categories), [categories]);
  const displayMode = getDisplayMode(activeGroupId);

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
  };
}
