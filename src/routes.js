import DefaultLayout from "./layouts/DefaultLayout";
import Login from "./components/login/login";
import BizUI from "./components/bizUI/index";
import CloneUlap from "./components/cloneUlap";
import Button from "./components/Button/Button";
import Home from "./components/Button/index";
import Ulap from "./components/Ulap/Ulap";

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

  {
    path: "/",
    element: DefaultLayout,
    children: [
      {
        path: "/Ulap",
        element: Ulap,
      },
    ],
  },
];

export default routes;
