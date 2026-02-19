import React, { useState } from "react";
import UlapBizLogo from "src/images/ulapbiz.png";
import MenuIcon from "@material-ui/icons/Menu";
import CloseIcon from "@material-ui/icons/Close";
import { useAuth } from "src/contexts/AuthContext";

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
  Dialog,
  DialogTitle,
  DialogContent,
  TextField,
  Button,
  FormControlLabel,
  Checkbox,
  Snackbar,
  SnackbarContent,
} from "@material-ui/core";

const pages = [
  { label: "Home", anchor: "home", path: "https://ulap.biz/" },
  { label: "Plans", anchor: "plans", path: "https://ulap.biz/plans" },
  {
    label: "Accounting and Beyond",
    anchor: "accounting-and-beyond",
    path: "https://ulap.biz/accounting-and-beyond",
  },
  { label: "Features", anchor: "features", path: "https://ulap.biz/notable-features" },
  {
    label: "Schedules and Reports",
    anchor: "schedules-and-reports",
    path: "https://ulap.biz/reports-and-schedule",
  },
  { label: "Contact Us", anchor: "contact-us", path: "https://ulap.biz/contact-us" },
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
    "&:hover": {
      backgroundColor: theme.palette.primary.main,
      color: "#FAFAFA",
    },
  },
  signup: {
    fontSize: ".8rem",
    padding: ".5rem 1rem",
    borderRadius: ".25rem",
    border: `1px solid ${theme.palette.primary.main}`,
    backgroundColor: theme.palette.primary.main,
    color: "#FAFAFA",
    "&:hover": {
      backgroundColor: "#FAFAFA",
      color: theme.palette.primary.main,
      border: `1px solid ${theme.palette.primary.main}`,
    },
  },
}));

const Navbar = () => {
  const classes = useStyles();
  const theme = useTheme();
  const { login, register, logout, user, loading } = useAuth();

  const [open, setOpen] = useState(false);
  const [signInOpen, setSignInOpen] = useState(false);
  const [signUpOpen, setSignUpOpen] = useState(false);
  const [signInEmail, setSignInEmail] = useState("");
  const [signInPassword, setSignInPassword] = useState("");
  const [signUpEmail, setSignUpEmail] = useState("");
  const [signUpPassword, setSignUpPassword] = useState("");
  const [signUpConfirmPassword, setSignUpConfirmPassword] = useState("");
  const [authError, setAuthError] = useState(null);
  const [showError, setShowError] = useState(false);
  const isXs = useMediaQuery(theme.breakpoints.down("xs"));

  const handleSignIn = async (event) => {
    event.preventDefault();
    setAuthError(null);
    const result = await login(signInEmail, signInPassword);
    if (result.success) {
      setSignInOpen(false);
      setSignInEmail("");
      setSignInPassword("");
    } else {
      setAuthError(result.error);
      setShowError(true);
    }
  };

  const handleSignUp = async (event) => {
    event.preventDefault();
    setAuthError(null);
    const result = await register(signUpEmail, signUpPassword, signUpConfirmPassword);
    if (result.success) {
      setSignUpOpen(false);
      setSignUpEmail("");
      setSignUpPassword("");
      setSignUpConfirmPassword("");
    } else {
      setAuthError(result.error);
      setShowError(true);
    }
  };

  const handleSmoothScroll = (sectionId, fallbackUrl) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
    } else if (fallbackUrl) {
      window.location.href = fallbackUrl;
    }
    if (open) setOpen(false);
  };

  return (
    <>
      <AppBar elevation={2} color="inherit">
        <Container maxWidth="lg">
          <Toolbar disableGutters className={classes.toolbar}>
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                [theme.breakpoints.up("md")]: {
                  justifyContent: "start",
                  gap: "2rem",
                },
                alignItems: "center",
                width: "100%",
              }}>
              <Box className={classes.iconContainer}>
                <button
                  onClick={() => handleSmoothScroll("ulap", "https://ulap.biz/")}
                  style={{ background: "none", border: "none", padding: 0, cursor: "pointer" }}>
                  <Avatar src={UlapBizLogo} />
                </button>
                <Link
                  variant="h4"
                  underline="none"
                  color="textPrimary"
                  onClick={() => handleSmoothScroll("ulap", "https://ulap.biz/")}
                  style={{ cursor: "pointer" }}>
                  Ulap<span className={classes.biz}>Biz</span>
                </Link>
              </Box>
              {isXs && (
                <Box
                  sx={{
                    width: "100%",
                    display: "flex",
                    justifyContent: "flex-end",
                  }}>
                  {open ? (
                    <CloseIcon color="primary" onClick={() => setOpen(false)} />
                  ) : (
                    <MenuIcon color="primary" onClick={() => setOpen(true)} />
                  )}
                </Box>
              )}
              {!isXs && (
                <Box
                  sx={{
                    display: "flex",
                    gap: "1rem",
                    justifyContent: "space-between",
                    width: "100%",
                    "& :hover": {
                      color: "#FF7704",
                    },
                  }}>
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: "1rem",
                    }}>
                    {pages.map((page) => (
                      <Link
                        key={page.label}
                        variant="h6"
                        underline="none"
                        color="textPrimary"
                        onClick={() => handleSmoothScroll(page.anchor, page.path)}
                        style={{
                          fontSize: ".8rem",
                          cursor: "pointer",
                        }}>
                        {page.label}
                      </Link>
                    ))}
                  </Box>
                  <Box
                    sx={{
                      display: "flex",
                      gap: "1rem",
                      alignItems: "center",
                    }}>
                    {user ? (
                      <>
                        <span style={{ fontSize: ".8rem" }}>Welcome, {user.email}</span>
                        <Button size="small" variant="outlined" color="primary" onClick={logout}>
                          Logout
                        </Button>
                      </>
                    ) : (
                      <>
                        <Link
                          key="signin"
                          variant="h6"
                          onClick={() => setSignInOpen(true)}
                          underline="none"
                          color="textPrimary"
                          className={classes.signin}
                          style={{ cursor: "pointer" }}>
                          Sign In
                        </Link>
                        <Link
                          key="signup"
                          variant="h6"
                          onClick={() => setSignUpOpen(true)}
                          underline="none"
                          color="textPrimary"
                          className={classes.signup}
                          style={{ cursor: "pointer" }}>
                          Sign Up
                        </Link>
                      </>
                    )}
                  </Box>
                </Box>
              )}
            </Box>
          </Toolbar>
          <Collapse in={open}>
            {isXs && (
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  width: "100%",
                  gap: "1rem",
                  marginBottom: "1rem",
                  height: "100vh",
                }}>
                {pages.map((page) => (
                  <Link
                    key={page.label}
                    variant="h6"
                    underline="none"
                    color="primary"
                    onClick={() => handleSmoothScroll(page.anchor, page.path)}
                    style={{ cursor: "pointer" }}>
                    {page.label}
                  </Link>
                ))}
                {user ? (
                  <Button size="small" variant="outlined" color="primary" onClick={logout}>
                    Logout
                  </Button>
                ) : (
                  <>
                    <Link
                      key="signin"
                      variant="h6"
                      onClick={() => setSignInOpen(true)}
                      underline="none"
                      color="textPrimary"
                      style={{ color: theme.palette.primary.main, cursor: "pointer" }}>
                      Sign In
                    </Link>
                    <Link
                      key="signup"
                      variant="h6"
                      onClick={() => setSignUpOpen(true)}
                      underline="none"
                      color="textPrimary"
                      style={{ color: theme.palette.primary.main, cursor: "pointer" }}>
                      Sign Up
                    </Link>
                  </>
                )}
              </Box>
            )}
          </Collapse>
        </Container>
      </AppBar>

      <Dialog
        open={signInOpen}
        onClose={() => {
          setSignInOpen(false);
          setAuthError(null);
        }}
        maxWidth="sm"
        fullWidth>
        <DialogTitle>Sign In</DialogTitle>
        <DialogContent>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2, pt: 2 }}>
            <TextField
              label="Email"
              type="email"
              fullWidth
              variant="outlined"
              placeholder="Enter your email"
              value={signInEmail}
              onChange={(event) => setSignInEmail(event.target.value)}
            />
            <TextField
              label="Password"
              type="password"
              fullWidth
              variant="outlined"
              placeholder="Enter your password"
              value={signInPassword}
              onChange={(event) => setSignInPassword(event.target.value)}
            />
            <FormControlLabel control={<Checkbox />} label="Remember me" />
            <Button
              variant="contained"
              color="primary"
              fullWidth
              size="large"
              onClick={handleSignIn}
              disabled={loading}>
              {loading ? "Signing In..." : "Sign In"}
            </Button>
          </Box>
        </DialogContent>
      </Dialog>

      <Dialog
        open={signUpOpen}
        onClose={() => {
          setSignUpOpen(false);
          setAuthError(null);
        }}
        maxWidth="sm"
        fullWidth>
        <DialogTitle>Sign Up</DialogTitle>
        <DialogContent>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2, pt: 2 }}>
            <TextField
              label="Email"
              type="email"
              fullWidth
              variant="outlined"
              placeholder="Enter your email"
              value={signUpEmail}
              onChange={(event) => setSignUpEmail(event.target.value)}
            />
            <TextField
              label="Password"
              type="password"
              fullWidth
              variant="outlined"
              placeholder="Create a password"
              value={signUpPassword}
              onChange={(event) => setSignUpPassword(event.target.value)}
            />
            <TextField
              label="Confirm Password"
              type="password"
              fullWidth
              variant="outlined"
              placeholder="Confirm your password"
              value={signUpConfirmPassword}
              onChange={(event) => setSignUpConfirmPassword(event.target.value)}
            />
            <FormControlLabel control={<Checkbox />} label="I agree to the Terms & Conditions" />
            <Button
              variant="contained"
              color="primary"
              fullWidth
              size="large"
              onClick={handleSignUp}
              disabled={loading}>
              {loading ? "Creating Account..." : "Sign Up"}
            </Button>
          </Box>
        </DialogContent>
      </Dialog>

      <Snackbar
        open={showError}
        autoHideDuration={4000}
        onClose={() => setShowError(false)}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}>
        <SnackbarContent style={{ backgroundColor: "#f44336" }} message={authError} />
      </Snackbar>
    </>
  );
};

export default Navbar;
