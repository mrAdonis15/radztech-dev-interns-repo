import React from 'react';
import wholeAdvance from './configs/wholeAdvance..js';
import {  Paper, Typography, Button, ListItem, ListItemText, IconButton, TextField, Table, TableBody, TableCell, TableHead, TableRow, Snackbar, Dialog, DialogTitle, DialogContent, DialogActions } from '@material-ui/core';
import EditIcon from '@material-ui/icons/Edit';
import DeleteIcon from '@material-ui/icons/Delete';
import CloseIcon from '@material-ui/icons/Close';


class Jayson extends React.Component {
  constructor(props){
    super(props);
    const initial = { caption: (wholeAdvance.config && wholeAdvance.config.caption) || 'Advanced Settings', items: [] };
    this.state = {
      data: initial,
      jsonText: JSON.stringify(initial, null, 2),
      showRaw: false,
      editingMap: {},
      editValues: {},
      addedMap: {},
      snackbar: { open: false, message: '' },
      dialogOpen: false,
      dialogText: '',
      dialogKey: null
    };

    this.showMessage = this.showMessage.bind(this);
    this.closeMessage = this.closeMessage.bind(this);
    this.openEditDialog = this.openEditDialog.bind(this);
    this.closeEditDialog = this.closeEditDialog.bind(this);
    this.saveEditDialog = this.saveEditDialog.bind(this);
    this.savePoolEdit = this.savePoolEdit.bind(this);
    this.cancelPoolEdit = this.cancelPoolEdit.bind(this);
    this.handlePoolDelete = this.handlePoolDelete.bind(this);
    this.handleJsonChange = this.handleJsonChange.bind(this);
    this.renderTableRows = this.renderTableRows.bind(this);
    this.applyJson = this.applyJson.bind(this);
  }


  showMessage(msg){ this.setState({ snackbar: { open: true, message: msg } }); }
  closeMessage(){ this.setState({ snackbar: { open: false, message: '' } }); }

  openEditDialog(item){
    function findItem(items, key){ if (!items) return null; for (let i=0;i<items.length;i++){ if (items[i].key===key) return items[i]; const r = findItem(items[i].children, key); if (r) return r; } return null; }
    const js = findItem(this.state.data.items||[], item.key) || item;
    this.setState({ dialogKey: item.key, dialogText: JSON.stringify(js, null, 2), dialogOpen: true });
  }

  closeEditDialog(){ this.setState({ dialogOpen: false, dialogKey: null, dialogText: '' }); }

  saveEditDialog(){
    try {
      const parsed = JSON.parse(this.state.dialogText);
      const next = JSON.parse(JSON.stringify(this.state.data));
      function updateItem(items, oldKey, newObj){ if (!items) return false; for (let i=0;i<items.length;i++){ if (items[i].key===oldKey){ items[i] = Object.assign({}, newObj); return true; } if (items[i].children && updateItem(items[i].children, oldKey, newObj)) return true; } return false; }
      const updated = updateItem(next.items||[], this.state.dialogKey, parsed);
      if (!updated) {
        // find template path in wholeAdvance.config to insert into same parent
        function findPath(items, key, path){ if (!items) return null; for (let i=0;i<items.length;i++){ const it = items[i]; if (it.key===key) return (path||[]).concat(it.key); if (it.children){ const p = findPath(it.children, key, (path||[]).concat(it.key)); if (p) return p; } } return null; }
        const tplPath = findPath((wholeAdvance.config && wholeAdvance.config.items) || [], this.state.dialogKey, []);
        if (!next.items) next.items = [];
        if (tplPath && tplPath.length>1) {
          // traverse/ensure parent chain exists in next.items
          let cursor = next.items;
          for (let i=0;i<tplPath.length-1;i++){
            const k = tplPath[i];
            let node = cursor.find(function(it){ return it.key === k; });
            if (!node) { node = { key: k, type: 'object', children: [] }; cursor.push(node); }
            if (!node.children) node.children = [];
            cursor = node.children;
          }
          // insert parsed under the final parent cursor
          cursor.push(parsed);
        } else {
          // top-level insert
          next.items.push(parsed);
        }
      }
      if (parsed.key && parsed.key !== this.state.dialogKey){ const pool = wholeAdvance.config.items || []; const p = pool.find(function(it){ return it.key === this.state.dialogKey; }, this); if (p) p.key = parsed.key; }
      const am = {};
      function collect(items){ if(!items) return; items.forEach(function(it){ if (it.key) am[it.key]=true; if (it.children) collect(it.children); }); }
      collect(next.items||[]);
      this.setState({ data: next, jsonText: JSON.stringify(next, null, 2), dialogOpen:false, dialogKey:null, dialogText: '', addedMap: am });
      this.showMessage('Saved JSON for ' + (parsed.key||this.state.dialogKey));
    } catch(e){ this.showMessage('Invalid JSON: ' + e.message); }
  }

  savePoolEdit(oldKey){
    const newKey = this.state.editValues[oldKey];
    if (!newKey) { this.showMessage('Key cannot be empty'); return; }
    const pool = wholeAdvance.config.items || [];
    const p = pool.find(function(it){ return it.key === oldKey; }); if (p) p.key = newKey;
    const next = JSON.parse(JSON.stringify(this.state.data));
    function updateKeys(items){ if (!items) return; items.forEach(function(it){ if (it.key===oldKey) it.key = newKey; if (it.children) updateKeys(it.children); }); }
    updateKeys(next.items);
    const em = Object.assign({}, this.state.editingMap); delete em[oldKey];
    const ev = Object.assign({}, this.state.editValues); delete ev[oldKey];
    this.setState({ data: next, jsonText: JSON.stringify(next, null, 2), editingMap: em, editValues: ev });
    this.showMessage('Edited key: ' + newKey);
  }

  cancelPoolEdit(oldKey){
    const em = Object.assign({}, this.state.editingMap); delete em[oldKey];
    const ev = Object.assign({}, this.state.editValues); delete ev[oldKey];
    this.setState({ editingMap: em, editValues: ev });
  }

  handlePoolDelete(item){
    const next = JSON.parse(JSON.stringify(this.state.data));
    function remove(items, key){ if (!items) return []; return items.filter(function(it){ if (it.key===key) return false; if (it.children) it.children = remove(it.children, key); return true; }); }
    next.items = remove(next.items||[], item.key);
    const am = Object.assign({}, this.state.addedMap); delete am[item.key];
    this.setState({ data: next, addedMap: am, jsonText: JSON.stringify(next, null, 2) });
    this.showMessage('Removed from JSON: ' + item.key);
  }

  handleJsonChange(ev){
    const v = ev.target.value; this.setState({ jsonText: v });
    try {
      const parsed = JSON.parse(v);
      function toItems(obj){
        if (!obj) return [];
        if (Array.isArray(obj)){
          if (obj.length>0 && obj[0] && obj[0].key) return obj;
          return obj.map(function(val, idx){ return { key: String(idx), type: Array.isArray(val)?'array':(typeof val==='object'&&val!==null)?'object':'string', value: Array.isArray(val)||typeof val!=='object'? val: undefined, children: (typeof val==='object'&&val!==null && !Array.isArray(val))? toItems(val): undefined }; });
        }
        if (typeof obj === 'object'){
          return Object.keys(obj).map(function(k){ const val = obj[k]; if (Array.isArray(val)) return { key:k, type:'array', value:val }; if (typeof val === 'object' && val !== null) return { key:k, type:'object', children: toItems(val) }; return { key:k, type: typeof val, value: val }; });
        }
        return [];
      }
      let normalized;
      if (parsed && parsed.items){ normalized = { caption: parsed.caption||((wholeAdvance.config&&wholeAdvance.config.caption)||'Advanced Settings'), items: parsed.items }; }
      else if (parsed && parsed.config && parsed.config.items){ normalized = { caption: parsed.config.caption||parsed.caption||((wholeAdvance.config&&wholeAdvance.config.caption)||'Advanced Settings'), items: parsed.config.items }; }
      else if (parsed && parsed.wholeAdvance && parsed.wholeAdvance.config && parsed.wholeAdvance.config.items){ normalized = { caption: parsed.wholeAdvance.config.caption||((wholeAdvance.config&&wholeAdvance.config.caption)||'Advanced Settings'), items: parsed.wholeAdvance.config.items }; }
      else { normalized = { caption: (parsed.caption||((wholeAdvance.config&&wholeAdvance.config.caption)||'Advanced Settings')), items: toItems(parsed) }; }
      this.setState({ data: normalized });
      this.showMessage('Auto-applied JSON');
      const map = {};
      function collect(items){ if(!items) return; items.forEach(function(it){ if (it.key) map[it.key]=true; if (it.children) collect(it.children); }); }
      collect(normalized.items||[]);
      this.setState({ addedMap: map });
    } catch(e) {
      // ignore invalid JSON while typing
    }
  }

  renderTableRows(items, depth){
    let rows = [];
    if (!items) return rows;
    const self = this;
    items.forEach(function(it, idx){
      const pad = depth*16;
      rows.push(React.createElement(TableRow, { key: it.key + '_' + idx }, React.createElement(TableCell, { style: { paddingLeft: pad } }, it.key || ''), React.createElement(TableCell, null, it.type || ''), React.createElement(TableCell, null, Array.isArray(it.value)? JSON.stringify(it.value): (it.value===undefined? '': String(it.value))), React.createElement(TableCell, null, React.createElement(Button, { size:'small', onClick: function(){ self.openEditDialog(it); } }, 'EDIT'), React.createElement(Button, { size:'small', onClick: function(){ self.handlePoolDelete(it); } }, 'DELETE'))));
      if (it.children && it.children.length) rows = rows.concat(self.renderTableRows(it.children, depth+1));
    });
    return rows;
  }

  applyJson(){
    try {
      const parsed = JSON.parse(this.state.jsonText);
      function toItems(obj){
        if (!obj) return [];
        if (Array.isArray(obj)){
          if (obj.length>0 && obj[0] && obj[0].key) return obj;
          return obj.map(function(val, idx){ return { key: String(idx), type: Array.isArray(val)?'array':(typeof val==='object'&&val!==null)?'object':'string', value: Array.isArray(val)||typeof val!=='object'? val: undefined, children: (typeof val==='object'&&val!==null && !Array.isArray(val))? toItems(val): undefined }; });
        }
        if (typeof obj === 'object'){
          return Object.keys(obj).map(function(k){ const val = obj[k]; if (Array.isArray(val)) return { key:k, type:'array', value:val }; if (typeof val === 'object' && val !== null) return { key:k, type:'object', children: toItems(val) }; return { key:k, type: typeof val, value: val }; });
        }
        return [];
      }
      let normalized;
      if (parsed && parsed.items){ normalized = { caption: parsed.caption||((wholeAdvance.config&&wholeAdvance.config.caption)||'Advanced Settings'), items: parsed.items }; }
      else if (parsed && parsed.config && parsed.config.items){ normalized = { caption: parsed.config.caption||parsed.caption||((wholeAdvance.config&&wholeAdvance.config.caption)||'Advanced Settings'), items: parsed.config.items }; }
      else if (parsed && parsed.wholeAdvance && parsed.wholeAdvance.config && parsed.wholeAdvance.config.items){ normalized = { caption: parsed.wholeAdvance.config.caption||((wholeAdvance.config&&wholeAdvance.config.caption)||'Advanced Settings'), items: parsed.wholeAdvance.config.items }; }
      else { normalized = { caption: (parsed.caption||((wholeAdvance.config&&wholeAdvance.config.caption)||'Advanced Settings')), items: toItems(parsed) }; }
      this.setState({ data: normalized, jsonText: JSON.stringify(normalized, null, 2) });
      const map = {};
      function collect(items){ if(!items) return; items.forEach(function(it){ if (it.key) map[it.key]=true; if (it.children) collect(it.children); }); }
      collect(normalized.items||[]);
      this.setState({ addedMap: map });
      this.showMessage('Applied JSON');
    } catch(e){ this.showMessage('Invalid JSON: ' + e.message); }
  }

  render(){
    const data = this.state.data;
    const jsonText = this.state.jsonText;
    const showRaw = this.state.showRaw;
    const editingMap = this.state.editingMap;
    const editValues = this.state.editValues;
    const snackbar = this.state.snackbar;
    const dialogOpen = this.state.dialogOpen;
    const dialogText = this.state.dialogText;

    const self = this;

      return React.createElement('div', { className: 'json-designer', style: { display:'flex', gap:24, padding:24, minHeight:'70vh', paddingTop:100 } },
      React.createElement('div', { className: 'jd-left', style: { width:320 } },
        React.createElement(Paper, { className: 'jd-card' },
          React.createElement('div', { className: 'jd-header', style: { background:'#f58220', color:'#fff', padding:'12px 16px', fontWeight:600 } }, ' Advance Settings'),
          React.createElement('div', { className: 'jd-section-list' }, (wholeAdvance.config && wholeAdvance.config.items||[]).map(function(item){
            function findItem(items, key) { if (!items) return null; for (let i=0;i<items.length;i++){ if (items[i].key===key) return items[i]; const r = findItem(items[i].children, key); if (r) return r; } return null; }
            const jsonItem = findItem(data.items||[], item.key) || null;

            if (editingMap[item.key]) {
              return React.createElement(ListItem, { key: item.key, style: { display:'flex', justifyContent:'space-between', background:'#fff7ed', marginBottom:8, borderRadius:4 } },
                React.createElement(TextField, { value: editValues[item.key]||'', onChange: function(e){ const ev=Object.assign({}, editValues); ev[item.key]=e.target.value; self.setState({ editValues: ev }); }, placeholder: 'key' }),
                React.createElement('div', null, React.createElement(Button, { size:'small', variant:'contained', color:'primary', onClick: function(){ return self.savePoolEdit(item.key); } }, 'Save'), React.createElement(Button, { size:'small', onClick: function(){ return self.cancelPoolEdit(item.key); } }, 'Cancel'))
              );
            }

            const displayValue = (jsonItem && jsonItem.value !== undefined) ? (Array.isArray(jsonItem.value)? JSON.stringify(jsonItem.value) : String(jsonItem.value)) : (jsonItem && jsonItem.type ? jsonItem.type : (item.type||''));
            const main = React.createElement(ListItem, { key: item.key, style: { display:'flex', justifyContent:'space-between', background:'#fffaf0', marginBottom:8, borderRadius:4 } },
              React.createElement('div', null, React.createElement('span', { style: { fontWeight:500 } }, item.key), React.createElement('span', { style: { marginLeft:8, color:'#6b6b6b' } }, ': ' + displayValue)),
              React.createElement('div', null, React.createElement(IconButton, { size:'small', onClick: function(){ return self.openEditDialog(item); }, style: { color: '#f58220' } }, React.createElement(EditIcon, null)), React.createElement(IconButton, { size:'small', onClick: function(){ return self.handlePoolDelete(item); }, style: { color: '#9e5a00' } }, React.createElement(DeleteIcon, null)))
            );

            const childNodes = (jsonItem && jsonItem.children) ? jsonItem.children : [];
            const childrenElements = [];
            if (childNodes && childNodes.length) {
              childNodes.forEach(function(ch){
                if (editingMap[ch.key]) {
                  childrenElements.push(React.createElement(ListItem, { key: ch.key, style: { display:'flex', justifyContent:'space-between', background:'#fff7ed', marginBottom:8, borderRadius:4, marginLeft:16 } },
                    React.createElement(TextField, { value: editValues[ch.key]||'', onChange: function(e){ const ev=Object.assign({}, editValues); ev[ch.key]=e.target.value; self.setState({ editValues: ev }); }, placeholder: 'key' }),
                    React.createElement('div', null, React.createElement(Button, { size:'small', variant:'contained', color:'primary', onClick: function(){ return self.savePoolEdit(ch.key); } }, 'Save'), React.createElement(Button, { size:'small', onClick: function(){ return self.cancelPoolEdit(ch.key); } }, 'Cancel'))
                  ));
                } else {
                  const chValue = (ch.value !== undefined) ? (Array.isArray(ch.value)? JSON.stringify(ch.value) : String(ch.value)) : (ch.type||'');
                  childrenElements.push(React.createElement(ListItem, { key: ch.key, style: { display:'flex', justifyContent:'space-between', background:'#fffaf0', marginBottom:8, borderRadius:4, marginLeft:16 } },
                    React.createElement('div', null, React.createElement('span', { style: { fontWeight:500 } }, ch.key), React.createElement('span', { style: { marginLeft:8, color:'#6b6b6b' } }, ': ' + chValue)),
                    React.createElement('div', null, React.createElement(IconButton, { size:'small', onClick: function(){ return self.openEditDialog(ch); }, style: { color: '#f58220' } }, React.createElement(EditIcon, null)), React.createElement(IconButton, { size:'small', onClick: function(){ return self.handlePoolDelete(ch); }, style: { color: '#9e5a00' } }, React.createElement(DeleteIcon, null)))
                  ));
                }
              });
            }

            return React.createElement(React.Fragment, { key: item.key + '_group' }, main, childrenElements);
          }))
        )
      )

      ,React.createElement('div', { className: 'jd-right', style: { flex:1 } },
        React.createElement('div', { style: { display:'flex', alignItems:'center', justifyContent:'space-between' } },
          React.createElement(Typography, { variant:'h6' }, 'JSON Configuration'),
          React.createElement('div', { className: 'jd-toolbar' }, React.createElement(Button, { variant:'contained', style: { background: '#f58220', color: '#fff' }, onClick: function(){ navigator.clipboard && navigator.clipboard.writeText(jsonText); self.applyJson(); } }, 'SAVE JSON'), React.createElement(Button, { variant:'outlined', onClick: function(){ self.setState({ showRaw: !self.state.showRaw }); }, style: { marginLeft:8 } }, 'VIEW JSON'))
        ),

        this.state.showRaw ? React.createElement(Table, { size:'small' }, React.createElement(TableHead, null, React.createElement(TableRow, null, React.createElement(TableCell, null, 'Key'), React.createElement(TableCell, null, 'Type'), React.createElement(TableCell, null, 'Value'), React.createElement(TableCell, null, 'Actions'))), React.createElement(TableBody, null, this.renderTableRows(data.items||[], 0))) : React.createElement(TextField, { className:'jd-textarea', multiline:true, fullWidth:true, minRows:26, variant:'outlined', onChange: this.handleJsonChange, value: jsonText }),
        React.createElement(Dialog, { open: dialogOpen, onClose: this.closeEditDialog, maxWidth: 'sm', fullWidth: true },
          React.createElement(DialogTitle, null, 'Edit JSON'),
          React.createElement(DialogContent, null, React.createElement(TextField, { multiline: true, fullWidth: true, minRows: 12, variant: 'outlined', value: dialogText, onChange: function(e){ self.setState({ dialogText: e.target.value }); } })),
          React.createElement(DialogActions, null, React.createElement(Button, { onClick: this.closeEditDialog }, 'Cancel'), React.createElement(Button, { color: 'primary', variant: 'contained', onClick: this.saveEditDialog }, 'Save'))
        ),
        React.createElement(Snackbar, { anchorOrigin: { vertical: 'bottom', horizontal: 'left' }, open: snackbar.open, autoHideDuration: 3000, onClose: this.closeMessage, message: snackbar.message, action: React.createElement(IconButton, { size: 'small', color: 'inherit', onClick: this.closeMessage }, React.createElement(CloseIcon, null)) })
      )
    );
  }
}

export default Jayson;
