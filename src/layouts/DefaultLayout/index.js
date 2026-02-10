import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Navbar from './Navbar';
import Ulap from 'src/components/Ulap/Ulap';
import Interns from 'src/components/Interns/Interns';

const DefaultLayout = () => {
  const location = useLocation();
  const isHistoricalGraph = location.pathname === '/HistoricalGraph';

  return (
    <div>
      <Navbar />
      <div>
        <Outlet />
        {!isHistoricalGraph && (
          <>
            <Ulap />
            <Interns />
          </>
        )}
      </div>
    </div>
  );
};

export default DefaultLayout;
