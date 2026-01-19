import DefaultLayout from './layouts/DefaultLayout';
import Ulap from './components/Ulap/Ulap';

const routes = [
  {
    path: '/',
    element: DefaultLayout,
    children: [
      {
        path: 'Put here your route',
        element: 'Put here your element',
      },
    ],
  },
];

export default routes;
