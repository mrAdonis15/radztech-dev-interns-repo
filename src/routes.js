// DEV-INTERNS routes
import DefaultLayout from "./layouts/DefaultLayout";
import ChatboxLayout from "./DEV-INTERNS/Chatbox/Layout";
import Login from "./Auth/Login/Login";
import BizUI from "./Auth/selectBIZ";
import ChooseApp from "./Auth/ChooseApp";
import DisplayPage from "./DEV-INTERNS/uiJSON/Kurt/pages/DisplayPage";
import Graphs from "./DEV-INTERNS/HistoricalGraph/pages/graphs";
import Jayson from "./DEV-INTERNS/uiJSON/Adam/components/jsontask";
import AdvancedSettings from "./DEV-INTERNS/uiJSON/Merlvin/AdvancedSettings";
import JsonData from "./DEV-INTERNS/uiJSON/Brayan/JsonData";
import ChatboxGC from "./DEV-INTERNS/ChatboxGC/ChatbboxGC";
import UlapChatBot from "./DEV-INTERNS/uiJSON/Marth/UlapChatbot";
import Chatbox from "./DEV-INTERNS/Chatbox/Layout/chatbox";
import MenuDisplay from "./DEV-INTERNS/uiJSON/Merlvin/MenuDisplay";
import ImageCompressor from "./DEV-INTERNS/ImageCompress/ImageCompressor";
import SqlFormatter from "./DEV-INTERNS/SQL Formatter/SqlFormatter";
import Timelogstest from "./DEV-INTERNS/uiJSON/Adam/components/timelogstest";
import AGR from "./DEV-INTERNS/AGR";
import RatePage from "./DEV-INTERNS/Evaluation/page/RatePage";
import BibleVerse from "./DEV-INTERNS/BibleVerse/bible";
import Sheets from "./DEV-INTERNS/react_sheet/sheet";
import Docs from "./DEV-INTERNS/react_sheet/docs";
// BD routes
import CalculatorLayout from "./BD-INTERNS/13thMonthPayCalculator/Layout/Layout";
import Landing from "./BD-INTERNS/13thMonthPayCalculator/Landing/Landing";
import Calculator from "./BD-INTERNS/13thMonthPayCalculator/Calculator/Calculator";
import Result from "./BD-INTERNS/13thMonthPayCalculator/Result/Result";

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
const PythonPrototypePage = () => <Chatbox defaultOpen aiProvider="python" />;

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
    path: "/choose-app",
    element: ChooseApp,
  },
  {
    path: "/Chatbox",
    element: ChatboxLayout,
    children: [{ index: true, element: ChatboxPage }],
  },
  {
    path: "/PythonPrototypeChatbot",
    element: ChatboxLayout,
    children: [{ index: true, element: PythonPrototypePage }],
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
      {
        path: "/Evaluation",
        element: RatePage,
      },
      {
        path: "/sheet",
        element: Sheets,
      },
      {
        path: "/docs",
        element: Docs,
      },

      {
        path: "/verses",
        element: BibleVerse,
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
      { index: true, element: Landing },
      { path: "calculator", element: Calculator },
      { path: "result", element: Result },
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
