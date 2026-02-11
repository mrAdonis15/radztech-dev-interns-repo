import DefaultLayout from './layouts/DefaultLayout';
import Ulap from './components/Ulap/Ulap';
import DisplayPage from './components/Kurt/pages/DisplayPage';
import Graphs from './components/HistoricalGraph/pages/graphs';

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
      },
      {
        path: '/HistoricalGraph',
        element: Graphs
      }
    ],
  },
];

export default routes;
