import React, { useState } from "react";
import {
  Paper,
  Grid,
  Typography,
  TextField,
  Button,
  List,
  ListItem,
  ListItemText,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from "@material-ui/core";
import EditIcon from "@material-ui/icons/Edit";
import DeleteIcon from "@material-ui/icons/Delete";

const CriteriaManagement = () => {
  const [criteriaList, setCriteriaList] = useState([]);
  const [selectedIndex, setSelectedIndex] = useState(null);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [criteriaName, setCriteriaName] = useState("");

  /* =========================
     OPEN CREATE DIALOG
  ========================== */
  const handleCreate = () => {
    setEditMode(false);
    setCriteriaName("");
    setDialogOpen(true);
  };

  /* =========================
     OPEN EDIT DIALOG
  ========================== */
  const handleEdit = (index) => {
    setEditMode(true);
    setSelectedIndex(index);
    setCriteriaName(criteriaList[index].name);
    setDialogOpen(true);
  };

  /* =========================
     SAVE CRITERIA
  ========================== */
  const handleSave = () => {
    if (!criteriaName.trim()) return;

    if (editMode) {
      const updated = [...criteriaList];
      updated[selectedIndex].name = criteriaName;
      setCriteriaList(updated);
    } else {
      setCriteriaList([
        ...criteriaList,
        {
          name: criteriaName,
          maxScore: 5 // always 5/5 scoring
        }
      ]);
    }

    setDialogOpen(false);
  };

  /* =========================
     DELETE CRITERIA
  ========================== */
  const handleDelete = (index) => {
    const updated = criteriaList.filter((_, i) => i !== index);
    setCriteriaList(updated);
  };

  /* =========================
     CLEAR ALL
  ========================== */
  const handleClear = () => {
    setCriteriaList([]);
  };

  /* =========================
     COMPUTE TOTALS (for display)
  ========================== */
  const totalMaxScore = criteriaList.length * 5;

  return (
    <div style={{ padding: 20 }}>
      <Typography variant="h5" gutterBottom>
        Criteria
      </Typography>

      {/* ================= TOP FILTER SECTION ================= */}
      <Paper style={{ padding: 20, marginBottom: 20 }}>
        <Grid container spacing={2}>
          <Grid item xs={4}>
            <TextField
              fullWidth
              variant="outlined"
              label="Select Category"
            />
          </Grid>

          <Grid item xs={4}>
            <TextField
              fullWidth
              variant="outlined"
              label="Search"
            />
          </Grid>
        </Grid>

        <div style={{ marginTop: 20 }}>
          <Button
            variant="contained"
            style={{ backgroundColor: "#f26b2c", color: "#fff", marginRight: 10 }}
            onClick={handleCreate}
          >
            CREATE
          </Button>

          <Button onClick={handleClear}>
            CLEAR
          </Button>
        </div>
      </Paper>

      {/* ================= MAIN CONTENT ================= */}
      <Grid container spacing={3}>
        {/* LEFT PANEL */}
        <Grid item xs={4}>
          <Paper style={{ padding: 20 }}>
            <Typography variant="h6">
              Criteria Settings
            </Typography>

            <List>
              {criteriaList.map((item, index) => (
                <ListItem
                  button
                  key={index}
                  selected={selectedIndex === index}
                  onClick={() => setSelectedIndex(index)}
                >
                  <ListItemText
                    primary={item.name}
                    secondary="Max Score: 5"
                  />

                  <IconButton onClick={(e) => { e.stopPropagation(); handleEdit(index); }}>
                    <EditIcon />
                  </IconButton>

                  <IconButton onClick={(e) => { e.stopPropagation(); handleDelete(index); }}>
                    <DeleteIcon />
                  </IconButton>
                </ListItem>
              ))}
            </List>
          </Paper>
        </Grid>

        {/* RIGHT PANEL */}
        <Grid item xs={8}>
          <Paper style={{ padding: 20 }}>
            <Grid container justifyContent="space-between" alignItems="center">
              <Typography variant="h6">
                Details
              </Typography>

              <Button
                variant="contained"
                style={{ backgroundColor: "#f26b2c", color: "#fff" }}
                onClick={handleCreate}
              >
                ADD CRITERIA
              </Button>
            </Grid>

            <div style={{ marginTop: 20 }}>
              <Typography>
                Total Criteria: {criteriaList.length}
              </Typography>

              <Typography>
                Total Maximum Score: {totalMaxScore}
              </Typography>
            </div>

            <div style={{ marginTop: 20 }}>
              <Button
                variant="contained"
                color="primary"
              >
                SAVE
              </Button>
            </div>
          </Paper>
        </Grid>
      </Grid>

      {/* ================= DIALOG ================= */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)}>
        <DialogTitle>
          {editMode ? "Edit Criteria" : "Create Criteria"}
        </DialogTitle>

        <DialogContent>
          <TextField
            fullWidth
            variant="outlined"
            label="Criteria Name"
            value={criteriaName}
            onChange={(e) => setCriteriaName(e.target.value)}
          />

          <Typography style={{ marginTop: 10 }}>
            Maximum Score: 5
          </Typography>
        </DialogContent>

        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>
            Cancel
          </Button>

          <Button
            variant="contained"
            color="primary"
            onClick={handleSave}
          >
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default CriteriaManagement;
