import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { authFetch } from "../../api/apiClient";
import "../../styles/accountActivate.css";

function AccountActivate() {
    const { token } = useParams();
    const navigate = useNavigate();

    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [error, setError] = useState("");

    const handleSubmit = async (e) => {
        e.preventDefault();
        if(password.trim()==="" || confirmPassword.trim()===""){
            setError("Both fields are required to activate account");
            return;
        }
        if (password !== confirmPassword) {
            setError("Passwords do not match");
            return;
        }

        const response = await authFetch(
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
            navigate("/login");
        }
        else {
            setError(data.detail);
        }
    };

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

                <button type="submit">Activate</button>
            </form>
        </div>
    )
}

export default AccountActivate;