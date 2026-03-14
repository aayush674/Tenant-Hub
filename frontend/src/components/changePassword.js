import { useState } from "react";
import { authFetch } from "../api/apiClient";
import "../styles/changePassword.css";


function ChangePassword({ show, onClose }) {
    const [oldpass, setoldpass] = useState("");
    const [newpass, setnewpass] = useState("");

    const handleChangePassword = async (oldpass, newpass) => {
        const res = await authFetch("http://localhost:8000/auth/change-password/", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                old_password: oldpass,
                new_password: newpass
            })
        });

        if (!res.ok) {
            alert("Incorrect current password");
            return;
        }
        alert("Password changes successfully");
    };
    if (!show) {
        return;
    }
    return (
        <div className="modal-overlay">
            <div className="modal-box">
                <input
                    type="password"
                    placeholder="Current Password"
                    value={oldpass}
                    onChange={
                        (e) => setoldpass(e.target.value)
                    } required />

                <input
                    type="password"
                    placeholder="New Password"
                    value={newpass}
                    onChange={
                        (e) => setnewpass(e.target.value)
                    } required />

                {/* <input type="password" placeholder="Confirm New Password" required /> */}
                <div className="modal-buttons">
                    <button type="submit" onClick={() => handleChangePassword(oldpass, newpass)} className="change-password-confirm-btn">Change Password</button>
                    <button type="submit" onClick={onClose} className="change-password-cancel-btn">Close</button>
                </div>
            </div>
        </div>

    )

}

export default ChangePassword;
