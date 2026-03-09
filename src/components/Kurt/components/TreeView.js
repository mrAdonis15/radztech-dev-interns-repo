import React, { useState } from 'react';
import { Box, Typography, IconButton } from '@material-ui/core';
import { Edit as EditIcon, Delete as DeleteIcon, ChevronRight, ExpandMore } from '@material-ui/icons';
import JsonEditModal from './JsonEditModal';
import '../styles.css';

const TreeView = ({ data, onUpdate, onDelete }) => {
  const [editingPath, setEditingPath] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [jsonEditor, setJsonEditor] = useState('');
  const [collapsedPaths, setCollapsedPaths] = useState(new Set());

  const handleEdit = (path, value) => {
    setEditingPath(path);
    // Only show the specific value being edited, not the entire structure
    // For primitives and arrays, show as key-value pair; for objects, stringify with formatting
    const key = path[path.length - 1];
    const isPrimitive = typeof value !== 'object' || value === null;
    const isArray = Array.isArray(value);
    
    if (isPrimitive) {
      // For primitives, show as key-value pair
      if (typeof value === 'string') {
        setJsonEditor(`"${key}": "${value}"`);
      } else {
        setJsonEditor(`"${key}": ${JSON.stringify(value)}`);
      }
    } else if (isArray) {
      // For arrays, show as key-value pair with formatted array
      setJsonEditor(`"${key}": ${JSON.stringify(value, null, 2)}`);
    } else {
      // For objects, show the value with formatting
      setJsonEditor(JSON.stringify(value, null, 2));
    }
    setModalOpen(true);
  };

  const handleDelete = (path) => {
    onDelete(path);
  };

  const handleClose = () => {
    setModalOpen(false);
    setEditingPath(null);
    setJsonEditor('');
  };

  const toggleCollapse = (path) => {
    const pathKey = path.join('.');
    setCollapsedPaths(prev => {
      const newSet = new Set(prev);
      if (newSet.has(pathKey)) {
        newSet.delete(pathKey);
      } else {
        newSet.add(pathKey);
      }
      return newSet;
    });
  };

  const isCollapsed = (path) => {
    return collapsedPaths.has(path.join('.'));
  };

  const renderTreeItem = (key, value, path = [], level = 0) => {
    const isObject = typeof value === 'object' && value !== null && !Array.isArray(value);
    const isArray = Array.isArray(value);
    const isPrimitive = !isObject && !isArray;
    const hasChildren = isObject && Object.keys(value).filter(k => k !== 'caption').length > 0;
    const collapsed = isCollapsed(path);

    // Get display name - prefer caption, then key
    let displayName = key;
    if (isObject && value.caption) {
      displayName = value.caption;
    } else if (level === 0 && isObject) {
      displayName = 'Advanced Settings';
    }

    const indent = level * 20;

    return (
      <Box key={path.join('.')} style={{ marginLeft: `${indent}px` }}>
        <Box className="tree-item-wrapper">
          <Box className="tree-item-header">
            <Box className="tree-item-header-left" style={{ cursor: hasChildren ? 'pointer' : 'default' }} onClick={() => hasChildren && toggleCollapse(path)}>
              {hasChildren && (
                <IconButton size="small" className="tree-collapse-button" onClick={(e) => { e.stopPropagation(); toggleCollapse(path); }}>
                  {collapsed ? <ChevronRight fontSize="small" /> : <ExpandMore fontSize="small" />}
                </IconButton>
              )}
              {isObject && (
                <Typography className="tree-item-header-text">
                  {'{}'}
                </Typography>
              )}
              {isArray && (
                <Typography className="tree-item-header-text">
                  {'[]'}
                </Typography>
              )}
              <Typography className="tree-item-header-text">
                {displayName}
              </Typography>
              {isPrimitive && (
                <Typography className="tree-item-header-text" style={{ color: '#9e9e9e', fontWeight: 400, marginLeft: '8px' }}>
                  : {String(value)}
                </Typography>
              )}
              {isArray && (
                <Typography className="tree-item-header-text" style={{ color: '#9e9e9e', fontWeight: 400, marginLeft: '8px' }}>
                  ({value.length} items)
                </Typography>
              )}
            </Box>
            <Box className="tree-item-header-actions">
              <IconButton
                size="small"
                onClick={(e) => { e.stopPropagation(); handleEdit(path, value); }}
                className="tree-item-icon-button"
              >
                <EditIcon fontSize="small" />
              </IconButton>
              <IconButton
                size="small"
                onClick={(e) => { e.stopPropagation(); handleDelete(path); }}
                className="tree-item-icon-button"
              >
                <DeleteIcon fontSize="small" />
              </IconButton>
            </Box>
          </Box>
        </Box>

        {/* Object Children */}
        {!collapsed && isObject && Object.keys(value).length > 0 && (
          <Box className="tree-item-children">
            {Object.keys(value).map((childKey) => {
              if (childKey === 'caption') return null;
              return renderTreeItem(childKey, value[childKey], [...path, childKey], level + 1);
            })}
          </Box>
        )}

      </Box>
    );
  };

  return (
    <>
      <Box className="tree-container">
        {Object.keys(data).length === 0 ? (
          <Box className="tree-empty">
            <Typography>No data available</Typography>
          </Box>
        ) : (
          // Render root level item first if data has caption, then render children
          (() => {
            // Check if root has caption property (like in the image)
            if (data.caption && typeof data === 'object' && !Array.isArray(data)) {
              return (
                <Box>
                  {/* Root item with caption */}
                  <Box className="tree-item-wrapper">
                    <Box className="tree-item-header">
                      <Box className="tree-item-header-left" style={{ cursor: 'pointer' }} onClick={() => toggleCollapse([])}>
                        <IconButton size="small" className="tree-collapse-button" onClick={(e) => { e.stopPropagation(); toggleCollapse([]); }}>
                          {isCollapsed([]) ? <ChevronRight fontSize="small" /> : <ExpandMore fontSize="small" />}
                        </IconButton>
                        <Typography className="tree-item-header-text">
                          {'{}'}
                        </Typography>
                        <Typography className="tree-item-header-text">
                          {data.caption || 'Advanced Settings'}
                        </Typography>
                      </Box>
                      <Box className="tree-item-header-actions">
                        <IconButton
                          size="small"
                          onClick={(e) => { e.stopPropagation(); handleEdit([], data); }}
                          className="tree-item-icon-button"
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                        <IconButton
                          size="small"
                          onClick={(e) => { 
                            e.stopPropagation();
                            // Clear all data
                            Object.keys(data).forEach(key => onDelete([key]));
                          }}
                          className="tree-item-icon-button"
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Box>
                    </Box>
                  </Box>
                  {/* Children */}
                  {!isCollapsed([]) && (
                    <Box className="tree-item-children">
                      {Object.keys(data).map((key) => {
                        if (key === 'caption') return null;
                        return renderTreeItem(key, data[key], [key], 0);
                      })}
                    </Box>
                  )}
                </Box>
              );
            } else {
              // Render each top-level key
              return Object.keys(data).map((key) => renderTreeItem(key, data[key], [key], 0));
            }
          })()
        )}
      </Box>

      <JsonEditModal
        open={modalOpen}
        onClose={handleClose}
        onSave={() => {
          try {
            const trimmed = jsonEditor.trim();
            let parsed;
            
            // Check if it's a key-value pair format (for primitives and arrays)
            if (trimmed.includes(':') && !trimmed.startsWith('{') && !trimmed.startsWith('[')) {
              // Parse key-value pair like "key": value
              // Use multiline regex to handle arrays and objects in the value
              const keyValueMatch = trimmed.match(/^"([^"]+)":\s*(.+)$/s);
              if (keyValueMatch) {
                const valueStr = keyValueMatch[2].trim();
                // Parse the value part
                if (valueStr === 'true' || valueStr === 'false') {
                  parsed = valueStr === 'true';
                } else if (!isNaN(valueStr) && valueStr !== '' && !isNaN(Number(valueStr)) && !valueStr.includes('[') && !valueStr.includes('{')) {
                  parsed = Number(valueStr);
                } else if (valueStr.startsWith('"') && valueStr.endsWith('"') && !valueStr.includes('[') && !valueStr.includes('{')) {
                  parsed = JSON.parse(valueStr);
                } else {
                  // For arrays and nested objects
                  parsed = JSON.parse(valueStr);
                }
              } else {
                // Try to parse as regular JSON
                parsed = JSON.parse(trimmed);
              }
            } else {
              // Parse as regular JSON (for objects)
              parsed = JSON.parse(trimmed);
            }
            
            if (editingPath) {
              onUpdate(editingPath, parsed);
            }
            handleClose();
          } catch (error) {
            alert(`Invalid JSON: ${error.message}`);
          }
        }}
        onDelete={() => {
          if (editingPath) {
            handleDelete(editingPath);
            handleClose();
          }
        }}
        title="Edit Item"
        editingKey={editingPath ? editingPath[editingPath.length - 1] : null}
        jsonEditor={jsonEditor}
        setJsonEditor={setJsonEditor}
      />
    </>
  );
};

export default TreeView;
