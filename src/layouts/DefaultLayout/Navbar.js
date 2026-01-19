import React, { useState } from "react";
import { Link as RouterLink } from "react-router-dom";
import UlapBizLogo from "src/images/ulapbiz.png";
import MenuIcon from '@material-ui/icons/Menu';
import CloseIcon from '@material-ui/icons/Close';

import {
  Avatar,
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

const pages = [
  "Home",
  "Plans",
  "Accounting and Beyond",
  "Features",
  "Schedules and Reports",
  "Contact Us",
];

const useStyles = makeStyles((theme) => ({
  toolbar: {
    background: "#fff",
    height: 60,
  },
  appBar: {
    [theme.breakpoints.down("md")]: {
      height: "100%",
    },
  },
  biz: {
    color: "#FF7704",
    fontWeight: 900,
  },
  iconContainer: {
    display: "flex",
    gap: ".3em",
    alignItems: "center",
    filter: "grayscale(10%)",
    transition: "all 500ms ease-in-out",
    [theme.breakpoints.down("md")]: {
      flexGrow: 1,
    },
    "&:hover": {
      filter: "grayscale(0)",
    },
  },
  signin: {
    fontSize: ".8rem",
    border: `1px solid ${theme.palette.primary.main}`,
    padding: ".5rem 1rem",
    borderRadius: ".25rem",
    '&:hover': {
      backgroundColor: theme.palette.primary.main,
      color: '#FAFAFA',
    },
  },
  signup: {
    fontSize: ".8rem",
    padding: ".5rem 1rem",
    borderRadius: ".25rem",
    border: `1px solid ${theme.palette.primary.main}`,
    backgroundColor: theme.palette.primary.main,
    color: '#FAFAFA',
    '&:hover': {
      backgroundColor: '#FAFAFA',
      color: theme.palette.primary.main,
      border: `1px solid ${theme.palette.primary.main}`,
    },
  }
}));

const Navbar = () => {
  const classes = useStyles();
  const theme = useTheme();

  const [open, setOpen] = useState(false);
  const isXs = useMediaQuery(theme.breakpoints.down("xs"));

  return (
    <AppBar elevation={2} color="inherit">
      <Container maxWidth="lg">
        <Toolbar disableGutters className={classes.toolbar}>
          <Box sx={{
            display: "flex",
            justifyContent: "space-between",
            [theme.breakpoints.up('md')]: {
              justifyContent: "start",
              gap: "2rem",
            },
            alignItems: "center",
            width: "100%",
          }}>
            <Box className={classes.iconContainer}>
              <RouterLink to="/" >
                <Avatar src={UlapBizLogo} />
              </RouterLink>
              <Link
                component={RouterLink}
                variant="h4"
                to="/"
                underline="none"
                color="textPrimary"
              >
                Ulap<span className={classes.biz}>Biz</span>
              </Link>
            </Box>
            {isXs && <Box sx={{
              width: "100%",
              display: "flex",
              justifyContent: "flex-end",
            }}>
              {open ?
                <CloseIcon color="primary" onClick={() => setOpen(false)} /> :
                <MenuIcon color="primary" onClick={() => setOpen(true)} />}
            </Box>}
            {!isXs &&
              <Box sx={{
                display: "flex",
                gap: "1rem",
                justifyContent: "space-between",
                width: "100%",
                "& :hover": {
                  color: "#FF7704",
                }
              }}>
                <Box sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: "1rem",
                }}>
                  {!isXs && pages.map((page, index) => (
                    <Link
                      key={index}
                      component={RouterLink}
                      variant="h6"
                      to={`/${page.toLowerCase().replace(" ", "-")}`}
                      underline="none"
                      color="textPrimary"
                      style={{
                        fontSize: ".8rem",
                      }}
                    >
                      {page}
                    </Link>
                  ))}
                </Box>
                {!isXs &&
                  <Box sx={{
                    display: "flex",
                    gap: "1rem",
                  }}>
                    <Link
                      key="signin"
                      component={RouterLink}
                      variant="h6"
                      to='test'
                      underline="none"
                      color="textPrimary"
                      className={classes.signin}
                    >
                      Sign In
                    </Link>
                    <Link
                      key="signup"
                      component={RouterLink}
                      variant="h6"
                      to='test'
                      underline="none"
                      color="textPrimary"
                      className={classes.signup}
                    >
                      Sign Up
                    </Link>
                  </Box>
                }
              </Box>
            }
          </Box>
        </Toolbar>
        <Collapse in={open}>
          {isXs &&
            <Box sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              width: "100%",
              gap: "1rem",
              marginBottom: "1rem",
              height: "100vh",
            }}>
              {pages.map((page, index) => (
                <Link
                  key={index}
                  component={RouterLink}
                  variant="h6"
                  to={`/${page.toLowerCase().replace(" ", "-")}`}
                  underline="none"
                  color="primary"
                >
                  {page}
                </Link>

              ))}
              <Link
                key="signin"
                component={RouterLink}
                variant="h6"
                to='test'
                underline="none"
                color="textPrimary"
                style={{
                  color: theme.palette.primary.main,
                }}
              >
                Sign In
              </Link>
              <Link
                key="signup"
                component={RouterLink}
                variant="h6"
                to='test'
                underline="none"
                color="textPrimary"
                style={{
                  color: theme.palette.primary.main,
                }}
              >
                Sign Up
              </Link>
            </Box>
          }
          {isXs &&
            <>
              <Link
                key="signin"
                component={RouterLink}
                variant="h6"
                to='test'
                underline="none"
                color="textPrimary"
              // className={classes.signin}
              >
                Sign In
              </Link>
              <Link
                key="signup"
                component={RouterLink}
                variant="h6"
                to='test'
                underline="none"
                color="textPrimary"
              // className={classes.signup}
              >
                Sign Up
              </Link>
            </>
          }
        </Collapse>
      </Container>
    </AppBar >
  );
};

export default Navbar;
