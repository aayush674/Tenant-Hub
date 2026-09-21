import { useEffect, useState, useCallback } from "react";
import { authFetch } from "../../api/apiClient";
import LoadingSubmitButton from "../common/loadingSubmitButton";
import { toast } from "react-toastify";
import { API_BASE_URL } from "../../config";
import "../../styles/addRefund.css";

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
    console.log("DUES RESPONSE:", data);
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
      onClose();
    }, 300); // must match CSS transition
  };

  const handleCancel = () => {
    setSelectedTenant(null);
    handleClose();
  };

  useEffect(()=>{
    if(selectedTenant){
      fetchDues();
    }
    else{
      setDues([]);
      setRefundableAmount(0);
    }
  }, [selectedTenant, fetchDues]);

  useEffect(() => {
    fetchTenants();
  }, [fetchTenants]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!selectedTenant) {
      setError({ detail: "Please select a tenant." });
      return;
    }
    if (!refundAmount || Number(refundAmount) <= 0) {
      setError({ detail: "Please enter a valid refund amount." });
      return;
    }

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
      toast.success("Refund created successfully");
      onAdd(data);
      handleClose();
    } catch (err) {
      setError({ detail: err.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="add-refund-modal-overlay" onClick={handleClose}>
      <div
        className={`add-refund-modal-box ${
          closing ? "close" : opening ? "open" : ""
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        <h1 className="modal-header">Create Refund</h1>

        <form onSubmit={handleSubmit}>
          <div>Tenant</div>
          <select
            onChange={(e) => setSelectedTenant(Number(e.target.value))}
            className="custom-select"
          >
            <option value={selectedTenant}>Select Tenant</option>
            {tenants.map((tenant) => (
              <option key={tenant.id} value={tenant.id}>
                {tenant.first_name + " " + tenant.last_name}
              </option>
            ))}
          </select>
          <br />

          <div>Refundable Amount</div>
          <input
            value={refundableAmount}
            disabled
            onChange={(e) => {
              setRefundableAmount(e.target.value);
            }}
          />
          <br />

          <div>Refund Amount</div>
          <input
            placeholder="Enter Amount"
            value={refundAmount}
            onChange={(e) => {
              setRefundAmount(e.target.value);
            }}
          />
          {error?.detail && (
            <div className="error-container">{error.detail}</div>
          )}
          <br />

          <LoadingSubmitButton
            children="Create Refund"
            loading={loading}
            loadingText="Creating Refund"
            type="submit"
          />
          <button type="button" onClick={handleCancel}>
            Cancel
          </button>
        </form>
      </div>
    </div>
  );
}

export default AddRefundModal;
