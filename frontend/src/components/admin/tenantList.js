import { useState, useEffect, useCallback } from "react";
import { useParams } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { authFetch } from "../../api/apiClient";
import AddTenantModal from "./addTenant";
import "../../styles/tenantList.css";
import "../../styles/common_styles/navigator.css";
import { FaPen, FaTrash } from "react-icons/fa";
import ConfirmModal from "../common/confirmationModal";
import { API_BASE_URL } from "../../config";
import TableComponent from "../common/tableComponent";
import "../../styles/tableComponent.css"

function TenantList(){
    const { pgId } = useParams()
    const navigate=useNavigate()
    const [pgData, setPgData] = useState();
    const [showAddTenant, setShowAddTenant] = useState(false);
    const [tenants, setTenants]=useState([]);
    // const [showEditTenant, setShowEditTenant] = useState(false);
    // const [editTenantData, setEditTenantData] = useState(null);
    const [showDeleteConfirmModal, setShowDeleteConfirmModal] = useState(false);
    const [tenantToDelete, setTenantToDelete] = useState(null);
    const [permissions, setPermissions] = useState();

    const fetchPg = useCallback(async () => {
        const res = await authFetch(`${API_BASE_URL}/api/pgs/${pgId}`);
        if (!res.ok) {
            throw new Error("Failed to fetch PG");
        }
        const data = await res.json();
        setPgData(data);
    }, [pgId]);

    const fetchTenants = useCallback(async () => {
        const res= await authFetch(`${API_BASE_URL}/api/tenants/?pg_property=${pgId}`)
        const data = await res.json();
        setTenants(data.results || data);
    }, [pgId]);

    const fetchPermissions=useCallback(async()=>{
        const res=await authFetch(
            `${API_BASE_URL}/auth/permissions/?pg_id=${pgId}`
        )
        const data=await res.json();
        setPermissions(data);
    }, [pgId]);

    const handleDeleteTenant = (tenantToDelete) =>{
        authFetch(`${API_BASE_URL}/api/tenants/${tenantToDelete}/`, {
            method: "DELETE",
        })
            .then(() => {
                setShowDeleteConfirmModal(false);
                setTenantToDelete(null);
                fetchTenants();
            })
            .catch((error) => console.error("Error deleting Tenant:", error));
    }

    const sortedTenants = [...tenants].sort((a, b) => {
            return new Date(b.join_date) - new Date(a.join_date);
    });

    useEffect(() => {
        fetchPg();
        fetchTenants();
        fetchPermissions();
    }, [pgId, fetchPermissions, fetchPg, fetchTenants]);

    const columns = [
      {
        header: "Tenant Name",
        render: (tenant) => <b>{tenant.first_name + " " + tenant.last_name}</b>,
      },
      {
        header: "Room Number",
        render: (tenant) => tenant.room_number
      },
      {
        header: "Email",
        render: (tenant) => tenant.email
      },
      {
        header: "Joining Date",
        render: (tenant) => tenant.join_date
      },
      {
        header: "Phone Number",
        render: (tenant) => tenant.phone_country_code + "-" + tenant.phone_number
      }
    ];
    if (permissions?.edit_tenants || permissions?.delete_tenants) {
      columns.push({
        header: "Actions",
        render: (tenant) => (
          <div className="action-column">
            {permissions?.delete_tenants && (
              <button
                className="delete-tenant-button"
                onClick={() => {
                  setShowDeleteConfirmModal(true);
                  setTenantToDelete(tenant.id);
                }}
              >
                <FaTrash /> Delete
              </button>
            )}

            {permissions?.edit_tenants && (
              <button
                className="edit-tenant-button"
                onClick={() => navigate(`/pg/${pgId}/tenants/${tenant.id}`)}
              >
                <FaPen /> Manage
              </button>
            )}
          </div>
        ),
      });
    }

    return (
      <div className="tenant-list-container">
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
          <span>Tenants</span>
        </div>
        <div className="tenant-list-header">
          <h1>{pgData && pgData.name} - Tenant List</h1>
          {permissions?.add_tenants && (
            <button
              className="add-tenant-btn"
              onClick={() => setShowAddTenant(true)}
            >
              <b>+ Add Tenant</b>
            </button>
          )}
          {showAddTenant && (
            <AddTenantModal
              pgId={pgId}
              onAdd={async (tenant) => {
                setShowAddTenant(false);
                await fetchTenants();
                // fetchFloorCounts();
              }}
              onClose={() => setShowAddTenant(false)}
            />
          )}
        </div>

        <TableComponent
            columns={columns}
            data={sortedTenants}
            emptyMessage={"No Tenants Available"}
        />

        <ConfirmModal
          show={showDeleteConfirmModal}
          title="Delete Tenant"
          message="Are you sure you want to remove this Tenant? The action once done can not be reverted."
          onConfirm={() => handleDeleteTenant(tenantToDelete)}
          onCancel={() => setShowDeleteConfirmModal(false)}
        />
      </div>
    );
}

export default TenantList;
