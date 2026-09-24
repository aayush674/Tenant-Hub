import { useEffect, useState, useCallback } from "react";
import { authFetch } from "../../api/apiClient";
import "../../styles/addRoomModal.css";
import ConfirmModal from "../common/confirmationModal";
import { validateRoomCapacity, validateRoomNumber, validateRoomRent } from "../../utils/roomValidation";
import { toast } from "react-toastify";
import LoadingSubmitButton from "../common/loadingSubmitButton";
import { API_BASE_URL } from "../../config";
import { FaUser, FaUserFriends, FaTimes } from "react-icons/fa";

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
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        requestAnimationFrame(() => {
            setOpening(true);
        });
    }, []);

    useEffect(() => {
        if (selectedRoomType) {
            setShowConfirmModal(true);
        }
    }, [selectedRoomType]);

    const resetForm = () => {
        setRoomNumber("");
        setCapacity("");
        setRent("");
        setRoomBalcony(false);
        setSelectedRoomType(null);
        setError(null);
    };

    const handleClose = () => {
        setClosing(true);
        setTimeout(() => {
            resetForm();
            onClose();
        }, 300); // must match CSS transition
    };

    const fetchRoomTypes = useCallback(async () => {
        const res = await authFetch(`${API_BASE_URL}/api/room-types/?pg_property=${pgId}`);
        if (!res.ok) {
            throw new Error("Failed to fetch room types");
        }
        const data = await res.json();
        setRoomTypes(data);
    }, [pgId]);

    const clearFieldError = (field) => {
        if (error?.[field]) {
            const newError = { ...error };
            delete newError[field];
            setError(newError);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const rnError = validateRoomNumber(roomNumber);
        const rcError = validateRoomCapacity(roomCapacity);
        const rrError = validateRoomRent(roomRent);
        const finalError = {};

        if (rnError) finalError.roomNumber = rnError;
        if (rcError) finalError.roomCapacity = rcError;
        if (rrError) finalError.roomRent = rrError;

        if (Object.keys(finalError).length > 0) {
            setError(finalError);
            return;
        }

        setError({});
        try {
            setLoading(true);
            const res = await authFetch(`${API_BASE_URL}/api/rooms/`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    pg_property: pgId,
                    room_number: Number(roomNumber),
                    capacity: Number(roomCapacity),
                    rent: Number(roomRent),
                    is_balcony_room: roomBalcony,
                }),
            });

            if (!res.ok) {
                const errData = await res.json();
                setError(errData);
                return;
            }
            const data = await res.json();
            onAdd(data);
            toast.success("Room added successfully.");
        } catch (err) {
            setError({ detail: "Something went wrong. Please try again." });
        } finally {
            setLoading(false);
        }
    };

    const handleUpdate = async (e) => {
        e.preventDefault();
        const selected = roomTypes.find((rt) => rt.id === selectedRoomType);
        if (!selected) return;

        setCapacity(selected.capacity);
        setRent(selected.rent);
        setRoomBalcony(selected.is_balcony_room);
        setShowConfirmModal(false);
        setSelectedRoomType(null);

        const newError = { ...error };
        delete newError.roomCapacity;
        delete newError.roomRent;
        setError(newError);
    };

    const handleCancel = () => {
        setShowConfirmModal(false);
        setSelectedRoomType(null);
    };

    useEffect(() => {
        fetchRoomTypes();
    }, [fetchRoomTypes]);

    return (
        <div className="add-room-modal-overlay" onClick={handleClose}>
            <div
                className={`add-room-modal-box ${closing ? "close" : opening ? "open" : ""}`}
                onClick={(e) => e.stopPropagation()}
            >
                <div className="modal-top">
                    <h1 className="modal-header">Add room</h1>
                    <button type="button" className="modal-close" onClick={handleClose} aria-label="Close">
                        <FaTimes />
                    </button>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="field">
                        <label htmlFor="room-number">Room number</label>
                        <input
                            id="room-number"
                            placeholder="e.g. 204"
                            value={roomNumber}
                            onChange={(e) => {
                                setRoomNumber(e.target.value);
                                clearFieldError("roomNumber");
                            }}
                        />
                        {error?.roomNumber && <div className="error-container">{error.roomNumber}</div>}
                    </div>

                    <div className="field">
                        <label htmlFor="room-type">Room type</label>
                        <select
                            id="room-type"
                            onChange={(e) => setSelectedRoomType(Number(e.target.value))}
                            className="custom-select"
                            value={selectedRoomType ?? ""}
                        >
                            <option value="">Select a template (optional)</option>
                            {roomTypes.map((rt) => (
                                <option key={rt.id} value={rt.id}>{rt.name}</option>
                            ))}
                        </select>
                    </div>

                    <ConfirmModal
                        show={showConfirmModal}
                        title="Apply this template?"
                        message="This will overwrite the occupancy, rent, and balcony settings you've entered with this room type's defaults."
                        onConfirm={handleUpdate}
                        onCancel={handleCancel}
                    />

                    <div className="field">
                        <label>Occupancy</label>
                        <div className="occupancy-toggle">
                            <button
                                type="button"
                                className={Number(roomCapacity) === 1 ? "active" : ""}
                                onClick={() => {
                                    setCapacity(1);
                                    clearFieldError("roomCapacity");
                                }}
                            >
                                <FaUser aria-hidden="true" /> Single
                            </button>
                            <button
                                type="button"
                                className={Number(roomCapacity) === 2 ? "active" : ""}
                                onClick={() => {
                                    setCapacity(2);
                                    clearFieldError("roomCapacity");
                                }}
                            >
                                <FaUserFriends aria-hidden="true" /> Double
                            </button>
                        </div>
                        {error?.roomCapacity && <div className="error-container">{error.roomCapacity}</div>}
                    </div>

                    <label className="balcony-checkbox">
                        <input
                            type="checkbox"
                            checked={roomBalcony}
                            onChange={(e) => setRoomBalcony(e.target.checked)}
                        />
                        Balcony room
                    </label>

                    <div className="field">
                        <label htmlFor="room-rent">Room rent</label>
                        <input
                            id="room-rent"
                            placeholder="e.g. 8500"
                            value={roomRent}
                            onChange={(e) => {
                                setRent(e.target.value);
                                clearFieldError("roomRent");
                            }}
                        />
                        {error?.roomRent && <div className="error-container">{error.roomRent}</div>}
                    </div>

                    {error?.detail && <div className="error-container">{error.detail}</div>}

                    <div className="modal-actions">
                        <button type="button" className="btn-secondary" onClick={handleClose}>
                            Cancel
                        </button>
                        <LoadingSubmitButton
                            loading={loading}
                            loadingText="Adding room"
                            children="Add room"
                            type="submit"
                        />
                    </div>
                </form>
            </div>
        </div>
    );
}

export default AddRoomModal;
