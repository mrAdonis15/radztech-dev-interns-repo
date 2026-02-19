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
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";
import { useCart } from "../../contexts/CartContext";

const useStyles = makeStyles((theme) => ({
  card: {
    position: "relative",
    width: "100%",
    minWidth: 0,
    transition: "all 0.3s ease",
    "&:hover": {
      transform: "translateY(-8px)",
      boxShadow: "0 8px 16px rgba(0,0,0,0.2)",
    },
  },
  expandButton: {
    position: "absolute",
    top: 8,
    right: 8,
    backgroundColor: "rgba(255, 255, 255, 0.8)",
    transition: "all 0.3s ease",
    "&:hover": {
      backgroundColor: "rgba(255, 255, 255, 1)",
      transform: "scale(1.1)",
      boxShadow: "0 2px 8px rgba(0,0,0,0.2)",
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
    transition: "all 0.2s ease",
    "&:hover": {
      backgroundColor: "#1976d2",
      color: "#fff",
      transform: "scale(1.15)",
    },
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
    width: "90vw",
    maxWidth: 900,
    maxHeight: "75vh",
    overflow: "auto",
    outline: "none",
    margin: 16,
    [theme.breakpoints.up("sm")]: {
      margin: 24,
    },
  },
  closeButton: {
    position: "absolute",
    top: 8,
    right: 8,
    backgroundColor: "rgba(255, 255, 255, 0.8)",
    transition: "all 0.3s ease",
    "&:hover": {
      backgroundColor: "rgba(255, 0, 0, 0.8)",
      color: "#fff",
      transform: "rotate(90deg)",
    },
    zIndex: 1,
  },
  modalMedia: {
    height: 350,
    backgroundColor: "#d0d0d0",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  accordionHeader: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: theme.spacing(2),
    background: "linear-gradient(90deg, #ff9500 0%, #faa500 100%)",
    borderRadius: 4,
    marginTop: theme.spacing(2),
    cursor: "pointer",
    color: "#fff",
    transition: "all 0.3s ease",
    "&:hover": {
      background: "linear-gradient(90deg, #ff8c00 0%, #ff9500 100%)",
      transform: "translateX(4px)",
      boxShadow: "0 2px 8px rgba(255, 149, 0, 0.4)",
    },
  },
  accordionContent: {
    padding: theme.spacing(2),
    backgroundColor: "#fafafa",
    borderLeft: "3px solid #1976d2",
    marginTop: theme.spacing(1),
    whiteSpace: "pre-wrap",
    lineHeight: 1.6,
  },
  expandIcon: {
    transition: "transform 0.3s ease",
  },
  stepBox: {
    padding: theme.spacing(2),
    marginBottom: theme.spacing(1.5),
    backgroundColor: "#fff",
    border: "1px solid #ddd",
    borderRadius: 6,
    borderLeft: "4px solid #1976d2",
    boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
  },
  stepNumber: {
    fontWeight: 700,
    color: "#1976d2",
    marginRight: theme.spacing(1),
    display: "inline-block",
    minWidth: 24,
  },
}));

export default function MenuBox({
  id,
  foodName = "Food Name/Desc",
  price = 0.0,
  unit = "",
  description = "",
  ingredients = "",
  cooking_instructions = "",
  imageUrl = null,
}) {
  const classes = useStyles();
  const [open, setOpen] = useState(false);
  const [expandedSections, setExpandedSections] = useState({});
  const { cartItems, addToCart, updateQuantity } = useCart();
  
  const cartItem = cartItems.find((item) => item.id === id);
  const quantity = cartItem ? cartItem.quantity : 0;
  const totalPrice = price * quantity;

  const toggleSection = (section) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

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

            <CardContent className={classes.content} style={{ maxHeight: "400px", overflowY: "auto" }}>
              <Typography variant="h5" className={classes.foodName}>
                {foodName}
              </Typography>

              <Typography className={classes.unitPrice}>
                Unit: ₱{price.toFixed(2)}
                {unit ? ` ${unit}` : ""}
              </Typography>

              {description && (
                <Typography variant="body2" style={{ marginTop: "16px", marginBottom: "16px" }}>
                  {description}
                </Typography>
              )}

              {ingredients && (
                <div style={{ marginBottom: "12px" }}>
                  <div
                    className={classes.accordionHeader}
                    onClick={() => toggleSection("ingredients")}
                  >
                    <Typography variant="subtitle2" style={{ fontWeight: 600 }}>
                      Ingredients
                    </Typography>
                    <ExpandMoreIcon
                      className={classes.expandIcon}
                      style={{
                        transform: expandedSections.ingredients
                          ? "rotate(180deg)"
                          : "rotate(0deg)",
                        transition: "transform 0.3s ease",
                      }}
                    />
                  </div>
                  {expandedSections.ingredients && (
                    <div className={classes.accordionContent}>
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
                        {ingredients.split(",").map((item, index) => (
                          <Typography key={index} variant="body2">
                            • {item.trim()}
                          </Typography>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {cooking_instructions && (
                <div style={{ marginBottom: "16px" }}>
                  <div
                    className={classes.accordionHeader}
                    onClick={() => toggleSection("cooking_instructions")}
                  >
                    <Typography variant="subtitle2" style={{ fontWeight: 600 }}>
                      How It's Cooked
                    </Typography>
                    <ExpandMoreIcon
                      className={classes.expandIcon}
                      style={{
                        transform: expandedSections.cooking_instructions
                          ? "rotate(180deg)"
                          : "rotate(0deg)",
                        transition: "transform 0.3s ease",
                      }}
                    />
                  </div>
                  {expandedSections.cooking_instructions && (
                    <div className={classes.accordionContent}>
                      <Typography variant="body2">
                        {cooking_instructions}
                      </Typography>
                    </div>
                  )}
                </div>
              )}

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
