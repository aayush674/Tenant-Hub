import { useEffect, useState, useCallback } from "react";
import { authFetch } from "../../api/apiClient";
import LoadingSubmitButton from "../common/loadingSubmitButton";
import { toast } from "react-toastify";
import { API_BASE_URL } from "../../config";
import "../../styles/addRefund.css";
import { FaTimes } from "react-icons/fa";

function AddRefundModal({ pgId, onAdd, onClose }) {
  const [tenants, setTenants] = useState([]);
  const [closing, setClosing] = useState(false);
  const [opening, setOpening] = useState(false);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [selectedTenant, setSelectedTenant] = useState(null);
  const [refundableAmount, setRefundableAmount] = useState(0);
  const [refundAmount, setRefundAmount] = useState("");
  const [dues, setDues] = useState([]);

  useEffect(() => {
    requestAnimationFrame(() => {
      setOpening(true);
    });
  }, []);

  const resetForm = () => {
    setSelectedTenant(null);
    setRefundAmount("");
    setDues([]);
    setRefundableAmount(0);
    setError(null);
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

  const fetchDues = useCallback(async () => {
    const res = await authFetch(
      `${API_BASE_URL}/api/dues/?tenant=${selectedTenant}`,
    );
    if (!res.ok) {
      throw new Error("Failed to fetch Dues");
    }
    const data = await res.json();
    setDues(data.results ?? data);
  }, [selectedTenant]);

  useEffect(() => {
    const total = dues.reduce(
      (sum, due) => sum + (Number(due.refundable_balance) || 0),
      0,
    );
    setRefundableAmount(total);
  }, [dues]);

  const handleClose = () => {
    setClosing(true);
    setTimeout(() => {
      resetForm();
      onClose();
    }, 300); // must match CSS transition
  };

  const handleCancel = () => {
    handleClose();
  };

  const clearFieldError = (field) => {
    if (error?.[field]) {
      const newError = { ...error };
      delete newError[field];
      setError(newError);
    }
  };

  useEffect(() => {
    if (selectedTenant) {
      fetchDues();
    } else {
      setDues([]);
      setRefundableAmount(0);
    }
  }, [selectedTenant, fetchDues]);

  useEffect(() => {
    fetchTenants();
  }, [fetchTenants]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const finalError = {};
    if (!selectedTenant) finalError.tenant = "Please select a tenant.";
    if (!refundAmount || Number(refundAmount) <= 0)
      finalError.refundAmount = "Enter a valid amount.";

    if (Object.keys(finalError).length > 0) {
      setError(finalError);
      return;
    }

    setError({});
    setLoading(true);
    try {
      const res = await authFetch(`${API_BASE_URL}/api/refunds/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tenant: selectedTenant,
          amount: refundAmount,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.detail || "Failed to create refund");
      }

      const data = await res.json();
      toast.success("Refund created successfully.");
      onAdd(data);
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
    <div className="add-refund-modal-overlay" onClick={handleClose}>
      <div
        className={`add-refund-modal-box ${closing ? "close" : opening ? "open" : ""}`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-top">
          <h1 className="modal-header">Create refund</h1>
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
            <label htmlFor="refund-tenant">Tenant</label>
            <select
              id="refund-tenant"
              className="custom-select"
              value={selectedTenant ?? ""}
              onChange={(e) => {
                setSelectedTenant(
                  e.target.value ? Number(e.target.value) : null,
                );
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
            <label htmlFor="refundable-amount">Refundable amount</label>
            <input id="refundable-amount" value={refundableAmount} disabled />
          </div>

          <div className="field">
            <label htmlFor="refund-amount">Refund amount</label>
            <input
              id="refund-amount"
              placeholder="e.g. 1500"
              value={refundAmount}
              onChange={(e) => {
                setRefundAmount(e.target.value);
                clearFieldError("refundAmount");
              }}
            />
            {error?.refundAmount && (
              <div className="error-container">{error.refundAmount}</div>
            )}
          </div>

          {error?.detail && (
            <div className="error-container">{error.detail}</div>
          )}

          <div className="modal-actions">
            <button
              type="button"
              className="btn-secondary"
              onClick={handleCancel}
            >
              Cancel
            </button>
            <LoadingSubmitButton
              loading={loading}
              loadingText="Creating refund"
              children="Create refund"
              type="submit"
            />
          </div>
        </form>
      </div>
    </div>
  );
}

export default AddRefundModal;
