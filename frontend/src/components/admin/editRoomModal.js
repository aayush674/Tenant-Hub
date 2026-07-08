import { useState, useEffect } from "react";
import { authFetch } from "../../api/apiClient";
import "../../styles/addRoomModal.css";
import { validateRoomCapacity, validateRoomRent } from "../../utils/roomValidation";
import { toast } from "react-toastify";
import LoadingSubmitButton from "../common/loadingSubmitButton";

function EditRoomModal({ room, onUpdate, onClose }) {

    const roomNumber = room.room_number;
    const [roomCapacity, setCapacity] = useState(room.capacity);
    const [roomRent, setRent] = useState(room.rent);
    const [error, setError] = useState(null);
    const [roomBalcony, setRoomBalcony] = useState(room.is_balcony_room);
    const [closing, setClosing] = useState(false);
    const [opening, setOpening] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleClose = () => {
        setClosing(true);

        setTimeout(() => {
            onClose();
        }, 300); // must match CSS transition
    };

    useEffect(() => {
        requestAnimationFrame(() => {
            setOpening(true);
        });
    }, []);

    const handleUpdate = async (e) => {
        e.preventDefault();
        const rcError = validateRoomCapacity(roomCapacity);
        const rrError = validateRoomRent(roomRent);
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
            const res = await authFetch(`http://localhost:8000/api/rooms/${room.id}/`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    capacity: roomCapacity,
                    is_balcony_room: roomBalcony,
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
            toast.success("Room edited successfully.");
        } catch (err) {
            setError({ detail: "Something went wrong. Please try again." });
        }
        finally{
            setLoading(false);
        }

    }


    return (
        <div className="add-room-modal-overlay" onClick={handleClose}>
            <div
                className={`add-room-modal-box ${closing ? "close" : opening ? "open" : ""
                    }`}
                onClick={(e) => e.stopPropagation()}
            >
                <h1 className="modal-header">Edit Room</h1>

                <form onSubmit={handleUpdate}>
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

                    <LoadingSubmitButton 
                        loading={loading}
                        loadingText="Editing Room"
                        children="Save"
                    />
                    <button type="button" onClick={handleClose}>Cancel</button>
                </form>
            </div>
        </div>
    )
}

export default EditRoomModal;