import DefaultLayout from './layouts/DefaultLayout';
import Ulap from './components/Ulap/Ulap';
import { Home, Plans, AccountingnBeyond, Features, SchedsnReps, Contacts, PlanBasic, PlanPro, PlanErp } from './components/HeaderItems';
import AdvancedSettings from './components/Settings/AdvancedSettings';

const routes = [
  {
    path: '/',
    element: DefaultLayout,
    children: [
      {
        path: '/ulap', element: Ulap,
      },
      {
        path: '/home', element: Home,
      },
      {
        path: '/plans', element: Plans,
      },
      {
        path: '/plans/basic', element: PlanBasic
      },
      {
        path: '/plans/pro', element: PlanPro
      },
      {
        path: '/plans/erp', element: PlanErp
      },
      {
        path: '/accounting-and-beyond', element: AccountingnBeyond
      },
      {
        path: '/features', element: Features
      },
      {
        path: '/schedules-and-reports', element: SchedsnReps
      },
      {
        path: '/contact-us', element: Contacts
      },
      {
        path: '/advanced-settings', element: AdvancedSettings
      },
    ],
  },
];

export default routes;
