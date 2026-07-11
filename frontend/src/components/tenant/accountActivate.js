import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import "../../styles/accountActivate.css";

function AccountActivate() {
    const { token } = useParams();
    const navigate = useNavigate();

    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [countdown, setCountdown] = useState(5);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (password.trim() === "" || confirmPassword.trim() === "") {
            setError("Both fields are required to activate account");
            return;
        }
        if (password !== confirmPassword) {
            setError("Passwords do not match");
            return;
        }

        const response = await fetch(
            "http://localhost:8000/auth/activate/",
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    token, password
                })
            }
        );

        const data = await response.json();
        if (response.ok) {
            setSuccess("Account Activated successfully!");
            setError("");
            let time = 5;
            setCountdown(time);

            const interval = setInterval(() => {
                time--;
                setCountdown(time);

                if (time === 0) {
                    clearInterval(interval);
                    navigate("/login");
                }
            }, 1000);
        }
        else {
            setError(data.detail);
        }
    };

    if (success) {
        return (
            <div className="account-activate-container">
                <div className="activation-success">
                    <h2>🎉 Account Activated!</h2>
                    <p>
                        Your account has been activated successfully.
                    </p>
                    <p>
                        Redirecting to login in {countdown} seconds...
                    </p>

                    <button
                        className="activate-button"
                        onClick={() => navigate("/login")}
                    >
                        Go to Login
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="account-activate-container">
            <form onSubmit={handleSubmit}>
                <h2>Activate Account</h2>
                <div className="input-fields">
                    <input
                        type="password"
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />

                    <input
                        type="password"
                        placeholder="Confirm Password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                    />
                </div>

                <div className="error-block">
                    {error}
                </div>

                <button type="submit" className="activate-button">Activate</button>
            </form>
        </div>
    )
}

export default AccountActivate;