import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { authFetch } from "../api/apiClient";
import AddRoomModal from "./addRoomModal";
import "../styles/roomsList.css";
import { useNavigate } from "react-router-dom";
import EditRoomModal from "./editRoomModal";
import RoomListFilterModal from "./roomListFilterModal";
import { useSearchParams } from "react-router-dom";
import ConfirmModal from "./confirmationModal";
import { FaPen, FaTrash } from "react-icons/fa";
import FilterIcon from "../assets/filter-svgrepo.svg"
// import { Tooltip } from 'react-tooltip';


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
    const [draftFilters, setDraftFilters] = useState({ occupancyType: "", minPrice: "", maxPrice: "" });
    const [searchParams, setSearchParams] = useSearchParams();
    const [showDeleteConfirmModal, setShowDeleteConfirmModal] = useState(false);
    const [roomToDelete, setRoomToDelete] = useState(null);
    const [floorCounts, setFloorCounts] = useState({});
    const [tenantData, setTenants] = useState([]);

    useEffect(() => {
        const min = searchParams.get("min_price") || "";
        const max = searchParams.get("max_price") || "";
        const occupancy = searchParams.get("capacity") || "";
        const room_floor = searchParams.get("room_floor") || "";

        const initialFilters = {
            minPrice: min,
            maxPrice: max,
            occupancyType: occupancy ? Number(occupancy) : "",
        }

        setDraftFilters(initialFilters);
        setFilters(initialFilters);
    }, [searchParams]);

    useEffect(() => {
        fetchRooms();
    }, [pgId, searchParams]);

    useEffect(()=>{
        fetchPg();
        fetchTenants();
    }, [pgId]);
    
    const fetchRooms = async () => {
        const min = searchParams.get("min_price") || "";
        const max = searchParams.get("max_price") || "";
        const occupancy = searchParams.get("capacity") || "";
        const room_floor = searchParams.get("room_floor") || "";

        const params = new URLSearchParams();

        if (min) params.append("min_price", min);
        if (max) params.append("max_price", max);
        if (occupancy) params.append("capacity", occupancy);
        if (room_floor) params.append("room_floor", room_floor)

        const res = await authFetch(
            `http://localhost:8000/api/rooms/?pg_property=${pgId}&${params.toString()}`
        );

        const data = await res.json();
        setRooms(data.results || data);
    };

    const fetchTenants = async () => {
        const res= await authFetch(`http://localhost:8000/api/tenants/?pg_property=${pgId}`)
        const data = await res.json();
        setTenants(data.results || data);
    }

    const fetchPg = async () => {
        const res = await authFetch(`http://localhost:8000/api/pgs/${pgId}`);
        if (!res.ok) {
            throw new Error("Failed to fetch PG");
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
                setShowDeleteConfirmModal(false);
                setRoomToDelete(null);
                fetchFloorCounts();
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
        if (draftFilters.occupancyType) {
            params.capacity = draftFilters.occupancyType;
        }
        setSearchParams(params);
        fetchFloorCounts();
    }

    const handleResetFilters = () => {
        setDraftFilters({});
        handleApplyFilters();
    }

    const getFloorLabel = (floor) => {
        if (floor == 0) return "Unspecified";
        if (floor == 1) return "1st Floor";
        if (floor == 2) return "2nd Floor";
        if (floor == 3) return "3rd Floor";
        return `${floor}th Floor`;
    };

    const selectedFloor = searchParams.get("room_floor");

    useEffect(() => {
        fetchFloorCounts();
    }, [pgId]);

    const fetchFloorCounts = async () => {
        const res = await authFetch(
            `http://localhost:8000/api/rooms/?pg_property=${pgId}`
        );

        const data = await res.json();
        const allRooms = data.results || data;

        const counts = allRooms.reduce((acc, room) => {
            acc[room.room_floor] = (acc[room.room_floor] || 0) + 1;
            return acc;
        }, {});

        setFloorCounts(counts);
    };

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
                                fetchFloorCounts();
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
            <div>
                <button className="filter-button"
                onClick={() => {
                    setDraftFilters(filters);
                    setShowFilterModal(true);
                }}>
                    <img src={FilterIcon} alt="Filter" className="filter-icon" />
                    Filters</button>
                <RoomListFilterModal
                    isOpen={showFilterModal}
                    onClose={() => setShowFilterModal(false)}
                    filters={draftFilters}
                    setFilters={setDraftFilters}
                    onApply={handleApplyFilters}
                    onReset={handleResetFilters}
                />
            </div>

            <div className="floor-navigation-box">
                <button
                    className={!selectedFloor ? "active-floor" : ""}
                    onClick={() => {
                        const params = Object.fromEntries(searchParams);
                        delete params.room_floor;
                        setSearchParams(params);
                    }}>All ({pgData?.room_count})</button>
                {Array.from({ length: pgData?.total_floors + 1 }, (_, i) => i).map((floor) => (
                    <button key={floor}
                        className={selectedFloor == floor ? "active-floor" : ""}
                        onClick={() => {
                            setSearchParams({
                                ...Object.fromEntries(searchParams),
                                room_floor: floor
                            });
                        }}>
                        {getFloorLabel(floor)} ({floorCounts[floor] || 0})
                    </button>
                ))}
            </div>


            <table>
                <thead>
                    <tr>
                        <th>Room</th>
                        <th>Floor</th>
                        <th>Capacity</th>
                        <th>Balcony Room</th>
                        <th>Rent (&#8377;)</th>
                        <th>Actions</th>
                    </tr>

                </thead>

                <tbody>

                    {rooms.length === 0 ? (<tr>
                        <td colSpan="6" className="no-rooms-message">
                            No Rooms Available
                        </td>
                    </tr>) : (
                        rooms.map(room => (
                            <tr key={room.id}>
                                <td><b>{room.room_number}</b></td>
                                <td>{room.room_floor != 0 ? room.room_floor : "Unspecified"}</td>
                                <td><span className={`occupancy-chip ${room.capacity === 1 ? "single" : "double"}`}>{room.capacity === 1 ? "👤Single" : "👥Double"}</span></td>
                                <td>{room.is_balcony_room === true ? "Yes" : "No"}</td>
                                <td>&#8377; {room.rent}</td>
                                <td>
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
                                </td>
                            </tr>
                        )))}
                </tbody>
            </table>
        </div>
    )
}

export default RoomsList;