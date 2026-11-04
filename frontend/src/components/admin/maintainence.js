import { useEffect, useState, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import AddMaintainenceRequest from "./addMaintainence";
import "../../styles/common_styles/navigator.css";
import "../../styles/common_styles/add-btn.css";
import { authFetch } from "../../api/apiClient";
import { API_BASE_URL } from "../../config";
import { FaEye, FaPlus, FaPen, FaCheckCircle, FaUserPlus, FaExchangeAlt } from "react-icons/fa";
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
    resolved: ["view"],
  },
  tenant: { pending: ["edit"], assigned: ["view"], resolved: ["view"] },
};

function MaintainenceList() {
  const [showAddRequest, setShowAddRequest] = useState(false);
  const { pgId, roomId } = useParams();

  const navigate = useNavigate();
  const [pgData, setPgData] = useState(null);
  const [requests, setRequests] = useState(null);
  const [loading, setLoading] = useState(false);
  const [assignId, setAssignId] = useState(null);
  const [resolveTargetId, setResolveTargetId] = useState(null);
  const [sendingId, setSendingId] = useState(null);
  const [roomData, setRoomData] = useState({});

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
    if (isAdmin && !effectivePgId) return;
    const url = isAdmin
      ? roomId
        ? `${API_BASE_URL}/api/maintainence-requests/?pg_property=${effectivePgId}&room=${roomId}`
        : `${API_BASE_URL}/api/maintainence-requests/?pg_property=${effectivePgId}`
      : `${API_BASE_URL}/api/maintainence-requests/`;
    const res = await authFetch(url);
    if (!res.ok) {
      setRequests([]);
      return;
    }
    const data = await res.json();
    setRequests(data.results ?? data);
  }, [effectivePgId, isAdmin, roomId]);

  const fetchCurrentRoom = useCallback(async () => {
    setRoomData({});
    if (!roomId) return;
    const res = await authFetch(`${API_BASE_URL}/api/rooms/${roomId}`);
    if (!res.ok) return;
    setRoomData(await res.json());
  }, [roomId]);

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

  const verifyOTP = useCallback(async (reqId) => {
    setSendingId(reqId);
    try {
      const res = await authFetch(
        `${API_BASE_URL}/api/maintainence-requests/${reqId}/send_resolve_otp/`,
        { method: "POST" },
      );
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.detail || "Failed to send OTP");
      toast.success("OTP sent to tenant's registered Email ID");
      setResolveTargetId(reqId);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSendingId(null);
    }
  }, []);

  const handleResolve = useCallback(
    async (reqId, otp) => {
      const res = await authFetch(
        `${API_BASE_URL}/api/maintainence-requests/${reqId}/resolve/`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ otp }),
        },
      );
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.detail || "Failed to resolve request");

      toast.success("Request resolved successfully");
      setResolveTargetId(null); // close only on success
      fetchRequests();
    },
    [fetchRequests],
  );

  // const sortedRequests = [...requests].sort((a, b) => {
  //   return Number(b.id) - Number(a.id);
  // });

  useEffect(() => {
    fetchPg();
    fetchRequests();
    fetchCurrentRoom();
  }, [fetchPg, fetchRequests, fetchCurrentRoom]);

  const columns = [
    {
      header: "Request ID",
      render: (req) => <b>{req.id}</b>,
    },
    ...(isAdmin && !roomId
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
                // children="Assign"
                loading={loading && req.id === assignId}
                loadingText="Assigning request"
                className="assign-request-btn"
                onClick={() => handleAssign(req.id)}
                disabled={loading}
              >
                <FaUserPlus/>
              </LoadingSubmitButton>
            )}

            {allowedActions.includes("resolve") && (
              <LoadingSubmitButton
                loading={req.id === sendingId}
                loadingText="Sending OTP"
                className="resolve-request-btn"
                onClick={() => verifyOTP(req.id)}
                disabled={sendingId !== null}
              >
                <FaCheckCircle/>
              </LoadingSubmitButton>
            )}

            {allowedActions.includes("edit") && (
              <button
                className="edit-request-btn"
                // onClick={() => handleComplete(req.id)}
              >
                <FaPen/>
              </button>
            )}

            {allowedActions.includes("view") && (
              <button
                className="view-request-btn"
                // onClick={() => handleComplete(req.id)}
              >
                <FaEye />
              </button>
            )}

            {allowedActions.includes("edit_assignment") && (
              <button
                className="edit-request-btn"
                // onClick={() => handleView(req.id)}
              >
                <FaExchangeAlt/>
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

          {/* Extra room nav path for room wise maintainence requests */}
          {roomId && (
            <span>
              <span onClick={() => navigate("/rooms")} className="navigator">
                Rooms
              </span>
              <span className="seperator"> / </span>
              <span>{roomData.room_number}</span>
              <span className="seperator"> / </span>
            </span>
          )}
          <span>Maintenance</span>
        </div>
      ) : (
        // Nav path for tenant maintainence list
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
          {!roomId && (
            <button className="add-btn" onClick={() => setShowAddRequest(true)}>
              <span className="icon">
                <FaPlus />
              </span>
              <span>Raise Request</span>
            </button>
          )}
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
          onResolved={(otp) => handleResolve(resolveTargetId, otp)}
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
