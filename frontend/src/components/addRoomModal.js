import { useEffect, useState } from "react";
import { authFetch } from "../api/apiClient";
import "../styles/addRoomModal.css";
import ConfirmModal from "./confirmationModal";
import { validateRoomCapacity, validateRoomNumber, validateRoomRent } from "../utils/roomValidation";

function AddRoomModal({ pgId, onAdd, onClose }) {

    const [roomNumber, setRoomNumber] = useState("");
    const [roomCapacity, setCapacity] = useState("");
    const [roomRent, setRent] = useState("");
    const [roomBalcony, setRoomBalcony] = useState(false);
    const [roomTypes, setRoomTypes] = useState([]);
    const [closing, setClosing] = useState(false);
    const [opening, setOpening] = useState(false);
    const [selectedRoomType, setSelectedRoomType] = useState(null);
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchRoomTypes();
    }, [])

    useEffect(() => {
        requestAnimationFrame(() => {
            setOpening(true);
        });
    }, []);

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

        const rnError = validateRoomNumber(roomNumber);
        const rcError = validateRoomCapacity(roomCapacity);
        const rrError = validateRoomRent(roomRent);
        const finalError = {}

        if (rnError) {
            finalError.roomNumber = rnError;
        }
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
            const res = await authFetch("http://localhost:8000/api/rooms/", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    pg_property: pgId,
                    room_number: Number(roomNumber),
                    capacity: Number(roomCapacity),
                    rent: Number(roomRent),
                    is_balcony_room: roomBalcony
                })
            });

            if (!res.ok) {
                const errData = await res.json();
                setError(errData);
                console.log(errData);
                return;
            }
            const data = await res.json();
            onAdd(data);
        }
        catch (err) {
            setError({ detail: "Something went wrong. Please try again." });
        }
    }

    const handleUpdate = async (e) => {
        e.preventDefault();
        const selected = roomTypes.find(rt => rt.id === selectedRoomType);
        if (!selected) return;

        setCapacity(selected.capacity);
        setRent(selected.rent);
        setRoomBalcony(selected.is_balcony_room);
        setShowConfirmModal(false);
        let newError = { ...error };
        if (newError.roomCapacity) {
            delete newError.roomCapacity;
        }
        if (newError.roomRent) {
            delete newError.roomRent;
        }
        setError(newError);
    }

    const handleCancel = () => {
        setShowConfirmModal(false);
        setSelectedRoomType(null);
    };

    return (
        <div className="add-room-modal-overlay" onClick={handleClose}>
            <div
                className={`add-room-modal-box ${closing ? "close" : opening ? "open" : ""
                    }`}
                onClick={(e) => e.stopPropagation()}
            >
                <h1 className="modal-header">Add Room</h1>

                <form onSubmit={handleSubmit}>
                    <div>Room Number</div>
                    <input
                        placeholder="Enter Room Number"
                        value={roomNumber}
                        onChange={e => {
                            setRoomNumber(e.target.value);
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

                    <div>Room Type</div>
                    <select onChange={(e) => setSelectedRoomType(Number(e.target.value))} className="custom-select">
                        <option value="">Select Room Type</option>
                        {roomTypes.map(rt => (
                            <option key={rt.id} value={rt.id}>{rt.name}</option>
                        ))}
                    </select>
                    <br />

                    <ConfirmModal
                        show={showConfirmModal}
                        title={"Are you Sure?"}
                        message={" Room Configuration will be updated to Room Template configuration if you have already entered. Are you sure you want to update Configuration?"}
                        onConfirm={handleUpdate}
                        onCancel={handleCancel}
                    />

                    <div>Room Occupancy Type: </div>
                    <div className="occupancy-toggle">

                        <button type="button" className={roomCapacity === 1 ? "active" : ""} onClick={() => {
                            setCapacity(1);
                            if (error?.roomCapacity) {
                                const newError = { ...error };
                                delete newError.roomCapacity;
                                setError(newError);
                            }
                        }
                        }>👤Single</button>
                        <button type="button" className={roomCapacity === 2 ? "active" : ""} onClick={() => {
                            setCapacity(2);
                            if (error?.roomCapacity) {
                                const newError = { ...error };
                                delete newError.roomCapacity;
                                setError(newError);
                            }
                        }
                        }>👥Double</button>

                    </div>
                    <div className="error-container">
                        {error?.roomCapacity}
                    </div>

                    <div className="balcony-checkbox">
                        <input type="checkbox" checked={roomBalcony} onChange={e => setRoomBalcony(e.target.checked)} />
                        <label>Balcony room</label>
                    </div>
                    <br />

                    <div>Room Rent</div>
                    <input
                        placeholder="Enter Room Rent"
                        value={roomRent}
                        onChange={e => {
                            setRent(e.target.value);
                            if (error?.roomRent) {
                                const newError = { ...error };
                                delete newError.roomRent;
                                setError(newError);
                            }
                        }
                        }
                    />
                    <div className="error-container">
                        {error?.roomRent}
                    </div>
                    {error?.detail && (
                        <div className="error-container">{error.detail}</div>
                    )}

                    <button type="submit">Add Room</button>
                    <button type="button" onClick={handleClose}>Cancel</button>
                </form>
            </div>
        </div>
    )
}

export default AddRoomModal;