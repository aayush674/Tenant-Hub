import { useEffect, useState } from "react";
import { authFetch } from "../../api/apiClient";
import "../../styles/tenant_styles/tenantPaymentModal.css";
import LoadingSubmitButton from "../common/loadingSubmitButton";
import { toast } from "react-toastify";
import { API_BASE_URL } from "../../config";

function TenantPaymentModal({ dueId, onAdd, onClose }) {
  const [due, setDue] = useState(null);
  const [closing, setClosing] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState("");
  const [error, setError] = useState({});
  const [loading, setLoading] = useState(false);
  const [dueLoading, setDueLoading] = useState(true);

  // Fetch the selected due
  useEffect(() => {
    const fetchDue = async () => {
      try {
        setDueLoading(true);
        setError({});

        const res = await authFetch(`${API_BASE_URL}/api/dues/${dueId}/`);

        if (!res.ok) {
          throw new Error("Failed to fetch due.");
        }

        const data = await res.json();
        setDue(data);
      } catch (err) {
        setError({
          detail: "Unable to load due details.",
        });
      } finally {
        setDueLoading(false);
      }
    };

    if (dueId) {
      fetchDue();
    }
  }, [dueId]);

  const handleClose = () => {
    setClosing(true);

    setTimeout(() => {
      onClose();
    }, 300);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError({});

    if (!due) {
      return;
    }

    const remainingAmount = Number(due.due_amount) - Number(due.paid_amount);

    const amount = Number(paymentAmount);

    // Frontend validation
    if (!paymentAmount || amount <= 1) {
      setError({
        amount: "Payment amount must be greater than 0.",
      });
      return;
    }

    if (amount > remainingAmount) {
      setError({
        amount: "Payment amount cannot exceed the current due.",
      });
      return;
    }

    try {
      setLoading(true);

      const res = await authFetch(`${API_BASE_URL}/api/payments/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          due: dueId,
          amount: Number(paymentAmount),
          payment_method: "online",
          payment_date: new Date().toISOString().split("T")[0],
        }),
      });

      if (!res.ok) {
        const errData = await res.json();

        setError(errData);
        console.log(errData);

        return;
      }

      const data = await res.json();
      toast.success("Payment completed successfully.");

      onAdd(data);
    } catch (err) {
      setError({
        detail: "Something went wrong. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  const formatWithCommas = (value) =>{
    if(!value) return "";
    const [intPart, decPart] = value.split(".");
    const formattedInt = Number(intPart).toLocaleString("en-IN");
    return decPart !== undefined ? `${formattedInt}.${decPart}` : formattedInt;
  }

  const stripCommas = (value) => value.replace(/,/g, "");


  const handleCancel = () => {
    handleClose();
  };

  const remainingAmount = due
    ? Number(due.due_amount) - Number(due.paid_amount)
    : 0;

  return (
    <div className="tenant-payment-modal-overlay" onClick={handleClose}>
      <div
        className={`tenant-payment-modal-box ${closing ? "close" : "open"}`}
        onClick={(e) => e.stopPropagation()}
      >
        <h1 className="tenant-payment-modal-header">Make Payment</h1>

        {dueLoading ? (
          <div className="tenant-payment-modal-loading">
            Loading due details...
          </div>
        ) : (
          <form className="tenant-payment-form" onSubmit={handleSubmit}>
            {/* Remaining Amount */}
            <div className="tenant-payment-form-group">
              <label className="tenant-payment-label">Remaining Amount</label>

              <input
                className="tenant-payment-input tenant-payment-input-disabled"
                type="text"
                value={`₹${remainingAmount.toLocaleString("en-IN", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}`}
                disabled
                readOnly
              />
            </div>

            {/* Payment Amount */}
            <div className="tenant-payment-form-group">
              <label className="tenant-payment-label">Payment Amount</label>

              <input
                className="tenant-payment-input"
                type="text"
                inputMode="decimal"
                placeholder="Enter Payment Amount"
                value={formatWithCommas(paymentAmount)}
                onChange={(e) => {
                  const raw = stripCommas(e.target.value);

                  if (raw === "" || /^\d*\.?\d{0,2}$/.test(raw)){
                    setPaymentAmount(raw);
                  }
                  if (error?.amount) {
                    const newError = {
                      ...error,
                    };

                    delete newError.amount;
                    setError(newError);
                  }
                }}
                min="1"
                step="0.01"
              />

              {error?.amount && (
                <div className="tenant-payment-error">{error.amount}</div>
              )}
            </div>

            {error?.detail && (
              <div className="tenant-payment-error">{error.detail}</div>
            )}

            <div className="tenant-payment-actions">
              <LoadingSubmitButton
                loading={loading}
                loadingText="Creating Payment"
                children="Create Payment"
                type="submit"
              />

              <button
                type="button"
                className="tenant-payment-cancel-btn"
                onClick={handleCancel}
              >
                Cancel
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

export default TenantPaymentModal;
