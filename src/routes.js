import DefaultLayout from './layouts/DefaultLayout';
import Ulap from './components/Ulap/Ulap';
import DisplayPage from './components/Kurt/pages/DisplayPage';

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
        path: '/KurtJSON',
        element: DisplayPage
      }
    ],
  },
];

export default routes;
