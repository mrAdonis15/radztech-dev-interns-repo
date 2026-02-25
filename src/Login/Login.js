import React, { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import VisibilityIcon from "@material-ui/icons/Visibility";
import VisibilityOffIcon from "@material-ui/icons/VisibilityOff";
import "./Login.css";

const LOGIN_API_URL = "https://staging.ulap.biz/api/login";

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
      const response = await fetch(LOGIN_API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-access-tokens": existingToken,
          Authorization: getBasicAuthHeader(Username.trim(), Password),
        },
        body: JSON.stringify({}),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        const rawMsg =
          data?.message ||
          data?.error ||
          (typeof data === "string" ? data : null) ||
          "";
        const isOtherDevice =
          /other device|another device|already logged in|log off|logout/i.test(
            rawMsg
          ) ||
          response.status === 403;
        let msg;
        if (isOtherDevice) {
          msg = "Please log off from other device.";
        } else if (response.status === 401) {
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
        navigate("/Chatbox", { replace: true });
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

  return (
    <div className="login-root">
      <div className="login-body">
      <div className="login-content">
        <div className="login-logo">
          <img src="/favicon.ico" alt="UlapBiz" className="login-logo-icon" />
          <span className="login-logo-text">
            <span className="login-logo-ulap">Ulap</span>
            <span className="login-logo-biz">.Biz</span>
          </span>
        </div>

        <form className="login-form" onSubmit={handleSubmit}>
          <div className="login-field">
            <input
              type="text"
              placeholder="Username"
              value={Username}
              onChange={(e) => setUsername(e.target.value)}
              autoComplete="username"
              required
            />
          </div>
          <div className="login-field login-field-password">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              value={Password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              required
            />
            <button
              type="button"
              className="login-password-toggle"
              onClick={() => setShowPassword(!showPassword)}
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? (
                <VisibilityOffIcon fontSize="small" />
              ) : (
                <VisibilityIcon fontSize="small" />
              )}
            </button>
          </div>

          <div className="login-checkbox">
            <input
              type="checkbox"
              id="terms"
              checked={agreeTerms}
              onChange={(e) => setAgreeTerms(e.target.checked)}
            />
            <label htmlFor="terms">
              I agree with{" "}
              <a href="/terms" target="_blank" rel="noopener noreferrer">
                Terms of Service
              </a>
            </label>
          </div>

          {error && <div className="login-error">{error}</div>}

          <button
            type="submit"
            className="login-submit"
            disabled={loading}
          >
            {loading ? "Logging in..." : "LOG IN"}
          </button>
        </form>

        <div className="login-links">
          <p>
            Don&apos;t have an account yet? <Link to="/signup">Sign Up</Link>
          </p>
          <p>
            <Link to="/forgot-password">Forgot password?</Link>
          </p>
          <p>
            <Link to="/activate-phone">Activate Phone Number?</Link>
          </p>
        </div>
      </div>

      <div className="login-version">version 7.2602.112</div>
      </div>
    </div>
  );
}
