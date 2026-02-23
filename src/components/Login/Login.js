import React, { useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import VisibilityIcon from "@material-ui/icons/Visibility";
import VisibilityOffIcon from "@material-ui/icons/VisibilityOff";
import "./Login.css";

const LOGIN_API_URL =
  process.env.REACT_APP_ULAP_API_URL || "https://staging.ulap.biz/api/login";

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    if (!agreeTerms) {
      setError("Please agree to the Terms of Service.");
      return;
    }
    setLoading(true);
    try {
      const loginValue = username.trim();
      const payload = {
        username: loginValue,
        user_name: loginValue,
        email: loginValue,
        password: password,
      };

      const response = await axios.post(LOGIN_API_URL, payload, {
        withCredentials: true,
        headers: { "Content-Type": "application/json" },
      });
      if (response.data?.token) {
        localStorage.setItem("authToken", response.data.token);
        if (response.data.user) {
          localStorage.setItem("user", JSON.stringify(response.data.user));
        }
        window.location.href = "/";
      } else {
        setError(response.data?.message || "Login successful. Redirecting...");
      }
    } catch (err) {
      const status = err.response?.status;
      const data = err.response?.data;
      let msg =
        data?.message ||
        data?.error ||
        (typeof data === "string" ? data : null) ||
        err.message;

      if (status === 401) {
        msg = msg || "Invalid username or password. Please try again.";
      } else if (!msg) {
        msg = "Login failed. Please check your credentials and try again.";
      }
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-root">
      <div className="login-content">
        <div className="login-logo">
          <img
            src="/favicon.ico"
            alt="UlapBiz"
            className="login-logo-icon"
          />
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
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              autoComplete="username"
              required
            />
          </div>
          <div className="login-field login-field-password">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              value={password}
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
            Don&apos;t have an account yet?{" "}
            <Link to="/signup">Sign Up</Link>
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
  );
}
