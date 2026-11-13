import { useState, useEffect } from "react";
import { authFetch } from "../../api/apiClient";
import "../../styles/addRoomTypeModal.css";
import { toast } from "react-toastify";
import LoadingSubmitButton from "../common/loadingSubmitButton";
import { API_BASE_URL } from "../../config";
import { MODE } from "../../constants/roomType";


function AddRoomTypeModal({ pgId, onAdd, onClose, roomType, mode }) {

    const [roomTypeTitle, setRoomTypeTitle] = useState("");
    const [roomCapacity, setCapacity] = useState("");
    const [roomRent, setRent] = useState("");
    const [roomBalcony, setRoomBalcony] = useState(false);

    const [closing, setClosing] = useState(false);
    const [opening, setOpening] = useState(false);
    const [loading, setLoading] = useState(false);
    const isCreate = mode === MODE.CREATE;
    const isView = mode === MODE.VIEW;

    const handleClose = () => {
        setClosing(true);
        setTimeout(() => {
            onClose();
        }, 300);
    };

    useEffect(() => {
        requestAnimationFrame(() => {
            setOpening(true);
        });
        if(roomType){
            setRoomTypeTitle(roomType.name);
            setRent(roomType.rent);
            setCapacity(roomType.capacity);
            setRoomBalcony(roomType.is_balcony_room);
        }
    }, [roomType]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            setLoading(true);
            isCreate
              ? await authFetch(`${API_BASE_URL}/api/room-types/`, {
                  method: "POST",
                  headers: {
                    "Content-Type": "application/json",
                  },
                  body: JSON.stringify({
                    pg_property: pgId,
                    name: roomTypeTitle,
                    capacity: roomCapacity,
                    rent: roomRent,
                    is_balcony_room: roomBalcony,
                  }),
                })
              : await authFetch(`${API_BASE_URL}/api/room-types/${roomType.id}/`, {
                  method: "PATCH",
                  headers: {
                    "Content-Type": "application/json",
                  },
                  body: JSON.stringify({
                    name: roomTypeTitle,
                    capacity: roomCapacity,
                    rent: roomRent,
                    is_balcony_room: roomBalcony,
                  }),
                });

            isCreate
              ? toast.success("Room Type created successfully.")
              : toast.success("Room Type updated successfully.");
            onAdd();
        }
        finally{
            setLoading(false);
        }
    }


    return (
      <div className="add-room-type-modal-overlay" onClick={handleClose}>
        <div
          className={`add-room-type-modal-box ${
            closing ? "close" : opening ? "open" : ""
          }`}
          onClick={(e) => e.stopPropagation()}
        >
          <h1 className="modal-header">
            {isCreate ? "Add Room Template" : `${roomType.name}`}
          </h1>
          <br />
          <form onSubmit={handleSubmit}>
            <div>Template Title</div>
            <input
              placeholder="Enter Title"
              value={roomTypeTitle}
              onChange={(e) => setRoomTypeTitle(e.target.value)}
              disabled={isView}
            />
            <br />

            <div>Room Occupancy Type: </div>
            <div className="occupancy-toggle">
              <button
                type="button"
                disabled={isView}
                className={roomCapacity === 1 ? "active" : ""}
                onClick={() => setCapacity(1)}
              >
                👤Single
              </button>
              <button
                type="button"
                disabled={isView}
                className={roomCapacity === 2 ? "active" : ""}
                onClick={() => setCapacity(2)}
              >
                👥Double
              </button>
            </div>
            <br />
            <div className="balcony-checkbox">
              <input
                type="checkbox"
                checked={roomBalcony}
                disabled={isView}
                onChange={(e) => setRoomBalcony(e.target.checked)}
              />
              <label>Balcony room</label>
            </div>
            <br />

            <div>Room Rent</div>
            <input
              placeholder="Enter Room Rent"
              value={roomRent}
              onChange={(e) => setRent(e.target.value)}
              disabled={isView}
            />
            <br />

            {!isView && (
              <LoadingSubmitButton
                loading={loading}
                loadingText="Creating Room Template"
                type="submit"
              >
                {isCreate ? "Create Template" : "Update Template"}
              </LoadingSubmitButton>
            )}
            <button type="button" onClick={handleClose}>
              {isView ? "Close" : "Cancel"}
            </button>
          </form>
        </div>
      </div>
    );
}

export default AddRoomTypeModal;
