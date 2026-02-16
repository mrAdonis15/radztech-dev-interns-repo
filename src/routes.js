import DefaultLayout from './layouts/DefaultLayout';
import Ulap from './components/Ulap/Ulap';
import DisplayPage from './components/Kurt/pages/DisplayPage';
import Graphs from './components/HistoricalGraph/pages/graphs';
import Jayson from './components/Adam/components/jsontask';
import AdvancedSettings from './components/Merlvin/AdvancedSettings';
import SettingsAdvanced from './components/Settings/AdvancedSettings';
import JsonData from './components/Brayan/JsonData';
import Chatbox from './Chatbox/chatbox';
import EvaluationLayout from './Evaluation/Navbar';
import Applicant from './Evaluation/Applicant';
import Category from './Evaluation/Category';
import Criteria from './Evaluation/Criteria';
import Evaluation from './Evaluation/Evaluation';
import ListofApplicants from './Evaluation/ListofApplicants';
import {
  Home,
  Plans,
  AccountingnBeyond,
  Features,
  SchedsnReps,
  Contacts,
  PlanBasic,
  PlanPro,
  PlanErp,
} from './components/HeaderItems';

const routes = [
  {
    path: '/',
    element: DefaultLayout,
    children: [
      {
        path: '/Ulap',
        element: Ulap,
      },
      {
        path: '/home',
        element: Home,
      },
      {
        path: '/plans',
        element: Plans,
      },
      {
        path: '/plans/basic',
        element: PlanBasic,
      },
      {
        path: '/plans/pro',
        element: PlanPro,
      },
      {
        path: '/plans/erp',
        element: PlanErp,
      },
      {
        path: '/accounting-and-beyond',
        element: AccountingnBeyond,
      },
      {
        path: '/features',
        element: Features,
      },
      {
        path: '/schedules-and-reports',
        element: SchedsnReps,
      },
      {
        path: '/contact-us',
        element: Contacts,
      },
      {
        path: '/KurtJSON',
        element: DisplayPage,
      },
      {
        path: '/HistoricalGraph',
        element: Graphs,
      },
      {
        path: '/AdamJSON',
        element: Jayson,
      },
      {
        path: '/MerlvinJSON',
        element: AdvancedSettings,
      },
      {
        path: '/BrayanJSON',
        element: JsonData,
      },
      {
        path: '/Chatbox',
        element: Chatbox,
      },
    ],
  },
  {
    path: '/settings/advanced',
    element: SettingsAdvanced,
  },
  {
    path: '/evaluation',
    element: EvaluationLayout,
    children: [
      {
        path: 'applicant',
        element: Applicant,
      },
      {
        path: 'category',
        element: Category,
      },
      {
        path: 'criteria',
        element: Criteria,
      },
      {
        path: 'evaluation',
        element: Evaluation,
      },
      {
        path: 'list-applicants',
        element: ListofApplicants,
      },
    ],
  },
];

export default routes;
