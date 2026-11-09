import { useEffect, useState, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import AddMaintainenceRequest from "./addMaintainence";
import "../../styles/common_styles/navigator.css";
import "../../styles/common_styles/add-btn.css";
import { authFetch } from "../../api/apiClient";
import { API_BASE_URL } from "../../config";
import {
  FaEye,
  FaPlus,
  FaPen,
  FaCheckCircle,
  FaUserPlus,
  FaExchangeAlt,
} from "react-icons/fa";
import TableComponent from "../common/tableComponent";
import "../../styles/maintainence.css";
import { toast } from "react-toastify";
import LoadingSubmitButton from "../common/loadingSubmitButton";
import { useAuth } from "../../context/authContext";
import ResolveMaintainenceOTP from "./resolveMaintainenceOTP";
import {
  MODE,
  REQUEST_CATEGORY_LABELS,
  REQUEST_STATUS_LABELS,
  REQUEST_ACTIONS_BY_STATUS,
} from "../../constants/maintainence";
import { formatDateTime, extractError } from "../../utils/format";

function MaintainenceList() {
  const { pgId, roomId } = useParams();

  const navigate = useNavigate();
  const [pgData, setPgData] = useState(null);
  const [requests, setRequests] = useState(null);
  const [loading, setLoading] = useState(false);
  const [assignId, setAssignId] = useState(null);
  const [resolveTargetId, setResolveTargetId] = useState(null);
  const [sendingId, setSendingId] = useState(null);
  const [roomData, setRoomData] = useState({});
  const [otpRequired, setOtpRequired] = useState(true);
  const [mode, setMode] = useState(null);
  const [reqOb, setReqOb] = useState(null);

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
      ? `${API_BASE_URL}/api/maintainence-requests/?pg_property=${effectivePgId}${roomId ? `&room=${roomId}` : ""}`
      : `${API_BASE_URL}/api/maintainence-requests/`;
    try {
      const res = await authFetch(url);
      if (!res.ok) {
        setRequests([]);
        return;
      }
      const data = await res.json();
      setRequests(data.results ?? data);
    } catch (err) {
      if (err.name === "AbortError") return;
      setRequests([]);
      toast.error("Could not load requests");
    }
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
          throw new Error(data, "Failed to assign request");
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
      if (!res.ok)
        throw new Error(extractError(data, "Failed to send OTP"));
      if (data.otp_required) {
        if (data.already_sent) {
          toast.info(
            `OTP already sent. You can resend in ${data.retry_after}s.`,
          );
        } else {
          toast.success("OTP sent to tenant's registered Email ID");
        }
      }
      setOtpRequired(!!data.otp_required);
      setResolveTargetId(reqId);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSendingId(null);
    }
  }, []);

  const handleView = (req) => {
    setMode(MODE.VIEW);
    setReqOb(req);
  };

  const handleEdit = (req) => {
    setMode(MODE.EDIT);
    setReqOb(req);
  };

  const handleClose = () => {
    setMode(null);
    setReqOb(null);
  };

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
      if (!res.ok)
        throw new Error(
          extractError(data, "Failed to resolve request"),
        );

      toast.success("Request resolved successfully");
      setResolveTargetId(null); // close only on success
      fetchRequests();
    },
    [fetchRequests],
  );

  useEffect(() => {
    const controller = new AbortController();
    fetchPg();
    fetchRequests(controller.signal);
    fetchCurrentRoom();
    return () => controller.abort();
  }, [fetchPg, fetchRequests, fetchCurrentRoom]);

  const columns = [
    {
      header: "Request No.",
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
      render: (req) => formatDateTime(req.request_date),
    },
    ...(isAdmin
      ? [
          {
            header: "Raised by",
            render: (req) => req.raised_by_name,
          },
        ]
      : []),
    {
      header: "Request Status",
      render: (req) => (
        <span className={`status-chip ${req.status}`}>
          {REQUEST_STATUS_LABELS[req.status] ?? req.status}
        </span>
      ),
    },
    {
      header: "Resolved On",
      render: (req) => formatDateTime(req.resolved_at)
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
                title="Assign request"
                aria-label="Assign request"
              >
                <FaUserPlus />
              </LoadingSubmitButton>
            )}

            {allowedActions.includes("resolve") && (
              <LoadingSubmitButton
                loading={req.id === sendingId}
                loadingText="Checking"
                className="resolve-request-btn"
                onClick={() => verifyOTP(req.id)}
                disabled={sendingId !== null}
                title="Resolve request"
                aria-label="Resolve request"
              >
                <FaCheckCircle />
              </LoadingSubmitButton>
            )}

            {allowedActions.includes("edit") && (
              <button
                className="edit-request-btn"
                onClick={() => handleEdit(req)}
                title="Edit request"
                aria-label="Edit request"
              >
                <FaPen />
              </button>
            )}

            {allowedActions.includes("view") && (
              <button
                className="view-request-btn"
                onClick={() => handleView(req)}
                title="View request"
                aria-label="View request"
              >
                <FaEye />
              </button>
            )}

            {allowedActions.includes("edit_assignment") && (
              <button
                className="edit-request-btn"
                // onClick={() => handleView(req.id)}
                title="Change Assignment"
                aria-label="Change Assignment"
              >
                <FaExchangeAlt />
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
          roomId ? (
            <h1>
              {pgData && pgData?.name} - Room{" "}
              {roomData && roomData?.room_number} - Maintainence
            </h1>
          ) : (
            <h1>{pgData && pgData?.name} - Maintainence</h1>
          )
        ) : (
          <h1>Maintainence</h1>
        )}
        <div className="due-header-buttons">
          {!roomId && (
            <button className="add-btn" onClick={() => setMode(MODE.CREATE)}>
              <span className="icon">
                <FaPlus />
              </span>
              <span>Raise Request</span>
            </button>
          )}
        </div>
      </div>

      {mode && (
        <AddMaintainenceRequest
          reqOb={reqOb}
          mode={mode}
          pgId={effectivePgId}
          onAdd={() => {
            handleClose();
            fetchRequests();
          }}
          onClose={() => {
            handleClose();
          }}
        />
      )}
      {resolveTargetId && (
        <ResolveMaintainenceOTP
          otpRequired={otpRequired}
          onResend={() => verifyOTP(resolveTargetId)}
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
