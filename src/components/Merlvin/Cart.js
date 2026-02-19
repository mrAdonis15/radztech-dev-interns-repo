import React from "react";
import { makeStyles } from "@material-ui/core/styles";
import {
  Drawer,
  Typography,
  IconButton,
  List,
  Button,
  Divider,
} from "@material-ui/core";
import CloseIcon from "@material-ui/icons/Close";
import AddIcon from "@material-ui/icons/Add";
import RemoveIcon from "@material-ui/icons/Remove";
import DeleteIcon from "@material-ui/icons/Delete";
import { useCart } from "../../contexts/CartContext";

const useStyles = makeStyles((theme) => ({
  drawer: {
    width: 400,
    padding: theme.spacing(2),
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: theme.spacing(2),
  },
  listItem: {
    display: "flex",
    flexDirection: "column",
    alignItems: "stretch",
    padding: theme.spacing(2),
    marginBottom: theme.spacing(1),
    backgroundColor: "#f5f5f5",
    borderRadius: 8,
  },
  itemHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: theme.spacing(1),
  },
  itemControls: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
  },
  quantityControls: {
    display: "flex",
    alignItems: "center",
    gap: theme.spacing(1),
  },
  quantityButton: {
    minWidth: 32,
    width: 32,
    height: 32,
    padding: 0,
  },
  total: {
    marginTop: theme.spacing(3),
    padding: theme.spacing(2),
    backgroundColor: "#e0e0e0",
    borderRadius: 8,
  },
  emptyCart: {
    textAlign: "center",
    padding: theme.spacing(4),
    color: "#999",
  },
}));

export default function Cart({ open, onClose }) {
  const classes = useStyles();
  const { cartItems, updateQuantity, removeFromCart, getCartTotal, clearCart } =
    useCart();

  return (
    <Drawer anchor="right" open={open} onClose={onClose}>
      <div className={classes.drawer}>
        <div className={classes.header}>
          <Typography variant="h5" style={{ fontWeight: 700 }}>
            Your Cart
          </Typography>
          <IconButton onClick={onClose} size="small">
            <CloseIcon />
          </IconButton>
        </div>
        <Divider />

        {cartItems.length === 0 ? (
          <div className={classes.emptyCart}>
            <Typography variant="h6">Your cart is empty</Typography>
            <Typography variant="body2">Add items to get started</Typography>
          </div>
        ) : (
          <>
            <List>
              {cartItems.map((item) => (
                <div key={item.id} className={classes.listItem}>
                  <div className={classes.itemHeader}>
                    <Typography variant="subtitle1" style={{ fontWeight: 600 }}>
                      {item.name}
                    </Typography>
                    <IconButton
                      size="small"
                      onClick={() => removeFromCart(item.id)}
                      color="secondary"
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </div>
                  <Typography variant="body2" color="textSecondary">
                    ₱{item.price.toFixed(2)} {item.unit}
                  </Typography>
                  <div className={classes.itemControls}>
                    <div className={classes.quantityControls}>
                      <IconButton
                        className={classes.quantityButton}
                        onClick={() =>
                          updateQuantity(item.id, item.quantity - 1)
                        }
                        size="small"
                      >
                        <RemoveIcon fontSize="small" />
                      </IconButton>
                      <Typography style={{ minWidth: 30, textAlign: "center" }}>
                        {item.quantity}
                      </Typography>
                      <IconButton
                        className={classes.quantityButton}
                        onClick={() =>
                          updateQuantity(item.id, item.quantity + 1)
                        }
                        size="small"
                      >
                        <AddIcon fontSize="small" />
                      </IconButton>
                    </div>
                    <Typography variant="subtitle1" style={{ fontWeight: 700 }}>
                      ₱{(item.price * item.quantity).toFixed(2)}
                    </Typography>
                  </div>
                </div>
              ))}
            </List>

            <div className={classes.total}>
              <Typography variant="h6" style={{ fontWeight: 700 }}>
                Total: ₱{getCartTotal().toFixed(2)}
              </Typography>
            </div>

            <Button
              variant="outlined"
              color="secondary"
              fullWidth
              style={{ marginTop: 16 }}
              onClick={clearCart}
            >
              Clear Cart
            </Button>
          </>
        )}
      </div>
    </Drawer>
  );
}
