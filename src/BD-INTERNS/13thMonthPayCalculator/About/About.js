import React from "react";
import { Box, Typography, Paper, makeStyles } from "@material-ui/core";

const useStyles = makeStyles((theme) => ({
  root: {
    animation: "$fadeIn 0.4s ease",
  },
  "@keyframes fadeIn": {
    from: { opacity: 0, transform: "translateY(12px)" },
    to: { opacity: 1, transform: "translateY(0)" },
  },
  title: {
    fontSize: "1.85rem",
    background: "linear-gradient(135deg, #e55a00 0%, #ff6b35 100%)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
    backgroundClip: "text",
    marginBottom: theme.spacing(2),
    fontWeight: 700,
  },
  section: {
    padding: theme.spacing(2, 2.25),
    marginBottom: theme.spacing(1.5),
    borderRadius: 16,
    boxShadow: "0 8px 32px rgba(229, 90, 0, 0.1)",
    border: "1px solid rgba(255, 107, 53, 0.15)",
    transition: "all 0.3s ease",
    "&:hover": {
      boxShadow: "0 12px 40px rgba(229, 90, 0, 0.15)",
      transform: "translateY(-2px)",
    },
  },
  sectionTitle: {
    fontSize: "1.1rem",
    color: "#e55a00",
    marginBottom: theme.spacing(1),
    fontWeight: 600,
  },
  body: {
    marginBottom: theme.spacing(1),
    lineHeight: 1.65,
    color: "#4a3728",
    "&:last-child": { marginBottom: 0 },
  },
  list: {
    margin: theme.spacing(0, 0, 1),
    paddingLeft: theme.spacing(3),
    color: "#4a3728",
  },
  formula: {
    background: "linear-gradient(90deg, #fff5ee 0%, #ffe8d9 100%)",
    borderLeft: "4px solid #ff6b35",
    padding: theme.spacing(1.5, 2),
    marginBottom: theme.spacing(1),
    borderRadius: "0 10px 10px 0",
  },
}));

function About() {
  const classes = useStyles();

  return (
    <Box className={classes.root}>
      <Typography variant="h1" component="h1" className={classes.title}>
        About 13th Month Pay
      </Typography>

      <Paper component="section" elevation={0} className={classes.section}>
        <Typography variant="h2" component="h2" className={classes.sectionTitle}>
          What is 13th Month Pay?
        </Typography>
        <Typography className={classes.body}>
          13th month pay is a mandatory benefit in the Philippines (Presidential Decree No. 851).
          It is equivalent to one-twelfth (1/12) of the total basic salary earned by an employee
          within the calendar year.
        </Typography>
      </Paper>

      <Paper component="section" elevation={0} className={classes.section}>
        <Typography variant="h2" component="h2" className={classes.sectionTitle}>
          Formula
        </Typography>
        <Box className={classes.formula}>
          <Typography component="strong" style={{ fontWeight: 600 }}>
            13th Month Pay = Total Basic Salary Earned ÷ 12
          </Typography>
        </Box>
        <Typography className={classes.body}>
          For employees who worked less than a full year, the amount is prorated based on the
          actual basic salary earned from the start of employment (or January 1) to the end
          date (or December 31).
        </Typography>
      </Paper>

      <Paper component="section" elevation={0} className={classes.section}>
        <Typography variant="h2" component="h2" className={classes.sectionTitle}>
          What is included in basic salary?
        </Typography>
        <ul className={classes.list}>
          <li>Regular wages for services rendered</li>
          <li>Paid absences (vacation, sick leave with pay)</li>
        </ul>
        <Typography className={classes.body}>
          <strong>Excluded:</strong> overtime, allowances, bonuses (unless integrated), night shift
          differential, and similar payments.
        </Typography>
      </Paper>

      <Paper component="section" elevation={0} className={classes.section}>
        <Typography variant="h2" component="h2" className={classes.sectionTitle}>
          Eligibility
        </Typography>
        <Typography className={classes.body}>
          Rank-and-file employees who worked at least one month in the calendar year are eligible.
          Managerial staff, government employees, and household helpers may be excluded under the law.
        </Typography>
      </Paper>

      <Paper component="section" elevation={0} className={classes.section}>
        <Typography variant="h2" component="h2" className={classes.sectionTitle}>
          Payment deadline
        </Typography>
        <Typography className={classes.body}>
          Full 13th month pay must be paid on or before <strong>December 24</strong> each year.
        </Typography>
      </Paper>
    </Box>
  );
}

export default About;
