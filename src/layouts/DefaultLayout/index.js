import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import Ulap from 'src/components/Ulap/Ulap';
import Interns from 'src/components/Interns/Interns';

const DefaultLayout = () => {
  return (
    <div>
      <Navbar />
      <div>
        <Outlet />
        <Ulap />
        <Interns />
      </div>
    </div>
  );
};

export default DefaultLayout;
