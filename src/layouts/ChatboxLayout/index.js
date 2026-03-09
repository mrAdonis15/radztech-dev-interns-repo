import React from "react";
import { Outlet, Navigate } from "react-router-dom";
import LoginToolbar from "../../Login/LoginToolbar";

const ChatboxLayout = () => {
  const isLoggedIn = !!localStorage.getItem("authToken");

  if (!isLoggedIn) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div style={{ height: "100vh", display: "flex", flexDirection: "column", overflow: "hidden" }}>
      <LoginToolbar />
      <main style={{ flex: 1, overflow: "auto", paddingTop: 56 }}>
        <Outlet />
      </main>
    </div>
  );
};

export default ChatboxLayout;
