import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import Ulap from 'src/components/Ulap/Ulap';

const DefaultLayout = () => {
  return (
    <div>
      <Navbar />
      <div style={{ marginTop: 80 }}>
        <Outlet />
        <Ulap />
      </div>
    </div>
  );
};

export default DefaultLayout;
