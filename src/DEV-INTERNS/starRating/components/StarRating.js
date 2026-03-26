import React, { useState } from "react";
import { Box, IconButton, makeStyles, Typography } from "@material-ui/core";
import StarIcon from "@material-ui/icons/Star";
import StarBorderIcon from "@material-ui/icons/StarBorder";

const useStyles = makeStyles((theme) => ({
  root: {
    display: "inline-flex",
    alignItems: "center",
    gap: theme.spacing(0.5),
  },
  stars: {
    display: "flex",
    alignItems: "center",
  },
  starButton: {
    padding: theme.spacing(0.5),
    transition: "transform 0.18s ease, color 0.18s ease",
    "&:hover": {
      transform: "translateY(-1px) scale(1.06)",
      backgroundColor: "transparent",
    },
  },
  icon: {
    fontSize: 28,
    color: theme.palette.action.disabled,
  },
  activeIcon: {
    color: "#f59e0b",
  },
  readOnly: {
    pointerEvents: "none",
  },
  caption: {
    marginLeft: theme.spacing(1),
    minWidth: 52,
  },
}));

function StarRating({
  value,
  onChange,
  readOnly = false,
  size = 5,
  showValue = false,
}) {
  const classes = useStyles();
  const [hoveredValue, setHoveredValue] = useState(0);
  const rootClassName = readOnly
    ? `${classes.stars} ${classes.readOnly}`
    : classes.stars;

  const displayValue = hoveredValue || value;

  return (
    <Box className={classes.root}>
      <Box className={rootClassName}>
        {Array.from({ length: size }, (_, index) => {
          const starValue = index + 1;
          const isActive = starValue <= displayValue;
          const IconComponent = isActive ? StarIcon : StarBorderIcon;

          return (
            <IconButton
              key={starValue}
              className={classes.starButton}
              onMouseEnter={() => !readOnly && setHoveredValue(starValue)}
              onMouseLeave={() => !readOnly && setHoveredValue(0)}
              onClick={() => !readOnly && onChange(starValue)}
              aria-label={`Rate ${starValue} star${starValue > 1 ? "s" : ""}`}
            >
              <IconComponent
                className={isActive ? `${classes.icon} ${classes.activeIcon}` : classes.icon}
              />
            </IconButton>
          );
        })}
      </Box>
      {showValue ? (
        <Typography variant="body2" color="textSecondary" className={classes.caption}>
          {value > 0 ? `${value}/5` : "Not rated"}
        </Typography>
      ) : null}
    </Box>
  );
}

export default StarRating;
