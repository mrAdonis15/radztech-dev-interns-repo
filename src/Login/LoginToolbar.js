import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import AppBar from "@material-ui/core/AppBar";
import Toolbar from "@material-ui/core/Toolbar";
import Button from "@material-ui/core/Button";
import ExitToAppIcon from "@material-ui/icons/ExitToApp";
import "./LoginToolbar.css";

const LOGOUT_API_URL = "https://staging.ulap.biz/api/logout";

export default function LoginToolbar() {
  const navigate = useNavigate();
  const [loggingOut, setLoggingOut] = useState(false);

  const handleLogout = async () => {
    const token = localStorage.getItem("authToken");
    const username = sessionStorage.getItem("logoutUsername");
    const password = sessionStorage.getItem("logoutPassword");
    setLoggingOut(true);

    try {
      if (token && username != null && password != null) {
        const basicAuth = btoa(`${username}:${password}`);
        await fetch(LOGOUT_API_URL, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-access-tokens": token,
            Authorization: `Basic ${basicAuth}`,
          },
          body: JSON.stringify({}),
        });
      }
    } catch (err) {
      // Proceed to clear local state even if API fails
    } finally {
      localStorage.removeItem("authToken");
      localStorage.removeItem("user");
      sessionStorage.removeItem("logoutUsername");
      sessionStorage.removeItem("logoutPassword");
      setLoggingOut(false);
      navigate("/login");
    }
  };

  return (
    <AppBar position="static" className="login-toolbar-appbar">
      <Toolbar className="login-toolbar" disableGutters>
        <div className="login-toolbar-logo">
          <img src="/favicon.ico" alt="UlapBiz" className="login-toolbar-icon" />
          <span className="login-toolbar-text">
            <span className="login-toolbar-ulap">Ulap</span>
            <span className="login-toolbar-biz">.Biz</span>
          </span>
        </div>
        <div className="login-toolbar-spacer" />
        <Button
          variant="outlined"
          color="inherit"
          startIcon={<ExitToAppIcon />}
          onClick={handleLogout}
          disabled={loggingOut}
          className="login-toolbar-logout"
        >
          {loggingOut ? "Logging out..." : "Logout"}
        </Button>
      </Toolbar>
    </AppBar>
  );
}
