import React, { useState } from "react";
import "../styles/addPG.css";
import { authFetch } from "../api/apiClient";

function AddPG({ show, onClose, onAdd }) {

    const [name, setName] = useState("");
    const [address, setAddress] = useState("");
    const [floor, setFloor] = useState("");
    if (!show) {
        return null;
    }
    

    const handleAddPG = () => {
        authFetch("http://localhost:8000/api/pgs/", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                name: name,
                address: address,
                total_floors: Number(floor),
            }),
        })
            .then((response) => response.json())
            .then((newPG) => {
                onAdd(newPG);
                onClose();
                setName("");
                setAddress("");
                setFloor("");
            })
            .catch((error) => console.error("Error:", error));
    };

    return (
        <div className="modal-overlay">
            <div className="modal-box">
                <h2>Add new PG</h2>
                <input
                    type="text"
                    placeholder="PG Name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                />

                <input
                    type="text"
                    placeholder="PG Address"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                />

                <input
                    type="number"
                    placeholder="PG Floor"
                    value={floor}
                    onChange={(e) => setFloor(e.target.value)}
                />

                <div className="modal-buttons">
            <button onClick={onClose} className="cancel-btn">Cancel</button>
                    <button onClick={handleAddPG} className="add-btn" disabled={!name}>Add PG</button>
                </div>
            </div>
        </div>
    )
}

export default AddPG;