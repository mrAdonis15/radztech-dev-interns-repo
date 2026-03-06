import React from "react";
import { Box, Typography } from "@material-ui/core";
import "./Page.css";

function PageShell({ sectionTitle, pageTitle, children }) {
  return (
    <Box className="page-container">
      <Box className="page-header">
        <Typography variant="h4" className="page-title-main">
          {sectionTitle}
        </Typography>
        <Typography variant="h5" className="page-title-sub">
          {pageTitle}
        </Typography>
      </Box>
      <Box className="card-container">{children}</Box>
    </Box>
  );
}

export default PageShell;
