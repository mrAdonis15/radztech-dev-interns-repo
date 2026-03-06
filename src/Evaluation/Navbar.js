import React, { useState, useEffect } from "react";
import { useNavigate, useLocation, Outlet } from "react-router-dom";
import {
  AppBar,
  Toolbar,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Avatar,
  Box,
  Collapse,
  Container,
} from "@material-ui/core";
import ExpandLess from "@material-ui/icons/ExpandLess";
import ExpandMore from "@material-ui/icons/ExpandMore";
import TouchAppIcon from "@material-ui/icons/TouchApp";
import AssignmentIcon from "@material-ui/icons/Assignment";
import SettingsIcon from "@material-ui/icons/Settings";
import UlapBizLogo from "src/images/ulapbiz.png";
import "./Page.css";

const MENU_ITEMS = [
  {
    label: "Transactions",
    icon: TouchAppIcon,
    submenu: [{ label: "Evaluation", path: "/evaluation/evaluation" }],
  },
  {
    label: "Reports",
    icon: AssignmentIcon,
    submenu: [
      { label: "List of Applicants", path: "/evaluation/list-applicants" },
    ],
  },
  {
    label: "Settings",
    icon: SettingsIcon,
    submenu: [
      { label: "Applicant", path: "/evaluation/applicant" },
      { label: "Category", path: "/evaluation/category" },
      { label: "Criteria", path: "/evaluation/criteria" },
    ],
  },
];

function getDisplayUser() {
  try {
    const rawUser = localStorage.getItem("user");
    if (!rawUser) return { name: "Guest User", initials: "GU" };
    const parsed = JSON.parse(rawUser);
    const candidate =
      parsed?.name ||
      parsed?.username ||
      parsed?.fullName ||
      parsed?.firstName ||
      parsed?.userName ||
      "Guest User";
    const name = String(candidate).trim() || "Guest User";
    const initials =
      name
        .split(/\s+/)
        .filter(Boolean)
        .slice(0, 2)
        .map((part) => part[0]?.toUpperCase() || "")
        .join("") || "GU";
    return { name, initials };
  } catch (_) {
    return { name: "Guest User", initials: "GU" };
  }
}

function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [expandedMenus, setExpandedMenus] = useState({});
  const [displayUser, setDisplayUser] = useState(() => getDisplayUser());

  useEffect(() => {
    setExpandedMenus((prev) =>
      MENU_ITEMS.reduce((acc, item) => {
        const isActiveGroup = (item.submenu || []).some(
          (subitem) => location.pathname === subitem.path,
        );
        acc[item.label] = isActiveGroup || Boolean(prev[item.label]);
        return acc;
      }, {}),
    );
  }, [location.pathname]);

  useEffect(() => {
    setDisplayUser(getDisplayUser());
  }, [location.pathname]);

  const toggleMenu = (menuName) => {
    setExpandedMenus((prev) => ({
      ...prev,
      [menuName]: !prev[menuName],
    }));
  };

  const isActivePath = (path) => {
    return location.pathname === path;
  };

  return (
    <div className="navbar-root">
      {/* Header */}
      <AppBar position="static" className="navbar-appbar">
        <Toolbar className="navbar-toolbar">
          <Box className="navbar-logo-section">
            <img src={UlapBizLogo} alt="Ulap Biz" className="navbar-logo" />
            <Box className="navbar-title">
              Ulap<span className="navbar-biz-text">Biz</span>
              <span className="navbar-version-text">
                {" "}
                - Applicant Evaluation
              </span>
            </Box>
          </Box>
        </Toolbar>
      </AppBar>

      {/* Main Content Area */}
      <Box className="navbar-main-content">
        {/* Sidebar */}
        <Drawer
          anchor="left"
          className="navbar-drawer"
          classes={{ paper: "navbar-drawer-paper" }}
          variant="permanent"
        >
          <Box className="navbar-drawer-content">
            {/* User Profile Section in Sidebar */}
            <Box className="navbar-user-profile">
              <Avatar className="navbar-user-avatar">
                {displayUser.initials}
              </Avatar>
              <Box className="navbar-user-info">
                <span className="navbar-user-name">{displayUser.name}</span>
              </Box>
            </Box>

            {/* Menu Items */}
            <List component="nav" className="navbar-menu-list">
              {MENU_ITEMS.map((item) => {
                const IconComponent = item.icon;
                const isExpanded = expandedMenus[item.label];
                const hasSubmenu = item.submenu && item.submenu.length > 0;
                const isActive = hasSubmenu
                  ? item.submenu.some((subitem) => isActivePath(subitem.path))
                  : item.path && isActivePath(item.path);

                return (
                  <div key={item.label}>
                    <ListItem
                      button
                      className={`navbar-menu-item ${isActive ? "navbar-menu-item-active" : ""}`}
                      onClick={() => {
                        if (hasSubmenu) {
                          toggleMenu(item.label);
                        } else if (item.path) {
                          navigate(item.path);
                        }
                      }}
                    >
                      <ListItemIcon className="navbar-menu-icon">
                        <IconComponent />
                      </ListItemIcon>
                      <ListItemText primary={item.label} />
                      {hasSubmenu &&
                        (isExpanded ? (
                          <ExpandLess className="navbar-expand-icon" />
                        ) : (
                          <ExpandMore className="navbar-expand-icon" />
                        ))}
                    </ListItem>

                    {hasSubmenu && (
                      <Collapse in={isExpanded} timeout="auto" unmountOnExit>
                        <List component="div" disablePadding>
                          {item.submenu.map((subitem) => {
                            const isActive = isActivePath(subitem.path);
                            return (
                              <ListItem
                                button
                                key={subitem.path}
                                className={`navbar-submenu-item ${isActive ? "navbar-submenu-item-active" : ""}`}
                                onClick={() => navigate(subitem.path)}
                              >
                                <ListItemText primary={subitem.label} />
                              </ListItem>
                            );
                          })}
                        </List>
                      </Collapse>
                    )}
                  </div>
                );
              })}
            </List>
          </Box>
        </Drawer>

        {/* Main Content */}
        <Box className="navbar-content">
          <Container maxWidth="lg">
            <Outlet />
          </Container>
        </Box>
      </Box>
    </div>
  );
}

export default Navbar;
