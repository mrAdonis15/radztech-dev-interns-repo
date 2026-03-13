import React, { useState } from "react";
import { Link as RouterLink, useLocation } from "react-router-dom";
import UlapBizIcon from "../Images/ulapbiz.png";
import UlapBizLogo from "../Images/Ulap_Biz.png";
import MenuIcon from "@material-ui/icons/Menu";
import CloseIcon from "@material-ui/icons/Close";

import {
  AppBar,
  Toolbar,
  makeStyles,
  Link,
  Box,
  Container,
  Collapse,
  useMediaQuery,
  useTheme,
} from "@material-ui/core";

const pages = ["Home", "Questionnaire", "Pricing", "Contact Us"];

const useStyles = makeStyles((theme) => ({
  toolbar: {
    background: "#fff",
    height: 60,
  },
  appBar: {
    [theme.breakpoints.down("md")]: {
      height: "100%",
    },
    "@media print": {
      display: "none !important",
    },
  },
  iconContainer: {
    display: "flex",
    gap: ".3em",
    alignItems: "center",
    filter: "grayscale(10%)",
    transition: "all 500ms ease-in-out",
    "&:hover": {
      filter: "grayscale(0)",
    },
  },
  logoImg: {
    height: 38,
    width: "auto",
    display: "block",
  },
  logoWordmark: {
    height: 22,
    width: "auto",
    display: "block",
  },
  navLink: {
    fontWeight: 600,
    transition: "color 0.25s ease",
    "&:hover": {
      color: "#FF7704",
    },
  },
  activeLink: {
    color: "#FF7704 !important",
    fontWeight: 700,
    borderBottom: "2px solid #FF7704",
  },
  boxFlex: {
    display: "flex",
    alignItems: "center",
    width: "100%",
  },
  boxLogo: {
    flex: 1,
    display: "flex",
    alignItems: "center",
  },
  boxMenuEnd: {
    display: "flex",
    justifyContent: "flex-end",
    flex: 1,
  },
  boxNavCenter: {
    flex: 1,
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    gap: "1.8rem",
    "& a:hover": {
      color: "#FF7704",
    },
  },
  boxSpacer: {
    flex: 1,
  },
  mobileMenu: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    width: "100%",
    gap: "1rem",
    marginBottom: "1rem",
    height: "100vh",
  },
}));

const Navbar = ({ basePath = "" }) => {
  const classes = useStyles();
  const theme = useTheme();
  const location = useLocation();

  const [open, setOpen] = useState(false);
  const isXs = useMediaQuery(theme.breakpoints.down("xs"));

  const getPathFromPage = (page) => {
    const root = basePath || "";
    if (page === "Home") return root || "/";
    if (page === "Questionnaire")
      return root ? `${root}/Questionnaire` : "/questionnaire";
    if (page === "Pricing") return root ? `${root}/Pricing` : "/pricing";
    if (page === "Contact Us")
      return root ? `${root}/ContactUs` : "/contact-us";
    return root
      ? `${root}/${page.toLowerCase().replace(/\s+/g, "-")}`
      : `/${page.toLowerCase().replace(/\s+/g, "-")}`;
  };

  const isActive = (page) => {
    const path = getPathFromPage(page);
    if (page === "Home") {
      const isHomePath = basePath
        ? location.pathname === basePath || location.pathname === `${basePath}/`
        : location.pathname === "/";
      return isHomePath && (!location.hash || location.hash === "#hero");
    }
    return location.pathname === path;
  };

  return (
    <AppBar elevation={2} color="inherit" className={classes.appBar}>
      <Container maxWidth="lg">
        <Toolbar disableGutters className={classes.toolbar}>
          <Box className={classes.boxFlex}>
            {/* LEFT - LOGO */}
            <Box className={classes.boxLogo}>
              <Box className={classes.iconContainer}>
                <RouterLink
                  to={basePath || "/"}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: theme.spacing(1),
                  }}
                >
                  <img src={UlapBizIcon} alt="" className={classes.logoImg} />
                  <img
                    src={UlapBizLogo}
                    alt="UlapBiz"
                    className={classes.logoWordmark}
                  />
                </RouterLink>
              </Box>
            </Box>

            {/* MOBILE MENU BUTTON */}
            {isXs && (
              <Box className={classes.boxMenuEnd}>
                {open ? (
                  <CloseIcon color="primary" onClick={() => setOpen(false)} />
                ) : (
                  <MenuIcon color="primary" onClick={() => setOpen(true)} />
                )}
              </Box>
            )}

            {/* CENTER NAV ITEMS */}
            {!isXs && (
              <>
                <Box className={classes.boxNavCenter}>
                  {pages.map((page, index) => (
                    <Link
                      key={index}
                      component={RouterLink}
                      variant="h6"
                      to={getPathFromPage(page)}
                      underline="none"
                      color="textPrimary"
                      className={`${isActive(page) ? classes.activeLink : ""} ${classes.navLink}`}
                      style={{ fontSize: ".8rem" }}
                    >
                      {page}
                    </Link>
                  ))}
                </Box>

                {/* RIGHT SPACER */}
                <Box sx={{ flex: 1 }} />
              </>
            )}
          </Box>
        </Toolbar>

        {/* MOBILE MENU */}
        <Collapse in={open}>
          {isXs && (
            <Box className={classes.mobileMenu}>
              {pages.map((page, index) => (
                <Link
                  key={index}
                  component={RouterLink}
                  variant="h6"
                  to={getPathFromPage(page)}
                  underline="none"
                  color="textPrimary"
                  onClick={() => setOpen(false)}
                  className={`${isActive(page) ? classes.activeLink : ""} ${classes.navLink}`}
                  style={{ fontSize: "1rem" }}
                >
                  {page}
                </Link>
              ))}
            </Box>
          )}
        </Collapse>
      </Container>
    </AppBar>
  );
};

export default Navbar;
