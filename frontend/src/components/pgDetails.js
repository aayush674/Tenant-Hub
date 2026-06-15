import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { authFetch } from "../api/apiClient";
import "../styles/pgDetails.css";

function PGDetails() {
    const navigate = useNavigate();
    const { pgId } = useParams();
    const [pgData, setPgData] = useState();
    // const [pgName, setPgName] = useState(pgData?pgData.name:"");
    const [formData, setFormData] = useState();
    const [error, setError] = useState();
    const [editMode, setEditMode] = useState(false);

    const fetchPg = async () => {
        const res = await authFetch(`http://localhost:8000/api/pgs/${pgId}/`);
        if (!res.ok) {
            throw new Error("Failed to fetch PG");
        }
        const data = await res.json();
        setPgData(data);
        setFormData(data);
    }
    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const res = await authFetch(`http://localhost:8000/api/pgs/${pgId}/`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    name: formData.name,
                    address: formData.address,
                    total_floors: formData.total_floors,
                })
            });

            if (!res.ok) {
                const errData = await res.json();
                console.log(errData);
                return;
            }
            const data = await res.json();
            setPgData(formData);
        }
        catch (err) {
            setError({ detail: "Something went wrong. Please try again." });
        }
    }
    useEffect(() => {
        fetchPg();
    }, [pgId]);

    return (
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
            {!editMode && <div className="edit-button">
                <button onClick={()=> setEditMode(true)}>Edit</button>
            </div>}
            <div className={`pg-details-form ${editMode ? 'enabled' : 'disabled'}`}>
                <form onSubmit={handleSubmit}>
                    <div>PG Name</div>
                    <input
                        className={`pg-details-input ${editMode ? 'enabled' : 'disabled'}`}
                        disabled={!editMode}
                        placeholder="Enter PG Name"
                        value={formData && formData.name}
                        onChange={e => {
                            setFormData({
                                ...formData,
                                name: e.target.value
                            })
                            // if (error?.roomNumber) {
                            //     const newError = { ...error };
                            //     delete newError.roomNumber;
                            //     setError(newError);
                            // }
                        }}
                    />
                    {/* <div className="error-container">
                        {error?.roomNumber}
                    </div> */}

                    <div>Address</div>
                    <input
                        className={`pg-details-input ${editMode ? 'enabled' : 'disabled'}`}
                        disabled={!editMode}
                        placeholder="Enter PG Address"
                        value={formData && formData.address}
                        onChange={e => {
                            setFormData({
                                ...formData,
                                address: e.target.value
                            })
                        }}
                    />

                    <div>Total floors</div>
                    <input
                        className={`pg-details-input ${editMode ? 'enabled' : 'disabled'}`}
                        disabled={!editMode}
                        placeholder="Enter Total floors in PG"
                        value={formData && formData.total_floors}
                        onChange={e => {
                            setFormData({
                                ...formData,
                                total_floors: e.target.value
                            })
                        }}
                    />

                    <div>Total Rooms</div>
                    <input disabled
                        value={formData && formData.room_count}
                    />

                    {editMode && <div className="edit-mode-buttons">
                    <button type="submit">Submit</button>
                    <button type="button" onClick={()=> setEditMode(false)}>Cancel</button>
                    </div>}
                </form>
            </div>
        </div>
    )
}

export default PGDetails;