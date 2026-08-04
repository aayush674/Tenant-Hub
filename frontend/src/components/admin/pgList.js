import ViewPG from "./viewPG";
import ConfirmModal from "../common/confirmationModal";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../../styles/pgList.css";
import "../../styles/common_styles/navigator.css";
import { authFetch } from "../../api/apiClient";
import AddPG from "./addPG";
import { FaEye, FaTrash } from "react-icons/fa";
import { API_BASE_URL } from "../../config";
import TableComponent from "../common/tableComponent";

function PGList() {
    const navigate = useNavigate();
    const [viewPG, setViewPG] = useState(null);
    const [showViewModal, setShowViewModal] = useState(false);
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [pgToDelete, setPgToDelete] = useState(null);
    const [pgs, setPgs] = useState([]);
    const [showSuccessMessage, setShowSuccessMessage] = useState(false);
    const [showAddPG, setShowAddPG] = useState(false);
    const [showActionDropdownId, setShowActionDropdownId] = useState(null);

    useEffect(() => {
        authFetch(`${API_BASE_URL}/api/pgs/`)
            .then((res) => res.json())
            .then((data) => {
                setPgs(data);
            })
            .catch((error) => {
                console.error("Error fetching PGs:", error);
            });
    }, []);

    useEffect(() => {
        if (showSuccessMessage) {
            const timer = setTimeout(() => {
                setShowSuccessMessage(false);
            }, 3000);
            return () => clearTimeout(timer);
        }
    }, [showSuccessMessage]);

    useEffect(() => {
        const handleClickOutside = () => {
            setShowActionDropdownId(null);
        };

        document.addEventListener("click", handleClickOutside);

        return () => {
            document.removeEventListener("click", handleClickOutside);
        };
    }, []);

    const deletePG = () => {
        authFetch(`${API_BASE_URL}/api/pgs/${pgToDelete}/`, {
            method: "DELETE",
        })
            .then(() => {
                setPgs(pgs.filter((pg) => pg.id !== pgToDelete));
                setShowConfirmModal(false);
                setPgToDelete(null);
            })
            .catch((error) => console.error("Error deleting PG:", error));
    };

    const columns = [
      {
        header: "PG Name",
        render: (pg) => pg.name,
      },
      {
        header: "Total Floors",
        render: (pg) => pg.total_floors,
      },
      {
        header: "Total Rooms",
        render: (pg) => pg.room_count ?? 0,
      },
      {
        header: "Actions",
        render: (pg) => (
          <div>
            <button
              className="view-pg-button"
              onClick={() => navigate(`/pg/${pg.id}`)}
            >
              <FaEye /> View
            </button>

            <button
              className="delete-pg-button"
              onClick={(e) => {
                e.stopPropagation();
                setPgToDelete(pg.id);
                setShowConfirmModal(true);
              }}
            >
              <FaTrash /> Delete
            </button>
          </div>
        ),
      },
    ];

    return (
      <div
        className={`pg-list-container ${
          showActionDropdownId ? "dropdown-open" : ""
        }`}
      >
        <div className="nav-path">
          <span onClick={() => navigate("/")} className="navigator">
            Home
          </span>
          <span className="seperator"> / </span>
          <span>PG List</span>
        </div>
        {showSuccessMessage && (
          <div className="success-message">PG added successfully!</div>
        )}

        <button onClick={() => setShowAddPG(true)} className="create-pg-btn">
          <strong>+ Create PG</strong>
        </button>

        <AddPG
          show={showAddPG}
          onClose={() => setShowAddPG(false)}
          onAdd={(newPG) => {
            setPgs((prev) => [...prev, newPG]);
            setShowAddPG(false);
            setShowSuccessMessage(true);
            // navigate("/pg-list", { state: { pgAdded: true } });
          }}
        />

        <h1>PG List</h1>
        <TableComponent
            columns={columns}
            data={pgs}
            emptyMessage={"No PG Available"}
        />
        <ConfirmModal
          show={showConfirmModal}
          title="Delete PG"
          message="Are you sure you want to delete this PG?"
          onConfirm={deletePG}
          onCancel={() => setShowConfirmModal(false)}
        />

        <ViewPG
          show={showViewModal}
          pg={viewPG}
          onClose={() => {
            setShowViewModal(false);
            setViewPG(null);
          }}
        />
      </div>
    );
}

export default PGList;
