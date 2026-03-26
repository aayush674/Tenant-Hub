import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { authFetch } from "../api/apiClient";
import { useParams } from "react-router-dom";
import "../styles/roomTypes.css";
import AddRoomTypeModal from "./addRoomType";

function RoomTypes() {
    const [showAddRoomType, setShowAddRoomType] = useState(false);
    const [roomTypes, setRoomTypes] = useState([]);
    const [pgData, setPgData] = useState(null);
    const navigate = useNavigate();
    const { pgId } = useParams()
    // const [roomTypes, setRoomTypes] = useState({});

    useEffect(() => {
        fetchPg();
        fetchRoomTypes();
    }, [pgId]);

    const fetchPg = async () => {
        const res = await authFetch(`http://localhost:8000/api/pgs/${pgId}`);
        if (!res.ok) {
            throw new Error("Failed to fetch room types");
        }
        const data = await res.json();
        setPgData(data);
    }

    const fetchRoomTypes = async () => {
        const res= await authFetch(`http://localhost:8000/api/room-types/?pg_property=${pgId}`);
        if(!res.ok){
            throw new Error("Failed to fetch room types");
        }
        const data=await res.json();
        setRoomTypes(data);
    }

    return (
        <div className="room-type-container">
            <div className="room-type-nav-path">
                <span onClick={() => navigate("/")} className="room-type-navigator">Home</span>
                <span className="seperator"> / </span>
                <span onClick={() => navigate("/pg-list")} className="room-type-navigator">PG List</span>
                <span className="seperator"> / </span>
                {pgData && <span>{pgData.name}</span>}
                <span className="seperator"> / </span>
                <span>Room Types</span>

            </div>
            <div className="room-type-header">
                <h1>{pgData && pgData.name} - Room Types</h1>
                <button className="add-room-type-btn" onClick={() => setShowAddRoomType(true)}><b>+ Add Room Type</b></button>
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
                            <td>{roomType.name}</td>
                            <td><span className={`occupancy-chip ${roomType.capacity === 1 ? "single" : "double"}`}>{roomType.capacity === 1 ? "👤Single" : "👥Double"}</span></td>
                            <td>{roomType.is_balcony_room === true ? "Yes" : "No"}</td>
                            <td>{roomType.rent}</td>
                            <td>
                                <div className="action-column">
                                    <button
                                        type="button"
                                    // onClick={() => handleDeleteRoom(room.id)}
                                    >Delete</button>
                                    <button
                                        type="button"
                                    // onClick={() => openEditRoom(room)}
                                    >Edit</button>
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