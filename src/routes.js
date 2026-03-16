import DefaultLayout from "./layouts/DefaultLayout";
import ChatboxLayout from "./DEV-INTERNS/Chatbox/Layout";
import Login from "./Auth/Login/Login";
import BizUI from "./Auth/selectBIZ";
import DisplayPage from "./DEV-INTERNS/uiJSON/Kurt/pages/DisplayPage";
import Graphs from "./DEV-INTERNS/HistoricalGraph/pages/graphs";
import Jayson from "./DEV-INTERNS/uiJSON/Adam/components/jsontask";
import AdvancedSettings from "./DEV-INTERNS/uiJSON/Merlvin/AdvancedSettings";
import JsonData from "./DEV-INTERNS/uiJSON/Brayan/JsonData";
import ChatboxGC from "./DEV-INTERNS/ChatboxGC/ChatbboxGC";
import EvaluationLayout from "./DEV-INTERNS/Evaluation/Navbar";
import Applicant from "./DEV-INTERNS/Evaluation/Applicant";
import Category from "./DEV-INTERNS/Evaluation/Category";
import Criteria from "./DEV-INTERNS/Evaluation/Criteria";
import Evaluation from "./DEV-INTERNS/Evaluation/Evaluation";
import ListofApplicants from "./DEV-INTERNS/Evaluation/ListofApplicants";
import UlapChatBot from "./DEV-INTERNS/uiJSON/Marth/UlapChatbot";
import Chatbox from "./DEV-INTERNS/Chatbox/Layout/chatbox";
import MenuDisplay from "./DEV-INTERNS/uiJSON/Merlvin/MenuDisplay";
import ImageCompressor from "./DEV-INTERNS/ImageCompress/ImageCompressor";
import SqlFormatter from "./DEV-INTERNS/SQL Formatter/SqlFormatter";
import Timelogstest from "./DEV-INTERNS/uiJSON/Adam/components/timelogstest";
import AGR from "./DEV-INTERNS/AGR";

// BD routes
import CalculatorLayout from "./BD-INTERNS/13thMonthPayCalculator/Layout/Layout";
import Calculator from "./BD-INTERNS/13thMonthPayCalculator/Calculator/Calculator";
import aboutCalculator from "./BD-INTERNS/13thMonthPayCalculator/About/About";
import ProductFinderLayout from "./BD-INTERNS/Product-Finder/Layout/Layout";
import PFHero from "./BD-INTERNS/Product-Finder/Hero/Hero";
import PFQuestionnaire from "./BD-INTERNS/Product-Finder/Questionnaire/Questionnaire";
import PFResults from "./BD-INTERNS/Product-Finder/Result/Result";
import PFPricing from "./BD-INTERNS/Product-Finder/Pricing/Pricing";
import PFCheckout from "./BD-INTERNS/Product-Finder/Checkout/Checkout";
import PFReciept from "./BD-INTERNS/Product-Finder/Receipt/Receipt";
import PFContactUs from "./BD-INTERNS/Product-Finder/ContactUs/ContactUs";
import PaymentComplete from "./BD-INTERNS/Product-Finder/PaymentComplete/PaymentComplete";

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
  // BD routes
  {
    path: "/BDCalculator",
    element: CalculatorLayout,
    children: [
      { index: true, element: Calculator },
      { path: "About", element: aboutCalculator },
    ],
  },
  {
    path: "/ProductFinder",
    element: ProductFinderLayout,
    children: [
      { index: true, element: PFHero },
      { path: "Questionnaire", element: PFQuestionnaire },
      { path: "Results", element: PFResults },
      { path: "Pricing", element: PFPricing },
      { path: "Checkout", element: PFCheckout },
      { path: "Receipt", element: PFReciept },
      { path: "ContactUs", element: PFContactUs },
      { path: "PaymentComplete", element: PaymentComplete },
    ],
  },
];

export default routes;
