import { useState, useEffect, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { authFetch } from "../../api/apiClient";
import AddPaymentModal from "./addPayment";
import "../../styles/dues.css";
import "../../styles/common_styles/navigator.css";
import { API_BASE_URL } from "../../config";
import { FaPlus } from "react-icons/fa";
import "../../styles/tableComponent.css";
import "../../styles/common_styles/add-btn.css";
import TableComponent from "../common/tableComponent";

function Payments(){
    const navigate = useNavigate();
    const [pgData, setPgData] = useState(null);
    const { pgId } = useParams();
    const [payments, setPayments] = useState([]);

    const [showAddPayment, setShowAddPayment] = useState(false);

    const fetchPg = useCallback(async () => {
        const res = await authFetch(`${API_BASE_URL}/api/pgs/${pgId}`);
        if (!res.ok) {
            throw new Error("Failed to fetch PG");
        }
        const data = await res.json();
        setPgData(data);
    }, [pgId]);

    const fetchPayments = useCallback(async () => {
        const res = await authFetch(`${API_BASE_URL}/api/payments/?pg_property=${pgId}`)
        const data = await res.json();
        setPayments(data.results || data);
    }, [pgId]);

    const sortedPayments = [...payments].sort((a, b) => {
            return Number(b.id) - Number(a.id);
    });

    useEffect(() => {
        fetchPg();
        fetchPayments();
    }, [pgId, fetchPayments, fetchPg]);

    const columns = [
      {
        header: "Payment ID",
        render: (payment) => <b>{payment.id}</b>,
      },
      {
        header: "Tenant Name",
        render: (payment) => payment.tenant_name,
      },
      {
        header: "Payment Amount (\u20B9)",
        render: (payment) => `\u20B9 ${payment.amount}`,
      },
      {
        header: "Payment Method",
        render: (payment) => payment.payment_method,
      },
      {
        header: "Payment Date",
        render: (payment) => payment.payment_date,
      },
    ];

    return (
      <div className="dues-container">
        <div className="nav-path">
          <span onClick={() => navigate("/")} className="navigator">
            Home
          </span>
          <span className="seperator"> / </span>
          <span onClick={() => navigate("/pg-list")} className="navigator">
            PG List
          </span>
          <span className="seperator"> / </span>
          {pgData && <span>{pgData.name}</span>}
          <span className="seperator"> / </span>
          <span>Payments</span>
        </div>
        <div className="dues-header">
          <h1>{pgData && pgData.name} - Payments</h1>
          <button className="add-btn" onClick={() => setShowAddPayment(true)}>
            <span className="icon">
              <FaPlus />
            </span>
            <span>Create Payment</span>
          </button>
          {showAddPayment && (
            <AddPaymentModal
              pgId={pgId}
              onAdd={(payment) => {
                setShowAddPayment(false);
                fetchPayments();
                // fetchFloorCounts();
              }}
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
          <TableComponent
            columns={columns}
            data={sortedPayments}
            emptyMessage={"No Payments Available"}
          />
        </div>
      </div>
    );
}

export default Payments;
