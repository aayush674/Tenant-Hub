import { useEffect, useState, useCallback } from "react";
import { authFetch } from "../../api/apiClient";
import "../../styles/addDue.css";
// import ConfirmModal from "../common/confirmationModal";
// import { validateRoomCapacity, validateRoomNumber, validateRoomRent } from "../../utils/roomValidation";
import LoadingSubmitButton from "../common/loadingSubmitButton";
import { toast } from "react-toastify";

function AddDueModal({ pgId, onAdd, onClose }) {


    const [tenants, setTenants] = useState([]);
    const [closing, setClosing] = useState(false);
    const [opening, setOpening] = useState(false);
    const [selectedTenant, setSelectedTenant] = useState(null);
    const [selectedDueType, setSelectedDueType] = useState("");
    const [dueAmount, setDueAmount] = useState("");
    const [dueDate, setDueDate] = useState("");
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
    }, [pgId]);

    const handleSubmit = async (e) => {
        e.preventDefault();

        // const rnError = validateRoomNumber(roomNumber);
        // const rcError = validateRoomCapacity(roomCapacity);
        // const rrError = validateRoomRent(roomRent);
        // const finalError = {}

        // if (rnError) {
        //     finalError.roomNumber = rnError;
        // }
        // if (rcError) {
        //     finalError.roomCapacity = rcError;
        // }
        // if (rrError) {
        //     finalError.roomRent = rrError;
        // }
        // if (Object.keys(finalError).length > 0) {
        //     setError(finalError);
        //     return;
        // }


        setError({});
        try {
            setLoading(true);
            const res = await authFetch("http://localhost:8000/api/dues/", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    tenant: selectedTenant,
                    due_type: selectedDueType,
                    due_amount: Number(dueAmount),
                    due_date: dueDate
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
            toast.success("Due Applied successfully.");
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
        setSelectedDueType("");
        setSelectedTenant(null);
        handleClose();
    };

    useEffect(() => {
        fetchTenants();
    }, [fetchTenants])

    return (
        <div className="add-due-modal-overlay" onClick={handleClose}>
            <div
                className={`add-due-modal-box ${closing ? "close" : opening ? "open" : ""
                    }`}
                onClick={(e) => e.stopPropagation()}
            >
                <h1 className="modal-header">Apply Due</h1>

                <form onSubmit={handleSubmit}>

                    <div>Tenant</div>
                    <select onChange={(e) => setSelectedTenant(Number(e.target.value))} className="custom-select">
                        <option value={selectedTenant}>Select Tenant</option>
                        {tenants.map(tenant => (
                            <option key={tenant.id} value={tenant.id}>{tenant.first_name + " " + tenant.last_name}</option>
                        ))}
                    </select>
                    <br />

                    <div>Due Type</div>
                    <select onChange={(e) => setSelectedDueType(e.target.value)} className="custom-select">
                        <option value="">Select Due Type</option>
                        <option value="rent">Rent</option>
                        <option value="electricity">Electricity</option>
                    </select>
                    <br />

                    <div>Due Amount</div>
                    <input
                        placeholder="Enter Due Amount"
                        value={dueAmount}
                        onChange={e => {
                            setDueAmount(e.target.value);
                            // if (error?.roomRent) {
                            //     const newError = { ...error };
                            //     delete newError.roomRent;
                            //     setError(newError);
                            // }
                        }
                        }
                    />
                    {/* <div className="error-container">
                        {error?.roomRent}
                    </div> */}
                    {error?.detail && (
                        <div className="error-container">{error.detail}</div>
                    )}
                    <br />

                    <div>Due Date</div>
                    <input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />

                    {/* <button type="submit">Add Due</button> */}
                    <LoadingSubmitButton 
                        children="Apply Due"
                        loading={loading}
                        loadingText="Applying Due"
                        type="submit"
                    />
                    <button type="button" onClick={handleCancel}>Cancel</button>
                </form>
            </div>
        </div>
    )
}

export default AddDueModal;