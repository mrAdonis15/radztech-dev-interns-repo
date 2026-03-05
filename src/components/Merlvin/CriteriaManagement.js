import React, { useMemo, useState } from "react";
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
  DialogActions,
  MenuItem,
  Snackbar,
} from "@material-ui/core";
import EditIcon from "@material-ui/icons/Edit";
import DeleteIcon from "@material-ui/icons/Delete";

const STORAGE_KEY = "merlvin-criteria-list";

function loadInitialCriteria() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter((item) => item && typeof item === "object")
      .map((item, index) => ({
        id: item.id || `criteria-${Date.now()}-${index}`,
        name: String(item.name || "").trim(),
        category: String(item.category || "General"),
        maxScore: Number(item.maxScore) > 0 ? Number(item.maxScore) : 5,
      }))
      .filter((item) => item.name);
  } catch (_) {
    return [];
  }
}

const CriteriaManagement = () => {
  const [criteriaList, setCriteriaList] = useState(() => loadInitialCriteria());
  const [selectedIndex, setSelectedIndex] = useState(null);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [criteriaName, setCriteriaName] = useState("");
  const [category, setCategory] = useState("General");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [deleteIndex, setDeleteIndex] = useState(null);
  const [validationError, setValidationError] = useState("");
  const [snackbarOpen, setSnackbarOpen] = useState(false);

  const categories = useMemo(() => {
    const fromData = Array.from(
      new Set(criteriaList.map((item) => item.category || "General")),
    );
    return ["All", "General", ...fromData.filter((c) => c !== "General")];
  }, [criteriaList]);

  const filteredCriteriaList = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    return criteriaList.filter((item) => {
      const categoryMatch =
        selectedCategory === "All" || item.category === selectedCategory;
      const searchMatch = !query || item.name.toLowerCase().includes(query);
      return categoryMatch && searchMatch;
    });
  }, [criteriaList, searchQuery, selectedCategory]);

  const persistCriteria = (nextList) => {
    setCriteriaList(nextList);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(nextList));
    } catch (_) {}
  };

  const handleCreate = () => {
    setEditMode(false);
    setSelectedIndex(null);
    setCriteriaName("");
    setCategory("General");
    setValidationError("");
    setDialogOpen(true);
  };

  const handleEdit = (index) => {
    const item = filteredCriteriaList[index];
    if (!item) return;
    const realIndex = criteriaList.findIndex((c) => c.id === item.id);
    if (realIndex < 0) return;
    setEditMode(true);
    setSelectedIndex(realIndex);
    setCriteriaName(item.name);
    setCategory(item.category || "General");
    setValidationError("");
    setDialogOpen(true);
  };

  const handleSave = () => {
    const trimmedName = criteriaName.trim();
    if (!trimmedName) {
      setValidationError("Criteria name is required.");
      return;
    }

    const duplicate = criteriaList.some((item, index) => {
      if (editMode && index === selectedIndex) return false;
      return item.name.toLowerCase() === trimmedName.toLowerCase();
    });
    if (duplicate) {
      setValidationError("Criteria name already exists.");
      return;
    }

    if (editMode) {
      const updated = [...criteriaList];
      updated[selectedIndex] = {
        ...updated[selectedIndex],
        name: trimmedName,
        category,
      };
      persistCriteria(updated);
    } else {
      persistCriteria([
        ...criteriaList,
        {
          id: `criteria-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
          name: trimmedName,
          category,
          maxScore: 5,
        },
      ]);
    }

    setValidationError("");
    setDialogOpen(false);
  };

  const handleDelete = (index) => {
    setDeleteIndex(index);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    const item = filteredCriteriaList[deleteIndex];
    if (!item) {
      setDeleteDialogOpen(false);
      setDeleteIndex(null);
      return;
    }
    const updated = criteriaList.filter((c) => c.id !== item.id);
    persistCriteria(updated);
    setDeleteDialogOpen(false);
    setDeleteIndex(null);
  };

  const handleClear = () => {
    persistCriteria([]);
    setSelectedIndex(null);
    setSearchQuery("");
    setSelectedCategory("All");
  };

  const handleSaveAll = () => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(criteriaList));
      setSnackbarOpen(true);
    } catch (_) {}
  };

  const totalMaxScore = criteriaList.length * 5;

  return (
    <div style={{ padding: 20, marginTop: 60 }}>
      <Typography variant="h5" gutterBottom>
        Criteria
      </Typography>

      <Paper style={{ padding: 20, marginBottom: 20 }}>
        <Grid container spacing={2}>
          <Grid item xs={4}>
            <TextField
              fullWidth
              select
              variant="outlined"
              label="Select Category"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
            >
              {categories.map((item) => (
                <MenuItem key={item} value={item}>
                  {item}
                </MenuItem>
              ))}
            </TextField>
          </Grid>

          <Grid item xs={4}>
            <TextField
              fullWidth
              variant="outlined"
              label="Search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </Grid>
        </Grid>

        <div style={{ marginTop: 20 }}>
          <Button
            variant="contained"
            style={{
              backgroundColor: "#f26b2c",
              color: "#fff",
              marginRight: 10,
            }}
            onClick={handleCreate}
          >
            CREATE
          </Button>

          <Button onClick={handleClear}>CLEAR</Button>
        </div>
      </Paper>

      <Grid container spacing={3}>
        {/* LEFT PANEL */}
        <Grid item xs={4}>
          <Paper style={{ padding: 20 }}>
            <Typography variant="h6">Criteria Settings</Typography>

            <List>
              {filteredCriteriaList.map((item, index) => (
                <ListItem
                  button
                  key={item.id}
                  selected={criteriaList[selectedIndex]?.id === item.id}
                  onClick={() =>
                    setSelectedIndex(
                      criteriaList.findIndex((c) => c.id === item.id),
                    )
                  }
                >
                  <ListItemText
                    primary={item.name}
                    secondary={`Category: ${item.category} • Max Score: 5`}
                  />

                  <IconButton onClick={() => handleEdit(index)}>
                    <EditIcon />
                  </IconButton>

                  <IconButton onClick={() => handleDelete(index)}>
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
              <Typography variant="h6">Details</Typography>

              <Button
                variant="contained"
                style={{ backgroundColor: "#f26b2c", color: "#fff" }}
                onClick={handleCreate}
              >
                ADD CRITERIA
              </Button>
            </Grid>

            <div style={{ marginTop: 20 }}>
              <Typography>Total Criteria: {criteriaList.length}</Typography>
              <Typography>Total Max Score: {totalMaxScore}</Typography>
            </div>

            <div style={{ marginTop: 20 }}>
              <Button
                variant="contained"
                color="primary"
                onClick={handleSaveAll}
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
            error={Boolean(validationError)}
            helperText={validationError || " "}
            autoFocus
          />

          <TextField
            fullWidth
            select
            variant="outlined"
            label="Category"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            {categories
              .filter((c) => c !== "All")
              .map((item) => (
                <MenuItem key={item} value={item}>
                  {item}
                </MenuItem>
              ))}
          </TextField>

          <Typography style={{ marginTop: 10 }}>Maximum Score: 5</Typography>
        </DialogContent>

        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>

          <Button variant="contained" color="primary" onClick={handleSave}>
            Save
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
      >
        <DialogTitle>Delete Criteria</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete this criteria?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button color="secondary" onClick={confirmDelete}>
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={2000}
        onClose={() => setSnackbarOpen(false)}
        message="Criteria saved"
      />
    </div>
  );
};

export default CriteriaManagement;
