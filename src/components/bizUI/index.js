import React, { useState, useEffect, useCallback } from "react";
import { useNavigate, Navigate } from "react-router-dom";
import Box from "@material-ui/core/Box";
import Typography from "@material-ui/core/Typography";
import Grid from "@material-ui/core/Grid";
import Button from "@material-ui/core/Button";
import InputBase from "@material-ui/core/InputBase";
import CircularProgress from "@material-ui/core/CircularProgress";
import AccessTimeIcon from "@material-ui/icons/Restore";
import RefreshIcon from "@material-ui/icons/Cached";
import SearchIcon from "@material-ui/icons/Search";
import { businessService } from "../../Chatbox/api";
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

function getBizAddress(biz) {
  const addr1 =
    (biz && biz.Address1) ||
    (biz && biz.address1) ||
    (biz && biz.business && biz.business.Address1) ||
    (biz && biz.business && biz.business.address1) ||
    (biz && biz.data && biz.data.Address1) ||
    (biz && biz.data && biz.data.address1) ||
    "";
  const addr2 =
    (biz && biz.Address2) ||
    (biz && biz.address2) ||
    (biz && biz.business && biz.business.Address2) ||
    (biz && biz.business && biz.business.address2) ||
    (biz && biz.data && biz.data.Address2) ||
    (biz && biz.data && biz.data.address2) ||
    "";
  const str1 = typeof addr1 === "string" ? addr1.trim() : "";
  const str2 = typeof addr2 === "string" ? addr2.trim() : "";
  if (str1 || str2) return [str1, str2].filter(Boolean).join(" ");
  const raw =
    (biz && biz.address) ||
    (biz && biz.sAddress) ||
    (biz && biz.location) ||
    (biz && biz.business && biz.business.address) ||
    (biz && biz.business && biz.business.location) ||
    (biz && biz.data && biz.data.address) ||
    "";
  return typeof raw === "string" ? raw.trim() : "";
}

function parseBizList(payload) {
  const raw =
    typeof payload === "string"
      ? payload
      : payload != null && typeof payload === "object"
        ? JSON.stringify(payload)
        : "";
  if (!raw || !raw.trim()) return [];
  try {
    const parsed = typeof payload === "object" ? payload : JSON.parse(raw);
    if (Array.isArray(parsed)) return parsed;
    if (parsed?.businesses && Array.isArray(parsed.businesses))
      return parsed.businesses;
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

function BizListContent({ bizList, selectingId, onSelectBiz, onContinue, onRefresh, searchQuery, onSearchChange }) {
  const isSelecting = selectingId != null;
  const filteredList = !searchQuery.trim()
    ? bizList
    : bizList.filter((biz) => {
        const name = getBizDisplayName(biz).toLowerCase();
        const addr = (getBizAddress(biz) || "").toLowerCase();
        const q = searchQuery.toLowerCase();
        return name.includes(q) || addr.includes(q);
      });
  const recentCount = 1;
  const recentList = filteredList.slice(0, recentCount);
  const restList = filteredList.slice(recentCount);

  return (
    <React.Fragment>
      <Box className="biz-ui-top-row">
        <div />
        <Box className="biz-ui-actions">
          <Button
            variant="contained"
            disableElevation
            endIcon={<RefreshIcon />}
            onClick={onRefresh}
            disabled={isSelecting}
            className="biz-ui-refresh-btn"
          >
            REFRESH
          </Button>
          <Box className="biz-ui-search-wrap">
            <SearchIcon className="biz-ui-search-icon" />
            <InputBase
              placeholder="Search"
              inputProps={{ "aria-label": "search" }}
              className="biz-ui-search-input"
              value={searchQuery}
              onChange={(e) => (onSearchChange && onSearchChange(e.target.value))}
            />
          </Box>
        </Box>
      </Box>
      <Box className="biz-ui-recent-section">
        <Box className="biz-ui-recently-header">
          <AccessTimeIcon className="biz-ui-recently-icon" />
          <Typography variant="h6" className="biz-ui-recently-title">
            Recently opened
          </Typography>
        </Box>
        {recentList.length > 0 && (
          <Box className="biz-ui-recent-cards">
            {recentList.map(function (biz) {
              const id = getBizCode(biz) ?? Math.random();
              return (
                <Box key={id} className="biz-ui-recent-card-wrap">
                  <BizCard biz={biz} onSelect={onSelectBiz} disabled={isSelecting} />
                </Box>
              );
            })}
          </Box>
        )}
      </Box>
      <div className="biz-ui-divider" />
      <div className="biz-ui-list-wrap">
        <Grid container spacing={3} className="biz-ui-grid" style={{ justifyContent: "flex-start" }}>
          {restList.map(function (biz) {
            const id = getBizCode(biz) ?? Math.random();
            return (
              <Grid item xs={12} sm={6} md={6} key={id} className="biz-ui-grid-item">
                <BizCard biz={biz} onSelect={onSelectBiz} disabled={isSelecting} />
              </Grid>
            );
          })}
        </Grid>
      </div>
    </React.Fragment>
  );
}

export default function BizUI() {
  const navigate = useNavigate();
  const [bizList, setBizList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectingId, setSelectingId] = useState(null);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const token = localStorage.getItem("authToken");

  const loadBizList = useCallback(function () {
    if (!token) return;
    setLoading(true);
    setError(null);
    businessService
      .selectBiz(token)
      .then((res) => parseBizList(res.data != null ? res.data : res.text))
      .then(setBizList)
      .catch(() => setError("Failed to load businesses"))
      .finally(() => setLoading(false));
  }, [token]);

  useEffect(
    function () {
      loadBizList();
    },
    [loadBizList]
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
          const toStore = parsedData.biz
            ? { ...parsedData }
            : { biz: parsedData };
          const bizObj = toStore.biz || toStore;
          const dataToken =
            parsedData.token ??
            parsedData.dataAccessToken ??
            parsedData.accessToken ??
            parsedData.access_token ??
            parsedData.bizToken ??
            parsedData.data?.token ??
            parsedData.biz?.token ??
            (typeof bizObj === "object"
              ? (bizObj.token ?? bizObj.dataAccessToken)
              : null);
          if (dataToken && typeof bizObj === "object") bizObj.token = dataToken;
          if (dataToken) toStore.token = dataToken;
          localStorage.setItem("selectedBiz", JSON.stringify(toStore));
        } else {
          const name = getBizDisplayName(biz);
          const logo =
            biz?.image ??
            biz?.logo ??
            biz?.logoUrl ??
            biz?.business?.logo ??
            null;
          localStorage.setItem(
            "selectedBiz",
            JSON.stringify({ biz: { name, ixBiz: code, image: logo } }),
          );
        }
        navigate("/select-chatbot", { replace: true });
      })
      .catch(() => setError("Failed to select business"))
      .finally(() => setSelectingId(null));
  };

  const handleContinue = function () {
    return navigate("/select-chatbot", { replace: true });
  };

  if (!token) return <Navigate to="/login" replace />;

  const rootStyle = {
    minHeight: "100vh",
    display: "flex",
    flexDirection: "column",
  };
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
        onRefresh={loadBizList}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />
    );
  }

  return (
    <div style={rootStyle}>
      <LoginToolbar />
      <Box className="biz-ui-root" flex={1} style={{ overflow: "auto", paddingTop: 64 }}>
        <div className="biz-ui-content-wrap">
          {content}
        </div>
      </Box>
    </div>
  );
}
