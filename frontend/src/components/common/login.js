import { login } from "../../api/auth.js";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../../styles/login.css";
import complogo from "../../assets/Tenant-Hub-Logo.png";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showError, setShowError] = useState(false);

  const navigate = useNavigate();

  function triggerError(message) {
    setError(message);
    setShowError(false);

    setTimeout(() => {
      setShowError(true);
    }, 50);
  }

  async function handleSubmit(e) {
    e.preventDefault();

    setShowError(false);

    if (!email.trim() || !password.trim()) {
      triggerError("Please enter your email and password.");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(email.trim())) {
      triggerError("Please enter a valid email address.");
      return;
    }

    setLoading(true);

    try {
      const data = await login(email.trim(), password);

      if (data?.access && data?.refresh) {
        localStorage.setItem("access_token", data.access);
        localStorage.setItem("refresh_token", data.refresh);

        if (data.user?.role === "TENANT") {
          navigate("/t");
        } else {
          navigate("/");
        }
      } else {
        triggerError("Invalid email or password.");
      }
    } catch (error) {
      triggerError(
        error?.response?.data?.detail ||
          "Login failed. Please check your credentials.",
      );
    } finally {
      setLoading(false);
    }
  }

  // Redirect users who are already logged in.
  useEffect(() => {
    const accessToken = localStorage.getItem("access_token");
    const refreshToken = localStorage.getItem("refresh_token");

    if (accessToken && refreshToken) {
      // Keep existing behavior for now.
      // If role information is stored separately later,
      // this can be made fully role-aware here.
      navigate("/");
    }
  }, [navigate]);

  return (
    <div className="login-container">
      {/* LEFT BRAND PANEL */}
      <section className="login-brand-panel">
        <div className="brand-content">
          <div className="brand-logo-wrapper">
            <img src={complogo} alt="Tenant Hub" className="login-logo" />
          </div>

          <div className="brand-text">
            <span className="brand-eyebrow">PROPERTY MANAGEMENT</span>

            <h1>
              Manage Properties.
              <br />
              <span>Simplify Living.</span>
            </h1>

            <p>
              One centralized platform to manage your properties, rooms,
              tenants, payments and maintenance.
            </p>
          </div>

          <div className="brand-footer">
            <span className="brand-line"></span>
            <span>Tenant Hub</span>
          </div>
        </div>
      </section>

      {/* RIGHT LOGIN PANEL */}
      <section className="login-form-panel">
        <div className="login-card">
          <div className="login-header">
            <span className="login-eyebrow">ACCOUNT ACCESS</span>

            <h2>Welcome back</h2>

            <p>Sign in to continue to your dashboard.</p>
          </div>

          <form className="login-form" onSubmit={handleSubmit} noValidate>
            {/* ERROR */}
            <div
              className={`login-error-container ${showError ? "show" : ""}`}
              role="alert"
            >
              {error}
            </div>

            {/* EMAIL */}
            <div className="login-field">
              <label htmlFor="login-email">Email address</label>

              <div className="input-wrapper">
                <span className="input-icon">@</span>

                <input
                  id="login-email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);

                    if (showError) {
                      setShowError(false);
                    }
                  }}
                  autoComplete="email"
                  disabled={loading}
                />
              </div>
            </div>

            {/* PASSWORD */}
            <div className="login-field">
              <div className="password-label-row">
                <label htmlFor="login-password">Password</label>
              </div>

              <div className="input-wrapper">
                <span className="input-icon">•••</span>

                <input
                  id="login-password"
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);

                    if (showError) {
                      setShowError(false);
                    }
                  }}
                  autoComplete="current-password"
                  disabled={loading}
                />
              </div>
            </div>

            {/* LOGIN BUTTON */}
            <button
              type="submit"
              className={`login-button ${loading ? "loading" : ""}`}
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="login-spinner"></span>
                  Signing in...
                </>
              ) : (
                <>
                  Sign in
                  <span className="button-arrow">→</span>
                </>
              )}
            </button>
          </form>

          <div className="login-footer">
            <span>Secure access to Tenant Hub</span>
          </div>
        </div>
      </section>
    </div>
  );
}

export default Login;
