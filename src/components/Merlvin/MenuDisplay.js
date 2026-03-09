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
    padding: "20px 0",
    paddingTop: 85,
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
    justifyContent: "start",
    paddingTop: 20,
    paddingBottom: 24,
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

  const handleFilterClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleFilterClose = () => {
    setAnchorEl(null);
  };

  const handleCategorySelect = (category) => {
    setSelectedCategory(category);
    handleFilterClose();
  };

  const kitchenItems = menuData.filter(
    (item) => item.sCat === "Kitchen" && item.cPrice1 > 0,
  );

  const categories = [
    "All",
    ...new Set(kitchenItems.map((item) => item.category)),
  ];

  const filteredItems =
    selectedCategory === "All"
      ? kitchenItems
      : kitchenItems.filter((item) => item.category === selectedCategory);

  const imageMap = {
    "3 WAY COOKED FISH": "3waycookedfish.png",
    "BEEF STEAK": "beefsteak.png",
    "CHICKEN ADOBO": "chickenadobo.png",
    "FRIED RICE": "friedrice.png",
    "GRILLED SQUID": "grilledsquid.png",
    "PORK SINIGANG": "porksinigang.png",
    "5 KINDS": "5kind.png",
    "5 MEAL COURSE FISH": "5mealcoursefish.png",
    "5 MEAL COURSE LAMB SHANK": "5mealcourselambshank.png",
    "5 MEAL COURSE SEABASS": "5mealcourseseabass.png",
    "5 MEAL COURSE STEAK": "5mealcoursesteak.png",
    "5MC ADOBAR": "5mcadobar.png",
    "5MC PATOTILLO": "5mcpatotillo.png",
    "7 MEAL COURSE": "7mealcourse.png",
    "8 COURSE MEAL": "8coursemeal.png",
    "ADD DESSERT": "adddessert.png",
    "ADOBONG PATO NI PAPA": "adobongpato.png",
    "ACQUA PANNA (750ML)": "acquapanna.png",
    "AGUA KIWI": "aguakiwi.png",
    "ALFREDO MUSHROOM PASTA WITH SEARED CHICKEN":
      "alfredomushroompastawithsearedchicken.png",
    "AMERICAN GIANT SCALLOP": "americangiantscallop.png",
    "AMERICAN PANCAKE BREAKFAST": "americanpancakebreakfast.png",
    "AMERICANO (COLD)": "americanocold.png",
    "AMERICANO (HOT)": "americanohot.png",
    "ANGUS PORTERHOUSE": "angusporterhouse.png",
    "ANGUS RIBEYE": "angusribeye.png",
    "ANGUS TOMAHAWK STEAK": "angustomahawk.png",
    "ANGUS TRUFFLE ARANCINI": "angustrufflearancini.png",
    APPETIZERS: "appetizers.png",
    "APRICOT DIJON GLAZED": "apricotdijonglazed.png",
  };

  return (
    <>
      <div className={classes.pageWrapper}>
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
          anchorOrigin={{
            vertical: "bottom",
            horizontal: "center",
          }}
          transformOrigin={{
            vertical: "top",
            horizontal: "center",
          }}
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
            imageUrl={
              imageMap[item.sProd]
                ? `${process.env.PUBLIC_URL}/MenuImages/${imageMap[item.sProd]}`
                : null
            }
          />
        ))}
      </div>
      </div>

      {getCartCount() > 0 && (
        <div className={classes.cartTotal}>
          Total: ₱{getCartTotal().toFixed(2)}
        </div>
      )}

      <Fab
        color="primary"
        className={classes.cartButton}
        onClick={() => setCartOpen(true)}
      >
        <Badge badgeContent={getCartCount()} color="secondary">
          <ShoppingCartIcon />
        </Badge>
      </Fab>

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
