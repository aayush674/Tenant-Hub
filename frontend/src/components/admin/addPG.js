import { useState, useEffect } from "react";
import "../../styles/addPG.css";
import { authFetch } from "../../api/apiClient";
import { API_BASE_URL } from "../../config";
import { toast } from "react-toastify";
import LoadingSubmitButton from "../common/loadingSubmitButton";
import { FaTimes } from "react-icons/fa";

function AddPG({ show, onClose, onAdd }) {
  const [name, setName] = useState("");
  const [floor, setFloor] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [closing, setClosing] = useState(false);
  const [opening, setOpening] = useState(false);

  useEffect(() => {
    if (show) {
      setOpening(false);
      requestAnimationFrame(() => setOpening(true));
    }
  }, [show]);

  if (!show && !closing) {
    return null;
  }

  const resetForm = () => {
    setName("");
    setFloor("");
    setError(null);
  };

  const handleClose = () => {
    setClosing(true);
    setTimeout(() => {
      setClosing(false);
      setOpening(false);
      resetForm();
      onClose();
    }, 300); // must match CSS transition
  };

  const clearFieldError = (field) => {
    if (error?.[field]) {
      const newError = { ...error };
      delete newError[field];
      setError(newError);
    }
  };

  const handleAddPG = async (e) => {
    e.preventDefault();

    const finalError = {};
    if (!name.trim()) finalError.name = "PG name is required.";
    if (!floor || Number(floor) <= 0)
      finalError.floor = "Enter a valid number of floors.";

    if (Object.keys(finalError).length > 0) {
      setError(finalError);
      return;
    }

    setError({});
    setLoading(true);
    try {
      const res = await authFetch(`${API_BASE_URL}/api/pgs/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          total_floors: Number(floor),
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.detail || "Failed to create PG.");
      }

      const newPG = await res.json();
      toast.success("PG created successfully.");
      onAdd(newPG);
      handleClose();
    } catch (err) {
      setError({
        detail: err.message || "Something went wrong. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="add-pg-modal-overlay" onClick={handleClose}>
      <div
        className={`add-pg-modal-box ${closing ? "close" : opening ? "open" : ""}`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-top">
          <h1 className="modal-header">Add new PG</h1>
          <button
            type="button"
            className="modal-close"
            onClick={handleClose}
            aria-label="Close"
          >
            <FaTimes />
          </button>
        </div>

        <form onSubmit={handleAddPG}>
          <div className="field">
            <label htmlFor="pg-name">PG name</label>
            <input
              id="pg-name"
              type="text"
              placeholder="e.g. Sunrise PG"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                clearFieldError("name");
              }}
            />
            {error?.name && <div className="error-container">{error.name}</div>}
          </div>

          <div className="field">
            <label htmlFor="pg-floor">Total floors</label>
            <input
              id="pg-floor"
              type="number"
              min="1"
              placeholder="e.g. 4"
              value={floor}
              onChange={(e) => {
                setFloor(e.target.value);
                clearFieldError("floor");
              }}
            />
            {error?.floor && (
              <div className="error-container">{error.floor}</div>
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
              Cancel
            </button>
            <LoadingSubmitButton
              loading={loading}
              loadingText="Adding"
              children="Add PG"
              type="submit"
              disabled={!name.trim() || !floor}
            />
          </div>
        </form>
      </div>
    </div>
  );
}

export default AddPG;
