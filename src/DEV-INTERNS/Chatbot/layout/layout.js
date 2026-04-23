import React from "react";
import { Outlet, Navigate, useLocation } from "react-router-dom";
import LoginToolbar from "../../../Auth/Login/LoginToolbar";

const ChatboxLayout = () => {
  const location = useLocation();
  const isLoggedIn = !!localStorage.getItem("authToken");

  if (!isLoggedIn) {
    try {
      const url = location.pathname + (location.search || "");
      // console.log("chatbot-url", url);
      sessionStorage.setItem("chatboxReturnUrl", url);
    } catch (_) {}
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return (
    <div
      style={{
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
      }}
    >
      <LoginToolbar />
      <main style={{ flex: 1, overflow: "auto", paddingTop: 56 }}>
        <Outlet />
      </main>
    </div>
  );
};

export default ChatboxLayout;
