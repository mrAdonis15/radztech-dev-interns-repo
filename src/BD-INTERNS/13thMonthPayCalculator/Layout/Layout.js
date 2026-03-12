import { Outlet, NavLink } from 'react-router-dom';
import './Layout.css';

function Layout() {
  return (
    <div className="layout">
      <nav className="layout-nav">
        <NavLink to="/BDCalculator" end className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
          Calculator
        </NavLink>
        <NavLink to="/BDCalculator/About" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
          About
        </NavLink>
      </nav>
      <main className="layout-main">
        <Outlet />
      </main>
    </div>
  );
}

export default Layout;
