import { useState, useEffect, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { authFetch } from "../../api/apiClient";
import AddPaymentModal from "./addPayment";
import "../../styles/dues.css";

function Payments(){
    const navigate = useNavigate();
    const [pgData, setPgData] = useState(null);
    const { pgId } = useParams();
    const [payments, setPayments] = useState([]);

    const [showAddPayment, setShowAddPayment] = useState(false);

    const fetchPg = useCallback(async () => {
        const res = await authFetch(`http://localhost:8000/api/pgs/${pgId}`);
        if (!res.ok) {
            throw new Error("Failed to fetch PG");
        }
        const data = await res.json();
        setPgData(data);
    }, [pgId]);

    const fetchPayments = useCallback(async () => {
        const res = await authFetch(`http://localhost:8000/api/payments/?pg_property=${pgId}`)
        const data = await res.json();
        setPayments(data.results || data);
    }, [pgId]);

    useEffect(() => {
        fetchPg();
        fetchPayments();
    }, [pgId, fetchPayments, fetchPg]);

    return (
        <div className="dues-container">
            <div className="dues-nav-path">
                <span onClick={() => navigate("/")} className="dues-navigator">Home</span>
                <span className="seperator"> / </span>
                <span onClick={() => navigate("/pg-list")} className="dues-navigator">PG List</span>
                <span className="seperator"> / </span>
                {pgData && <span>{pgData.name}</span>}
                <span className="seperator"> / </span>
                <span>Payments</span>

            </div>
            <div className="dues-header">
                <h1>{pgData && pgData.name} - Payments</h1>
                <button
                    className="add-due-btn"
                    onClick={() => setShowAddPayment(true)}
                ><b>+ Create Payment</b></button>
                {showAddPayment && (
                    <AddPaymentModal
                        pgId={pgId}
                        onAdd={
                            (payment) => {
                                setShowAddPayment(false);
                                fetchPayments();
                                // fetchFloorCounts();
                            }
                        }
                        onClose={() => setShowAddPayment(false)}
                    />
                )}

                {/* {showEditModal && (
                    <EditRoomModal
                        room={editRoomData}
                        onUpdate={(updatedRoom) => {
                            updateRoom(updatedRoom);
                            setShowEditModal(false);
                        }}
                        onClose={() => setShowEditModal(false)}
                    />
                )} */}

            </div>
            <div className="due-list-table">

                <table>
                    <thead>
                        <tr>
                            <th>Payment ID</th>
                            <th>Tenant Name</th>
                            <th>Payment Amount (&#8377;)</th>
                            <th>Payment Method</th>
                            <th>Payment Date</th>
                            {/* <th>Rent (&#8377;)</th> */}
                            {/* <th>Actions</th> */}
                        </tr>

                    </thead>

                    <tbody>

                        {payments.length === 0 ? (<tr>
                            <td colSpan="5" className="no-dues-message">
                                No Dues applied
                            </td>
                        </tr>) : (
                            payments.map(payment => (
                                <tr key={payment.id}>
                                    <td><b>{payment.id}</b></td>
                                    <td>{payment.tenant_name}</td>
                                    <td>&#8377; {payment.amount}</td>
                                    <td>{payment.payment_method}</td>
                                    <td>
                                        {payment.payment_date}
                                    </td>
                                   
                                    {/* <td>
                                        <div className="action-column">
                                            <button className="delete-room-button"
                                                onClick={() => {
                                                    setShowDeleteConfirmModal(true)
                                                    setRoomToDelete(room.id)
                                                }}
                                            ><FaTrash /> Delete</button>

                                            <button className="edit-room-button"
                                                onClick={() => openEditRoom(room)}
                                            ><FaPen /> Edit</button>
                                        </div>
                                        <ConfirmModal
                                            show={showDeleteConfirmModal}
                                            title="Delete Room"
                                            message="Are you sure you want to delete this room? The action once done can not be reverted."
                                            onConfirm={() => handleDeleteRoom(roomToDelete)}
                                            onCancel={() => setShowDeleteConfirmModal(false)}
                                        />
                                    </td> */}
                                </tr>
                            )))}
                    </tbody>
                </table>

            </div>
        </div>
    )
}

export default Payments;