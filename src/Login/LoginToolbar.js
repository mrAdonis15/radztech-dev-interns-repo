import React, { Component } from "react";
import { useNavigate } from "react-router-dom";
import AppBar from "@material-ui/core/AppBar";
import Toolbar from "@material-ui/core/Toolbar";
import Button from "@material-ui/core/Button";
import ExitToAppIcon from "@material-ui/icons/ExitToApp";
import { request, API_URLS } from "../api/Request";
import "./LoginToolbar.css";

class LoginToolbar extends Component {
  state = {
    loggingOut: false,
  };

  componentDidMount() {
    // Call select-biz when toolbar mounts (user is logged in) and store in localStorage for app use
    const token = localStorage.getItem("authToken");
    if (token) {
      request(API_URLS.selectBiz, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "x-access-tokens": token,
        },
      })
        .then(({ text }) => {
          if (!text || !text.trim()) return null;
          try {
            return JSON.parse(text);
          } catch {
            return null;
          }
        })
        .then((data) => {
          if (data != null && typeof data === "object") {
            const existing = (() => {
              try {
                const raw = localStorage.getItem("selectedBiz");
                return raw ? JSON.parse(raw) : null;
              } catch {
                return null;
              }
            })();
            const existingToken =
              existing?.token ?? existing?.biz?.token ?? existing?.dataAccessToken ?? existing?.biz?.dataAccessToken;
            const toStore = { ...data };
            const biz = toStore.biz ?? toStore;
            if (typeof biz === "object" && !biz.token && existingToken) {
              biz.token = existingToken;
            }
            if (!toStore.token && existingToken) {
              toStore.token = existingToken;
            }
            localStorage.setItem("selectedBiz", JSON.stringify(toStore));
          }
        })
        .catch(() => {});
    }
  }

  handleLogout = async () => {
    const token = localStorage.getItem("authToken");
    const username = sessionStorage.getItem("logoutUsername");
    const password = sessionStorage.getItem("logoutPassword");
    this.setState({ loggingOut: true });

    try {
      if (token && username != null && password != null) {
        const basicAuth = btoa(`${username}:${password}`);
        await request(API_URLS.logout, {
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
      this.setState({ loggingOut: false });
      this.props.navigate("/login");
    }
  };

  render() {
    const { loggingOut } = this.state;

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
            onClick={this.handleLogout}
            disabled={loggingOut}
            className="login-toolbar-logout"
          >
            {loggingOut ? "Logging out..." : "Logout"}
          </Button>
        </Toolbar>
      </AppBar>
    );
  }
}

function LoginToolbarWithRouter() {
  const navigate = useNavigate();
  return <LoginToolbar navigate={navigate} />;
}

export default LoginToolbarWithRouter;
