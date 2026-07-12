import ViewPG from "./viewPG";
import ConfirmModal from "../common/confirmationModal";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../../styles/pgList.css";
import { authFetch } from "../../api/apiClient";
import AddPG from "./addPG";
import { FaEye, FaTrash } from "react-icons/fa";
import { API_BASE_URL } from "../../config";

function PGList() {
    const navigate = useNavigate();
    const [viewPG, setViewPG] = useState(null);
    const [showViewModal, setShowViewModal] = useState(false);
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [pgToDelete, setPgToDelete] = useState(null);
    const [pgs, setPgs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showSuccessMessage, setShowSuccessMessage] = useState(false);
    const [showAddPG, setShowAddPG] = useState(false);
    const [showActionDropdownId, setShowActionDropdownId] = useState(null);

    useEffect(() => {
        authFetch(`${API_BASE_URL}/api/pgs/`)
            .then((res) => res.json())
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

    useEffect(() => {
        const handleClickOutside = () => {
            setShowActionDropdownId(null);
        };

        document.addEventListener("click", handleClickOutside);

        return () => {
            document.removeEventListener("click", handleClickOutside);
        };
    }, []);

    const deletePG = () => {
        authFetch(`${API_BASE_URL}/api/pgs/${pgToDelete}/`, {
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
        <div className={`pg-list-container ${showActionDropdownId ? "dropdown-open" : ""
            }`}>
            <div className="nav-path">
                <span onClick={() => navigate("/")} className="navigator">Home</span>
                <span className="seperator"> / </span>
                <span>PG List</span>

            </div>
            {showSuccessMessage && (
                <div className="success-message">PG added successfully!</div>
            )}

            <button onClick={() => setShowAddPG(true)} className="create-pg-btn">
                <strong>+ Create PG</strong>
            </button>

            <AddPG
                show={showAddPG}
                onClose={() => setShowAddPG(false)}
                onAdd={(newPG) => {
                    setPgs((prev) => [...prev, newPG]);
                    setShowAddPG(false);
                    setShowSuccessMessage(true);
                    // navigate("/pg-list", { state: { pgAdded: true } });
                }} />

            <h1>PG List</h1>
            <table>
                <thead>
                    <tr>
                        <th>Name</th>
                        <th>Total Floors</th>
                        <th>Total Rooms</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {loading ? (
                        <tr><td colSpan="3">Loading PGs...</td></tr>
                    ) : pgs.length === 0 ? (
                        <tr><td colSpan="3">No PGs found. Please add some PGs.</td></tr>
                    ) : (

                        pgs.map((pg) => (
                            <tr key={pg.id} className="pg-row" onClick={()=> navigate(`/pg/${pg.id}`)}>

                                <td className="pg-name"><b>{pg.name}</b></td>
                                <td className="pg-floors-count">{pg.total_floors}</td>
                                <td className="pg-rooms-count">{pg.room_count ?? 0}</td>
                                <td className="pg-row-actions">
                                    <button className="view-pg-button"
                                        onClick={() => {setViewPG(pg);
                                            setShowViewModal(true);}}
                                    ><FaEye /> View</button>

                                    <button className= "delete-pg-button"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setPgToDelete(pg.id);
                                            setShowConfirmModal(true);
                                        }}
                                    ><FaTrash /> Delete</button>

                                    {/* <div className="pg-row-more-menu" onClick={(e) => e.stopPropagation()}>
                                        <FaEllipsisV title="More" onClick={(e) => {
                                            e.stopPropagation();
                                            setShowActionDropdownId(prev => (prev === pg.id ? null : pg.id));
                                        }
                                        } className={showActionDropdownId === pg.id ? "menu-icon-active" : "menu-icon"} />
                                        {showActionDropdownId === pg.id && (
                                            <div className="dropdown-actions">
                                                <button onClick={() => navigate(`/pg/${pg.id}/rooms`)}>
                                                    🏠 View Rooms
                                                </button>

                                                <button onClick={() => navigate(`/pg/${pg.id}/roomtypes`)}>
                                                    View Room Types
                                                </button>
                                                <button onClick={() => navigate(`/pg/${pg.id}/tenants`)}>
                                                    View Tenants
                                                </button>


                                            </div>
                                        )}
                                    </div> */}
                                </td>
                            </tr>
                        ))

                    )}
                </tbody>


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
            </table>
        </div>
    )
}

export default PGList;