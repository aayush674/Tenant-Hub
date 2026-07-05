import { useEffect, useState, useCallback } from "react";
import { authFetch } from "../../api/apiClient";
import "../../styles/addTenant.css";
import TenantForm from "./tenantForm";
import { validateEmail, validatePhoneNumber, validateName, validateRoom, validateDate } from "../../utils/tenantValidation";

function EditTenantModal({ tenant, pgId, onEdit, onClose }) {

    const [tenantName, setTenantName] = useState(tenant.first_name);
    const [lastName, setLastName] = useState(tenant.last_name);
    const [tenantRoom, setTenantRoom] = useState(tenant.room);
    const [tenantEmail, setTenantEmail] = useState(tenant.email);
    const [tenantPhone, setTenantPhone] = useState(`${tenant.phone_country_code.replace('+', '')}-${tenant.phone_number}`); 
    const [phoneCode, phoneNumber] = tenantPhone.split('-');
    const [tenantJoinDate, setTenantJoinDate] = useState(tenant.join_date);
    const [closing, setClosing] = useState(false);
    const [opening, setOpening] = useState(false);
    const [rooms, setRooms] = useState([]);
    const [error, setError] = useState(null);

    const handleClose = () => {
        setClosing(true);

        setTimeout(() => {
            onClose();
        }, 300); // must match CSS transition

    };

    useEffect(() => {
        requestAnimationFrame(() => {
            setOpening(true);
        });
    }, []);

    const fetchRooms = useCallback(async () => {
        const res = await authFetch(`http://localhost:8000/api/rooms/?pg_property=${pgId}`);
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
        const finalError = {}

        if (fnError) {
            finalError.first_name = fnError;
        }
        if (lnError) {
            finalError.last_name = lnError;
        }
        if (emailError) {
            finalError.email = emailError;
        }
        if (phoneError) {
            finalError.phone_number = phoneError;
        }
        if (roomError) {
            finalError.room = roomError;
        }
        if (join_dateError) {
            finalError.join_date = join_dateError;
        }
        if (Object.keys(finalError).length > 0) {
            setError(finalError);
            return;
        }
        setError({});
        try {
            const res = await authFetch(`http://localhost:8000/api/tenants/${tenant.id}/`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    // pg_property: pgId,
                    room: tenantRoom,
                    first_name: tenantName,
                    last_name: lastName,
                    email: tenantEmail,
                    phone_country_code: phoneCode,
                    phone_number: phoneNumber,
                    join_date: tenantJoinDate
                })
            });

            if (!res.ok) {
                const errData = await res.json();
                setError(errData);
                console.log(errData);
                return;
            }
            const data = await res.json();
            onEdit(data);
        }
        catch (err) {
            setError({ detail: "Something went wrong. Please try again." });
        }
    }

    useEffect(() => {
        fetchRooms();
    }, [fetchRooms])

    return (
        <div className="add-tenant-modal-overlay" onClick={handleClose}>
            <div
                className={`add-tenant-modal-box ${closing ? "close" : opening ? "open" : ""
                    }`}
                onClick={(e) => e.stopPropagation()}
            >
                <h1 className="modal-header">Edit Tenant</h1>

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

                    <button type="submit">Save Tenant</button>
                    <button type="button" onClick={handleClose}>Cancel</button>
                </form>
            </div>
        </div>
    )
}

export default EditTenantModal;