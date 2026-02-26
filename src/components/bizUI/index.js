import React, { useState, useEffect } from "react";
import { useNavigate, Navigate } from "react-router-dom";
import Box from "@material-ui/core/Box";
import Typography from "@material-ui/core/Typography";
import Grid from "@material-ui/core/Grid";
import Button from "@material-ui/core/Button";
import CircularProgress from "@material-ui/core/CircularProgress";
import { request, API_URLS } from "../../api/Request";
import LoginToolbar from "../../Login/LoginToolbar";
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

function parseBizList(text) {
  if (!text || !text.trim()) return [];
  try {
    const parsed = JSON.parse(text);
    if (Array.isArray(parsed)) return parsed;
    if (parsed && parsed.businesses && Array.isArray(parsed.businesses)) return parsed.businesses;
    if (parsed && parsed.data && Array.isArray(parsed.data)) return parsed.data;
    if (parsed != null && typeof parsed === "object") return [parsed];
  } catch (_) {}
  return [];
}

function BizListContent({ bizList, selectingId, onSelectBiz, onContinue }) {
  const isSelecting = selectingId != null;
  return (
    <React.Fragment>
      <Grid container spacing={3} style={{ maxWidth: 900, justifyContent: "center" }}>
        {bizList.map(function (biz) {
          const id =
            (biz && biz.ixBiz) ||
            (biz && biz.id) ||
            (biz && biz.businessId) ||
            (biz && biz.business && biz.business.id) ||
            (biz && biz.data && biz.data.id);
          return (
            <Grid item xs={12} sm={6} md={4} key={id != null ? id : Math.random()} className="biz-ui-grid-item">
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
      request(API_URLS.selectBiz, {
        method: "GET",
        headers: { "Content-Type": "application/json", "x-access-tokens": token },
      })
        .then(function (_ref) {
          var text = _ref.text;
          return parseBizList(text);
        })
        .then(setBizList)
        .catch(function () {
          return setError("Failed to load businesses");
        })
        .finally(function () {
          return setLoading(false);
        });
    },
    [token]
  );

  const handleSelectBiz = function (biz) {
    if (!token) return;
    const code =
      (biz && biz.ixBiz) ||
      (biz && biz.biz_uuid) ||
      (biz && biz.id) ||
      (biz && biz.businessId) ||
      (biz && biz.business && biz.business.id) ||
      (biz && biz.business && biz.business.ixBiz) ||
      (biz && biz.data && biz.data.id) ||
      (biz && biz.data && biz.data.ixBiz) ||
      null;
    if (code == null) return;

    setSelectingId(code);
    request(API_URLS.setBiz + "/" + encodeURIComponent(code), {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-access-tokens": token },
      body: JSON.stringify({ code: code }),
    })
      .then(function (response) {
        const responseText = response.text;
        if (responseText && responseText.trim()) {
          try {
            const parsedData = JSON.parse(responseText);
            if (parsedData != null && typeof parsedData === "object") {
              const toStore = parsedData.biz ? { ...parsedData } : { biz: parsedData };
              const biz = toStore.biz || toStore;
              // Token from set-biz response - used for stockcard, products, graph
              const token =
                parsedData.token ??
                parsedData.dataAccessToken ??
                parsedData.accessToken ??
                parsedData.access_token ??
                parsedData.bizToken ??
                parsedData.data?.token ??
                parsedData.biz?.token ??
                (typeof biz === "object" ? biz.token ?? biz.dataAccessToken : null);
              if (token && typeof biz === "object") {
                biz.token = token;
              }
              if (token) {
                toStore.token = token;
              }
              localStorage.setItem("selectedBiz", JSON.stringify(toStore));
            }
          } catch (_) {}
        } else {
          const name =
            (biz && biz.name) ||
            (biz && biz.sBiz) ||
            (biz && biz.businessName) ||
            (biz && biz.business && biz.business.name) ||
            "";
          const logo =
            (biz && biz.image) ||
            (biz && biz.logo) ||
            (biz && biz.logoUrl) ||
            (biz && biz.business && biz.business.logo) ||
            null;
          localStorage.setItem(
            "selectedBiz",
            JSON.stringify({ biz: { name: name, ixBiz: code, image: logo } })
          );
        }
        navigate("/Chatbox", { replace: true });
      })
      .catch(function () {
        return setError("Failed to select business");
      })
      .finally(function () {
        return setSelectingId(null);
      });
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
      <Box className="biz-ui-root" flex={1}>
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
