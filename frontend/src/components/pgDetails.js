import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { authFetch } from "../api/apiClient";
import "../styles/pgDetails.css";

function PGDetails(){
    const navigate=useNavigate();
    const {pgId}=useParams();
    const [pgData, setPgData] = useState();

    const fetchPg = async () => {
            const res = await authFetch(`http://localhost:8000/api/pgs/${pgId}`);
            if (!res.ok) {
                throw new Error("Failed to fetch PG");
            }
            const data = await res.json();
            setPgData(data);
        }

    useEffect(() => {
            fetchPg();
        }, [pgId]);
    
    return(
        <div className="pg-details-container">
            <div className="details-nav-path">
                <span onClick={() => navigate("/")} className="navigator">Home</span>
                <span className="seperator"> / </span>
                <span onClick={() => navigate("/pg-list")} className="navigator">PG List</span>
                <span className="seperator"> / </span>
                {pgData && <span>{pgData.name}</span>}
                <span className="seperator"> / </span>
                <span>Details</span>

            </div>
            <div className="pg-details-header">
                <h1>{pgData && pgData.name} - Details</h1>
            </div>
            <h1>PG Details</h1>
        </div>
    )
}

export default PGDetails;