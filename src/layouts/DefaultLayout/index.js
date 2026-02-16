import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Navbar from './Navbar';
import Ulap from 'src/components/Ulap/Ulap';
import Interns from 'src/components/Interns/Interns';
import Home from 'src/components/HeaderItems/Home';
import Plans from 'src/components/HeaderItems/Plans';
import AccountingnBeyond from 'src/components/HeaderItems/ActnBynd';
import Features from 'src/components/HeaderItems/Features';
import SchedsnReps from 'src/components/HeaderItems/SchdnRprts';
import Contacts from 'src/components/HeaderItems/Contact';
import PlanBasic from 'src/components/HeaderItems/PlanBasic';
import PlanPro from 'src/components/HeaderItems/PlanPro';
import PlanErp from 'src/components/HeaderItems/PlanErp';

const DefaultLayout = () => {
  const location = useLocation();
  const isPlanPage = location.pathname.startsWith('/plans/');
  const isHome = location.pathname === '/' || location.pathname === '/home';

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <Navbar />
      <main className="layout-content" style={{ flex: 1 }}>
        <Outlet />
        {isPlanPage ? (
          <div>
            {location.pathname === '/plans/basic' && <PlanBasic />}
            {location.pathname === '/plans/pro' && <PlanPro />}
            {location.pathname === '/plans/erp' && <PlanErp />}
          </div>
        ) : null}
        {isHome && (
          <>
            <div id="ulap"><Ulap /></div>
            <div id="home"><Home /></div>
            <div id="plans"><Plans /></div>
            <div id="accounting-and-beyond"><AccountingnBeyond /></div>
            <div id="features"><Features /></div>
            <div id="schedules-and-reports"><SchedsnReps /></div>
            <div id="contact-us"><Contacts /></div>
            <Interns />
          </>
        )}
      </main>
    </div>
  );
};

export default DefaultLayout;
