  import { useState, useEffect, useCallback } from "react";
  import "../../styles/addMaintainance.css";
  import { authFetch } from "../../api/apiClient";
  import { API_BASE_URL } from "../../config";
  import { FaTimes } from "react-icons/fa";
  import LoadingSubmitButton from "../common/loadingSubmitButton";
  import { toast } from "react-toastify";
  import { useAuth } from "../../context/authContext";
  import { validateCategory, validateRoomNumber } from "../../utils/requestValidation";
  import { MODE, REQUEST_CATEGORY_LABELS } from "../../constants/maintainence";
  import { extractError } from "../../utils/format";

  function AddMaintainenceRequest({ pgId, onAdd, onClose, reqOb, mode }) {
    const [closing, setClosing] = useState(false);
    const [opening, setOpening] = useState(false);
    const [selectedRoom, setSelectedRoom] = useState(null);
    const [rooms, setRooms] = useState([]);
    const [error, setError] = useState(null);
    const [requestDesc, setRequestDesc] = useState("");
    const [loading, setLoading] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState("");
    const [tenantRoom, setTenantRoom] = useState(null);
    const isCreate = mode === MODE.CREATE;
    const isView = mode === MODE.VIEW;
    const isEdit = mode === MODE.EDIT;
      const { user } = useAuth();
      const isTenant = user?.role === "TENANT";
      const isAdmin = !isTenant;

    useEffect(() => {
      requestAnimationFrame(() => {
        setOpening(true);
      });
      if(reqOb){
        setSelectedRoom(reqOb.room);
        setSelectedCategory(reqOb.category);
        setRequestDesc(reqOb.description);
      }
    }, [reqOb]);

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
      if(loading) return;
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
      const rnError = isCreate && isAdmin ? validateRoomNumber(selectedRoom) : null;
      const catError = validateCategory(selectedCategory);
      const finalError = {};

      if(rnError) finalError.room = rnError;
      if(catError) finalError.category = catError;
      if (Object.keys(finalError).length > 0) {
        setError(finalError);
        return;
      }
      setError({})
      try {
        setLoading(true);
        const roomId = isTenant ? tenantRoom : selectedRoom;
        const res = isEdit
          ? await authFetch(`${API_BASE_URL}/api/maintainence-requests/${reqOb.id}/`, {
              method: "PATCH",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                category: selectedCategory,
                description: requestDesc,
              }),
            })
          : await authFetch(`${API_BASE_URL}/api/maintainence-requests/`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                room: roomId,
                category: selectedCategory,
                description: requestDesc,
              }),
            });

        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          setError(
            errData.detail
              ? errData
              : {
                  ...errData,
                  detail: extractError(errData, "Request failed."),
                },
          );
          return;
        }
        toast.success(
          isEdit
            ? "Request updated successfully."
            : "Request raised successfully.",
        );
        onAdd();
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
            <h1 className="modal-header">
              {isCreate
                ? "Raise Maintainence Request"
                : `Request No. ${reqOb.id}`}
            </h1>

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
                  disabled={!isCreate}
                >
                  <option value="">Select Room</option>
                  {rooms.map((room) => (
                    <option key={room.id} value={room.id}>
                      {room.room_number}
                    </option>
                  ))}
                </select>
                {error?.room && (
                  <div className="error-container">{error.room}</div>
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
                id="request-desc"
                className="request-desc"
                rows={4}
                placeholder="Enter the issue to be raised here..."
                value={requestDesc}
                onChange={(e) => {
                  setRequestDesc(e.target.value);
                  clearFieldError("description");
                }}
                disabled={isView}
              ></textarea>
              {error?.description && (
                <div className="error-container">{error.description}</div>
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
                disabled = {loading}
              >
                {isView ? "Close" : "Cancel"}
              </button>
              {!isView && (
                <LoadingSubmitButton
                  loading={loading}
                  loadingText={isEdit ? "Saving" : "Raising request"}
                  type="submit"
                >
                  {isEdit ? "Save" : "Raise request"}
                </LoadingSubmitButton>
              )}
            </div>
          </form>
        </div>
      </div>
    );
  }

  export default AddMaintainenceRequest;
