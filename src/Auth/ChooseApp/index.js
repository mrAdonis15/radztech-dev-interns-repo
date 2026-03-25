import React from "react";
import { useNavigate, Navigate, useLocation } from "react-router-dom";
import Box from "@material-ui/core/Box";
import Typography from "@material-ui/core/Typography";
import Card from "@material-ui/core/Card";
import CardActionArea from "@material-ui/core/CardActionArea";
import ChatIcon from "@material-ui/icons/Chat";
import AssessmentIcon from "@material-ui/icons/Toc";
import StarIcon from "@material-ui/icons/Star";
import LoginToolbar from "../Login/LoginToolbar";
import "./ChooseApp.css";

export default function ChooseApp() {
  const navigate = useNavigate();
  const location = useLocation();
  const token = localStorage.getItem("authToken");
  const from = location.state?.from;
  const chatboxSearch = from?.pathname === "/Chatbox" || (typeof from?.pathname === "string" && from?.pathname?.startsWith?.("/Chatbox"))
    ? (from?.search || "")
    : "";

  const goToChatbox = () => {
    navigate("/Chatbox" + chatboxSearch, { replace: true });
  };

  const goToAGR = () => {
    navigate("/AGR", { replace: true });
  };

  const goToStarRating = () => {
    navigate("/StarRating", { replace: true });
  };

  if (!token) return <Navigate to="/login" replace />;

  return (
    <div className="choose-app-root">
      <LoginToolbar />
      <Box className="choose-app-root-content" style={{ paddingTop: 64 }}>
        <div className="choose-app-content-wrap">
          <Box className="choose-app-cards">
            <Card className="choose-app-card" elevation={0}>
              <CardActionArea onClick={goToChatbox} className="choose-app-card-action">
                <Box className="choose-app-card-icon-container">
                  <Box className="choose-app-card-icon-circle">
                    <ChatIcon className="choose-app-card-icon" />
                  </Box>
                </Box>
                <Box className="choose-app-card-details">
                  <Typography variant="h6" component="h2" className="choose-app-card-label">
                    UlapAI
                  </Typography>
                  <Typography variant="body2" className="choose-app-card-desc">
                    AI assistant
                  </Typography>
                </Box>
              </CardActionArea>
            </Card>
            <Card className="choose-app-card" elevation={0}>
              <CardActionArea onClick={goToAGR} className="choose-app-card-action">
                <Box className="choose-app-card-icon-container">
                  <Box className="choose-app-card-icon-circle">
                    <AssessmentIcon className="choose-app-card-icon" />
                  </Box>
                </Box>
                <Box className="choose-app-card-details">
                  <Typography variant="h6" component="h2" className="choose-app-card-label">
                    AGR
                  </Typography>
                  <Typography variant="body2" className="choose-app-card-desc">
                    Customer Aging Simulator
                  </Typography>
                </Box>
              </CardActionArea>
            </Card>
            <Card className="choose-app-card" elevation={0}>
              <CardActionArea onClick={goToStarRating} className="choose-app-card-action">
                <Box className="choose-app-card-icon-container">
                  <Box className="choose-app-card-icon-circle">
                    <StarIcon className="choose-app-card-icon" />
                  </Box>
                </Box>
                <Box className="choose-app-card-details">
                  <Typography variant="h6" component="h2" className="choose-app-card-label">
                    Star Rating
                  </Typography>
                  <Typography variant="body2" className="choose-app-card-desc">
                    Category evaluation dashboard
                  </Typography>
                </Box>
              </CardActionArea>
            </Card>
          </Box>
        </div>
      </Box>
    </div>
  );
}
