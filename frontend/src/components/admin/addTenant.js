import { useEffect, useState, useCallback } from "react";
import { authFetch } from "../../api/apiClient";
import "../../styles/addTenant.css";
import TenantForm from "./tenantForm";
import {
  validateEmail,
  validatePhoneNumber,
  validateName,
  validateRoom,
  validateDate,
} from "../../utils/tenantValidation";
import { toast } from "react-toastify";
import LoadingSubmitButton from "../common/loadingSubmitButton";
import { API_BASE_URL } from "../../config";
import { FaTimes } from "react-icons/fa";

function AddTenantModal({ pgId, onAdd, onClose }) {
  const [tenantName, setTenantName] = useState("");
  const [lastName, setLastName] = useState("");
  const [tenantRoom, setTenantRoom] = useState("");
  const [tenantEmail, setTenantEmail] = useState("");
  const [tenantPhone, setTenantPhone] = useState("91-");
  const [phoneCode, phoneNumber] = tenantPhone.split("-");
  const [tenantJoinDate, setTenantJoinDate] = useState(
    new Date().toLocaleDateString("en-CA"),
  );
  const [closing, setClosing] = useState(false);
  const [opening, setOpening] = useState(false);
  const [rooms, setRooms] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    requestAnimationFrame(() => {
      setOpening(true);
    });
  }, []);

  const resetForm = () => {
    setTenantName("");
    setLastName("");
    setTenantRoom("");
    setTenantEmail("");
    setTenantPhone("91-");
    setTenantJoinDate(new Date().toLocaleDateString("en-CA"));
    setError(null);
  };

  const handleClose = () => {
    setClosing(true);
    setTimeout(() => {
      resetForm();
      onClose();
    }, 300); // must match CSS transition
  };

  const fetchRooms = useCallback(async () => {
    const res = await authFetch(
      `${API_BASE_URL}/api/rooms/?pg_property=${pgId}`,
    );
    if (!res.ok) {
      throw new Error("Failed to fetch rooms");
    }
    const data = await res.json();
    setRooms(data);
  }, [pgId]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const fnError = validateName(tenantName);
    const lnError = validateName(lastName);
    const emailError = validateEmail(tenantEmail);
    const phoneError = validatePhoneNumber(tenantPhone);
    const roomError = validateRoom(tenantRoom);
    const join_dateError = validateDate(tenantJoinDate);
    const finalError = {};

    if (fnError) finalError.first_name = fnError;
    if (lnError) finalError.last_name = lnError;
    if (emailError) finalError.email = emailError;
    if (phoneError) finalError.phone_number = phoneError;
    if (roomError) finalError.room = roomError;
    if (join_dateError) finalError.join_date = join_dateError;

    if (Object.keys(finalError).length > 0) {
      setError(finalError);
      return;
    }

    setError({});
    try {
      setLoading(true);
      const res = await authFetch(`${API_BASE_URL}/api/tenants/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          room: tenantRoom,
          first_name: tenantName,
          last_name: lastName,
          email: tenantEmail,
          phone_country_code: `+${phoneCode}`,
          phone_number: phoneNumber,
          join_date: tenantJoinDate,
        }),
      });

      if (!res.ok) {
        const errData = await res.json();
        setError(errData);
        return;
      }
      const data = await res.json();
      onAdd(data);
      toast.success(
        "Tenant created successfully. Email has been sent for account activation.",
      );
    } catch (err) {
      setError({ detail: "Something went wrong. Please try again." });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRooms();
  }, [fetchRooms]);

  return (
    <div className="add-tenant-modal-overlay" onClick={handleClose}>
      <div
        className={`add-tenant-modal-box ${closing ? "close" : opening ? "open" : ""}`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-top">
          <h1 className="modal-header">Add tenant</h1>
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
          <TenantForm
            tenantName={tenantName}
            setTenantName={setTenantName}
            lastName={lastName}
            setLastName={setLastName}
            tenantRoom={tenantRoom}
            setTenantRoom={setTenantRoom}
            tenantEmail={tenantEmail}
            setTenantEmail={setTenantEmail}
            tenantPhone={tenantPhone}
            setTenantPhone={setTenantPhone}
            phoneCode={phoneCode}
            phoneNumber={phoneNumber}
            tenantJoinDate={tenantJoinDate}
            setTenantJoinDate={setTenantJoinDate}
            rooms={rooms}
            error={error}
            setError={setError}
          />

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
              children="Add tenant"
              loadingText="Adding tenant"
              type="submit"
            />
          </div>
        </form>
      </div>
    </div>
  );
}

export default AddTenantModal;
