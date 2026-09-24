import { useEffect, useState, useCallback } from "react";
import { authFetch } from "../../api/apiClient";
import "../../styles/addDue.css";
import LoadingSubmitButton from "../common/loadingSubmitButton";
import { toast } from "react-toastify";
import { API_BASE_URL } from "../../config";
import { FaTimes } from "react-icons/fa";

const DUE_TYPE_LABELS = {
  rent: "Rent",
  electricity: "Electricity",
  security: "Security",
};

const DUE_STATUS_LABELS = {
  pending: "Pending",
  partial: "Partially paid",
  paid: "Paid",
  overdue: "Overdue",
};

function AddPaymentModal({ pgId, onAdd, onClose }) {
  const [tenants, setTenants] = useState([]);
  const [dues, setDues] = useState([]);
  const [closing, setClosing] = useState(false);
  const [opening, setOpening] = useState(false);
  const [selectedTenant, setSelectedTenant] = useState(null);
  const [selectedDue, setSelectedDue] = useState({});
  const [paymentAmount, setPaymentAmount] = useState("");
  const [paymentDate, setPaymentDate] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    requestAnimationFrame(() => {
      setOpening(true);
    });
  }, []);

  const resetForm = () => {
    setSelectedTenant(null);
    setSelectedDue({});
    setDues([]);
    setPaymentAmount("");
    setPaymentDate("");
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
    if (!selectedDue.id) finalError.due = "Please select a due.";
    if (!paymentAmount || Number(paymentAmount) <= 0)
      finalError.paymentAmount = "Enter a valid amount.";
    if (!paymentDate) finalError.paymentDate = "Please select a date.";
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
      const res = await authFetch(`${API_BASE_URL}/api/payments/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          due: selectedDue.id,
          payment_method: "Cash",
          amount: Number(paymentAmount),
          payment_date: paymentDate,
        }),
      });

      if (!res.ok) {
        const errData = await res.json();
        setError(errData);
        return;
      }
      const data = await res.json();
      onAdd(data);
      toast.success("Payment created successfully.");
    } catch (err) {
      setError({ detail: "Something went wrong. Please try again." });
    } finally {
      setLoading(false);
    }
  };

  const handleTenantChange = async (e) => {
    const tenantId = e.target.value;
    setSelectedTenant(tenantId ? Number(tenantId) : null);
    setSelectedDue({});
    clearFieldError("tenant");

    if (!tenantId) {
      setDues([]);
      return;
    }
    const response = await authFetch(
      `${API_BASE_URL}/api/dues/?tenant=${tenantId}&exclude_status=paid`,
    );
    const data = await response.json();
    setDues(data);
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
          <h1 className="modal-header">Create payment</h1>
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
            <label htmlFor="payment-tenant">Tenant</label>
            <select
              id="payment-tenant"
              className="custom-select"
              value={selectedTenant ?? ""}
              onChange={handleTenantChange}
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
            <label htmlFor="payment-due">Due</label>
            <select
              id="payment-due"
              className="custom-select"
              style={{ fontFamily: "monospace" }}
              value={selectedDue.id || ""}
              onChange={(e) => {
                const due = dues.find((d) => d.id === Number(e.target.value));
                setSelectedDue(due || {});
                clearFieldError("due");
              }}
            >
              {dues.length > 0 ? (
                <>
                  <option value="">Select due</option>
                  {dues.map((due) => (
                    <option key={due.id} value={due.id}>
                      {`${DUE_TYPE_LABELS[due.due_type].padEnd(20)} | ₹${String(
                        due.due_amount,
                      ).padEnd(20)} | ${DUE_STATUS_LABELS[due.status]}`}
                    </option>
                  ))}
                </>
              ) : (
                <option value="" disabled>
                  Select due
                </option>
              )}
            </select>
            {error?.due && <div className="error-container">{error.due}</div>}
          </div>

          <div className="field">
            <label htmlFor="remaining-amount">Remaining amount</label>
            <input
              id="remaining-amount"
              value={
                selectedDue.id
                  ? selectedDue.due_amount - selectedDue.paid_amount
                  : "N/A"
              }
              disabled
            />
          </div>

          <div className="field">
            <label htmlFor="payment-amount">Payment amount</label>
            <input
              id="payment-amount"
              placeholder="e.g. 2500"
              value={paymentAmount}
              onChange={(e) => {
                setPaymentAmount(e.target.value);
                clearFieldError("paymentAmount");
              }}
            />
            {error?.paymentAmount && (
              <div className="error-container">{error.paymentAmount}</div>
            )}
          </div>

          <div className="field">
            <label htmlFor="payment-date">Payment date</label>
            <input
              id="payment-date"
              type="date"
              value={paymentDate}
              onChange={(e) => {
                setPaymentDate(e.target.value);
                clearFieldError("paymentDate");
              }}
            />
            {error?.paymentDate && (
              <div className="error-container">{error.paymentDate}</div>
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
              loadingText="Creating payment"
              children="Create payment"
              type="submit"
            />
          </div>
        </form>
      </div>
    </div>
  );
}

export default AddPaymentModal;
