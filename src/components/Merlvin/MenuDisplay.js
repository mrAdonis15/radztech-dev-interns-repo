import React, { useState } from "react";
import { makeStyles } from "@material-ui/core/styles";
import { Fab, Badge, Button, Menu, MenuItem } from "@material-ui/core";
import ShoppingCartIcon from "@material-ui/icons/ShoppingCart";
import FilterListIcon from "@material-ui/icons/FilterList";
import ArrowDropDownIcon from "@material-ui/icons/ArrowDropDown";
import MenuBox from "./MenuBox";
import Cart from "./Cart";
import menuData from "./MenuData/Menu.json";
import { CartProvider, useCart } from "../../contexts/CartContext";
import {
  KITCHEN_CATEGORY,
  MIN_PRICE,
  getImageUrl,
} from "./constants/menuConstants";

// Styles for MenuDisplay component
const useStyles = makeStyles((theme) => ({
  cartButton: {
    position: "fixed",
    bottom: 24,
    right: 24,
    zIndex: 1000,
    transition: "all 0.3s ease",
    "&:hover": {
      transform: "scale(1.1)",
      boxShadow: "0 6px 16px rgba(0,0,0,0.3)",
    },
    [theme.breakpoints.down("sm")]: {
      bottom: 16,
      right: 16,
    },
  },
  cartTotal: {
    position: "fixed",
    bottom: 90,
    right: 24,
    backgroundColor: "#fff",
    padding: "8px 16px",
    borderRadius: 20,
    boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
    fontWeight: 700,
    fontSize: "1rem",
    transition: "all 0.3s ease",
    "&:hover": {
      transform: "translateY(-2px)",
      boxShadow: "0 4px 12px rgba(0,0,0,0.25)",
    },
    [theme.breakpoints.down("sm")]: {
      bottom: 82,
      right: 16,
      fontSize: "0.875rem",
      padding: "6px 12px",
    },
  },
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
  const [cartOpen, setCartOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [anchorEl, setAnchorEl] = useState(null);
  const { getCartTotal, getCartCount } = useCart();

  // Get kitchen items matching our criteria
  const kitchenItems = menuData.filter(
    (item) => item.sCat === KITCHEN_CATEGORY && item.cPrice1 > MIN_PRICE,
  );

  // Extract unique categories from items
  const categories = [
    "All",
    ...new Set(kitchenItems.map((item) => item.category)),
  ];

  // Filter items based on selected category
  const filteredItems =
    selectedCategory === "All"
      ? kitchenItems
      : kitchenItems.filter((item) => item.category === selectedCategory);

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

      {/* Cart Total Display */}
      {getCartCount() > 0 && (
        <div className={classes.cartTotal}>
          Total: ₱{getCartTotal().toFixed(2)}
        </div>
      )}

      {/* Cart Button */}
      <Fab
        color="primary"
        className={classes.cartButton}
        onClick={() => setCartOpen(true)}
      >
        <Badge badgeContent={getCartCount()} color="secondary">
          <ShoppingCartIcon />
        </Badge>
      </Fab>

      {/* Cart Modal */}
      <Cart open={cartOpen} onClose={() => setCartOpen(false)} />
    </>
  );
}

export default function MenuDisplay() {
  return (
    <CartProvider>
      <MenuDisplayContent />
    </CartProvider>
  );
}
