import { login } from "../../api/auth.js";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../../styles/login.css";
import complogo from "../../assets/Tenant-Hub-Logo.png";

function Login() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const [error, setError] = useState(null);
    const [showError, setShowError] = useState(false);

    function triggerError(message) {
        setShowError(false);
        setTimeout(() => {
            setError(message);
            setShowError(true);
        }, 100);
    }

    async function handleSubmit(e) {
        e.preventDefault();

        if (!email.trim() || !password.trim()) {
            triggerError("Please enter email and password");
            setLoading(false);
            return;
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            triggerError("Please enter a valid email address");
            setLoading(false);
            return;
        }

        setLoading(true);
        try {
            const data = await login(email, password);
            if (data.access && data.refresh) {
                // alert("Login successful!");
                localStorage.setItem("access_token", data.access);
                // console.log("Access Token Stored:", data.access);
                localStorage.setItem("refresh_token", data.refresh);
                // console.log("Refresh Token Stored:", data.refresh);                
                navigate("/");
            }
            else {
                triggerError("Invalid credentials");
            }
        }
        catch (error) {
            triggerError("Login failed. Please try again.");
        }
        setLoading(false);
    }

    // Check if user is already logged in, and navigates logged in users to the home page directly
    useEffect(() => {
        // Check if tokens exist in localStorage
        const access_token = localStorage.getItem("access_token");
        const refresh_token = localStorage.getItem("refresh_token");

        if (access_token && refresh_token) {
            navigate("/");
        }
    }, [navigate]);

    return (
        <div className="login-container">
            <div className="login-left">
                <img src={complogo} alt="Tenant Hub" className="logo" />
                <h1 className="brand-tagline">Manage Tenants. Simplify Living.</h1>

            </div>
            <div className="login-right">
                <form className="login-card" onSubmit={handleSubmit} noValidate>

                    <h2 className="login-title">Already a Member? Please proceed.</h2>
                    <div className={`login-error-container ${showError ? "show" : ""}`}>{error || ""}</div>
                    <input
                        type="email"
                        placeholder="Email"
                        className="login-input"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                    />

                    <input
                        type="password"
                        placeholder="Password"
                        className="login-input"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />

                    <button type="submit" className="login-button" disabled={loading}>
                        {loading ? "Logging in..." : "Login"}
                    </button>

                </form>
            </div>
        </div>
    );
}

export default Login;