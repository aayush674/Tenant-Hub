import { useNavigate } from "react-router-dom";
import "../styles/header.css";
import logo from "../assets/Tenant-Hub-Logo.png";

function Header() {
    const navigate = useNavigate();

    return (
        <header className="header">
            <div className= "header-left">
                <img src={logo} alt="Tenant Hub Logo" className="header-logo" onClick={()=> navigate("/")}/>
            </div>
             <nav className="header-nav">
        <button onClick={() => navigate("/")}>Home</button>
        <button onClick={() => navigate("/pg-list")}>PG List</button>
      </nav>
        </header>
    );
}

export default Header;