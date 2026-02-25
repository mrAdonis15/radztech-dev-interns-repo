import React from "react";
import { Outlet, Navigate } from "react-router-dom";
import LoginToolbar from "../../Login/LoginToolbar";

const ChatboxLayout = () => {
  const isLoggedIn = !!localStorage.getItem("authToken");

  if (!isLoggedIn) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <LoginToolbar />
      <main style={{ flex: 1 }}>
        <Outlet />
      </main>
    </div>
  );
};

export default ChatboxLayout;
