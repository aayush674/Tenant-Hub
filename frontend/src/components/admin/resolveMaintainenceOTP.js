import { useState } from "react";
// import { authFetch } from "../../api/apiClient";
import "../../styles/otpVerify.css";
import LoadingSubmitButton from "../common/loadingSubmitButton";
// import { toast } from "react-toastify";
// import { API_BASE_URL } from "../../config";

function ResolveMaintainenceOTP({ onResolved, onClose }) {
  const [closing, setClosing] = useState(false);
  const [otp, setotp] = useState("");
  const [error, setError] = useState({});
  const [loading, setLoading] = useState(false);

  // Fetch the selected due
  const handleClose = () => {
    setClosing(true);
    setTimeout(() => {
      onClose();
    }, 300);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError({});

    try {
      setLoading(true);
      onResolved(otp);
    } catch (err) {
      setError({
        detail: "Something went wrong. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    handleClose();
  };

  return (
    <div className="otp-verify-modal-overlay" onClick={handleClose}>
      <div
        className={`otp-verify-modal-box ${closing ? "close" : "open"}`}
        onClick={(e) => e.stopPropagation()}
      >
        <h1 className="otp-verify-modal-header">Verify resolution</h1>

        {/* {dueLoading ? (
          <div className="otp-verify-modal-loading">
            Loading due details...
          </div>
        ) : ( */}
        <form className="otp-verify-form" onSubmit={handleSubmit}>
          <div className="otp-verify-form-group">
            <label className="otp-verify-label">Enter OTP</label>
            <input
              className="otp-verify-input"
              type="text"
              placeholder="Enter OTP"
              onChange={(e) => {
                setotp(e.target.value);
                if (error?.amount) {
                  const newError = {
                    ...error,
                  };

                  delete newError.amount;
                  setError(newError);
                }
              }}
            />

            {error?.otp && <div className="otp-verify-error">{error.otp}</div>}
          </div>

          {error?.detail && (
            <div className="otp-verify-error">{error.detail}</div>
          )}

          <div className="otp-verify-actions">
            <button
              type="button"
              className="otp-verify-cancel-btn"
              onClick={handleCancel}
            >
              Cancel
            </button>
            <LoadingSubmitButton
              loading={loading}
              loadingText="Submitting"
              children="Submit"
              type="submit"
              class="otp-verify-submit-button"
            />
          </div>
        </form>
        {/* )} */}
      </div>
    </div>
  );
}

export default ResolveMaintainenceOTP;
