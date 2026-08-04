import { useEffect, useState, useCallback } from "react";
import { useParams } from "react-router-dom";
import { authFetch } from "../../api/apiClient";
import AddRoomModal from "./addRoomModal";
import "../../styles/roomsList.css";
import "../../styles/common_styles/navigator.css";
import { useNavigate } from "react-router-dom";
// import EditRoomModal from "./editRoomModal";
import RoomListFilterModal from "./roomListFilterModal";
import { useSearchParams } from "react-router-dom";
import ConfirmModal from "../common/confirmationModal";
import { FaPen, FaTrash, FaPlus } from "react-icons/fa";
import FilterIcon from "../../assets/filter-svgrepo.svg";
import { API_BASE_URL } from "../../config";
import TableComponent from "../common/tableComponent";
import "../../styles/common_styles/add-btn.css";

function RoomsList() {
  const { pgId } = useParams();
  const [rooms, setRooms] = useState([]);
  const [showAddRoom, setShowAddRoom] = useState(false);
  const [pgData, setPgData] = useState(null);
  // const [showEditModal, setShowEditModal] = useState(false);
  // const [editRoomData, setEditRoomData] = useState(null);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const navigate = useNavigate();
  const [filters, setFilters] = useState({
    occupancyType: "",
    minPrice: "",
    maxPrice: "",
  });
  const [draftFilters, setDraftFilters] = useState({
    occupancyType: "",
    minPrice: "",
    maxPrice: "",
  });
  const [searchParams, setSearchParams] = useSearchParams();
  const [showDeleteConfirmModal, setShowDeleteConfirmModal] = useState(false);
  const [roomToDelete, setRoomToDelete] = useState(null);
  const [floorCounts, setFloorCounts] = useState({});
  const [tenantData, setTenants] = useState([]);
  const [selectedFloorstate, setSelectedFloorState] = useState("");

  useEffect(() => {
    const min = searchParams.get("min_price") || "";
    const max = searchParams.get("max_price") || "";
    const occupancy = searchParams.get("capacity") || "";
    const selectedFloor = searchParams.get("room_floor");

    const initialFilters = {
      minPrice: min,
      maxPrice: max,
      occupancyType: occupancy ? Number(occupancy) : "",
    };

    setDraftFilters(initialFilters);
    setFilters(initialFilters);
    setSelectedFloorState(selectedFloor !== null ? Number(selectedFloor) : "");
  }, [searchParams]);

  const fetchRooms = useCallback(async () => {
    const min = searchParams.get("min_price") || "";
    const max = searchParams.get("max_price") || "";
    const occupancy = searchParams.get("capacity") || "";
    const room_floor = searchParams.get("room_floor") || "";

    const params = new URLSearchParams();

    if (min) params.append("min_price", min);
    if (max) params.append("max_price", max);
    if (occupancy) params.append("capacity", occupancy);
    if (room_floor) params.append("room_floor", room_floor);

    const res = await authFetch(
      `${API_BASE_URL}/api/rooms/?pg_property=${pgId}&${params.toString()}`,
    );

    const data = await res.json();
    setRooms(data.results || data);
  }, [pgId, searchParams]);

  const fetchTenants = useCallback(async () => {
    const res = await authFetch(
      `${API_BASE_URL}/api/tenants/?pg_property=${pgId}`,
    );
    const data = await res.json();
    setTenants(data.results || data);
  }, [pgId]);

  const fetchPg = useCallback(async () => {
    const res = await authFetch(`${API_BASE_URL}/api/pgs/${pgId}`);
    if (!res.ok) {
      throw new Error("Failed to fetch PG");
    }
    const data = await res.json();
    setPgData(data);
  }, [pgId]);

  const handleDeleteRoom = (deleteRoom) => {
    authFetch(`${API_BASE_URL}/api/rooms/${deleteRoom}/`, {
      method: "DELETE",
    })
      .then(() => {
        setRooms((prev) => prev.filter((room) => room.id !== deleteRoom));
        setShowDeleteConfirmModal(false);
        setRoomToDelete(null);
        fetchFloorCounts();
      })
      .catch((error) => console.error("Error deleting Room:", error));
  };

  // const openEditRoom = (room) => {
  //     setEditRoomData(room);
  //     setShowEditModal(true);
  // }

  // const updateRoom = (updatedRoom) => {
  //     setRooms(prev => prev.map(room => room.id === updatedRoom.id ? updatedRoom : room));
  // }

  const handleApplyFilters = () => {
    setFilters(draftFilters);
    setShowFilterModal(false);
    const params = {};

    if (draftFilters.minPrice) {
      params.min_price = draftFilters.minPrice;
    }

    if (draftFilters.maxPrice) {
      params.max_price = draftFilters.maxPrice;
    }
    if (draftFilters.occupancyType) {
      params.capacity = draftFilters.occupancyType;
    }
    setSearchParams(params);
    fetchFloorCounts();
  };

  const handleResetFilters = () => {
    setDraftFilters({});
    handleApplyFilters();
  };

  const getFloorLabel = (floor) => {
    if (floor === 0) return "Unspecified";
    if (floor === 1) return "1st Floor";
    if (floor === 2) return "2nd Floor";
    if (floor === 3) return "3rd Floor";
    return `${floor}th Floor`;
  };

  const fetchFloorCounts = useCallback(async () => {
    const res = await authFetch(
      `${API_BASE_URL}/api/rooms/?pg_property=${pgId}`,
    );

    const data = await res.json();
    const allRooms = data.results || data;

    const counts = allRooms.reduce((acc, room) => {
      acc[room.room_floor] = (acc[room.room_floor] || 0) + 1;
      return acc;
    }, {});

    setFloorCounts(counts);
  }, [pgId]);

  const getRoomTenants = (room) => {
    let cap = room.capacity;
    let roomTenants = [];
    for (const tenant of tenantData) {
      if (cap === 0) break;
      if (tenant.room === room.id) {
        roomTenants.push(tenant.first_name + " " + tenant.last_name);
        cap--;
      }
    }
    return roomTenants;
  };

  const sortedRooms = [...rooms].sort((a, b) => {
    return Number(a.room_number) - Number(b.room_number);
  });

  useEffect(() => {
    fetchRooms();
  }, [pgId, searchParams, fetchRooms]);

  useEffect(() => {
    fetchPg();
    fetchTenants();
  }, [pgId, fetchPg, fetchTenants]);

  useEffect(() => {
    fetchFloorCounts();
  }, [pgId, fetchFloorCounts]);

  const columns = [
    {
      header: "Room",
      render: (room) => <b>{room.room_number}</b>,
    },
    {
      header: "Floor",
      render: (room) =>
        room.room_floor !== 0 ? room.room_floor : "Unspecified",
    },
    {
      header: "Capacity",
      render: (room) => (
        <span
          className={`occupancy-chip ${
            room.capacity === 1 ? "single" : "double"
          }`}
        >
          {room.capacity === 1 ? "👤 Single" : "👥 Double"}
        </span>
      ),
    },
    {
      header: "Tenants",
      render: (room) => {
        const tenants = getRoomTenants(room);

        return (
          <div className="tenant-column">
            {tenants.length === 0 ? "-" : tenants.join(", ")}
          </div>
        );
      },
    },
    {
      header: "Balcony",
      render: (room) => (room.is_balcony_room ? "Yes" : "No"),
    },
    {
      header: "Rent (\u20B9)",
      render: (room) => `\u20B9 ${room.rent}`,
    },
    {
      header: "Actions",
      render: (room) => (
        <div className="action-column">
          <button
            className="delete-room-button"
            onClick={() => {
              setShowDeleteConfirmModal(true);
              setRoomToDelete(room.id);
            }}
          >
            <FaTrash /> Delete
          </button>

          <button
            className="edit-room-button"
            onClick={() => navigate(`/pg/${pgId}/rooms/${room.id}`)}
          >
            <FaPen /> Manage
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="room-list-container">
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
        <span>Rooms</span>
      </div>
      <div className="room-list-header">
        <h1>{pgData && pgData.name} - Rooms</h1>
        <button className="add-btn" onClick={() => setShowAddRoom(true)}>
          <span className="icon">
            <FaPlus />
          </span>
          <span>Add Room</span>
        </button>
        {showAddRoom && (
          <AddRoomModal
            pgId={pgId}
            onAdd={(room) => {
              setShowAddRoom(false);
              fetchRooms();
              fetchFloorCounts();
            }}
            onClose={() => setShowAddRoom(false)}
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
      <div>
        <button
          className="filter-button"
          onClick={() => {
            setDraftFilters(filters);
            setShowFilterModal(true);
          }}
        >
          <img src={FilterIcon} alt="Filter" className="filter-icon" />
          Filters
        </button>
        <RoomListFilterModal
          isOpen={showFilterModal}
          onClose={() => setShowFilterModal(false)}
          filters={draftFilters}
          setFilters={setDraftFilters}
          onApply={handleApplyFilters}
          onReset={handleResetFilters}
        />
      </div>

      <div className="floor-navigation-box">
        <button
          className={selectedFloorstate === "" ? "active-floor" : ""}
          onClick={() => {
            const params = Object.fromEntries(searchParams);
            delete params.room_floor;
            setSearchParams(params);
          }}
        >
          <span>All</span>
          <span className="floor-count">{pgData?.room_count}</span>
        </button>
        {Array.from({ length: pgData?.total_floors + 1 }, (_, i) => i).map(
          (floor) => (
            <button
              key={floor}
              className={selectedFloorstate === floor ? "active-floor" : ""}
              onClick={() => {
                setSearchParams({
                  ...Object.fromEntries(searchParams),
                  room_floor: floor,
                });
              }}
            >
              <span>{getFloorLabel(floor)}</span>
              <span className="floor-count">{floorCounts[floor] || 0}</span>
            </button>
          ),
        )}
      </div>
      <TableComponent
        columns={columns}
        data={sortedRooms}
        emptyMessage="No Rooms Available"
      />
      <ConfirmModal
        show={showDeleteConfirmModal}
        title="Delete Room"
        message="Are you sure you want to delete this room? The action once done can not be reverted."
        onConfirm={() => handleDeleteRoom(roomToDelete)}
        onCancel={() => setShowDeleteConfirmModal(false)}
      />
    </div>
  );
}

export default RoomsList;
