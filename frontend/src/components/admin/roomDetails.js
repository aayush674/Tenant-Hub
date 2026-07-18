import { useState, useCallback, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { authFetch } from "../../api/apiClient";
import { API_BASE_URL } from "../../config";

function RoomDetails() {
    const navigate = useNavigate();
    const { pgId, roomId } = useParams();
    const [pgData, setPgData] = useState({});
    const [roomData, setRoomData] = useState({});

    const fetchPg = useCallback(async () => {
        const res = await authFetch(`${API_BASE_URL}/api/pgs/${pgId}/`);
        if (!res.ok) {
            throw new Error("Failed to fetch PG");
        }
        const data = await res.json();
        setPgData(data);
        // setFormData(data);
    }, [pgId]);

    const fetchCurrentRoom = useCallback(async () => {
        const res = await authFetch(`${API_BASE_URL}/api/rooms/${roomId}`);
        if (!res.ok) {
            throw new Error("Failed to fetch Room");
        }
        const data = await res.json();
        setRoomData(data);
        // setFormData(data);
    }, [pgId]);

    useEffect(()=>{
        fetchPg();
        fetchCurrentRoom();
    },[fetchCurrentRoom, fetchPg])

    return (
        <div className="room-details-container">
            <div className="room-list-nav-path">
                <span onClick={() => navigate("/")} className="navigator">Home</span>
                <span className="seperator"> / </span>
                <span onClick={() => navigate("/pg-list")} className="navigator">PG List</span>
                <span className="seperator"> / </span>
                {pgData && <span>{pgData.name}</span>}
                <span className="seperator"> / </span>
                <span onClick={() => navigate("/rooms")} className="navigator">Rooms</span>
                <span className="seperator"> / </span>
                {roomData && <span>{roomData.room_number}</span>}

            </div>
        </div>
    )
}

export default RoomDetails;