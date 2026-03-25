import React from "react";
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Divider,
  Grid,
  makeStyles,
  Typography,
} from "@material-ui/core";
import StarRateIcon from "@material-ui/icons/StarRate";
import StarRating from "./StarRating";

const useStyles = makeStyles((theme) => ({
  card: {
    height: "100%",
    borderRadius: 18,
    boxShadow: "0 18px 45px rgba(15, 23, 42, 0.10)",
    border: "1px solid rgba(148, 163, 184, 0.18)",
    background:
      "linear-gradient(180deg, rgba(255,255,255,0.98) 0%, rgba(248,250,252,0.96) 100%)",
    cursor: "pointer",
    transition: "transform 0.18s ease, box-shadow 0.18s ease",
    "&:hover": {
      transform: "translateY(-3px)",
      boxShadow: "0 24px 50px rgba(15, 23, 42, 0.14)",
    },
  },
  content: {
    padding: theme.spacing(3),
  },
  headerRow: {
    marginBottom: theme.spacing(2),
  },
  title: {
    fontWeight: 600,
    color: "#0f172a",
  },
  chip: {
    backgroundColor: "rgba(255, 117, 4, 0.12)",
    color: "#c2410c",
    fontWeight: 600,
  },
  ratingBlock: {
    display: "flex",
    flexDirection: "column",
    gap: theme.spacing(0.75),
  },
  metricLabel: {
    fontSize: 12,
    fontWeight: 600,
    textTransform: "uppercase",
    letterSpacing: "0.08em",
    color: "#64748b",
  },
  metricValue: {
    color: "#0f172a",
    fontWeight: 600,
  },
  divider: {
    margin: theme.spacing(2, 0),
  },
  statRow: {
    marginTop: theme.spacing(2),
  },
  statCard: {
    padding: theme.spacing(1.5),
    borderRadius: 14,
    backgroundColor: "#f8fafc",
    border: "1px solid rgba(148, 163, 184, 0.18)",
    height: "100%",
  },
  statValue: {
    display: "flex",
    alignItems: "center",
    gap: theme.spacing(0.75),
    fontWeight: 700,
    color: "#0f172a",
  },
  statIcon: {
    color: "#f59e0b",
  },
  footer: {
    marginTop: theme.spacing(2),
    display: "flex",
    justifyContent: "flex-end",
  },
  actionButton: {
    borderRadius: 999,
    textTransform: "none",
    fontWeight: 600,
  },
}));

function CategoryRatingCard({ category, onSelect }) {
  const classes = useStyles();
  const hasRatings = category.totalRatings > 0;

  return (
    <Card className={classes.card} elevation={0} onClick={() => onSelect(category)}>
      <CardContent className={classes.content}>
        <Grid
          container
          justifyContent="space-between"
          alignItems="center"
          spacing={2}
          className={classes.headerRow}
        >
          <Grid item xs={12} sm>
            <Typography variant="h5" className={classes.title}>
              {category.name}
            </Typography>
          </Grid>
          <Grid item xs={12} sm="auto">
            <Chip
              label={category.currentUserRating > 0 ? "Rated by you" : "Awaiting rating"}
              className={classes.chip}
            />
          </Grid>
        </Grid>

        <Box className={classes.ratingBlock}>
          <Typography variant="body2" className={classes.metricLabel}>
            Your rating
          </Typography>
          <StarRating
            value={category.currentUserRating}
            onChange={() => {}}
            readOnly
            showValue
          />
        </Box>

        <Divider className={classes.divider} />

        <Grid container spacing={2} className={classes.statRow}>
          <Grid item xs={12} sm={6}>
            <Box className={classes.statCard}>
              <Typography variant="body2" className={classes.metricLabel}>
                Average rating
              </Typography>
              <Typography variant="h6" className={classes.statValue}>
                <StarRateIcon className={classes.statIcon} />
                {hasRatings ? `${category.averageRating.toFixed(1)} / 5` : "No ratings yet"}
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Box className={classes.statCard}>
              <Typography variant="body2" className={classes.metricLabel}>
                Total ratings
              </Typography>
              <Typography variant="h6" className={classes.metricValue}>
                {category.totalRatings}
              </Typography>
            </Box>
          </Grid>
        </Grid>

        <Box className={classes.footer}>
          <Button
            variant="outlined"
            color="primary"
            className={classes.actionButton}
            onClick={(event) => {
              event.stopPropagation();
              onSelect(category);
            }}
          >
            Evaluate
          </Button>
        </Box>
      </CardContent>
    </Card>
  );
}

export default CategoryRatingCard;
