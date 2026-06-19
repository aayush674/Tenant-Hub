import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { authFetch } from "../api/apiClient";
import "../styles/pgDetails.css";
import { FaPen } from "react-icons/fa";
import { State, City } from "country-state-city";

function PGDetails() {
    const navigate = useNavigate();
    const { pgId } = useParams();
    const [pgData, setPgData] = useState();
    // const [pgName, setPgName] = useState(pgData?pgData.name:"");
    const [formData, setFormData] = useState({
        name:"",
        address_line_1:"",
        address_line_2:"",
        state:"",
        city:"",
        country:"India",
        postal_code:"",
        total_floors:""
    });
    const [error, setError] = useState();
    const [editMode, setEditMode] = useState(false);

    const fetchPg = async () => {
        const res = await authFetch(`http://localhost:8000/api/pgs/${pgId}/`);
        if (!res.ok) {
            throw new Error("Failed to fetch PG");
        }
        const data = await res.json();
        setPgData(data);
        setFormData(data);
    }
    console.log(formData);
    const states = State.getStatesOfCountry("IN");
    const selectedState = states.find((state) => state.name === formData?.state)
    const cities = selectedState ? City.getCitiesOfState(
        "IN",
        selectedState.isoCode
    ) : [];

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const res = await authFetch(`http://localhost:8000/api/pgs/${pgId}/`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    name: formData.name,
                    address_line_1: formData.address_line_1,
                    address_line_2: formData.address_line_2,
                    city: formData.city,
                    state: formData.state,
                    country: formData.country,
                    postal_code: formData.postal_code,
                    total_floors: formData.total_floors,
                })
            });

            if (!res.ok) {
                const errData = await res.json();
                console.log(errData);
                return;
            }
            const data = await res.json();
            setPgData(formData);
            setEditMode(false);
        }
        catch (err) {
            setError({ detail: "Something went wrong. Please try again." });
        }
    }
    useEffect(() => {
        fetchPg();
    }, [pgId]);

    return (
        <div className="pg-details-container">
            <div className="details-nav-path">
                <span onClick={() => navigate("/")} className="navigator">Home</span>
                <span className="seperator"> / </span>
                <span onClick={() => navigate("/pg-list")} className="navigator">PG List</span>
                <span className="seperator"> / </span>
                {pgData && <span>{pgData.name}</span>}
                <span className="seperator"> / </span>
                <span>Details</span>

            </div>
            <div className="pg-details-header">
                <h1>{pgData && pgData.name} - Details</h1>
            </div>
            <div className="form-header-block">
                {!editMode && <div>
                    <button className="edit-button" onClick={() => setEditMode(true)}><FaPen />Edit Details</button>
                </div>}
            </div>
            <div className={`pg-details-form ${editMode ? 'enabled' : 'disabled'}`}>
                <form onSubmit={handleSubmit}>
                    <div>PG Name</div>
                    <input
                        className={`pg-details-input ${editMode ? 'enabled' : 'disabled'}`}
                        disabled={!editMode}
                        placeholder="Enter PG Name"
                        value={formData && formData.name}
                        onChange={e => {
                            setFormData({
                                ...formData,
                                name: e.target.value
                            })
                            // if (error?.roomNumber) {
                            //     const newError = { ...error };
                            //     delete newError.roomNumber;
                            //     setError(newError);
                            // }
                        }}
                    />
                    {/* <div className="error-container">
                        {error?.roomNumber}
                    </div> */}

                    <div className="input-area">
                        <label>Enter PG Address</label>
                        <div className="address-1">
                            <input
                                disabled={!editMode}
                                type="text"
                                placeholder="Address Line 1"
                                value={formData.address_line_1}
                                onChange={(e) => setFormData({
                                    ...formData,
                                    address_line_1: e.target.value
                                })}
                            />
                            <input
                                type="text"
                                disabled={!editMode}
                                placeholder="Address Line 2"
                                value={formData.address_line_2}
                                onChange={(e) => setFormData({
                                    ...formData,
                                    address_line_2: e.target.value
                                })}
                            />
                        </div>
                        <div className="address-1">
                            <input
                                type="text"
                                disabled={!editMode}
                                className="short-field"
                                placeholder="Postal Code"
                                value={formData.postal_code}
                                onChange={(e) => setFormData({
                                    ...formData,
                                    postal_code: e.target.value
                                })}
                            />
                            <input
                                type="text"
                                disabled={!editMode}
                                placeholder="Country"
                                className="short-field"
                                value={formData.country}
                                onChange={(e) => setFormData({
                                    ...formData,
                                    country: e.target.value
                                })}
                            />
                            <select
                                name="state"
                                disabled={!editMode}
                                className="short-field"
                                value={formData.state}
                                onChange={(e) => setFormData({
                                    ...formData,
                                    state: e.target.value
                                })}
                            >
                                <option value="">Select State</option>
                                {states.map((state) => (
                                    <option key={state.isoCode} value={state.name}>{state.name}</option>
                                ))}
                            </select>
                            <select
                                name="city"
                                disabled={!editMode}
                                className="short-field"
                                value={formData.city}
                                onChange={(e) => setFormData({
                                    ...formData,
                                    city: e.target.value
                                })}
                            >
                                <option value="">Select City</option>
                                {cities.map((city) => (
                                    <option key={city.isoCode} value={city.name}>{city.name}</option>
                                ))}
                            </select>

                        </div>
                    </div>

                    <div>Total floors</div>
                    <input
                        className={`pg-details-input ${editMode ? 'enabled' : 'disabled'}`}
                        disabled={!editMode}
                        placeholder="Enter Total floors in PG"
                        value={formData && formData.total_floors}
                        onChange={e => {
                            setFormData({
                                ...formData,
                                total_floors: e.target.value
                            })
                        }}
                    />

                    <div>Total Rooms</div>
                    <input disabled
                        value={formData && formData.room_count}
                    />

                    <div>Total Tenants</div>
                    <input disabled
                        value={formData && formData.tenant_count}
                    />

                    {editMode && <div className="edit-mode-buttons">
                        <button type="button" onClick={() => setEditMode(false)}>Cancel</button>
                        <button type="submit">Submit</button>
                    </div>}
                </form>
            </div>
        </div>
    )
}

export default PGDetails;