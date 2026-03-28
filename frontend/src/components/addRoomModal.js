import { useEffect, useState } from "react";
import { authFetch } from "../api/apiClient";
import "../styles/addRoomModal.css";
import ConfirmModal from "./confirmationModal";

function AddRoomModal({ pgId, onAdd, onClose }) {

    const [roomNumber, setRoomNumber] = useState("");
    const [roomCapacity, setCapacity] = useState("");
    const [roomRent, setRent] = useState("");
    const [roomBalcony, setRoomBalcony] = useState(false);
    const [roomTypes, setRoomTypes] = useState([]);
    const [closing, setClosing] = useState(false);
    const [selectedRoomType, setSelectedRoomType] = useState(null);
    const [showConfirmModal, setShowConfirmModal] = useState(false);

    useEffect(() => {
        fetchRoomTypes();
    }, [])

    useEffect(() => {
        if (selectedRoomType) {
            setShowConfirmModal(true);
        }
    }, [selectedRoomType])

    const handleClose = () => {
        setClosing(true);

        setTimeout(() => {
            onClose();
        }, 300); // must match CSS transition

    };

    const fetchRoomTypes = async () => {
        const res = await authFetch(`http://localhost:8000/api/room-types/?pg_property=${pgId}`);
        if (!res.ok) {
            throw new Error("Failed to fetch room types");
        }
        const data = await res.json();
        setRoomTypes(data);
    }

    const handleSubmit = async (e) => {
        e.preventDefault();

        const res = await authFetch("http://localhost:8000/api/rooms/", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                pg_property: pgId,
                room_number: roomNumber,
                capacity: roomCapacity,
                rent: roomRent,
                is_balcony_room: roomBalcony
            })
        });

        const data = await res.json();
        onAdd(data);
    }

    const handleUpdate = async (e) => {
        e.preventDefault();
        const selected = roomTypes.find(rt => rt.id === selectedRoomType);
        if (!selected) return;

        setCapacity(selected.capacity);
        setRent(selected.rent);
        setRoomBalcony(selected.is_balcony_room);
        setShowConfirmModal(false);
    }

    const handleCancel = () => {
        setShowConfirmModal(false);
        setSelectedRoomType(null);
    };

    return (
        <div className="add-room-modal-overlay">
            <div
                className={`add-room-modal-box ${closing ? "close" : "open"}`}
                onClick={(e) => e.stopPropagation()}
            >
                <h1 className="modal-header">Add Room</h1>
                <form>
                    <div>Room Number</div>
                    <input
                        placeholder="Enter Room Number"
                        value={roomNumber}
                        onChange={e => setRoomNumber(e.target.value)}
                    />

                    <br />

                    <select onChange={(e) => setSelectedRoomType(Number(e.target.value))}>
                        <option value="">Select Room Type</option>
                        {roomTypes.map(rt => (
                            <option key={rt.id} value={rt.id}>{rt.name}</option>
                        ))}
                    </select>

                    {/* {showConfirmModal && (
                        <div className="template-modal-overlay">
                            <div className="template-modal-box">
                                <h1>Are you Sure?</h1>
                                <div className="template-modal-text">
                                    Room Configuration will be updated to Room Template configuration if you have already entered. Are you sure you want to update Configuration?
                                    <div className="template-modal-buttons">
                                        <button className="confirm-button" onClick={handleUpdate}>Update</button>
                                        <button className="cancel-button" onClick={handleCancel}>Cancel</button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )} */}

                    <ConfirmModal 
                    show={showConfirmModal}
                    title={"Are you Sure?"}
                    message={" Room Configuration will be updated to Room Template configuration if you have already entered. Are you sure you want to update Configuration?"}
                    onConfirm={handleUpdate}
                    onCancel={handleCancel}
                    />

                    <div>Room Occupancy Type: </div>
                    <div className="occupancy-toggle">

                        <button type="button" className={roomCapacity === 1 ? "active" : ""} onClick={() => setCapacity(1)}>👤Single</button>
                        <button type="button" className={roomCapacity === 2 ? "active" : ""} onClick={() => setCapacity(2)}>👥Double</button>

                    </div>
                    <br />
                    <div className="balcony-checkbox">
                        <input type="checkbox" checked={roomBalcony} onChange={e => setRoomBalcony(e.target.checked)} />
                        <label>Balcony room</label>
                    </div>
                    <br />

                    <div>Room Rent</div>
                    <input
                        placeholder="Enter Room Rent"
                        value={roomRent}
                        onChange={e => setRent(e.target.value)}
                    />
                    <br />

                    <button type="submit" onClick={handleSubmit}>Add Room</button>
                    <button type="button" onClick={handleClose}>Cancel</button>
                </form>
            </div>
        </div>
    )
}

export default AddRoomModal;