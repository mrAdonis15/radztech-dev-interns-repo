import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Navbar from './Navbar';
import Ulap from '../../components/Ulap/Ulap';
import Interns from '../../components/Interns/Interns';

const DefaultLayout = () => {
  const location = useLocation();
  const isHome = location.pathname === '/';

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <Navbar />
      <main className="layout-content" style={{ flex: 1 }}>
        <Outlet />
        {isHome && (
          <>
            <Ulap />
            <Interns />

          </>
        )}
      </main>
    </div>
  );
};

export default DefaultLayout;
