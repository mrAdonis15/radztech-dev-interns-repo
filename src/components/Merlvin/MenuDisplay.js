import React, { useState } from "react";
import { makeStyles } from "@material-ui/core/styles";
import { Fab, Badge } from "@material-ui/core";
import ShoppingCartIcon from "@material-ui/icons/ShoppingCart";
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
  },
}));

function MenuDisplayContent() {
  const classes = useStyles();
  const [cartOpen, setCartOpen] = useState(false);
  const { getCartTotal, getCartCount } = useCart();
  const kitchenItems = menuData.filter(
    (item) => item.sCat === "Kitchen" && item.cPrice1 > 0,
  );

  const imageMap = {
    "3 WAY COOKED FISH": "3waycookedfish.png",
    "BEEF STEAK": "beefsteak.png",
    "CHICKEN ADOBO": "chickenadobo.png",
    "FRIED RICE": "friedrice.png",
    "GRILLED SQUID": "grilledsquid.png",
    "PORK SINIGANG": "porksinigang.png",
  };

  return (
    <>
      <div
        style={{
          display: "grid",
          gap: "12px",
          padding: "10px 120px",
          paddingTop: "85px",
          gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
          justifyItems: "center",
        }}
      >
        {kitchenItems.map((item) => (
          <MenuBox
            key={item.ixProd}
            id={item.ixProd}
            foodName={item.sProd}
            price={item.cPrice1 / 100}
            unit={item.unit}
            imageUrl={
              imageMap[item.sProd]
                ? `${process.env.PUBLIC_URL}/MenuImages/${imageMap[item.sProd]}`
                : null
            }
          />
        ))}
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
