import { useState, useEffect } from "react";
import { authFetch } from "../../api/apiClient";
import "../../styles/addRoomTypeModal.css";
import { toast } from "react-toastify";
import LoadingSubmitButton from "../common/loadingSubmitButton";


function AddRoomTypeModal({ pgId, onAdd, onClose }) {

    const [roomTypeTitle, setRoomTypeTitle] = useState("");
    const [roomCapacity, setCapacity] = useState("");
    const [roomRent, setRent] = useState("");
    const [roomBalcony, setRoomBalcony] = useState(false);

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

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            setLoading(true);
            const res = await authFetch("http://localhost:8000/api/room-types/", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    pg_property: pgId,
                    name: roomTypeTitle,
                    capacity: roomCapacity,
                    rent: roomRent,
                    is_balcony_room: roomBalcony
                })
            });

            const data = await res.json();
            onAdd(data);
            toast.success("Room Type created successfully.");
        }
        finally{
            setLoading(false);
        }
    }


    return (
        <div className="add-room-type-modal-overlay" onClick={handleClose}>
            <div
                className={`add-room-type-modal-box ${closing ? "close" : opening ? "open" : ""
                    }`}
                onClick={(e) => e.stopPropagation()}
            >
                <h1 className="modal-header">Add Room Template</h1>
                <form onSubmit={handleSubmit}>
                    <div>Template Title</div>
                    <input
                        placeholder="Enter Title"
                        value={roomTypeTitle}
                        onChange={e => setRoomTypeTitle(e.target.value)}
                    />

                    <br />

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

                    <LoadingSubmitButton 
                        loading={loading}
                        loadingText="Creating Room Template"
                        children="Create Room Template"
                        type="submit"
                    />
                    <button type="button" onClick={handleClose}>Cancel</button>
                </form>
            </div>
        </div>


    )
}

export default AddRoomTypeModal;