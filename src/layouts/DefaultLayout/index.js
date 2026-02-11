import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Navbar from './Navbar';
import Ulap from 'src/components/Ulap/Ulap';
import Interns from 'src/components/Interns/Interns';

const DefaultLayout = () => {
  const location = useLocation();
  const isHome = location.pathname === '/';

  return (
    <div>
      <Navbar />
      <div>
        <Outlet />
        {isHome && (
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
