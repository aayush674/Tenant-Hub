import { useNavigate, NavLink } from "react-router-dom";
import "../../styles/header.css";
import logo from "../../assets/Tenant-Hub-Logo.png";
import { useState, useEffect, useRef } from "react";
import ChangePassword from "../common/changePassword";
import profileIcon from "../../assets/profile-Icon.png";
import { FiLogOut, FiLock, FiChevronDown } from "react-icons/fi";

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
          <img
            src={logo}
            alt="Tenant Hub Logo"
            className="header-logo"
            onClick={() => navigate("/")}
          />
        </div>
        <nav className="header-nav">
          <div className="nav-links">
            <NavLink to="/">Home</NavLink>
            <NavLink to="/pg-list">PG List</NavLink>
          </div>
          <div className="profile-container" ref={profileRef}>
            <button
              className="profile-icon"
              onClick={() => setOpenActions((prev) => !prev)}
            >
              <img src={profileIcon} alt="" />
              <span className="profile-name">Aayush</span>
              <FiChevronDown className={openActions ? "arrow open" : "arrow"} />
            </button>
            {openActions && (
              <div className="profile-actions">
                <button
                  onClick={() => {
                    setCpModal(true);
                    setOpenActions(false);
                  }}
                  className="change-password-button"
                >
                  <FiLock />
                  Change Password
                </button>
                <button onClick={handleLogout} className="logout-button">
                  <FiLogOut />
                  Logout
                </button>
              </div>
            )}
          </div>

          <ChangePassword show={cpModal} onClose={() => setCpModal(false)} />
        </nav>
      </header>
    );
}

export default Header;
