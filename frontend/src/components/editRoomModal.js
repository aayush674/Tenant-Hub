import { useState } from "react";
import { authFetch } from "../api/apiClient";
import "../styles/addRoomModal.css";


function EditRoomModal({ room, onUpdate, onClose }) {

    const [roomNumber, setRoomNumber] = useState(room.room_number);
    const [roomCapacity, setCapacity] = useState(room.capacity);
    const [roomRent, setRent] = useState(room.rent);
    const [error, setError] = useState(null);

    const [closing, setClosing] = useState(false);

    const handleClose = () => {
        setClosing(true);

        setTimeout(() => {
            onClose();
        }, 300); // must match CSS transition
    };

    const handleUpdate = async (e) => {
        e.preventDefault();
        setError(null);
        try {
            const res = await authFetch(`http://localhost:8000/api/rooms/${room.id}/`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    capacity: roomCapacity,
                    rent: roomRent
                })
            });

            if (!res.ok) {
                const errData = await res.json();
                setError(errData);
                console.log(errData);
                return;
            }

            const updatedRoom = await res.json();
            onUpdate(updatedRoom);
        } catch (err) {
            setError({ detail: "Something went wrong. Please try again." });
        }

    }


    return (
        <div className="add-room-modal-overlay">
            <div
                className={`add-room-modal-box ${closing ? "close" : "open"}`}
                onClick={(e) => e.stopPropagation()}
            >
                <h1 className="modal-header">Edit Room</h1>

                {error && (
                    <div className="error-box">
                        {error.room_number && (<div>{error.room_number[0]}</div>)}
                        {error.capacity && (<div>{error.capacity[0]}</div>)}
                        {error.rent && (<div>{error.rent[0]}</div>)}
                        {error.detail && (<div>{error.detail[0]}</div>)}
                        {error.non_field_errors && (
                            <div>{error.non_field_errors[0]}</div>
                        )}

                    </div>
                )}

                <form>
                    <div>Room Number</div>
                    <input
                        value={roomNumber}
                        disabled
                    />

                    <br />
                    <div>Room Occupancy Type: </div>
                    <div className="occupancy-toggle">

                        <button type="button" className={roomCapacity === 1 ? "active" : ""} onClick={() => setCapacity(1)}>👤Single</button>
                        <button type="button" className={roomCapacity === 2 ? "active" : ""} onClick={() => setCapacity(2)}>👥Double</button>

                    </div>
                    <br />
                    <div>Room Rent</div>
                    <input
                        placeholder="Enter Room Rent"
                        value={roomRent}
                        onChange={e => setRent(e.target.value)}
                    />
                    <br />

                    <button type="submit" onClick={handleUpdate}>Edit</button>
                    <button type="button" onClick={handleClose}>Cancel</button>
                </form>
            </div>
        </div>
    )
}

export default EditRoomModal;