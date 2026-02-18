import React, { useState } from "react";
import { makeStyles } from "@material-ui/core/styles";
import Card from "@material-ui/core/Card";
import CardContent from "@material-ui/core/CardContent";
import CardMedia from "@material-ui/core/CardMedia";
import Typography from "@material-ui/core/Typography";
import IconButton from "@material-ui/core/IconButton";
import Modal from "@material-ui/core/Modal";
import Backdrop from "@material-ui/core/Backdrop";
import Fade from "@material-ui/core/Fade";
import FullscreenIcon from "@material-ui/icons/Fullscreen";
import CloseIcon from "@material-ui/icons/Close";
import AddIcon from "@material-ui/icons/Add";
import RemoveIcon from "@material-ui/icons/Remove";
import { useCart } from "../../contexts/CartContext";

const useStyles = makeStyles((theme) => ({
  card: {
    position: "relative",
    width: 280,
  },
  expandButton: {
    position: "absolute",
    top: 8,
    right: 8,
    backgroundColor: "rgba(255, 255, 255, 0.8)",
    "&:hover": {
      backgroundColor: "rgba(255, 255, 255, 0.9)",
    },
    zIndex: 1,
  },
  media: {
    height: 200,
    backgroundColor: "#d0d0d0",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  placeholderText: {
    color: "#999",
    fontSize: "2rem",
    fontWeight: 500,
  },
  content: {
    padding: theme.spacing(2),
  },
  foodName: {
    fontWeight: 600,
    marginBottom: theme.spacing(1),
  },
  priceSection: {
    display: "flex",
    alignItems: "flex-start",
    justifyContent: "space-between",
    marginTop: theme.spacing(2),
  },
  totalSection: {
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-start",
  },
  unitPrice: {
    fontSize: "1rem",
    fontWeight: 600,
    color: "#333",
  },
  price: {
    fontSize: "1.25rem",
    fontWeight: 700,
    color: "#111",
  },
  quantityControls: {
    display: "flex",
    alignItems: "center",
    gap: theme.spacing(1),
  },
  quantityButton: {
    minWidth: 36,
    width: 36,
    height: 36,
    padding: 0,
  },
  quantity: {
    fontSize: "1.25rem",
    fontWeight: 600,
    minWidth: 30,
    textAlign: "center",
  },
  modal: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  modalCard: {
    position: "relative",
    width: 900,
    maxHeight: "90vh",
    overflow: "auto",
    outline: "none",
  },
  closeButton: {
    position: "absolute",
    top: 8,
    right: 8,
    backgroundColor: "rgba(255, 255, 255, 0.8)",
    "&:hover": {
      backgroundColor: "rgba(255, 255, 255, 0.9)",
    },
    zIndex: 1,
  },
  modalMedia: {
    height: 500,
    backgroundColor: "#d0d0d0",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
}));

export default function MenuBox({
  id,
  foodName = "Food Name/Desc",
  price = 0.0,
  unit = "",
  imageUrl = null,
}) {
  const classes = useStyles();
  const [open, setOpen] = useState(false);
  const { cartItems, addToCart, updateQuantity } = useCart();
  
  const cartItem = cartItems.find((item) => item.id === id);
  const quantity = cartItem ? cartItem.quantity : 0;
  const totalPrice = price * quantity;

  const handleOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleIncrement = () => {
    if (quantity === 0) {
      addToCart({ id, name: foodName, price, unit, imageUrl });
    } else {
      updateQuantity(id, quantity + 1);
    }
  };

  const handleDecrement = () => {
    if (quantity > 0) {
      updateQuantity(id, quantity - 1);
    }
  };

  return (
    <>
      <Card className={classes.card} elevation={3}>
        <IconButton
          className={classes.expandButton}
          onClick={handleOpen}
          size="small"
        >
          <FullscreenIcon />
        </IconButton>

        <CardMedia className={classes.media} image={imageUrl} title={foodName}>
          {!imageUrl && (
            <Typography className={classes.placeholderText}>
              Food Image
            </Typography>
          )}
        </CardMedia>

        <CardContent className={classes.content}>
          <Typography variant="h6" className={classes.foodName}>
            {foodName}
          </Typography>

          <Typography className={classes.unitPrice}>
            Unit: ₱{price.toFixed(2)}
            {unit ? ` ${unit}` : ""}
          </Typography>

          <div className={classes.priceSection}>
            <div className={classes.totalSection}>
              <Typography variant="body2" style={{ fontWeight: 600 }}>
                Total:
              </Typography>
              <Typography className={classes.price}>
                ₱{totalPrice.toFixed(2)}
              </Typography>
            </div>

            <div className={classes.quantityControls}>
              <IconButton
                className={classes.quantityButton}
                onClick={handleDecrement}
                size="small"
              >
                <RemoveIcon />
              </IconButton>

              <Typography className={classes.quantity}>{quantity}</Typography>

              <IconButton
                className={classes.quantityButton}
                onClick={handleIncrement}
                size="small"
              >
                <AddIcon />
              </IconButton>
            </div>
          </div>
        </CardContent>
      </Card>

      <Modal
        className={classes.modal}
        open={open}
        onClose={handleClose}
        closeAfterTransition
        BackdropComponent={Backdrop}
        BackdropProps={{
          timeout: 500,
        }}
      >
        <Fade in={open}>
          <Card className={classes.modalCard} elevation={24}>
            <IconButton
              className={classes.closeButton}
              onClick={handleClose}
              size="small"
            >
              <CloseIcon />
            </IconButton>

            <CardMedia
              className={classes.modalMedia}
              image={imageUrl}
              title={foodName}
            >
              {!imageUrl && (
                <Typography className={classes.placeholderText}>
                  Food Image
                </Typography>
              )}
            </CardMedia>

            <CardContent className={classes.content}>
              <Typography variant="h5" className={classes.foodName}>
                {foodName}
              </Typography>

              <Typography className={classes.unitPrice}>
                Unit: ₱{price.toFixed(2)}
                {unit ? ` ${unit}` : ""}
              </Typography>

              <div className={classes.priceSection}>
                <div className={classes.totalSection}>
                  <Typography variant="body2" style={{ fontWeight: 600 }}>
                    Total:
                  </Typography>
                  <Typography className={classes.price}>
                    ₱{totalPrice.toFixed(2)}
                  </Typography>
                </div>

                <div className={classes.quantityControls}>
                  <IconButton
                    className={classes.quantityButton}
                    onClick={handleDecrement}
                    size="small"
                  >
                    <RemoveIcon />
                  </IconButton>

                  <Typography className={classes.quantity}>
                    {quantity}
                  </Typography>

                  <IconButton
                    className={classes.quantityButton}
                    onClick={handleIncrement}
                    size="small"
                  >
                    <AddIcon />
                  </IconButton>
                </div>
              </div>
            </CardContent>
          </Card>
        </Fade>
      </Modal>
    </>
  );
}
