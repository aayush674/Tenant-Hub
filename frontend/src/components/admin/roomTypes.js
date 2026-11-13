import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { authFetch } from "../../api/apiClient";
import { useParams } from "react-router-dom";
import "../../styles/roomTypes.css";
import "../../styles/common_styles/navigator.css";
import AddRoomTypeModal from "./addRoomType";
import { FaPen, FaTrash } from "react-icons/fa";
import { API_BASE_URL } from "../../config";
import { FaPlus } from "react-icons/fa";
import "../../styles/tableComponent.css";
import "../../styles/common_styles/add-btn.css";
import TableComponent from "../common/tableComponent";
import { MODE } from "../../constants/roomType";

function RoomTypes() {
  const [roomTypes, setRoomTypes] = useState([]);
  const [pgData, setPgData] = useState(null);
  const navigate = useNavigate();
  const { pgId } = useParams();
  const [mode, setMode] = useState(null);
  const [room, setRoom] = useState(null);
  // const [roomTypes, setRoomTypes] = useState({});

  const fetchPg = useCallback(async () => {
    const res = await authFetch(`${API_BASE_URL}/api/pgs/${pgId}`);
    if (!res.ok) {
      throw new Error("Failed to fetch room types");
    }
    const data = await res.json();
    setPgData(data);
  }, [pgId]);

  const fetchRoomTypes = useCallback(async () => {
    const res = await authFetch(
      `${API_BASE_URL}/api/room-types/?pg_property=${pgId}`,
    );
    if (!res.ok) {
      throw new Error("Failed to fetch room types");
    }
    const data = await res.json();
    setRoomTypes(data);
  }, [pgId]);

  const handleView = (roomType) => {
    setMode(MODE.VIEW);
    setRoom(roomType);
  }

  const handleEdit = (roomType) => {
    setMode(MODE.EDIT);
    setRoom(roomType);
  };

  useEffect(() => {
    fetchPg();
    fetchRoomTypes();
    console.log(mode);
  }, [pgId, fetchPg, fetchRoomTypes]);

  const columns = [
    {
      header: "Template Name",
      render: (roomType) => roomType.name,
    },
    {
      header: "Capacity",
      render: (roomType) => (
        <span
          className={`occupancy-chip ${roomType.capacity === 1 ? "single" : "double"}`}
        >
          {roomType.capacity === 1 ? "👤Single" : "👥Double"}
        </span>
      ),
    },
    {
      header: "Balcony Room",
      render: (roomType) => (roomType.is_balcony_room === true ? "Yes" : "No"),
    },
    {
      header: "Rent",
      render: (roomType) => roomType.rent,
    },
    {
      header: "Actions",
      render: (roomType) => (
        <div className="action-column">
          <button className="delete-room-type-button">
            <FaTrash /> Delete
          </button>

          <button
            className="edit-room-type-button"
            onClick={() => handleEdit(roomType)}
          >
            <FaPen /> Edit
          </button>
          {/* <button
            className="edit-room-type-button"
            onClick={() => handleView(roomType)}
          >
            <FaPen /> View
          </button> */}
        </div>
      ),
    },
  ];

  return (
    <div className="room-type-container">
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
        <span>Room Templates</span>
      </div>
      <div className="room-type-header">
        <h1>{pgData && pgData.name} - Room Templates</h1>
        <button className="add-btn" onClick={() => setMode(MODE.CREATE)}>
          <span className="icon">
            <FaPlus />
          </span>
          <span>Create Room Template</span>
        </button>
        {mode && (
          <AddRoomTypeModal
            roomType={room}
            mode={mode}
            pgId={pgId}
            onAdd={() => {
              setMode(null);
              setRoom(null);
              fetchRoomTypes();
            }}
            onClose={() => {
              setMode(null);
              setRoom(null);
            }}
          />
        )}

      </div>
      {/* <div className="filter-button">
            <button onClick={() => {
                setDraftFilters(filters);
                setShowFilterModal(true);
            }}>Filters</button>
            <RoomListFilterModal
                isOpen={showFilterModal}
                onClose={() => setShowFilterModal(false)}
                filters={draftFilters}
                setFilters={setDraftFilters}
                onApply={handleApplyFilters}
                onReset={handleResetFilters}
            />
            </div> */}

      <TableComponent
        columns={columns}
        data={roomTypes}
        emptyMessage={"No Room Template Available"}
      />
    </div>
  );
}
export default RoomTypes;
