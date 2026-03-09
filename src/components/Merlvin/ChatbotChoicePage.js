import React from "react";
import { Navigate, useNavigate } from "react-router-dom";
import Box from "@material-ui/core/Box";
import Typography from "@material-ui/core/Typography";
import Grid from "@material-ui/core/Grid";
import Paper from "@material-ui/core/Paper";
import Button from "@material-ui/core/Button";
import LoginToolbar from "../../Login/LoginToolbar";

export default function ChatbotChoicePage() {
  const navigate = useNavigate();
  const token = localStorage.getItem("authToken");
  const selectedBizRaw = localStorage.getItem("selectedBiz");

  if (!token) return <Navigate to="/login" replace />;
  if (!selectedBizRaw) return <Navigate to="/select-biz" replace />;

  const handleChoosePython = () => {
    localStorage.setItem("selectedChatbot", "python-prototype-ai");
    navigate("/PythonAIChat", { replace: true });
  };

  const handleChooseUlap = () => {
    localStorage.setItem("selectedChatbot", "ulap-chatbot");
    navigate("/chatbot", { replace: true });
  };

  return (
    <div
      style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}
    >
      <LoginToolbar />
      <Box
        flex={1}
        style={{ overflow: "auto", paddingTop: 80, paddingInline: 24 }}
      >
        <Box style={{ maxWidth: 960, margin: "0 auto" }}>
          <Typography variant="h4" gutterBottom color="textPrimary">
            Choose an AI chatbot
          </Typography>
          <Typography
            variant="body1"
            color="textSecondary"
            style={{ marginBottom: 24 }}
          >
            Select which assistant you want to use for this session.
          </Typography>

          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Paper elevation={2} style={{ padding: 24, height: "100%" }}>
                <Typography variant="h6" gutterBottom>
                  Python Prototype AI
                </Typography>
                <Typography
                  variant="body2"
                  color="textSecondary"
                  style={{ marginBottom: 16 }}
                >
                  Prototype assistant connected to your Python API backend.
                </Typography>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={handleChoosePython}
                >
                  Use Python Prototype AI
                </Button>
              </Paper>
            </Grid>

            <Grid item xs={12} md={6}>
              <Paper elevation={2} style={{ padding: 24, height: "100%" }}>
                <Typography variant="h6" gutterBottom>
                  Ulap Chatbot
                </Typography>
                <Typography
                  variant="body2"
                  color="textSecondary"
                  style={{ marginBottom: 16 }}
                >
                  Existing Ulap chatbot experience.
                </Typography>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={handleChooseUlap}
                >
                  Use Ulap Chatbot
                </Button>
              </Paper>
            </Grid>
          </Grid>
        </Box>
      </Box>
    </div>
  );
}
