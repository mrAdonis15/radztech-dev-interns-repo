import DefaultLayout from "./layouts/DefaultLayout";
import ChatboxLayout from "./layouts/ChatboxLayout";
import Login from "./Login/Login";
import BizUI from "./components/bizUI";
import Ulap from "./components/Ulap/Ulap";
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
];

export default routes;
