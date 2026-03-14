import { useNavigate } from "react-router-dom";
import "../styles/header.css";
import logo from "../assets/Tenant-Hub-Logo.png";
import { useState, useEffect, useRef } from "react";
import ChangePassword from "./changePassword";
import profileIcon from "../assets/profile-Icon.png";

function Header() {
    const navigate = useNavigate();
    const [cpModal, setCpModal] = useState(false);
    const [openActions, setOpenActions] = useState(false);
    const profileRef=useRef(null);

    const handleLogout = () => {
        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");
        navigate("/login");
    }

    useEffect(() => {
    function handleClickOutside(event) {
        if (profileRef.current && !profileRef.current.contains(event.target)) {
            setOpenActions(false);
        }
    }

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
        document.removeEventListener("mousedown", handleClickOutside);
    };
}, []);


    return (
        <header className="header">
            <div className="header-left">
                <img src={logo} alt="Tenant Hub Logo" className="header-logo" onClick={() => navigate("/")} />
            </div>
            <nav className="header-nav">
                <div className="nav-links">
                    <button onClick={() => navigate("/")}>Home</button>
                    <button onClick={() => navigate("/pg-list")}>PG List</button>
                </div>
                <div className="profile-container" ref={profileRef}>
                <button className="profile-icon" onClick={() => setOpenActions(prev=>!prev)}>
                <img src={profileIcon} alt="profile"></img>
                </button>
                {openActions && (
                    <div className="profile-actions">
                        <button onClick={handleLogout} className="logout-button">Logout</button>
                        <button onClick={() => {setCpModal(true); setOpenActions(false)}} className="change-password-button">Change Password</button>
                    </div>
                )}
                </div>

                <ChangePassword show={cpModal} onClose={()=>setCpModal(false)}/>
            </nav>
        </header>
    );
}

export default Header;