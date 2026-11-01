import { useEffect, useState, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import AddMaintainenceRequest from "./addMaintainence";
import "../../styles/common_styles/navigator.css";
import "../../styles/common_styles/add-btn.css";
import { authFetch } from "../../api/apiClient";
import { API_BASE_URL } from "../../config";
import { FaPlus } from "react-icons/fa";
import TableComponent from "../common/tableComponent";
import "../../styles/maintainence.css";
import { toast } from "react-toastify";
import LoadingSubmitButton from "../common/loadingSubmitButton";
import { useAuth } from "../../context/authContext";
import ResolveMaintainenceOTP from "./resolveMaintainenceOTP";

const requestStatusLabels = {
  pending: "Pending",
  assigned: "Assigned",
  resolved: "Resolved",
};

const REQUEST_CATEGORY_LABELS = {
  room_furniture: "Room Furniture",
  electricity: "Electricity",
  plumbing: "Plumbing",
  internet: "Internet",
  other: "Other Issue",
};

const REQUEST_ACTIONS_BY_STATUS = {
  admin: {
    pending: ["edit", "assign"],
    assigned: ["edit", "edit_assignment", "resolve"],
    resolved: [],
  },
  tenant: { pending: ["edit"], assigned: ["edit"], resolved: [] },
};

function MaintainenceList() {
  const [showAddRequest, setShowAddRequest] = useState(false);
  const { pgId } = useParams();

  const navigate = useNavigate();
  const [pgData, setPgData] = useState(null);
  const [requests, setRequests] = useState(null);
  const [loading, setLoading] = useState(false);
  const [assignId, setAssignId] = useState(null);
  const [resolveId, setResolveId] = useState(null);
  const [resolveTargetId, setResolveTargetId] = useState(null);

  const { user } = useAuth();
  const isTenant = user?.role === "TENANT";
  const isAdmin = !isTenant;

  const effectivePgId = isAdmin ? pgId : user?.pgId;

  const fetchPg = useCallback(async () => {
    if (!effectivePgId) return;
    const res = await authFetch(`${API_BASE_URL}/api/pgs/${effectivePgId}`);
    if (!res.ok) return;
    setPgData(await res.json());
  }, [effectivePgId]);

  const fetchRequests = useCallback(async () => {
    const url = isAdmin
      ? `${API_BASE_URL}/api/maintainence-requests/?pg_property=${effectivePgId}`
      : `${API_BASE_URL}/api/maintainence-requests/`; // backend filters by the tenant's room from the token

    const res = await authFetch(url);
    if (!res.ok) {
      setRequests([]);
      return;
    }
    setRequests(await res.json());
  }, [pgId, isAdmin]);

  const handleAssign = useCallback(
    async (reqId) => {
      setLoading(true);
      setAssignId(reqId);
      try {
        const res = await authFetch(
          `${API_BASE_URL}/api/maintainence-requests/${reqId}/assign/`,
          {
            method: "POST",
          },
        );
        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.detail || "Failed to assign request");
        }
        toast.success("Request assigned successfully");
        fetchRequests();
      } catch (err) {
        toast.error(err.message);
      } finally {
        setLoading(false);
        setAssignId(null);
      }
    },
    [fetchRequests],
  );

  const verifyOTP = useCallback(
    async (reqId) => {
      setLoading(true);
      try {
        const res = await authFetch(
          `${API_BASE_URL}/api/maintainence-requests/${reqId}/send_resolve_otp/`,
          {
            method: "POST",
          },
        );
        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.detail || "Failed to send OTP");
        }
        toast.success("OTP sent to tenant's registered Email ID");
        setResolveTargetId(reqId);
      } catch (err) {
        toast.error(err.message);
      } finally {
        setLoading(false);
      }
    },
    [fetchRequests],
  );

  const handleResolve = useCallback(
    async (reqId, otp) => {
      setLoading(true);
      setResolveId(reqId);
      try {
        const res = await authFetch(
          `${API_BASE_URL}/api/maintainence-requests/${reqId}/resolve/`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({otp}),
          },
        );
        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.detail || "Failed to Resolve request");
        }
        toast.success("Request resolved successfully");
        fetchRequests();
      } catch (err) {
        toast.error(err.message);
      } finally {
        setLoading(false);
        setResolveId(null);
      }
    },
    [fetchRequests],
  );

  // const sortedRequests = [...requests].sort((a, b) => {
  //   return Number(b.id) - Number(a.id);
  // });

  useEffect(() => {
    fetchPg();
    fetchRequests();
  }, [fetchPg, fetchRequests]);

  const columns = [
    {
      header: "Request ID",
      render: (req) => <b>{req.id}</b>,
    },
    ...(isAdmin
      ? [{ header: "Room No.", render: (req) => req.room_number }]
      : []),
    {
      header: "Request Category",
      render: (req) => REQUEST_CATEGORY_LABELS[req.category],
    },
    {
      header: "Request Date",
      render: (req) => req.request_date,
    },
    {
      header: "Request Status",
      render: (req) => (
        <span className={`status-chip ${req.status}`}>
          {requestStatusLabels[req.status] ?? req.status}
        </span>
      ),
    },
    {
      header: "Action",
      render: (req) => {
        const allowedActions =
          REQUEST_ACTIONS_BY_STATUS[isTenant ? "tenant" : "admin"]?.[
            req.status
          ] ?? [];
        return (
          <div className="request-list-actions">
            {allowedActions.includes("assign") && (
              <LoadingSubmitButton
                children="Assign"
                loading={loading && req.id === assignId}
                loadingText="Assigning request"
                className="assign-request-btn"
                onClick={() => handleAssign(req.id)}
                disabled={loading}
              />
            )}

            {allowedActions.includes("resolve") && (
              <LoadingSubmitButton
                children="Resolve"
                loading={loading && req.id === resolveId}
                loadingText="Resolving request"
                className="resolve-request-btn"
                onClick={() => {
                  verifyOTP(req.id);
                }}
                disabled={loading}
              />
            )}

            {allowedActions.includes("edit") && (
              <button
                className="edit-request-btn"
                // onClick={() => handleComplete(req.id)}
              >
                View / Edit
              </button>
            )}

            {allowedActions.includes("edit_assignment") && (
              <button
                className="edit-request-btn"
                // onClick={() => handleView(req.id)}
              >
                Edit Assignment
              </button>
            )}
          </div>
        );
      },
    },
  ];

  return (
    <div className="maintainence-list-container">
      {isAdmin ? (
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
          <span>Maintenance</span>
        </div>
      ) : (
        <div className="nav-path">
          <span onClick={() => navigate("/")} className="navigator">
            Home
          </span>
          <span className="seperator"> / </span>
          <span>Maintenance</span>
        </div>
      )}

      <div className="dues-header">
        {isAdmin ? (
          <h1>{pgData && pgData?.name} - Maintainence</h1>
        ) : (
          <h1>Maintainence</h1>
        )}
        <div className="due-header-buttons">
          <button className="add-btn" onClick={() => setShowAddRequest(true)}>
            <span className="icon">
              <FaPlus />
            </span>
            <span>Raise Request</span>
          </button>
        </div>
      </div>

      {showAddRequest && (
        <AddMaintainenceRequest
          pgId={effectivePgId}
          onAdd={() => {
            setShowAddRequest(false);
            fetchRequests();
          }}
          onClose={() => setShowAddRequest(false)}
        />
      )}
      {resolveTargetId && (
        <ResolveMaintainenceOTP
          onResolved={(otp) => {
            setResolveTargetId(null);
            handleResolve(resolveTargetId, otp);
            fetchRequests();
          }}
          onClose={() => setResolveTargetId(null)}
        />
      )}

      <div className="request-list-table">
        {requests === null ? (
          <p>Loading...</p>
        ) : (
          <TableComponent
            columns={columns}
            data={requests}
            emptyMessage={"No request raised"}
          />
        )}
      </div>
    </div>
  );
}

export default MaintainenceList;
