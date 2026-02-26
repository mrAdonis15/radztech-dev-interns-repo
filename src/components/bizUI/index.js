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

function parseBizList(text) {
  if (!text || !text.trim()) return [];
  try {
    const parsed = JSON.parse(text);
    if (Array.isArray(parsed)) return parsed;
    if (parsed?.businesses && Array.isArray(parsed.businesses)) return parsed.businesses;
    if (parsed?.data && Array.isArray(parsed.data)) return parsed.data;
    if (parsed != null && typeof parsed === "object") return [parsed];
  } catch (_) {}
  return [];
}

export default function BizUI() {
  const navigate = useNavigate();
  const [bizList, setBizList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectingId, setSelectingId] = useState(null);
  const [error, setError] = useState(null);

  const token = localStorage.getItem("authToken");

  useEffect(() => {
    if (!token) return;
    setLoading(true);
    setError(null);
    request(API_URLS.selectBiz, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "x-access-tokens": token,
      },
    })
      .then(({ text }) => parseBizList(text))
      .then(setBizList)
      .catch(() => setError("Failed to load businesses"))
      .finally(() => setLoading(false));
  }, [token]);

  const handleSelectBiz = (biz) => {
    if (!token) return;
    // Code is always from the selected biz (API/list); never hardcoded — it changes daily
    const code =
      biz?.ixBiz ??
      biz?.biz_uuid ??
      biz?.id ??
      biz?.businessId ??
      biz?.business?.id ??
      biz?.business?.ixBiz ??
      biz?.data?.id ??
      biz?.data?.ixBiz ??
      null;
    if (code == null) return;

    setSelectingId(code);
    const url = `${API_URLS.setBiz}/${encodeURIComponent(code)}`;
    request(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-access-tokens": token,
      },
      body: JSON.stringify({ code }),
    })
      .then(({ text }) => {
        if (text && text.trim()) {
          try {
            const data = JSON.parse(text);
            if (data != null && typeof data === "object") {
              const toStore = data.biz ? data : { biz: data };
              localStorage.setItem("selectedBiz", JSON.stringify(toStore));
            }
          } catch (_) {}
        } else {
          const name =
            biz?.name ?? biz?.sBiz ?? biz?.businessName ?? biz?.business?.name ?? "";
          const logo =
            biz?.image ?? biz?.logo ?? biz?.logoUrl ?? biz?.business?.logo ?? null;
          localStorage.setItem(
            "selectedBiz",
            JSON.stringify({ biz: { name, ixBiz: code, image: logo } })
          );
        }
        navigate("/Chatbox", { replace: true });
      })
      .catch(() => setError("Failed to select business"))
      .finally(() => setSelectingId(null));
  };

  const handleContinue = () => {
    navigate("/Chatbox", { replace: true });
  };

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <LoginToolbar />
      <Box className="biz-ui-root" flex={1}>
        <Typography variant="h4" gutterBottom color="textPrimary">
          Select a business
        </Typography>
        <Typography variant="body1" color="textSecondary" style={{ marginBottom: 24 }}>
          Choose a business to continue
        </Typography>

        {loading ? (
          <Box py={4}>
            <CircularProgress />
          </Box>
        ) : error ? (
          <Box py={2}>
            <Typography color="error">{error}</Typography>
          </Box>
        ) : bizList.length === 0 ? (
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
        ) : (
          <>
            <Grid container spacing={3} justify="center" style={{ maxWidth: 900 }}>
              {bizList.map((biz) => {
                const id =
                  biz?.ixBiz ??
                  biz?.id ??
                  biz?.businessId ??
                  biz?.business?.id ??
                  biz?.data?.id;
                return (
                  <Grid
                    item
                    xs={12}
                    sm={6}
                    md={4}
                    key={id ?? Math.random()}
                    className="biz-ui-grid-item"
                  >
                    <BizCard
                      biz={biz}
                      onSelect={handleSelectBiz}
                      disabled={selectingId !== null}
                    />
                  </Grid>
                );
              })}
            </Grid>
            {bizList.length > 0 && (
              <Button
                variant="outlined"
                color="primary"
                onClick={handleContinue}
                className="biz-ui-continue-btn"
                disabled={selectingId !== null}
              >
                Continue with current selection
              </Button>
            )}
          </>
        )}
      </Box>
    </div>
  );
}
