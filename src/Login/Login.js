import React, { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import Box from "@material-ui/core/Box";
import TextField from "@material-ui/core/TextField";
import Button from "@material-ui/core/Button";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import Checkbox from "@material-ui/core/Checkbox";
import Typography from "@material-ui/core/Typography";
import InputAdornment from "@material-ui/core/InputAdornment";
import IconButton from "@material-ui/core/IconButton";
import VisibilityIcon from "@material-ui/icons/Visibility";
import VisibilityOffIcon from "@material-ui/icons/VisibilityOff";
import { request, API_URLS } from "../api/Request";
import "./Login.css";

function getBasicAuthHeader(Username, Password) {
  const encoded = btoa(`${Username}:${Password}`);
  return `Basic ${encoded}`;
}

export default function Login() {
  const navigate = useNavigate();
  const isMountedRef = useRef(true);
  const [Username, setUsername] = useState("");
  const [Password, setPassword] = useState("");
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const safeSetState = (setter, value) => {
    if (isMountedRef.current) setter(value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    if (!agreeTerms) {
      setError("Please agree to the Terms of Service.");
      return;
    }
    safeSetState(setLoading, true);
    try {
      const existingToken = localStorage.getItem("authToken") || "";
      const { status, text } = await request(API_URLS.login, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-access-tokens": existingToken,
          Authorization: getBasicAuthHeader(Username.trim(), Password),
        },
        body: JSON.stringify({}),
      });

      let data = {};
      if (text && text.trim()) {
        try {
          data = JSON.parse(text) || {};
        } catch (_) {}
      }

      if (status < 200 || status >= 300) {
        const rawMsg =
          data?.message ||
          data?.error ||
          (typeof data === "string" ? data : null) ||
          "";
        const isOtherDevice =
          /other device|another device|already logged in|log off|logout/i.test(
            rawMsg
          ) ||
          status === 403;
        let msg;
        if (isOtherDevice) {
          msg = "Please log off from other device.";
        } else if (status === 401) {
          msg =
            "Invalid username or password. Please try again.";
        } else if (rawMsg) {
          msg = rawMsg;
        } else {
          msg = "Login failed. Please check your credentials and try again.";
        }
        safeSetState(setError, msg);
        return;
      }

      if (data?.token) {
        localStorage.setItem("authToken", data.token);
        if (data.user) {
          localStorage.setItem("user", JSON.stringify(data.user));
        }
        sessionStorage.setItem("logoutUsername", Username.trim());
        sessionStorage.setItem("logoutPassword", Password);
        // Redirect to Biz selection UI after login; from there user goes to Chatbox
        navigate("/select-biz", { replace: true });
      } else {
        safeSetState(setError, data?.message || "Login successful. Redirecting...");
      }
    } catch (err) {
      safeSetState(
        setError,
        err.message ||
          "Login failed. Please check your credentials and try again."
      );
    } finally {
      safeSetState(setLoading, false);
    }
  };

  const inputProps = {
    style: { fontFamily: "Poppins, sans-serif" },
  };
  const inputLabelProps = { style: { fontFamily: "Poppins, sans-serif" } };

  return (
    <Box className="login-root">
      <Box className="login-body">
        <Box className="login-content">
          <Box className="login-logo">
            <img src="/favicon.ico" alt="UlapBiz" className="login-logo-icon" />
            <Typography variant="h6" className="login-logo-text" component="span">
              <Typography component="span" className="login-logo-ulap">
                Ulap
              </Typography>
              <Typography component="span" className="login-logo-biz">
                .Biz
              </Typography>
            </Typography>
          </Box>

          <form className="login-form" onSubmit={handleSubmit}>
            <TextField
              fullWidth
              variant="outlined"
              placeholder="Username"
              value={Username}
              onChange={(e) => setUsername(e.target.value)}
              autoComplete="username"
              required
              inputProps={inputProps}
              InputLabelProps={inputLabelProps}
              className="login-field"
            />
            <TextField
              fullWidth
              variant="outlined"
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              value={Password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              required
              inputProps={inputProps}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      aria-label={showPassword ? "Hide password" : "Show password"}
                      onClick={() => setShowPassword(!showPassword)}
                      edge="end"
                      size="small"
                      className="login-password-toggle"
                    >
                      {showPassword ? (
                        <VisibilityOffIcon fontSize="small" />
                      ) : (
                        <VisibilityIcon fontSize="small" />
                      )}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
              InputLabelProps={inputLabelProps}
              className="login-field"
            />

            <FormControlLabel
              control={
                <Checkbox
                  checked={agreeTerms}
                  onChange={(e) => setAgreeTerms(e.target.checked)}
                  color="primary"
                  className="login-checkbox-input"
                />
              }
              label={
                <Typography variant="body2" component="span">
                  I agree with{" "}
                  <a href="/terms" target="_blank" rel="noopener noreferrer">
                    Terms of Service
                  </a>
                </Typography>
              }
              className="login-checkbox"
              classes={{ label: "login-checkbox-label" }}
            />

            {error && (
              <Typography variant="body2" className="login-error">
                {error}
              </Typography>
            )}

            <Button
              type="submit"
              fullWidth
              variant="contained"
              disabled={loading}
              className="login-submit"
            >
              {loading ? "Logging in..." : "LOG IN"}
            </Button>
          </form>

          <Box className="login-links" component="div">
            <Typography variant="body2" paragraph>
              Don&apos;t have an account yet? <Link to="/signup">Sign Up</Link>
            </Typography>
            <Typography variant="body2" paragraph>
              <Link to="/forgot-password">Forgot password?</Link>
            </Typography>
            <Typography variant="body2" paragraph>
              <Link to="/activate-phone">Activate Phone Number?</Link>
            </Typography>
          </Box>
        </Box>

        <Typography variant="caption" className="login-version">
          version 7.2602.112
        </Typography>
      </Box>
    </Box>
  );
}
