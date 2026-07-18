import { useState, useCallback, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { authFetch } from "../../api/apiClient";
import { API_BASE_URL } from "../../config";
import { FaPen } from "react-icons/fa";
import { validateRoomCapacity, validateRoomRent } from "../../utils/roomValidation";
import { toast } from "react-toastify";
import LoadingSubmitButton from "../common/loadingSubmitButton";

function RoomDetails() {
    const navigate = useNavigate();
    const { pgId, roomId } = useParams();
    const [pgData, setPgData] = useState({});
    const [roomData, setRoomData] = useState({});
    const [formData, setFormData] = useState({});
    const [editMode, setEditMode] = useState(false);
    const [error, setError] = useState({});
    const [loading, setLoading] = useState(false);

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
        setFormData(data);
    }, [pgId]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        const rcError = validateRoomCapacity(formData.capacity);
        const rrError = validateRoomRent(formData.rent);
        const finalError = {}

        if (rcError) {
            finalError.roomCapacity = rcError;
        }
        if (rrError) {
            finalError.roomRent = rrError;
        }
        if (Object.keys(finalError).length > 0) {
            setError(finalError);
            return;
        }
        setError({});
        try {
            setLoading(true);
            const res = await authFetch(`${API_BASE_URL}/api/rooms/${roomId}/`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(formData)
            });

            if (!res.ok) {
                const errData = await res.json();
                setError(errData);
                console.log(errData);
                return;
            }
            setEditMode(false);
            toast.success("Room updated successfully.");
        } catch (err) {
            setError({ detail: "Something went wrong. Please try again." });
        }
        finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        fetchPg();
        fetchCurrentRoom();
    }, [fetchCurrentRoom, fetchPg])

    return (
        <div className="room-details-container">
            <div className="room-list-nav-path">
                <span onClick={() => navigate("/")} className="navigator">Home</span>
                <span className="seperator"> / </span>
                <span onClick={() => navigate("/pg-list")} className="navigator">PG List</span>
                <span className="seperator"> / </span>
                {pgData && <span>{pgData.name}</span>}
                <span className="seperator"> / </span>
                <span onClick={() => navigate(`/pg/${pgId}/rooms`)} className="navigator">Rooms</span>
                <span className="seperator"> / </span>
                {roomData && <span>{roomData.room_number}</span>}

            </div>
            <div className="room-details-header">
                <h1>Room No. {roomData && roomData.room_number}</h1>
            </div>

            <div className="form-header-block">
                {!editMode && <div>
                    <button className="edit-button" onClick={() => setEditMode(true)}><FaPen />Edit Details</button>
                </div>}
            </div>
            <div className={`room-details-form ${editMode ? 'enabled' : 'disabled'}`}>
                <form onSubmit={handleSubmit}>
                    <div>Room Number</div>
                    <input
                        className={`room-details-input ${editMode ? 'enabled' : 'disabled'}`}
                        disabled={!editMode}
                        placeholder="Enter Room Number"
                        value={formData && formData.room_number}
                        onChange={e => {
                            setFormData({
                                ...formData,
                                name: e.target.value
                            })
                            if (error?.roomNumber) {
                                const newError = { ...error };
                                delete newError.roomNumber;
                                setError(newError);
                            }
                        }}
                    />
                    <div className="error-container">
                        {error?.roomNumber}
                    </div>
                    <div>Room Occupancy Type: </div>
                    <div className="occupancy-toggle">

                        <button
                            type="button"
                            className={formData.capacity === 1 ? "active" : ""}
                            disabled={!editMode}
                            onClick={() => setFormData({
                                ...formData,
                                capacity: 1
                            })}
                        >👤Single</button>
                        <button
                            type="button"
                            className={formData.capacity === 2 ? "active" : ""}
                            disabled={!editMode}
                            onClick={() => setFormData({
                                ...formData,
                                capacity: 2
                            })}
                        >👥Double</button>
                    </div>
                    <div className="error-container">
                        {error?.roomCapacity}
                    </div>

                    <div className="balcony-checkbox">
                        <input
                            type="checkbox"
                            checked={formData.is_balcony_room}
                            onChange={e => setFormData({
                                ...formData,
                                is_balcony_room: e.target.checked
                            })}
                            disabled={!editMode}
                        />
                        <label>Balcony room</label>
                    </div>

                    <div>Room Rent</div>
                    <input
                        placeholder="Enter Room Rent"
                        value={formData.rent}
                        onChange={e => {
                            setFormData({
                                ...formData,
                                rent: e.target.value
                            })
                            if (error?.roomRent) {
                                const newError = { ...error };
                                delete newError.roomRent;
                                setError(newError);
                            }
                        }
                        }
                        disabled={!editMode}
                    />
                    <div className="error-container">
                        {error?.roomRent}
                    </div>
                    {error?.detail && (
                        <div className="error-container">{error.detail}</div>
                    )}

                    {editMode && <div className="edit-mode-buttons">
                        <button type="button" onClick={() => {
                            setEditMode(false);
                            setFormData(roomData);
                        }}>Cancel</button>
                        {/* <button type="submit">Submit</button> */}
                        <LoadingSubmitButton 
                            loading={loading}
                            loadingText="Saving changes"
                            children="Save"
                            type="submit"
                        />
                    </div>}
                </form>
            </div>
        </div>
    )
}

export default RoomDetails;