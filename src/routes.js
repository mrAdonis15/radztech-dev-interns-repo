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

//BD routes

//13th Month Pay Calculator
import CalculatorLayout from "./BD-INTERNS/13thMonthPayCalculator/Layout/Layout";
import Calculator from "./BD-INTERNS/13thMonthPayCalculator/Calculator/Calculator";
import aboutCalculator from "./BD-INTERNS/13thMonthPayCalculator/About/About";

//Product Finder
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

  //BD routes
  //13th Month Pay Calculator (Layout provides nav + main container; Layout.css is applied here)
  {
    path: "/BDCalculator",
    element: CalculatorLayout,
    children: [
      { index: true, element: Calculator },
      { path: "About", element: aboutCalculator },
    ],
  },
  //Product Finder (Navbar only on these pages)
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
