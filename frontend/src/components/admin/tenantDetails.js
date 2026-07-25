import { useState, useCallback, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { authFetch } from "../../api/apiClient";
import { API_BASE_URL } from "../../config";
import { FaPen } from "react-icons/fa";
// import { validateRoomCapacity, validateRoomRent } from "../../utils/roomValidation";
import { validateEmail, validatePhoneNumber, validateName, validateDate, validateRoom } from "../../utils/tenantValidation";
import { toast } from "react-toastify";
import LoadingSubmitButton from "../common/loadingSubmitButton";
import "../../styles/tenantDetails.css"
import "../../styles/common_styles/navigator.css";
import { Country } from "country-state-city";


function TenantDetails() {
    const navigate = useNavigate();
    const { pgId, tenantId } = useParams();
    const [pgData, setPgData] = useState({});
    const [tenantData, setTenantData] = useState({});
    const [formData, setFormData] = useState({});
    const [editMode, setEditMode] = useState(false);
    const [error, setError] = useState({});
    const [loading, setLoading] = useState(false);
    // const [roomTenants, setRoomTenants] = useState([]);
    const [rooms, setRooms] = useState([]);
    const countries = Country.getAllCountries();

    const fetchPg = useCallback(async () => {
        const res = await authFetch(`${API_BASE_URL}/api/pgs/${pgId}/`);
        if (!res.ok) {
            throw new Error("Failed to fetch PG");
        }
        const data = await res.json();
        setPgData(data);
    }, [pgId]);

    const fetchCurrentTenant = useCallback(async () => {
        const res = await authFetch(`${API_BASE_URL}/api/tenants/${tenantId}`);
        if (!res.ok) {
            throw new Error("Failed to fetch Tenant");
        }
        const data = await res.json();
        setTenantData(data);
        setFormData(data);
    }, [tenantId]);

    const fetchRooms = useCallback(async () => {
        const res = await authFetch(`${API_BASE_URL}/api/rooms/?pg_property=${pgId}`);
        if (!res.ok) {
            throw new Error("Failed to fetch rooms");
        }
        const data = await res.json();
        setRooms(data);
    }, [pgId]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        const fnError = validateName(formData.first_name);
        const lnError = validateName(formData.last_name);
        const emailError = validateEmail(formData.email);
        const phoneError = validatePhoneNumber(formData.phone_country_code + "-" + formData.phone_number);
        const roomError = validateRoom(formData.room);
        const join_dateError = validateDate(formData.join_date);
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
            setLoading(true);
            const res = await authFetch(`${API_BASE_URL}/api/tenants/${tenantId}/`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(formData)
            });

            if (!res.ok) {
                const errData = await res.json();
                setError(errData);
                console.log(errData);
                return;
            }
            setEditMode(false);
            toast.success("Tenant updated successfully.");
        } catch (err) {
            setError({ detail: "Something went wrong. Please try again." });
        }
        finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        fetchPg();
        fetchCurrentTenant();
        // fetchRoomTenants();
        fetchRooms();
    }, [fetchCurrentTenant, fetchPg, fetchRooms])

    console.log(countries);
    console.log(Array.isArray(countries));

    return (
        <div className="tenant-details-container">
            <div className="nav-path">
                <span onClick={() => navigate("/")} className="navigator">Home</span>
                <span className="seperator"> / </span>
                <span onClick={() => navigate("/pg-list")} className="navigator">PG List</span>
                <span className="seperator"> / </span>
                {pgData && <span>{pgData.name}</span>}
                <span className="seperator"> / </span>
                <span onClick={() => navigate(`/pg/${pgId}/tenants`)} className="navigator">Tenants</span>
                <span className="seperator"> / </span>
                {tenantData && <span>{tenantData.first_name + " " + tenantData.last_name}</span>}

            </div>
            <div className="tenant-details-header">
                <h1>Tenant {tenantData && tenantData.first_name + " " + tenantData.last_name}</h1>
            </div>
            <div className="tenant-basic-details">
                <div className="basic-details-header">
                    <h2><u>Basic Details</u></h2>
                    {!editMode && <div>
                        <button className="edit-room-button" onClick={() => setEditMode(true)}><FaPen />Edit Details</button>
                    </div>}
                </div>
                <div className={`tenant-details-form ${editMode ? 'enabled' : 'disabled'}`}>
                    <form onSubmit={handleSubmit}>

                        <div className="form-row">
                            <div className="form-labels">First Name</div>
                            <input
                                placeholder="Enter First Name"
                                value={formData.first_name}
                                disabled={!editMode}
                                onChange={e => {
                                    setFormData({
                                        ...formData,
                                        first_name: e.target.value
                                    })
                                    if (error?.first_name) {
                                        const newError = { ...error };
                                        delete newError.first_name;
                                        setError(newError);
                                    }
                                }}
                            />
                            <div className="error-container">
                                {error?.first_name}
                            </div>
                        </div>
                        <div className="form-row">
                            <div className="form-labels">Last Name</div>
                            <input
                                placeholder="Enter Last Name"
                                value={formData.last_name}
                                disabled={!editMode}
                                onChange={e => {
                                    setFormData({
                                        ...formData,
                                        last_name: e.target.value
                                    })
                                    if (error?.last_name) {
                                        const newError = { ...error };
                                        delete newError.last_name;
                                        setError(newError);
                                    }
                                }}
                            />
                            <div className="error-container">
                                {error?.last_name}
                            </div>
                        </div>
                        <div className="form-row">
                            <div className="form-labels">Alloted Room</div>
                            <select
                                value={formData.room}
                                onChange={(e) => {
                                    setFormData({
                                        ...formData,
                                        room: e.target.value ? Number(e.target.value) : ""
                                    })
                                }}
                                className="custom-select"
                                disabled={!editMode}
                            >
                                <option value="">Select Room</option>
                                {rooms.map(room => (
                                    <option key={room.id} value={room.id}>{room.room_number}</option>
                                ))}
                            </select>
                            <div className="error-container">
                                {error?.room}
                            </div>
                        </div>
                        <div className="form-row">
                            <div className="form-labels">Tenant Email</div>
                            <input
                                placeholder="Enter Tenant Email"
                                value={formData.email}
                                disabled={!editMode}
                                onChange={e => {
                                    setFormData({
                                        ...formData,
                                        email: e.target.value
                                    })
                                    if (error?.email) {
                                        const newError = { ...error };
                                        delete newError.email;
                                        setError(newError);
                                    }
                                }
                                }
                            />
                            <div className="error-container">
                                {error?.email}
                            </div>
                        </div>
                        <div className="form-row">
                            <div className="form-labels">Tenant Phone Number</div>
                            <div className="phone-number-block">
                                <select
                                    value={formData.phone_country_code}
                                    disabled={!editMode}
                                    onChange={e => {
                                        setFormData({
                                            ...formData,
                                            phone_country_code: e.target.value
                                        })
                                    }}
                                >
                                    {countries.map(country => (
                                        <option key={country.isoCode} value={country.phonecode}>+{country.phonecode}({country.name})</option>
                                    ))}
                                </select>
                                <input
                                    placeholder="Enter Tenant Phone Number"
                                    value={formData.phone_number}
                                    disabled={!editMode}
                                    onChange={e => {
                                        setFormData({
                                            ...formData,
                                            phone_number: e.target.value
                                        })
                                        if (error?.phone_number) {
                                            const newError = { ...error };
                                            delete newError.phone_number;
                                            setError(newError);
                                        }
                                    }
                                    }
                                />
                            </div>
                            <div className="error-container">
                                {error?.phone_number}
                            </div>
                        </div>
                        <div className="form-row">
                            <div className="form-labels">Joining Date</div>

                            <input
                                type="date"
                                value={formData.join_date}
                                disabled={!editMode}
                                onChange={(e) => {
                                    setFormData({
                                        ...formData,
                                        join_date: e.target.value
                                    })
                                }} />
                            <div className="error-container">
                                {error?.join_date}
                            </div>
                        </div>

                        {error?.detail && (
                            <div className="error-container">{error.detail}</div>
                        )}
                        <div className="edit-mode-footer-container">
                            {editMode && <div className="edit-mode-buttons">
                                <button type="button" onClick={() => {
                                    setEditMode(false);
                                    setFormData(tenantData);
                                    setError({});
                                }}>Cancel</button>
                                <LoadingSubmitButton
                                    loading={loading}
                                    loadingText="Saving changes"
                                    children="Save"
                                    type="submit"
                                />
                            </div>}
                        </div>

                    </form>
                </div>
            </div>
            {/* <div className="room-tenant-details">
                <h2><u>Tenant Details</u></h2>
                <div className="form-row">
                    <div className="form-labels">Total Room Capacity</div>
                    <input
                        className={`tenant-details-input`}
                        disabled
                        value={formData && formData.capacity}
                    />
                </div>

                <div className="form-row">
                    <div className="form-labels">Available Room Capacity</div>
                    <input
                        className={`tenant-details-input`}
                        disabled
                        value={formData && roomTenants && (formData.capacity - roomTenants.length)}
                    />
                </div>

                <div className="form-row">
                    <div className="form-labels">Tenant Names</div>
                    <div className="card-block">
                        {roomTenants.length === 0 ? (
                            <div>
                                No Tenant Available
                            </div>
                        ) : (
                            roomTenants.map(tenant => (
                                <div key={tenant.id} className="tenant-card">
                                    {tenant.first_name + " " + tenant.last_name}
                                </div>
                            ))
                        )}

                    </div>
                </div>
            </div> */}
        </div>
    )
}

export default TenantDetails;