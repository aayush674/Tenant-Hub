import { useState } from "react";
import { authFetch } from "../../api/apiClient";
import { toast } from "react-toastify";
import "../../styles/generateRentDues.css";
import { API_BASE_URL } from "../../config";


function GenerateRentDues({ pgId, onGenerate, onCancel }) {
    const [dueDate, setDueDate] = useState("")

    const generateRentDues = async () => {
        const res = await authFetch(
            `${API_BASE_URL}/api/dues/generate_rent_dues/`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    pg_property: pgId,
                    due_date: dueDate
                }),
            }
        );

        const data = await res.json();
        onGenerate();
        toast.success(`${data.created} dues generated.`);
    };

    return (
        <div className="generate-rent-modal-overlay">
            <div className="generate-rent-modal-box">
                <h1>Generate Rent Dues in Bulk</h1>
                <div>Due Date</div>
                <input
                    type="date"
                    onChange={(e) => setDueDate(e.target.value)}
                    required
                />
                <div className="modal-buttons">
                    <button type="submit"
                        onClick={() => {
                            generateRentDues();
                        }}
                    >Generate</button>
                    <button type="button" onClick={onCancel}>Cancel</button>
                </div>
            </div>
        </div>
    )
}

export default GenerateRentDues;