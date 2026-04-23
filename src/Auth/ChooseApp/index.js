import React from "react";
import { useNavigate, Navigate, useLocation } from "react-router-dom";
import Box from "@material-ui/core/Box";
import Typography from "@material-ui/core/Typography";
import Card from "@material-ui/core/Card";
import CardActionArea from "@material-ui/core/CardActionArea";
import ChatIcon from "@material-ui/icons/Chat";
import AssessmentIcon from "@material-ui/icons/Toc";
import StarIcon from "@material-ui/icons/Star";
import MenuBookIcon from "@material-ui/icons/MenuBook";
import TimelineIcon from "@material-ui/icons/Timeline";
import ImageIcon from "@material-ui/icons/Image";
import GridOnIcon from "@material-ui/icons/GridOn";
import CodeIcon from "@material-ui/icons/Code";
import StorageIcon from "@material-ui/icons/Storage";
import LoginToolbar from "../Login/LoginToolbar";
import "./ChooseApp.css";

export default function ChooseApp() {
  const navigate = useNavigate();
  const location = useLocation();
  const token = localStorage.getItem("authToken");
  const from = location.state?.from;
  const chatboxSearch =
    from?.pathname === "/chatbot" ||
    (typeof from?.pathname === "string" &&
      from?.pathname?.startsWith?.("/chatbot"))
      ? from?.search || ""
      : "";

  const goToChatbox = () => {
    navigate("/chatbot" + chatboxSearch, { replace: true });
  };

  const goToAGR = () => {
    navigate("/AGR", { replace: true });
  };

  const goToStarRating = () => {
    navigate("/Evaluation", { replace: true });
  };

  const apps = [
    {
      label: "UlapAI",
      desc: "AI assistant",
      icon: ChatIcon,
      onClick: goToChatbox,
    },
    {
      label: "AGR",
      desc: "Customer Aging Simulator",
      icon: AssessmentIcon,
      onClick: goToAGR,
    },
    {
      label: "Evaluation",
      desc: "Evaluation Rating",
      icon: StarIcon,
      onClick: goToStarRating,
    },
    {
      label: "Bible Verse",
      desc: "Daily Bible verse viewer",
      icon: MenuBookIcon,
      path: "/verses",
    },
    {
      label: "Historical Graph",
      desc: "Historical data charts",
      icon: TimelineIcon,
      path: "/HistoricalGraph",
    },
    {
      label: "Image Compress",
      desc: "Compress image files",
      icon: ImageIcon,
      path: "/ImageCompressor",
    },
    {
      label: "React Sheet",
      desc: "Spreadsheet editor",
      icon: GridOnIcon,
      path: "/sheet",
    },
    {
      label: "SQL Formatter",
      desc: "Format SQL queries",
      icon: CodeIcon,
      path: "/SqlFormatter",
    },
    {
      label: "UI JSON",
      desc: "JSON UI editor",
      icon: StorageIcon,
      path: "/KurtJSON",
    },
  ];

  const handleOpenApp = (app) => {
    if (app.onClick) {
      app.onClick();
      return;
    }
    navigate(app.path, { replace: true });
  };

  if (!token) return <Navigate to="/login" replace />;

  return (
    <div className="choose-app-root">
      <LoginToolbar />
      <Box className="choose-app-root-content" style={{ paddingTop: 64 }}>
        <div className="choose-app-content-wrap">
          <Box className="choose-app-cards">
            {apps.map((app) => {
              const AppIcon = app.icon;

              return (
                <Card className="choose-app-card" elevation={0} key={app.label}>
                  <CardActionArea
                    onClick={() => handleOpenApp(app)}
                    className="choose-app-card-action"
                  >
                    <Box className="choose-app-card-icon-container">
                      <Box className="choose-app-card-icon-circle">
                        <AppIcon className="choose-app-card-icon" />
                      </Box>
                    </Box>
                    <Box className="choose-app-card-details">
                      <Typography
                        variant="h6"
                        component="h2"
                        className="choose-app-card-label"
                      >
                        {app.label}
                      </Typography>
                      <Typography variant="body2" className="choose-app-card-desc">
                        {app.desc}
                      </Typography>
                    </Box>
                  </CardActionArea>
                </Card>
              );
            })}
          </Box>
        </div>
      </Box>
    </div>
  );
}
