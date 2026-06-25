import "../../styles/addTenant.css";
import { Country } from "country-state-city";
import Select from "react-select";

function TenantForm({
    tenantName,
    setTenantName,

    lastName,
    setLastName,

    tenantRoom,
    setTenantRoom,

    tenantEmail,
    setTenantEmail,

    tenantPhone,
    setTenantPhone,

    phoneCode,
    phoneNumber,

    tenantJoinDate,
    setTenantJoinDate,

    rooms,
    error,
    setError
}) {
    const countries = Country.getAllCountries();
    const countryOptions = countries.map(country => ({
        value: country.phonecode,
        label: `${country.name} (+${country.phonecode})`
    }));

    return (
        <>
            <div>First Name</div>
            <input
                placeholder="Enter First Name"
                value={tenantName}
                onChange={e => {
                    setTenantName(e.target.value);
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
            <div>Last Name</div>
            <input
                placeholder="Enter Last Name"
                value={lastName}
                onChange={e => {
                    setLastName(e.target.value);
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
            <div>Alloted Room</div>
            <select
                value={tenantRoom}
                onChange={(e) => setTenantRoom(e.target.value ? Number(e.target.value) : "")}
                className="custom-select">
                <option value="">Select Room</option>
                {rooms.map(room => (
                    <option key={room.id} value={room.id}>{room.room_number}</option>
                ))}
            </select>
            <div className="error-container">
                {error?.room}
            </div>

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

            <div>Tenant Phone Number</div>
            <div className="phone-number-block">
            <select
                value={phoneCode}
                onChange={e => {
                    setTenantPhone(`${e.target.value}-${phoneNumber}`);
                }}
            >
                {countries.map(country => (
                    <option key={country.isoCode} value={country.phonecode}>+{country.phonecode}({country.name})</option>
                ))}
            </select>
            <input
                placeholder="Enter Tenant Phone Number"
                value={phoneNumber}
                onChange={e => {
                    setTenantPhone(`${phoneCode}-${e.target.value}`);
                    if (error?.phone) {
                        const newError = { ...error };
                        delete newError.phone;
                        setError(newError);
                    }
                }
                }
            />
            </div>
            <div className="error-container">
                {error?.phone_number}
            </div>
            <div>Joining Date</div>

            <input type="date" value={tenantJoinDate} onChange={(e) => setTenantJoinDate(e.target.value)} />
            <div className="error-container">
                {error?.join_date}
            </div>
            {error?.detail && (
                <div className="error-container">{error.detail}</div>
            )}
        </>
    )
}

export default TenantForm;