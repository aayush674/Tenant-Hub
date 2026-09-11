import { useCallback, useEffect, useState } from "react";
import { authFetch } from "../../api/apiClient";
import { API_BASE_URL } from "../../config";
import "../../styles/tenant_styles/tenantDues.css";

function TenantDues() {
  const [dues, setDues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchDues = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const res = await authFetch(`${API_BASE_URL}/api/dues/`);

      if (!res.ok) {
        throw new Error("Failed to fetch dues");
      }

      const data = await res.json();
      setDues(data);
    } catch (err) {
      setError("Unable to load your dues.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDues();
  }, [fetchDues]);

  const totalOutstanding = dues.reduce((total, due) => {
    const dueAmount = Number(due.due_amount);
    const paidAmount = Number(due.paid_amount);

    return total + (dueAmount - paidAmount);
  }, 0);

  const formatAmount = (amount) => {
    return Number(amount).toLocaleString("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  const formatDueType = (type) => {
    return type.charAt(0).toUpperCase() + type.slice(1);
  };

  const formatStatus = (status) => {
    if (status === "partial") {
      return "Partially Paid";
    }

    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  if (loading) {
    return (
      <div className="tenant-dues-container">
        <div className="dues-loading">Loading your dues...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="tenant-dues-container">
        <div className="dues-error">{error}</div>
      </div>
    );
  }

  return (
    <div className="tenant-dues-container">
      <div className="tenant-dues-header">
        <h1>Dues and Payments</h1>
        <p>View your outstanding dues and payment status.</p>
      </div>

      <div className="total-dues-card">
        <div className="total-dues-label">Total Outstanding</div>

        <div className="total-dues-amount">
          ₹{formatAmount(totalOutstanding)}
        </div>
      </div>

      <div className="dues-section">
        <h2>Your Dues</h2>

        {dues.length === 0 ? (
          <div className="no-dues">You currently have no dues.</div>
        ) : (
          <div className="dues-list">
            {dues.map((due) => {
              const dueAmount = Number(due.due_amount);
              const paidAmount = Number(due.paid_amount);
              const remaining = dueAmount - paidAmount;

              return (
                <div className="due-card" key={due.id}>
                  <div className="due-card-header">
                    <div className="due-main-info">
                      <h3>{formatDueType(due.due_type)}</h3>

                      <span className="due-date">
                        Due Date:{" "}
                        {new Date(due.due_date).toLocaleDateString("en-IN")}
                      </span>
                    </div>

                    <span className={`due-status ${due.status}`}>
                      {formatStatus(due.status)}
                    </span>
                  </div>

                  <div className="due-details">
                    <div className="due-detail-item">
                      <span>Due Amount</span>
                      <strong>₹{formatAmount(dueAmount)}</strong>
                    </div>

                    <div className="due-detail-item">
                      <span>Paid</span>
                      <strong>₹{formatAmount(paidAmount)}</strong>
                    </div>

                    <div className="due-detail-item remaining">
                      <span>Remaining</span>
                      <strong>₹{formatAmount(remaining)}</strong>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default TenantDues;
