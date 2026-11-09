  import { useState, useEffect, useCallback } from "react";
  import "../../styles/addMaintainance.css";
  import { authFetch } from "../../api/apiClient";
  import { API_BASE_URL } from "../../config";
  import { FaTimes } from "react-icons/fa";
  import LoadingSubmitButton from "../common/loadingSubmitButton";
  import { toast } from "react-toastify";
  import { useAuth } from "../../context/authContext";
  import { validateCategory, validateRoomNumber } from "../../utils/requestValidation";

  const REQUEST_CATEGORY_LABELS = {
    room_furniture: "Room Furniture",
    electricity: "Electricity",
    plumbing: "Plumbing",
    internet: "Internet",
    other: "Other Issue",
  };

  function AddMaintainenceRequest({ pgId, onAdd, onClose, viewMode }) {
    const [closing, setClosing] = useState(false);
    const [opening, setOpening] = useState(false);
    const [selectedRoom, setSelectedRoom] = useState(null);
    const [rooms, setRooms] = useState([]);
    const [error, setError] = useState(null);
    const [requestDesc, setRequestDesc] = useState("");
    const [loading, setLoading] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState("");
    const [tenantRoom, setTenantRoom] = useState(null);
    const isView = !!viewMode;

      const { user } = useAuth();
      const isTenant = user?.role === "TENANT";
      const isAdmin = !isTenant;

    useEffect(() => {
      requestAnimationFrame(() => {
        setOpening(true);
      });
      if(viewMode){
        setSelectedRoom(viewMode.room);
        setSelectedCategory(viewMode.category);
        setRequestDesc(viewMode.description);
      }
    }, [viewMode]);

    useEffect(() => {
    if (!isTenant) return;
    (async () => {
      try {
        const res = await authFetch(`${API_BASE_URL}/auth/tenants/me/`);
        if (!res.ok) throw new Error();
        const data = await res.json();
        setTenantRoom(data.room);
      } catch {
        setError({ detail: "Could not load your room." });
      }
    })();
  }, [isTenant]);

    const fetchRooms = useCallback(async () => {
      try {
        const res = await authFetch(
          `${API_BASE_URL}/api/rooms/?pg_property=${pgId}`,
        );
        if (!res.ok) {
          throw new Error("Failed to fetch Rooms");
        }
        const data = await res.json();
        setRooms(data);
      } catch {
        setError({ detail: "Could not load Rooms." });
      }
    }, [pgId]);

    const clearFieldError = (field) => {
      if (error?.[field]) {
        const newError = { ...error };
        delete newError[field];
        setError(newError);
      }
    };

    const resetForm = () => {
      setSelectedRoom(null);
      setRequestDesc("");
      setSelectedCategory("");
      setError(null);
    };

    const handleClose = () => {
      setClosing(true);
      setTimeout(() => {
        resetForm();
        onClose();
      }, 300);
    };

    const handleRoomChange = (e) => {
      const roomId = e.target.value;
      setSelectedRoom(roomId ? Number(roomId) : null);
    };

    const handleSubmit = async (e) => {
      e.preventDefault();
      setError({});
      const rnError = validateRoomNumber(selectedRoom);
      const catError = validateCategory(selectedCategory);
      const finalError = {};

      if(rnError) finalError.rooms = rnError;
      if(catError) finalError.category = catError;
      if (Object.keys(finalError).length > 0) {
        setError(finalError);
        return;
      }
      setError({})
      try {
        setLoading(true);
        const roomId = isTenant ? tenantRoom : selectedRoom;
        const res = await authFetch(
          `${API_BASE_URL}/api/maintainence-requests/`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              room: roomId,
              category: selectedCategory,
              description: requestDesc,
            }),
          },
        );

        if (!res.ok) {
          const errData = await res.json();
          setError(errData);
          return;
        }
        const data = await res.json();
        onAdd(data);
        toast.success("Request Raised successfully.");
      } catch (err) {
        setError({ detail: "Something went wrong. Please try again." });
      } finally {
        setLoading(false);
      }
    };

    useEffect(() => {
      if(isAdmin){
        fetchRooms();
      }
    }, [fetchRooms, isAdmin]);

    return (
      <div className="add-request-modal-overlay" onClick={handleClose}>
        <div
          className={`add-request-modal-box ${closing ? "close" : opening ? "open" : ""}`}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="modal-top">
            {viewMode ? (
              <h1 className="modal-header">Request No. {viewMode.id}</h1>
            ) : (
              <h1 className="modal-header">Raise Maintainence Request</h1>
            )}
            <button
              type="button"
              className="modal-close"
              onClick={handleClose}
              aria-label="Close"
            >
              <FaTimes />
            </button>
          </div>
          <form onSubmit={handleSubmit}>
            {isAdmin && (
              <div className="field">
                <label htmlFor="request-room">Room</label>
                <select
                  id="request-room"
                  className="custom-select"
                  value={selectedRoom ?? ""}
                  onChange={handleRoomChange}
                  disabled={isView}
                >
                  <option value="">Select Room</option>
                  {rooms.map((room) => (
                    <option key={room.id} value={room.id}>
                      {room.room_number}
                    </option>
                  ))}
                </select>
                {error?.rooms && (
                  <div className="error-container">{error.rooms}</div>
                )}
              </div>
            )}

            <div className="field">
              <label htmlFor="request-category">Category</label>
              <select
                id="request-category"
                className="custom-select"
                value={selectedCategory ?? ""}
                onChange={(e) => {
                  setSelectedCategory(e.target.value);
                }}
                disabled={isView}
              >
                <option value="">Select Category</option>
                {Object.entries(REQUEST_CATEGORY_LABELS).map(
                  ([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ),
                )}
              </select>
              {error?.category && (
                <div className="error-container">{error.category}</div>
              )}
            </div>

            <div className="field">
              <label htmlFor="request-desc">Description</label>
              <textarea
                className="request-desc"
                rows={4}
                placeholder="Enter the issue to be raised here..."
                value={requestDesc}
                onChange={(e) => {
                  setRequestDesc(e.target.value);
                  clearFieldError("desc");
                }}
                disabled={isView}
              ></textarea>
              {error?.desc && (
                <div className="error-container">{error.desc}</div>
              )}
            </div>

            {error?.detail && (
              <div className="error-container">{error.detail}</div>
            )}

            <div className="modal-actions">
              <button
                type="button"
                className="btn-secondary"
                onClick={handleClose}
              >
                {viewMode ? "Close" : "Cancel"}
              </button>
              {!viewMode && (
                <LoadingSubmitButton
                  loading={loading}
                  loadingText="Raising request"
                  children="Raise request"
                  type="submit"
                />
              )}
            </div>
          </form>
        </div>
      </div>
    );
  }

  export default AddMaintainenceRequest;
