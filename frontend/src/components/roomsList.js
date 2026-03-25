import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { authFetch } from "../api/apiClient";
import AddRoomModal from "./addRoomModal";
import "../styles/roomsList.css";
import { useNavigate } from "react-router-dom";
import EditRoomModal from "./editRoomModal";
import RoomListFilterModal from "./roomListFilterModal";
import { useSearchParams } from "react-router-dom";


function RoomsList() {
    const { pgId } = useParams()
    const [rooms, setRooms] = useState([]);
    const [showAddRoom, setShowAddRoom] = useState(false);
    const [pgData, setPgData] = useState(null);
    const [showEditModal, setShowEditModal] = useState(false);
    const [editRoomData, setEditRoomData] = useState(null);
    const [showFilterModal, setShowFilterModal] = useState(false);
    const navigate = useNavigate();
    const [filters, setFilters] = useState({ occupancyType: "", minPrice: "", maxPrice: "" });
    const [draftFilters, setDraftFilters] = useState({ occupancyType:"", minPrice: "", maxPrice: "" });
    const [searchParams, setSearchParams] = useSearchParams();

    useEffect(() => {
        const min = searchParams.get("min_price") || "";
        const max = searchParams.get("max_price") || "";
        const occupancy=searchParams.get("capacity") || "";

        const initialFilters = {
            minPrice: min,
            maxPrice: max,
            occupancyType: occupancy ? Number(occupancy):""
        }

        setDraftFilters(initialFilters);
        setFilters(initialFilters);
    }, [searchParams]);

    useEffect(() => {
        fetchRooms();
        fetchPg();
    }, [pgId, searchParams]);

    const fetchRooms = async () => {
    const min = searchParams.get("min_price") || "";
    const max = searchParams.get("max_price") || "";
    const occupancy=searchParams.get("capacity") || "";

    const params = new URLSearchParams();

    if (min) params.append("min_price", min);
    if (max) params.append("max_price", max);
    if(occupancy) params.append("capacity", occupancy);

    const res = await authFetch(
        `http://localhost:8000/api/rooms/?pg_property=${pgId}&${params.toString()}`
    );

    const data = await res.json();
    setRooms(data.results || data);
};


    const fetchPg = async () => {
        const res = await authFetch(`http://localhost:8000/api/pgs/${pgId}`);
        if (!res.ok) {
            throw new Error("Failed to fetch rooms");
        }
        const data = await res.json();
        setPgData(data);
    }
    const handleDeleteRoom = (deleteRoom) => {
        authFetch(`http://localhost:8000/api/rooms/${deleteRoom}/`, {
            method: "DELETE",
        })
            .then(() => {
                setRooms(prev => prev.filter(room => room.id !== deleteRoom));
            })
            .catch((error) => console.error("Error deleting Room:", error));
    };

    const openEditRoom = (room) => {
        setEditRoomData(room);
        setShowEditModal(true);
    }

    const updateRoom = (updatedRoom) => {
        setRooms(prev => prev.map(room => room.id === updatedRoom.id ? updatedRoom : room));
    }

    const handleApplyFilters = () => {
        
        setFilters(draftFilters);
        setShowFilterModal(false);
        const params = {};

        if (draftFilters.minPrice) {
            params.min_price = draftFilters.minPrice;
        }

        if (draftFilters.maxPrice) {
            params.max_price = draftFilters.maxPrice;
        }
        if(draftFilters.occupancyType){
            params.capacity=draftFilters.occupancyType;
        }

        setSearchParams(params);
    }

    const handleResetFilters = () => {
        setDraftFilters({});
        handleApplyFilters();
    }

    return (
        <div className="room-list-container">
            <div className="room-list-nav-path">
                <span onClick={() => navigate("/")} className="room-list-navigator">Home</span>
                <span className="seperator"> / </span>
                <span onClick={() => navigate("/pg-list")} className="room-list-navigator">PG List</span>
                <span className="seperator"> / </span>
                {pgData && <span>{pgData.name}</span>}
                <span className="seperator"> / </span>
                <span>Rooms</span>

            </div>
            <div className="room-list-header">
                <h1>{pgData && pgData.name} - Rooms</h1>
                <button className="add-room-btn" onClick={() => setShowAddRoom(true)}><b>+ Add Room</b></button>
                {showAddRoom && (
                    <AddRoomModal
                        pgId={pgId}
                        onAdd={
                            (room) => {
                                setShowAddRoom(false);
                                fetchRooms();
                            }
                        }
                        onClose={() => setShowAddRoom(false)}
                    />
                )}

                {showEditModal && (
                    <EditRoomModal
                        room={editRoomData}
                        onUpdate={(updatedRoom) => {
                            updateRoom(updatedRoom);
                            setShowEditModal(false);
                        }}
                        onClose={() => setShowEditModal(false)}
                    />
                )}

            </div>
            <div className="filter-button">
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
            </div>

            <table>
                <thead>
                    <tr>
                        <th>Room</th>
                        <th>Capacity</th>
                        <th>Balcony Room</th>
                        <th>Rent</th>
                        <th>Actions</th>
                    </tr>

                </thead>

                <tbody>
                    {rooms.map(room => (
                        <tr key={room.id}>
                            <td>{room.room_number}</td>
                            <td><span className={`occupancy-chip ${room.capacity === 1 ? "single" : "double"}`}>{room.capacity === 1 ? "👤Single" : "👥Double"}</span></td>
                            <td>{room.is_balcony_room === true ? "Yes" : "No"}</td>
                            <td>{room.rent}</td>
                            <td>
                                <div className="action-column">
                                    <button type="button" onClick={() => handleDeleteRoom(room.id)}>Delete</button>
                                    <button type="button" onClick={() => openEditRoom(room)}>Edit</button>
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    )
}

export default RoomsList;