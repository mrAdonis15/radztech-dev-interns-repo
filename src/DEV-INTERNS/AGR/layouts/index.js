import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import LoginToolbar from "../../../Auth/Login/LoginToolbar";
import { TableAGR } from "./tableAGR";

function AGR() {
  const location = useLocation();
  const isLoggedIn = !!localStorage.getItem("authToken");

  if (!isLoggedIn) {
    try {
      sessionStorage.setItem("chatboxReturnUrl", location.pathname + (location.search || ""));
    } catch (_) {}
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return (
    <div style={{ height: "100vh", display: "flex", flexDirection: "column", overflow: "hidden" }}>
      <LoginToolbar />
      <main style={{ flex: 1, minHeight: 0, overflow: "hidden", paddingTop: 56, display: "flex", flexDirection: "column" }}>
        <TableAGR />
      </main>
    </div>
  );
}

export default AGR;