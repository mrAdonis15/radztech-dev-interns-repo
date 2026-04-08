import Typography from "@material-ui/core/Typography";
import { IconButton } from "@material-ui/core";
import HelpOutlineIcon from "@material-ui/icons/HelpOutline";
import ClearIcon from "@material-ui/icons/Clear";

export default function TutorialCard({
  title,
  desc,
  onGuideClick,
  onHide,
  style,
}) {
  return (
    <div
      className="tutorial-card-container"
      onAbort={onGuideClick}
      style={style}
    >
      <div className="tutorial-card-body">
        <Typography variant="h6" style={{ width: "85%" }}>
          {title}
        </Typography>

        <IconButton
          style={{ alignSelf: "flex-end", margin: 0 }}
          onClick={onHide}
          aria-label="Close tutorial"
          title="Close"
        >
          <ClearIcon style={{ fontSize: "18px" }} />
        </IconButton>
      </div>
      <div className="tutorial-card-body">
        <Typography variant="body2" style={{ width: "85%" }}>
          {desc}
        </Typography>

        <IconButton
          onClick={onGuideClick}
          aria-label="Close tutorial"
          title="Close"
        >
          <HelpOutlineIcon style={{ fontSize: "26px", color: "#f57c00" }} />
        </IconButton>
      </div>
    </div>
  );
}
