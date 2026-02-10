import React, { useState, useEffect } from 'react';
import { Box, TextField, IconButton } from '@material-ui/core';
import { Save } from '@material-ui/icons';
import TreeView from '../components/TreeView';
import jsonData from '../data/JsonData.json';
import '../styles.css';

const DisplayPage = () => {
  const [data, setData] = useState(jsonData);
  const [jsonString, setJsonString] = useState(JSON.stringify(jsonData, null, 2));
  const [jsonError, setJsonError] = useState(null);

  useEffect(() => {
    setJsonString(JSON.stringify(data, null, 2));
  }, [data]);

  const updateData = (path, value) => {
    setData((prev) => {
      const newData = { ...prev };
      
      // If path is empty, update root object
      if (path.length === 0) {
        return { ...value };
      }
      
      let current = newData;
      
      for (let i = 0; i < path.length - 1; i++) {
        if (current[path[i]] === undefined || current[path[i]] === null) {
          current[path[i]] = {};
        }
        if (typeof current[path[i]] === 'object' && current[path[i]] !== null) {
          current[path[i]] = Array.isArray(current[path[i]]) 
            ? [...current[path[i]]] 
            : { ...current[path[i]] };
        }
        current = current[path[i]];
      }
      
      if (current && typeof current === 'object') {
        current[path[path.length - 1]] = value;
      }
      return newData;
    });
  };

  const handleDelete = (path) => {
    if (path.length === 0) return;
    
    setData((prev) => {
      const newData = JSON.parse(JSON.stringify(prev));
      
      if (path.length === 1) {
        delete newData[path[0]];
        return newData;
      }
      
      let current = newData;
      
      for (let i = 0; i < path.length - 1; i++) {
        if (current[path[i]] === undefined || current[path[i]] === null) {
          return newData;
        }
        current = current[path[i]];
      }
      
      if (current && typeof current === 'object') {
        delete current[path[path.length - 1]];
      }
      return newData;
    });
  };

  const handleJsonChange = (event) => {
    const newJsonString = event.target.value;
    setJsonString(newJsonString);
    setJsonError(null);
  };

  const handleJsonBlur = () => {
    try {
      const parsed = JSON.parse(jsonString);
      setData(parsed);
      setJsonError(null);
    } catch (error) {
      setJsonError(error.message);
    }
  };

  const handleSave = () => {
    try {
      const parsed = JSON.parse(jsonString);
      setData(parsed);
      setJsonError(null);
    } catch (error) {
      setJsonError(error.message);
      alert(`Invalid JSON: ${error.message}`);
    }
  };

  return (
    <Box className="display-container">
      {/* Main Content Area */}
      <Box className="main-content">
        {/* Left Side - Tree View */}
        <Box className="tree-panel">
          <TreeView
            data={data}
            onUpdate={updateData}
            onDelete={handleDelete}
          />
        </Box>

        {/* Right Side - JSON Editor */}
        <Box className="json-panel">
          <TextField
            fullWidth
            multiline
            variant="outlined"
            value={jsonString}
            onChange={handleJsonChange}
            onBlur={handleJsonBlur}
            placeholder="{}"
            className="json-textarea"
            style={{ height: '100%', flex: 1 }}
            InputProps={{
              style: {
                height: '100%',
                alignItems: 'flex-start',
                backgroundColor: 'transparent',
                borderRadius: 0,
              }
            }}
            inputProps={{
              className: 'json-textarea-input',
              style: {
                height: '100%',
                overflow: 'auto',
                resize: 'none',
                fontFamily: 'Courier New, monospace',
                fontSize: '13px',
                padding: '20px',
                lineHeight: '1.6',
                boxSizing: 'border-box',
              }
            }}
          />
        </Box>
      </Box>

      {/* Bottom Right - Orange SAVE Button */}
      <Box className="save-button-container">
        <IconButton
          onClick={handleSave}
          disabled={!!jsonError}
          className="save-button"
        >
          <Save />
        </IconButton>
      </Box>
    </Box>
  );
};

export default DisplayPage;
