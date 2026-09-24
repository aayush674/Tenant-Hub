import { useEffect, useState, useCallback } from "react";
import { authFetch } from "../../api/apiClient";
import "../../styles/addDue.css";
import LoadingSubmitButton from "../common/loadingSubmitButton";
import { toast } from "react-toastify";
import { API_BASE_URL } from "../../config";
import { FaTimes } from "react-icons/fa";

function AddDueModal({ pgId, onAdd, onClose }) {
  const [tenants, setTenants] = useState([]);
  const [closing, setClosing] = useState(false);
  const [opening, setOpening] = useState(false);
  const [selectedTenant, setSelectedTenant] = useState(null);
  const [selectedDueType, setSelectedDueType] = useState("");
  const [dueAmount, setDueAmount] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    requestAnimationFrame(() => {
      setOpening(true);
    });
  }, []);

  const resetForm = () => {
    setSelectedTenant(null);
    setSelectedDueType("");
    setDueAmount("");
    setDueDate("");
    setError(null);
  };

  const handleClose = () => {
    setClosing(true);
    setTimeout(() => {
      resetForm();
      onClose();
    }, 300); // must match CSS transition
  };

  const fetchTenants = useCallback(async () => {
    const res = await authFetch(
      `${API_BASE_URL}/api/tenants/?pg_property=${pgId}`,
    );
    if (!res.ok) {
      throw new Error("Failed to fetch Tenants");
    }
    const data = await res.json();
    setTenants(data);
  }, [pgId]);

  const clearFieldError = (field) => {
    if (error?.[field]) {
      const newError = { ...error };
      delete newError[field];
      setError(newError);
    }
  };

  const validateForm = () => {
    const finalError = {};
    if (!selectedTenant) finalError.tenant = "Please select a tenant.";
    if (!selectedDueType) finalError.dueType = "Please select a due type.";
    if (!dueAmount || Number(dueAmount) <= 0)
      finalError.dueAmount = "Enter a valid amount.";
    if (!dueDate) finalError.dueDate = "Please select a date.";
    return finalError;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const finalError = validateForm();
    if (Object.keys(finalError).length > 0) {
      setError(finalError);
      return;
    }

    setError({});
    try {
      setLoading(true);
      const res = await authFetch(`${API_BASE_URL}/api/dues/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tenant: selectedTenant,
          due_type: selectedDueType,
          due_amount: Number(dueAmount),
          due_date: dueDate,
        }),
      });

      if (!res.ok) {
        const errData = await res.json();
        setError(errData);
        return;
      }
      const data = await res.json();
      onAdd(data);
      toast.success("Due applied successfully.");
    } catch (err) {
      setError({ detail: "Something went wrong. Please try again." });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTenants();
  }, [fetchTenants]);

  return (
    <div className="add-due-modal-overlay" onClick={handleClose}>
      <div
        className={`add-due-modal-box ${closing ? "close" : opening ? "open" : ""}`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-top">
          <h1 className="modal-header">Apply due</h1>
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
          <div className="field">
            <label htmlFor="due-tenant">Tenant</label>
            <select
              id="due-tenant"
              className="custom-select"
              value={selectedTenant ?? ""}
              onChange={(e) => {
                setSelectedTenant(Number(e.target.value));
                clearFieldError("tenant");
              }}
            >
              <option value="">Select tenant</option>
              {tenants.map((tenant) => (
                <option key={tenant.id} value={tenant.id}>
                  {tenant.first_name + " " + tenant.last_name}
                </option>
              ))}
            </select>
            {error?.tenant && (
              <div className="error-container">{error.tenant}</div>
            )}
          </div>

          <div className="field">
            <label htmlFor="due-type">Due type</label>
            <select
              id="due-type"
              className="custom-select"
              value={selectedDueType}
              onChange={(e) => {
                setSelectedDueType(e.target.value);
                clearFieldError("dueType");
              }}
            >
              <option value="">Select due type</option>
              <option value="rent">Rent</option>
              <option value="electricity">Electricity</option>
              <option value="security">Security</option>
            </select>
            {error?.dueType && (
              <div className="error-container">{error.dueType}</div>
            )}
          </div>

          <div className="field">
            <label htmlFor="due-amount">Due amount</label>
            <input
              id="due-amount"
              placeholder="e.g. 2500"
              value={dueAmount}
              onChange={(e) => {
                setDueAmount(e.target.value);
                clearFieldError("dueAmount");
              }}
            />
            {error?.dueAmount && (
              <div className="error-container">{error.dueAmount}</div>
            )}
          </div>

          <div className="field">
            <label htmlFor="due-date">Due date</label>
            <input
              id="due-date"
              type="date"
              value={dueDate}
              onChange={(e) => {
                setDueDate(e.target.value);
                clearFieldError("dueDate");
              }}
            />
            {error?.dueDate && (
              <div className="error-container">{error.dueDate}</div>
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
              loadingText="Applying due"
              children="Apply due"
              type="submit"
            />
          </div>
        </form>
      </div>
    </div>
  );
}

export default AddDueModal;
