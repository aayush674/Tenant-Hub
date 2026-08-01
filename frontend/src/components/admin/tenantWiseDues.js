import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { authFetch } from "../../api/apiClient";
import { API_BASE_URL } from "../../config";
import { useParams } from "react-router-dom";

import "../../styles/common_styles/navigator.css";
import "../../styles/tenantDues.css";
import TableComponent from "../common/tableComponent";

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

function TenantWiseDues() {

    const navigate = useNavigate();
    const { pgId, tenantId } = useParams();
    const [pgData, setPgData] = useState();
    const [tenantDues, setTenantDues] = useState([]);
    const [tenantData, setTenantData] = useState(null);
    const [quickFilter, setQuickFilter] = useState("pending");

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
    }, [tenantId]);

    const updateDueList = useCallback(async () => {
        const res = await authFetch(`${API_BASE_URL}/api/dues/?tenant=${tenantId}&status=${quickFilter === "paid" ? quickFilter : "!paid"}`)
        if (!res.ok) {
            throw new Error("Failed to fetch dues");
        }
        const data = await res.json();
        setTenantDues(data.results || data);
    }, [tenantId, quickFilter])

    const sortedDues = [...tenantDues].sort((a, b) => {
            return Number(b.id) - Number(a.id);
    });

    useEffect(() => {
        fetchPg();
        fetchCurrentTenant();
    }, [fetchPg, fetchCurrentTenant]);

    useEffect(() => {
        updateDueList();
    }, [updateDueList]);

    const columns = [
      {
        header: "Due ID",
        render: (due) => <b>{due.id}</b>,
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
        render: (due) => due.due_date,
      },
    ];

    return (
        <div className="tenant-dues-container">
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
                <span className="seperator"> / </span>
                <span>Dues</span>

            </div>
            <div className="tenant-dues-header">
                <h1>Tenant {tenantData && tenantData.first_name + " " + tenantData.last_name + " - Dues"}</h1>
            </div>
            <div className="quick-filter">
                <button
                    className={quickFilter === "pending" ? "active" : ""}
                    onClick={() => {
                        setQuickFilter("pending");
                    }}
                >Due</button>
                <button
                    className={quickFilter === "paid" ? "active" : ""}
                    onClick={() => {
                        setQuickFilter("paid");
                    }}
                >Paid</button>
            </div>
            <div className="due-list-table">

                <TableComponent
                    columns={columns}
                    data={sortedDues}
                    emptyMessage={"No Dues Available"}
                />
            </div>
        </div>
    )
}

export default TenantWiseDues;
