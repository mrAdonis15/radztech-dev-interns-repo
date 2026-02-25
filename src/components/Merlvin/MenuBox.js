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
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";
import AddIcon from "@material-ui/icons/Add";
import RemoveIcon from "@material-ui/icons/Remove";
import RestaurantMenuIcon from "@material-ui/icons/RestaurantMenu";

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
  ingredientGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "8px",
  },
  expandIcon: {
    transition: "transform 0.3s ease",
  },
  imageGallery: {
    display: "grid",
    gridTemplateColumns: "repeat(2, 1fr)",
    gap: "16px",
    padding: "16px",
    backgroundColor: "#fafafa",
  },
  galleryImage: {
    width: "100%",
    height: "200px",
    backgroundColor: "#e0e0e0",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: "8px",
  },
  quantitySection: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: theme.spacing(2),
    borderTop: "1px solid #e0e0e0",
    marginTop: theme.spacing(2),
  },
  quantitySectionCompact: {
    padding: theme.spacing(1.25),
    marginTop: theme.spacing(1.25),
  },
  priceDisplay: {
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-start",
  },
  totalPrice: {
    fontSize: "1.5rem",
    fontWeight: 700,
    color: "#111",
  },
  totalPriceCompact: {
    fontSize: "1.1rem",
  },
  quantityControls: {
    display: "flex",
    alignItems: "center",
    gap: theme.spacing(1),
  },
  quantityButton: {
    minWidth: 40,
    width: 40,
    height: 40,
    padding: 0,
    transition: "all 0.2s ease",
    "&:hover": {
      backgroundColor: "#ff9500",
      color: "#fff",
      transform: "scale(1.15)",
    },
  },
  quantityButtonCompact: {
    minWidth: 30,
    width: 30,
    height: 30,
  },
  quantityValue: {
    fontSize: "1.25rem",
    fontWeight: 600,
    minWidth: 40,
    textAlign: "center",
  },
  quantityValueCompact: {
    fontSize: "1rem",
    minWidth: 28,
  },
}));

// Helper component: Display food image or placeholder
const ImageDisplay = ({ imageUrl, foodName, isModal = false }) => {
  const classes = useStyles();
  const mediaClass = isModal ? classes.modalMedia : classes.media;
  return (
    <CardMedia className={mediaClass} image={imageUrl} title={foodName}>
      {!imageUrl && (
        <RestaurantMenuIcon
          style={{ fontSize: isModal ? "100px" : "60px", color: "#999" }}
        />
      )}
    </CardMedia>
  );
};

// Helper component: Expandable section (accordion)
const ExpandableSection = ({
  title,
  content,
  isExpanded,
  onToggle,
  classes,
  type = "text",
}) => {
  return (
    <div style={{ marginBottom: "12px" }}>
      <div className={classes.accordionHeader} onClick={onToggle}>
        <Typography variant="subtitle2" style={{ fontWeight: 600 }}>
          {title}
        </Typography>
        <ExpandMoreIcon
          className={classes.expandIcon}
          style={{ transform: isExpanded ? "rotate(180deg)" : "rotate(0deg)" }}
        />
      </div>
      {isExpanded && (
        <div className={classes.accordionContent}>
          {type === "ingredients" ? (
            <div className={classes.ingredientGrid}>
              {content.split(",").map((item, idx) => (
                <Typography key={idx} variant="body2">
                  • {item.trim()}
                </Typography>
              ))}
            </div>
          ) : (
            <Typography variant="body2">{content}</Typography>
          )}
        </div>
      )}
    </div>
  );
};

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
  const [quantity, setQuantity] = useState(0);

  // Toggle accordion sections in modal
  const toggleSection = (section) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  // Handle quantity increment
  const handleIncrement = () => {
    setQuantity(quantity + 1);
  };

  // Handle quantity decrement
  const handleDecrement = () => {
    if (quantity > 0) {
      setQuantity(quantity - 1);
    }
  };

  // Calculate total price
  const totalPrice = price * quantity;

  return (
    <>
      {/* Card View - Small menu item preview */}
      <Card className={classes.card} elevation={3}>
        <IconButton
          className={classes.expandButton}
          onClick={() => setOpen(true)}
          size="small"
        >
          <FullscreenIcon />
        </IconButton>

        <ImageDisplay imageUrl={imageUrl} foodName={foodName} />

        <CardContent className={classes.content}>
          <Typography variant="h6" className={classes.foodName}>
            {foodName}
          </Typography>

          <Typography className={classes.unitPrice}>
            Unit: ₱{price.toFixed(2)}
            {unit ? ` ${unit}` : ""}
          </Typography>

          <div
            className={`${classes.quantitySection} ${classes.quantitySectionCompact}`}
          >
            <div className={classes.priceDisplay}>
              <Typography variant="body2" style={{ fontWeight: 600 }}>
                Total:
              </Typography>
              <Typography
                className={`${classes.totalPrice} ${classes.totalPriceCompact}`}
              >
                ₱{totalPrice.toFixed(2)}
              </Typography>
            </div>
            <div className={classes.quantityControls}>
              <IconButton
                className={`${classes.quantityButton} ${classes.quantityButtonCompact}`}
                onClick={handleDecrement}
                size="small"
              >
                <RemoveIcon />
              </IconButton>
              <Typography
                className={`${classes.quantityValue} ${classes.quantityValueCompact}`}
              >
                {quantity}
              </Typography>
              <IconButton
                className={`${classes.quantityButton} ${classes.quantityButtonCompact}`}
                onClick={handleIncrement}
                size="small"
              >
                <AddIcon />
              </IconButton>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Modal View - Full details with ingredients and cooking instructions */}
      <Modal
        className={classes.modal}
        open={open}
        onClose={() => setOpen(false)}
        closeAfterTransition
        BackdropComponent={Backdrop}
        BackdropProps={{ timeout: 500 }}
      >
        <Fade in={open}>
          <Card className={classes.modalCard} elevation={24}>
            <IconButton
              className={classes.closeButton}
              onClick={() => setOpen(false)}
              size="small"
            >
              <CloseIcon />
            </IconButton>

            {/* Image Gallery with Placeholders */}
            <div className={classes.imageGallery}>
              {[1, 2, 3, 4].map((index) => (
                <div key={index} className={classes.galleryImage}>
                  <RestaurantMenuIcon
                    style={{ fontSize: "60px", color: "#bdbdbd" }}
                  />
                </div>
              ))}
            </div>

            <CardContent className={classes.content}>
              <Typography variant="h5" className={classes.foodName}>
                {foodName}
              </Typography>

              <Typography className={classes.unitPrice}>
                Unit: ₱{price.toFixed(2)}
                {unit ? ` ${unit}` : ""}
              </Typography>

              {description && (
                <Typography
                  variant="body2"
                  style={{ marginTop: "16px", marginBottom: "16px" }}
                >
                  {description}
                </Typography>
              )}

              {cooking_instructions && (
                <ExpandableSection
                  title="How It's Cooked"
                  content={cooking_instructions}
                  isExpanded={expandedSections.cooking_instructions}
                  onToggle={() => toggleSection("cooking_instructions")}
                  classes={classes}
                />
              )}

              {/* Quantity and Price Section */}
              <div className={classes.quantitySection}>
                <div className={classes.priceDisplay}>
                  <Typography variant="body2" style={{ fontWeight: 600 }}>
                    Total:
                  </Typography>
                  <Typography className={classes.totalPrice}>
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
                  <Typography className={classes.quantityValue}>
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
