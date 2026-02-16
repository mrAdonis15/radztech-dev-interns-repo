import React, { Component } from "react";

class AdvancedSettings extends Component {
  state = {
    jsonData: {
      AdvancedSettings: {
        showStaus: true,
        node1: true,
        parent: "title"
      },
      childNumber1: {
        showStatus: false,
        key1: {
          showStatus: true,
          value1: "testing key1"
        },
        key2: {
          showStatus: true,
          value2: "test 2"
        },
        key3: {
          showStatus: true,
          value3: "test 3"
        }
      }
    },
    activeEditorPath: null,
    jsonText: ""
  };

  // Open JSON editor
  openEditor = (path) => {
    this.setState({
      activeEditorPath: path,
      jsonText: JSON.stringify(this.state.jsonData, null, 2)
    });
  };

  // Update JSON text while typing
  updateJson = (e) => {
    this.setState({ jsonText: e.target.value });
  };

  // Save JSON changes to state and reflect in UI
  saveJson = () => {
    try {
      const parsed = JSON.parse(this.state.jsonText);
      this.setState({ jsonData: parsed, activeEditorPath: null });
      alert("JSON saved successfully!");
    } catch {
      alert("Invalid JSON! Fix before saving.");
    }
  };

  // Convert JSON into boxes (parent + child)
 flattenJsonToBoxes = (obj) => {
  const boxes = [];

  Object.keys(obj).forEach((key) => {
    const value = obj[key];
    const isObject = typeof value === "object" && value !== null;

    // 🚫 hide parent box
    if (isObject && value.showStatus === false) return;

    // ✅ parent box
    boxes.push({
      caption: key,
      path: [key],
      showBraces: isObject
    });

    // children
    if (isObject) {
      Object.keys(value).forEach((childKey) => {
        if (childKey === "showStatus") return;

        const childValue = value[childKey];
        const childIsObject =
          typeof childValue === "object" && childValue !== null;

        // 🚫 hide child box
        if (childIsObject && childValue.showStatus === false) return;

        boxes.push({
          caption: childKey,
          path: [key, childKey],
          showBraces: childIsObject
        });
      });
    }
  });

  return boxes;
};



  // Render individual box
  renderBox = (box, indent = 0) => {
    const isChild = indent > 0;
    return (
      <div
        key={box.path.join("-")}
        style={{
          width: 420,
          marginLeft: indent,
          borderRadius: 8,
          border: "1px solid #ddd",
          marginBottom: 12,
          overflow: "hidden",
          fontFamily: "Arial, sans-serif",
          boxShadow: "0 2px 5px rgba(0,0,0,0.05)",
          transition: "transform 0.2s, box-shadow 0.2s",
          cursor: "default",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = "scale(1.03)";
          e.currentTarget.style.boxShadow = "0 6px 12px rgba(0,0,0,0.15)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = "scale(1)";
          e.currentTarget.style.boxShadow = "0 2px 5px rgba(0,0,0,0.05)";
        }}
      >
        {/* Orange top bar for parent or child */}
        <div
          style={{
            height: 6,
            backgroundColor: "#ff7f50",
            display: box.showBraces || isChild ? "block" : "none"
          }}
        ></div>

        {/* Header for parent boxes */}
        {box.showBraces && !isChild && (
          <div
            style={{
              backgroundColor: "#ff7f50",
              color: "#fff",
              display: "flex",
              alignItems: "center",
              padding: "8px 12px",
              fontSize: 13,
              fontWeight: 600
            }}
          >
            <span style={{ fontWeight: "bold", marginRight: 8 }}>{`{}`}</span>
            <div style={{ flex: 1 }}></div>
            <span
              style={{ cursor: "pointer", fontWeight: 600 }}
              onClick={() => this.openEditor(box.path)}
            >
              EDIT
            </span>
          </div>
        )}

        {/* Body */}
        <div
          style={{
            backgroundColor: isChild ? "#fef7f0" : "#f0f0f0",
            padding: "12px 16px",
            fontSize: isChild ? 16 : 20,
            color: "#333",
            fontWeight: isChild ? 400 : 600,
          }}
        >
          {box.caption}
        </div>
      </div>
    );
  };

  render() {
    const { jsonData, jsonText, activeEditorPath } = this.state;
    const boxes = this.flattenJsonToBoxes(jsonData);

    return (
      <div style={{ display: "flex", padding: 40, paddingTop: 80, fontFamily: "Arial, sans-serif" }}>
        {/* LEFT: Boxes */}
        <div>
          {boxes.map((box) => {
            const isChild = box.path.length > 1;
            return this.renderBox(box, isChild ? 20 : 0);
          })}
        </div>

        {/* RIGHT: JSON Editor */}
        {activeEditorPath && (
          <div
            style={{
              marginLeft: 20,
              width: 520,
              background: "#fdfdfd",
              padding: 16,
              borderRadius: 8,
              border: "1px solid #ddd",
              boxShadow: "0 2px 8px rgba(0,0,0,0.05)"
            }}
          >
            <strong style={{ fontSize: 16 }}>JSON Editor</strong>
            <textarea
              value={jsonText}
              onChange={this.updateJson}
              style={{
                marginTop: 12,
                width: "100%",
                height: 500,
                fontFamily: "monospace",
                fontSize: 14,
                padding: 10,
                borderRadius: 6,
                border: "1px solid #ccc",
                resize: "vertical",
                backgroundColor: "#fafafa"
              }}
            />
            <button
              onClick={this.saveJson}
              style={{
                marginTop: 12,
                padding: "8px 16px",
                backgroundColor: "#4caf50",
                color: "#fff",
                border: "none",
                borderRadius: 6,
                fontWeight: 600,
                cursor: "pointer",
                boxShadow: "0 2px 4px rgba(0,0,0,0.1)"
              }}
            >
              Save
            </button>
          </div>
        )}
      </div>
    );
  }
}

export default AdvancedSettings;
