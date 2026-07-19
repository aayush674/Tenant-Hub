import { useState, useCallback, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { authFetch } from "../../api/apiClient";
import { API_BASE_URL } from "../../config";
import { FaPen } from "react-icons/fa";
import { validateRoomCapacity, validateRoomRent } from "../../utils/roomValidation";
import { toast } from "react-toastify";
import LoadingSubmitButton from "../common/loadingSubmitButton";
import "../../styles/roomDetails.css"

function RoomDetails() {
    const navigate = useNavigate();
    const { pgId, roomId } = useParams();
    const [pgData, setPgData] = useState({});
    const [roomData, setRoomData] = useState({});
    const [formData, setFormData] = useState({});
    const [editMode, setEditMode] = useState(false);
    const [error, setError] = useState({});
    const [loading, setLoading] = useState(false);
    const [roomTenants, setRoomTenants] = useState([]);

    const fetchPg = useCallback(async () => {
        const res = await authFetch(`${API_BASE_URL}/api/pgs/${pgId}/`);
        if (!res.ok) {
            throw new Error("Failed to fetch PG");
        }
        const data = await res.json();
        setPgData(data);
    }, [pgId]);

    const fetchCurrentRoom = useCallback(async () => {
        const res = await authFetch(`${API_BASE_URL}/api/rooms/${roomId}`);
        if (!res.ok) {
            throw new Error("Failed to fetch Room");
        }
        const data = await res.json();
        setRoomData(data);
        setFormData(data);
    }, [roomId]);

    const fetchRoomTenants = useCallback(async () => {
        const res = await authFetch(`${API_BASE_URL}/api/tenants/?room=${roomId}`);
        if (!res.ok) {
            throw new Error("Failed to fetch Room Tenants");
        }
        const data = await res.json();
        setRoomTenants(data);
        console.log(roomTenants);
    }, [roomId, roomTenants])

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
        fetchRoomTenants();
    }, [fetchCurrentRoom, fetchPg, fetchRoomTenants])

    return (
        <div className="room-details-container">
            <div className="nav-path">
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
            <div className="room-basic-details">
                <div className="basic-details-header">
                    <h2><u>Basic Details</u></h2>
                    {!editMode && <div>
                        <button className="edit-room-button" onClick={() => setEditMode(true)}><FaPen />Edit Details</button>
                    </div>}
                </div>
                <div className={`room-details-form ${editMode ? 'enabled' : 'disabled'}`}>
                    <form onSubmit={handleSubmit}>
                        <div className="form-row">
                            <div className="form-labels">Room Number</div>
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
                        </div>
                        <div className="form-row">
                            <div className="form-labels">Room Occupancy Type:</div>
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
                        </div>
                        <div className="form-row">
                            <label className="form-labels">Balcony room</label>
                            {/* <input
                                type="checkbox"
                                checked={formData.is_balcony_room}
                                onChange={e => setFormData({
                                    ...formData,
                                    is_balcony_room: e.target.checked
                                })}
                                disabled={!editMode}
                                className="checkbox"
                            /> */}
                            <select
                                value={formData.is_balcony_room}
                                onChange={(e) => setFormData({
                                    ...formData,
                                    is_balcony_room: e.target.value
                                })
                                }
                                disabled={!editMode}
                            >
                                <option value={true}>Yes</option>
                                <option value={false}>No</option>
                            </select>
                        </div>
                        <div className="form-row">
                            <div className="form-labels">Room Rent</div>
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
                        </div>
                        {error?.detail && (
                            <div className="error-container">{error.detail}</div>
                        )}
                        <div className="edit-mode-footer-container">
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
                        </div>

                    </form>
                </div>
            </div>
            <div className="room-tenant-details">
                <h2><u>Tenant Details</u></h2>
                <div className="form-row">
                    <div className="form-labels">Total Room Capacity</div>
                    <input
                        className={`tenant-details-input`}
                        disabled
                        value={formData && formData.capacity}
                    />
                </div>

                <div className="form-row">
                    <div className="form-labels">Available Room Capacity</div>
                    <input
                        className={`tenant-details-input`}
                        disabled
                        value={formData && roomTenants && (formData.capacity - roomTenants.length)}
                    />
                </div>

                <div className="form-row">
                    <div className="form-labels">Tenant Names</div>
                    <div className="card-block">
                        {roomTenants.length === 0 ? (
                            <div>
                                No Tenant Available
                            </div>
                        ) : (
                            roomTenants.map(tenant => (
                                <div key={tenant.id} className="tenant-card">
                                    {tenant.first_name + " " + tenant.last_name}
                                </div>
                            ))
                        )}

                    </div>
                </div>
            </div>
        </div>
    )
}

export default RoomDetails;