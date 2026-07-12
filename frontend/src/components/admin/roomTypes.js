import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { authFetch } from "../../api/apiClient";
import { useParams } from "react-router-dom";
import "../../styles/roomTypes.css";
import AddRoomTypeModal from "./addRoomType";
import { FaPen, FaTrash } from "react-icons/fa";
import { API_BASE_URL } from "../../config";


function RoomTypes() {
    const [showAddRoomType, setShowAddRoomType] = useState(false);
    const [roomTypes, setRoomTypes] = useState([]);
    const [pgData, setPgData] = useState(null);
    const navigate = useNavigate();
    const { pgId } = useParams()
    // const [roomTypes, setRoomTypes] = useState({});

    const fetchPg = useCallback(async () => {
        const res = await authFetch(`${API_BASE_URL}/api/pgs/${pgId}`);
        if (!res.ok) {
            throw new Error("Failed to fetch room types");
        }
        const data = await res.json();
        setPgData(data);
    }, [pgId]);

    const fetchRoomTypes = useCallback(async () => {
        const res= await authFetch(`${API_BASE_URL}/api/room-types/?pg_property=${pgId}`);
        if(!res.ok){
            throw new Error("Failed to fetch room types");
        }
        const data=await res.json();
        setRoomTypes(data);
    }, [pgId]);

    useEffect(() => {
        fetchPg();
        fetchRoomTypes();
    }, [pgId, fetchPg, fetchRoomTypes]);

    return (
        <div className="room-type-container">
            <div className="room-type-nav-path">
                <span onClick={() => navigate("/")} className="room-type-navigator">Home</span>
                <span className="seperator"> / </span>
                <span onClick={() => navigate("/pg-list")} className="room-type-navigator">PG List</span>
                <span className="seperator"> / </span>
                {pgData && <span>{pgData.name}</span>}
                <span className="seperator"> / </span>
                <span>Room Templates</span>

            </div>
            <div className="room-type-header">
                <h1>{pgData && pgData.name} - Room Templates</h1>
                <button className="add-room-type-btn" onClick={() => setShowAddRoomType(true)}><b>+ Create Room Template</b></button>
                 {showAddRoomType && (
                    <AddRoomTypeModal
                        pgId={pgId}
                        onAdd={
                            () => {
                                setShowAddRoomType(false);
                                fetchRoomTypes();
                            }
                        }
                        onClose={() => setShowAddRoomType(false)}
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
            {/* <div className="filter-button">
            <button onClick={() => {
                setDraftFilters(filters);
                setShowFilterModal(true);
            }}>Filters</button>
            <RoomListFilterModal
                isOpen={showFilterModal}
                onClose={() => setShowFilterModal(false)}
                filters={draftFilters}
                setFilters={setDraftFilters}
                onApply={handleApplyFilters}
                onReset={handleResetFilters}
            />
            </div> */}

            <table>
                <thead>
                    <tr>
                        <th>Name</th>
                        <th>Capacity</th>
                        <th>Balcony Room</th>
                        <th>Rent</th>
                        <th>Actions</th>
                    </tr>

                </thead>

                <tbody>
                    {roomTypes.map(roomType => (
                        <tr key={roomType.id}>
                            <td><b>{roomType.name}</b></td>
                            <td><span className={`occupancy-chip ${roomType.capacity === 1 ? "single" : "double"}`}>{roomType.capacity === 1 ? "👤Single" : "👥Double"}</span></td>
                            <td>{roomType.is_balcony_room === true ? "Yes" : "No"}</td>
                            <td>{roomType.rent}</td>
                            <td>
                                <div className="action-column">
                                    
                                    <button className="delete-room-type-button"
                                            
                                        ><FaTrash /> Delete</button>

                                        <button className="edit-room-type-button"
                                            
                                        ><FaPen /> Edit</button>
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    )
}
export default RoomTypes;