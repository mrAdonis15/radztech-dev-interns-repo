import React, { Component } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import AppBar from "@material-ui/core/AppBar";
import Toolbar from "@material-ui/core/Toolbar";
import Button from "@material-ui/core/Button";
import ExitToAppIcon from "@material-ui/icons/ExitToApp";
import BusinessCenterIcon from "@material-ui/icons/Business";
import { request, API_URLS } from "../../DEV-INTERNS/Chatbox/api/Request";
import { getBizName } from "../../DEV-INTERNS/Chatbox/api/selectedBiz";
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
            const incoming = { ...data };

            // Preserve existing biz fields (like name) when API returns partial shape
            const existingBiz =
              (existing?.biz && typeof existing.biz === "object" && !Array.isArray(existing.biz))
                ? existing.biz
                : (existing && typeof existing === "object" && !Array.isArray(existing) ? existing : null);

            const incomingBiz =
              (incoming?.biz && typeof incoming.biz === "object" && !Array.isArray(incoming.biz))
                ? incoming.biz
                : (incoming && typeof incoming === "object" && !Array.isArray(incoming) ? incoming : null);

            const mergedBiz = { ...(existingBiz || {}), ...(incomingBiz || {}) };

            // Ensure token survives refreshes
            if (!mergedBiz.token && existingToken) mergedBiz.token = existingToken;

            const toStore = { ...(existing || {}), ...(incoming || {}) };
            // Keep a consistent shape with `.biz` when possible
            if (incoming?.biz != null || existing?.biz != null) {
              toStore.biz = mergedBiz;
            } else {
              Object.assign(toStore, mergedBiz);
            }
            if (!toStore.token && existingToken) toStore.token = existingToken;

            localStorage.setItem("selectedBiz", JSON.stringify(toStore));

            // Force re-render to show latest biz name from localStorage
            this.forceUpdate();
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
    const bizName = getBizName();
    const pathname = this.props.pathname || "";
    const isBizContext =
      pathname.startsWith("/Chatbox") ||
      pathname.startsWith("/ChatboxGC") ||
      pathname.startsWith("/AGR") ||
      pathname.startsWith("/Evaluation");

    return (
      <AppBar position="fixed" className="login-toolbar-appbar">
        <Toolbar className="login-toolbar" disableGutters>
          <div
            className={
              "login-toolbar-container" +
              (isBizContext ? " login-toolbar-container--full" : "")
            }
          >
            <div className="login-toolbar-logo">
              <div className="login-toolbar-icon-wrap">
                <img src="/favicon.ico" alt="UlapBiz" className="login-toolbar-icon" />
              </div>
              <span className="login-toolbar-text">
                UlapBiz{isBizContext && bizName ? ` - ${bizName}` : ""}
              </span>
            </div>
            <div className="login-toolbar-spacer" />
            <Button
              variant="text"
              endIcon={<BusinessCenterIcon />}
              onClick={() => this.props.navigate("/select-biz")}
              className="login-toolbar-select-biz"
            >
              SELECT BIZ
            </Button>
            <Button
              variant="text"
              endIcon={<ExitToAppIcon />}
              onClick={this.handleLogout}
              disabled={loggingOut}
              className="login-toolbar-logout"
            >
              {loggingOut ? "Logging out..." : "LOGOUT"}
            </Button>
          </div>
        </Toolbar>
      </AppBar>
    );
  }
}

function LoginToolbarWithRouter() {
  const navigate = useNavigate();
  const location = useLocation();
  return <LoginToolbar navigate={navigate} pathname={location.pathname} />;
}

export default LoginToolbarWithRouter;
