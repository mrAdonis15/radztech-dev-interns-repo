import DefaultLayout from "./layouts/DefaultLayout";
import Login from "./components/login/login";
import BizUI from "./components/bizUI/index";
import CloneUlap from "./components/cloneUlap";
import Button from "./components/Button/Button";
import Home from "./components/Button/index";
import Ulap from "./components/Ulap/Ulap";

import DefaultLayout from "./layouts/DefaultLayout";
import ChatboxLayout from "./layouts/ChatboxLayout";
import Login from "./Login/Login";
import BizUI from "./components/bizUI";
import DisplayPage from "./components/Kurt/pages/DisplayPage";
import Graphs from "./components/HistoricalGraph/pages/graphs";
import Jayson from "./components/Adam/components/jsontask";
import AdvancedSettings from "./components/Merlvin/AdvancedSettings";
import JsonData from "./components/Brayan/JsonData";
import ChatboxGC from "./ChatboxGC/ChatbboxGC";
import EvaluationLayout from "./Evaluation/Navbar";
import Applicant from "./Evaluation/Applicant";
import Category from "./Evaluation/Category";
import Criteria from "./Evaluation/Criteria";
import Evaluation from "./Evaluation/Evaluation";
import ListofApplicants from "./Evaluation/ListofApplicants";
import UlapChatBot from "./components/Marth/UlapChatbot";
import Chatbox from "./Chatbox/chatbox";
import MenuDisplay from "./components/Merlvin/MenuDisplay";
import ImageCompressor from "./ImageCompress/ImageCompressor";
import SqlFormatter from "./components/SQL Formatter/SqlFormatter";
import Timelogstest from "./components/Adam/components/timelogstest";
import AGR from "./AGR";

const ChatboxPage = () => <Chatbox defaultOpen />;


const routes = [
  {
    path: "/login",
    element: Login,
  },
  {
    path: "/select-biz",
    element: BizUI,
  },
  {
    path: "/cloneulap",
    element: CloneUlap,
  },

  {
    path: "/button",
    element: Button,
  },
  {
    path: "/home",
    element: Home,
  },

    path: "/Chatbox",
    element: ChatboxLayout,
    children: [{ index: true, element: ChatboxPage }],
  },
  {
    path: "/",
    element: DefaultLayout,
    children: [
      {
        path: "/Ulap",
        element: Ulap,
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
        path: "/ChatboxGC",
        element: ChatboxGC,
      },
      {
        path: "/chatbot",
        element: UlapChatBot,
      },
      {
        path: "/MenuDisplay",
        element: MenuDisplay,
      },
      {
        path: "/ImageCompressor",
        element: ImageCompressor,
      },
      {
        path: "/SqlFormatter",
        element: SqlFormatter,
      },
      {
        path: "/TimeLogs",
        element: Timelogstest,
      },
    ],
  },
  {
    path: "/evaluation",
    element: EvaluationLayout,
    children: [
      {
        path: "applicant",
        element: Applicant,
      },
      {
        path: "category",
        element: Category,
      },
      {
        path: "criteria",
        element: Criteria,
      },
      {
        path: "evaluation",
        element: Evaluation,
      },
      {
        path: "list-applicants",
        element: ListofApplicants,
      },
    ],
  },
  {
    path: "/AGR",
    element: AGR,
  },
];

export default routes;
