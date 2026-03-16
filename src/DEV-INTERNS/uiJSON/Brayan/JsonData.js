import React, { useState } from "react";
import {
  Grid,
  Paper,
  TextField,
  Checkbox,
  FormControlLabel,
  Typography,
  Button,
  Box,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Divider,
} from "@material-ui/core";

import AddIcon from "@material-ui/icons/Add";
import DeleteIcon from "@material-ui/icons/Delete";
import EditIcon from "@material-ui/icons/Edit";
import CodeIcon from "@material-ui/icons/Code";

const JsonData = () => {
  const [jsonText, setJsonText] = useState("");
  const [config, setConfig] = useState({});
  const [error, setError] = useState("");

  const applyJson = () => {
    try {
      const parsed = JSON.parse(jsonText);
      setConfig(parsed);
      setError("");
    } catch {
      setError("Invalid JSON");
    }
  };

  const [wholeSettingDialogOpen, setWholeSettingDialogOpen] = useState(false);
  const [wholeSetting, setWholeSetting] = useState({
    caption: "Advance Settings",
    node1: true,
    parent: "title",
    child: [],
  });

  const openWholeSettingDialog = () => {
    setWholeSetting({
      ...wholeSetting,
      child: config.child ? [...config.child] : wholeSetting.child,
    });
    setWholeSettingDialogOpen(true);
  };

  const closeWholeSettingDialog = () => setWholeSettingDialogOpen(false);

  const saveWholeSetting = () => {
    setConfig(wholeSetting);
    setJsonText(JSON.stringify(wholeSetting, null, 2));
    closeWholeSettingDialog();
  };

  const addChild = () => {
    const nextNumber = wholeSetting.child.length + 1;
    const newChild = {
      caption: `child number ${nextNumber}`,
      key1: `testing key${nextNumber}`,
      test: `test ${nextNumber}`,
      array1: [1, 2, 3, 4],
      show: true,
    };
    setWholeSetting({
      ...wholeSetting,
      child: [...wholeSetting.child, newChild],
    });
  };

  const removeChild = (index) => {
    const updated = wholeSetting.child.filter((_, i) => i !== index);
    setWholeSetting({ ...wholeSetting, child: updated });
  };

  const updateChild = (index, key, value) => {
    const updated = wholeSetting.child.map((c, i) =>
      i === index ? { ...c, [key]: value } : c
    );
    setWholeSetting({ ...wholeSetting, child: updated });
  };

  const [childDialogOpen, setChildDialogOpen] = useState(false);
  const [editingChildIndex, setEditingChildIndex] = useState(null);
  const [childJsonText, setChildJsonText] = useState("");
  const [childJsonError, setChildJsonError] = useState("");

  const openChildJsonDialog = (index) => {
    setEditingChildIndex(index);
    setChildJsonText(JSON.stringify(wholeSetting.child[index], null, 2));
    setChildJsonError("");
    setChildDialogOpen(true);
  };

  const closeChildJsonDialog = () => {
    setChildDialogOpen(false);
    setEditingChildIndex(null);
    setChildJsonText("");
    setChildJsonError("");
  };

  const saveChildJson = () => {
    try {
      const parsed = JSON.parse(childJsonText);
      const updated = wholeSetting.child.map((c, i) =>
        i === editingChildIndex ? parsed : c
      );
      setWholeSetting({ ...wholeSetting, child: updated });
      closeChildJsonDialog();
    } catch {
      setChildJsonError("Invalid JSON");
    }
  };

  const editNode1 = () => {
    openWholeSettingDialog();
  };

  const deleteNode1 = () => {
    setConfig((prev) => {
      const newConfig = { ...prev };
      delete newConfig.node1;
      return newConfig;
    });
  };

  const editParent = () => {
    openWholeSettingDialog();
  };

  const deleteParent = () => {
    setConfig((prev) => {
      const newConfig = { ...prev };
      delete newConfig.parent;
      return newConfig;
    });
  };

  const editChild = (idx) => {
    openChildJsonDialog(idx);
  };

  const deleteChild = (idx) => {
    setConfig((prev) => ({
      ...prev,
      child: prev.child.filter((_, i) => i !== idx),
    }));
  };

  const editChildProperty = (childIdx, key) => {
    openChildJsonDialog(childIdx);
  };

  const deleteChildProperty = (childIdx, key) => {
    setConfig((prev) => ({
      ...prev,
      child: prev.child.map((c, i) => {
        if (i === childIdx) {
          const newChild = { ...c };
          delete newChild[key];
          return newChild;
        }
        return c;
      }),
    }));
  };

  const CardItem = ({ title, children, onEdit, onDelete }) => (
    <Paper style={{ marginBottom: 12, borderRadius: 8, overflow: "hidden" }}>
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        px={2}
        py={1}
        style={{ backgroundColor: "#c3bbb5", color: "white" }}
      >
        <Typography variant="subtitle2">{title}</Typography>
        <Box>
          <Tooltip title="Edit">
            <IconButton style={{ color: "white" }} onClick={onEdit}>
              <EditIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Delete">
            <IconButton style={{ color: "white" }} onClick={onDelete}>
              <DeleteIcon />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>
      <Box p={2} style={{ backgroundColor: "#e0e0e0" }}>
        {children}
      </Box>
    </Paper>
  );

  const renderConfigCards = () => {
    if (!config || Object.keys(config).length === 0) {
      return <Typography>No config loaded.</Typography>;
    }

    return (
      <Box>
        {"node1" in config && (
          <CardItem title="node1" onEdit={editNode1} onDelete={deleteNode1}>
            <Typography>{String(config.node1)}</Typography>
          </CardItem>
        )}

        {"parent" in config && (
          <CardItem title="parent" onEdit={editParent} onDelete={deleteParent}>
            <Typography>{config.parent}</Typography>
          </CardItem>
        )}

        {Array.isArray(config.child) &&
          config.child.map((child, idx) => (
            <Box key={idx}>
              <CardItem title="{}" onEdit={() => editChild(idx)} onDelete={() => deleteChild(idx)}>
                <Typography>{child.caption}</Typography>
              </CardItem>

              {Object.entries(child).map(([key, value]) => {
                if (key === "caption") return null;
                return (
                  <CardItem
                    key={key}
                    title={key}
                    onEdit={() => editChildProperty(idx, key)}
                    onDelete={() => deleteChildProperty(idx, key)}
                  >
                    <Typography>
                      {Array.isArray(value)
                        ? JSON.stringify(value)
                        : String(value)}
                    </Typography>
                  </CardItem>
                );
              })}
            </Box>
          ))}
      </Box>
    );
  };

  return (
    <Box
      display="flex"
      justifyContent="center"
      alignItems="center"
      minHeight="100vh"
      p={2}
      style={{ backgroundColor: "#f5f5f5" }}
    >
      <Paper
        elevation={4}
        style={{
          height: "80vh",
          borderRadius: 16,
          width: "100%",
          maxWidth: "1200px",
          border: "1px solid #e0e0e0",
          overflow: "hidden",
          paddingTop: "50px",
        }}
      >
        <Grid container style={{ height: "100%" }}>
          {/* left side panel */}
          <Grid item xs={6} style={{ height: "100%" }}>
            <Paper
              style={{
                height: "100%",
                padding: 16,
                display: "flex",
                flexDirection: "column",
              }}
            >
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Box display="flex" alignItems="center">
                  <CodeIcon style={{ marginRight: 8 }} />
                  <Typography variant="h6">Advance Settings</Typography>
                </Box>
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={openWholeSettingDialog}
                >
                  Add/Edit
                </Button>
              </Box>

              <Divider />

              <Box mt={2} style={{ flex: 1, overflowY: "auto", paddingRight: 8 }}>
                {renderConfigCards()}
              </Box>
            </Paper>
          </Grid>

          {/* right side panel */}
          <Grid item xs={6} style={{ height: "100%" }}>
            <Paper
              style={{
                height: "100%",
                padding: 16,
                background: "#bdb9b2",
                color: "white",
                overflow: "auto",
              }}
            >
              <Box display="flex" justifyContent="space-between" alignItems="center">
                <Typography variant="h6">JSON Configuration</Typography>
                <Button variant="contained" onClick={applyJson}>
                  Apply JSON
                </Button>
              </Box>

              <TextField
                multiline
                minRows={12}
                variant="outlined"
                fullWidth
                value={jsonText}
                onChange={(e) => setJsonText(e.target.value)}
                placeholder="Paste JSON here"
                style={{ marginTop: 10, background: "white" }}
              />

              {error && (
                <Typography color="error" style={{ marginTop: 8 }}>
                  {error}
                </Typography>
              )}
            </Paper>
          </Grid>

          <Dialog open={wholeSettingDialogOpen} onClose={closeWholeSettingDialog} maxWidth="sm" fullWidth>
            <DialogTitle>Edit Whole Setting</DialogTitle>
            <DialogContent>
              <TextField
                label="caption"
                value={wholeSetting.caption}
                onChange={(e) => setWholeSetting({ ...wholeSetting, caption: e.target.value })}
                fullWidth
                style={{ marginBottom: 16 }}
              />
              <FormControlLabel
                control={
                  <Checkbox
                    checked={wholeSetting.node1}
                    onChange={(e) => setWholeSetting({ ...wholeSetting, node1: e.target.checked })}
                  />
                }
                label="node1"
              />
              <TextField
                label="parent"
                value={wholeSetting.parent}
                onChange={(e) => setWholeSetting({ ...wholeSetting, parent: e.target.value })}
                fullWidth
                style={{ marginBottom: 16 }}
              />

              <Typography variant="h6">Child</Typography>
              <Button startIcon={<AddIcon />} onClick={addChild}>
                Add Child
              </Button>

              {wholeSetting.child.map((child, index) => (
                <Box key={index} mt={2} p={1} border="1px solid #ccc">
                  <TextField
                    label="Caption"
                    value={child.caption}
                    onChange={(e) => updateChild(index, "caption", e.target.value)}
                    fullWidth
                  />
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={child.show}
                        onChange={(e) => updateChild(index, "show", e.target.checked)}
                      />
                    }
                    label="Show"
                  />
                  <Tooltip title="Edit JSON">
                    <IconButton onClick={() => openChildJsonDialog(index)}>
                      <EditIcon />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Delete">
                    <IconButton onClick={() => removeChild(index)}>
                      <DeleteIcon />
                    </IconButton>
                  </Tooltip>
                </Box>
              ))}
            </DialogContent>
            <DialogActions>
              <Button onClick={closeWholeSettingDialog}>Cancel</Button>
              <Button onClick={saveWholeSetting} color="primary">
                Save
              </Button>
            </DialogActions>
          </Dialog>

          <Dialog open={childDialogOpen} onClose={closeChildJsonDialog} maxWidth="md" fullWidth>
            <DialogTitle>Edit Child JSON</DialogTitle>
            <DialogContent>
              <TextField
                multiline
                minRows={10}
                variant="outlined"
                fullWidth
                value={childJsonText}
                onChange={(e) => setChildJsonText(e.target.value)}
              />
              {childJsonError && <Typography color="error">{childJsonError}</Typography>}
            </DialogContent>
            <DialogActions>
              <Button onClick={closeChildJsonDialog}>Cancel</Button>
              <Button onClick={saveChildJson} color="primary">
                Save
              </Button>
            </DialogActions>
          </Dialog>
        </Grid>
      </Paper>
    </Box>
  );
};

export default JsonData;