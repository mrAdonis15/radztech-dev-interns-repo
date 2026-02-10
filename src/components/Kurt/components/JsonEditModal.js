import React from 'react';
import {
  Box,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  IconButton
} from '@material-ui/core';
import { DeleteOutline } from '@material-ui/icons';
import '../styles.css';

const JsonEditModal = ({
  open,
  onClose,
  onSave,
  onDelete,
  title = 'Edit Item',
  editingKey = null,
  jsonEditor = '',
  setJsonEditor = null
}) => {


  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        className: 'modal-paper'
      }}
    >
      <DialogTitle style={{ padding: 0 }}>
        <Box className="modal-title-container">
          <Typography className="modal-title">{title}</Typography>
                 <Box className="modal-title-actions">
                   <IconButton
                     onClick={onDelete}
                     className="modal-title-icon-button"
                   >
                     <DeleteOutline />
                   </IconButton>
                 </Box>
        </Box>
      </DialogTitle>
      <DialogContent className="modal-content">
        <Box className="modal-json-editor-box">
          <TextField
            fullWidth
            multiline
            rows={20}
            variant="outlined"
            value={jsonEditor}
            onChange={(e) => setJsonEditor && setJsonEditor(e.target.value)}
            className="modal-json-textarea"
            InputProps={{
              className: 'modal-json-textarea'
            }}
            placeholder='{}'
          />
        </Box>
      </DialogContent>
      <DialogActions className="modal-actions">
        <Button 
          onClick={onClose}
          className="modal-action-button"
        >
          CANCEL
        </Button>
        <Button 
          onClick={onSave} 
          variant="contained"
          className="modal-action-button primary"
        >
          SAVE
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default JsonEditModal;
