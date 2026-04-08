import React from "react";
import {
  Box,
  Button,
  Dialog,
  DialogContent,
  makeStyles,
  Typography,
} from "@material-ui/core";
import ArrowForwardIcon from "@material-ui/icons/ArrowForward";
import CloseIcon from "@material-ui/icons/Close";
import DescriptionOutlinedIcon from "@material-ui/icons/DescriptionOutlined";

const useStyles = makeStyles((theme) => ({
  paper: {
    borderRadius: 0,
    maxWidth: 1180,
    width: "100%",
  },
  content: {
    padding: theme.spacing(6, 8, 7),
    backgroundColor: "#f8f8f8",
    [theme.breakpoints.down("sm")]: {
      padding: theme.spacing(3),
    },
  },
  header: {
    display: "flex",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: theme.spacing(2),
    marginBottom: theme.spacing(4),
    [theme.breakpoints.down("xs")]: {
      flexDirection: "column",
      alignItems: "stretch",
    },
  },
  title: {
    color: "#4b5563",
    fontWeight: 500,
    fontSize: 34,
    lineHeight: 1.15,
    fontFamily: '"Poppins", sans-serif',
    [theme.breakpoints.down("xs")]: {
      fontSize: 28,
    },
  },
  cancelButton: {
    borderRadius: 999,
    backgroundColor: "#ff7a00",
    color: "#ffffff",
    fontWeight: 700,
    padding: theme.spacing(0.75, 1.75),
    textTransform: "uppercase",
    minWidth: 122,
    "&:hover": {
      backgroundColor: "#f16d00",
    },
  },
  cancelIcon: {
    marginLeft: theme.spacing(1),
    fontSize: 18,
  },
  list: {
    border: "1px solid #e2e5e9",
    backgroundColor: "#ffffff",
  },
  row: {
    display: "grid",
    gridTemplateColumns: "40px minmax(0, 1fr) auto",
    alignItems: "center",
    columnGap: theme.spacing(3),
    minHeight: 106,
    padding: theme.spacing(0, 4),
    borderBottom: "1px solid #e2e5e9",
    [theme.breakpoints.down("sm")]: {
      gridTemplateColumns: "32px minmax(0, 1fr)",
      rowGap: theme.spacing(1),
      padding: theme.spacing(2.25, 2.5),
    },
    "&:last-child": {
      borderBottom: "none",
    },
  },
  docIcon: {
    color: "#2f2f2f",
    fontSize: 28,
  },
  templateName: {
    color: "#0f172a",
    fontSize: 18,
    fontWeight: 400,
    fontFamily: '"Poppins", sans-serif',
  },
  selectButton: {
    justifySelf: "end",
    color: "#ff7a00",
    fontWeight: 700,
    fontSize: 15,
    textTransform: "uppercase",
    backgroundColor: "transparent",
    padding: 0,
    minWidth: "auto",
    "&:hover": {
      backgroundColor: "transparent",
      color: "#f16d00",
    },
    [theme.breakpoints.down("sm")]: {
      justifySelf: "start",
      gridColumn: "2 / span 1",
    },
  },
  selectIcon: {
    marginLeft: theme.spacing(1),
  },
  feedback: {
    padding: theme.spacing(5, 3),
    textAlign: "center",
    color: "#6b7280",
    fontFamily: '"Poppins", sans-serif',
  },
}));

function SelectTemplate({ open, templates, loading, onClose, onSelect }) {
  const classes = useStyles();
  const templateRows = Array.isArray(templates) ? templates : [];

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="lg" classes={{ paper: classes.paper }}>
      <DialogContent className={classes.content}>
        <Box className={classes.header}>
          <Typography className={classes.title}>Performance Evaluation</Typography>
          <Button className={classes.cancelButton} onClick={onClose}>
            CANCEL
            <CloseIcon className={classes.cancelIcon} />
          </Button>
        </Box>

        <Box className={classes.list}>
          {templateRows.length > 0 ? (
            templateRows.map((template) => (
              <Box key={template.id} className={classes.row}>
                <DescriptionOutlinedIcon className={classes.docIcon} />
                <Typography className={classes.templateName}>{template.name}</Typography>
                <Button className={classes.selectButton} onClick={() => onSelect(template)}>
                  SELECT
                  <ArrowForwardIcon className={classes.selectIcon} />
                </Button>
              </Box>
            ))
          ) : loading ? (
            <Typography className={classes.feedback}>Loading templates...</Typography>
          ) : (
            <Typography className={classes.feedback}>
              No active templates are available.
            </Typography>
          )}
        </Box>
      </DialogContent>
    </Dialog>
  );
}

export default SelectTemplate;
