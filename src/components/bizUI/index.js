import React, { useState, useEffect } from "react";
import { useNavigate, Navigate } from "react-router-dom";
import Box from "@material-ui/core/Box";
import Typography from "@material-ui/core/Typography";
import Grid from "@material-ui/core/Grid";
import Button from "@material-ui/core/Button";
import CircularProgress from "@material-ui/core/CircularProgress";
import { businessService } from "../../Chatbox/api";
import LoginToolbar from "../../Chatbox/Login/LoginToolbar";
import BizCard from "./BizCard";
import "./BizUI.css";

function getBizDisplayName(biz) {
  const raw =
    (biz && biz.name) ||
    (biz && biz.sBiz) ||
    (biz && biz.businessName) ||
    (biz && biz.business && biz.business.name) ||
    "";
  return typeof raw === "string" ? raw.trim() : "";
}

function parseBizList(payload) {
  const raw = typeof payload === "string" ? payload : payload != null && typeof payload === "object" ? JSON.stringify(payload) : "";
  if (!raw || !raw.trim()) return [];
  try {
    const parsed = typeof payload === "object" ? payload : JSON.parse(raw);
    if (Array.isArray(parsed)) return parsed;
    if (parsed?.businesses && Array.isArray(parsed.businesses)) return parsed.businesses;
    if (parsed?.data && Array.isArray(parsed.data)) return parsed.data;
    if (parsed != null && typeof parsed === "object") return [parsed];
  } catch (_) {}
  return [];
}

function getBizCode(biz) {
  return (
    biz?.ixBiz ??
    biz?.biz_uuid ??
    biz?.id ??
    biz?.businessId ??
    biz?.business?.id ??
    biz?.business?.ixBiz ??
    biz?.data?.id ??
    biz?.data?.ixBiz ??
    null
  );
}

function BizListContent({ bizList, selectingId, onSelectBiz, onContinue }) {
  const isSelecting = selectingId != null;
  return (
    <React.Fragment>
      <Grid container spacing={3} style={{ maxWidth: 900, justifyContent: "center" }}>
        {bizList.map(function (biz) {
          const id = getBizCode(biz) ?? Math.random();
          return (
            <Grid item xs={12} sm={6} md={4} key={id} className="biz-ui-grid-item">
              <BizCard biz={biz} onSelect={onSelectBiz} disabled={isSelecting} />
            </Grid>
          );
        })}
      </Grid>
      <Button
        variant="outlined"
        color="primary"
        onClick={onContinue}
        className="biz-ui-continue-btn"
        disabled={isSelecting}
      >
        Continue with current selection
      </Button>
    </React.Fragment>
  );
}

export default function BizUI() {
  const navigate = useNavigate();
  const [bizList, setBizList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectingId, setSelectingId] = useState(null);
  const [error, setError] = useState(null);
  const token = localStorage.getItem("authToken");

  useEffect(
    function () {
      if (!token) return;
      setLoading(true);
      setError(null);
      businessService
        .selectBiz(token)
        .then((res) => parseBizList(res.data != null ? res.data : res.text))
        .then(setBizList)
        .catch(() => setError("Failed to load businesses"))
        .finally(() => setLoading(false));
    },
    [token]
  );

  const handleSelectBiz = function (biz) {
    const code = getBizCode(biz);
    if (!token || code == null) return;
    setSelectingId(code);
    businessService
      .setBiz(token, code)
      .then(function (response) {
        let parsedData = response.data;
        if (parsedData == null && response.text?.trim()) {
          try {
            parsedData = JSON.parse(response.text);
          } catch (_) {
            parsedData = null;
          }
        }
        if (parsedData != null && typeof parsedData === "object") {
          const toStore = parsedData.biz ? { ...parsedData } : { biz: parsedData };
          const bizObj = toStore.biz || toStore;
          const dataToken =
            parsedData.token ??
            parsedData.dataAccessToken ??
            parsedData.accessToken ??
            parsedData.access_token ??
            parsedData.bizToken ??
            parsedData.data?.token ??
            parsedData.biz?.token ??
            (typeof bizObj === "object" ? bizObj.token ?? bizObj.dataAccessToken : null);
          if (dataToken && typeof bizObj === "object") bizObj.token = dataToken;
          if (dataToken) toStore.token = dataToken;
          localStorage.setItem("selectedBiz", JSON.stringify(toStore));
        } else {
          const name = getBizDisplayName(biz);
          const logo = biz?.image ?? biz?.logo ?? biz?.logoUrl ?? biz?.business?.logo ?? null;
          localStorage.setItem("selectedBiz", JSON.stringify({ biz: { name, ixBiz: code, image: logo } }));
        }
        navigate("/Chatbox", { replace: true });
      })
      .catch(() => setError("Failed to select business"))
      .finally(() => setSelectingId(null));
  };

  const handleContinue = function () {
    return navigate("/Chatbox", { replace: true });
  };

  if (!token) return <Navigate to="/login" replace />;

  const rootStyle = { minHeight: "100vh", display: "flex", flexDirection: "column" };
  let content;
  if (loading) {
    content = (
      <Box py={4}>
        <CircularProgress />
      </Box>
    );
  } else if (error) {
    content = (
      <Box py={2}>
        <Typography color="error">{error}</Typography>
      </Box>
    );
  } else if (bizList.length === 0) {
    content = (
      <Box py={2} textAlign="center">
        <Typography color="textSecondary">No businesses found.</Typography>
        <Button
          variant="contained"
          color="primary"
          onClick={handleContinue}
          className="biz-ui-continue-btn"
          style={{ marginTop: 16 }}
        >
          Continue anyway
        </Button>
      </Box>
    );
  } else {
    content = (
      <BizListContent
        bizList={bizList}
        selectingId={selectingId}
        onSelectBiz={handleSelectBiz}
        onContinue={handleContinue}
      />
    );
  }

  return (
    <div style={rootStyle}>
      <LoginToolbar />
      <Box className="biz-ui-root" flex={1} style={{ overflow: "auto", paddingTop: 80 }}>
        <Typography variant="h4" gutterBottom color="textPrimary">
          Select a business
        </Typography>
        <Typography variant="body1" color="textSecondary" style={{ marginBottom: 24 }}>
          Choose a business to continue
        </Typography>
        {content}
      </Box>
    </div>
  );
}
