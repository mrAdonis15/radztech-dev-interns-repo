import React from "react";
import { Outlet, NavLink } from "react-router-dom";
import { Box, makeStyles } from "@material-ui/core";

const useStyles = makeStyles((theme) => ({
  layout: {
    minHeight: "100vh",
    display: "flex",
    flexDirection: "column",
    background: "#fafafa",
    "@media print": {
      background: "#fff !important",
      minHeight: "auto",
    },
  },
  nav: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    gap: theme.spacing(3),
    padding: theme.spacing(1.5, 2),
    flexShrink: 0,
    borderBottom: "1px solid #eee",
    background: "#fff",
    boxShadow: "0 1px 8px rgba(0, 0, 0, 0.06)",
  },
  navLink: {
    color: "#666",
    textDecoration: "none",
    fontSize: "0.875rem",
    fontWeight: 500,
    padding: theme.spacing(0.75, 0),
    whiteSpace: "nowrap",
    transition: "color 0.15s ease",
    "&:hover": { color: "#111" },
  },
  navLinkActive: {
    color: "#111",
    fontWeight: 600,
  },
  main: {
    flex: 1,
    width: "100%",
    maxWidth: 880,
    margin: theme.spacing(2, "auto", 3),
    padding: theme.spacing(2, 2.5),
    boxSizing: "border-box",
    background: "transparent",
    [theme.breakpoints.down("sm")]: {
      marginLeft: theme.spacing(1.5),
      marginRight: theme.spacing(1.5),
      padding: theme.spacing(2),
    },
    "@media print": {
      background: "#fff !important",
      margin: 0,
      padding: 0,
      maxWidth: "none",
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
            isActive
              ? `${classes.navLink} ${classes.navLinkActive}`
              : classes.navLink
          }
        >
          Calculator
        </NavLink>
      </nav>
      <Box component="main" className={classes.main}>
        <Outlet />
      </Box>
    </Box>
  );
}

export default Layout;
