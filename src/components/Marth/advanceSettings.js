import React, { useState, useEffect } from "react";

import { Paper, Box, Typography, Button, IconButton } from "@material-ui/core";
import CodeIcon from "@material-ui/icons/Code";

import SettingsModal from "./settingsModal";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";
import ChevronRightIcon from "@material-ui/icons/ChevronRight";
import ExpandLessIcon from "@material-ui/icons/ExpandLess";

const defaultSettings = {
  sJCd_singular: "Warehouse Transafer",
  showJE: true,
  showParticulars: false,
  showProd: true,
  showStatus: true,
  list: ["list1", "list2"],
  subType: {
    1: {
      caption: "",
      ixSubLinkType: 0,
      ixSubType: "",
      require: false,
      show: false,
    },
    2: {
      caption: "",
      ixSubType: 0,
      require: false,
      show: false,
    },
    3: {
      caption: "",
      ixSubType: 0,
      require: false,
      show: false,
    },
    4: {
      caption: "",
      ixSubType: 0,
      require: false,
      show: false,
    },
    5: {
      caption: "",
      ixSubType: 0,
      require: false,
      show: false,
    },
  },
  webEntry: {
    SaveAs: {
      allow: false,
    },
    allow: true,
    template: {
      required: true,
    },
    terms: false,
    trans_inv: {
      "allow-sn-re-entry": true,
      import: {
        allow: true,
      },
      invMaxRows: 350,
      vat: {
        showNVoption: true,
      },
    },
  },
};

const Settings = () => {
  const [settings, setSettings] = useState(defaultSettings);
  const [openSettingsDialog, setOpenSettingsDialog] = useState(false);
  const [formTitle, setFormTitle] = useState();
  const [formData, setFormData] = useState({});
  const [jsonText, setJsonText] = useState("");
  const [isSettingsExpanded, setIsSettingsExpanded] = useState(true);
  const [expandedMap, setExpandedMap] = useState({});
  const [isSettingsEdit, setIsSettingsEdit] = useState(false);

  const handleOpenSettinsDialog = () => setOpenSettingsDialog(true);
  const handleCloseSettinsDialog = () => setOpenSettingsDialog(false);

  const renderSettingsCards = (obj, parentPath = "", depth = 0) => {
    return Object.entries(obj).map(([key, value]) => {
      const path = parentPath ? `${parentPath}.${key}` : key;
      const isExpanded = !!expandedMap[path];

      if (
        (typeof value === "string" ||
          typeof value === "boolean" ||
          typeof value === "number") &&
        key !== "caption"
      ) {
        const marginLeft = 25 + depth * 25;
        return (
          <Paper
            key={path}
            style={{
              backgroundColor: "#F2F2F2",
              width: 200,
              marginTop: 15,
              marginLeft: marginLeft,
            }}
          >
            <Box
              style={{
                width: "100%",
                backgroundColor: "#FF7504",
                display: "flex",
                justifyContent: "flex-end",
                alignItems: "center",
                color: "#ffff",
                borderTopLeftRadius: "5px",
                borderTopRightRadius: "5px",
              }}
            >
              <div>
                <Button
                  variant="text"
                  style={{ color: "#ffff", fontSize: "12px" }}
                  onClick={() => onEditSettings(path, key, value)}
                >
                  Edit
                </Button>

                <Button
                  variant="text"
                  style={{ color: "#ffff", fontSize: "12px" }}
                  onClick={() => onDeleteSetting(key)}
                >
                  Delete
                </Button>
              </div>
            </Box>

            <Box p={1}>
              <Typography>{key}</Typography>
            </Box>
          </Paper>
        );
      }

      if (value && typeof value === "object") {
        const isArray = Array.isArray(value);

        const marginLeft = 25 + depth * 25;

        console.log(depth);

        return (
          <React.Fragment key={path}>
            <Paper
              style={{
                backgroundColor: "#F2F2F2",
                width: 200,
                marginTop: 15,
                marginLeft,
              }}
            >
              <Box
                style={{
                  width: "100%",
                  backgroundColor: "#FF7504",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  color: "#ffff",
                  borderTopLeftRadius: "5px",
                  borderTopRightRadius: "5px",
                }}
              >
                <Typography style={{ margin: "5px" }}>
                  {isArray ? "[ ]" : "{}"}
                </Typography>

                <div>
                  <Button
                    variant="text"
                    style={{ color: "#ffff", fontSize: "12px" }}
                    onClick={() => onEditSettings(path, key, value)}
                  >
                    Edit
                  </Button>

                  <Button
                    variant="text"
                    style={{ color: "#ffff", fontSize: "12px" }}
                    onClick={() => onDeleteSetting(key)}
                  >
                    Delete
                  </Button>
                </div>
              </Box>

              <Box
                p={1}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <Typography>{key}</Typography>
                {!isArray && (
                  <IconButton
                    style={{ color: "#FF7F50", fontSize: 12 }}
                    onClick={() => toggleExpand(path)}
                  >
                    {isExpanded ? <ExpandMoreIcon /> : <ChevronRightIcon />}
                  </IconButton>
                )}
              </Box>
            </Paper>

            {isExpanded && renderSettingsCards(value, path, depth + 1)}
          </React.Fragment>
        );
      }

      return null;
    });
  };
  const toggleSettings = () => {
    setIsSettingsExpanded((prev) => !prev);

    if (!isSettingsExpanded)
      setExpandedMap((prev) =>
        Object.fromEntries(Object.keys(prev).map((key) => [key, false])),
      );
  };

  const toggleExpand = (key) => {
    setExpandedMap((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  useEffect(() => {
    setJsonText(JSON.stringify(settings, null, 2));
  }, [settings]);

  const onEditSettings = (path, key, value) => {
    let data;

    if (path === "settings") {
      setIsSettingsEdit(true);

      data = settings;
      setFormData(data);
      setJsonText(JSON.stringify(data, null, 2));
    } else {
      setIsSettingsEdit(false);

      data = { [key]: value };
      setFormData(data);

      const jsonString = JSON.stringify(data, null, 2);
      const withoutBraces = jsonString.slice(1, -1).trim();

      setJsonText(withoutBraces);
    }

    setOpenSettingsDialog(true);
  };

  const onFormUpdate = (e) => {
    const text = e.target.value;
    setJsonText(text);

    try {
      const wrappedText = isSettingsEdit ? text : `{${text}}`;

      const parsed = JSON.parse(wrappedText);

      if (typeof parsed === "object" && parsed !== null) {
        setFormData(parsed);
      }
    } catch {
      // allow invalid JSON while typing
    }
  };

  const onSaveSettings = () => {
    try {
      const wrappedText = isSettingsEdit ? jsonText : `{${jsonText}}`;

      const parsed = JSON.parse(wrappedText);

      if (isSettingsEdit) {
        setSettings(parsed);
      } else {
        setSettings((prev) => ({
          ...prev,
          ...parsed,
        }));
      }

      setOpenSettingsDialog(false);
    } catch (error) {
      alert("Invalid JSON. Please fix before saving.");
    }
  };

  const onDeleteSetting = (keyToDelete) => {
    console.log(keyToDelete);
    setSettings((prev) => {
      // create a new object without the deleted key
      const { [keyToDelete]: _, ...rest } = prev;
      return rest;
    });

    // Close the dialog if you want
    setOpenSettingsDialog(false);
  };

  return (
    <div
      style={{
        backgroundColor: "#F2F2F2",
        width: "100%",
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Paper
        style={{
          width: "60%",
          height: "80%",
          margin: "80px",
          // padding: "30px",
        }}
      >
        <Box
          style={{
            display: "flex",
            // backgroundColor: "#F2F2F2",
            padding: "15px",
            borderBottom: "1px solid #C0C0C0",
          }}
        >
          <CodeIcon />
          <Typography style={{ fontWeight: "bold", marginLeft: "10px" }}>
            Advance Settings
          </Typography>
        </Box>
        <Box
          style={{
            height: "80%",
            display: "flex",
            justifyContent: "space-between",
            padding: "20px",
          }}
        >
          <div style={{ overflowY: "auto", width: "100%" }}>
            {/* Main Card */}
            <Paper
              style={{
                backgroundColor: "#F2F2F2",
                width: 250,
              }}
            >
              <Box
                style={{
                  width: "100%",
                  backgroundColor: "#FF7504",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  color: "#ffff",
                  borderTopLeftRadius: "5px",
                  borderTopRightRadius: "5px",
                }}
              >
                <Typography style={{ margin: "5px" }}>{"{}"}</Typography>

                <div>
                  <Button
                    variant="text"
                    style={{ color: "#ffff", fontSize: "12px" }}
                    onClick={() => onEditSettings("settings")}
                  >
                    Add
                  </Button>

                  <Button
                    variant="text"
                    style={{ color: "#ffff", fontSize: "12px" }}
                    onClick={() => onEditSettings("settings")}
                  >
                    Edit
                  </Button>

                  <Button
                    variant="text"
                    style={{ color: "#ffff", fontSize: "12px" }}
                  >
                    Delete
                  </Button>
                </div>
              </Box>
              <Box
                p={1}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <Typography>
                  {settings.caption ? settings.caption : "Advance Settings"}
                </Typography>
                <IconButton
                  style={{ color: "#FF7F50", fontSize: 12 }}
                  onClick={() => toggleSettings()}
                >
                  {isSettingsExpanded ? (
                    <ExpandMoreIcon />
                  ) : (
                    <ChevronRightIcon />
                  )}
                </IconButton>
              </Box>
            </Paper>
            {isSettingsExpanded && renderSettingsCards(settings)}
          </div>
        </Box>
        {openSettingsDialog && (
          <div>
            <SettingsModal
              title={formTitle}
              open={openSettingsDialog}
              formData={jsonText}
              handleOpen={handleOpenSettinsDialog}
              handleClose={handleCloseSettinsDialog}
              handleSave={onSaveSettings}
              handleUpdate={onFormUpdate}
            />
          </div>
        )}
      </Paper>
    </div>
  );
};

export default Settings;
