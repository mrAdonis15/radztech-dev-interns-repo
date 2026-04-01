const createCategory = (id, name) => ({
  id,
  name,
  averageRating: 0,
  totalRatings: 0,
  currentUserRating: 0,
  evaluationResult: null,
});

const categoryGroups = {
  devInterns: {
    id: "devInterns",
    label: "DEV Interns",
    itemLabelSingular: "Intern",
    itemLabelPlural: "Interns",
    categories: [
      createCategory("adam-quincy-colobong", "Adam Quincy D. Colobong"),
      createCategory("kurt-lawrence-manandig", "Kurt Lawrence B. Manandig"),
      createCategory("marth-justine-ramirez", "Marth Justine Ramirez"),
      createCategory("brayan-john-aquino", "Brayan John Aquino"),
      createCategory("merlvin-jake-garcia", "Merlvin Jake Garcia"),
    ],
  },
  businessDevInterns: {
    id: "businessDevInterns",
    label: "Business Dev Interns",
    description: "Switch views to score the Business Dev interns separately.",
    itemLabelSingular: "Intern",
    itemLabelPlural: "Interns",
    categories: [
      createCategory("dean-andrei-tavas", "Dean Andrei Tavas"),
      createCategory("jerick-parallag", "Jerick Parallag"),
      createCategory("arian-paul-languido", "Arian Paul Languido"),
      createCategory("diane-carmen", "Diane Carmen"),
      createCategory("justine-manuel", "Justine Manuel"),
      createCategory("vince-jermain-gumaru", "Vince Jermain Gumaru"),
    ],
  },
  devOpsInterns: {
    id: "devOpsInterns",
    label: "Dev Ops",
    description: "Use the dropdown to rate the Dev Ops interns separately.",
    itemLabelSingular: "Intern",
    itemLabelPlural: "Interns",
    categories: [
      createCategory("charimaine-gumarac", "Charimaine Gumarac"),
      createCategory("hyacinth-pena", "Hyacinth Pena"),
      createCategory("jannie-minnette-sapongay", "Jannie Minnette Sapongay"),
      createCategory("justine-claire-castro", "Justine Claire Castro"),
      createCategory("kail-pinto", "Kail Pinto"),
      createCategory("john-oliver-martinez", "John Oliver Martinez"),
    ],
  },
};

export const defaultGroupId = "devInterns";
export default categoryGroups;
