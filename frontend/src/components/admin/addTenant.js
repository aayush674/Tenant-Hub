import { useEffect, useState, useCallback } from "react";
import { authFetch } from "../../api/apiClient";
import "../../styles/addTenant.css";
import TenantForm from "./tenantForm";
import { validateEmail, validatePhoneNumber, validateName, validateRoom, validateDate } from "../../utils/tenantValidation";
import { toast } from "react-toastify";

function AddTenantModal({ pgId, onAdd, onClose }) {

    const [tenantName, setTenantName] = useState("");
    const [lastName, setLastName] = useState("");
    const [tenantRoom, setTenantRoom] = useState("");
    const [tenantEmail, setTenantEmail] = useState("");
    const [tenantPhone, setTenantPhone] = useState("91-");
    const [phoneCode, phoneNumber] = tenantPhone.split('-');
    const [tenantJoinDate, setTenantJoinDate] = useState(
        new Date().toLocaleDateString("en-CA")
    );
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
            const res = await authFetch("http://localhost:8000/api/tenants/", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    // pg_property: pgId,
                    room: tenantRoom,
                    first_name: tenantName,
                    last_name: lastName,
                    email: tenantEmail,
                    phone_country_code:`+${phoneCode}`,
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
            onAdd(data);
            toast.success("Tenant Created Successfully. Email has been sent for account activation.");
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
                <h1 className="modal-header">Add Tenant</h1>

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

                    <button type="submit">Add Tenant</button>
                    <button type="button" onClick={handleClose}>Cancel</button>
                </form>
            </div>
        </div>
    )
}

export default AddTenantModal;