

const routes = [
  {
    path: "/",
    element: DefaultLayout,
    children: [
      {
        path: "/Ulap",
        element: Ulap,
      },
      {
        path: "/KurtJSON",
        element: DisplayPage,
      },
      {
        path: "/HistoricalGraph",
        element: Graphs,
      },
      {
        path: "/AdamJSON",
        element: Jayson,
      },
      {
        path: "/MerlvinJSON",
        element: AdvancedSettings,
      },
      {
        path: "/BrayanJSON",
        element: JsonData,
      },
      {
        path: "/Chatbox",
        element: Chatbox,
      },
      {
        path: "/advance-settings",
        element: Settings,
      },
    ],
  },
  {
    path: '/evaluation',
    element: EvaluationLayout,
    children: [
      {
        path: 'applicant',
        element: Applicant
      },
      {
        path: 'category',
        element: Category
      },
      {
        path: 'criteria',
        element: Criteria
      },
      {
        path: 'evaluation',
        element: Evaluation
      },
      {
        path: 'list-applicants',
        element: ListofApplicants
      }
    ]
  },
];

export default routes;
