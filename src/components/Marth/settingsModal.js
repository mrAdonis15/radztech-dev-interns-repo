import React from "react";
import { makeStyles } from "@material-ui/core/styles";
import Modal from "@material-ui/core/Modal";
import { Paper, Box, Typography, Button, TextField } from "@material-ui/core";
import CloseIcon from "@material-ui/icons/Close";

const useStyles = makeStyles((theme) => ({
  paper: {
    position: "absolute",
    width: "50%",
    height: "70%",
    backgroundColor: theme.palette.background.paper,
    boxShadow: theme.shadows[5],
  },
}));

const SettingsModal = ({
  open,
  handleClose,
  handleSave,
  handleUpdate,
  title,
  formData,
}) => {
  const styles = useStyles();
  return (
    <div>
      <Modal
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
        open={open}
        onClose={handleClose}
        aria-labelledby="simple-modal-title"
        aria-describedby="simple-modal-description"
      >
        <Paper className={styles.paper}>
          <Box
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              backgroundColor: "#FF7504",
              padding: "10px",
            }}
          >
            <Typography
              style={{ color: "#ffff", fontSize: "18px", fontWeight: "bold" }}
            >
              {title}
            </Typography>
            <Button
              onClick={handleClose}
              style={{ color: "#ffff", fontWeight: "bold" }}
            >
              <CloseIcon />
            </Button>
          </Box>

          <Box
            style={{
              overflowY: "auto",
              height: "75%",
              margin: "10px",
              borderRadius: "5px",
              // border: "1px solid black",
            }}
          >
            <TextField
              value={formData}
              onChange={handleUpdate}
              multiline
              fullWidth
              variant="filled"
              minRows={1}
              InputProps={{
                disableUnderline: true,
                style: {
                  height: "100%",
                  alignItems: "stretch",
                  fontFamily: "monospace",
                  backgroundColor: "#E5E4E2",
                },
              }}
              inputProps={{
                style: {
                  height: "100%",
                  overflow: "auto",
                },
              }}
              style={{ height: "100%" }}
            />
          </Box>
          <Box
            style={{
              display: "flex",
              justifyContent: "flex-end",
            }}
          >
            <Button style={{ color: "#696969" }} onClick={handleClose}>
              Cancel
            </Button>
            <Button
              style={{ color: "#FF7504" }}
              onClick={() => handleSave(formData)}
            >
              Save
            </Button>
          </Box>
        </Paper>
      </Modal>
    </div>
  );
};

export default SettingsModal;
