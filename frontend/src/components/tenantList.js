import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { authFetch } from "../api/apiClient";
import AddTenantModal from "./addTenant";
import EditTenantModal from "./editTenant";
import "../styles/tenantList.css";
import { FaPen, FaTrash } from "react-icons/fa";
import ConfirmModal from "./confirmationModal";

function TenantList(){
    const { pgId } = useParams()
    const navigate=useNavigate()
    const [pgData, setPgData] = useState();
    const [showAddTenant, setShowAddTenant] = useState(false);
    const [tenants, setTenants]=useState([]);
    const [showEditTenant, setShowEditTenant] = useState(false);
    const [editTenantData, setEditTenantData] = useState(null);
    const [showDeleteConfirmModal, setShowDeleteConfirmModal] = useState(false);
    const [tenantToDelete, setTenantToDelete] = useState(null);

    const fetchPg = async () => {
        const res = await authFetch(`http://localhost:8000/api/pgs/${pgId}`);
        if (!res.ok) {
            throw new Error("Failed to fetch PG");
        }
        const data = await res.json();
        setPgData(data);
    }

    const fetchTenants = async () => {
        const res= await authFetch(`http://localhost:8000/api/tenants/?pg_property=${pgId}`)
        const data = await res.json();
        setTenants(data.results || data);
    }

    const handleDeleteTenant = (tenantToDelete) =>{
        authFetch(`http://localhost:8000/api/tenants/${tenantToDelete}/`, {
            method: "DELETE",
        })
            .then(() => {
                setShowDeleteConfirmModal(false);
                setTenantToDelete(null);
                fetchTenants();                
            })
            .catch((error) => console.error("Error deleting Tenant:", error));
    }

    useEffect(() => {
        fetchPg();
        fetchTenants();
        
    }, [pgId]);

    const openEditTenant = (tenant) => {
        setEditTenantData(tenant);
        setShowEditTenant(true);
    }

    return(
        <div className="tenant-list-container">
            <div className="tenant-list-nav-path">
                <span onClick={() => navigate("/")} className="tenant-list-navigator">Home</span>
                <span className="seperator"> / </span>
                <span onClick={() => navigate("/pg-list")} className="tenant-list-navigator">PG List</span>
                <span className="seperator"> / </span>
                {pgData && <span>{pgData.name}</span>}
                <span className="seperator"> / </span>
                <span>Tenants</span>

            </div>
             <div className="tenant-list-header">
                <h1>{pgData && pgData.name} - Tenant List</h1>
                <button className="add-tenant-btn" onClick={() => setShowAddTenant(true)}><b>+ Add Tenant</b></button>
                {showAddTenant && (
                    <AddTenantModal
                        pgId={pgId}
                        onAdd={
                            async (tenant) => {
                                setShowAddTenant(false);
                                await fetchTenants();
                                // fetchFloorCounts();
                            }
                        }
                        onClose={() => setShowAddTenant(false)}
                    />
                )}

                {showEditTenant && (
                    <EditTenantModal
                        pgId={pgId}
                        tenant={editTenantData}
                        onEdit={async () => {
                            setShowEditTenant(false);
                            await fetchTenants();
                        }}
                        onClose={() => setShowEditTenant(false)}
                    />
                )}

            </div>

            <table>
                <thead>
                    <tr>
                        <th>Tenant Name</th>
                        <th>Room Number</th>
                        <th>Email</th>
                        <th>Joining Date</th>
                        <th>Phone Number</th>
                        <th>Actions</th>
                    </tr>

                </thead>

                <tbody>
                    
                    {tenants.length===0?( <tr>
            <td colSpan="6" className="no-tenants-message">
                No Tenants Available
            </td>
        </tr>):(
                    tenants.map(tenant => (
                        <tr key={tenant.id}>
                            <td>{tenant.first_name + " " + tenant.last_name}</td>
                            <td>{tenant.room_number}</td>
                            <td>{tenant.email}</td>
                            <td>{tenant.join_date}</td>
                            <td>{tenant.phone_number}</td>
                            <td>
                                <div className="action-column">
                                    <button className="delete-tenant-button"
                                    onClick={()=>{
                                        setShowDeleteConfirmModal(true)
                                        setTenantToDelete(tenant.id)
                                    }}
                                    ><FaTrash/> Delete</button>

                                    <button className="edit-tenant-button"
                                    onClick={() => openEditTenant(tenant)}
                                    ><FaPen/> Edit</button>
                                    

                                </div>
                                <ConfirmModal
                                    show={showDeleteConfirmModal}
                                    title="Delete Tenant"
                                    message="Are you sure you want to remove this Tenant? The action once done can not be reverted."
                                    onConfirm={() => handleDeleteTenant(tenantToDelete)}
                                    onCancel={() => setShowDeleteConfirmModal(false)}
                                />
                            </td>   
                        </tr>
                    )))}
                </tbody>
            </table>

        </div>
    )
}

export default TenantList;