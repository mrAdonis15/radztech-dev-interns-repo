import React from "react";
import { Outlet, NavLink } from "react-router-dom";
import { Box, makeStyles } from "@material-ui/core";

const useStyles = makeStyles((theme) => ({
  layout: {
    minHeight: "100vh",
    display: "flex",
    flexDirection: "column",
    background: "linear-gradient(to right, #f7b272 0%, #db6700 100%)",
    backgroundAttachment: "fixed",
    "@media print": {
      background: "#fff !important",
      minHeight: "auto",
    },
  },
  nav: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: theme.spacing(1),
    padding: theme.spacing(2, 3),
    flexShrink: 0,
    borderBottom: "1px solid rgba(0, 0, 0, 0.08)",
    background: "rgba(255, 255, 255, 0.25)",
    [theme.breakpoints.down("sm")]: {
      padding: theme.spacing(2),
    },
  },
  navLink: {
    color: "#5a524c",
    textDecoration: "none",
    fontSize: "0.9375rem",
    fontWeight: 500,
    padding: theme.spacing(1, 2),
    borderRadius: 8,
    transition: "color 0.18s ease, background 0.18s ease",
    whiteSpace: "nowrap",
    "&:hover": {
      color: "#1a1a1a",
      background: "rgba(255, 255, 255, 0.6)",
    },
  },
  navLinkActive: {
    color: "#1a1a1a",
    fontWeight: 600,
    background: "rgba(255, 255, 255, 0.7)",
  },
  main: {
    flex: 1,
    width: "100%",
    maxWidth: 920,
    margin: theme.spacing(3, "auto", 4),
    padding: theme.spacing(3, 3),
    boxSizing: "border-box",
    background: "#fafafa",
    borderRadius: 16,
    boxShadow: "0 2px 12px rgba(0, 0, 0, 0.06)",
    border: "1px solid #e8e8e8",
    [theme.breakpoints.down("sm")]: {
      marginLeft: theme.spacing(2),
      marginRight: theme.spacing(2),
      marginBottom: theme.spacing(2),
    },
    [theme.breakpoints.down("xs")]: {
      padding: theme.spacing(2, 2),
      marginLeft: theme.spacing(1.5),
      marginRight: theme.spacing(1.5),
    },
    "@media print": {
      background: "#fff !important",
      boxShadow: "none",
      border: "none",
    },
  },
}));

function Layout() {
  const classes = useStyles();

  return (
    <Box className={classes.layout}>
      <nav className={classes.nav}>
        <NavLink
          to="/BDCalculator"
          end
          className={({ isActive }) =>
            isActive ? `${classes.navLink} ${classes.navLinkActive}` : classes.navLink
          }
        >
          Calculator
        </NavLink>
        <NavLink
          to="/BDCalculator/About"
          className={({ isActive }) =>
            isActive ? `${classes.navLink} ${classes.navLinkActive}` : classes.navLink
          }
        >
          About
        </NavLink>
      </nav>
      <Box component="main" className={classes.main}>
        <Outlet />
      </Box>
    </Box>
  );
}

export default Layout;
