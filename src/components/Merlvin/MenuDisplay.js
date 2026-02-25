import React, { useState } from "react";
import { makeStyles } from "@material-ui/core/styles";
import { Button, Menu, MenuItem } from "@material-ui/core";
import FilterListIcon from "@material-ui/icons/FilterList";
import ArrowDropDownIcon from "@material-ui/icons/ArrowDropDown";
import MenuBox from "./MenuBox";
import menuData from "./MenuData/Menu.json";
import {
  KITCHEN_CATEGORY,
  MIN_PRICE,
  getImageUrl,
} from "./constants/menuConstants";

// Styles for MenuDisplay component
const useStyles = makeStyles((theme) => ({
  pageWrapper: {
    width: "100%",
    maxWidth: 1400,
    margin: "0 auto",
    paddingLeft: 16,
    paddingRight: 16,
    [theme.breakpoints.up("sm")]: {
      paddingLeft: 24,
      paddingRight: 24,
    },
    [theme.breakpoints.up("md")]: {
      paddingLeft: 48,
      paddingRight: 48,
    },
    [theme.breakpoints.up("lg")]: {
      paddingLeft: 80,
      paddingRight: 80,
    },
  },
  filterContainer: {
    display: "flex",
    justifyContent: "flex-end",
    alignItems: "center",
    gap: "16px",
    padding: "20px",
    paddingTop: "85px",
    [theme.breakpoints.down("sm")]: {
      justifyContent: "center",
      paddingRight: "10px",
      paddingLeft: "10px",
      paddingTop: "100px",
      paddingBottom: "10px",
      gap: "8px",
    },
  },
  filterButton: {
    textTransform: "none",
    fontWeight: 600,
    padding: "10px 24px",
    fontSize: "1rem",
    backgroundColor: "#ff9500",
    color: "#fff",
    "&:hover": {
      backgroundColor: "#ff8c00",
      transform: "translateY(-2px)",
      boxShadow: "0 4px 8px rgba(255, 140, 0, 0.4)",
    },
    transition: "all 0.3s ease",
    [theme.breakpoints.down("sm")]: {
      padding: "8px 16px",
      fontSize: "0.875rem",
    },
  },
  menuItem: {
    padding: "12px 24px",
    fontSize: "0.95rem",
    "&:hover": {
      backgroundColor: "#e3f2fd",
    },
  },
  menuPaper: {
    maxHeight: 320,
    overflowY: "auto",
  },
  menuGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
    gap: 16,
    padding: "20px 0",
    paddingTop: 20,
    paddingBottom: 24,
    justifyContent: "start",
    [theme.breakpoints.down("sm")]: {
      gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
      gap: 8,
      padding: "10px 0",
    },
    [theme.breakpoints.down(360)]: {
      gridTemplateColumns: "1fr",
    },
  },
}));

function MenuDisplayContent() {
  const classes = useStyles();
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [anchorEl, setAnchorEl] = useState(null);

  // Get kitchen items matching our criteria
  const kitchenItems = menuData.filter(
    (item) => item.sCat === KITCHEN_CATEGORY && item.cPrice1 > MIN_PRICE,
  );

  // Extract unique categories from items
  const categories = [
    "All",
    ...new Set(kitchenItems.map((item) => item.sCatSub)),
  ];

  // Filter items based on selected category
  const filteredItems =
    selectedCategory === "All"
      ? kitchenItems
      : kitchenItems.filter((item) => item.sCatSub === selectedCategory);

  // Menu dropdown handlers
  const handleFilterClick = (event) => setAnchorEl(event.currentTarget);
  const handleFilterClose = () => setAnchorEl(null);
  const handleCategorySelect = (category) => {
    setSelectedCategory(category);
    handleFilterClose();
  };

  return (
    <>
      <div className={classes.pageWrapper}>
        {/* Filter Bar */}
        <div className={classes.filterContainer}>
          <Button
            className={classes.filterButton}
            onClick={handleFilterClick}
            variant="contained"
            startIcon={<FilterListIcon />}
            endIcon={<ArrowDropDownIcon />}
          >
            {selectedCategory}
          </Button>

          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleFilterClose}
            getContentAnchorEl={null}
            PaperProps={{ className: classes.menuPaper }}
            anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
            transformOrigin={{ vertical: "top", horizontal: "center" }}
          >
            {categories.map((category) => (
              <MenuItem
                key={category}
                className={classes.menuItem}
                onClick={() => handleCategorySelect(category)}
                selected={selectedCategory === category}
              >
                {category}
              </MenuItem>
            ))}
          </Menu>
        </div>

        {/* Menu Items Grid */}
        <div className={classes.menuGrid}>
          {filteredItems.map((item) => (
            <MenuBox
              key={item.ixProd}
              id={item.ixProd}
              foodName={item.sProd}
              price={item.cPrice1 / 100}
              unit={item.unit}
              description={item.description}
              ingredients={item.ingredients}
              cooking_instructions={item.cooking_instructions}
              imageUrl={getImageUrl(item.sProd)}
            />
          ))}
        </div>
      </div>
    </>
  );
}

export default MenuDisplayContent;
