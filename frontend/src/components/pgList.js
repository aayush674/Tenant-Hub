import ViewPG from "./viewPG";
import ConfirmModal from "./confirmationModal";
import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "../styles/pgList.css";

function PGList() {
    const navigate = useNavigate();
    const location = useLocation();
    console.log("Location state:", location.state);
    const [viewPG, setViewPG] = useState(null);
    const [showViewModal, setShowViewModal] = useState(false);
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [pgToDelete, setPgToDelete] = useState(null);
    const [pgs, setPgs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showSuccessMessage, setShowSuccessMessage] = useState(location.state?.pgAdded || false);

    useEffect(() => {
        fetch("http://localhost:8000/api/pgs/")
            .then((response) => {
                if (!response.ok) {
                    throw new Error("Failed to fetch PGs");
                }
                return response.json();
            })
            .then((data) => {
                setPgs(data);
                setLoading(false);
            })
            .catch((error) => {
                console.error("Error fetching PGs:", error);
            });
    }, []);

    useEffect(() => {
        if (showSuccessMessage) {
            const timer = setTimeout(() => {
                setShowSuccessMessage(false);
            }, 3000);
            return () => clearTimeout(timer);
        }
        }, [showSuccessMessage]);

        const deletePG = () => {
        fetch(`http://localhost:8000/api/pgs/${pgToDelete}/`, {
            method: "DELETE",
        })
            .then(() => {

                setPgs(pgs.filter((pg) => pg.id !== pgToDelete));
                setShowConfirmModal(false);
                setPgToDelete(null);
            })
            .catch((error) => console.error("Error deleting PG:", error));
    };

    return (
        <div>
            {showSuccessMessage && (
                <div className="success-message">PG added successfully!</div>
                )}
            
            <h1>PG List</h1>
            <div>
                {loading ? (
                    <p>Loading PGs...</p>
                ) : pgs.length === 0 ? (
                    <p>No PGs found. Please add some PGs.</p>
                ) : (
                <ul>
                    {pgs.map((pg) => (
                        <li key={pg.id} className="pg-row">

                            <div className="pg-name"><strong>Name:</strong> {pg.name} </div>

                            <div className="pg-row-actions">
                                <button
                                    onClick={() => {
                                        setViewPG(pg);
                                        setShowViewModal(true);
                                    }} className="view-pg-button">View</button>

                                <button
                                    onClick={() => {
                                        setPgToDelete(pg.id);
                                        setShowConfirmModal(true);
                                    }} className="delete-pg-button" >Delete</button>
                            </div>
                        </li>
                    ))}
                </ul>
                )}

                <ConfirmModal
                    show={showConfirmModal}
                    title="Delete PG"
                    message="Are you sure you want to delete this PG?"
                    onConfirm={deletePG}
                    onCancel={() => setShowConfirmModal(false)}
                />

                <ViewPG
                    show={showViewModal}
                    pg={viewPG}
                    onClose={() => {
                        setShowViewModal(false);
                        setViewPG(null);
                    }}
                />
            </div>
        </div>
    )
}

export default PGList;