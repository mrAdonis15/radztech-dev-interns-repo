import React, { useState } from "react";
import { Link as RouterLink, useLocation } from "react-router-dom";
import {
  AppBar,
  Toolbar,
  Box,
  Button,
  Link,
  Menu,
  MenuItem,
  makeStyles,
  useMediaQuery,
  useTheme,
  IconButton,
  Collapse,
} from "@material-ui/core";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";
import MenuIcon from "@material-ui/icons/Menu";
import CloseIcon from "@material-ui/icons/Close";

import UlapBizIcon from "../Product-Finder/Images/ulapbiz.png";
import UlapBizLogo from "../Product-Finder/Images/Ulap_Biz.png";

const useStyles = makeStyles((theme) => ({
  appBar: {
    background: "#fff",
    color: "#1a1a1a",
    boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
    fontFamily: '"Roboto", sans-serif',
    "@media print": { display: "none !important" },
  },
  toolbar: {
    minHeight: 56,
    paddingLeft: theme.spacing(2),
    paddingRight: theme.spacing(2),
    [theme.breakpoints.up("md")]: { minHeight: 64 },
  },
  logoWrap: {
    display: "flex",
    alignItems: "center",
    gap: theme.spacing(1),
    textDecoration: "none",
    color: "inherit",
    marginRight: theme.spacing(4),
  },
  logoIcon: {
    height: 36,
    width: "auto",
    display: "block",
    [theme.breakpoints.up("md")]: { height: 40 },
  },
  logoWordmark: {
    height: 20,
    width: "auto",
    display: "block",
    [theme.breakpoints.up("md")]: { height: 22 },
  },
  navCenter: {
    flex: 1,
    display: "none",
    justifyContent: "center",
    alignItems: "center",
    gap: theme.spacing(0.5),
    [theme.breakpoints.up("md")]: { display: "flex" },
  },
  navLink: {
    fontFamily: '"Fira Sans", sans-serif',
    color: "#1a1a1a",
    textDecoration: "none",
    fontSize: "0.9375rem",
    fontWeight: 500,
    padding: theme.spacing(1, 1.25),
    borderRadius: 6,
    display: "inline-flex",
    alignItems: "center",
    transition: "color 0.2s ease, background 0.2s ease",
    "&:hover": { color: "#DB6700", background: "rgba(219, 103, 0, 0.06)" },
  },
  navLinkActive: {
    color: "#DB6700",
    fontWeight: 600,
  },
  caret: {
    marginLeft: 2,
    fontSize: "1.125rem",
    color: "inherit",
  },
  buttons: {
    display: "flex",
    alignItems: "center",
    gap: theme.spacing(1.5),
  },
  btnLogin: {
    fontFamily: '"Roboto", sans-serif',
    background: "#DB6700",
    color: "#fff",
    textTransform: "none",
    fontWeight: 600,
    fontSize: "0.875rem",
    padding: theme.spacing(0.75, 2),
    borderRadius: 8,
    "&:hover": { background: "#C45D00" },
  },
  btnRegister: {
    fontFamily: '"Roboto", sans-serif',
    border: "2px solid #DB6700",
    color: "#DB6700",
    textTransform: "none",
    fontWeight: 600,
    fontSize: "0.875rem",
    padding: theme.spacing(0.625, 2),
    borderRadius: 8,
    "&:hover": { borderColor: "#C45D00", color: "#C45D00", background: "rgba(219, 103, 0, 0.06)" },
  },
  mobileMenuBtn: {
    [theme.breakpoints.up("md")]: { display: "none" },
  },
  mobileMenu: {
    padding: theme.spacing(2),
    borderTop: "1px solid #eee",
    background: "#fff",
    fontFamily: '"Roboto", sans-serif',
  },
  mobileLink: {
    fontFamily: '"Roboto", sans-serif',
    display: "block",
    padding: theme.spacing(1.25, 0),
    color: "#1a1a1a",
    textDecoration: "none",
    fontSize: "0.9375rem",
    fontWeight: 500,
    "&:hover": { color: "#DB6700" },
  },
  mobileDropdown: {
    paddingLeft: theme.spacing(2),
  },
  menuItem: {
    fontFamily: '"Roboto", sans-serif',
  },
}));

const PRODUCTS_ITEMS = [
  { label: "13th Month Calculator", path: "/BDCalculator" },
  { label: "Product Finder", path: "/ProductFinder" },
];

const RESOURCES_ITEMS = [
  { label: "Contact Us", path: "/ProductFinder/ContactUs" },
];

export default function UniversalNavbar() {
  const classes = useStyles();
  const theme = useTheme();
  const location = useLocation();
  const isMdUp = useMediaQuery(theme.breakpoints.up("md"));

  const [productsAnchor, setProductsAnchor] = useState(null);
  const [solutionsAnchor, setSolutionsAnchor] = useState(null);
  const [featuresAnchor, setFeaturesAnchor] = useState(null);
  const [resourcesAnchor, setResourcesAnchor] = useState(null);
  const [mobileOpen, setMobileOpen] = useState(false);

  const closeAllMenus = () => {
    setProductsAnchor(null);
    setSolutionsAnchor(null);
    setFeaturesAnchor(null);
    setResourcesAnchor(null);
  };

  const isActive = (path) => {
    if (path === "/BDCalculator")
      return location.pathname === "/BDCalculator" || location.pathname.startsWith("/BDCalculator/");
    if (path === "/ProductFinder")
      return location.pathname === "/ProductFinder" || location.pathname.startsWith("/ProductFinder/");
    return location.pathname === path || location.pathname.startsWith(path + "/");
  };

  const linkProps = (path) => ({
    component: RouterLink,
    to: path,
    underline: "none",
    className: classes.navLink,
  });

  return (
    <AppBar position="sticky" elevation={0} className={classes.appBar}>
      <Toolbar className={classes.toolbar} disableGutters>
        <Link
          component={RouterLink}
          to="/BDCalculator"
          className={classes.logoWrap}
          underline="none"
        >
          <img src={UlapBizIcon} alt="" className={classes.logoIcon} />
          <img src={UlapBizLogo} alt="UlapBiz" className={classes.logoWordmark} />
        </Link>

        <Box className={classes.navCenter}>
          <Link
            {...linkProps("#")}
            onClick={(e) => {
              e.preventDefault();
              setProductsAnchor(e.currentTarget);
            }}
            className={isActive("/BDCalculator") || isActive("/ProductFinder") ? `${classes.navLink} ${classes.navLinkActive}` : classes.navLink}
          >
            Products
            <ExpandMoreIcon className={classes.caret} />
          </Link>
          <Link
            {...linkProps("#")}
            onClick={(e) => {
              e.preventDefault();
              setSolutionsAnchor(e.currentTarget);
            }}
            className={classes.navLink}
          >
            Solutions
            <ExpandMoreIcon className={classes.caret} />
          </Link>
          <Link
            {...linkProps("#")}
            onClick={(e) => {
              e.preventDefault();
              setFeaturesAnchor(e.currentTarget);
            }}
            className={classes.navLink}
          >
            Features
            <ExpandMoreIcon className={classes.caret} />
          </Link>
          <Link
            component={RouterLink}
            to="/ProductFinder/Pricing"
            underline="none"
            className={`${classes.navLink} ${isActive("/ProductFinder/Pricing") ? classes.navLinkActive : ""}`}
          >
            Pricing
          </Link>
          <Link
            {...linkProps("#")}
            onClick={(e) => {
              e.preventDefault();
              setResourcesAnchor(e.currentTarget);
            }}
            className={classes.navLink}
          >
            Resources
            <ExpandMoreIcon className={classes.caret} />
          </Link>
        </Box>

        <Box className={classes.buttons}>
          {isMdUp ? (
            <>
              <Button className={classes.btnLogin} component={RouterLink} to="/login">
                Log In
              </Button>
              <Button className={classes.btnRegister} component={RouterLink} to="/login">
                Register
              </Button>
            </>
          ) : (
            <IconButton
              className={classes.mobileMenuBtn}
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label="Toggle menu"
            >
              {mobileOpen ? <CloseIcon /> : <MenuIcon />}
            </IconButton>
          )}
        </Box>
      </Toolbar>

      <Menu
        anchorEl={productsAnchor}
        open={Boolean(productsAnchor)}
        onClose={closeAllMenus}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
        transformOrigin={{ vertical: "top", horizontal: "center" }}
      >
        {PRODUCTS_ITEMS.map((item) => (
          <MenuItem
            key={item.path}
            component={RouterLink}
            to={item.path}
            onClick={closeAllMenus}
            className={classes.menuItem}
          >
            {item.label}
          </MenuItem>
        ))}
      </Menu>
      <Menu
        anchorEl={solutionsAnchor}
        open={Boolean(solutionsAnchor)}
        onClose={closeAllMenus}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
        transformOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <MenuItem onClick={closeAllMenus} className={classes.menuItem}>Coming soon</MenuItem>
      </Menu>
      <Menu
        anchorEl={featuresAnchor}
        open={Boolean(featuresAnchor)}
        onClose={closeAllMenus}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
        transformOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <MenuItem onClick={closeAllMenus} className={classes.menuItem}>Coming soon</MenuItem>
      </Menu>
      <Menu
        anchorEl={resourcesAnchor}
        open={Boolean(resourcesAnchor)}
        onClose={closeAllMenus}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
        transformOrigin={{ vertical: "top", horizontal: "center" }}
      >
        {RESOURCES_ITEMS.map((item) => (
          <MenuItem
            key={item.path}
            component={RouterLink}
            to={item.path}
            onClick={closeAllMenus}
            className={classes.menuItem}
          >
            {item.label}
          </MenuItem>
        ))}
      </Menu>

      <Collapse in={mobileOpen}>
        <Box className={classes.mobileMenu}>
          <Link component={RouterLink} to="/BDCalculator" className={classes.mobileLink} onClick={() => setMobileOpen(false)}>
            13th Month Calculator
          </Link>
          <Link component={RouterLink} to="/ProductFinder" className={classes.mobileLink} onClick={() => setMobileOpen(false)}>
            Product Finder
          </Link>
          <Link component={RouterLink} to="/ProductFinder/Pricing" className={classes.mobileLink} onClick={() => setMobileOpen(false)}>
            Pricing
          </Link>
          <Link component={RouterLink} to="/ProductFinder/ContactUs" className={classes.mobileLink} onClick={() => setMobileOpen(false)}>
            Contact Us
          </Link>
          <Box mt={2} display="flex" flexDirection="column" gap={1}>
            <Button fullWidth className={classes.btnLogin} component={RouterLink} to="/login" onClick={() => setMobileOpen(false)}>
              Log In
            </Button>
            <Button fullWidth className={classes.btnRegister} component={RouterLink} to="/login" onClick={() => setMobileOpen(false)}>
              Register
            </Button>
          </Box>
        </Box>
      </Collapse>
    </AppBar>
  );
}
