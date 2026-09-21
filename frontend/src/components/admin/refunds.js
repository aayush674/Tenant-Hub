import { useNavigate, useParams } from "react-router-dom";
import { useState, useEffect, useCallback } from "react";
import { authFetch } from "../../api/apiClient";
import { API_BASE_URL } from "../../config";
import { FaPlus } from "react-icons/fa";
import "../../styles/common_styles/navigator.css";
import "../../styles/refunds.css";
import "../../styles/common_styles/add-btn.css";
import AddRefundModal from "./addRefund";
import TableComponent from "../common/tableComponent";
import { toast } from "react-toastify";
import LoadingSubmitButton from "../common/loadingSubmitButton";

function Refunds() {
    const navigate = useNavigate();
    const [pgData, setPgData] = useState(null);
    const {pgId} = useParams();
    const [refunds, setRefunds] = useState([]);
    const [processingId, setProcessingId] = useState(null);
    const [showAddRefund, setShowAddRefund] = useState(false);

    const fetchPg = useCallback(async () => {
            const res = await authFetch(`${API_BASE_URL}/api/pgs/${pgId}`);
            if (!res.ok) {
                throw new Error("Failed to fetch PG");
            }
            const data = await res.json();
            setPgData(data);
        }, [pgId]);

    const fetchRefunds = useCallback(async () => {
      const res = await authFetch(
        `${API_BASE_URL}/api/refunds/?pg_property=${pgId}`,
      );
      const data = await res.json();
      setRefunds(data.results || data);
    }, [pgId]);

    useEffect(()=>{
        fetchPg();
        fetchRefunds();
    }, [pgId, fetchPg, fetchRefunds])

    const handleProcess = async (refundId) => {
      setProcessingId(refundId)
      try {
        const res = await authFetch(
          `${API_BASE_URL}/api/refunds/${refundId}/process/`,
          { method: "POST" },
        );
        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.detail || "Failed to process refund");
        }
        const data = await res.json();
        toast.success("Refund processed successfully");
        setRefunds((prev) => prev.map((r) => (r.id === refundId ? data : r)));
      } catch (err) {
        toast.error(err.message);
      } finally{
        setProcessingId(null);
      }
    };

    const columns = [
      {
        header: "Refund ID",
        render: (refund) => <b>{refund.id}</b>,
      },
      {
        header: "Tenant Name",
        render: (refund) => refund.tenant_name,
      },
      {
        header: "Amount (\u20B9)",
        render: (refund) => `\u20B9 ${refund.amount}`,
      },
      // {
      //   header: "Refund Status",
      //   render: (refund) => (
      //     <span className={`status-chip ${refund.status}`}>
      //       {dueStatusLabels[refund.status] ?? refund.status}
      //     </span>
      //   ),
      // },
      {
        header: "Actions",
        render: (refund) => (
          <div className="action-column">
            <LoadingSubmitButton
              children="Process"
              loading={processingId === refund.id}
              loadingText="Processing"
              className="process-refund-button"
              onClick={() => handleProcess(refund.id)}
              disabled={
                processingId === refund.id || refund.status === "processed"
              }
            />
          </div>
        ),
      },
    ];


  return (
    <div className="refund-list-container">
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
        <span>Refunds</span>
      </div>
      <div className="refunds-header">
        <h1>{pgData && pgData.name} - Refunds</h1>
        <div className="refunds-header-buttons">
          <button className="add-btn" onClick={() => setShowAddRefund(true)}>
            <span className="icon">
              <FaPlus />
            </span>
            <span>Create Refund</span>
          </button>
        </div>
        {showAddRefund && (
          <AddRefundModal
            pgId={pgId}
            onAdd={(due) => {
              setShowAddRefund(false);
              fetchRefunds();
            }}
            onClose={() => setShowAddRefund(false)}
          />
        )}
      </div>
      <div className="refunds-list-table">
        <TableComponent
          columns={columns}
          data={refunds}
          emptyMessage={"No Refunds Created"}
        />
      </div>
    </div>
  );
}

export default Refunds;
