import { useEffect, useState, useCallback } from "react";
import { authFetch } from "../../api/apiClient";
import "../../styles/addDue.css";
// import ConfirmModal from "../common/confirmationModal";
// import { validateRoomCapacity, validateRoomNumber, validateRoomRent } from "../../utils/roomValidation";
import LoadingSubmitButton from "../common/loadingSubmitButton";
import { toast } from "react-toastify";

function AddPaymentModal({ pgId, onAdd, onClose }) {


    const [tenants, setTenants] = useState([]);
    const [dues, setDues] = useState([]);
    const [closing, setClosing] = useState(false);
    const [opening, setOpening] = useState(false);
    const [selectedTenant, setSelectedTenant] = useState(null);
    const [selectedDue, setSelectedDue] = useState({});
    const [paymentAmount, setPaymentAmount] = useState("");
    const [paymentDate, setPaymentDate] = useState("");
    // const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        requestAnimationFrame(() => {
            setOpening(true);
        });
    }, []);

    const handleClose = () => {
        setClosing(true);

        setTimeout(() => {
            onClose();
        }, 300); // must match CSS transition

    };

    const fetchTenants = useCallback(async () => {
        const res = await authFetch(`http://localhost:8000/api/tenants/?pg_property=${pgId}`);
        if (!res.ok) {
            throw new Error("Failed to fetch Tenants");
        }
        const data = await res.json();
        setTenants(data);
    },[pgId]);

    const handleSubmit = async (e) => {
        e.preventDefault();

        //     // const rnError = validateRoomNumber(roomNumber);
        //     // const rcError = validateRoomCapacity(roomCapacity);
        //     // const rrError = validateRoomRent(roomRent);
        //     // const finalError = {}

        //     // if (rnError) {
        //     //     finalError.roomNumber = rnError;
        //     // }
        //     // if (rcError) {
        //     //     finalError.roomCapacity = rcError;
        //     // }
        //     // if (rrError) {
        //     //     finalError.roomRent = rrError;
        //     // }
        //     // if (Object.keys(finalError).length > 0) {
        //     //     setError(finalError);
        //     //     return;
        //     // }


        setError({});
        try {
            setLoading(true);
            const res = await authFetch("http://localhost:8000/api/payments/", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    due: selectedDue.id,
                    payment_method: "Cash",
                    amount: Number(paymentAmount),
                    payment_date: paymentDate
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
            toast.success("Payment Created successfully.");
        }
        catch (err) {
            setError({ detail: "Something went wrong. Please try again." });
        }
        finally{
            setLoading(false);
        }
    }

    const handleCancel = () => {
        // setShowConfirmModal(false);
        setSelectedDue({});
        setSelectedTenant(null);
        handleClose();
    };

    const handleTenantChange = async (tenant) => {
        setSelectedTenant(tenant);
        if (!tenant) {
            setDues([]);
            return;
        }
        const response = await authFetch(`http://localhost:8000/api/dues/?tenant=${tenant.target.value}&exclude_status=paid`)
        const data = await response.json();
        setDues(data);
    }

    useEffect(() => {
        fetchTenants();
    }, [fetchTenants])

    const due_type_wrapper = {
        "rent": "Rent",
        "electricity": "Electricity"
    }

    const due_status_wrapper = {
        "pending": "Pending",
        "partial": "Partially Paid",
        "paid": "Paid",
        "overdue": "Overdue"
    }

    return (
        <div className="add-due-modal-overlay" onClick={handleClose}>
            <div
                className={`add-due-modal-box ${closing ? "close" : opening ? "open" : ""
                    }`}
                onClick={(e) => e.stopPropagation()}
            >
                <h1 className="modal-header">Create Payment</h1>

                <form onSubmit={handleSubmit}>

                    <div>Tenant</div>
                    <select onChange={handleTenantChange} className="custom-select">
                        <option value={selectedTenant}>Select Tenant</option>
                        {tenants.map(tenant => (
                            <option key={tenant.id} value={tenant.id}>{tenant.first_name + " " + tenant.last_name}</option>
                        ))}
                    </select>
                    <br />

                    <div>Dues</div>
                    <select
                        style={{ fontFamily: "monospace" }}
                        value={selectedDue.id || ""}
                        onChange={(e) => {
                            const due = dues.find(d => d.id === Number(e.target.value));
                            setSelectedDue(due || {})
                        }}
                        className="custom-select"
                    >
                        {dues.length > 0 ? (
                            <>
                                <option value="">Select Due</option>
                                {dues.map((due) => (
                                    <option key={due.id} value={due.id}>
                                        {`${due_type_wrapper[due.due_type].padEnd(20)} | ₹${String(due.due_amount).padEnd(20)} | ${due_status_wrapper[due.status]}`}
                                    </option>
                                ))}
                            </>
                        ) : (
                            <option value="" disabled>Select Due</option>
                        )}
                    </select>
                    <br />
                    <div>Remaining Amount</div>
                    <input
                        value = {selectedDue.id ? (selectedDue.due_amount - selectedDue.paid_amount) : "NA"}
                        disabled
                    />
                    <br />
                    <div>Payment Amount</div>
                    <input
                        placeholder="Enter Payment Amount"
                        value={paymentAmount}
                        onChange={e => {
                            setPaymentAmount(e.target.value);
                            // if (error?.roomRent) {
                            //     const newError = { ...error };
                            //     delete newError.roomRent;
                            //     setError(newError);
                            // }
                        }
                        }
                    />
                    <div className="error-container">
                        {/* {error?.roomRent} */}
                    </div>
                    {error?.detail && (
                        <div className="error-container">{error.detail}</div>
                    )}

                    <div>Payment Date</div>
                    <input type="date" value={paymentDate} onChange={(e) => setPaymentDate(e.target.value)} />

                    <LoadingSubmitButton 
                        loading={loading}
                        loadingText="Creating Payment"
                        children="Create Payment"
                        type="submit"
                    />
                    <button type="button" onClick={handleCancel}>Cancel</button>
                </form>
            </div>
        </div>
    )
}

export default AddPaymentModal;