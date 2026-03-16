import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { authFetch } from "../api/apiClient";
import AddRoomModal from "./addRoomModal";
import "../styles/roomsList.css";
import { useNavigate } from "react-router-dom";
import EditRoomModal from "./editRoomModal";

function RoomsList() {
    const { pgId } = useParams()
    const [rooms, setRooms] = useState([]);
    const [showAddRoom, setShowAddRoom] = useState(false);
    const [pgData, setPgData] = useState(null);
    const [showEditModal, setShowEditModal] = useState(false);
    const [editRoomData, setEditRoomData] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const loadData = async () => {
            await Promise.all([fetchRooms(), fetchPg()]);
        };
        loadData();
    }, [pgId]);

    const fetchRooms = async () => {
        const res = await authFetch(`http://localhost:8000/api/rooms/?pg_property=${pgId}`);
        const data = await res.json();
        setRooms(data.results || data);
    }
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

    const openEditRoom=(room)=>{
        setEditRoomData(room);
        setShowEditModal(true);
    }

    const updateRoom=(updatedRoom)=>{
        setRooms(prev=>prev.map(room=>room.id===updatedRoom.id?updatedRoom:room));
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
                                setRooms(prev => [...prev, room]);
                                setShowAddRoom(false);
                            }
                        }
                        onClose={() => setShowAddRoom(false)}
                    />
                )}

                {showEditModal &&(
                    <EditRoomModal 
                    room={editRoomData} 
                    onUpdate={(updatedRoom)=>{
                        updateRoom(updatedRoom);
                        setShowEditModal(false);
                    }}
                    onClose={()=>setShowEditModal(false)}
                    />
                )}
                
            </div>
            <table>
                <thead>
                    <tr>
                        <th>Room</th>
                        <th>Capacity</th>
                        <th>Rent</th>
                        <th>Actions</th>
                    </tr>

                </thead>

                <tbody>
                    {rooms.map(room => (
                        <tr key={room.id}>
                            <td>{room.room_number}</td>
                            <td><span className={`occupancy-chip ${room.capacity === 1 ? "single" : "double"}`}>{room.capacity === 1 ? "👤Single" : "👥Double"}</span></td>
                            <td>{room.rent}</td>
                            <td>
                                <button type="button" onClick={() => handleDeleteRoom(room.id)}>Delete</button>
                                <button type="button" onClick={() => openEditRoom(room)}>Edit</button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    )
}

export default RoomsList;