import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { authFetch } from "../../api/apiClient";
import AddDueModal from "./addDue";

function Dues() {
    const navigate = useNavigate();
    const [pgData, setPgData] = useState(null);
    const { pgId } = useParams();
    const [dues, setDues] = useState([]);

    const [showAddDue, setShowAddDue] = useState(false);

    const fetchPg = async () => {
        const res = await authFetch(`http://localhost:8000/api/pgs/${pgId}`);
        if (!res.ok) {
            throw new Error("Failed to fetch PG");
        }
        const data = await res.json();
        setPgData(data);
    }

    const fetchDues = async () => {
        const res = await authFetch(`http://localhost:8000/api/dues/?pg_property=${pgId}`)
        const data = await res.json();
        setDues(data.results || data);
    }

    useEffect(() => {
        fetchPg();
        fetchDues();
    }, [pgId]);

    return (
        <div className="dues-container">
            <div className="dues-nav-path">
                <span onClick={() => navigate("/")} className="dues-navigator">Home</span>
                <span className="seperator"> / </span>
                <span onClick={() => navigate("/pg-list")} className="dues-navigator">PG List</span>
                <span className="seperator"> / </span>
                {pgData && <span>{pgData.name}</span>}
                <span className="seperator"> / </span>
                <span>Dues</span>

            </div>
            <div className="room-list-header">
                <h1>{pgData && pgData.name} - Dues</h1>
                <button
                    className="add-room-btn"
                    onClick={() => setShowAddDue(true)}
                ><b>+ Add Due</b></button>
                {showAddDue && (
                    <AddDueModal
                        pgId={pgId}
                        onAdd={
                            (due) => {
                                setShowAddDue(false);
                                fetchDues();
                                // fetchFloorCounts();
                            }
                        }
                        onClose={() => setShowAddDue(false)}
                    />
                )}

                {/* {showEditModal && (
                    <EditRoomModal
                        room={editRoomData}
                        onUpdate={(updatedRoom) => {
                            updateRoom(updatedRoom);
                            setShowEditModal(false);
                        }}
                        onClose={() => setShowEditModal(false)}
                    />
                )} */}

            </div>
            <div className="due-list-table">

                <table>
                    <thead>
                        <tr>
                            <th>Due ID</th>
                            <th>Tenant</th>
                            <th>Due Amount (&#8377;)</th>
                            <th>Due Date</th>
                            <th>Due Type</th>
                            {/* <th>Rent (&#8377;)</th> */}
                            {/* <th>Actions</th> */}
                        </tr>

                    </thead>

                    <tbody>

                        {dues.length === 0 ? (<tr>
                            <td colSpan="5" className="no-rooms-message">
                                No Dues applied
                            </td>
                        </tr>) : (
                            dues.map(due => (
                                <tr key={due.id}>
                                    <td><b>{due.id}</b></td>
                                    <td>-</td>
                                    <td>&#8377; {due.due_amount}</td>
                                    <td>
                                        {due.due_date}
                                    </td>
                                    <td>{due.due_type === "rent"?"Rent":""}</td>
                                    {/* <td>
                                        <div className="action-column">
                                            <button className="delete-room-button"
                                                onClick={() => {
                                                    setShowDeleteConfirmModal(true)
                                                    setRoomToDelete(room.id)
                                                }}
                                            ><FaTrash /> Delete</button>

                                            <button className="edit-room-button"
                                                onClick={() => openEditRoom(room)}
                                            ><FaPen /> Edit</button>
                                        </div>
                                        <ConfirmModal
                                            show={showDeleteConfirmModal}
                                            title="Delete Room"
                                            message="Are you sure you want to delete this room? The action once done can not be reverted."
                                            onConfirm={() => handleDeleteRoom(roomToDelete)}
                                            onCancel={() => setShowDeleteConfirmModal(false)}
                                        />
                                    </td> */}
                                </tr>
                            )))}
                    </tbody>
                </table>

            </div>
        </div>
    )
}

export default Dues;