import { useState, useEffect } from "react";
import "../../styles/addPG.css";
import "../../styles/common_styles/add-btn.css";
import { authFetch } from "../../api/apiClient";
import { API_BASE_URL } from "../../config";
import { toast } from "react-toastify";
import LoadingSubmitButton from "../common/loadingSubmitButton";
import "../../styles/common_styles/add-btn.css";

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

const handleClose = () => {
  setClosing(true);
  setTimeout(() => {
    setClosing(false);
    setOpening(false);
    setName("");
    setFloor("");
    setError(null);
    onClose();
  }, 300); // must match CSS transition
};

  const handleAddPG = async (e) => {
    e.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError("PG name is required.");
      return;
    }
    if (!floor || Number(floor) <= 0) {
      setError("Enter a valid number of floors.");
      return;
    }

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
      toast.success("PG created");
      onAdd(newPG);
      setName("");
      setFloor("");
      handleClose();
    } catch (err) {
      setError(err.message);
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
        <h2 className="add-pg-modal-header">Add new PG</h2>

        <form onSubmit={handleAddPG}>
          <div className="input-area">
            <label htmlFor="pg-name">Enter PG Name</label>
            <input
              id="pg-name"
              type="text"
              placeholder="PG Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div className="input-area">
            <label htmlFor="pg-floor">Enter Total Floors in PG</label>
            <input
              id="pg-floor"
              type="number"
              min="1"
              placeholder="PG Floor"
              value={floor}
              onChange={(e) => setFloor(e.target.value)}
            />
          </div>

          {error && <div className="error-container">{error}</div>}

          <div className="modal-buttons">
            <button type="button" onClick={handleClose} className="cancel-btn">
              Cancel
            </button>
            <LoadingSubmitButton
              children="Add PG"
              loading={loading}
              loadingText="Adding"
              type="submit"
              disabled={!name.trim() || !floor}
              className="add-btn"
            />
          </div>
        </form>
      </div>
    </div>
  );
}

export default AddPG;
