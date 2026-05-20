import { useEffect, useState } from "react";
import { authFetch } from "../api/apiClient";
import "../styles/addTenant.css";
import ConfirmModal from "./confirmationModal";
// import { validateRoomCapacity, validateRoomNumber, validateRoomRent } from "../utils/roomValidation";

function AddTenantModal({ pgId, onAdd, onClose }) {

    const [tenantName, setTenantName] = useState("");
    const [tenantRoom, setTenantRoom] = useState("");
    const [tenantEmail, setTenantEmail] = useState("");
    const [tenantPhone, setTenantPhone] = useState("");
    const [tenantJoinDate, setTenantJoinDate] = useState(
        new Date().toLocaleDateString("en-CA")
    );
    const [closing, setClosing] = useState(false);
    // const [selectedRoomType, setSelectedRoomType] = useState(null);
    const [rooms, setRooms] = useState([]);
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchRooms();
    }, [])

    // useEffect(() => {
    //     if (selectedRoomType) {
    //         setShowConfirmModal(true);
    //     }
    // }, [selectedRoomType])

    const handleClose = () => {
        setClosing(true);

        setTimeout(() => {
            onClose();
        }, 300); // must match CSS transition

    };

    const fetchRooms = async () => {
        const res = await authFetch(`http://localhost:8000/api/rooms/?pg_property=${pgId}`);
        if (!res.ok) {
            throw new Error("Failed to fetch rooms");
        }
        const data = await res.json();
        setRooms(data);
    }

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
            const res = await authFetch("http://localhost:8000/api/tenants/", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    // pg_property: pgId,
                    room: tenantRoom,
                    name: tenantName,
                    email: tenantEmail,
                    phone_number: tenantPhone,
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
        }
        catch (err) {
            setError({ detail: "Something went wrong. Please try again." });
        }
    }

    // const handleUpdate = async (e) => {
    //     e.preventDefault();
    //     const selected = rooms.find(rt => rt.id === selectedRoomType);
    //     if (!selected) return;

    //     setCapacity(selected.capacity);
    //     setRent(selected.rent);
    //     setRoomBalcony(selected.is_balcony_room);
    //     setShowConfirmModal(false);
    //     let newError = { ...error };
    //     if (newError.roomCapacity) {
    //         delete newError.roomCapacity;
    //     }
    //     if (newError.roomRent) {
    //         delete newError.roomRent;
    //     }
    //     setError(newError);
    // }

    const handleCancel = () => {
        setShowConfirmModal(false);
        // setSelectedRoomType(null);
    };

    return (
        <div className="add-tenant-modal-overlay">
            <div
                className={`add-tenant-modal-box ${closing ? "close" : "open"}`}
                onClick={(e) => e.stopPropagation()}
            >
                <h1 className="modal-header">Add Tenant</h1>

                <form onSubmit={handleSubmit}>
                    <div>Tenant Name</div>
                    <input
                        placeholder="Enter Tenant Name"
                        value={tenantName}
                        onChange={e => {
                            setTenantName(e.target.value);
                            // if (error?.roomNumber) {
                            //     const newError = { ...error };
                            //     delete newError.roomNumber;
                            //     setError(newError);
                            // }
                        }}
                    />
                    <div className="error-container">
                        {error?.name}
                    </div>

                    <div>Alloted Room</div>
                    <select
                        onChange={(e) => setTenantRoom(Number(e.target.value))} 
                        className="custom-select">
                        <option value="">Select Room</option>
                        {rooms.map(room => (
                            <option key={room.id} value={room.id}>{room.room_number}</option>
                        ))}
                    </select>
                    <br />

                    {/* <ConfirmModal
                        show={showConfirmModal}
                        title={"Are you Sure?"}
                        message={" Room Configuration will be updated to Room Template configuration if you have already entered. Are you sure you want to update Configuration?"}
                        onConfirm={handleUpdate}
                        onCancel={handleCancel}
                    /> */}


                    <div>Tenant Email</div>
                    <input
                        placeholder="Enter Tenant Email"
                        value={tenantEmail}
                        onChange={e => {
                            setTenantEmail(e.target.value);
                            //  if (error?.roomRent) {
                            //     const newError = { ...error };
                            //     delete newError.roomRent;
                            //     setError(newError);
                            // }
                        }
                        }
                    />
                    <div className="error-container">
                        {error?.email}
                    </div>

                    <div>Tenant Phone Number</div>
                    <input
                        placeholder="Enter Tenant Phone Number"
                        value={tenantPhone}
                        onChange={e => {
                            setTenantPhone(e.target.value);
                            //  if (error?.roomRent) {
                            //     const newError = { ...error };
                            //     delete newError.roomRent;
                            //     setError(newError);
                            // }
                        }
                        }
                    />
                    <div className="error-container">
                        {error?.phone}
                    </div>
                    <div>Joining Date</div>

                    <input type="date" value={tenantJoinDate} onChange={(e)=> setTenantJoinDate(e.target.value)}/>
                    <div className="error-container">
                        {error?.join_date}
                    </div>
                    {error?.detail && (
                        <div className="error-container">{error.detail}</div>
                    )}

                    <button type="submit">Add Tenant</button>
                    <button type="button" onClick={handleClose}>Cancel</button>
                </form>
            </div>
        </div>
    )
}

export default AddTenantModal;