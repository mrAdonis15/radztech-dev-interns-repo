import React from "react";
import { Outlet, NavLink } from "react-router-dom";
import { Box, makeStyles } from "@material-ui/core";
import UniversalNavbar from "../../UniversalNavbar/UniversalNavbar";
import "./Layout.css";

const useStyles = makeStyles((theme) => ({
  subNav: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    gap: theme.spacing(3),
    padding: theme.spacing(1, 2),
    background: "#fff",
    borderBottom: "1px solid #eee",
    flexShrink: 0,
  },
  subNavLink: {
    color: "#666",
    textDecoration: "none",
    fontSize: "0.875rem",
    fontWeight: 500,
    "&:hover": { color: "#DB6700" },
    "&.active": { color: "#DB6700", fontWeight: 600 },
  },
}));

const ProductFinderLayout = () => {
  const classes = useStyles();
  return (
    <>
      <UniversalNavbar />
      <nav className={classes.subNav}>
        <NavLink
          to="/ProductFinder"
          end
          className={({ isActive }) =>
            `${classes.subNavLink} ${isActive ? "active" : ""}`
          }
        >
          Home
        </NavLink>
        <NavLink
          to="/ProductFinder/Questionnaire"
          className={({ isActive }) =>
            `${classes.subNavLink} ${isActive ? "active" : ""}`
          }
        >
          Questionnaire
        </NavLink>
        <NavLink
          to="/ProductFinder/Pricing"
          className={({ isActive }) =>
            `${classes.subNavLink} ${isActive ? "active" : ""}`
          }
        >
          Pricing
        </NavLink>
        <NavLink
          to="/ProductFinder/ContactUs"
          className={({ isActive }) =>
            `${classes.subNavLink} ${isActive ? "active" : ""}`
          }
        >
          Contact Us
        </NavLink>
      </nav>
      <Box
        component="main"
        className="product-finder-main"
        aria-label="Main content"
      >
        <Outlet />
      </Box>
    </>
  );
};

export default ProductFinderLayout;
