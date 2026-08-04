import { useState, useEffect, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { authFetch } from "../../api/apiClient";
import AddDueModal from "./addDue";
import "../../styles/dues.css";
import "../../styles/common_styles/navigator.css";
import GenerateRentDues from "./generateRentDues";
import { API_BASE_URL } from "../../config";
import TableComponent from "../common/tableComponent";
import { FaPlus, FaTasks } from "react-icons/fa";
import "../../styles/tableComponent.css";
import "../../styles/common_styles/add-btn.css";


const dueTypeLabels = {
    rent: "Rent",
    electricity: "Electricity",
    security: "Security",
    maintenance: "Maintenance",
};

const dueStatusLabels = {
    pending: "Pending",
    partial: "Partially Paid",
    paid: "Paid",
    overdue: "Overdue",
};

function Dues() {
    const navigate = useNavigate();
    const [pgData, setPgData] = useState(null);
    const { pgId } = useParams();
    const [dues, setDues] = useState([]);
    const [showAddDue, setShowAddDue] = useState(false);
    const [showGenerateRent, setShowGenerateRent] = useState(false);

    const fetchPg = useCallback(async () => {
        const res = await authFetch(`${API_BASE_URL}/api/pgs/${pgId}`);
        if (!res.ok) {
            throw new Error("Failed to fetch PG");
        }
        const data = await res.json();
        setPgData(data);
    }, [pgId]);

    const fetchDues = useCallback(async () => {
        const res = await authFetch(`${API_BASE_URL}/api/dues/?pg_property=${pgId}`)
        const data = await res.json();
        setDues(data.results || data);
    }, [pgId]);

    const sortedDues = [...dues].sort((a, b) => {
            return Number(b.id) - Number(a.id);
    });

    useEffect(() => {
        fetchPg();
        fetchDues();
    }, [pgId, fetchDues, fetchPg]);

    const columns = [
      {
        header: "Due ID",
        render: (due) => <b>{due.id}</b>,
      },
      {
        header: "Tenant Name",
        render: (due) => due.tenant_name,
      },
      {
        header: "Due Type",
        render: (due) => dueTypeLabels[due.due_type] ?? due.due_type,
      },
      {
        header: "Due Amount (\u20B9)",
        render: (due) => `\u20B9 ${due.due_amount}`,
      },
      {
        header: "Due Status",
        render: (due) => (
          <span className={`status-chip ${due.status}`}>
            {dueStatusLabels[due.status] ?? due.status}
          </span>
        ),
      },
      {
        header: "Due Date",
        render: (due) => due.due_date
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
          <span>Dues</span>
        </div>
        <div className="dues-header">
          <h1>{pgData && pgData.name} - Dues</h1>
          <div className="due-header-buttons">
            <button
              className="add-btn"
              onClick={() => setShowGenerateRent(true)}
            >
              <span className="icon">
                <FaTasks />
              </span>
              <span>Generate Rent Dues</span>
            </button>

            <button className="add-btn" onClick={() => setShowAddDue(true)}>
              <span className="icon">
                <FaPlus />
              </span>
              <span>Add Due</span>
            </button>
          </div>
          {showAddDue && (
            <AddDueModal
              pgId={pgId}
              onAdd={(due) => {
                setShowAddDue(false);
                fetchDues();
                // fetchFloorCounts();
              }}
              onClose={() => setShowAddDue(false)}
            />
          )}

          {showGenerateRent && (
            <GenerateRentDues
              pgId={pgId}
              onGenerate={() => {
                setShowGenerateRent(false);
                fetchDues();
              }}
              onCancel={() => setShowGenerateRent(false)}
            />
          )}
        </div>
        <div className="due-list-table">
          <TableComponent
            columns={columns}
            data={sortedDues}
            emptyMessage={"No Dues Available"}
          />
        </div>
      </div>
    );
}

export default Dues;
